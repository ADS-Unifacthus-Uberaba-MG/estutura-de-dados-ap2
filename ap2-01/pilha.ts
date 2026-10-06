// ============================================================
// AP2-01 — Pilha com Lista Ligada
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Complete os trechos marcados com // TODO e preencha a complexidade
// Big-O de cada método. Depois rode o arquivo (veja o README.md) e confira
// se a saída bate com os comentários dos testes.
//
// PROIBIDO: arrays e métodos prontos (.split, .reverse, .join...).

class No<T> {
  valor: T;
  proximo: No<T> | null = null;
  constructor(valor: T) {
    this.valor = valor;
  }
}

class Pilha<T> {
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

// PARTE 2 — Big-O: ____
function inverterTexto(texto: string): string {
  // TODO: use a Pilha<string>
  return "";
}

// PARTE 3
class Editor {
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

// ---------------------------------------------------------------
// Não edite daqui pra baixo — este trecho testa o seu código.
// ---------------------------------------------------------------
const p = new Pilha<number>();
p.push(10); p.push(20); p.push(30);
p.imprimir();                        // TOPO -> 30 -> 20 -> 10 -> null
console.log(p.peek());               // 30
console.log(p.pop());                // 30
console.log(p.tamanho());            // 2
p.pop(); p.pop();
console.log(p.pop());                // null
console.log(p.estaVazia());          // true

console.log(inverterTexto("ROMA"));  // AMOR

const ed = new Editor();
ed.digitar("Olá"); ed.digitar("turma"); ed.digitar("de"); ed.digitar("ADS");
console.log(ed.textoAtual());        // Olá turma de ADS
ed.desfazer(); ed.desfazer();
console.log(ed.textoAtual());        // Olá turma
ed.refazer();
console.log(ed.textoAtual());        // Olá turma de
