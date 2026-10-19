import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "SuperGestão Saúde - Secretaria Municipal de Saúde",
  description:
    "Plataforma integrada de gestão para licitações, orçamento, contratos, frotas e transporte sanitário, parque de TI e judicialização da saúde pública sob a Lei Federal nº 14.133/2021.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-slate-50 antialiased selection:bg-sky-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
