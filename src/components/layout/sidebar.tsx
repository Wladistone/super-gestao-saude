"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileText,
  FileCheck2,
  Ambulance,
  Coins,
  Scale,
  Server,
  LayoutDashboard,
  ShieldAlert,
  Search,
  UserCheck,
  ChevronRight,
  Inbox,
  ClipboardList,
  LogOut,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { dataStore } from "@/lib/data-store";
import { PermissaoModulo } from "@/lib/types";

interface SidebarProps {
  onOpenSearch?: () => void;
}

interface UsuarioLogadoStorage {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  setor: string;
  perfil: string;
  matricula?: string;
  whatsapp?: string;
  permissoes?: PermissaoModulo[];
}

export function Sidebar({ onOpenSearch }: SidebarProps) {
  const pathname = usePathname();
  const [qtdPendentes, setQtdPendentes] = useState(0);
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogadoStorage | null>(null);

  const carregarUsuario = () => {
    try {
      const salvo = localStorage.getItem("supergestao_usuario_logado");
      if (salvo) {
        let u = JSON.parse(salvo) as UsuarioLogadoStorage;
        const email = (u.email || "").toLowerCase().trim();
        const isDraWillianne = email === "will2026@gmail.com" || u.id === "usr-coord-geral";

        // Saneamento de segurança: se não for Dra. Willianne, remove perfil ADMINISTRADOR e bloqueia cadastro
        if (!isDraWillianne) {
          let modificado = false;
          if (u.perfil === "ADMINISTRADOR") {
            u.perfil = u.setor === "SG" ? "SERVIDOR_SG" : "SERVIDOR_SETORIAL";
            modificado = true;
          }

          // Sincroniza com as permissões da solicitação de cadastro se houver
          const cadReal = dataStore.solicitacoesCadastro.find(
            (c: any) => c.email.toLowerCase().trim() === email || c.id === u.id?.replace(/^usr-/, "")
          );
          if (cadReal && cadReal.permissoes && cadReal.permissoes.length > 0) {
            u.permissoes = cadReal.permissoes.map((p: any) =>
              p.moduloId === "cadastro" ? { ...p, visualizar: false, editar: false } : p
            );
            modificado = true;
          } else if (u.permissoes) {
            u.permissoes = u.permissoes.map((p: any) =>
              p.moduloId === "cadastro" ? { ...p, visualizar: false, editar: false } : p
            );
            modificado = true;
          }

          if (modificado) {
            try {
              localStorage.setItem("supergestao_usuario_logado", JSON.stringify(u));
            } catch {}
          }
        }

        setUsuarioLogado(u);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    carregarUsuario();

    const atualizar = () => {
      setQtdPendentes(dataStore.obterQtdCadastrosPendentes());
      carregarUsuario();
    };
    atualizar();

    window.addEventListener("supergestao_cadastro_atualizado", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("supergestao_cadastro_atualizado", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  // Determina se o usuário ativo é a Coordenadora Geral de Gestão (Dra. Willianne Soares exclusivamente)
  const isCoordenadoraGeral = useMemo(() => {
    if (!usuarioLogado) return true; // Default da sessão institucional

    const email = (usuarioLogado.email || "").toLowerCase().trim();
    const id = (usuarioLogado.id || "").trim();
    const nome = (usuarioLogado.nome || "").toLowerCase().trim();

    return (
      email === "will2026@gmail.com" ||
      id === "usr-coord-geral" ||
      nome.includes("willianne")
    );
  }, [usuarioLogado]);

  // Determina se o usuário logado é da SG (Superintendência de Gestão)
  const isGestorSG = useMemo(() => {
    if (!usuarioLogado) return true;
    const email = (usuarioLogado.email || "").toLowerCase().trim();
    const setor = (usuarioLogado.setor || "").toUpperCase().trim();
    const cargo = (usuarioLogado.cargo || "").toLowerCase().trim();
    const perfil = (usuarioLogado.perfil || "").toUpperCase().trim();

    return (
      email === "will2026@gmail.com" ||
      setor === "SG" ||
      setor.includes("SUPERINTENDÊNCIA DE GESTÃO") ||
      cargo.includes("gestão") ||
      perfil === "SERVIDOR_SG"
    );
  }, [usuarioLogado]);

  // Menu de Itens: O módulo "Autorizações & Acessos" aparece EXCLUSIVAMENTE para a Coordenadora Geral de Gestão
  const menuItems = useMemo(() => {
    const items = [];

    if (isCoordenadoraGeral) {
      items.push({
        moduloId: "cadastro",
        title: "Autorizações & Acessos",
        href: "/cadastro",
        icon: UserCheck,
        badge: qtdPendentes > 0 ? `${qtdPendentes}` : null,
        badgeColor: "bg-amber-500 text-white font-bold",
        apenasSG: true,
      });
    }

    items.push(
      {
        moduloId: "tramitacao",
        title: "Tramitação & Governança",
        href: "/tramitacao",
        icon: Inbox,
        badge: null,
        apenasSG: false,
      },
      {
        moduloId: "visao_geral",
        title: "Visão Geral",
        href: "/",
        icon: LayoutDashboard,
        badge: null,
        apenasSG: false,
      },
      {
        moduloId: "solicitacoes",
        title: "Solicitações",
        href: "/solicitacoes",
        icon: ClipboardList,
        badge: null,
        apenasSG: false,
      },
      {
        moduloId: "processos",
        title: "Processos & Licitações",
        href: "/processos",
        icon: FileText,
        badge: null,
        apenasSG: false,
      },
      {
        moduloId: "contratos",
        title: "Contratos & Atas",
        href: "/contratos",
        icon: FileCheck2,
        badge: null,
        apenasSG: false,
      },
      {
        moduloId: "frotas",
        title: "Frotas & Transportes",
        href: "/frotas",
        icon: Ambulance,
        badge: null,
        apenasSG: false,
      },
      {
        moduloId: "orcamento",
        title: "Orçamento & Finanças",
        href: "/orcamento",
        icon: Coins,
        badge: null,
        apenasSG: false,
      },
      {
        moduloId: "judicializacao",
        title: "Núcleo de Judicialização",
        href: "/judicializacao",
        icon: Scale,
        badge: null,
        badgeColor: null,
        apenasSG: false,
      },
      {
        moduloId: "ti",
        title: "Parque de TI",
        href: "/ti",
        icon: Server,
        badge: null,
        apenasSG: false,
      }
    );

    return items;
  }, [isCoordenadoraGeral, qtdPendentes]);

  // Avaliação estrita de permissões por módulo
  const checarPermissaoModulo = (moduloId: string, apenasSG?: boolean) => {
    // 1. Módulo de CADASTRO é estritamente exclusivo da Coordenadora Geral de Gestão
    if (moduloId === "cadastro" || apenasSG) {
      if (isCoordenadoraGeral) {
        return { permitido: true, motivo: "" };
      }
      return {
        permitido: false,
        motivo: "Módulo exclusivo da Coordenadora Geral de Gestão (SG)",
      };
    }

    // 2. Coordenadora Geral tem acesso total irrestrito
    if (isCoordenadoraGeral) {
      return { permitido: true, motivo: "" };
    }

    // 3. Avalia lista de permissões granulares concedidas pela Coordenadora Geral
    if (usuarioLogado?.permissoes && Array.isArray(usuarioLogado.permissoes)) {
      const perm = usuarioLogado.permissoes.find((p) => p.moduloId === moduloId);
      if (perm) {
        if (perm.visualizar) {
          return { permitido: true, motivo: "" };
        }
        return {
          permitido: false,
          motivo: "A Coordenadora Geral de Gestão não concedeu acesso a este módulo",
        };
      }
    }

    // 4. Módulos base liberados por padrão para qualquer servidor autenticado
    if (["visao_geral", "tramitacao", "solicitacoes"].includes(moduloId)) {
      return { permitido: true, motivo: "" };
    }

    // 5. Demais módulos específicos requerem autorização concedida pela SG
    return {
      permitido: false,
      motivo: "Acesso reservado ou pendente de liberação pela Coordenadora Geral",
    };
  };

  return (
    <aside className="w-72 bg-[#0A192F] text-slate-200 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-sky-900/40 group-hover:scale-105 transition-transform">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-tight flex items-center gap-1.5">
              SuperGestão <span className="text-sky-400 font-extrabold">Saúde</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
              {isGestorSG ? "Superintendência de Gestão" : `Lotação: ${usuarioLogado?.setor || "Setorial"}`}
            </p>
          </div>
        </Link>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
          <span>Navegação</span>
        </div>

        {menuItems
          .filter((item) => checarPermissaoModulo(item.moduloId, item.apenasSG).permitido)
          .map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-sky-600/20 text-sky-300 font-semibold border-l-4 border-sky-400 pl-2.5 shadow-2xs"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-sky-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-semibold",
                      item.badgeColor ||
                        (isActive
                          ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700/50")
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform text-slate-600 group-hover:text-slate-300",
                    isActive && "text-sky-400 translate-x-0.5"
                  )}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Informações do Servidor Conectado & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 truncate">
            <div className="h-8 w-8 rounded-full bg-indigo-700/60 text-indigo-200 border border-indigo-500/40 flex items-center justify-center font-bold text-xs shrink-0">
              {usuarioLogado?.nome ? usuarioLogado.nome.slice(0, 2).toUpperCase() : "WS"}
            </div>
            <div className="truncate">
              <div
                className="text-xs font-semibold text-white truncate"
                title={usuarioLogado?.nome || "Dra. Willianne Soares"}
              >
                {usuarioLogado?.nome || "Dra. Willianne Soares"}
              </div>
              <div
                className="text-[10px] text-indigo-300 truncate font-medium"
                title={usuarioLogado?.cargo || "Coordenadora Geral de Gestão (SG)"}
              >
                {usuarioLogado?.cargo || "Coordenadora Geral de Gestão (SG)"}
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-md transition-colors shrink-0"
            title="Sair / Trocar Usuário"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

