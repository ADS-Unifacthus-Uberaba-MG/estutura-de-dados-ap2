// ============================================================
// AP2-01 — Pilha com Lista Ligada · PARTE 3 — Editor (desfazer/refazer)
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Complete os trechos marcados com // TODO usando duas Pilhas da Parte 1.
// Para testar, rode:
//
//   npx tsx ap2-01/testes/parte3.ts
//
// PROIBIDO: arrays e métodos prontos (.split, .reverse, .join...).

import { Pilha } from "./parte1-pilha";

export class Editor {
  private historico = new Pilha<string>();
  private refazerPilha = new Pilha<string>();

  digitar(palavra: string): void {
    // TODO
  }

  desfazer(): void {
    // TODO
  }

  refazer(): void {
    // TODO
  }

  // PRONTO — não precisa mexer
  textoAtual(): string {
    const aux = new Pilha<string>();
    while (!this.historico.estaVazia()) {
      aux.push(this.historico.pop() as string);
    }
    let texto = "";
    while (!aux.estaVazia()) {
      const p = aux.pop() as string;
      texto += (texto === "" ? "" : " ") + p;
      this.historico.push(p);
    }
    return texto;
  }
}
