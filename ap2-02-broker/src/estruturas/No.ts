// ============================================================
// AP2-02 — PagaJá Broker · Classe No (PRONTA)
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Este arquivo já está pronto, não precisa mexer. É o mesmo No da AP2-01.
//
// Um nó é uma "caixinha" que guarda um valor e uma seta (proximo) para
// a próxima caixinha:
//
//   [ valor | proximo ] ---> [ valor | proximo ] ---> null

export class No<T> {
  valor: T;
  proximo: No<T> | null = null;
  constructor(valor: T) {
    this.valor = valor;
  }
}
