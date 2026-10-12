"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { entrarNoBalcao } from "../actions";

export function Login() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, iniciar] = useTransition();

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    iniciar(async () => {
      const resultado = await entrarNoBalcao(senha);
      if (resultado.ok) router.refresh();
      else setErro(resultado.erro);
    });
  }

  return (
    <form onSubmit={enviar} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rosa-100">
      <label htmlFor="senha" className="font-titulo text-lg text-cacau">
        Senha da loja
      </label>
      <input
        id="senha"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="mt-3 w-full rounded-2xl border-2 border-bege-200 bg-bege-50 px-4 py-3 text-lg outline-none focus:border-rosa-400"
      />
      {erro && <p className="mt-3 text-sm text-rosa-700">{erro}</p>}
      <button
        type="submit"
        disabled={carregando}
        className="mt-4 w-full rounded-2xl bg-rosa-500 py-3 font-titulo text-lg text-white transition hover:bg-rosa-600 disabled:opacity-60"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
