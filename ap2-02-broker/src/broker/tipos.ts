// ============================================================
// AP2-02 — PagaJá Broker · Tipos (PRONTO)
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Este arquivo já está pronto, não precisa mexer. Ele define o "formato"
// de uma mensagem de pagamento e as regras do broker.

// Os três tipos de pagamento que a PagaJá aceita.
export type TipoPagamento = "PIX" | "CARTAO" | "BOLETO";

// Uma mensagem de pagamento (é isso que viaja pelo broker).
export interface Mensagem {
  id: string; // ex.: "pag-001"
  tipo: TipoPagamento;
  valor: number; // em reais
  payload: string; // texto JSON simplificado, ex.: '{"cliente":"Ana","itens":[1,2]}'
  tentativas: number; // quantas vezes o processamento já FALHOU (começa em 0)
}

// O "consumer": a função que processa um pagamento.
// Devolve true se deu certo (ack = "recebi e processei")
// ou false se falhou (o broker precisa tentar de novo depois).
export type Processador = (msg: Mensagem) => boolean;

// O resumo que o broker devolve no fim do dia.
export interface Relatorio {
  processadas: number; // processadas com sucesso (ack)
  reprocessadas: number; // quantas vezes alguma mensagem voltou para o fim da fila (retry)
  naDLQ: number; // quantas foram parar na Dead Letter Queue
  rejeitadas: number; // quantas foram recusadas no publicar (payload inválido)
}

// Depois de falhar MAX_TENTATIVAS vezes, a mensagem desiste e vai para a DLQ.
export const MAX_TENTATIVAS = 3;

// Modos de funcionamento do broker.
export type ModoBroker = "FIFO" | "PRIORIDADE";

// PRONTA — Big-O: O(1). Prioridade de cada tipo (menor número = mais urgente).
// PIX cai na hora, então é o mais urgente; boleto pode esperar.
export function prioridadeDe(tipo: TipoPagamento): number {
  if (tipo === "PIX") return 1;
  if (tipo === "CARTAO") return 2;
  return 3; // BOLETO
}
