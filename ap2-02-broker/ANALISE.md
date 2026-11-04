# Nível 6 — Análise Big-O do PagaJá Broker (0,10 ponto)

Preencha cada `____` com a complexidade (ex.: `O(1)`, `O(n)`) **e** uma
justificativa curta, com as suas palavras. Não apague os comentários `campo`
o `npm run progresso` usa eles para saber o que você já preencheu.

> Lembre: **n** = quantidade de mensagens na fila; **p** = quantidade de
> caracteres do payload.

## Parte A — Tabela

| Operação | Big-O | Por quê? (uma frase) |
| --- | --- | --- |
| `Fila.enqueue` | <!-- campo --> O(1) | <!-- campo --> Insere no final usando tail, sem percorrer a fila |
| `Fila.dequeue` | <!-- campo --> O(1) | <!-- campo --> Remove o primeiro nó usando head |
| `payloadValido(payload)` | <!-- campo --> O(p) | <!-- campo --> Percorre os caracteres do payload em uma unica vez |
| `FilaPrioridade.enqueue` | <!-- campo --> O(n)| <!-- campo --> Pode percorrer a fila inteira para encontrar o certo |
| `FilaPrioridade.dequeue` | <!-- campo --> O(1) | <!-- campo --> Remove o primeiro nó diretamente pelo head |
| `Broker.publicar` no modo FIFO (considerando só o enfileirar) | <!-- campo --> O(1) | <!-- campo --> No modo FIFO, insere no final |
| `Broker.processarTudo` com n mensagens, nenhuma falha | <!-- campo --> O(n) | <!-- campo --> Processa cada mensagem uma vez, operações constantes |

## Parte B — Perguntas curtas

1. Se a nossa `Fila` **não tivesse o `tail`** (só o `head`), qual seria o
   Big-O do `enqueue`? Por quê?

   <!-- campo --> O(n), porque seria necessário percorrer todos os nós.

2. Por que usar um array com `.shift()` para tirar o primeiro da fila seria
   pior do que a nossa lista ligada? (Dica: o que o `.shift()` faz com todos
   os outros elementos do array?)

   <!-- campo --> .shift(), remove o primeiro elemento e precisa deslocar todos os outros elementos  uma posição para trás

3. No pior caso, no `processarTudo`, cada mensagem falha e é tentada
   `MAX_TENTATIVAS` (3) vezes. Quantas chamadas ao processador acontecem
   com n mensagens? Isso muda o Big-O? Por quê?

   <!-- campo --> Acontece 3x n chamadas ao preocessador. Não muda o Big-O continua O(n), porque a quantidade de tentavias é limitada a 3
