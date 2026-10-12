// Rode com: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularCartao, normalizarTelefone, somarMeses, type Evento } from "./fidelidade.ts";

const compra = (quantidade: number, data: string): Evento => ({
  tipo: "compra",
  quantidade,
  criadoEm: new Date(data),
});
const resgate = (data: string): Evento => ({
  tipo: "resgate",
  quantidade: 1,
  criadoEm: new Date(data),
});

test("acumula selos e vence 6 meses após o primeiro selo", () => {
  const eventos = [compra(2, "2026-01-10"), compra(3, "2026-02-01")];
  const cartao = calcularCartao(eventos, new Date("2026-03-01"));
  assert.equal(cartao.selos, 5);
  assert.equal(cartao.venceEm?.toISOString().slice(0, 10), "2026-07-10");
});

test("selos zeram quando o ciclo vence", () => {
  const eventos = [compra(11, "2026-01-10")];
  assert.equal(calcularCartao(eventos, new Date("2026-07-10")).selos, 0);
});

test("compra após o vencimento começa um ciclo novo", () => {
  const eventos = [compra(11, "2026-01-10"), compra(2, "2026-08-01")];
  const cartao = calcularCartao(eventos, new Date("2026-08-02"));
  assert.equal(cartao.selos, 2);
  assert.equal(cartao.premiosGanhos, 0);
  assert.equal(cartao.venceEm?.toISOString().slice(0, 10), "2027-02-01");
});

test("12 selos geram 1 prêmio e a sobra inicia novo ciclo", () => {
  const eventos = [compra(11, "2026-01-10"), compra(3, "2026-03-01")];
  const cartao = calcularCartao(eventos, new Date("2026-03-02"));
  assert.equal(cartao.premiosDisponiveis, 1);
  assert.equal(cartao.selos, 2);
  assert.equal(cartao.venceEm?.toISOString().slice(0, 10), "2026-09-01");
});

test("compra grande pode gerar mais de um prêmio", () => {
  const cartao = calcularCartao([compra(25, "2026-01-10")], new Date("2026-01-11"));
  assert.equal(cartao.premiosDisponiveis, 2);
  assert.equal(cartao.selos, 1);
});

test("prêmio não vence e resgate desconta", () => {
  const eventos = [compra(12, "2026-01-10"), resgate("2026-01-20")];
  const cartao = calcularCartao(eventos, new Date("2027-01-01"));
  assert.equal(cartao.premiosDisponiveis, 0);
  assert.equal(cartao.premiosResgatados, 1);
  assert.equal(
    calcularCartao([compra(12, "2026-01-10")], new Date("2027-01-01")).premiosDisponiveis,
    1,
  );
});

test("histórico de conquistas liga cada resgate à fatia mais antiga", () => {
  const eventos = [
    compra(12, "2026-01-10"),
    compra(14, "2026-02-05"),
    resgate("2026-02-20"),
  ];
  const { conquistas } = calcularCartao(eventos, new Date("2026-03-01"));
  assert.deepEqual(
    conquistas.map((c) => [c.conquistadaEm.toISOString().slice(0, 10), c.resgatadaEm?.toISOString().slice(0, 10) ?? null]),
    [
      ["2026-01-10", "2026-02-20"],
      ["2026-02-05", null],
    ],
  );
});

test("somarMeses respeita o fim do mês", () => {
  assert.equal(somarMeses(new Date("2026-08-31"), 6).toISOString().slice(0, 10), "2027-02-28");
});

test("normaliza telefone", () => {
  assert.equal(normalizarTelefone("+55 (21) 99876-5432"), "21998765432");
  assert.equal(normalizarTelefone("(21) 3333-4444"), "2133334444");
  assert.equal(normalizarTelefone("12345"), null);
});
