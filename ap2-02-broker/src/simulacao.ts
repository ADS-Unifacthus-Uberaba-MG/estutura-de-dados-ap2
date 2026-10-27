// ============================================================
// AP2-02 — PagaJá Broker · Simulação da Black Friday (PRONTA)
// Estrutura de Dados · UniFACTHUS · ADS 2026/02
// Prof. Pierre Mendes Salatiel
// ============================================================
//
// Este arquivo já está pronto, não precisa mexer. Rode com:
//
//   npm run simular
//
// Ele publica os pagamentos de uma "noite de Black Friday" no SEU broker
// e mostra o log, como num sistema de verdade. Enquanto algum nível não
// estiver pronto, ele avisa qual nível falta em vez de quebrar.
//
// Regras do processador (o "consumer") desta simulação:
//   - valor acima de R$ 5.000 falha na 1ª tentativa (timeout no antifraude)
//     e passa na 2ª;
//   - a mensagem pag-013 sempre falha (cartão bloqueado) e termina na DLQ;
//   - o resto passa de primeira.

import { Fila } from "./estruturas/Fila";
import { FilaPrioridade } from "./estruturas/FilaPrioridade";
import { payloadValido } from "./broker/validador";
import { Broker } from "./broker/Broker";
import { MAX_TENTATIVAS, Mensagem, ModoBroker, Processador, Relatorio, TipoPagamento } from "./broker/tipos";

// ------------------------------------------------------------
// Relógio de mentira (para o log ter cara de sistema real)
// ------------------------------------------------------------
let segundos = 20 * 3600 + 41 * 60; // 20:41:00
function dois(n: number): string {
  return n < 10 ? "0" + n : String(n);
}
function hora(): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return `[${dois(h)}:${dois(m)}:${dois(s)}]`;
}
function avancar(s: number = 1): void {
  segundos += s;
}

const reais = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function dinheiro(v: number): string {
  return "R$ " + reais.format(v);
}
function tipoAlinhado(t: TipoPagamento): string {
  return (t + "      ").slice(0, 6);
}

// ------------------------------------------------------------
// Os pagamentos da noite (13 mensagens, 2 com payload inválido)
// ------------------------------------------------------------
function pagamentosDaBlackFriday(): Mensagem[] {
  const m = (id: string, tipo: TipoPagamento, valor: number, payload: string): Mensagem => ({
    id, tipo, valor, payload, tentativas: 0,
  });
  return [
    m("pag-001", "PIX", 120.0, '{"cliente":"Ana","itens":[1,2]}'),
    m("pag-002", "CARTAO", 7300.0, '{"cliente":"Caio","itens":[{"sku":"TV-75"}],"parcelas":(10)}'),
    m("pag-003", "BOLETO", 89.9, '{"cliente":"Duda","itens":[7]}'),
    m("pag-004", "PIX", 45.0, '{"cliente":"Bia"'), // inválido: não fechou
    m("pag-005", "CARTAO", 259.99, '{"cliente":"Enzo","itens":[3,4,5]}'),
    m("pag-006", "PIX", 5800.0, '{"cliente":"Fabi","itens":[{"sku":"NOTE-15"}]}'),
    m("pag-007", "BOLETO", 1200.0, '{"cliente":"Gabi","itens":[9]}'),
    m("pag-008", "CARTAO", 39.9, '{"cliente":"Hugo","itens":[1,2}]'), // inválido: ordem errada
    m("pag-009", "PIX", 15.0, '{"cliente":"Iara","itens":[2]}'),
    m("pag-010", "BOLETO", 6100.0, '{"cliente":"João","itens":[{"sku":"GELADEIRA"}]}'),
    m("pag-011", "CARTAO", 499.0, '{"cliente":"Kim","itens":[8,8]}'),
    m("pag-012", "PIX", 980.0, '{"cliente":"Lia","itens":[5]}'),
    m("pag-013", "CARTAO", 150.0, '{"cliente":"Mário","itens":[6]}'),
  ];
}

// ------------------------------------------------------------
// O processador da noite (consumer)
// ------------------------------------------------------------
interface Execucao {
  atendimentos: string[]; // ids na ordem em que o consumer recebeu
  confirmados: Mensagem[]; // mensagens com ack, na ordem
}

