# AP2-02 — PagaJá Broker 💸📨

**Estrutura de Dados · UniFACTHUS · ADS noturno 2026/02 · Prof. Pierre Mendes Salatiel**

> Prática avaliativa individual · duração: a aula inteira (~75 min) · vale **1,00 ponto**

---

## 📖 A história

Você acabou de entrar como **estagiário(a) backend na PagaJá**, uma fintech de
pagamentos. Chegou a **Black Friday**: milhares de pagamentos por segundo (PIX,
cartão, boleto) e o sistema não dá conta de processar tudo na hora. Os
pagamentos começam a se perder. 😱

No mercado, a solução para isso é um **broker de mensagens** (RabbitMQ, Amazon
SQS, Kafka): um "meio de campo" que **recebe** as mensagens, **guarda numa fila**
e **entrega uma de cada vez** para quem vai processar. Assim, nada se perde: se
chegou mais do que dá para processar, a mensagem simplesmente espera a vez.

Antes de usar um broker pronto, o tech lead pediu:

> *"Constrói um mini-broker na unha, com as estruturas que você viu na
> faculdade. Quero que você entenda o que acontece por baixo dos panos."*

É isso que você vai fazer hoje. **Nada de bibliotecas de filas:** tudo é feito
com Fila, Pilha e Fila de Prioridade escritas por você.

### O caminho de um pagamento

```
                 ┌─────────────────────┐
  Producer       │  BROKER (você!)     │                       Consumer
 (site, app) ──► │  publicar(msg)      │                    (processa o
                 │      │              │                      pagamento)
                 │      ▼              │                           │
                 │ [validação: PILHA]──┼─► payload inválido        │
                 │      │ válido       │   (rejeitadas)            │
                 │      ▼              │                           │
                 │ ┌───────────────┐   │   consumir()              │
                 │ │ FILA (FIFO)   │───┼──────────────────────────►│
                 │ └───────────────┘   │                           │
                 │      ▲              │          deu certo? ✅ ack (processadas)
                 │      │ retry        │                           │
                 │      └──────────────┼──── falhou (1ª ou 2ª vez) ◄┤
                 │                     │                           │
                 │ ┌───────────────┐   │                           │
                 │ │ DLQ ☠️        │◄──┼──── falhou pela 3ª vez ◄──┘
                 │ └───────────────┘   │   (análise humana)
                 └─────────────────────┘
```

- **Producer** publica mensagens de pagamento.
- O broker **valida o payload** antes de aceitar (com uma **Pilha**!).
- As mensagens esperam numa **Fila FIFO**.
- O **consumer** retira e processa **uma por vez**.
- Se o processamento **falhar**, a mensagem volta para o **fim da fila**
  (*retry*), até **3 tentativas**.
- Depois de 3 falhas, ela vai para a **Dead Letter Queue (DLQ)**: uma fila
  separada, onde uma pessoa vai analisar o que aconteceu.
- No **modo prioridade**, PIX passa na frente de cartão, que passa na frente de
  boleto (**Fila de Prioridade**).

---

## 🚀 Como começar

> **Pré-requisitos:** Node.js 20 ou mais novo (`node -v`) e o seu fork deste
> repositório atualizado (veja "Passo 0 — Sincronizar o fork" no
> [README principal](../README.md)).

1. No VS Code, abra **a pasta `ap2-02-broker`** (Arquivo → Abrir Pasta…).
   Abrir esta pasta, e não a raiz do repositório, faz o VS Code usar as
   configurações da prática (veja "Por que o autocompletar está desligado?").
