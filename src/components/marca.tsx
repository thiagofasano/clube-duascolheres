import Image from "next/image";

export function Marca({ subtitulo }: { subtitulo?: string }) {
  return (
    <header className="text-center">
      <Image
        src="/logo.svg"
        alt=""
        width={72}
        height={72}
        priority
        className="mx-auto rounded-full shadow-md ring-4 ring-white"
      />
      <h1 className="mt-3 font-titulo text-3xl font-semibold text-rosa-600">Clube Duas Colheres</h1>
      <p className="font-titulo text-lg text-cacau">Feito para adoçar momentos.</p>
      {subtitulo && <p className="mt-2 text-cacau-suave">{subtitulo}</p>}
    </header>
  );
}

export const INSTAGRAM = "duascolherespudim";

export function LinkInstagram() {
  return (
    <a
      href={`https://www.instagram.com/${INSTAGRAM}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-titulo text-rosa-600 shadow-sm ring-1 ring-rosa-100 transition hover:bg-rosa-50"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
      @{INSTAGRAM}
    </a>
  );
}
