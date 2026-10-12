import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Evento, TipoEvento } from "./fidelidade";

export type Cliente = { id: number; nome: string; telefone: string };
export type EventoSalvo = Evento & { id: number };

type Repositorio = {
  buscarCliente(telefone: string): Promise<Cliente | null>;
  criarCliente(nome: string, telefone: string): Promise<Cliente>;
  listarEventos(clienteId: number): Promise<EventoSalvo[]>;
  listarClientes(): Promise<Cliente[]>;
  /** Todos os lançamentos, para montar o resumo da lista de clientes. */
  listarTodosEventos(): Promise<(EventoSalvo & { clienteId: number })[]>;
  inserirEvento(clienteId: number, tipo: TipoEvento, quantidade: number): Promise<void>;
  /** Apaga o lançamento mais recente se ele foi feito depois de `desde`. */
  desfazerUltimo(clienteId: number, desde: Date): Promise<boolean>;
};

// ---------- Postgres (Neon) ----------

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS clientes (
     id SERIAL PRIMARY KEY,
     nome TEXT NOT NULL,
     telefone TEXT NOT NULL UNIQUE,
     criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS eventos (
     id SERIAL PRIMARY KEY,
     cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
     tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'resgate')),
     quantidade INTEGER NOT NULL CHECK (quantidade > 0),
     criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS eventos_cliente_idx ON eventos (cliente_id, criado_em)`,
];

function repositorioPostgres(url: string): Repositorio {
  const sql: NeonQueryFunction<false, false> = neon(url);
  let schemaPronto: Promise<unknown> | null = null;

  // Cria as tabelas na primeira vez que o app usa o banco.
  async function pronto() {
    schemaPronto ??= (async () => {
      for (const comando of SCHEMA) await sql.query(comando);
    })().catch((erro) => {
      schemaPronto = null;
      throw erro;
    });
    await schemaPronto;
    return sql;
  }

  const paraCliente = (linha: Record<string, unknown>): Cliente => ({
    id: Number(linha.id),
    nome: String(linha.nome),
    telefone: String(linha.telefone),
  });

  return {
    async buscarCliente(telefone) {
      const db = await pronto();
      const linhas = await db`SELECT id, nome, telefone FROM clientes WHERE telefone = ${telefone}`;
      return linhas[0] ? paraCliente(linhas[0]) : null;
    },
    async criarCliente(nome, telefone) {
      const db = await pronto();
      const linhas = await db`
        INSERT INTO clientes (nome, telefone) VALUES (${nome}, ${telefone})
        ON CONFLICT (telefone) DO UPDATE SET telefone = EXCLUDED.telefone
        RETURNING id, nome, telefone`;
      return paraCliente(linhas[0]);
    },
    async listarEventos(clienteId) {
      const db = await pronto();
      const linhas = await db`
        SELECT id, tipo, quantidade, criado_em FROM eventos
        WHERE cliente_id = ${clienteId} ORDER BY criado_em, id`;
      return linhas.map((l) => ({
        id: Number(l.id),
        tipo: l.tipo as TipoEvento,
        quantidade: Number(l.quantidade),
        criadoEm: new Date(l.criado_em as string),
      }));
    },
    async listarClientes() {
      const db = await pronto();
      const linhas = await db`SELECT id, nome, telefone FROM clientes`;
      return linhas.map(paraCliente);
    },
    async listarTodosEventos() {
      const db = await pronto();
      const linhas = await db`SELECT id, cliente_id, tipo, quantidade, criado_em FROM eventos`;
      return linhas.map((l) => ({
        id: Number(l.id),
        clienteId: Number(l.cliente_id),
        tipo: l.tipo as TipoEvento,
        quantidade: Number(l.quantidade),
        criadoEm: new Date(l.criado_em as string),
      }));
    },
    async inserirEvento(clienteId, tipo, quantidade) {
      const db = await pronto();
      await db`INSERT INTO eventos (cliente_id, tipo, quantidade) VALUES (${clienteId}, ${tipo}, ${quantidade})`;
    },
    async desfazerUltimo(clienteId, desde) {
      const db = await pronto();
      const linhas = await db`
        DELETE FROM eventos WHERE id = (
          SELECT id FROM eventos WHERE cliente_id = ${clienteId}
          ORDER BY criado_em DESC, id DESC LIMIT 1
        ) AND criado_em >= ${desde.toISOString()}
        RETURNING id`;
      return linhas.length > 0;
    },
  };
}

// ---------- Memória (só para testar no computador, sem banco) ----------

function repositorioMemoria(): Repositorio {
  const estado = ((globalThis as { __clubeMemoria?: { clientes: Cliente[]; eventos: (EventoSalvo & { clienteId: number })[] } })
    .__clubeMemoria ??= { clientes: [], eventos: [] });

  return {
    async buscarCliente(telefone) {
      return estado.clientes.find((c) => c.telefone === telefone) ?? null;
    },
    async criarCliente(nome, telefone) {
      const existente = estado.clientes.find((c) => c.telefone === telefone);
      if (existente) return existente;
      const cliente = { id: estado.clientes.length + 1, nome, telefone };
      estado.clientes.push(cliente);
      return cliente;
    },
    async listarEventos(clienteId) {
      return estado.eventos.filter((e) => e.clienteId === clienteId);
    },
    async listarClientes() {
      return [...estado.clientes];
    },
    async listarTodosEventos() {
      return [...estado.eventos];
    },
    async inserirEvento(clienteId, tipo, quantidade) {
      estado.eventos.push({ id: estado.eventos.length + 1, clienteId, tipo, quantidade, criadoEm: new Date() });
    },
    async desfazerUltimo(clienteId, desde) {
      const doCliente = estado.eventos.filter((e) => e.clienteId === clienteId);
      const ultimo = doCliente[doCliente.length - 1];
      if (!ultimo || ultimo.criadoEm < desde) return false;
      estado.eventos.splice(estado.eventos.indexOf(ultimo), 1);
      return true;
    },
  };
}

let repositorio: Repositorio | null = null;

export function repo(): Repositorio {
  if (repositorio) return repositorio;
  const url = process.env.DATABASE_URL;
  if (url) {
    repositorio = repositorioPostgres(url);
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("[clube] DATABASE_URL não definida: usando banco em memória (os dados somem ao reiniciar).");
    repositorio = repositorioMemoria();
  } else {
    throw new Error("DATABASE_URL não configurada. Conecte o banco Neon ao projeto na Vercel.");
  }
  return repositorio;
}
