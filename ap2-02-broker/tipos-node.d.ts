// ============================================================
// Arquivo de apoio — NÃO precisa mexer.
// ============================================================
// Os testes e scripts usam alguns módulos do próprio Node.js
// (node:test, node:assert, node:child_process...). Este arquivo só
// "apresenta" esses módulos ao TypeScript, para o VS Code não sublinhar
// de vermelho e para não precisarmos instalar mais nenhum pacote.

declare module "node:test" {
  type FuncaoDeTeste = () => void | Promise<void>;
  function test(nome: string, fn: FuncaoDeTeste): void;
  export default test;
  export { test };
}

declare module "node:assert/strict" {
  interface Assert {
    (valor: unknown, mensagem?: string): void;
    ok(valor: unknown, mensagem?: string): void;
    equal(atual: unknown, esperado: unknown, mensagem?: string): void;
    notEqual(atual: unknown, esperado: unknown, mensagem?: string): void;
    deepEqual(atual: unknown, esperado: unknown, mensagem?: string): void;
    fail(mensagem?: string): never;
  }
  const assert: Assert;
  export default assert;
}

declare module "node:child_process" {
  interface ResultadoSpawn {
    status: number | null;
    signal: string | null;
    stdout: string;
    stderr: string;
    error?: Error;
  }
  export function spawnSync(
    comando: string,
    args: string[],
    opcoes: { encoding: "utf-8"; cwd?: string; timeout?: number; shell?: boolean; env?: unknown }
  ): ResultadoSpawn;
}

declare module "node:fs" {
  export function readFileSync(caminho: string, codificacao: "utf-8"): string;
  export function existsSync(caminho: string): boolean;
}

declare module "node:path" {
  export function join(...partes: string[]): string;
}

declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  execPath: string;
  exitCode: number | undefined;
  stdout: { isTTY?: boolean };
  cwd(): string;
};

declare const __dirname: string;
