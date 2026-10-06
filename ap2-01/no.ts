// ============================================================
// AP2-01 — Pilha com Lista Ligada · Classe No (PRONTA)
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Este arquivo já está pronto — não precisa mexer.
// Cada nó guarda um valor e aponta para o próximo nó da lista.

export class No<T> {
  valor: T;
  proximo: No<T> | null = null;
  constructor(valor: T) {
    this.valor = valor;
  }
}
