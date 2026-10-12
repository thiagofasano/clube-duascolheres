"use client";

import { useState, useTransition } from "react";
import { CartaoSelos } from "@/components/cartao-selos";
import { CampoTelefone } from "@/components/campo-telefone";
import { HistoricoConquistas } from "@/components/historico-conquistas";
import { PremioConquistado } from "@/components/premio-conquistado";
import { consultarCartao, type CartaoPublico } from "./actions";

export function ConsultaCartao() {
  const [telefone, setTelefone] = useState("");
  const [cartao, setCartao] = useState<CartaoPublico | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, iniciar] = useTransition();

  function consultar(evento: React.FormEvent) {
    evento.preventDefault();
    iniciar(async () => {
      const resultado = await consultarCartao(telefone);
      setCartao(resultado.ok ? resultado.dados : null);
      setErro(resultado.ok ? null : resultado.erro);
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <form onSubmit={consultar} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rosa-100">
        <label htmlFor="telefone" className="font-titulo text-lg text-cacau">
          Consulte seu cartão
        </label>
        <div className="mt-3 flex gap-2">
          <CampoTelefone id="telefone" valor={telefone} aoMudar={setTelefone} />
          <button
            type="submit"
            disabled={carregando}
            className="shrink-0 rounded-2xl bg-rosa-500 px-5 font-titulo text-white transition hover:bg-rosa-600 disabled:opacity-60"
          >
            {carregando ? "..." : "Ver"}
          </button>
        </div>
        {erro && <p className="mt-3 text-sm text-rosa-700">{erro}</p>}
      </form>

      {cartao && cartao.premiosDisponiveis > 0 && (
        <PremioConquistado quantidade={cartao.premiosDisponiveis} primeiroNome={cartao.primeiroNome} para="cliente" />
      )}

      {cartao && (
        <CartaoSelos
          key={`${cartao.selos}-${cartao.premiosDisponiveis}`}
          titulo={`Olá, ${cartao.primeiroNome}!`}
          selos={cartao.selos}
          selosPorPremio={cartao.selosPorPremio}
          premiosDisponiveis={cartao.premiosDisponiveis}
          venceEm={cartao.venceEm}
        />
      )}

      {cartao && cartao.conquistas.length > 0 && <HistoricoConquistas conquistas={cartao.conquistas} />}
    </section>
  );
}
