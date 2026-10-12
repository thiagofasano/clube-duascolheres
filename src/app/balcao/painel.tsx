"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CampoTelefone } from "@/components/campo-telefone";
import { CartaoSelos, formatarData } from "@/components/cartao-selos";
import { HistoricoConquistas } from "@/components/historico-conquistas";
import { PremioConquistado } from "@/components/premio-conquistado";
import { formatarTelefone, normalizarTelefone, SELOS_POR_PREMIO } from "@/lib/fidelidade";
import {
  buscarCliente,
  cadastrarCliente,
  desfazerUltimo,
  listarClientes,
  registrarCompra,
  resgatarPremio,
  sairDoBalcao,
  type CartaoBalcao,
  type ResumoCliente,
  type Resultado,
} from "../actions";

type Aviso = { tipo: "sucesso" | "erro" | "festa"; texto: string };

const botaoPrimario =
  "rounded-2xl bg-rosa-500 px-5 py-3 font-titulo text-lg text-white transition hover:bg-rosa-600 disabled:opacity-60";
const botaoSecundario =
  "rounded-2xl border-2 border-bege-300 bg-white px-4 py-2 font-titulo text-cacau transition hover:border-rosa-300 disabled:opacity-60";

type Tela =
  | { tipo: "lista" }
  | { tipo: "cadastro"; telefone: string }
  | { tipo: "cliente"; cartao: CartaoBalcao };

