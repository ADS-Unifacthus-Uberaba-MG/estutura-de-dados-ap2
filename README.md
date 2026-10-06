# Estrutura de Dados — Práticas Avaliativas do 2º Bimestre · UniFACTHUS

Este repositório reúne os exercícios das práticas avaliativas do **2º bimestre**
(AP2-01, AP2-02, ...) da disciplina de Estrutura de Dados. Cada prática tem sua
própria pasta — você só precisa editar os arquivos da prática que está fazendo
naquele dia.

> ⚠️ **Atenção: este é um repositório NOVO.**
> As práticas do 1º bimestre ficavam no repositório `estutura-de-dados-ap1-01`.
> Se você fez fork daquele repositório, **sincronizar o fork antigo não traz a
> AP2** — você precisa fazer um **fork novo deste repositório** (veja o Passo 4
> de "Como entregar sua prática", lá embaixo).

## Estrutura do repositório

| Pasta / arquivo                  | Para que serve                                               |
| -------------------------------- | ------------------------------------------------------------ |
| `ap2-01/pilha.ts`                | Exercício da **AP2-01** (Pilha com Lista Ligada)             |
| `package.json` / `tsconfig.json` | Configuração do projeto (opcional — veja Opção B abaixo)     |
| `scripts/`, `.github/`           | Usados pela correção automática. **Não precisa mexer aqui.** |

> Só edite os arquivos dentro da pasta da prática do dia. O resto do
> repositório é usado pela correção automática e não precisa ser tocado.

---

## Regras da AP2-01

- Complete **só** os trechos marcados com `// TODO`.
- Preencha todos os `Big-O: ____` com a complexidade de cada método.
- **Não use arrays nem métodos prontos** (`.split`, `.reverse`, `.join`...).
  Use a sua classe `Pilha`.
- **Não edite** o trecho final marcado como "Não edite daqui pra baixo" — ele
  testa o seu código.

---

## Passo 1 — Instalar o Node.js

Se você já usa Node.js nas aulas de Estrutura de Dados, pode pular este passo.

1. Acesse **https://nodejs.org**
2. Baixe a versão **LTS** para o seu sistema operacional.
3. Execute o instalador e siga o padrão (Next → Next → Install).
4. Confirme no terminal:

   ```
   node -v
   ```

---

## Passo 2 — Abrir o terminal na pasta do projeto

Pelo VS Code: abra a pasta do repositório e clique com o botão direito na
pasta raiz (a que contém o `package.json`) → **Abrir no Terminal**.

---

## Passo 3 — Entender os blocos `// TODO`

Dentro do arquivo da prática você vai ver comentários assim:

```
// TODO
```

- Tudo que começa com `//` é um **comentário** — o computador ignora essas linhas.
- `TODO` é uma convenção para marcar **"isso ainda precisa ser feito"**.
- O arquivo tem um trecho no final marcado como **"Não edite daqui pra
  baixo"** — esse trecho testa o código que você escreveu, não mexa nele.

---

## Passo 4 — Completar o arquivo

Abra o arquivo `ap2-01/pilha.ts`, leia os comentários e escreva o código pedido
em cada `// TODO`. Não esqueça de preencher os `Big-O: ____`.

---

## Passo 5 — Rodar o código

### Opção A — mais simples, sem instalar nada no projeto

```
npx tsx ap2-01/pilha.ts
```

### Opção B — usando os scripts do projeto

```
npm install
npm run ap2-01
```

---

## O que esperar no terminal

Se o seu código estiver certo, o terminal deve imprimir exatamente os valores
indicados nos comentários do trecho de testes, sem nenhuma linha em vermelho.

---

## Como entregar sua prática (Fork + Pull Request)

A entrega é feita pelo fluxo **Fork + Pull Request** — o mesmo usado no mercado
de trabalho. Você faz uma cópia (fork) deste repositório, trabalha nela, e
devolve o código pro professor abrindo um Pull Request. **Não é necessário e nem
esperado que o Pull Request seja mesclado (merge)** — ele já serve como sua
entrega.

