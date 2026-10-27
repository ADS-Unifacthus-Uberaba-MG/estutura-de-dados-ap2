// ---------------------------------------------------------------
// NÍVEL 5 — Fila de prioridade + modo PRIORIDADE. NÃO edite este arquivo.
// Rode com: npm run nivel5   (precisa dos Níveis 1 a 4 prontos)
// ---------------------------------------------------------------
import test from "node:test";
import assert from "node:assert/strict";
import { FilaPrioridade } from "../src/estruturas/FilaPrioridade";
import { Broker } from "../src/broker/Broker";
import { lista, msg, processadorDeTeste } from "./apoio";

function esvaziar(f: FilaPrioridade<string>): string {
  const saiu: string[] = [];
  for (let i = 0; i < 50 && !f.estaVazia(); i++) {
    const v = f.dequeue();
    saiu[saiu.length] = String(v);
  }
  return lista(saiu);
}

test("FilaPrioridade: o menor número (mais urgente) sai primeiro", () => {
  const f = new FilaPrioridade<string>();
  f.enqueue("BOLETO", 3);
  f.enqueue("PIX", 1);
  f.enqueue("CARTAO", 2);
  assert.equal(f.tamanho(), 3, `Depois de 3 enqueues o tamanho deveria ser 3, veio ${f.tamanho()}.`);
  assert.equal(f.peek(), "PIX", "peek() deveria mostrar o mais urgente (prioridade 1).");
  assert.equal(
    esvaziar(f),
    "[PIX, CARTAO, BOLETO]",
    "No pronto-socorro, o mais grave (menor número) é atendido primeiro."
  );
});

test("empate na prioridade mantém a ordem de chegada (FIFO entre iguais)", () => {
  const f = new FilaPrioridade<string>();
  f.enqueue("pix-A", 1);
  f.enqueue("pix-B", 1);
  f.enqueue("pix-C", 1);
  const saiu = esvaziar(f);
  assert.equal(
    saiu,
    "[pix-A, pix-B, pix-C]",
    `Saiu ${saiu}. Com a mesma prioridade, quem chegou antes sai antes: ` +
      "o novo entra DEPOIS de todos que têm prioridade igual (use <=, não <)."
  );
});

test("FilaPrioridade vazia: dequeue e peek devolvem null", () => {
  const f = new FilaPrioridade<string>();
  assert.equal(f.dequeue(), null, "dequeue() em fila de prioridade vazia deveria devolver null.");
  assert.equal(f.peek(), null, "peek() em fila de prioridade vazia deveria devolver null.");
  f.enqueue("X", 2);
  assert.equal(f.estaVazia(), false, "Depois de um enqueue a fila não está vazia.");
  assert.equal(f.dequeue(), "X", "Deveria sair 'X'.");
  assert.equal(f.estaVazia(), true, "Depois de tirar o único elemento a fila fica vazia.");
  assert.equal(f.tamanho(), 0, "Tamanho deveria voltar para 0.");
});

test("inserção ordenada: no começo, no meio e no fim da lista", () => {
  const f = new FilaPrioridade<string>();
  f.enqueue("c2", 2); // lista vazia
  f.enqueue("e3", 3); // no fim
  f.enqueue("a1", 1); // antes do head
  f.enqueue("d2", 2); // no meio, depois do outro 2
  f.enqueue("b1", 1); // no meio, depois do outro 1
  f.enqueue("f3", 3); // no fim, depois do outro 3
  assert.equal(
    esvaziar(f),
    "[a1, b1, c2, d2, e3, f3]",
    "Desenhe a lista depois de cada enqueue. Casos: lista vazia, novo antes do head, no meio e no fim."
  );
});

test("modo PRIORIDADE: PIX é consumido antes de CARTAO, que vem antes de BOLETO", () => {
  const b = new Broker("PRIORIDADE");
  b.publicar(msg("pag-001", "BOLETO"));
  b.publicar(msg("pag-002", "CARTAO"));
  b.publicar(msg("pag-003", "PIX"));
  assert.equal(b.pendentes(), 3, `No modo PRIORIDADE, pendentes() deveria ser 3, veio ${b.pendentes()}.`);
  const { processar, vistos } = processadorDeTeste(() => true);
  b.processarTudo(processar);
  assert.equal(
    lista(vistos),
    "[pag-003, pag-002, pag-001]",
    `Ordem: ${lista(vistos)}. No modo PRIORIDADE, o PIX (1) passa na frente do CARTAO (2), ` +
      "que passa na frente do BOLETO (3). Use prioridadeDe(msg.tipo)."
  );
});

test("modo PRIORIDADE: vários PIX saem na ordem de chegada", () => {
  const b = new Broker("PRIORIDADE");
  b.publicar(msg("pag-001", "BOLETO"));
  b.publicar(msg("pag-002", "PIX"));
  b.publicar(msg("pag-003", "PIX"));
  b.publicar(msg("pag-004", "PIX"));
  const { processar, vistos } = processadorDeTeste(() => true);
  b.processarTudo(processar);
  assert.equal(
    lista(vistos),
    "[pag-002, pag-003, pag-004, pag-001]",
    `Ordem: ${lista(vistos)}. Os PIX vêm antes do BOLETO, e entre eles vale a ordem de chegada ` +
      "(empate: o novo entra DEPOIS dos que têm a mesma prioridade)."
  );
});

test("modo PRIORIDADE: retry volta com a mesma prioridade", () => {
  const b = new Broker("PRIORIDADE");
  b.publicar(msg("pag-001", "PIX", 5800)); // falha 1x
  b.publicar(msg("pag-002", "PIX"));
  b.publicar(msg("pag-003", "BOLETO"));
  const { processar, vistos } = processadorDeTeste((m) => !(m.id === "pag-001" && m.tentativas === 0));
  const r = b.processarTudo(processar);
  assert.equal(
    lista(vistos),
    "[pag-001, pag-002, pag-001, pag-003]",
    `Ordem: ${lista(vistos)}. O PIX que falhou volta para o fim dos PIX (prioridade 1), ` +
      "mas continua na frente do BOLETO."
  );
  assert.deepEqual(r, { processadas: 3, reprocessadas: 1, naDLQ: 0, rejeitadas: 0 });
});
