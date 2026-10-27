// ============================================================
// AP2-02 — PagaJá Broker · NÍVEL 1 — Fila FIFO com head e tail
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Complete os trechos marcados com // TODO. Para testar:
//
//   npm run nivel1
//
// Pense na fila da padaria: quem chega entra no FIM (tail), quem é
// atendido sai do COMEÇO (head). Quem chega primeiro sai primeiro (FIFO).
//
//   head                         tail
//    |                            |
//    v                            v
//   [pag-001] ---> [pag-002] ---> [pag-003] ---> null
//
// PROIBIDO neste arquivo: arrays e métodos prontos (.push, .shift,
// .splice, .indexOf...). Use só os nós (No) e as setas (proximo).

import { No } from "./No";

export class Fila<T> {
  private head: No<T> | null = null; // primeiro da fila (o próximo a sair)
  private tail: No<T> | null = null; // último da fila (quem acabou de chegar)
  private quantidade: number = 0;

  // Big-O esperado: O(1) — NÃO percorra a fila! Use o tail para achar o fim.
  // Coloca o valor no FIM da fila.
  // Caso especial: a fila está vazia (quem vira o head? e o tail?).
  enqueue(valor: T): void {
    // TODO
  }

  // Big-O esperado: O(1)
  // Tira e devolve o valor do COMEÇO da fila. Fila vazia? Devolve null.
  // Cuidado: se a fila ficar vazia, o tail também precisa voltar a ser null.
  dequeue(): T | null {
    // TODO
    return null;
  }

  // Big-O esperado: O(1)
  // Devolve o primeiro da fila SEM tirar. Fila vazia? Devolve null.
  peek(): T | null {
    // TODO
    return null;
  }

  // Big-O esperado: O(1)
  estaVazia(): boolean {
    // TODO
    return true;
  }

  // Big-O esperado: O(1) — não conte nó por nó, use a quantidade.
  tamanho(): number {
    // TODO
    return 0;
  }

  // PRONTO — Big-O: O(n). Ajuda a enxergar a fila quando um teste falhar:
  //   console.log(minhaFila.paraTexto());
  paraTexto(): string {
    let atual = this.head;
    let saida = "HEAD -> ";
    while (atual !== null) {
      saida += String(atual.valor) + " -> ";
      atual = atual.proximo;
    }
    const fim = this.tail === null ? "null" : String(this.tail.valor);
    return saida + "null   (TAIL = " + fim + ", quantidade = " + this.quantidade + ")";
  }
}
