import Image from "next/image";

const CORES_CONFETE = ["#ffffff", "#f7c6d4", "#efdfc6", "#f2d49b", "#fbe3ea"];

// Posições fixas para o confete ficar igual no servidor e no navegador.
const CONFETES = Array.from({ length: 18 }, (_, i) => ({
  esquerda: (i * 37) % 100,
  atraso: (i % 6) * 0.35,
  duracao: 2.6 + (i % 4) * 0.4,
  cor: CORES_CONFETE[i % CORES_CONFETE.length],
  redondo: i % 3 === 0,
}));

type Props = {
  quantidade: number;
  primeiroNome: string;
  /** "cliente": fala com o cliente; "balcao": fala com quem está atendendo. */
  para: "cliente" | "balcao";
};

export function PremioConquistado({ quantidade, primeiroNome, para }: Props) {
  const fatias = quantidade === 1 ? "1 fatia grátis" : `${quantidade} fatias grátis`;

  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rosa-400 via-rosa-500 to-rosa-600 px-5 pb-6 pt-7 text-center text-white shadow-[0_12px_40px_-12px_rgba(150,50,81,0.7)] ring-4 ring-white"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {CONFETES.map((c, i) => (
          <span
            key={i}
            className="confete absolute top-0 block"
            style={{
              left: `${c.esquerda}%`,
              width: c.redondo ? 8 : 6,
              height: c.redondo ? 8 : 12,
              borderRadius: c.redondo ? "9999px" : "2px",
              background: c.cor,
              animationDelay: `${c.atraso}s`,
              animationDuration: `${c.duracao}s`,
            }}
          />
        ))}
      </div>

      <div className="relative">
        <p className="font-titulo text-sm uppercase tracking-[0.2em] text-rosa-100">Cartão completo</p>
        <Image
          src="/logo.svg"
          alt=""
          width={96}
          height={96}
          className="pulo-premio mx-auto mt-3 rounded-full ring-4 ring-white/70"
        />
        <h2 className="mt-4 font-titulo text-2xl font-semibold">
          {para === "cliente" ? `Parabéns, ${primeiroNome}! 🎉` : `${primeiroNome} tem prêmio! 🎉`}
        </h2>
        <p className="mt-1 text-rosa-50">{para === "cliente" ? "Você ganhou" : "Disponível para entregar"}</p>
        <p className="font-titulo text-4xl font-bold leading-tight drop-shadow-sm">{fatias}</p>
        <p className="mx-auto mt-4 w-fit rounded-full bg-white px-4 py-2 font-titulo text-rosa-600">
          {para === "cliente" ? "Mostre esta tela para retirar 🍮" : "Use o botão “Entregar fatia grátis” abaixo"}
        </p>
      </div>
    </section>
  );
}