export function PainelBalcao({ clientesIniciais }: { clientesIniciais: ResumoCliente[] }) {
  const router = useRouter();
  const [clientes, setClientes] = useState(clientesIniciais);
  const [tela, setTela] = useState<Tela>({ tipo: "lista" });
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [carregando, iniciar] = useTransition();

  // Executa uma ação no servidor tratando erros e sessão expirada.
  function executar<T>(acao: () => Promise<Resultado<T>>, aoConcluir: (dados: T) => void) {
    iniciar(async () => {
      try {
        const resultado = await acao();
        if (resultado.ok) aoConcluir(resultado.dados);
        else setAviso({ tipo: "erro", texto: resultado.erro });
      } catch {
        setAviso({ tipo: "erro", texto: "Sessão expirada ou erro no servidor. Entre novamente." });
        router.refresh();
      }
    });
  }

  function mostrarCartao(cartao: CartaoBalcao, novoAviso: Aviso | null) {
    setTela({ tipo: "cliente", cartao });
    setAviso(novoAviso);
  }

  function voltarParaLista() {
    setTela({ tipo: "lista" });
    setAviso(null);
    // Recarrega a lista para refletir compras e cadastros feitos agora.
    executar(listarClientes, setClientes);
  }

  function abrirCliente(cliente: ResumoCliente) {
    setAviso(null);
    executar(
      () => buscarCliente(cliente.telefone),
      ({ cartao }) => (cartao ? mostrarCartao(cartao, null) : setAviso({ tipo: "erro", texto: "Cliente não encontrado." })),
    );
  }

  function abrirCadastro(telefone: string) {
    setTela({ tipo: "cadastro", telefone });
    setAviso(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {tela.tipo === "lista" ? (
        <ListaClientes
          clientes={clientes}
          carregando={carregando}
          aoAbrir={abrirCliente}
          aoCadastrar={abrirCadastro}
        />
      ) : tela.tipo === "cliente" ? (
        <Cliente
          cartao={tela.cartao}
          carregando={carregando}
          aoTrocar={voltarParaLista}
          aoRegistrar={(quantidade) =>
            executar(
              () => registrarCompra(tela.cartao.telefone, quantidade),
              (cartao) => {
                const ganhou = cartao.premiosGanhos - tela.cartao.premiosGanhos;
                mostrarCartao(
                  cartao,
                  ganhou > 0
                    ? { tipo: "festa", texto: `🎉 Cartão completo! ${cartao.primeiroNome} ganhou ${ganhou === 1 ? "1 fatia grátis" : `${ganhou} fatias grátis`}.` }
                    : { tipo: "sucesso", texto: `+${quantidade} ${quantidade === 1 ? "selo registrado" : "selos registrados"}.` },
                );
              },
            )
          }
          aoResgatar={() => {
            if (!confirm(`Entregar 1 fatia grátis para ${tela.cartao.primeiroNome}?`)) return;
            executar(
              () => resgatarPremio(tela.cartao.telefone),
              (cartao) => mostrarCartao(cartao, { tipo: "sucesso", texto: "Fatia grátis entregue. Bom apetite! 🍮" }),
            );
          }}
          aoDesfazer={() => {
            if (!confirm("Desfazer o último lançamento deste cliente?")) return;
            executar(
              () => desfazerUltimo(tela.cartao.telefone),
              (cartao) => mostrarCartao(cartao, { tipo: "sucesso", texto: "Último lançamento desfeito." }),
            );
          }}
        />
      ) : (
        <Cadastro
          telefoneInicial={tela.telefone}
          carregando={carregando}
          aoCancelar={voltarParaLista}
          aoCadastrar={(nome, telefone, consentiu) =>
            executar(
              () => cadastrarCliente(nome, telefone, consentiu),
              (cartao) => mostrarCartao(cartao, { tipo: "sucesso", texto: "Cliente cadastrado! Agora registre a compra." }),
            )
          }
        />
      )}

      {aviso && (
        <p
          role="status"
          className={`sticky top-3 z-10 order-first rounded-2xl px-4 py-3 text-center shadow-md ${
            aviso.tipo === "erro"
              ? "bg-white text-rosa-700 ring-2 ring-rosa-300"
              : aviso.tipo === "festa"
                ? "bg-rosa-500 font-titulo text-lg text-white"
                : "bg-white text-cacau ring-1 ring-bege-300"
          }`}
        >
          {aviso.texto}
        </p>
      )}

      <button
        type="button"
        onClick={() => iniciar(async () => { await sairDoBalcao(); router.refresh(); })}
        className="mx-auto mt-4 text-sm text-cacau-suave underline underline-offset-4"
      >
        Sair do balcão
      </button>
    </div>
  );
}

function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function ListaClientes({
  clientes,
  carregando,
  aoAbrir,
  aoCadastrar,
}: {
  clientes: ResumoCliente[];
  carregando: boolean;
  aoAbrir: (cliente: ResumoCliente) => void;
  aoCadastrar: (telefone: string) => void;
}) {
  const [filtro, setFiltro] = useState("");
  const termo = semAcento(filtro.trim());
  const digitos = filtro.replace(/\D/g, "");
  const visiveis = clientes.filter(
    (c) => !termo || semAcento(c.nome).includes(termo) || (digitos && c.telefone.includes(digitos)),
  );
  // Digitou um celular completo que não está na lista: oferece o cadastro com o número preenchido.
  const celularNovo = normalizarTelefone(filtro);
  const oferecerCadastro = celularNovo && !clientes.some((c) => c.telefone === celularNovo);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rosa-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-titulo text-lg text-cacau">Clientes</h2>
          <p className="text-sm text-cacau-suave">
            {clientes.length} {clientes.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>
        <button type="button" onClick={() => aoCadastrar("")} className={`${botaoPrimario} shrink-0 px-4 py-2 text-base`}>
          + Novo cliente
        </button>
      </div>

      <input
        type="search"
        autoFocus
        aria-label="Buscar cliente por nome ou celular"
        placeholder="Buscar por nome ou celular"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mt-4 w-full rounded-2xl border-2 border-bege-200 bg-bege-50 px-4 py-3 text-lg outline-none placeholder:text-bege-400 focus:border-rosa-400"
      />

      {oferecerCadastro && (
        <button
          type="button"
          onClick={() => aoCadastrar(celularNovo)}
          className="mt-3 w-full rounded-2xl border-2 border-dashed border-rosa-300 bg-rosa-50 py-3 font-titulo text-rosa-600 transition hover:bg-rosa-100"
        >
          + Cadastrar {formatarTelefone(celularNovo)}
        </button>
      )}

      {clientes.length === 0 ? (
        <p className="mt-3 text-sm text-cacau-suave">
          Nenhum cliente ainda. Toque em “+ Novo cliente” para fazer o primeiro cadastro.
        </p>
      ) : (
        <>
          <ul className="mt-3 max-h-[28rem] divide-y divide-bege-200 overflow-y-auto">
            {visiveis.map((c) => (
              <li key={c.telefone}>
                <button
                  type="button"
                  disabled={carregando}
                  onClick={() => aoAbrir(c)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left transition hover:bg-rosa-50 disabled:opacity-60"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-cacau">{c.nome}</span>
                    <span className="block text-sm text-cacau-suave">{c.telefoneFormatado}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-sm">
                    {c.premiosDisponiveis > 0 && (
                      <span className="rounded-full bg-rosa-500 px-2 py-0.5 text-white" title="Fatias grátis disponíveis">
                        🎁 {c.premiosDisponiveis}
                      </span>
                    )}
                    <span className="rounded-full bg-bege-100 px-2 py-0.5 text-cacau ring-1 ring-bege-300">
                      🍮 {c.selos}/{SELOS_POR_PREMIO}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {visiveis.length === 0 && <li className="py-3 text-sm text-cacau-suave">Nenhum cliente encontrado.</li>}
          </ul>
        </>
      )}
    </section>
  );
}

function Cliente({
  cartao,
  carregando,
  aoTrocar,
  aoRegistrar,
  aoResgatar,
  aoDesfazer,
}: {
  cartao: CartaoBalcao;
  carregando: boolean;
  aoTrocar: () => void;
  aoRegistrar: (quantidade: number) => void;
  aoResgatar: () => void;
  aoDesfazer: () => void;
}) {
  const [quantidade, setQuantidade] = useState(1);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-titulo text-xl text-cacau">{cartao.nome}</p>
          <p className="text-sm text-cacau-suave">{cartao.telefoneFormatado}</p>
        </div>
        <button type="button" onClick={aoTrocar} className={botaoSecundario}>
          Outro cliente
        </button>
      </div>

      {cartao.premiosDisponiveis > 0 && (
        <PremioConquistado quantidade={cartao.premiosDisponiveis} primeiroNome={cartao.primeiroNome} para="balcao" />
      )}

      <CartaoSelos
        key={`${cartao.selos}-${cartao.premiosDisponiveis}`}
        selos={cartao.selos}
        selosPorPremio={cartao.selosPorPremio}
        premiosDisponiveis={cartao.premiosDisponiveis}
        venceEm={cartao.venceEm}
      />

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rosa-100">
        <p className="font-titulo text-lg text-cacau">Registrar compra</p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Menos uma fatia"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            className="h-12 w-12 rounded-full bg-bege-100 font-titulo text-2xl text-cacau ring-1 ring-bege-300"
          >
            −
          </button>
          <p className="w-16 text-center font-titulo text-4xl text-cacau" aria-live="polite">
            {quantidade}
          </p>
          <button
            type="button"
            aria-label="Mais uma fatia"
            onClick={() => setQuantidade((q) => Math.min(50, q + 1))}
            className="h-12 w-12 rounded-full bg-bege-100 font-titulo text-2xl text-cacau ring-1 ring-bege-300"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={carregando}
          onClick={() => {
            aoRegistrar(quantidade);
            setQuantidade(1);
          }}
          className={`${botaoPrimario} mt-4 w-full`}
        >
          {carregando ? "Salvando..." : `Registrar ${quantidade} ${quantidade === 1 ? "fatia" : "fatias"}`}
        </button>

        {cartao.premiosDisponiveis > 0 && (
          <button
            type="button"
            disabled={carregando}
            onClick={aoResgatar}
            className="mt-3 w-full rounded-2xl border-2 border-rosa-400 bg-rosa-50 py-3 font-titulo text-lg text-rosa-600 transition hover:bg-rosa-100 disabled:opacity-60"
          >
            🎁 Entregar fatia grátis
          </button>
        )}

        {cartao.podeDesfazer && (
          <button type="button" disabled={carregando} onClick={aoDesfazer} className={`${botaoSecundario} mt-3 w-full text-sm`}>
            Desfazer último lançamento
          </button>
        )}
      </div>

      <HistoricoConquistas conquistas={cartao.conquistas} />

      {cartao.historico.length > 0 && (
        <details className="rounded-3xl bg-bege-50 p-5 ring-1 ring-bege-200">
          <summary className="cursor-pointer font-titulo text-cacau">Histórico de lançamentos</summary>
          <ul className="mt-3 divide-y divide-bege-200 text-sm">
            {cartao.historico.map((e) => (
              <li key={e.id} className="flex justify-between py-2">
                <span>
                  {e.tipo === "compra"
                    ? `🍮 Compra de ${e.quantidade} ${e.quantidade === 1 ? "fatia" : "fatias"}`
                    : "🎁 Fatia grátis entregue"}
                </span>
                <span className="text-cacau-suave">
                  {formatarData(e.criadoEm)}{" "}
                  {new Date(e.criadoEm).toLocaleTimeString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function Cadastro({
  telefoneInicial,
  carregando,
  aoCancelar,
  aoCadastrar,
}: {
  telefoneInicial: string;
  carregando: boolean;
  aoCancelar: () => void;
  aoCadastrar: (nome: string, telefone: string, consentiu: boolean) => void;
}) {
  const [telefone, setTelefone] = useState(telefoneInicial ? formatarTelefone(telefoneInicial) : "");
  const [nome, setNome] = useState("");
  const [consentiu, setConsentiu] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        aoCadastrar(nome, telefone, consentiu);
      }}
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rosa-100"
    >
      <p className="font-titulo text-lg text-cacau">Novo cliente</p>

      <label htmlFor="telefone-cadastro" className="mt-4 block text-sm font-semibold">
        Celular
      </label>
      <div className="mt-1">
        <CampoTelefone id="telefone-cadastro" valor={telefone} aoMudar={setTelefone} autoFoco={!telefoneInicial} />
      </div>

      <label htmlFor="nome" className="mt-4 block text-sm font-semibold">
        Nome
      </label>
      <input
        id="nome"
        autoFocus={!!telefoneInicial}
        required
        maxLength={80}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="mt-1 w-full rounded-2xl border-2 border-bege-200 bg-bege-50 px-4 py-3 text-lg outline-none focus:border-rosa-400"
      />

      <label className="mt-4 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consentiu}
          onChange={(e) => setConsentiu(e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-rosa-500"
        />
        <span>O cliente autoriza o uso do nome e celular apenas para o programa de fidelidade (LGPD).</span>
      </label>

      <div className="mt-5 flex gap-2">
        <button type="button" onClick={aoCancelar} className={botaoSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={carregando || !consentiu} className={`${botaoPrimario} flex-1`}>
          {carregando ? "Salvando..." : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
