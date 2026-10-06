// ============================================================
// AP2-01 — Pilha com Lista Ligada · PARTE 1 — Classe Pilha
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Complete os trechos marcados com // TODO e preencha a complexidade
// Big-O de cada método. Para testar, rode:
//
//   npx tsx ap2-01/testes/parte1.ts
//
// PROIBIDO: arrays e métodos prontos (.split, .reverse, .join...).

import { No } from "./no";

export class Pilha<T> {
  private topo: No<T> | null = null;
  private quantidade: number = 0;

  // Big-O: ____
  push(valor: T): void {
    // TODO
  }

  // Big-O: ____
  pop(): T | null {
    // TODO
    return null;
  }

  // Big-O: ____
  peek(): T | null {
    // TODO
    return null;
  }

  // Big-O: ____
  estaVazia(): boolean {
    // TODO
    return true;
  }

  // Big-O: ____
  tamanho(): number {
    // TODO
    return 0;
  }

  // PRONTO — Big-O: O(n)
  imprimir(): void {
    let atual = this.topo;
    let saida = "TOPO -> ";
    while (atual !== null) {
      saida += atual.valor + " -> ";
      atual = atual.proximo;
    }
    console.log(saida + "null");
  }
}
