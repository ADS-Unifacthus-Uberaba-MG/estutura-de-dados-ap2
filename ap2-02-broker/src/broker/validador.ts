// ============================================================
// AP2-02 — PagaJá Broker · NÍVEL 2 — Validador de payload (usa a Pilha)
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Complete o trecho marcado com // TODO. Para testar:
//
//   npm run nivel2
//
// Antes de aceitar uma mensagem, o broker confere se o payload "fecha
// direitinho": cada { [ ( aberto precisa ser fechado pelo } ] ) certo,
// na ordem certa. É como uma pilha de pratos: o ÚLTIMO que você abriu é
// o PRIMEIRO que precisa ser fechado.
//
//   '{"itens":[1,2]}'   ✅  abre { , abre [ , fecha ] , fecha }
//   '{[}]'              ❌  abriu [ por último, mas tentou fechar }
//   '{"cliente":"Bia"'  ❌  abriu { e nunca fechou
//   ''                  ❌  mensagem sem corpo
//
// Versão simplificada: ignore as aspas e todos os outros caracteres
// (letras, números, :, vírgulas...). Só { } [ ] ( ) importam.
//
// PROIBIDO neste arquivo: arrays e métodos prontos (.split, .indexOf,
// .includes...). Pode usar payload[i], payload.length, for, while, if
// e os métodos da SUA Pilha (push, pop, peek, estaVazia, tamanho).

import { Pilha } from "../estruturas/Pilha";

// PRONTO — Big-O: O(1). É um símbolo que ABRE?
export function ehAbertura(c: string): boolean {
  return c === "{" || c === "[" || c === "(";
}

// PRONTO — Big-O: O(1). É um símbolo que FECHA?
export function ehFechamento(c: string): boolean {
  return c === "}" || c === "]" || c === ")";
}

// PRONTO — Big-O: O(1). O "abre" e o "fecha" formam um par? Ex.: "[" e "]".
export function formamPar(abre: string, fecha: string): boolean {
  return (
    (abre === "{" && fecha === "}") ||
    (abre === "[" && fecha === "]") ||
    (abre === "(" && fecha === ")")
  );
}

// Big-O esperado: O(n), onde n = tamanho do payload (passa uma vez por cada caractere).
// Devolve true se o payload é válido, false se não é.
// Perguntas para se fazer: o que fazer ao ver um símbolo que abre? E um que
// fecha? E se aparecer um que fecha com a pilha vazia? E no fim do texto,
// a pilha precisa estar como?
export function payloadValido(payload: string): boolean {
  // TODO: use uma Pilha<string>
  return false;
}