2. Abra o terminal (**Ctrl + '**) e instale as ferramentas:

   ```
   npm install
   ```

   > Todos os comandos desta prática (`npm run progresso`, `npm run nivel1`...)
   > funcionam tanto **dentro da pasta `ap2-02-broker`** quanto na **pasta raiz
   > do repositório** (a que tem a pasta `ap2-01`). Rode o `npm install` na
   > pasta em que o seu terminal estiver.

3. Veja o seu placar:

   ```
   npm run progresso
   ```

   No começo é tudo ⬜. Seu objetivo é deixar tudo ✅:

   ```
   PagaJá Broker — progresso da AP2-02

   ⬜ Nível 1 Fila FIFO ................. 0/7
   ⬜ Nível 2 Validador (Pilha) ......... 0/7
   ⬜ Nível 3 Broker .................... 0/6
   ...
   ```

4. Faça **os níveis na ordem** (1 → 6). Cada nível só depende dos anteriores.
   Nível incompleto vale parcial, então não pule: um Nível 1 sólido vale mais
   que um Nível 5 pela metade.

### Comandos

| Comando | O que faz |
| --- | --- |
| `npm run progresso` | Placar de todos os níveis (é este que você tira print) |
| `npm run nivel1` … `npm run nivel5` | Roda só os testes daquele nível, com a explicação de cada erro |
| `npm run testes` | Roda todos os testes |
| `npm run simular` | Roda a **Black Friday simulada** no seu broker 🛒 |
| `npm run verificar` | Procura métodos proibidos (`.push`, `.shift`...) nos seus arquivos |

### Os arquivos

```
ap2-02-broker/
├── src/
│   ├── estruturas/
│   │   ├── No.ts               ✔ pronto (o mesmo da AP2-01)
│   │   ├── Pilha.ts            ✔ pronta (a mesma da AP2-01)
│   │   ├── Fila.ts             ✏️ VOCÊ FAZ: Nível 1
│   │   └── FilaPrioridade.ts   ✏️ VOCÊ FAZ: Nível 5
│   ├── broker/
│   │   ├── tipos.ts            ✔ pronto (Mensagem, Relatorio, prioridadeDe...)
│   │   ├── validador.ts        ✏️ VOCÊ FAZ: Nível 2
│   │   └── Broker.ts           ✏️ VOCÊ FAZ: Níveis 3, 4 e 5
│   └── simulacao.ts            ✔ pronta (Black Friday)
├── testes/                     🚫 não edite
├── scripts/                    🚫 não edite
├── ANALISE.md                  ✏️ VOCÊ FAZ: Nível 6
└── TUTOR_IA.md                 🤖 prompts para usar a IA como tutora
```

Você só escreve onde está `// TODO`. Cada método já tem um comentário com a
**complexidade Big-O esperada**: use isso para conferir se o seu jeito de fazer
está no caminho certo.

---

## 🤖 Como usar a IA tutora

**Leia isto antes do Nível 1.** A IA pode te ajudar muito, desde que ela te faça
**pensar**. Se ela escrever o código por você, você não aprende e não vai saber
fazer na prova (PP2, sem IA).

### Em 5 passos

1. **Abra uma conversa NOVA** (ChatGPT, Claude, Gemini ou Copilot Chat) só para esta prática.
2. **Cole o Prompt 0** do [TUTOR_IA.md](TUTOR_IA.md) inteiro e envie.
3. **Espere o "Combinado! Em qual nível você está?"**. Se ela já começar
   escrevendo código, cole o Prompt 0 de novo.
4. **Use o prompt da sua situação** (tabela abaixo), trocando o que está entre `< >`.
5. **Responda as perguntas da IA antes de pedir a próxima pista.** Tente uns 3
   a 5 minutos sozinho(a) entre uma pista e outra.

### Qual prompt usar?

| Situação | Prompt |
| --- | --- |
| Comecei um nível novo e quero entender o que ele pede | 1 |
| Entendi, mas não sei por onde começar o código | 2 |
| `npm run nivelN` deu ❌ ou apareceu um erro vermelho | 3 |
| Faz 10 minutos que não saio do lugar | 4 |
| Não entendo o que acontece com head, tail ou a pilha | 5 |
| Os testes do nível passaram ✅ | 6 |
| Estou no Nível 6 (Big-O) | 7 |
| Terminei tudo e quero ir além | 8 |

### O fluxo de um nível

```text
Prompt 1 (entender) → Prompt 2 (planejar) → escrever o código → npm run nivelN
        ↑                                                            │
        └──── deu ❌? Prompt 3 (erro) · 4 (pista) · 5 (teste de mesa) ┘
                                                                     │
                                         passou ✅ → Prompt 6 (revisão) → anotar Big-O no ANALISE.md
```

### Onde estão os prompts?

No arquivo **[TUTOR_IA.md](TUTOR_IA.md)**. No GitHub, cada bloco de prompt tem
um **botão de copiar** no canto. No VS Code, abra o arquivo e aperte
**Ctrl+Shift+V** para ver formatado.

### Pode e não pode

| ✅ Pode (é estudo) | ❌ Não pode (é cola) |
| --- | --- |
| Pedir explicação de conceito ou analogia | Pedir "faz o método X para mim" |
| Pedir pistas e teste de mesa | Colar código gerado pela IA no seu arquivo |
| Perguntar sintaxe de TypeScript (como fazer um `while`) | Mandar o arquivo inteiro e pedir para "consertar tudo" |
| Pedir para explicar uma mensagem de erro | Alterar os testes para passarem |
| Pedir revisão do código que você escreveu | Usar a IA para responder o ANALISE.md sem pensar |

### Por que o autocompletar está desligado?

Nesta pasta, o arquivo `.vscode/settings.json` **desliga de propósito** as
sugestões cinzas que aparecem enquanto você digita (autocompletar inline do
Copilot e similares). Elas não seguem regra nenhuma de tutor e completam a
solução sozinhas, sem te perguntar nada. O **chat** da IA continua funcionando
normalmente, e os arquivos `CLAUDE.md`, `AGENTS.md` e
`.github/copilot-instructions.md` pedem que ela aja como tutora.

---

## 📊 Os níveis

| Nível | Tarefa | Estrutura | Tempo | Pontos |
| --- | --- | --- | --- | --- |
| 1 | Fila FIFO com head/tail | Fila | 12 min | 0,20 |
| 2 | Validador de payload | Pilha | 12 min | 0,20 |
| 3 | Broker: publicar e consumir | Fila | 12 min | 0,15 |
| 4 | Retry + Dead Letter Queue | Fila | 15 min | 0,20 |
| 5 | Modo prioridade (PIX primeiro) | Fila de prioridade | 15 min | 0,15 |
| 6 | Análise Big-O no `ANALISE.md` | — | 5 min | 0,10 |
| ⭐ | Desafio extra (sem nota): backpressure com fila circular | Fila circular | — | — |

**Faça na ordem; nível incompleto vale parcial.**

---

### Nível 1 — Fila FIFO com head e tail (0,20 · ~12 min)

📁 `src/estruturas/Fila.ts`

**Objetivo:** construir a fila onde os pagamentos esperam a vez.

**Analogia:** a fila da padaria. Quem chega entra **no fim**; quem é atendido
sai **do começo**. Quem chegou primeiro sai primeiro: **FIFO** (*First In,
First Out*).

```
  head                              tail
   │                                 │
   ▼                                 ▼
 ┌─────────┐    ┌─────────┐    ┌─────────┐
 │ pag-001 │───►│ pag-002 │───►│ pag-003 │───► null
 └─────────┘    └─────────┘    └─────────┘
   sai daqui                      entra aqui
  (dequeue)                       (enqueue)
```

**Métodos:**

| Método | O que faz | Big-O |
| --- | --- | --- |
| `enqueue(valor: T): void` | coloca no fim | O(1) |
| `dequeue(): T \| null` | tira do começo; fila vazia → `null` | O(1) |
| `peek(): T \| null` | olha o primeiro sem tirar | O(1) |
| `estaVazia(): boolean` | a fila está vazia? | O(1) |
| `tamanho(): number` | quantos estão na fila | O(1) |

**Por que tem `tail`?** Sem ele, para colocar alguém no fim você teria que
andar a fila inteira até achar o último: O(n). Com o `tail` você vai direto: O(1).

**⚠️ Armadilhas clássicas**

- **Fila vazia no `enqueue`:** quando entra o primeiro, ele é ao mesmo tempo o
  `head` **e** o `tail`.
- **O bug do tail:** quando o `dequeue` tira o **último** que sobrou, o `head`
  vira `null`... e o `tail`? Se ele continuar apontando para o nó que saiu, o
  próximo `enqueue` pendura o nó novo num nó "fantasma". Desenhe:

  ```
  antes:   head ─► [A] ◄─ tail
  dequeue: head ─► null      tail ─► [A] ??? 👻
  ```

- **`dequeue` em fila vazia** deve devolver `null`, não quebrar, e não deixar
  `quantidade` negativa.

▶️ Teste: `npm run nivel1`

🤖 Travou? Use o Prompt 3 (erro) ou o Prompt 4 (pista).

---

### Nível 2 — Validador de payload (0,20 · ~12 min)

📁 `src/broker/validador.ts` → `payloadValido(payload: string): boolean` · **O(n)**

**Objetivo:** antes de aceitar uma mensagem, o broker confere se o payload
"fecha direitinho". Um payload quebrado (cortado no meio da transmissão, por
exemplo) não pode entrar na fila.

**Analogia:** a pilha de pratos. Cada `{ [ (` que abre é um prato colocado na
pilha. Cada `} ] )` que fecha precisa combinar com o prato **de cima**, o
último que foi aberto.

```
 payload: {"itens":[1,2]}

 lê {   →  push      pilha: {
 lê [   →  push      pilha: { [
 lê ]   →  pop  "["  combina com "]"? ✅   pilha: {
 lê }   →  pop  "{"  combina com "}"? ✅   pilha: (vazia)
 fim do texto e pilha vazia → VÁLIDO ✅
```

**Regras:**

- payload vazio (`""`) é **inválido** (mensagem sem corpo);
- `{ } [ ] ( )` precisam estar balanceados e na ordem certa;
- todo o resto (letras, números, aspas, `:`, vírgulas) é **ignorado**. Versão
  simplificada: não precisa tratar chaves dentro de strings.

| Payload | Resultado | Por quê |
| --- | --- | --- |
| `{"cliente":"Ana","itens":[1,2]}` | ✅ | tudo fecha na ordem |
| `{[}]` | ❌ | o último aberto foi `[`, mas tentou fechar `}` |
| `{"cliente":"Bia"` | ❌ | abriu `{` e nunca fechou |
| `}` | ❌ | fechou sem ter aberto |
| `""` | ❌ | mensagem sem corpo |

Já estão **prontas** no arquivo: `ehAbertura(c)`, `ehFechamento(c)` e
`formamPar(abre, fecha)`. Use a **Pilha** (`push`, `pop`, `estaVazia`...) e
percorra o texto com `payload[i]` e `payload.length`.

**⚠️ Armadilhas clássicas**

- **`pop` em pilha vazia:** em `"}"` você tenta fechar sem ter aberto nada. O
  `pop()` devolve `null`: trate isso!
- **Esquecer de olhar a pilha no fim:** em `"{["` nada deu errado durante a
  leitura, mas sobrou coisa aberta.
- **Esquecer o texto vazio.**

▶️ Teste: `npm run nivel2`

🤖 Travou? Use o Prompt 3 (erro) ou o Prompt 4 (pista).

---

### Nível 3 — Broker: publicar e consumir (0,15 · ~12 min)

📁 `src/broker/Broker.ts`

**Objetivo:** juntar tudo. O broker recebe mensagens, valida, guarda na fila e
entrega para o consumer.

**Analogia:** a senha do banco. Você chega (publicar), confere se os documentos
estão certos (validação), pega a senha e espera (fila). Quando o caixa chama
(consumir), vai o próximo da vez.

Uma mensagem tem esta cara (veja `tipos.ts`):

```ts
{ id: "pag-001", tipo: "PIX", valor: 120, payload: '{"cliente":"Ana"}', tentativas: 0 }
```

O **processador** (consumer) é uma função que recebe a mensagem e devolve
`true` (deu certo: *ack*) ou `false` (falhou).

| Método | O que faz | Big-O |
| --- | --- | --- |
| `entrarNaFila(msg)` / `sairDaFila()` | ajudantes privados: põem/tiram da fila principal | O(1) |
| `pendentes(): number` | quantas mensagens esperam na fila | O(1) |
| `publicar(msg): boolean` | inválida → conta em `rejeitadas`, devolve `false`; válida → enfileira, devolve `true` | O(p) para validar + O(1) |
| `consumir(processar): Mensagem \| null` | tira 1 mensagem, chama `processar(msg)`, devolve a mensagem; fila vazia → `null` | O(1) |
| `processarTudo(processar): Relatorio` | chama `consumir` até a fila esvaziar e devolve o relatório | O(n) |

> 💡 Use **só** `entrarNaFila` e `sairDaFila` para mexer na fila principal. No
> Nível 5 você vai agradecer: só vai precisar mudar esses dois (e o
> `pendentes`).

**⚠️ Armadilhas clássicas**

- `consumir` em fila vazia **não pode** chamar o processador.
- Esquecer de contar `processadas` (quando dá certo) e `rejeitadas` (no publicar).
- `processarTudo`: repita **enquanto ainda houver pendentes**.

▶️ Teste: `npm run nivel3` e, depois, `npm run simular` 🛒

🤖 Travou? Use o Prompt 3 (erro) ou o Prompt 4 (pista).

---

### Nível 4 — Retry + Dead Letter Queue (0,20 · ~15 min)

📁 `src/broker/Broker.ts` (métodos `consumir` e `tamanhoDLQ`)

**Objetivo:** pagamento não pode sumir porque deu um erro passageiro (o
antifraude demorou, a rede piscou). Se falhou, tenta de novo depois. Mas se
falhou **3 vezes**, provavelmente é algo sério (cartão bloqueado): aí vai para a
**DLQ**, a "caixa de pendências" para uma pessoa analisar.

**Analogia:** na padaria, você chega no caixa e esqueceu a carteira. Não fica
travando a fila: volta para o **fim da fila** enquanto alguém traz a carteira.
Se voltar 3 vezes sem carteira, o gerente te chama num canto (DLQ).

Quando `processar(msg)` devolve `false`:

```
 msg.tentativas++
        │
        ├── tentativas < MAX_TENTATIVAS (3)?  → volta para o FIM da fila (retry)
        │                                       conta em reprocessadas
        │
        └── senão                             → vai para a DLQ
                                                conta em naDLQ
```

```
 fila: [A] [B] [C]       A falha (1ª vez)
 fila: [B] [C] [A]       A voltou para o FIM, tentativas = 1
```

`tamanhoDLQ(): number`: quantas mensagens estão na DLQ. **O(1)**.

**⚠️ Armadilhas clássicas**

- **Loop infinito:** se a mensagem que falha sempre volta para a fila e nunca
  vai para a DLQ, o `processarTudo` nunca termina. (Os testes param sozinhos
  depois de muitas chamadas e te avisam.)
- **Errar por um:** `<` ou `<=`? Conte nos dedos: falhou a 1ª (tentativas = 1),
  a 2ª (2), a 3ª (3) → DLQ. Ela deve passar pelo processador **3 vezes** no total.
- Voltar para o **começo** da fila em vez do **fim**.

▶️ Teste: `npm run nivel4` e `npm run simular` (agora com retry e DLQ ☠️)

🤖 Travou? Use o Prompt 3 (erro) ou o Prompt 4 (pista).

---

### Nível 5 — Modo prioridade: PIX primeiro (0,15 · ~15 min)

📁 `src/estruturas/FilaPrioridade.ts` e `src/broker/Broker.ts`

**Objetivo:** PIX cai na hora na conta do lojista, então é o mais urgente.
Cartão vem depois, e boleto pode esperar. No modo `"PRIORIDADE"`, o broker
entrega primeiro os mais urgentes.

**Analogia:** o pronto-socorro. Quem está mais grave é atendido primeiro, mesmo
tendo chegado depois. Entre dois pacientes igualmente graves, vale a ordem de
chegada.

**Parte A: `FilaPrioridade<T>`**, uma lista ligada **sempre ordenada** (como no slide):

| Método | O que faz | Big-O |
| --- | --- | --- |
| `enqueue(valor, prioridade)` | procura o lugar certo e insere ali | O(n) |
| `dequeue()` | tira o head (o mais urgente) | O(1) |
| `peek()`, `estaVazia()`, `tamanho()` | como na Fila | O(1) |

Menor número = mais urgente (`prioridadeDe`: PIX = 1, CARTAO = 2, BOLETO = 3).

```
 enqueue(pag-009, 1) numa lista que já tem:

 head ─► [pag-001 · 1] ─► [pag-002 · 2] ─► [pag-003 · 3] ─► null
                        ▲
                        └── entra AQUI: depois do último 1, antes do 2
```

**Parte B: Broker no modo `"PRIORIDADE"`.** Mexa nos ajudantes `entrarNaFila`,
`sairDaFila` e em `pendentes`: se `this.modo === "PRIORIDADE"`, use a
`filaPrioridade` com `prioridadeDe(msg.tipo)`. O retry continua funcionando
sozinho: a mensagem volta **com a mesma prioridade**.

**⚠️ Armadilhas clássicas**

- **Empate na prioridade:** dois PIX precisam sair na ordem de chegada. O novo
  entra **depois** de todos os que têm prioridade igual: compare com `<=`, não `<`.
- **Inserir antes do head:** se o novo é mais urgente que o primeiro, quem muda
  é o próprio `head`.
- **Lista vazia** e **inserir no fim** (`atual.proximo === null`).

▶️ Teste: `npm run nivel5` e `npm run simular` (agora com a comparação FIFO × PRIORIDADE ⚖️)

🤖 Travou? Use o Prompt 3 (erro) ou o Prompt 4 (pista).

---

### Nível 6 — Análise Big-O (0,10 · ~5 min)

📁 `ANALISE.md`

Preencha a tabela e responda as 3 perguntas curtas com as suas palavras. O
`npm run progresso` mostra quantos campos você já preencheu; se está certo, o
professor avalia.

🤖 Use o Prompt 7: a IA te pergunta "por quê?" em vez de dar a resposta.

---

### ⭐ Desafio extra (sem nota): backpressure

Na vida real a memória do servidor acaba. Um broker sério **recusa** mensagens
quando está cheio, para avisar o producer "calma, segura aí" (isso se chama
*backpressure*).

Crie uma **fila circular de capacidade fixa** (um "array" de tamanho fixo com
índices `inicio` e `fim` que dão a volta usando `%`) e faça o `publicar()`
recusar quando o broker estiver cheio. Desenhe a fila circular antes de codar:
o que acontece quando `fim` chega no último índice? Como saber se está cheia ou
vazia? Não há testes automáticos para o desafio: mostre para o professor.

---

## 📏 Regras

- **Individual.**
- Escreva **só** nos trechos marcados com `// TODO` (e no `ANALISE.md`).
- **Não altere os testes** (`testes/`) nem os scripts (`scripts/`).
- **Métodos proibidos** nos arquivos que você edita:
  `.push()` `.pop()` `.shift()` `.unshift()` `.splice()` `.indexOf()`
  `.includes()` `.sort()` `.reverse()` `.split()` `.find()` `.filter()` `.map()`
  de arrays e strings.
  **Permitido:** `texto[i]`, `texto.length`, `for`, `while`, `if` e os métodos
  das **suas** classes (`Pilha.push`/`Pilha.pop` são da sua classe, então
  pode!). Confira com `npm run verificar`.
- Não apague as linhas `import` / `export` do começo dos arquivos.

## 📬 Entrega

1. Faça `git add .`, `git commit -m "AP2-02 - Seu Nome"` e `git push` no **seu fork**.
2. Abra (ou atualize) o **Pull Request** para o repositório do professor, como
   na AP2-01 (veja o [README principal](../README.md)).
3. Rode `npm run progresso` e **tire um print** do placar.
4. Registre a prática no **Portfólio de Evidências** com o print e o link do seu PR.

> A nota é dada pelo professor, que confere o placar, o código e o `ANALISE.md`.
> Falta sem justificativa aceita pela IES não tem reposição.

---

## 🏦 No mercado de verdade

O que você fez é, em miniatura, o que **RabbitMQ** e **Amazon SQS** fazem.
Quando o consumer termina um pagamento, ele manda um **ack** ("recebi e
processei") e só então o broker apaga a mensagem. Se o consumer manda um
*nack* ou morre no meio do caminho, a mensagem volta para a fila. No SQS isso
acontece sozinho: a mensagem fica "invisível" por um tempo (*visibility
timeout*) e, se ninguém confirmar, reaparece.

Os dois também têm **DLQ**. No SQS você configura uma *redrive policy* com
`maxReceiveCount` (exatamente o nosso `MAX_TENTATIVAS`); no RabbitMQ, uma
*dead letter exchange*. Em vez de reenfileirar na hora, sistemas reais costumam
esperar um pouco mais a cada tentativa (*exponential backoff*), para não
martelar um serviço que já está com problema.

**Prioridade:** o RabbitMQ tem filas com prioridade (`x-max-priority`), que
usam por dentro uma estrutura parecida com a sua, só que mais eficiente (um
*heap*, com inserção O(log n) em vez de O(n)). O SQS não tem prioridade: lá a
solução comum é ter **uma fila por prioridade** e o consumer olhar a do PIX
primeiro. O **Kafka** é diferente: é um *log* que guarda tudo em ordem e cada
consumer lembra até onde já leu.
