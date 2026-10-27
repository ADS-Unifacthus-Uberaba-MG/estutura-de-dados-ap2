# Nível 6 — Análise Big-O do PagaJá Broker (0,10 ponto)

Preencha cada `____` com a complexidade (ex.: `O(1)`, `O(n)`) **e** uma
justificativa curta, com as suas palavras. Não apague os comentários `campo`
o `npm run progresso` usa eles para saber o que você já preencheu.

> Lembre: **n** = quantidade de mensagens na fila; **p** = quantidade de
> caracteres do payload.

## Parte A — Tabela

| Operação | Big-O | Por quê? (uma frase) |
| --- | --- | --- |
| `Fila.enqueue` | <!-- campo --> ____ | <!-- campo --> ____ |
| `Fila.dequeue` | <!-- campo --> ____ | <!-- campo --> ____ |
| `payloadValido(payload)` | <!-- campo --> ____ | <!-- campo --> ____ |
| `FilaPrioridade.enqueue` | <!-- campo --> ____ | <!-- campo --> ____ |
| `FilaPrioridade.dequeue` | <!-- campo --> ____ | <!-- campo --> ____ |
| `Broker.publicar` no modo FIFO (considerando só o enfileirar) | <!-- campo --> ____ | <!-- campo --> ____ |
| `Broker.processarTudo` com n mensagens, nenhuma falha | <!-- campo --> ____ | <!-- campo --> ____ |

## Parte B — Perguntas curtas

1. Se a nossa `Fila` **não tivesse o `tail`** (só o `head`), qual seria o
   Big-O do `enqueue`? Por quê?

   <!-- campo --> ____

2. Por que usar um array com `.shift()` para tirar o primeiro da fila seria
   pior do que a nossa lista ligada? (Dica: o que o `.shift()` faz com todos
   os outros elementos do array?)

   <!-- campo --> ____

3. No pior caso, no `processarTudo`, cada mensagem falha e é tentada
   `MAX_TENTATIVAS` (3) vezes. Quantas chamadas ao processador acontecem
   com n mensagens? Isso muda o Big-O? Por quê?

   <!-- campo --> ____
