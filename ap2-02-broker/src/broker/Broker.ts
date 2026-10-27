// ============================================================
// AP2-02 — PagaJá Broker · NÍVEIS 3, 4 e 5 — O Broker
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Complete os trechos marcados com // TODO, nível por nível. Para testar:
//
//   npm run nivel3   (publicar, consumir, processarTudo)
//   npm run nivel4   (retry + Dead Letter Queue)
//   npm run nivel5   (modo PRIORIDADE: PIX primeiro)
//
// O caminho de uma mensagem:
//
//   Producer --publicar()--> [validação] --válida--> FILA --consumir()--> Consumer
//                                |                    ^                     |
//                             inválida                |                  falhou?
//                                v                    +--- retry (fim) <----+
//                           rejeitadas                                      |
//                                                          3ª falha --> DLQ
//
// PROIBIDO neste arquivo: arrays e métodos prontos (.push, .shift,
// .splice, .find, .filter...). Use as SUAS classes Fila e FilaPrioridade.

import { Fila } from "../estruturas/Fila";
import { FilaPrioridade } from "../estruturas/FilaPrioridade";
import { payloadValido } from "./validador";
import {
  MAX_TENTATIVAS,
  Mensagem,
  ModoBroker,
  Processador,
  Relatorio,
  prioridadeDe,
} from "./tipos";

export class Broker {
  private modo: ModoBroker;

  // A fila principal. No modo "FIFO" usamos a Fila; no modo "PRIORIDADE"
  // (Nível 5) usamos a FilaPrioridade. Só UMA delas é usada por broker.
  private fila = new Fila<Mensagem>();
  private filaPrioridade = new FilaPrioridade<Mensagem>();

  // Dead Letter Queue: a "caixa de pendências" para um humano analisar (Nível 4).
  private dlq = new Fila<Mensagem>();

  // Contadores do relatório.
  private processadas = 0;
  private reprocessadas = 0;
  private naDLQ = 0;
  private rejeitadas = 0;

  constructor(modo: ModoBroker = "FIFO") {
    this.modo = modo;
  }

  // ------------------------------------------------------------------
  // AJUDANTES da fila principal. O resto do Broker deve usar SÓ estes
  // dois métodos para colocar/tirar mensagens. Assim, no Nível 5, você
  // só precisa mexer aqui para o modo PRIORIDADE funcionar.
  // ------------------------------------------------------------------

  // Big-O esperado: O(1) no FIFO · O(n) no PRIORIDADE (inserção ordenada)
  // Nível 3: coloque a mensagem no fim da Fila.
  // Nível 5: se o modo for "PRIORIDADE", use a filaPrioridade com prioridadeDe(msg.tipo).
  private entrarNaFila(msg: Mensagem): void {
    // TODO
  }

  // Big-O esperado: O(1)
  // Nível 3: tire a próxima mensagem da Fila (ou null, se vazia).
  // Nível 5: no modo "PRIORIDADE", tire da filaPrioridade.
  private sairDaFila(): Mensagem | null {
    // TODO
    return null;
  }

  // Big-O esperado: O(1)
  // Quantas mensagens estão esperando na fila principal.
  // (Nível 5: lembre que no modo "PRIORIDADE" a fila é outra.)
  pendentes(): number {
    // TODO
    return 0;
  }

  // ------------------------------------------------------------------
  // NÍVEL 3 — publicar e consumir
  // ------------------------------------------------------------------

  // Big-O esperado: O(p) para validar (p = tamanho do payload) + O(1) para enfileirar
  // Payload inválido: conta em rejeitadas e devolve false (não entra na fila).
  // Payload válido: entra na fila e devolve true.
  publicar(msg: Mensagem): boolean {
    // TODO
    return false;
  }

  // Big-O esperado: O(1) no FIFO
  // Tira UMA mensagem da fila e chama processar(msg). Devolve a mensagem
  // que foi retirada. Fila vazia: devolve null (e não chama processar).
  //
  // Nível 3: se processar devolver true, conta em processadas.
  // Nível 4: se processar devolver false:
  //   - msg.tentativas aumenta 1;
  //   - se ainda tem tentativas (tentativas < MAX_TENTATIVAS): volta para o
  //     FIM da fila (retry) e conta em reprocessadas;
  //   - senão: vai para a DLQ e conta em naDLQ.
  consumir(processar: Processador): Mensagem | null {
    // TODO
    return null;
  }

  // Big-O esperado: O(n) se nada falhar (n = mensagens na fila);
  // com falhas, cada mensagem passa no máximo MAX_TENTATIVAS vezes.
  // Consome até a fila principal esvaziar e devolve o relatório.
  processarTudo(processar: Processador): Relatorio {
    // TODO
    return this.montarRelatorio();
  }

  // ------------------------------------------------------------------
  // NÍVEL 4 — Dead Letter Queue
  // ------------------------------------------------------------------

  // Big-O esperado: O(1)
  // Quantas mensagens estão na DLQ.
  tamanhoDLQ(): number {
    // TODO
    return 0;
  }

  // PRONTO — Big-O: O(1). Junta os contadores num Relatorio.
  private montarRelatorio(): Relatorio {
    return {
      processadas: this.processadas,
      reprocessadas: this.reprocessadas,
      naDLQ: this.naDLQ,
      rejeitadas: this.rejeitadas,
    };
  }
}
