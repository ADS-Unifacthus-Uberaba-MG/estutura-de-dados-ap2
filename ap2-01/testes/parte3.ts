// ---------------------------------------------------------------
// Teste da PARTE 3 — Editor (desfazer/refazer). Não edite este arquivo.
// Rode com: npx tsx ap2-01/testes/parte3.ts
// Confira se a saída bate com os comentários.
// (Depende da Parte 1: a Pilha precisa estar funcionando.)
// ---------------------------------------------------------------
import { Editor } from "../parte3-editor";

const ed = new Editor();
ed.digitar("Olá"); ed.digitar("turma"); ed.digitar("de"); ed.digitar("ADS");
console.log(ed.textoAtual());        // Olá turma de ADS
ed.desfazer(); ed.desfazer();
console.log(ed.textoAtual());        // Olá turma
ed.refazer();
console.log(ed.textoAtual());        // Olá turma de
