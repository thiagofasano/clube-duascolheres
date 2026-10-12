import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { estaLogado } from "@/lib/auth";
import { Marca } from "@/components/marca";
import { listarClientes } from "@/app/actions";
import { Login } from "./login";
import { PainelBalcao } from "./painel";

export const metadata: Metadata = {
  title: "Balcão · Clube Duas Colheres",
  robots: { index: false, follow: false },
};

export default function BalcaoPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <Marca subtitulo="Área do balcão" />
      <Suspense fallback={<p className="text-center text-cacau-suave">Carregando...</p>}>
        <Acesso />
      </Suspense>
    </main>
  );
}

async function Acesso() {
  // A lista calcula a validade dos selos com a data de agora: precisa ser montada a cada acesso.
  await connection();
  if (!(await estaLogado())) return <Login />;
  const lista = await listarClientes();
  return <PainelBalcao clientesIniciais={lista.ok ? lista.dados : []} />;
}
