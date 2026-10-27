// ---------------------------------------------------------------
// NÍVEL 3 — Broker: publicar e consumir. NÃO edite este arquivo.
// Rode com: npm run nivel3   (precisa dos Níveis 1 e 2 prontos)
// ---------------------------------------------------------------
import test from "node:test";
import assert from "node:assert/strict";
import { Broker } from "../src/broker/Broker";
import { lista, msg, processadorDeTeste } from "./apoio";

const sempreOk = () => true;

test("publicar mensagem válida devolve true e ela fica pendente", () => {
  const b = new Broker();
  assert.equal(b.pendentes(), 0, "Um broker novo não tem nenhuma mensagem pendente.");
  const ok = b.publicar(msg("pag-001"));
  assert.equal(ok, true, "publicar() de uma mensagem com payload válido deveria devolver true.");
  assert.equal(b.pendentes(), 1, `Depois de publicar 1 mensagem, pendentes() deveria ser 1, veio ${b.pendentes()}.`);
});

test("payload inválido é rejeitado: devolve false, não entra na fila e conta em rejeitadas", () => {
  const b = new Broker();
  const ok = b.publicar(msg("pag-004", "PIX", 45, '{"cliente":"Bia"'));
  assert.equal(ok, false, "publicar() com payload inválido deveria devolver false. Use o payloadValido do Nível 2.");
  assert.equal(b.pendentes(), 0, "A mensagem inválida NÃO pode entrar na fila.");
  assert.equal(b.publicar(msg("pag-005")), true, "Uma mensagem válida deveria ser aceita (true).");
  assert.equal(b.pendentes(), 1, "Só a mensagem válida deveria estar na fila.");
  const r = b.processarTudo(sempreOk);
  assert.equal(r.rejeitadas, 1, `O relatório deveria contar 1 rejeitada, veio ${r.rejeitadas}.`);
});

test("consumir em broker vazio devolve null e não chama o processador", () => {
  const b = new Broker();
  const { processar, vistos } = processadorDeTeste(sempreOk);
  assert.equal(b.consumir(processar), null, "Sem mensagens, consumir() deveria devolver null.");
  assert.equal(vistos.length, 0, "Sem mensagens, o processador não pode ser chamado.");
  b.publicar(msg("pag-001"));
  const veio = b.consumir(processar);
  assert.equal(veio?.id, "pag-001", `consumir() deveria devolver a mensagem retirada ('pag-001'), veio ${veio?.id}.`);
  assert.equal(vistos.length, 1, "Com uma mensagem na fila, o processador deveria ser chamado 1 vez.");
});

test("consumir entrega as mensagens na ordem de chegada (FIFO)", () => {
  const b = new Broker();
  b.publicar(msg("pag-001", "BOLETO"));
  b.publicar(msg("pag-002", "CARTAO"));
  b.publicar(msg("pag-003", "PIX"));
  const { processar } = processadorDeTeste(sempreOk);
  const esperados = ["pag-001", "pag-002", "pag-003"];
  for (let i = 0; i < esperados.length; i++) {
    const veio = b.consumir(processar);
    assert.equal(
      veio?.id,
      esperados[i],
      `Esperava '${esperados[i]}', mas veio '${veio?.id}'. No modo FIFO, quem chega primeiro sai primeiro, ` +
        "não importa o tipo do pagamento."
    );
  }
  assert.equal(b.pendentes(), 0, "Depois de consumir as 3, não deveria sobrar nada pendente.");
});

test("consumir chama o processador com a própria mensagem publicada", () => {
  const b = new Broker();
  const original = msg("pag-010", "CARTAO", 259.99);
  b.publicar(original);
  let recebida: unknown = null;
  b.consumir((m) => {
    recebida = m;
    return true;
  });
  assert.equal(recebida, original, "O processador deveria receber a MESMA mensagem que foi publicada.");
});

test("processarTudo esvazia a fila e conta as processadas", () => {
  const b = new Broker();
  for (let i = 1; i <= 4; i++) b.publicar(msg("pag-00" + i));
  const { processar, vistos } = processadorDeTeste(sempreOk);
  const r = b.processarTudo(processar);
  assert.equal(b.pendentes(), 0, "Depois de processarTudo() a fila principal deveria estar vazia.");
  assert.equal(
    lista(vistos),
    "[pag-001, pag-002, pag-003, pag-004]",
    `O processador deveria ver as 4 mensagens na ordem de chegada, viu ${lista(vistos)}.`
  );
  assert.deepEqual(
    r,
    { processadas: 4, reprocessadas: 0, naDLQ: 0, rejeitadas: 0 },
    "Com 4 mensagens e nenhuma falha, o relatório deveria ter processadas = 4 e o resto 0."
  );
});
