// ---------------------------------------------------------------
// npm run verificar — lista métodos proibidos nos arquivos do aluno.
// É um AVISO para revisão (não reprova sozinho): push/pop da SUA Pilha
// são permitidos. NÃO edite este arquivo.
// ---------------------------------------------------------------
import { join } from "node:path";
import { ARQUIVOS_DO_ALUNO, procurarProibidos } from "./proibidos";

const cor = process.stdout.isTTY || process.env.FORCE_COLOR
  ? { am: "\x1b[33m", vm: "\x1b[31m", vd: "\x1b[32m", cz: "\x1b[90m", neg: "\x1b[1m", fim: "\x1b[0m" }
  : { am: "", vm: "", vd: "", cz: "", neg: "", fim: "" };

const achados = procurarProibidos(join(__dirname, ".."));

console.log(`\n${cor.neg}PagaJá Broker — verificação de métodos proibidos${cor.fim}`);
console.log(`${cor.cz}Arquivos conferidos: ${ARQUIVOS_DO_ALUNO.join(", ")}${cor.fim}\n`);

if (achados.length === 0) {
  console.log(`${cor.vd}✅ Nenhum método proibido encontrado.${cor.fim}\n`);
} else {
  for (const a of achados) {
    const icone = a.talvezPilha ? `${cor.am}⚠️ ` : `${cor.vm}❌`;
    const obs = a.talvezPilha
      ? "confira: é o push/pop da SUA Pilha (permitido) ou de um array (proibido)?"
      : `.${a.metodo}() é proibido nesta prática`;
    console.log(`${icone} ${a.arquivo}:${a.linha}${cor.fim}  ${obs}`);
    console.log(`${cor.cz}     ${a.trecho}${cor.fim}`);
  }
  console.log(
    `\n${cor.am}Isto é um AVISO para revisão, não uma nota. ` +
      `Arrays e métodos prontos (.push, .shift, .indexOf, .split...) são proibidos; ` +
      `os métodos das SUAS classes (Pilha, Fila, FilaPrioridade) são permitidos.${cor.fim}\n`
  );
}
