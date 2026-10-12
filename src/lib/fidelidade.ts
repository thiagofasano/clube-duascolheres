// Regras do Clube Duas Colheres.
//
// - Cada fatia comprada vale 1 selo; a cada 12 selos o cliente ganha 1 fatia grátis.
// - Os selos valem por um ciclo de 6 meses, contado a partir do primeiro selo do cartão.
//   Se o cartão não for completado nesse prazo, os selos zeram.
// - Ao completar o cartão, o que sobrar da compra já começa um novo ciclo.
// - Fatias grátis já conquistadas não vencem e não geram selos.

export const SELOS_POR_PREMIO = 12;
export const MESES_DE_VALIDADE = 6;

export type TipoEvento = "compra" | "resgate";

export type Evento = {
  tipo: TipoEvento;
  quantidade: number;
  criadoEm: Date;
};

export type Cartao = {
  selos: number;
  premiosDisponiveis: number;
  premiosGanhos: number;
  premiosResgatados: number;
  /** Data em que os selos atuais vencem (null quando não há selos). */
  venceEm: Date | null;
  /** Cada fatia grátis conquistada, da mais antiga para a mais recente. */
  conquistas: Conquista[];
};

/** Uma fatia grátis ganha ao completar o cartão. Resgates são atribuídos à conquista mais antiga. */
export type Conquista = {
  conquistadaEm: Date;
  resgatadaEm: Date | null;
};

export function somarMeses(data: Date, meses: number): Date {
  const resultado = new Date(data);
  const dia = resultado.getUTCDate();
  resultado.setUTCDate(1);
  resultado.setUTCMonth(resultado.getUTCMonth() + meses);
  const ultimoDia = new Date(
    Date.UTC(resultado.getUTCFullYear(), resultado.getUTCMonth() + 1, 0),
  ).getUTCDate();
  resultado.setUTCDate(Math.min(dia, ultimoDia));
  return resultado;
}

export function calcularCartao(eventos: Evento[], agora: Date = new Date()): Cartao {
  const ordenados = [...eventos].sort(
    (a, b) => a.criadoEm.getTime() - b.criadoEm.getTime(),
  );

  let selos = 0;
  let inicioCiclo: Date | null = null;
  const conquistas: Conquista[] = [];
  const resgates: Date[] = [];

  const vencido = (momento: Date) =>
    inicioCiclo !== null && momento >= somarMeses(inicioCiclo, MESES_DE_VALIDADE);

  for (const evento of ordenados) {
    if (evento.tipo === "resgate") {
      for (let i = 0; i < evento.quantidade; i++) resgates.push(evento.criadoEm);
      continue;
    }

    if (vencido(evento.criadoEm)) {
      selos = 0;
      inicioCiclo = null;
    }
    inicioCiclo ??= evento.criadoEm;

    selos += evento.quantidade;
    if (selos >= SELOS_POR_PREMIO) {
      for (let i = 0; i < Math.floor(selos / SELOS_POR_PREMIO); i++) {
        conquistas.push({ conquistadaEm: evento.criadoEm, resgatadaEm: null });
      }
      selos %= SELOS_POR_PREMIO;
      inicioCiclo = selos > 0 ? evento.criadoEm : null;
    }
  }

  if (vencido(agora)) {
    selos = 0;
    inicioCiclo = null;
  }

  resgates.forEach((data, i) => {
    if (conquistas[i]) conquistas[i].resgatadaEm = data;
  });

  return {
    selos,
    premiosGanhos: conquistas.length,
    premiosResgatados: resgates.length,
    premiosDisponiveis: Math.max(0, conquistas.length - resgates.length),
    venceEm: inicioCiclo ? somarMeses(inicioCiclo, MESES_DE_VALIDADE) : null,
    conquistas,
  };
}

/** Mantém só os dígitos e remove o DDI 55. Retorna null se não parecer um celular/telefone BR. */
export function normalizarTelefone(valor: string): string | null {
  let digitos = valor.replace(/\D/g, "");
  if (digitos.length > 11 && digitos.startsWith("55")) digitos = digitos.slice(2);
  return digitos.length === 10 || digitos.length === 11 ? digitos : null;
}

export function formatarTelefone(digitos: string): string {
  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);
  const corte = resto.length === 9 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}
