#!/usr/bin/env node
import { execSync } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SUMMARY_FILE = process.env.GITHUB_STEP_SUMMARY;
const NOME_TRABALHO = "AP2-01";
const PASTA_ALUNO = "ap2-01";
const TIMEOUT_MS = 10000;

function log(md) {
  console.log(md);
  if (SUMMARY_FILE) {
    try {
      appendFileSync(SUMMARY_FILE, md + "\n");
    } catch {
      throw new Error("Error writing to summary file " + SUMMARY_FILE + " " + md);
    }
  }
}

function sha256(texto) {
  return createHash("sha256").update(texto).digest("hex");
}

function badge(label, mensagem, cor) {
  const enc = (s) => encodeURIComponent(s).replace(/-/g, "--");
  return `![${label}](https://img.shields.io/badge/${enc(label)}-${enc(mensagem)}-${cor})`;
}

// O timeout do execSync só mata o shell: o npx/tsx de um loop infinito
// continuaria rodando. Onde existir o `timeout` do coreutils (o runner do
// GitHub é Ubuntu), ele encerra o grupo de processos inteiro (status 124).
let temTimeout = false;
try {
  execSync("command -v timeout", { stdio: "ignore" });
  temTimeout = true;
} catch {}

function rodarArquivo(caminho, timeout = TIMEOUT_MS) {
  const comando = `npx --yes tsx ${caminho}`;
  try {
    const saida = execSync(
      temTimeout ? `timeout -k 2 ${Math.ceil(timeout / 1000)} ${comando}` : comando,
      {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: temTimeout ? timeout + 5000 : timeout,
      }
    );
    return { ok: true, saida };
  } catch (erro) {
    const estourou =
      erro.signal === "SIGTERM" || erro.code === "ETIMEDOUT" || (temTimeout && erro.status === 124);
    const detalhe = (erro.stdout || "") + (erro.stderr || erro.message || "");
    return { ok: false, estourou, saida: detalhe };
  }
}

// --------------------------- Código do aluno ---------------------------
// Os arquivos do aluno são copiados para uma pasta temporária, sem a pasta
// `testes/` (os testes visíveis). Cada parte é testada com um arquivo de
// teste próprio (abaixo), que importa o código do aluno e cobre mais casos
// que os testes visíveis.
const ARQUIVOS = {
  no: "no.ts",
  parte1: "parte1-pilha.ts",
  parte2: "parte2-inverter-texto.ts",
  parte3: "parte3-editor.ts",
};
const MSG_LOOP =
  "O código demorou demais (provável loop infinito). Confira a ordem das linhas no push: " +
  "primeiro `novo.proximo = this.topo`, depois `this.topo = novo`.";
// Linha impressa antes dos testes: o que um console.log solto nos arquivos
// do aluno imprimir ao ser importado fica antes dela e é ignorado.
const INICIO = "=====INICIO-DOS-TESTES=====";

function semComentarios(codigo) {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => l.replace(/\/\/.*$/, ""))
    .join("\n");
}

const pastaTemp = mkdtempSync(join(tmpdir(), "corrigir-ap2-01-"));
const aluno = {};
for (const [chave, arquivo] of Object.entries(ARQUIVOS)) {
  const caminho = join(PASTA_ALUNO, arquivo);
  if (existsSync(caminho)) {
    copyFileSync(caminho, join(pastaTemp, arquivo));
    aluno[chave] = readFileSync(caminho, "utf-8");
  }
}

function arquivosFaltando(chaves) {
  const faltando = chaves.filter((c) => aluno[c] === undefined);
  if (faltando.length === 0) return null;
  const lista = faltando.map((c) => `\`${PASTA_ALUNO}/${ARQUIVOS[c]}\``).join(", ");
  return {
    passou: false,
    resumo: "Arquivo não encontrado",
    detalhe: `❌ Não encontrei: ${lista}. Restaure o arquivo original.`,
  };
}

// Aquece o npx (baixa o tsx uma vez) para o download não contar no timeout.
rodarArquivo("--version", 120000);

