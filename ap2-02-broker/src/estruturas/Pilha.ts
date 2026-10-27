// ============================================================
// AP2-02 — PagaJá Broker · Classe Pilha (PRONTA)
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Este arquivo já está pronto, não precisa mexer. É a Pilha com lista
// ligada que você fez na AP2-01 (Parte 1), igual à dos slides.
//
// Pense numa pilha de pratos: você só coloca (push) e só tira (pop) o
// prato de CIMA. O último que entrou é o primeiro que sai (LIFO).
//
//   topo
//    |
//    v
//   [ C ] ---> [ B ] ---> [ A ] ---> null
//
// Você vai usar esta Pilha no Nível 2 (validador.ts).

import { No } from "./No";

export class Pilha<T> {
  private topo: No<T> | null = null;
  private quantidade: number = 0;

  // Big-O: O(1) — coloca um prato em cima da pilha
  push(valor: T): void {
    const novo = new No(valor);
    novo.proximo = this.topo;
    this.topo = novo;
    this.quantidade++;
  }

  // Big-O: O(1) — tira o prato de cima. Pilha vazia? Devolve null.
  pop(): T | null {
    if (this.topo === null) return null;
    const valor = this.topo.valor;
    this.topo = this.topo.proximo;
    this.quantidade--;
    return valor;
  }

  // Big-O: O(1) — olha o prato de cima sem tirar
  peek(): T | null {
    if (this.topo === null) return null;
    return this.topo.valor;
  }

  // Big-O: O(1)
  estaVazia(): boolean {
    return this.topo === null;
  }

  // Big-O: O(1)
  tamanho(): number {
    return this.quantidade;
  }
}
