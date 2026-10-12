type Props = {
  selos: number;
  selosPorPremio: number;
  premiosDisponiveis: number;
  venceEm: string | null;
  titulo?: string;
};

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function CartaoSelos({ selos, selosPorPremio, premiosDisponiveis, venceEm, titulo }: Props) {
  const faltam = selosPorPremio - selos;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_-12px_rgba(150,50,81,0.35)] ring-1 ring-rosa-100 sm:p-6">
      {titulo && <p className="font-titulo text-lg text-rosa-600">{titulo}</p>}

      <div className="mt-1 flex items-baseline justify-between gap-3">
        <p className="font-titulo text-4xl font-semibold text-cacau">
          {selos}
          <span className="text-2xl text-cacau-suave">/{selosPorPremio}</span>
        </p>
        <p className="text-right text-sm text-cacau-suave">
          {faltam === selosPorPremio
            ? premiosDisponiveis > 0
              ? "Novo cartão: bora juntar de novo!"
              : "Comece seu cartão!"
            : `Faltam ${faltam} ${faltam === 1 ? "fatia" : "fatias"} para ganhar 1`}
        </p>
      </div>

      <ol className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3" aria-label={`${selos} de ${selosPorPremio} selos`}>
        {Array.from({ length: selosPorPremio }, (_, i) => {
          const marcado = i < selos;
          const ultimo = i === selosPorPremio - 1;
          return (
            <li
              key={i}
              className={`flex aspect-square items-center justify-center rounded-full text-2xl sm:text-3xl ${
                marcado
                  ? "bg-rosa-100 ring-2 ring-rosa-400"
                  : ultimo
                    ? "border-2 border-dashed border-rosa-300 bg-rosa-50 text-base font-titulo text-rosa-500"
                    : "border-2 border-dashed border-bege-300 bg-bege-50"
              }`}
            >
              {marcado ? (
                <span className="animar-carimbo" style={{ animationDelay: `${i * 40}ms` }} aria-hidden>
                  🍮
                </span>
              ) : ultimo ? (
                "grátis"
              ) : null}
            </li>
          );
        })}
      </ol>

      {venceEm && selos > 0 && (
        <p className="mt-3 text-center text-sm text-cacau-suave">
          Seus selos são válidos até <strong className="text-cacau">{formatarData(venceEm)}</strong>
        </p>
      )}
    </div>
  );
}
