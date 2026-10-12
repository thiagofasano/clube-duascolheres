import { LinkInstagram, Marca } from "@/components/marca";
import { ConsultaCartao } from "./consulta-cartao";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <Marca subtitulo="A cada 12 fatias, a próxima é por nossa conta." />

      <ConsultaCartao />

      <section className="rounded-3xl bg-bege-50 p-5 text-sm ring-1 ring-bege-200">
        <h2 className="font-titulo text-lg text-rosa-600">Como funciona</h2>
        <ul className="mt-2 space-y-2 text-cacau">
          <li>🥄 Informe seu celular na hora de cada compra.</li>
          <li>🍮 Cada fatia comprada vale 1 selo. Juntou 12, ganhou 1 fatia grátis.</li>
          <li>⏳ Os selos valem por 6 meses a partir do primeiro selo do cartão.</li>
          <li>🎁 A fatia grátis conquistada não vence. É só pedir no balcão.</li>
        </ul>
      </section>

      <footer className="mt-auto flex flex-col items-center gap-2 pt-4 text-sm text-cacau-suave">
        <span>Siga a gente no Instagram</span>
        <LinkInstagram />
      </footer>
    </main>
  );
}
