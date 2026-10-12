"use server";

import { entrar, exigirLogin, sair } from "@/lib/auth";
import { repo, type Cliente } from "@/lib/db";
import {
  calcularCartao,
  formatarTelefone,
  normalizarTelefone,
  SELOS_POR_PREMIO,
} from "@/lib/fidelidade";

const MINUTOS_PARA_DESFAZER = 30;
const MAX_FATIAS_POR_LANCAMENTO = 50;

export type CartaoPublico = {
  primeiroNome: string;
  selos: number;
  selosPorPremio: number;
  premiosDisponiveis: number;
  venceEm: string | null;
  /** Fatias grátis conquistadas, da mais recente para a mais antiga. */
  conquistas: { conquistadaEm: string; resgatadaEm: string | null }[];
};

export type CartaoBalcao = CartaoPublico & {
  nome: string;
  telefone: string;
  telefoneFormatado: string;
  premiosGanhos: number;
  premiosResgatados: number;
  podeDesfazer: boolean;
  historico: { id: number; tipo: "compra" | "resgate"; quantidade: number; criadoEm: string }[];
};

export type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

const TELEFONE_INVALIDO = "Telefone inválido. Use DDD + número, ex.: (21) 99999-8888.";

async function montarCartao(cliente: Cliente): Promise<CartaoBalcao> {
  const eventos = await repo().listarEventos(cliente.id);
  const agora = new Date();
  const cartao = calcularCartao(eventos, agora);
  const ultimo = eventos[eventos.length - 1];
  const limiteDesfazer = agora.getTime() - MINUTOS_PARA_DESFAZER * 60_000;

  return {
    nome: cliente.nome,
    primeiroNome: cliente.nome.split(" ")[0],
    telefone: cliente.telefone,
    telefoneFormatado: formatarTelefone(cliente.telefone),
    selos: cartao.selos,
    selosPorPremio: SELOS_POR_PREMIO,
    premiosDisponiveis: cartao.premiosDisponiveis,
    premiosGanhos: cartao.premiosGanhos,
    premiosResgatados: cartao.premiosResgatados,
    venceEm: cartao.venceEm?.toISOString() ?? null,
    conquistas: cartao.conquistas
      .map((c) => ({ conquistadaEm: c.conquistadaEm.toISOString(), resgatadaEm: c.resgatadaEm?.toISOString() ?? null }))
      .reverse(),
    podeDesfazer: !!ultimo && ultimo.criadoEm.getTime() >= limiteDesfazer,
    historico: eventos
      .slice(-20)
      .reverse()
      .map((e) => ({ id: e.id, tipo: e.tipo, quantidade: e.quantidade, criadoEm: e.criadoEm.toISOString() })),
  };
}

async function clienteDoBalcao(telefone: string): Promise<Resultado<Cliente>> {
  await exigirLogin();
  const numero = normalizarTelefone(telefone);
  if (!numero) return { ok: false, erro: TELEFONE_INVALIDO };
  const cliente = await repo().buscarCliente(numero);
  if (!cliente) return { ok: false, erro: "Cliente não encontrado." };
  return { ok: true, dados: cliente };
}

// ---------- Página do cliente (pública) ----------

export async function consultarCartao(telefone: string): Promise<Resultado<CartaoPublico>> {
  const numero = normalizarTelefone(telefone);
  if (!numero) return { ok: false, erro: TELEFONE_INVALIDO };
  const cliente = await repo().buscarCliente(numero);
  if (!cliente) {
    return { ok: false, erro: "Não encontramos esse número. Peça seu cadastro na próxima compra!" };
  }
  const { primeiroNome, selos, selosPorPremio, premiosDisponiveis, venceEm, conquistas } = await montarCartao(cliente);
  return { ok: true, dados: { primeiroNome, selos, selosPorPremio, premiosDisponiveis, venceEm, conquistas } };
}

// ---------- Balcão (exige senha) ----------