// Os blocos de teste ficam em texto puro (são testes, não respostas).
// As respostas certas NÃO ficam aqui — só o hash SHA-256 da saída esperada.
// Isso evita que um aluno que olhar este script no próprio fork veja o gabarito.
function corrigirParte(id, nome, necessarios, blocoTeste, hashEsperado, numeroLinhasEsperadas, dica) {
  const falta = arquivosFaltando(necessarios);
  if (falta) return { nome, ...falta };

  const caminho = join(pastaTemp, `teste-${id}.ts`);
  writeFileSync(caminho, blocoTeste.replace("INICIO", INICIO));
  const resultado = rodarArquivo(caminho);

  if (!resultado.ok) {
    if (resultado.estourou) {
      return { nome, passou: false, resumo: "Tempo esgotado", detalhe: `❌ ${MSG_LOOP}` };
    }
    return {
      nome,
      passou: false,
      resumo: "Erro ao executar o código",
      detalhe:
        `❌ O código não rodou sem erros. Isso normalmente significa um erro ` +
        `de digitação ou de sintaxe.\n\n\`\`\`\n${resultado.saida.trim()}\n\`\`\``,
    };
  }

  const todasAsLinhas = resultado.saida
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const linhasObtidas = todasAsLinhas.slice(todasAsLinhas.lastIndexOf(INICIO) + 1);

  const textoObtido = linhasObtidas.join("\n");
  const hashObtido = sha256(textoObtido);
  const passou = hashObtido === hashEsperado && linhasObtidas.length === numeroLinhasEsperadas;

  return {
    nome,
    passou,
    resumo: passou ? "Aprovado" : "Saída não confere com o esperado",
    detalhe:
      (passou ? "" : `💡 Dica: ${dica}.\n\n`) +
      `\`\`\`\n${textoObtido || "(sem saída)"}\n\`\`\``,
  };
}

const TESTE_PARTE1 = `
import { Pilha } from "./parte1-pilha";
console.log("INICIO");
const p = new Pilha<number>();
console.log(p.estaVazia()); console.log(p.tamanho()); console.log(p.pop()); console.log(p.peek());
p.push(10); p.push(20); p.push(30); p.imprimir();
console.log(p.peek()); console.log(p.tamanho()); console.log(p.pop()); console.log(p.pop());
console.log(p.tamanho()); console.log(p.estaVazia()); p.push(99); console.log(p.peek());
const s = new Pilha<string>(); s.push("a"); console.log(s.pop()); console.log(s.estaVazia());
`;

const TESTE_PARTE2 = `
import { inverterTexto } from "./parte2-inverter-texto";
console.log("INICIO");
console.log(inverterTexto("ROMA")); console.log(inverterTexto("pilha"));
console.log(inverterTexto("a")); console.log(inverterTexto("ADS 2026"));
`;

const TESTE_PARTE3 = `
import { Editor } from "./parte3-editor";
console.log("INICIO");
const ed = new Editor(); ed.desfazer(); ed.refazer();
ed.digitar("Olá"); ed.digitar("turma"); ed.digitar("de"); ed.digitar("ADS");
console.log(ed.textoAtual()); ed.desfazer(); ed.desfazer(); console.log(ed.textoAtual());
ed.refazer(); console.log(ed.textoAtual()); ed.digitar("noturno"); ed.refazer(); console.log(ed.textoAtual());
ed.desfazer(); ed.desfazer(); ed.desfazer(); ed.desfazer(); ed.desfazer(); console.log("[" + ed.textoAtual() + "]");
`;

// --------------------------- Verificações estáticas ---------------------------
function verificarBigO() {
  const nome = "Complexidades Big-O preenchidas";
  const falta = arquivosFaltando(["parte1", "parte2"]);
  if (falta) return { nome, ...falta };
  const codigo = aluno.parte1 + "\n" + aluno.parte2;
  const faltando = (codigo.match(/Big-O:\s*_{2,}/g) || []).length;
  const aviso =
    "> O script só confere se cada `Big-O: ____` foi preenchido. Se a complexidade " +
    "está certa é avaliado pelo professor.";
  if (faltando > 0) {
    return {
      nome,
      passou: false,
      resumo: `${faltando} complexidade(s) sem preencher`,
      detalhe: `❌ Ainda há ${faltando} campo(s) \`Big-O: ____\` sem preencher.\n\n${aviso}`,
    };
  }
  return { nome, passou: true, resumo: "Aprovado", detalhe: `✅ Todos os campos foram preenchidos.\n\n${aviso}` };
}

