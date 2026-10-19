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
  activeRole?: string;
  onRoleChange?: (role: string) => void;
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

export function Sidebar({
  onOpenSearch,
  activeRole = "ADMINISTRADOR",
  onRoleChange,
}: SidebarProps) {
  const pathname = usePathname();
  const [selectedRole, setSelectedRole] = useState(activeRole);
  const [qtdPendentes, setQtdPendentes] = useState(0);
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogadoStorage | null>(null);

  const carregarUsuario = () => {
    try {
      const salvo = localStorage.getItem("supergestao_usuario_logado");
      if (salvo) {
        const u = JSON.parse(salvo) as UsuarioLogadoStorage;
        setUsuarioLogado(u);
        if (u.perfil && u.perfil !== "ADMINISTRADOR") {
          setSelectedRole(u.perfil);
        }
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

  // Determina se o usuário logado é da SG (Superintendência de Gestão)
  const isGestorSG = useMemo(() => {
    if (!usuarioLogado) return true; // se não logou, default coordenação
    const email = (usuarioLogado.email || "").toLowerCase();
    const setor = (usuarioLogado.setor || "").toUpperCase();
    const cargo = (usuarioLogado.cargo || "").toLowerCase();
    return (
      email === "will2026@gmail.com" ||
      setor === "SG" ||
      cargo.includes("gestão") ||
      cargo.includes("coordenadora geral") ||
      (usuarioLogado.perfil === "ADMINISTRADOR" && setor === "SG")
    );
  }, [usuarioLogado]);

  const menuItems = [
    {
      moduloId: "cadastro",
      title: "CADASTRO",
      href: "/cadastro",
      icon: UserCheck,
      badge: qtdPendentes > 0 ? `${qtdPendentes} Pendentes` : "Autorização SG",
      badgeColor:
        qtdPendentes > 0
          ? "bg-rose-600 text-white font-black animate-pulse shadow-xs border border-rose-400"
          : "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      apenasSG: true,
    },
    {
      moduloId: "tramitacao",
      title: "Tramitação & Governança",
      href: "/tramitacao",
      icon: Inbox,
      badge: "Caixa Postal",
      apenasSG: false,
    },
    {
      moduloId: "visao_geral",
      title: "Visão Geral 360º",
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
      badge: "Demandas",
      apenasSG: false,
    },
    {
      moduloId: "processos",
      title: "Processos & Licitações",
      href: "/processos",
      icon: FileText,
      badge: "PCA 2025",
      apenasSG: false,
    },
    {
      moduloId: "contratos",
      title: "Contratos & Atas",
      href: "/contratos",
      icon: FileCheck2,
      badge: "Saldos Reativos",
      apenasSG: false,
    },
    {
      moduloId: "frotas",
      title: "Frotas & Transportes",
      href: "/frotas",
      icon: Ambulance,
      badge: "TFD & Frota",
      apenasSG: false,
    },
    {
      moduloId: "orcamento",
      title: "Orçamento & Créditos",
      href: "/orcamento",
      icon: Coins,
      badge: "Dotações",
      apenasSG: false,
    },
    {
      moduloId: "judicializacao",
      title: "Judicialização da Saúde",
      href: "/judicializacao",
      icon: Scale,
      badge: "Prazos Fatais",
      badgeColor: "bg-rose-500 text-white animate-pulse",
      apenasSG: false,
    },
    {
      moduloId: "ti",
      title: "Parque TI & Licenças",
      href: "/ti",
      icon: Server,
      badge: null,
      apenasSG: false,
    },
  ];

  const handleRoleSelect = (newRole: string) => {
    setSelectedRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
  };

  // Avaliação estrita de permissões por módulo
  const checarPermissaoModulo = (moduloId: string, apenasSG?: boolean) => {
    // 1. Gestores da SG têm acesso total a tudo
    if (isGestorSG) {
      return { permitido: true, motivo: "" };
    }

    // 2. Módulo de CADASTRO é exclusivo da SG
    if (apenasSG || moduloId === "cadastro") {
      return {
        permitido: false,
        motivo: "Módulo restrito à Coordenadora Geral de Gestão (SG)",
      };
    }

    // 3. Avalia lista de permissões concedidas pela Coordenadora Geral
    if (usuarioLogado?.permissoes && Array.isArray(usuarioLogado.permissoes)) {
      const perm = usuarioLogado.permissoes.find((p) => p.moduloId === moduloId);
      if (perm) {
        if (perm.visualizar) {
          return { permitido: true, motivo: "" };
        }
        return {
          permitido: false,
          motivo: "A Coordenadora Geral de Gestão definiu este módulo como 'Sem Acesso'",
        };
      }
    }

    // Se for servidor setorial sem permissão expressa em módulos estratégicos da SG:
    if (["orcamento", "judicializacao", "ti"].includes(moduloId)) {
      return {
        permitido: false,
        motivo: "Módulo reservado à Superintendência de Gestão (SG)",
      };
    }

    return { permitido: true, motivo: "" };
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
          <span>Módulos Integrados</span>
          {!isGestorSG && (
            <span className="text-[9px] text-amber-400 font-semibold bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-800/60">
              Acesso Restrito SG
            </span>
          )}
        </div>

        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const { permitido, motivo } = checarPermissaoModulo(item.moduloId, item.apenasSG);

          // Se NÃO permitido, renderiza item travado (NÃO É UM LINK, impossível navegar)
          if (!permitido) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-950/40 border border-slate-800/40 cursor-not-allowed select-none opacity-55 transition-all group/locked relative"
                title={motivo || "Acesso Bloqueado pela Coordenadora Geral de Gestão (SG)"}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="line-through decoration-slate-600/70">{item.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-950/90 text-rose-300 border border-rose-800/60 flex items-center gap-1 shrink-0">
                    <Lock className="h-2.5 w-2.5 text-rose-400" />
                    <span>Bloqueado</span>
                  </span>
                </div>
              </div>
            );
          }

          // Se permitido, renderiza Link navegável
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

      {/* RBAC Role Switcher & User Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="mb-2 px-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="h-3 w-3 text-sky-400" /> Perfil de Acesso
          </span>
          {isGestorSG ? (
            <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" /> SG Total
            </span>
          ) : (
            <span className="text-[9px] text-amber-300 font-mono bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800 flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Setorial Fixo
            </span>
          )}
        </div>

        {/* Servidores da SG têm o simulador de perfis; Servidores setoriais (não-SG) têm perfil fixo e bloqueado */}
        {isGestorSG ? (
          <select
            value={selectedRole}
            onChange={(e) => handleRoleSelect(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-md py-1.5 px-2 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="ADMINISTRADOR">Superintendente (Administrador Total SG)</option>
            <option value="GESTOR_CONTRATOS">Gestor de Contratos e Compras</option>
            <option value="FISCAL_CONTRATO">Fiscal Técnico de Contratos</option>
            <option value="COORDENACAO_FROTAS">Coordenação de Frotas e Transportes</option>
            <option value="ORCAMENTO_FINANCAS">Orçamento e Finanças</option>
            <option value="JUDICIALIZACAO">Núcleo de Judicialização</option>
            <option value="TI">Tecnologia da Informação (TI)</option>
          </select>
        ) : (
          <div className="w-full text-xs bg-slate-900/90 border border-slate-700/80 text-slate-300 rounded-md py-1.5 px-2.5 flex items-center justify-between">
            <div className="truncate">
              <span className="font-bold text-sky-400">Lotação: {usuarioLogado?.setor || "SAS"}</span>
              <span className="text-[10px] text-slate-400 block truncate font-medium">
                Servidor Setorial Restrito
              </span>
            </div>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
              Restrito à SG
            </span>
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 truncate">
            <div className="h-7 w-7 rounded-full bg-indigo-700/60 text-indigo-200 border border-indigo-500/40 flex items-center justify-center font-bold text-xs shrink-0">
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
            <LogOut className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

