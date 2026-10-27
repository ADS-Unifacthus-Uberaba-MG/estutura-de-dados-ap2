// ---------------------------------------------------------------
// NÍVEL 4 — Retry + Dead Letter Queue. NÃO edite este arquivo.
// Rode com: npm run nivel4   (precisa dos Níveis 1, 2 e 3 prontos)
// ---------------------------------------------------------------
import test from "node:test";
import assert from "node:assert/strict";
import { Broker } from "../src/broker/Broker";
import { lista, msg, processadorDeTeste } from "./apoio";

test("mensagem que falha volta para o FIM da fila (retry)", () => {
  const b = new Broker();
  b.publicar(msg("pag-001"));
  b.publicar(msg("pag-002"));
  b.publicar(msg("pag-003"));
  let primeiraVez = true;
  const { processar, vistos } = processadorDeTeste((m) => {
    if (m.id === "pag-001" && primeiraVez) {
      primeiraVez = false;
      return false; // timeout no antifraude
    }
    return true;
  });
  b.consumir(processar);
  assert.equal(
    b.pendentes(),
    3,
    `'pag-001' falhou e deveria ter voltado para a fila (pendentes = 3), mas pendentes = ${b.pendentes()}.`
  );
  b.consumir(processar);
  b.consumir(processar);
  b.consumir(processar);
  assert.equal(
    lista(vistos),
    "[pag-001, pag-002, pag-003, pag-001]",
    `Ordem vista pelo processador: ${lista(vistos)}. A mensagem que falha vai para o FIM da fila, ` +
      "como quem esqueceu a carteira e volta para o fim da fila da padaria."
  );
});

test("tentativas aumenta 1 a cada falha (e não muda no sucesso)", () => {
  const b = new Broker();
  const m = msg("pag-002", "CARTAO", 7300);
  b.publicar(m);
  b.consumir(() => false);
  assert.equal(m.tentativas, 1, `Depois de 1 falha, tentativas deveria ser 1, veio ${m.tentativas}.`);
  b.consumir(() => true);
  assert.equal(m.tentativas, 1, "Quando dá certo, tentativas não muda (ela conta as FALHAS).");
  const n = msg("pag-003");
  b.publicar(n);
  b.consumir(() => true);
  assert.equal(n.tentativas, 0, "Mensagem processada de primeira continua com tentativas = 0.");
});

test("mensagem que falha 3 vezes vai para a DLQ", () => {
  const b = new Broker();
  const m = msg("pag-013", "CARTAO", 150);
  b.publicar(m);
  const { processar } = processadorDeTeste(() => false); // cartão bloqueado
  b.consumir(processar);
  b.consumir(processar);
  assert.equal(b.tamanhoDLQ(), 0, "Depois de só 2 falhas a mensagem ainda NÃO deveria estar na DLQ.");
  assert.equal(b.pendentes(), 1, "Depois de 2 falhas a mensagem ainda deveria estar na fila esperando o retry.");
  b.consumir(processar);
  assert.equal(m.tentativas, 3, `Depois de 3 falhas, tentativas deveria ser 3, veio ${m.tentativas}.`);
  assert.equal(b.tamanhoDLQ(), 1, "Na 3ª falha (MAX_TENTATIVAS) a mensagem deveria ir para a DLQ.");
  assert.equal(b.pendentes(), 0, "Quem foi para a DLQ sai da fila principal.");
  assert.equal(b.consumir(processar), null, "Com a fila principal vazia, consumir() devolve null.");
});

test("mensagem que falha 2 vezes e passa na 3ª não vai para a DLQ", () => {
  const b = new Broker();
  b.publicar(msg("pag-006", "PIX", 5800));
  let chamadas = 0;
  const r = b.processarTudo(() => {
    chamadas++;
    return chamadas === 3;
  });
  assert.equal(b.tamanhoDLQ(), 0, "A mensagem passou na 3ª tentativa: ela NÃO vai para a DLQ.");
  assert.deepEqual(
    r,
    { processadas: 1, reprocessadas: 2, naDLQ: 0, rejeitadas: 0 },
    "Falhou 2 vezes (2 retries) e passou na 3ª: processadas = 1, reprocessadas = 2."
  );
});

test("processarTudo monta o relatório certo num cenário de Black Friday", () => {
  const b = new Broker();
  b.publicar(msg("pag-001", "PIX", 120));
  b.publicar(msg("pag-002", "CARTAO", 7300)); // falha 1x
  b.publicar(msg("pag-003", "BOLETO", 89.9, '{"cliente":"Bia"')); // inválido
  b.publicar(msg("pag-004", "CARTAO", 150)); // sempre falha
  b.publicar(msg("pag-005", "PIX", 15));
  const { processar, vistos } = processadorDeTeste((m) => {
    if (m.id === "pag-004") return false;
    if (m.valor > 5000) return m.tentativas >= 1;
    return true;
  });
  const r = b.processarTudo(processar);
  assert.deepEqual(
    r,
    { processadas: 3, reprocessadas: 3, naDLQ: 1, rejeitadas: 1 },
    "Esperado: 3 processadas (001, 002, 005), 3 retries (002 uma vez, 004 duas vezes), " +
      "1 na DLQ (004) e 1 rejeitada (003)."
  );
  assert.equal(
    lista(vistos),
    "[pag-001, pag-002, pag-004, pag-005, pag-002, pag-004, pag-004]",
    `Ordem vista pelo processador: ${lista(vistos)}.`
  );
  assert.equal(b.tamanhoDLQ(), 1, "pag-004 deveria estar na DLQ.");
});

test("processarTudo termina mesmo quando tudo falha (sem loop infinito)", () => {
  const b = new Broker();
  for (let i = 1; i <= 5; i++) b.publicar(msg("pag-00" + i));
  const { processar, vistos } = processadorDeTeste(() => false, 100);
  const r = b.processarTudo(processar);
  assert.equal(vistos.length, 15, `5 mensagens × 3 tentativas = 15 chamadas, mas foram ${vistos.length}.`);
  assert.equal(b.pendentes(), 0, "No fim, a fila principal deveria estar vazia.");
  assert.equal(b.tamanhoDLQ(), 5, "As 5 mensagens deveriam terminar na DLQ.");
  assert.deepEqual(r, { processadas: 0, reprocessadas: 10, naDLQ: 5, rejeitadas: 0 });
});
