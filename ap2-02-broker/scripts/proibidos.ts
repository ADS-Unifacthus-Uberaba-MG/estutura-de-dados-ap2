// ---------------------------------------------------------------
// Procura métodos proibidos nos arquivos que o aluno edita.
// Usado por `npm run verificar` e `npm run progresso`. NÃO edite.
// ---------------------------------------------------------------
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const ARQUIVOS_DO_ALUNO = [
  "src/estruturas/Fila.ts",
  "src/estruturas/FilaPrioridade.ts",
  "src/broker/validador.ts",
  "src/broker/Broker.ts",
];

const METODOS = [
  "push", "pop", "shift", "unshift", "splice", "indexOf", "includes",
  "sort", "reverse", "split", "find", "filter", "map",
];

// push/pop são permitidos quando são da SUA Pilha — o professor confere.
const DA_PILHA = ["push", "pop"];

export interface Ocorrencia {
  arquivo: string;
  linha: number;
  metodo: string;
  trecho: string;
  talvezPilha: boolean;
}

// Troca comentários e textos entre aspas por espaços, mantendo as quebras
// de linha (para o número da linha continuar certo).
function semComentariosNemTextos(codigo: string): string {
  let saida = "";
  let i = 0;
  while (i < codigo.length) {
    const c = codigo[i];
    const d = codigo[i + 1];
    if (c === "/" && d === "/") {
      while (i < codigo.length && codigo[i] !== "\n") { saida += " "; i++; }
    } else if (c === "/" && d === "*") {
      while (i < codigo.length && !(codigo[i] === "*" && codigo[i + 1] === "/")) {
        saida += codigo[i] === "\n" ? "\n" : " "; i++;
      }
      saida += "  "; i += 2;
    } else if (c === '"' || c === "'" || c === "`") {
      const aspas = c;
      saida += " "; i++;
      while (i < codigo.length && codigo[i] !== aspas) {
        if (codigo[i] === "\\") { saida += " "; i++; }
        saida += codigo[i] === "\n" ? "\n" : " "; i++;
      }
      saida += " "; i++;
    } else {
      saida += c; i++;
    }
  }
  return saida;
}

export function procurarProibidos(raiz: string): Ocorrencia[] {
  const achados: Ocorrencia[] = [];
  const regex = new RegExp("\\.\\s*(" + METODOS.join("|") + ")\\s*\\(", "g");
  for (const arquivo of ARQUIVOS_DO_ALUNO) {
    const caminho = join(raiz, arquivo);
    if (!existsSync(caminho)) continue;
    const original = readFileSync(caminho, "utf-8").split("\n");
    const limpo = semComentariosNemTextos(readFileSync(caminho, "utf-8")).split("\n");
    limpo.forEach((linha, n) => {
      for (const m of linha.matchAll(regex)) {
        achados.push({
          arquivo,
          linha: n + 1,
          metodo: m[1],
          trecho: original[n].trim(),
          talvezPilha: DA_PILHA.includes(m[1]),
        });
      }
    });
  }
  return achados;
}
