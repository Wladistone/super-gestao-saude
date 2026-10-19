"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { GlobalSearchDialog } from "@/components/search/global-search-dialog";
import { NovaDemandaPreviaModal } from "@/components/processos/nova-demanda-previa-modal";
import { NovaOrdemModal } from "@/components/contratos/nova-ordem-modal";
import { TiaLicitaAssistant } from "@/components/ia/tia-licita-assistant";
import { CentralNotificacoesModal } from "@/components/notificacoes/central-notificacoes-modal";
import { PermissaoModulo } from "@/lib/types";
import { ShieldAlert, Lock, ArrowLeft, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
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

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNovaDemandaOpen, setIsNovaDemandaOpen] = useState(false);
  const [isNovaOrdemOpen, setIsNovaOrdemOpen] = useState(false);
  const [isCentralNotificacoesOpen, setIsCentralNotificacoesOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("ADMINISTRADOR");
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogadoStorage | null>(null);

  const carregarUsuario = () => {
    try {
      const salvo = localStorage.getItem("supergestao_usuario_logado");
      if (salvo) {
        setUsuarioLogado(JSON.parse(salvo));
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    carregarUsuario();
    window.addEventListener("supergestao_cadastro_atualizado", carregarUsuario);
    window.addEventListener("storage", carregarUsuario);
    return () => {
      window.removeEventListener("supergestao_cadastro_atualizado", carregarUsuario);
      window.removeEventListener("storage", carregarUsuario);
    };
  }, []);

  // Verifica se o usuário é gestor da SG (useMemo chamado incondicionalmente)
  const isGestorSG = useMemo(() => {
    if (!usuarioLogado) return true;
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

  // Mapeamento de rotas para IDs de módulos
  const rotaParaModuloId: Record<string, string> = {
    "/cadastro": "cadastro",
    "/tramitacao": "tramitacao",
    "/": "visao_geral",
    "/solicitacoes": "solicitacoes",
    "/processos": "processos",
    "/contratos": "contratos",
    "/frotas": "frotas",
    "/orcamento": "orcamento",
    "/judicializacao": "judicializacao",
    "/ti": "ti",
  };

  const moduloAtualId = rotaParaModuloId[pathname];

  // Verifica autorização de rota
  const rotaBloqueada = useMemo(() => {
    if (isGestorSG || !moduloAtualId) return false;

    // 1. Módulo CADASTRO é privativo da SG
    if (moduloAtualId === "cadastro") return true;

    // 2. Se o usuário tem permissões explícitas configuradas pela SG
    if (usuarioLogado?.permissoes && Array.isArray(usuarioLogado.permissoes)) {
      const perm = usuarioLogado.permissoes.find((p) => p.moduloId === moduloAtualId);
      if (perm) {
        return !perm.visualizar;
      }
      return true; // Se o módulo não foi concedido, bloqueia
    }

    // 3. Bloqueios padrão de gestão para servidor setorial
    if (["orcamento", "judicializacao", "ti"].includes(moduloAtualId)) {
      return true;
    }

    return false;
  }, [isGestorSG, moduloAtualId, usuarioLogado]);

  // Se estiver na tela de login, renderiza tela cheia sem sidebar, header e modais globais (após todos os hooks)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Corporativa (Oculta na Impressão) */}
      <div className="print:hidden">
        <Sidebar
          onOpenSearch={() => setIsSearchOpen(true)}
          activeRole={activeRole}
          onRoleChange={(role) => setActiveRole(role)}
        />
      </div>

      {/* Área Central Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <Header
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNovoProcesso={() => setIsNovaDemandaOpen(true)}
            onOpenCentralNotificacoes={() => setIsCentralNotificacoesOpen(true)}
          />
        </div>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none">
          {rotaBloqueada ? (
            /* Tela de Acesso Bloqueado pela SG */
            <div className="max-w-3xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden animate-in fade-in">
              <div className="p-6 bg-gradient-to-r from-rose-900 via-rose-850 to-slate-900 text-white flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center shrink-0">
                  <Lock className="h-7 w-7 text-rose-300" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800 inline-block mb-1">
                    Controle de Acessos Institucionais (SG)
                  </span>
                  <h2 className="text-xl font-extrabold text-white">
                    Acesso a este módulo restrito pela Coordenadora Geral de Gestão
                  </h2>
                  <p className="text-xs text-rose-200 mt-0.5">
                    Seu perfil funcional não possui permissão para visualizar o conteúdo deste módulo.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-slate-900">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                    Identificação do Servidor Logado:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-medium">Nome:</span>{" "}
                      <strong className="text-slate-900">{usuarioLogado?.nome || "Servidor Setorial"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Lotação:</span>{" "}
                      <strong className="text-slate-900">{usuarioLogado?.setor || "SAS"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">E-mail:</span>{" "}
                      <strong className="text-slate-900">{usuarioLogado?.email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Cargo:</span>{" "}
                      <strong className="text-slate-900">{usuarioLogado?.cargo}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                  <p>
                    A <strong>Coordenadora Geral de Gestão (Dra. Willianne Soares / will2026@gmail.com)</strong> avaliou o seu cadastro no módulo CADASTRO e restringiu a visualização deste módulo, conforme a política de governança e segregação de funções da SMS.
                  </p>
                  <p className="text-slate-700 font-medium">
                    Conforme as diretrizes da plataforma, servidores setoriais têm acesso restrito aos processos e demandas da sua respectiva superintendência (<strong>{usuarioLogado?.setor || "SAS"}</strong>).
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href="/tramitacao"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar para Tramitação & Governança ({usuarioLogado?.setor || "SAS"})</span>
                  </Link>

                  <Link
                    href="/login"
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-medium"
                  >
                    Trocar de Usuário / Sair
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Assistente de IA Oficial Groq: Tia Licita (Omnipresente em toda a plataforma) */}
      <TiaLicitaAssistant />

      {/* Modais Globais Omnipresentes */}
      <GlobalSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Modal Centralizado de Nova Demanda (Único ponto oficial de abertura da plataforma) */}
      <NovaDemandaPreviaModal
        isOpen={isNovaDemandaOpen}
        onClose={() => setIsNovaDemandaOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <NovaOrdemModal
        isOpen={isNovaOrdemOpen}
        onClose={() => setIsNovaOrdemOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <CentralNotificacoesModal
        isOpen={isCentralNotificacoesOpen}
        onClose={() => setIsCentralNotificacoesOpen(false)}
      />
    </div>
  );
}

