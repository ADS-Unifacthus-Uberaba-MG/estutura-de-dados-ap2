# 🤖 Use a IA como tutora, não como cola

A IA pode te ajudar muito nesta prática, desde que ela **te faça pensar**. Se ela escrever o código por você, você não aprende e não vai saber fazer na prova (PP2, sem IA).

## 📋 Como usar este arquivo (leia antes do Nível 1)

### Passo a passo

1. **Escolha uma IA.** Pode ser qualquer chat: ChatGPT, Claude, Gemini ou o Copilot Chat do VS Code.
2. **Abra uma conversa NOVA só para esta prática.** Conversas antigas trazem outras instruções e a IA pode "esquecer" as regras.
3. **Copie o Prompt 0 inteiro e envie.** No GitHub, cada bloco tem um botão de copiar no canto. No VS Code, aperte **Ctrl+Shift+V** para ver este arquivo formatado.
4. **Espere a resposta "Combinado! Em qual nível você está?".** Se ela não vier, ou se a IA já começar escrevendo código, cole o Prompt 0 de novo.
5. **Use o prompt da sua situação** (tabela abaixo). Antes de enviar:
   - troque tudo que está entre `< >` e apague os sinais `< >`;
   - cole **só o método** em que você está trabalhando e a saída do terminal, não o arquivo inteiro.
6. **Responda as perguntas da IA antes de pedir mais.** Se pedir uma pista, tente uns 3 a 5 minutos sozinho(a) antes de pedir a próxima. Primeiro a Pista 1, depois a 2, depois a 3.
7. **Quando o teste passar**, use o Prompt 6 (revisão) e anote a complexidade Big-O no `ANALISE.md`.

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
                                         passou ✅ → Prompt 6 (revisão) → anotar Big-O
```

### Se a IA "escorregar" e te der o código pronto

**Não copie.** Responda com isto:

```text
Você quebrou a regra 1 do nosso combinado. Não quero o código pronto.
Me dê só a próxima pista e uma pergunta para eu pensar.
```

### Exemplo de uso bom

> **Aluno:** (Prompt 3) Rodei `npm run nivel1`: "fila que esvazia e volta a encher continua funcionando" ❌. Meu `dequeue` é este: …
>
> **IA:** Vamos simular. A fila tem só o "A". Você chama `dequeue()`. Depois dessa linha, para onde aponta o `head`? E o `tail`?
>
> **Aluno:** O `head` vira `null`… o `tail` continua no "A"!
>
> **IA:** Isso. E o que o próximo `enqueue` faz quando o `tail` não é `null`?

Repare que a IA **não deu a linha corrigida**. Ela fez o aluno achar o bug do tail sozinho.

### Pode e não pode

| ✅ Pode (é estudo) | ❌ Não pode (é cola) |
| --- | --- |
| Pedir explicação de conceito ou analogia | Pedir "faz o método X para mim" |
| Pedir pistas e teste de mesa | Colar código gerado pela IA no seu arquivo |
| Perguntar sintaxe de TypeScript (como fazer um `while`) | Mandar o arquivo inteiro e pedir para "consertar tudo" |
| Pedir para explicar uma mensagem de erro | Alterar os testes para passarem |
| Pedir revisão do código que você escreveu | Usar a IA para responder o `ANALISE.md` sem pensar |

> **Usando a IA dentro do VS Code (Copilot Chat, Claude Code etc.) com este repositório aberto:** os arquivos `CLAUDE.md`, `AGENTS.md` e `.github/copilot-instructions.md` já pedem que ela aja como tutora. Mesmo assim, cole o Prompt 0. **Desligue o autocompletar** (as sugestões cinzas que aparecem enquanto você digita) nos arquivos da prática: ele não segue regra nenhuma e completa a solução sozinho.

---

## Prompt 0 — Configurar a tutora (cole SEMPRE no começo da conversa)

```text
Você vai ser minha tutora de Estrutura de Dados. Sou aluno(a) iniciante de ADS (vim do Portugol/VisualG)
e estou fazendo uma prática avaliativa em TypeScript: um mini-broker de mensagens de pagamento "na unha",
com Fila (lista ligada com head e tail), Pilha, retry com Dead Letter Queue e Fila de Prioridade.