function verificarRegra() {
  const nome = "Regra — sem arrays e métodos prontos";
  // Confere os arquivos das três partes que existirem (arquivo faltando já
  // reprova a parte correspondente).
  const codigo = semComentarios(
    [aluno.parte1, aluno.parte2, aluno.parte3].filter((c) => c !== undefined).join("\n")
  );
  const padroes = [
    { regex: /\.split\s*\(/, texto: "`.split(`" },
    { regex: /\.reverse\s*\(/, texto: "`.reverse(`" },
    { regex: /\.join\s*\(/, texto: "`.join(`" },
    { regex: /\bArray\b/, texto: "`Array`" },
    { regex: /\[\s*\]/, texto: "`[]` (array literal ou tipo como `string[]`)" },
  ];
  const encontrados = padroes.filter((p) => p.regex.test(codigo)).map((p) => p.texto);
  if (encontrados.length > 0) {
    return {
      nome,
      passou: false,
      resumo: "Uso proibido encontrado",
      detalhe:
        `❌ Foi encontrado no seu código: ${encontrados.join(", ")}. Nesta prática não é ` +
        `permitido usar arrays nem métodos prontos — use a sua \`Pilha\`.\n\n` +
        `> Se esta regra reprovar, a Parte 2 é zerada na nota.`,
    };
  }
  return { nome, passou: true, resumo: "Aprovado", detalhe: "✅ Nenhum array ou método pronto encontrado." };
}

const itens = [
  {
    vale: "0,40",
    ...corrigirParte(
      "parte1",
      "Parte 1 — Classe Pilha",
      ["no", "parte1"],
      TESTE_PARTE1,
      "a88a8cacd0de0245ba52170cf9776b059904843dbfb8e8d2c4a6e1e10fb34ec6",
      14,
      "confira o tratamento de pilha vazia e o contador de tamanho"
    ),
  },
  { vale: "0,10", ...verificarBigO() },
  {
    vale: "0,20",
    ...corrigirParte(
      "parte2",
      "Parte 2 — inverterTexto",
      ["no", "parte1", "parte2"],
      TESTE_PARTE2,
      "6c96900988c1b151bcc5b43f6def1c273f4819bd0cbf528144b244e41287fc43",
      4,
      "empilhe todas as letras antes de começar a desempilhar"
    ),
  },
  {
    vale: "0,30",
    ...corrigirParte(
      "parte3",
      "Parte 3 — Editor (desfazer/refazer)",
      ["no", "parte1", "parte3"],
      TESTE_PARTE3,
      "2928a8bef20594ab797d31ef6f44539d3627d20b5cd20604fd7c136cc02347a5",
      5,
      "lembre que digitar algo novo deve esvaziar a pilha de refazer"
    ),
  },
  { vale: "obrigatória (se reprovar, a Parte 2 é zerada na nota)", ...verificarRegra() },
];

rmSync(pastaTemp, { recursive: true, force: true });

const totalPassou = itens.filter((q) => q.passou).length;
const totalItens = itens.length;
const tudoPassou = totalPassou === totalItens;

// --------------------------- Cabeçalho ---------------------------
log(`# 🩺 Correção Automática — ${NOME_TRABALHO}`);
log("");
log(
  [
    badge("Resultado", tudoPassou ? "Aprovado" : "Ajustes necessários", tudoPassou ? "brightgreen" : "orange"),
    badge("Itens", `${totalPassou}/${totalItens}`, tudoPassou ? "brightgreen" : "yellow"),
  ].join(" ")
);
log("");
log(
  "> Este relatório é gerado automaticamente. Ele confere se a saída do seu código bate com o " +
  "esperado — não substitui a correção do professor, só te dá um retorno rápido."
);
log("");
log(
  "> Os testes daqui vão além dos que aparecem no seu arquivo (pilha vazia, outras palavras, " +
  "refazer depois de digitar...). Por isso o seu terminal pode mostrar tudo certo e algum item " +
  "ainda aparecer com ❌."
);
log("");
log("---");

// --------------------------- Por item ---------------------------
for (const q of itens) {
  const icone = q.passou ? "✅" : "❌";
  log("");
  log(`### ${icone} ${q.nome} — ${q.resumo}`);
  log("");
  log("<details>");
  log(`<summary>Ver saída do terminal</summary>`);
  log("");
  log(q.detalhe);
  log("</details>");
}

// --------------------------- Resumo final ---------------------------
log("");
log("---");
log("");
log("## Resumo");
log("");
log("| Item | Vale | Resultado |");
log("|---|---|---|");
for (const q of itens) {
  log(`| ${q.nome} | ${q.vale} | ${q.passou ? "✅ Aprovado" : "❌ Ajustar"} |`);
}
log("");
log(
  tudoPassou
    ? `## ✅ Tudo certo! Os ${totalItens} itens bateram com o esperado.`
    : `## ⚠️ ${totalPassou}/${totalItens} itens aprovados — revise os marcados com ❌ acima.`
);

process.exit(tudoPassou ? 0 : 1);
