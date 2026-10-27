// ---------------------------------------------------------------
// npm run progresso — placar dos níveis da AP2-02. NÃO edite.
// Roda os testes de cada nível e mostra quantos passaram.
// O professor usa este placar na correção; tire um print para o
// Portfólio de Evidências.
// ---------------------------------------------------------------
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { procurarProibidos } from "./proibidos";

const RAIZ = join(__dirname, "..");
const LARGURA = 34;

const cor = process.stdout.isTTY || process.env.FORCE_COLOR
  ? { vd: "\x1b[32m", am: "\x1b[33m", vm: "\x1b[31m", cz: "\x1b[90m", neg: "\x1b[1m", fim: "\x1b[0m" }
  : { vd: "", am: "", vm: "", cz: "", neg: "", fim: "" };

const NIVEIS = [
  { n: 1, nome: "Fila FIFO" },
  { n: 2, nome: "Validador (Pilha)" },
  { n: 3, nome: "Broker" },
  { n: 4, nome: "Retry + DLQ" },
  { n: 5, nome: "Prioridade" },
];

function linha(icone: string, titulo: string, placar: string, c: string): string {
  let pontos = " ";
  for (let i = titulo.length; i < LARGURA; i++) pontos += ".";
  return `${c}${icone} ${titulo}${cor.cz}${pontos}${cor.fim}${c} ${placar}${cor.fim}`;
}

function icone(passou: number, total: number): [string, string] {
  if (total > 0 && passou === total) return ["✅", cor.vd];
  if (passou > 0) return ["🟡", cor.am];
  return ["⬜", ""];
}

console.log(`\n${cor.neg}PagaJá Broker — progresso da AP2-02${cor.fim}\n`);

for (const nivel of NIVEIS) {
  const arquivo = `testes/nivel${nivel.n}.test.ts`;
  const fonte = readFileSync(join(RAIZ, arquivo), "utf-8");
  const total = (fonte.match(/^test\(/gm) || []).length;

  const r = spawnSync(
    process.execPath,
    ["--import", "tsx", "--test", "--test-reporter=tap", arquivo],
    { encoding: "utf-8", cwd: RAIZ, timeout: 30000 }
  );
  const saida = (r.stdout || "") + "\n" + (r.stderr || "");

  // Linhas de topo do TAP: "ok 3 - nome" ou "not ok 4 - nome"
  const passaram = (saida.match(/^ok \d+ - /gm) || []).length;
  const falharam: string[] = [];
  for (const m of saida.matchAll(/^not ok \d+ - (.*)$/gm)) falharam.push(m[1]);

  const titulo = `Nível ${nivel.n} ${nivel.nome}`;
  if (r.error || r.signal) {
    console.log(linha("⏱️ ", titulo, `0/${total}`, cor.vm));
    console.log(`${cor.vm}     tempo esgotado: provável loop infinito (um while que nunca termina?)${cor.fim}`);
    continue;
  }
  const passou = Math.min(passaram, total);
  const [ic, c] = icone(passou, total);
  console.log(linha(ic, titulo, `${passou}/${total}`, c));
  if (passou > 0 && passou < total) {
    for (const nome of falharam) console.log(`${cor.cz}     ✗ ${nome}${cor.fim}`);
  }
}

// Nível 6: só confere se os campos "____" do ANALISE.md foram preenchidos.
const analise = readFileSync(join(RAIZ, "ANALISE.md"), "utf-8");
const campos = (analise.match(/<!-- campo -->/g) || []).length;
const vazios = (analise.match(/<!-- campo -->\s*_{3,}/g) || []).length;
const preenchidos = campos - vazios;
const [ic6, c6] = icone(preenchidos, campos);
console.log(linha(ic6, "Nível 6 Análise Big-O", `${preenchidos}/${campos} campos`, c6));
console.log(`${cor.cz}     (aqui só confiro se você preencheu; se está certo, o professor avalia)${cor.fim}`);

const achados = procurarProibidos(RAIZ);
let graves = 0;
for (const a of achados) if (!a.talvezPilha) graves++;
if (graves > 0) {
  console.log(`\n${cor.vm}❌ ${graves} método(s) proibido(s) encontrado(s) — rode npm run verificar para ver onde.${cor.fim}`);
} else if (achados.length > 0) {
  console.log(
    `\n${cor.cz}ℹ️  ${achados.length} uso(s) de push/pop: tudo bem se forem da SUA Pilha (npm run verificar mostra onde).${cor.fim}`
  );
}
console.log(`\n${cor.cz}Detalhes de um nível: npm run nivel1 (… nivel5)${cor.fim}\n`);
