// ---------------------------------------------------------------
// Funções de apoio dos testes. NÃO edite este arquivo.
// ---------------------------------------------------------------
import { Mensagem, Processador, TipoPagamento } from "../src/broker/tipos";

export const PAYLOAD_OK = '{"cliente":"Ana","itens":[1,2]}';

// Cria uma mensagem de pagamento nova (tentativas = 0).
export function msg(
  id: string,
  tipo: TipoPagamento = "PIX",
  valor: number = 100,
  payload: string = PAYLOAD_OK
): Mensagem {
  return { id, tipo, valor, payload, tentativas: 0 };
}

// Um processador "de mentira" para os testes. Ele:
//  - anota a ordem em que recebeu as mensagens (em `vistos`);
//  - decide se deu certo usando a função `decidir`;
//  - trava o teste se for chamado vezes demais (provável loop infinito).
export function processadorDeTeste(decidir: (m: Mensagem) => boolean, limite: number = 500) {
  const vistos: string[] = [];
  const processar: Processador = (m) => {
    vistos[vistos.length] = m.id;
    if (vistos.length > limite) {
      throw new Error(
        `O processador foi chamado mais de ${limite} vezes: parece um loop infinito. ` +
          `Confira se a fila esvazia, se tentativas aumenta a cada falha e se a ` +
          `mensagem vai para a DLQ depois de ${3} falhas.`
      );
    }
    return decidir(m);
  };
  return { processar, vistos };
}

export function lista(ids: string[]): string {
  let s = "";
  for (let i = 0; i < ids.length; i++) s += (i === 0 ? "" : ", ") + ids[i];
  return "[" + s + "]";
}
