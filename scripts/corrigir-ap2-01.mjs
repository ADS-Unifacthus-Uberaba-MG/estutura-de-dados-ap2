#!/usr/bin/env node
import { execSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SUMMARY_FILE = process.env.GITHUB_STEP_SUMMARY;
const NOME_TRABALHO = "AP2-01";
const ARQUIVO_ALUNO = "ap2-01/pilha.ts";
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
// Corta o arquivo na linha de traços logo antes de "Não edite daqui pra
// baixo": fica só o código do aluno, sem os testes visíveis. Cada parte é
// testada com um bloco próprio (abaixo), que cobre mais casos que o arquivo.
const MARCADOR = "Não edite daqui pra baixo";
const MSG_MARCADOR =
  "O trecho 'Não edite daqui pra baixo' foi removido. Restaure o arquivo original.";
const MSG_LOOP =
  "O código demorou demais (provável loop infinito). Confira a ordem das linhas no push: " +
  "primeiro `novo.proximo = this.topo`, depois `this.topo = novo`.";

function extrairCodigoAluno() {
  if (!existsSync(ARQUIVO_ALUNO)) {
    return { erro: `Arquivo \`${ARQUIVO_ALUNO}\` não encontrado no repositório.` };
  }
  const linhas = readFileSync(ARQUIVO_ALUNO, "utf-8").split(/\r?\n/);
  const iMarcador = linhas.findIndex((l) => l.includes(MARCADOR));
  if (iMarcador === -1) return { erro: MSG_MARCADOR };
  let corte = iMarcador;
  for (let i = iMarcador - 1; i >= 0; i--) {
    if (/^\s*\/\/\s*-{5,}/.test(linhas[i])) {
      corte = i;
      break;
    }
    if (linhas[i].trim() !== "") break;
  }
  return { codigo: linhas.slice(0, corte).join("\n") };
}

function semComentarios(codigo) {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => l.replace(/\/\/.*$/, ""))
    .join("\n");
}

const aluno = extrairCodigoAluno();
const pastaTemp = mkdtempSync(join(tmpdir(), "corrigir-ap2-01-"));

// Aquece o npx (baixa o tsx uma vez) para o download não contar no timeout.
if (!aluno.erro) rodarArquivo("--version", 120000);

// Os blocos de teste ficam em texto puro (são testes, não respostas).
// As respostas certas NÃO ficam aqui — só o hash SHA-256 da saída esperada.
// Isso evita que um aluno que olhar este script no próprio fork veja o gabarito.
function corrigirParte(id, nome, blocoTeste, hashEsperado, numeroLinhasEsperadas, dica) {
  if (aluno.erro) {
    return { nome, passou: false, resumo: "Arquivo incompleto", detalhe: `❌ ${aluno.erro}` };
  }

  const caminho = join(pastaTemp, `${id}.ts`);
  writeFileSync(caminho, aluno.codigo + "\n\n" + blocoTeste + "\n");
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

  const linhasObtidas = resultado.saida
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

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
const p = new Pilha<number>();
console.log(p.estaVazia()); console.log(p.tamanho()); console.log(p.pop()); console.log(p.peek());
p.push(10); p.push(20); p.push(30); p.imprimir();
console.log(p.peek()); console.log(p.tamanho()); console.log(p.pop()); console.log(p.pop());
console.log(p.tamanho()); console.log(p.estaVazia()); p.push(99); console.log(p.peek());
const s = new Pilha<string>(); s.push("a"); console.log(s.pop()); console.log(s.estaVazia());
`;

const TESTE_PARTE2 = `
console.log(inverterTexto("ROMA")); console.log(inverterTexto("pilha"));
console.log(inverterTexto("a")); console.log(inverterTexto("ADS 2026"));
`;

const TESTE_PARTE3 = `
const ed = new Editor(); ed.desfazer(); ed.refazer();
ed.digitar("Olá"); ed.digitar("turma"); ed.digitar("de"); ed.digitar("ADS");
console.log(ed.textoAtual()); ed.desfazer(); ed.desfazer(); console.log(ed.textoAtual());
ed.refazer(); console.log(ed.textoAtual()); ed.digitar("noturno"); ed.refazer(); console.log(ed.textoAtual());
ed.desfazer(); ed.desfazer(); ed.desfazer(); ed.desfazer(); ed.desfazer(); console.log("[" + ed.textoAtual() + "]");
`;

// --------------------------- Verificações estáticas ---------------------------
function verificarBigO() {
  const nome = "Complexidades Big-O preenchidas";
  if (aluno.erro) {
    return { nome, passou: false, resumo: "Arquivo incompleto", detalhe: `❌ ${aluno.erro}` };
  }
  const faltando = (aluno.codigo.match(/Big-O:\s*_{2,}/g) || []).length;
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
  if (aluno.erro) {
    return { nome, passou: false, resumo: "Arquivo incompleto", detalhe: `❌ ${aluno.erro}` };
  }
  const codigo = semComentarios(aluno.codigo);
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