function processadorDaNoite(execucao: Execucao, comFalhas: boolean): Processador {
  return (msg: Mensagem): boolean => {
    avancar();
    execucao.atendimentos.push(msg.id);
    if (execucao.atendimentos.length > 200) {
      throw new Error("O broker chamou o consumer mais de 200 vezes: parece um loop infinito.");
    }
    let motivo = "";
    if (comFalhas && msg.id === "pag-013") motivo = "cartão bloqueado";
    else if (comFalhas && msg.valor > 5000 && msg.tentativas === 0) motivo = "timeout no antifraude";

    const cabeca = `${hora()} ⚙️  consumido ${msg.id} ${tipoAlinhado(msg.tipo)} ${dinheiro(msg.valor)}`;
    if (motivo === "") {
      console.log(`${cabeca} → ✅ ok (ack)`);
      execucao.confirmados.push(msg);
      return true;
    }
    const falha = msg.tentativas + 1;
    if (falha < MAX_TENTATIVAS) {
      console.log(`${cabeca} → falhou (${motivo}) — retry ${falha}/${MAX_TENTATIVAS}`);
    } else {
      console.log(`${cabeca} → falhou (${motivo})`);
      console.log(`${hora()} ☠️  DLQ ${msg.id} após ${MAX_TENTATIVAS} tentativas — vai para análise humana`);
    }
    return false;
  };
}

// ------------------------------------------------------------
// "Sondas": testes rapidinhos para saber quais níveis estão prontos
// ------------------------------------------------------------
function tenta(f: () => boolean): boolean {
  try {
    return f();
  } catch {
    return false;
  }
}

const nivelPronto: Record<number, () => boolean> = {
  1: () =>
    tenta(() => {
      const f = new Fila<number>();
      f.enqueue(1); f.enqueue(2);
      const ok = f.dequeue() === 1 && f.dequeue() === 2 && f.dequeue() === null;
      f.enqueue(3);
      return ok && f.peek() === 3 && f.tamanho() === 1 && !f.estaVazia();
    }),
  2: () => tenta(() => payloadValido("{[]}") && !payloadValido("{[}]") && !payloadValido("")),
  3: () =>
    tenta(() => {
      const b = new Broker();
      const ok = b.publicar(teste("a")) && b.publicar(teste("b")) && !b.publicar(teste("x", "{"));
      const primeiro = b.consumir(() => true);
      const r = b.processarTudo(() => true);
      return ok && primeiro !== null && primeiro.id === "a" && r.processadas === 2 && r.rejeitadas === 1;
    }),
  4: () =>
    tenta(() => {
      const b = new Broker();
      b.publicar(teste("a"));
      let chamadas = 0;
      const r = b.processarTudo(() => {
        if (++chamadas > 20) throw new Error("loop");
        return false;
      });
      return r.naDLQ === 1 && r.reprocessadas === 2 && b.tamanhoDLQ() === 1;
    }),
  5: () =>
    tenta(() => {
      const p = new FilaPrioridade<string>();
      p.enqueue("b", 3); p.enqueue("a", 1); p.enqueue("a2", 1);
      if (p.dequeue() !== "a" || p.dequeue() !== "a2") return false;
      const b = new Broker("PRIORIDADE");
      b.publicar(teste("boleto", "{}", "BOLETO"));
      b.publicar(teste("pix", "{}", "PIX"));
      const primeiro = b.consumir(() => true);
      return primeiro !== null && primeiro.id === "pix";
    }),
};

function teste(id: string, payload: string = "{}", tipo: TipoPagamento = "CARTAO"): Mensagem {
  return { id, tipo, valor: 1, payload, tentativas: 0 };
}

function primeiroNivelFaltando(ate: number): number {
  for (let n = 1; n <= ate; n++) if (!nivelPronto[n]()) return n;
  return 0;
}

