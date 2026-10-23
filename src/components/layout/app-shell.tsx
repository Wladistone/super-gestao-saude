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
import { dataStore } from "@/lib/data-store";
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
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogadoStorage | null>(null);

  const carregarUsuario = () => {
    try {
      const salvo = localStorage.getItem("supergestao_usuario_logado");
      if (salvo) {
        let u = JSON.parse(salvo);
        // Purga sessões modelos legadas (usr-1 a usr-7)
        if (u.id && /^usr-[1-7]$/.test(u.id)) {
          localStorage.removeItem("supergestao_usuario_logado");
          setUsuarioLogado(null);
          return;
        }

        const email = (u.email || "").toLowerCase().trim();
        const isDraWillianne = email === "will2026@gmail.com" || u.id === "usr-coord-geral";

        // Saneamento de segurança: se não for Dra. Willianne, remove perfil ADMINISTRADOR e bloqueia cadastro
        if (!isDraWillianne) {
          let modificado = false;
          if (u.perfil === "ADMINISTRADOR") {
            u.perfil = u.setor === "SG" ? "SERVIDOR_SG" : "SERVIDOR_SETORIAL";
            modificado = true;
          }

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
  }, [pathname]);

  useEffect(() => {
    carregarUsuario();
    window.addEventListener("supergestao_cadastro_atualizado", carregarUsuario);
    window.addEventListener("supergestao_usuario_atualizado", carregarUsuario);
    window.addEventListener("storage", carregarUsuario);
    return () => {
      window.removeEventListener("supergestao_cadastro_atualizado", carregarUsuario);
      window.removeEventListener("supergestao_usuario_atualizado", carregarUsuario);
      window.removeEventListener("storage", carregarUsuario);
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

  // Verifica se o usuário é gestor da SG (useMemo chamado incondicionalmente)
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
    // 1. Módulo CADASTRO (Autorizações & Acessos) é privativo e exclusivo da Coordenadora Geral de Gestão
    if (moduloAtualId === "cadastro") {
      return !isCoordenadoraGeral;
    }

    if (!moduloAtualId) return false;

    // Coordenadora Geral tem acesso total irrestrito
    if (isCoordenadoraGeral) return false;

    // 2. Se o usuário tem permissões explícitas configuradas pela SG
    if (usuarioLogado?.permissoes && Array.isArray(usuarioLogado.permissoes)) {
      const perm = usuarioLogado.permissoes.find((p) => p.moduloId === moduloAtualId);
      if (perm) {
        return !perm.visualizar;
      }
      // Se não está na lista de permissões mas é módulo base (visao_geral, tramitacao, solicitacoes)
      if (["visao_geral", "tramitacao", "solicitacoes"].includes(moduloAtualId)) {
        return false;
      }
      return true; // Se o módulo não foi concedido, bloqueia
    }

    // 3. Módulos base liberados por padrão para qualquer servidor autenticado
    if (["visao_geral", "tramitacao", "solicitacoes"].includes(moduloAtualId)) {
      return false;
    }

    // Demais módulos específicos bloqueados se não houver permissão concedida
    return true;
  }, [isCoordenadoraGeral, moduloAtualId, usuarioLogado]);

  // Se estiver na tela de login, renderiza tela cheia sem sidebar, header e modais globais (após todos os hooks)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Corporativa (Oculta na Impressão) */}
      <div className="print:hidden">
        <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />
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

        <main className="flex-1 p-6 lg:p-8 pb-24 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none">
          {rotaBloqueada ? (
            /* Tela Amigável de Módulo com Acesso Reservado */
            <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                  <Lock className="h-7 w-7 text-sky-600" />
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Governança Institucional
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    {moduloAtualId === "cadastro"
                      ? "Módulo Exclusivo da Coordenadora Geral de Gestão"
                      : "Área reservada à Coordenação Central"}
                  </h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {moduloAtualId === "cadastro"
                      ? "O gerenciamento de autorizações e acessos de servidores é de competência exclusiva da Coordenadora Geral de Gestão (Dra. Willianne Soares)."
                      : "Este espaço contém rotinas gerenciais exclusivas da Superintendência de Gestão (SG). Seu perfil funcional está ativo com acesso livre às demandas e processos do seu setor."}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/tramitacao"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Ir para Tramitações & Demandas</span>
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <span>Voltar à Visão Geral</span>
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