Regras que você DEVE seguir durante toda a conversa:
1. NUNCA escreva o código da solução dos métodos que eu preciso implementar, nem "só um pedaço" dele.
   Mesmo que eu peça, insista ou diga que o professor deixou. Se eu pedir, recuse com gentileza e me dê uma pista.
2. Me guie com PERGUNTAS, uma ou duas por vez, e espere eu responder.
3. Dê pistas em níveis: Pista 1 (conceito), Pista 2 (o que acontece com os ponteiros/variáveis),
   Pista 3 (pseudocódigo em português, sem TypeScript). Só avance de nível se eu pedir.
4. Use analogias do dia a dia (fila da padaria, pilha de pratos, pronto-socorro) e me peça para desenhar
   as caixinhas e setas no papel.
5. Pode me mostrar sintaxe de TypeScript com exemplos que NÃO sejam a solução
   (ex.: como fazer um while, como declarar um tipo).
6. Sempre que eu terminar uma parte, me pergunte qual é a complexidade Big-O e por quê.
7. Lembre que eu NÃO posso usar .push() .pop() .shift() .unshift() .splice() .indexOf() .includes()
   .sort() .reverse() .split() de arrays/strings. Posso usar texto[i], texto.length, for, while, if
   e os métodos das MINHAS classes Pilha e Fila.
8. Respostas curtas, em português, no máximo uns 10 linhas por vez.

Responda só "Combinado! Em qual nível você está?" para confirmar.
```

## Prompt 1 — Entender o que o nível pede

```text
Estou no Nível <número>. O enunciado diz:
<cole o trecho do README>

Antes de qualquer código: me explique com uma analogia do dia a dia o que esse nível quer,
e me faça 2 perguntas para ver se eu entendi.
```

## Prompt 2 — Planejar antes de codar

```text
Vou implementar <nome do método> do Nível <número>.
Meu plano em português é:
<escreva seus passos, mesmo que esteja inseguro>

Não escreva código. Me diga se o plano tem algum furo e me faça perguntas sobre os casos especiais
(fila vazia? um elemento só? empate?).
```

## Prompt 3 — O teste falhou ou deu erro

```text
Rodei <comando, ex.: npm run nivel1> e deu isto:
<cole a saída do terminal>

Meu código atual do método é:
<cole SÓ o método que você está fazendo>

Não me dê o código corrigido. Me ajude a descobrir o erro sozinho(a):
em qual linha devo olhar e que pergunta devo me fazer sobre ela?
```

## Prompt 4 — Estou travado(a)

```text
Estou travado(a) no Nível <número>, no método <nome>, faz uns 10 minutos.
O que eu já tentei: <explique>
Me dá a Pista <1, 2 ou 3>.
```

## Prompt 5 — Simular na mão (teste de mesa)

```text
Quero fazer um teste de mesa do meu <método> com esta sequência:
<ex.: enqueue(A), enqueue(B), dequeue(), dequeue(), enqueue(C)>

Me faça perguntas passo a passo sobre o valor de head, tail e quantidade depois de cada operação.
Não me diga as respostas. Só me corrija se eu errar e explique por quê.
```

## Prompt 6 — Revisar meu código (sem consertar)

```text
Meus testes do Nível <número> passaram. Revise este código como um tech lead revisaria o código de um estagiário:
<cole o código>

Aponte no máximo 3 coisas para melhorar (clareza, casos de borda, Big-O), mas NÃO reescreva o código.
Depois me pergunte qual é a complexidade de cada método.
```

## Prompt 7 — Conferir a análise Big-O (Nível 6)

```text
Esta é a minha tabela do ANALISE.md:
<cole sua tabela>

Para cada linha, não diga se está certo. Me pergunte "por que você acha isso?"
e só confirme depois da minha justificativa.
```

## Prompt 8 — Conectar com o mundo real (para depois de terminar)

```text
Terminei o mini-broker. Me explique em poucas linhas como o RabbitMQ ou o Amazon SQS fazem
ack, retry, Dead Letter Queue e prioridade, comparando com o que eu implementei.
Depois me faça uma pergunta de entrevista de estágio backend sobre filas.
```

---

> ⚠️ **Combinado da disciplina:** usar a IA como tutora é permitido e incentivado. Colar código gerado pela IA é contar com ela na prova também, e na PP2 ela não estará lá. Se o professor perguntar "por que você fez assim?", você precisa saber responder.
