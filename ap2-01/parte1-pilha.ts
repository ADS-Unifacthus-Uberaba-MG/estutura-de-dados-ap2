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

  // Big-O: O(1)
  push(valor: T): void {
    const novoNo : No<T> = {
      valor : valor,
      proximo : this.topo
    }
    this.topo = novoNo
    this.quantidade++
  };

  // Big-O: O(1)
  pop(): T | null {
    if (this.topo == null){
      return null;
    }
    const valorRemovido = this.topo.valor;
    this.topo = this.topo.proximo
    this.quantidade++;
    return valorRemovido;
  }

  // Big-O: O(1)
  peek(): T | null {
    if (this.topo == null){
      return null;
    }
    return this.topo.valor;
  }

  // Big-O: O(1)
  estaVazia(): boolean {
    if (this.topo == null){
      return true;
    }
    else {
      return false;
    }
  }

  // Big-O: O(1)
  tamanho(): number {
    if (this.quantidade == 0){
       return 0;
    }
    else{
      return this.quantidade;
    }
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
