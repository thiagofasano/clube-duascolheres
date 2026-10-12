import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Duas Colheres Pudim · Feito para adoçar momentos.",
  description:
    "Pudins artesanais feitos com amor no Rio de Janeiro. Pudins inteiros nos tamanhos grande e médio e kits para aniversários e casamentos. Entregamos em toda a capital.",
};

export const viewport: Viewport = {
  themeColor: "#e8789a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}>
      <body className="fundo-confeitaria min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
