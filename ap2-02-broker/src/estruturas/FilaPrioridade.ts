// ============================================================
// AP2-02 — PagaJá Broker · NÍVEL 5 — Fila de Prioridade
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Complete os trechos marcados com // TODO. Para testar:
//
//   npm run nivel5
//
// Pense no pronto-socorro: quem está mais grave é atendido primeiro,
// mesmo que tenha chegado depois. Entre dois pacientes igualmente graves,
// vale a ordem de chegada.
//
// Aqui a lista ligada fica SEMPRE ORDENADA pela prioridade (menor número
// = mais urgente). Quem entra procura o seu lugar na lista (inserção
// ordenada, como no slide); quem sai é sempre o head.
//
//   head
//    |
//    v
//   [PIX 1] ---> [PIX 1] ---> [CARTAO 2] ---> [BOLETO 3] ---> null
//
// PROIBIDO neste arquivo: arrays e métodos prontos (.push, .sort,
// .splice, .indexOf...). Use só os nós e as setas.

// PRONTO — um nó que, além do valor, guarda a prioridade dele.
export class NoPrioridade<T> {
  valor: T;
  prioridade: number;
  proximo: NoPrioridade<T> | null = null;
  constructor(valor: T, prioridade: number) {
    this.valor = valor;
    this.prioridade = prioridade;
  }
}

export class FilaPrioridade<T> {
  private head: NoPrioridade<T> | null = null;
  private quantidade: number = 0;

  // Big-O esperado: O(n) — no pior caso anda a lista inteira até achar o lugar.
  // Menor número = mais urgente. EMPATE: quem chegou antes continua na
  // frente (o novo entra DEPOIS de todos com a mesma prioridade, use <=).
  // Casos para pensar: lista vazia? novo vai antes do head? vai no meio? no fim?
  enqueue(valor: T, prioridade: number): void {
    // TODO
  }

  // Big-O esperado: O(1) — o mais urgente está sempre no head.
  // Fila vazia? Devolve null.
  dequeue(): T | null {
    // TODO
    return null;
  }

  // Big-O esperado: O(1)
  peek(): T | null {
    // TODO
    return null;
  }

  // Big-O esperado: O(1)
  estaVazia(): boolean {
    // TODO
    return true;
  }

  // Big-O esperado: O(1)
  tamanho(): number {
    // TODO
    return 0;
  }

  // PRONTO — Big-O: O(n). Ajuda a enxergar a fila quando um teste falhar.
  paraTexto(): string {
    let atual = this.head;
    let saida = "HEAD -> ";
    while (atual !== null) {
      saida += String(atual.valor) + "(" + atual.prioridade + ") -> ";
      atual = atual.proximo;
    }
    return saida + "null   (quantidade = " + this.quantidade + ")";
  }
}
