// ---------------------------------------------------------------
// NÍVEL 2 — Validador de payload (com Pilha). NÃO edite este arquivo.
// Rode com: npm run nivel2
// ---------------------------------------------------------------
import test from "node:test";
import assert from "node:assert/strict";
import { payloadValido } from "../src/broker/validador";

function aceita(payload: string, motivo: string) {
  assert.equal(payloadValido(payload), true, `O payload '${payload}' deveria ser ACEITO: ${motivo}`);
}
function rejeita(payload: string, motivo: string) {
  assert.equal(payloadValido(payload), false, `O payload '${payload}' deveria ser REJEITADO: ${motivo}`);
}

test("payload de pagamento bem formado é aceito", () => {
  aceita('{"cliente":"Ana","itens":[1,2]}', "toda chave e todo colchete aberto foi fechado na ordem certa.");
  aceita("{}", "abriu { e fechou }.");
  rejeita('{"cliente":"Ana"', "abriu { e nunca fechou.");
});

test("payload vazio é inválido (mensagem sem corpo)", () => {
  rejeita("", "uma mensagem sem corpo não tem pagamento nenhum dentro. Trate o caso do texto vazio.");
  aceita("()", "um par simples, abriu e fechou.");
});

test("payload '{[}]' é rejeitado (fechou na ordem errada)", () => {
  rejeita("{[}]", "o último aberto foi '[', então o próximo a fechar tinha que ser ']'. Pilha de pratos: sai o de cima!");
  rejeita("([)]", "o último aberto foi '[', mas tentou fechar ')'.");
  aceita("{[]}", "abriu {, abriu [, fechou ], fechou }.");
});

test("abrir e não fechar é rejeitado (sobrou coisa na pilha)", () => {
  rejeita('{"itens":[1,2', "abriu { e [ e não fechou nenhum. No fim do texto a pilha precisa estar vazia.");
  rejeita("(", "abriu ( e nunca fechou.");
  aceita("([])", "tudo que abriu foi fechado.");
});

test("fechar sem ter aberto é rejeitado (pop em pilha vazia)", () => {
  rejeita("}", "fechou } sem ter aberto nada. Cuidado com pop() em pilha vazia: ele devolve null.");
  rejeita("{}}", "o segundo } não tem ninguém para fechar.");
  rejeita("())(", "o segundo ) fecha algo que não foi aberto.");
  aceita("()[]{}", "três pares, um depois do outro.");
});

test("letras, números, aspas e outros símbolos são ignorados", () => {
  aceita('{"valor": 10.5, "obs": "ok, pago"}', "só { } [ ] ( ) importam; o resto é ignorado.");
  aceita('"cliente":"Ana"', "não tem nenhum { [ ( para conferir, então está balanceado.");
  rejeita("abc)", "esse ) não foi aberto.");
});

test("aninhamento profundo funciona", () => {
  aceita("{{{{[[(())]]}}}}", "cada um fecha na ordem inversa da abertura.");
  rejeita("{{{{[[(()]]}}}}", "falta fechar um (.");
  aceita('{"pedido":{"itens":[{"id":1},{"id":2}],"frete":(10)}}', "pedido com itens dentro de itens.");
});