> `https://github.com/ADS-Unifacthus-Uberaba-MG/estutura-de-dados-ap2.git`

### Passo 0 — Só para quem já tem fork DESTE repositório

Se você já fez fork deste repositório (o da AP2) para uma prática anterior —
por exemplo, para a AP2-01 — e agora vai fazer uma prática nova (AP2-02,
AP2-03...), seu fork pode estar desatualizado: a pasta da prática nova ainda
não existe nele. Antes de começar, sincronize seu fork:

**Pelo site do GitHub (mais simples):**

1. Abra a página do seu fork no GitHub.
2. Clique no botão **"Sync fork"** (perto do topo, ao lado do nome da branch).
3. Confirme em **"Update branch"**.

**Pelo terminal (se preferir):**

```
git remote add upstream https://github.com/ADS-Unifacthus-Uberaba-MG/estutura-de-dados-ap2.git
git fetch upstream
git merge upstream/main
git push
```

> Isso vale só para forks **deste** repositório. O fork do repositório da AP1
> não recebe a AP2 — para a AP2-01, faça um fork novo (Passo 4).

### Passo 1 — Instalar o Git

- Acesse **https://git-scm.com** e baixe o instalador.
- Confirme no terminal: `git --version`

### Passo 2 — Configurar seu nome e e-mail (uma vez só)

```
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### Passo 3 — Criar uma conta no GitHub

Se ainda não tiver, crie gratuitamente em **https://github.com**.

### Passo 4 — Fazer o Fork do repositório

1. Abra a URL do repositório.
2. Clique em **Fork**, no canto superior direito.
3. Confirme criando o fork na sua conta.

### Passo 5 — Clonar o SEU fork para o computador

```
git clone <URL-DO-SEU-FORK>
cd <nome-da-pasta-clonada>
```

### Passo 6 — Completar o exercício da prática do dia

Siga os Passos 1 a 5 acima no arquivo da pasta da prática (`ap2-01/pilha.ts`
na AP2-01).

### Passo 7 — Enviar suas alterações para o seu fork

```
git add .
git commit -m "Resolução AP2-01"
git push
```

### Passo 8 — Abrir o Pull Request

1. Volte para a página do seu fork no GitHub.
2. Clique no banner **"Compare & pull request"** (ou vá em **Pull requests** →
   **New pull request** no repositório do professor, escolhendo seu fork como
   origem).
3. Confira se o destino é o repositório do professor e a origem é o seu fork.
4. Escreva um título simples (ex.: `AP2-01 - Seu Nome`) e clique em
   **Create pull request**.

A correção automática identifica sozinha qual prática você entregou, com base
em qual pasta (`ap2-01/`, `ap2-02/`...) você alterou, e roda só o teste
correspondente.

### Passo 9 — Como ver o resultado da correção automática

1. Na página do seu Pull Request, abra a aba **Checks**.
2. Clique em **"Correção — AP2-01"**.
3. Clique em **Summary** para ver o relatório.

No relatório, cada parte aparece com ✅ (aprovada) ou ❌ (precisa ajustar), e
clicando em "Ver saída do terminal" você vê o que o seu código imprimiu.

> O relatório testa **casos além dos que aparecem no seu arquivo** (pilha vazia,
> outras palavras, refazer depois de digitar...). Por isso o seu terminal pode
> mostrar tudo certo e alguma parte ainda aparecer com ❌. O relatório é só um
> retorno rápido: **a nota final é dada pelo professor.**

### Passo 10 — O que acontece depois

O professor revisa seu código direto na aba do Pull Request. **Você não precisa
mesclar o Pull Request** — ele já é a sua entrega. Se for solicitado ajustes, edite o
arquivo de novo, repita o Passo 7 e o mesmo Pull Request é atualizado (a
correção automática roda de novo sozinha).
