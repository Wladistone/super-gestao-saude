"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const routeNames: Record<string, string> = {
    cadastro: "Cadastro & Autorização SG",
    tramitacao: "Tramitação & Governança",
    solicitacoes: "Solicitações",
    processos: "Processos Licitatórios & PCA",
    contratos: "Atas & Contratos Reativos",
    frotas: "Frotas, TFD & Combustíveis",
    orcamento: "Orçamento & Créditos Adicionais",
    judicializacao: "Judicialização da Saúde",
    ti: "Parque Tecnológico de TI",
  };

  return (
    <nav className="flex items-center text-xs text-slate-500 font-medium">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-slate-800 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Início</span>
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const displayName = routeNames[segment] || segment;

        return (
          <div key={href} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-slate-400" />
            {isLast ? (
              <span className="text-slate-900 font-semibold">{displayName}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-slate-800 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
