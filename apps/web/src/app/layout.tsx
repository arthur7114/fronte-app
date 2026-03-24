import type { Metadata } from "next";
import { Newsreader, Roboto } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Super",
  description: "Operacao editorial com automacao, fluxo de conteudo e painel SaaS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${newsreader.variable} ${roboto.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
