"use client";

// Aplica a máscara (21) 99999-8888 enquanto a pessoa digita.
function mascarar(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const corte = d.length === 11 ? 7 : 6;
  if (d.length <= corte) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
}

type Props = {
  id: string;
  valor: string;
  aoMudar: (valor: string) => void;
  autoFoco?: boolean;
};

export function CampoTelefone({ id, valor, aoMudar, autoFoco }: Props) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      placeholder="(21) 99999-8888"
      autoFocus={autoFoco}
      required
      value={valor}
      onChange={(e) => aoMudar(mascarar(e.target.value))}
      className="w-full min-w-0 rounded-2xl border-2 border-bege-200 bg-bege-50 px-4 py-3 text-lg text-cacau outline-none placeholder:text-bege-400 focus:border-rosa-400"
    />
  );
}
