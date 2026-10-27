// ---------------------------------------------------------------
// NÍVEL 1 — Fila FIFO com head e tail. NÃO edite este arquivo.
// Rode com: npm run nivel1
// ---------------------------------------------------------------
import test from "node:test";
import assert from "node:assert/strict";
import { Fila } from "../src/estruturas/Fila";

test("fila nova está vazia e deixa de estar depois de um enqueue", () => {
  const f = new Fila<string>();
  assert.equal(f.estaVazia(), true, "Uma fila recém-criada deveria estar vazia.");
  assert.equal(f.tamanho(), 0, "Uma fila recém-criada deveria ter tamanho 0.");
  f.enqueue("pag-001");
  assert.equal(
    f.estaVazia(),
    false,
    "Depois de enqueue('pag-001') a fila NÃO pode estar vazia. Confira o enqueue e o estaVazia."
  );
  assert.equal(f.tamanho(), 1, `Depois de 1 enqueue o tamanho deveria ser 1, mas veio ${f.tamanho()}.`);
});

test("quem chega primeiro sai primeiro (FIFO)", () => {
  const f = new Fila<string>();
  f.enqueue("pag-001");
  f.enqueue("pag-002");
  f.enqueue("pag-003");
  const esperados = ["pag-001", "pag-002", "pag-003"];
  for (let i = 0; i < esperados.length; i++) {
    const veio = f.dequeue();
    assert.equal(
      veio,
      esperados[i],
      `Esperava '${esperados[i]}' no ${i + 1}º dequeue, mas veio '${veio}'. ` +
        "Lembre: na fila, quem chega primeiro sai primeiro (fila da padaria)."
    );
  }
});

test("dequeue em fila vazia devolve null (e não quebra)", () => {
  const f = new Fila<string>();
  assert.equal(f.dequeue(), null, "dequeue() numa fila vazia deveria devolver null.");
  f.enqueue("pag-001");
  assert.equal(f.dequeue(), "pag-001", "Depois de enqueue('pag-001'), o dequeue deveria devolver 'pag-001'.");
  assert.equal(
    f.dequeue(),
    null,
    "A fila ficou vazia de novo: o dequeue deveria devolver null. Não deixe o head apontando para um nó que já saiu."
  );
  assert.equal(f.tamanho(), 0, "Dequeue em fila vazia não pode deixar o tamanho negativo.");
});

test("peek mostra o primeiro da fila sem tirar ninguém", () => {
  const f = new Fila<string>();
  assert.equal(f.peek(), null, "peek() numa fila vazia deveria devolver null.");
  f.enqueue("pag-001");
  f.enqueue("pag-002");
  assert.equal(f.peek(), "pag-001", "peek() deveria mostrar o PRIMEIRO da fila (o head), 'pag-001'.");
  assert.equal(f.peek(), "pag-001", "Chamar peek() duas vezes não pode mudar nada: ele só olha, não tira.");
  assert.equal(f.tamanho(), 2, "peek() não pode mudar o tamanho da fila.");
});

test("tamanho acompanha cada enqueue e dequeue", () => {
  const f = new Fila<number>();
  f.enqueue(10);
  f.enqueue(20);
  f.enqueue(30);
  assert.equal(f.tamanho(), 3, `Depois de 3 enqueues o tamanho deveria ser 3, veio ${f.tamanho()}.`);
  f.dequeue();
  assert.equal(f.tamanho(), 2, `Depois de 3 enqueues e 1 dequeue o tamanho deveria ser 2, veio ${f.tamanho()}.`);
  f.dequeue();
  f.dequeue();
  assert.equal(f.tamanho(), 0, "Depois de tirar todo mundo, o tamanho deveria ser 0.");
  assert.equal(f.estaVazia(), true, "Depois de tirar todo mundo, a fila deveria estar vazia.");
});

test("fila que esvazia e volta a encher continua funcionando (bug do tail)", () => {
  const f = new Fila<string>();
  f.enqueue("A");
  f.dequeue(); // a fila ficou vazia: head E tail precisam voltar a null
  f.enqueue("B");
  f.enqueue("C");
  const primeiro = f.dequeue();
  assert.equal(
    primeiro,
    "B",
    `Esperava 'B', mas veio '${primeiro}'. Clássico bug do tail: quando a fila esvazia no dequeue, ` +
      "o tail continua apontando para o nó antigo ('A'). Desenhe as caixinhas e veja para onde o tail aponta."
  );
  assert.equal(f.dequeue(), "C", "Depois de 'B' deveria sair 'C'.");
  assert.equal(f.estaVazia(), true, "Depois de tirar 'B' e 'C' a fila deveria estar vazia.");
});

test("aguenta a Black Friday: 1000 pagamentos entram e saem na ordem", () => {
  const f = new Fila<number>();
  for (let i = 1; i <= 1000; i++) f.enqueue(i);
  assert.equal(f.tamanho(), 1000, `Depois de 1000 enqueues o tamanho deveria ser 1000, veio ${f.tamanho()}.`);
  for (let i = 1; i <= 1000; i++) {
    const veio = f.dequeue();
    if (veio !== i) {
      assert.fail(`No ${i}º dequeue esperava ${i}, mas veio ${veio}. A ordem de chegada se perdeu.`);
    }
  }
  assert.equal(f.dequeue(), null, "Depois de tirar os 1000, a fila deveria estar vazia (dequeue = null).");
});
