import { formatarData } from "./cartao-selos";

type Props = {
  conquistas: { conquistadaEm: string; resgatadaEm: string | null }[];
};

export function HistoricoConquistas({ conquistas }: Props) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rosa-100">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-titulo text-lg text-cacau">Fatias grátis conquistadas</h2>
        <span className="text-sm text-cacau-suave">{conquistas.length}</span>
      </div>

      {conquistas.length === 0 ? (
        <p className="mt-2 text-sm text-cacau-suave">
          Ainda nenhuma. Complete os 12 selos para ganhar a primeira! 🍮
        </p>
      ) : (
        <ol className="mt-3 divide-y divide-bege-200 text-sm">
          {conquistas.map((c, i) => (
            <li key={`${c.conquistadaEm}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
              <span>
                🎁 Fatia nº {conquistas.length - i}
                <span className="block text-cacau-suave">Ganha em {formatarData(c.conquistadaEm)}</span>
              </span>
              {c.resgatadaEm ? (
                <span className="shrink-0 rounded-full bg-bege-100 px-2.5 py-0.5 text-cacau ring-1 ring-bege-300">
                  Entregue em {formatarData(c.resgatadaEm)}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-rosa-500 px-2.5 py-0.5 text-white">Disponível</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
