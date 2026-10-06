// ---------------------------------------------------------------
// Teste da PARTE 1 — Classe Pilha. Não edite este arquivo.
// Rode com: npx tsx ap2-01/testes/parte1.ts
// Confira se a saída bate com os comentários.
// ---------------------------------------------------------------
import { Pilha } from "../parte1-pilha";

const p = new Pilha<number>();
p.push(10); p.push(20); p.push(30);
p.imprimir();                        // TOPO -> 30 -> 20 -> 10 -> null
console.log(p.peek());               // 30
console.log(p.pop());                // 30
console.log(p.tamanho());            // 2
p.pop(); p.pop();
console.log(p.pop());                // null
console.log(p.estaVazia());          // true
