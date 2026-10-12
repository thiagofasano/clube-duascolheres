import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "balcao";
const DURACAO_SEGUNDOS = 60 * 60 * 24 * 30;

function senhaConfigurada(): string {
  const senha = process.env.ADMIN_PASSWORD;
  if (senha) return senha;
  if (process.env.NODE_ENV !== "production") return "pudim";
  throw new Error("ADMIN_PASSWORD não configurada na Vercel.");
}

// O token depende da senha: trocar a senha desloga todos os aparelhos.
function tokenEsperado(): string {
  return createHmac("sha256", senhaConfigurada()).update("clube-duas-colheres:balcao").digest("hex");
}

function iguais(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function estaLogado(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  return !!token && iguais(token, tokenEsperado());
}

export async function exigirLogin(): Promise<void> {
  if (!(await estaLogado())) throw new Error("Acesso não autorizado.");
}

export async function entrar(senha: string): Promise<boolean> {
  if (!iguais(senha, senhaConfigurada())) return false;
  (await cookies()).set(COOKIE, tokenEsperado(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
  return true;
}

export async function sair(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