export async function entrarNoBalcao(senha: string): Promise<Resultado<null>> {
  if (!(await entrar(senha))) return { ok: false, erro: "Senha incorreta." };
  return { ok: true, dados: null };
}

export async function sairDoBalcao(): Promise<void> {
  await sair();
}

export async function buscarCliente(
  telefone: string,
): Promise<Resultado<{ telefone: string; cartao: CartaoBalcao | null }>> {
  await exigirLogin();
  const numero = normalizarTelefone(telefone);
  if (!numero) return { ok: false, erro: TELEFONE_INVALIDO };
  const cliente = await repo().buscarCliente(numero);
  return { ok: true, dados: { telefone: numero, cartao: cliente ? await montarCartao(cliente) : null } };
}

export type ResumoCliente = {
  nome: string;
  telefone: string;
  telefoneFormatado: string;
  selos: number;
  premiosDisponiveis: number;
};

export async function listarClientes(): Promise<Resultado<ResumoCliente[]>> {
  await exigirLogin();
  const [clientes, eventos] = await Promise.all([repo().listarClientes(), repo().listarTodosEventos()]);
  const agora = new Date();
  const resumo = clientes.map((cliente) => {
    const cartao = calcularCartao(eventos.filter((e) => e.clienteId === cliente.id), agora);
    return {
      nome: cliente.nome,
      telefone: cliente.telefone,
      telefoneFormatado: formatarTelefone(cliente.telefone),
      selos: cartao.selos,
      premiosDisponiveis: cartao.premiosDisponiveis,
    };
  });
  // Ordem alfabética ignorando acentos e maiúsculas (Ágata junto de Ana).
  resumo.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  return { ok: true, dados: resumo };
}

export async function cadastrarCliente(
  nome: string,
  telefone: string,
  consentiu: boolean,
): Promise<Resultado<CartaoBalcao>> {
  await exigirLogin();
  const numero = normalizarTelefone(telefone);
  if (!numero) return { ok: false, erro: TELEFONE_INVALIDO };
  const nomeLimpo = nome.trim().replace(/\s+/g, " ");
  if (nomeLimpo.length < 2) return { ok: false, erro: "Informe o nome do cliente." };
  if (!consentiu) return { ok: false, erro: "O cliente precisa autorizar o uso dos dados." };
  const cliente = await repo().criarCliente(nomeLimpo.slice(0, 80), numero);
  return { ok: true, dados: await montarCartao(cliente) };
}

export async function registrarCompra(telefone: string, quantidade: number): Promise<Resultado<CartaoBalcao>> {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAX_FATIAS_POR_LANCAMENTO) {
    return { ok: false, erro: `Quantidade deve ser entre 1 e ${MAX_FATIAS_POR_LANCAMENTO}.` };
  }
  const busca = await clienteDoBalcao(telefone);
  if (!busca.ok) return busca;
  await repo().inserirEvento(busca.dados.id, "compra", quantidade);
  return { ok: true, dados: await montarCartao(busca.dados) };
}

export async function resgatarPremio(telefone: string): Promise<Resultado<CartaoBalcao>> {
  const busca = await clienteDoBalcao(telefone);
  if (!busca.ok) return busca;
  const atual = await montarCartao(busca.dados);
  if (atual.premiosDisponiveis < 1) return { ok: false, erro: "Este cliente não tem fatia grátis disponível." };
  await repo().inserirEvento(busca.dados.id, "resgate", 1);
  return { ok: true, dados: await montarCartao(busca.dados) };
}

export async function desfazerUltimo(telefone: string): Promise<Resultado<CartaoBalcao>> {
  const busca = await clienteDoBalcao(telefone);
  if (!busca.ok) return busca;
  const desde = new Date(Date.now() - MINUTOS_PARA_DESFAZER * 60_000);
  if (!(await repo().desfazerUltimo(busca.dados.id, desde))) {
    return { ok: false, erro: `Só é possível desfazer lançamentos dos últimos ${MINUTOS_PARA_DESFAZER} minutos.` };
  }
  return { ok: true, dados: await montarCartao(busca.dados) };
}
