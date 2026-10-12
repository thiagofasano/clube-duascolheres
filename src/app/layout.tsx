import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clube Duas Colheres · Feito para adoçar momentos.",
  description: "A cada 12 fatias de pudim, a próxima é por nossa conta.",
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