// ------------------------------------------------------------
// Uma rodada completa num modo
// ------------------------------------------------------------
function rodada(modo: ModoBroker, comFalhas: boolean): { relatorio: Relatorio; execucao: Execucao; dlq: number } {
  const broker = new Broker(modo);
  const execucao: Execucao = { atendimentos: [], confirmados: [] };

  console.log(`\n${hora()} 🛒 Black Friday começou! Broker no modo ${modo}.`);
  let publicados = 0;
  for (const msg of pagamentosDaBlackFriday()) {
    if (publicados > 0 && publicados % 4 === 0) avancar();
    publicados++;
    const preco = `${tipoAlinhado(msg.tipo)} ${dinheiro(msg.valor)}`;
    if (broker.publicar(msg)) {
      console.log(`${hora()} 📥 publicado ${msg.id} ${preco}`);
    } else {
      console.log(`${hora()} ❌ rejeitado ${msg.id} payload inválido: ${msg.payload}`);
    }
  }
  avancar();
  console.log(`${hora()} 📦 ${broker.pendentes()} mensagens esperando na fila. Consumer ligado!`);

  const relatorio = broker.processarTudo(processadorDaNoite(execucao, comFalhas));
  avancar();
  console.log(`${hora()} 🏁 fila vazia. DLQ com ${broker.tamanhoDLQ()} mensagem(ns).`);
  return { relatorio, execucao, dlq: broker.tamanhoDLQ() };
}

function imprimirRelatorio(r: Relatorio): void {
  console.log("\n📋 Relatório");
  console.log(`   ✅ processadas ....... ${r.processadas}`);
  console.log(`   🔁 reprocessadas ..... ${r.reprocessadas}`);
  console.log(`   ☠️  na DLQ ............ ${r.naDLQ}`);
  console.log(`   ❌ rejeitadas ........ ${r.rejeitadas}`);
}

function posicoesDosPix(e: Execucao): string {
  const posicoes: string[] = [];
  e.confirmados.forEach((m, i) => {
    if (m.tipo === "PIX") posicoes.push(`${i + 1}º`);
  });
  return `${posicoes.join(", ")} de ${e.confirmados.length} confirmados`;
}

function ordem(e: Execucao): string {
  return e.confirmados.map((m) => (m.tipo === "PIX" ? `[${m.id}]` : m.id)).join(" ");
}

// ------------------------------------------------------------
// Programa principal
// ------------------------------------------------------------
console.log("════════════════════════════════════════════════════════════");
console.log(" PagaJá · Simulação da Black Friday · mini-broker da AP2-02");
console.log("════════════════════════════════════════════════════════════");

const faltaBase = primeiroNivelFaltando(3);
if (faltaBase !== 0) {
  console.log(`\n🚧 Complete o Nível ${faltaBase} para ver a simulação.`);
  console.log(`   Dica: rode npm run nivel${faltaBase} para ver o que ainda falta.\n`);
} else {
  const temRetry = nivelPronto[4]();
  if (!temRetry) {
    console.log("\n🚧 Complete o Nível 4 para ver retry e DLQ. Por enquanto, nesta");
    console.log("   simulação, nenhum pagamento falha.");
  }
  const fifo = rodada("FIFO", temRetry);
  imprimirRelatorio(fifo.relatorio);

  if (!nivelPronto[5]()) {
    console.log("\n🚧 Complete o Nível 5 para ver o modo PRIORIDADE (PIX primeiro)");
    console.log("   e a comparação FIFO × PRIORIDADE.\n");
  } else {
    segundos = 20 * 3600 + 41 * 60;
    const prio = rodada("PRIORIDADE", temRetry);
    imprimirRelatorio(prio.relatorio);

    console.log("\n⚖️  FIFO × PRIORIDADE — em que posição os PIX foram confirmados");
    console.log(`   FIFO        PIX em ${posicoesDosPix(fifo.execucao)}`);
    console.log(`   PRIORIDADE  PIX em ${posicoesDosPix(prio.execucao)}`);
    console.log("\n   Ordem de confirmação (PIX entre colchetes):");
    console.log(`   FIFO        ${ordem(fifo.execucao)}`);
    console.log(`   PRIORIDADE  ${ordem(prio.execucao)}`);
    console.log(
      "\n   No modo PRIORIDADE o PIX (dinheiro na hora) passa na frente; o boleto pode esperar." +
        "\n   Mas repare: o total processado é o mesmo, só muda a ORDEM.\n"
    );
  }
}
