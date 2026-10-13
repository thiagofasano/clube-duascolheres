import Image from "next/image";
import Link from "next/link";
import { IconeInstagram } from "@/components/marca";
import { INSTAGRAM, LINK_INSTAGRAM, linkWhatsapp, NOME_LOJA, SLOGAN, TELEFONE_FORMATADO } from "@/lib/loja";
import fotoDestaque from "../../public/pudim2.jpeg";
import fotoHistoria from "../../public/pudim1.jpg";
import fotoKit from "../../public/kit.jpg";

const PUDINS = [
  {
    nome: "Pudim grande",
    texto: "Para reunir a família toda e garantir que ninguém fique sem repetir.",
    foto: fotoDestaque,
    mensagem: "Olá! Gostaria de encomendar um pudim GRANDE 🍮",
  },
  {
    nome: "Pudim médio",
    texto: "Perfeito para o almoço de domingo, um encontro entre amigos ou um mimo especial.",
    foto: fotoHistoria,
    mensagem: "Olá! Gostaria de encomendar um pudim MÉDIO 🍮",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <Cabecalho />

      <main className="flex flex-1 flex-col">
        {/* Destaque */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pb-16 pt-6 md:grid-cols-2 md:gap-12 md:pt-12">
          <div className="order-2 text-center md:order-1 md:text-left">
            <p className="font-titulo text-sm uppercase tracking-[0.2em] text-rosa-500">Pudim artesanal · Rio de Janeiro</p>
            <h1 className="mt-3 font-titulo text-4xl font-semibold leading-tight text-cacau sm:text-5xl">
              {SLOGAN.replace(".", "")}
              <span className="text-rosa-500">.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-cacau-suave md:mx-0">
              Pudins inteiros sob encomenda, cremosos e de calda brilhante, feitos com muito amor e dedicação para
              festas, casamentos e dias especiais. Entregamos em toda a capital do Rio.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <BotaoWhatsapp>Fazer pedido</BotaoWhatsapp>
              <a
                href="#pudins"
                className="rounded-full border-2 border-bege-300 bg-white px-6 py-3 font-titulo text-lg text-cacau transition hover:border-rosa-300"
              >
                Ver nossos pudins
              </a>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-md md:order-2">
            <div aria-hidden className="absolute -inset-3 rotate-3 rounded-[2.5rem] bg-rosa-200" />
            <Image
              src={fotoDestaque}
              alt="Pudim inteiro com calda de caramelo sobre prato de vidro, numa mesa de madeira no jardim"
              priority
              placeholder="blur"
              sizes="(min-width: 768px) 28rem, 100vw"
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-xl ring-4 ring-white"
            />
          </div>
        </section>

        {/* Nossa história */}
        <section id="historia" className="scroll-mt-20 bg-white/80 py-16">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 md:grid-cols-[2fr_3fr]">
            <Image
              src={fotoHistoria}
              alt="Pudim com calda de caramelo sobre a mesa, com a cidade ao fundo"
              placeholder="blur"
              sizes="(min-width: 768px) 24rem, 100vw"
              className="mx-auto aspect-[3/4] w-full max-w-sm rounded-[2rem] object-cover shadow-lg ring-4 ring-bege-100"
            />
            <div>
              <p className="font-titulo text-sm uppercase tracking-[0.2em] text-rosa-500">Nossa história</p>
              <h2 className="mt-2 font-titulo text-3xl font-semibold text-cacau sm:text-4xl">
                Duas amigas, uma receita e muitas colheradas de amor
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-cacau">
                <p>
                  A Duas Colheres nasceu da amizade de duas amigas cristãs que sempre acreditaram que as melhores
                  coisas da vida acontecem ao redor da mesa. Em cada confraternização, almoço de família ou encontro
                  da igreja, havia uma presença garantida: o pudim.
                </p>
                <p>
                  Ele chegava, a conversa ficava mais doce e, colherada após colherada, vinham os elogios:
                  &ldquo;Vocês precisam vender isso!&rdquo;. De tanto carinho e incentivo, a ideia criou coragem e
                  virou missão: levar a nossa receita para mais mesas, mais famílias e mais celebrações.
                </p>
                <p>
                  Além do segredo da receita, cada pudim leva o ingrediente que nunca falta por aqui: muito amor e
                  dedicação. Porque, para nós, servir também é uma forma de cuidar.
                </p>
              </div>
              <blockquote className="mt-6 border-l-4 border-rosa-300 pl-4 font-titulo text-xl text-rosa-600">
                &ldquo;Façam tudo com amor.&rdquo;
                <cite className="mt-1 block text-sm not-italic text-cacau-suave">1 Coríntios 16:14</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Pudins */}
        <section id="pudins" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16">
          <div className="text-center">
            <p className="font-titulo text-sm uppercase tracking-[0.2em] text-rosa-500">Nossos pudins</p>
            <h2 className="mt-2 font-titulo text-3xl font-semibold text-cacau sm:text-4xl">Pudim inteiro, do jeito que tem que ser</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-cacau-suave">
              Feitos sob encomenda, em dois tamanhos. Consulte valores e disponibilidade pelo WhatsApp.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {PUDINS.map((p) => (
              <article key={p.nome} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-rosa-100">
                <Image
                  src={p.foto}
                  alt={`${p.nome} da Duas Colheres`}
                  placeholder="blur"
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-titulo text-2xl font-semibold text-cacau">{p.nome}</h3>
                  <p className="mt-2 text-cacau-suave">{p.texto}</p>
                  <BotaoWhatsapp mensagem={p.mensagem} className="mt-5 w-full justify-center">
                    Encomendar
                  </BotaoWhatsapp>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Kits */}
        <section id="kits" className="scroll-mt-20 bg-rosa-50 py-16">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <p className="font-titulo text-sm uppercase tracking-[0.2em] text-rosa-500">Kits para festas</p>
              <h2 className="mt-2 font-titulo text-3xl font-semibold text-cacau sm:text-4xl">
                Aniversários e casamentos mais doces
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-cacau">
                Montamos kits de pudim com acabamento caprichado, perfeitos para lembrancinhas, mesas de doces e
                presentes. Cada detalhe é pensado para combinar com o seu grande dia.
              </p>
              <ul className="mt-5 space-y-2 text-lg text-cacau">
                <li>🎂 Aniversários</li>
                <li>💍 Casamentos</li>
                <li>🎁 Presentes e datas especiais</li>
              </ul>
              <BotaoWhatsapp
                mensagem="Olá! Gostaria de saber mais sobre os kits de pudim para festa 🎉"
                className="mt-7"
              >
                Montar meu kit
              </BotaoWhatsapp>
            </div>
            <Image
              src={fotoKit}
              alt="Kit presente com quatro potinhos de pudim em caixa transparente com laço rosa"
              placeholder="blur"
              sizes="(min-width: 768px) 28rem, 100vw"
              className="order-1 mx-auto aspect-[4/5] w-full max-w-md rounded-[2rem] object-cover shadow-lg ring-4 ring-white md:order-2"
            />
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="scroll-mt-20 bg-white/80 py-16">
          <div className="mx-auto w-full max-w-6xl px-4 text-center">
            <p className="font-titulo text-sm uppercase tracking-[0.2em] text-rosa-500">Onde estamos</p>
            <h2 className="mt-2 font-titulo text-3xl font-semibold text-cacau sm:text-4xl">Rio de Janeiro, com entrega em toda a capital</h2>
            <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
              <Contato titulo="Pedidos e WhatsApp" href={linkWhatsapp()} texto={TELEFONE_FORMATADO} externo />
              <Contato titulo="Instagram" href={LINK_INSTAGRAM} texto={`@${INSTAGRAM}`} externo />
              <Contato titulo="Atendimento" texto="Toda a capital do Rio de Janeiro" />
            </div>
            <BotaoWhatsapp className="mt-8">Pedir agora</BotaoWhatsapp>
          </div>
        </section>
      </main>

      <footer className="border-t border-bege-200 bg-bege-100 py-8 text-center text-sm text-cacau-suave">
        <p className="font-titulo text-base text-cacau">{NOME_LOJA}</p>
        <p>{SLOGAN}</p>
      </footer>

      {/* Botão flutuante de WhatsApp no celular */}
      <a
        href={linkWhatsapp()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pedir pelo WhatsApp"
        className="fixed bottom-4 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg ring-4 ring-white transition hover:scale-105 md:hidden"
      >
        <IconeWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
}

function Cabecalho() {
  const links = [
    { href: "#historia", texto: "Nossa história" },
    { href: "#pudins", texto: "Pudins" },
    { href: "#kits", texto: "Kits" },
    { href: "#contato", texto: "Contato" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-bege-200/70 bg-bege-100/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="" width={40} height={40} className="rounded-full ring-2 ring-white" />
          <span className="whitespace-nowrap font-titulo text-xl font-semibold text-rosa-600">Duas Colheres</span>
        </Link>
        <nav aria-label="Seções" className="ml-auto mr-4 hidden items-center gap-6 font-titulo text-cacau md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-rosa-600">
              {l.texto}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={LINK_INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Duas Colheres"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rosa-600 ring-1 ring-rosa-100 transition hover:bg-rosa-50"
          >
            <IconeInstagram />
          </a>
        </div>
      </div>
    </header>
  );
}

function BotaoWhatsapp({
  children,
  mensagem,
  className = "",
}: {
  children: React.ReactNode;
  mensagem?: string;
  className?: string;
}) {
  return (
    <a
      href={linkWhatsapp(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full bg-rosa-500 px-6 py-3 font-titulo text-lg text-white shadow-sm transition hover:bg-rosa-600 ${className}`}
    >
      <IconeWhatsapp className="h-5 w-5" />
      {children}
    </a>
  );
}

function Contato({ titulo, texto, href, externo }: { titulo: string; texto: string; href?: string; externo?: boolean }) {
  const conteudo = (
    <>
      <span className="block text-sm text-cacau-suave">{titulo}</span>
      <span className="mt-1 block font-titulo text-lg text-cacau">{texto}</span>
    </>
  );
  const estilo = "block rounded-3xl bg-bege-50 p-5 ring-1 ring-bege-200";
  return href ? (
    <a
      href={href}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      className={`${estilo} transition hover:ring-rosa-300`}
    >
      {conteudo}
    </a>
  ) : (
    <div className={estilo}>{conteudo}</div>
  );
}

function IconeWhatsapp({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}
