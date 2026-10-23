"use client";

import { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Ban,
  UserCheck,
  Mail,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  MessageSquare,
  Phone,
} from "lucide-react";
import {
  SolicitacaoCadastro,
  PermissaoModulo,
  NivelAcessoModulo,
  MODULOS_SISTEMA_DISPONIVEIS,
} from "@/lib/types";
import { dataStore } from "@/lib/data-store";
import {
  autorizarCadastroAction,
  rejeitarCadastroAction,
  reenviarEmailBoasVindasAction,
} from "@/actions/super-gestao-actions";
import { formatDate } from "@/lib/utils";

interface PermissaoEstado {
  visualizar: boolean;
  editar: boolean;
}

interface AutorizarCadastroModalProps {
  solicitacao: SolicitacaoCadastro | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  autorizadorPadrao?: string;
}

export function AutorizarCadastroModal({
  solicitacao,
  isOpen,
  onClose,
  onSuccess,
  autorizadorPadrao = "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG - will2026@gmail.com)",
}: AutorizarCadastroModalProps) {
  // Estado das permissões por módulo: { [moduloId]: { visualizar: boolean, editar: boolean } }
  const [permissoesMap, setPermissoesMap] = useState<Record<string, PermissaoEstado>>({});
  const [observacoesSG, setObservacoesSG] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [modoRejeicao, setModoRejeicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [reenviandoEmail, setReenviandoEmail] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inicializa permissões com base no histórico do cadastro ou padrão inteligente
  useEffect(() => {
    if (!solicitacao) return;

    const inicialMap: Record<string, PermissaoEstado> = {};

    // Se já existiam permissões salvas no cadastro, carrega
    if (solicitacao.permissoes && solicitacao.permissoes.length > 0) {
      solicitacao.permissoes.forEach((p) => {
        inicialMap[p.moduloId] = {
          visualizar: typeof p.visualizar === "boolean" ? p.visualizar : p.nivel === "VISUALIZACAO" || p.nivel === "VISUALIZACAO_E_EDICAO",
          editar: typeof p.editar === "boolean" ? p.editar : p.nivel === "EDICAO" || p.nivel === "VISUALIZACAO_E_EDICAO",
        };
      });
    } else {
      // Padrão inicial por lotação
      // Padrão inicial por lotação: o módulo de CADASTRO é estritamente privativo da Coordenadora Geral
      MODULOS_SISTEMA_DISPONIVEIS.forEach((mod) => {
        if (mod.id === "cadastro") {
          inicialMap[mod.id] = {
            visualizar: false,
            editar: false,
          };
        } else if (mod.id === "tramitacao") {
          // Por padrão em tramitação, libera tanto visualização quanto edição
          inicialMap[mod.id] = { visualizar: true, editar: true };
        } else if (mod.id === "solicitacoes") {
          inicialMap[mod.id] = { visualizar: true, editar: true };
        } else if (mod.id === "visao_geral") {
          inicialMap[mod.id] = { visualizar: true, editar: false };
        } else if (mod.id === "processos" || mod.id === "contratos") {
          const isSG = solicitacao.superintendenciaLotacao === "SG";
          inicialMap[mod.id] = { visualizar: true, editar: isSG };
        } else {
          // Frotas, Orçamento, Judicialização, TI: desmarcados por padrão
          inicialMap[mod.id] = { visualizar: false, editar: false };
        }
      });
    }

    setPermissoesMap(inicialMap);
    setObservacoesSG(solicitacao.observacoesSG || "");
    setMotivoRejeicao(solicitacao.motivoRejeicao || "");
    setModoRejeicao(false);
    setFeedback(null);
  }, [solicitacao, isOpen]);

  if (!isOpen || !solicitacao) return null;

  // Alternadores independentes de permissão (CADASTRO é estritamente bloqueado)
  const handleToggleVisualizar = (moduloId: string) => {
    if (moduloId === "cadastro") return;
    setPermissoesMap((prev) => {
      const atual = prev[moduloId] || { visualizar: false, editar: false };
      return {
        ...prev,
        [moduloId]: {
          ...atual,
          visualizar: !atual.visualizar,
        },
      };
    });
  };

  const handleToggleEditar = (moduloId: string) => {
    if (moduloId === "cadastro") return;
    setPermissoesMap((prev) => {
      const atual = prev[moduloId] || { visualizar: false, editar: false };
      return {
        ...prev,
        [moduloId]: {
          ...atual,
          editar: !atual.editar,
        },
      };
    });
  };

  // Botão rápido para marcar/desmarcar ambos
  const handleToggleAmbos = (moduloId: string) => {
    if (moduloId === "cadastro") return;
    setPermissoesMap((prev) => {
      const atual = prev[moduloId] || { visualizar: false, editar: false };
      const ambosAtivos = atual.visualizar && atual.editar;
      return {
        ...prev,
        [moduloId]: {
          visualizar: !ambosAtivos,
          editar: !ambosAtivos,
        },
      };
    });
  };

  // Perfis Rápidos de Preenchimento
  const aplicarPerfilPredefinido = (tipo: "AMBOS_TODOS" | "CONSULTA_TODOS" | "SOLICITANTE" | "FISCAL" | "LIMPAR") => {
    const novoMap: Record<string, PermissaoEstado> = {};

    MODULOS_SISTEMA_DISPONIVEIS.forEach((mod) => {
      switch (tipo) {
        case "AMBOS_TODOS":
          // Libera visualização e edição nos módulos operacionais (CADASTRO é sempre false)
          novoMap[mod.id] = {
            visualizar: mod.id !== "cadastro",
            editar: mod.id !== "cadastro",
          };
          break;

        case "CONSULTA_TODOS":
          // Apenas visualização em todos os módulos
          novoMap[mod.id] = {
            visualizar: mod.id !== "cadastro",
            editar: false,
          };
          break;

        case "SOLICITANTE":
          // Edição + Visualização em Solicitações e Tramitação; apenas Visualização em Visão Geral e Processos
          if (mod.id === "solicitacoes" || mod.id === "tramitacao") {
            novoMap[mod.id] = { visualizar: true, editar: true };
          } else if (mod.id === "visao_geral" || mod.id === "processos") {
            novoMap[mod.id] = { visualizar: true, editar: false };
          } else {
            novoMap[mod.id] = { visualizar: false, editar: false };
          }
          break;

        case "FISCAL":
          // Edição + Visualização em Contratos, Frotas e Tramitação
          if (mod.id === "contratos" || mod.id === "frotas" || mod.id === "tramitacao") {
            novoMap[mod.id] = { visualizar: true, editar: true };
          } else if (mod.id === "visao_geral" || mod.id === "processos" || mod.id === "orcamento") {
            novoMap[mod.id] = { visualizar: true, editar: false };
          } else {
            novoMap[mod.id] = { visualizar: false, editar: false };
          }
          break;

        case "LIMPAR":
          novoMap[mod.id] = { visualizar: false, editar: false };
          break;
      }
    });

    setPermissoesMap(novoMap);
  };

  // Contagens dinâmicas
  const totalModulos = MODULOS_SISTEMA_DISPONIVEIS.length;
  const valores = Object.values(permissoesMap);
  const qtdVisualizacao = valores.filter((p) => p.visualizar).length;
  const qtdEdicao = valores.filter((p) => p.editar).length;
  const qtdAmbos = valores.filter((p) => p.visualizar && p.editar).length;
  const qtdSemAcesso = valores.filter((p) => !p.visualizar && !p.editar).length;

  // Submeter Autorização com Visualização e Edição
  const handleConfirmarAutorizacao = async () => {
    setSalvando(true);
    try {
      const listaPermissoes: PermissaoModulo[] = MODULOS_SISTEMA_DISPONIVEIS.map((mod) => {
        const item = permissoesMap[mod.id] || { visualizar: false, editar: false };
        let nivel: NivelAcessoModulo = "SEM_ACESSO";
        if (item.visualizar && item.editar) nivel = "VISUALIZACAO_E_EDICAO";
        else if (item.editar) nivel = "EDICAO";
        else if (item.visualizar) nivel = "VISUALIZACAO";

        return {
          moduloId: mod.id,
          moduloNome: mod.nome,
          visualizar: item.visualizar,
          editar: item.editar,
          nivel,
        };
      });

      // Executa no servidor com disparo automático de e-mail institucional
      const resAction = await autorizarCadastroAction({
        id: solicitacao.id,
        permissoes: listaPermissoes,
        autorizadorNome: autorizadorPadrao,
        observacoesSG: observacoesSG.trim() || undefined,
        email: solicitacao.email,
        nomeCompleto: solicitacao.nomeCompleto,
        matricula: solicitacao.matricula,
        superintendenciaLotacao: solicitacao.superintendenciaLotacao,
        cargo: solicitacao.cargo,
      });

      // Sincroniza localmente
      const ok = dataStore.autorizarCadastro(
        solicitacao.id,
        listaPermissoes,
        autorizadorPadrao,
        observacoesSG.trim() || undefined
      );

      if (resAction?.emailDisparado?.success) {
        setFeedback({
          type: "success",
          text: `Cadastro de ${solicitacao.nomeCompleto} autorizado pela SG! E-mail oficial enviado via SMTP para ${solicitacao.email}. ID: ${resAction.emailDisparado.messageId}`,
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else if (ok || resAction?.success) {
        setFeedback({
          type: "success",
          text: `Cadastro de ${solicitacao.nomeCompleto} autorizado pela SG! ${resAction?.emailDisparado?.aviso || "Disparo registrado no sistema."}`,
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else {
        setFeedback({ type: "error", text: "Erro ao registrar autorização." });
      }
    } catch {
      setFeedback({ type: "error", text: "Falha técnica ao processar autorização." });
    } finally {
      setSalvando(false);
    }
  };

  // Reenviar E-mail Oficial Diretamente
  const handleReenviarEmailDireto = async () => {
    if (!solicitacao) return;
    setReenviandoEmail(true);
    setFeedback(null);
    try {
      const res = await reenviarEmailBoasVindasAction({
        id: solicitacao.id,
        email: solicitacao.email,
        nomeCompleto: solicitacao.nomeCompleto,
        matricula: solicitacao.matricula,
        superintendencia: solicitacao.superintendenciaLotacao,
        cargo: solicitacao.cargo,
        autorizadorNome: autorizadorPadrao,
        observacoesSG: observacoesSG.trim() || solicitacao.observacoesSG,
        permissoes: solicitacao.permissoes,
      });

      if (res.success) {
        // Sincroniza localmente
        const cadLocal = dataStore.solicitacoesCadastro.find((c) => c.id === solicitacao.id);
        if (cadLocal) {
          cadLocal.notificacaoEmail = {
            enviado: true,
            dataHora: res.timestamp,
            destinatario: solicitacao.email,
            assunto: res.assunto,
            modo: res.modo,
            mensagemId: res.messageId,
          };
          dataStore.salvarSolicitacoesStorage();
        }

        setFeedback({
          type: "success",
          text: `E-mail oficial reenviado com sucesso para ${solicitacao.email}! ID: ${res.messageId} (Modo: ${res.modo.toUpperCase()}).`,
        });
        if (onSuccess) onSuccess();
      } else {
        setFeedback({
          type: "error",
          text: `Falha ao reenviar e-mail: ${res.aviso || "Erro no servidor SMTP."}`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: `Erro ao disparar e-mail: ${err?.message || err}`,
      });
    } finally {
      setReenviandoEmail(false);
    }
  };

  // Submeter Rejeição
  const handleConfirmarRejeicao = () => {
    if (!motivoRejeicao.trim()) {
      setFeedback({ type: "error", text: "Por favor, justifique o motivo da recusa do cadastro." });
      return;
    }

    setSalvando(true);
    try {
      const ok = dataStore.rejeitarCadastro(solicitacao.id, motivoRejeicao.trim(), autorizadorPadrao);

      // Sincroniza também no servidor e dispara e-mail de aviso
      rejeitarCadastroAction({
        id: solicitacao.id,
        motivoRejeicao: motivoRejeicao.trim(),
        autorizadorNome: autorizadorPadrao,
        email: solicitacao.email,
        nomeCompleto: solicitacao.nomeCompleto,
        matricula: solicitacao.matricula,
        superintendenciaLotacao: solicitacao.superintendenciaLotacao,
        cargo: solicitacao.cargo,
      }).catch(console.warn);
      if (ok) {
        setFeedback({
          type: "success",
          text: `Solicitação de ${solicitacao.nomeCompleto} não aprovada. E-mail com orientações enviado para ${solicitacao.email}.`,
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: "error", text: "Erro ao rejeitar cadastro." });
      }
    } catch {
      setFeedback({ type: "error", text: "Falha técnica ao rejeitar cadastro." });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-500/10 via-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {solicitacao.status === "AUTORIZADO"
                    ? "Ajustar Permissões de Acesso (SG)"
                    : "Autorização de Cadastro & Níveis de Acesso (SG)"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                  Superintendência de Gestão
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Autorize o acesso a cada módulo individualmente para <strong>Visualização</strong>, <strong>Edição</strong> ou <strong>Ambos</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Ficha Resumida do Servidor Solicitante */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                Dados do Servidor Solicitante
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Submetido em: {formatDate(solicitacao.dataSolicitacao)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Nome Completo</span>
                <span className="font-bold text-slate-900 text-sm">{solicitacao.nomeCompleto}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CPF</span>
                <span className="font-mono font-semibold text-slate-800">{solicitacao.cpf}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Matrícula</span>
                <span className="font-mono font-semibold text-slate-800">{solicitacao.matricula}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">E-mail Institucional</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-400" />
                  {solicitacao.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lotação (Superintendência)</span>
                <span className="inline-block px-2 py-0.5 mt-0.5 rounded font-bold text-[11px] bg-sky-100 text-sky-800 border border-sky-200">
                  {solicitacao.superintendenciaLotacao}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cargo / Função</span>
                <span className="font-semibold text-slate-800 truncate block">{solicitacao.cargo}</span>
              </div>
            </div>
          </div>

          {/* Modo de Rejeição */}
          {modoRejeicao ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <Ban className="h-4 w-4" />
                <span>Justificativa da Recusa do Cadastro</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Informe o motivo pelo qual este cadastro não atende aos requisitos (ex: divergência de matrícula, ausência de portaria ou vínculo com a SMS Arapiraca).
              </p>
              <textarea
                rows={3}
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Ex: Matrícula funcional divergente do quadro de servidores da SMS..."
                className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
              />
            </div>
          ) : (
            /* MATRIZ DE AUTORIZAÇÃO: VISUALIZAÇÃO E EDIÇÃO EM CADA MÓDULO */
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    Autorização de Visualização & Edição por Módulo
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Você pode marcar <strong>Visualização</strong>, <strong>Edição</strong> ou <strong>Ambas as permissões</strong> para cada módulo.
                  </p>
                </div>

                {/* Resumo Dinâmico das Permissões */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold shrink-0">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                    {qtdAmbos} Ambos (Vis + Ed)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    {qtdVisualizacao} Visualização
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                    {qtdEdicao} Edição
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    {qtdSemAcesso} Sem Acesso
                  </span>
                </div>
              </div>

              {/* Botões de Perfis Rápidos */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100/80 rounded-xl text-[11px]">
                <span className="text-slate-500 font-bold px-1 text-[10px] uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Atalhos Rápidos:
                </span>
                <button
                  type="button"
                  onClick={() => aplicarPerfilPredefinido("AMBOS_TODOS")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Liberar Ambos em Todos (Acesso Total)</span>
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPerfilPredefinido("SOLICITANTE")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  Perfil Solicitante (Demandas)
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPerfilPredefinido("FISCAL")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  Perfil Fiscal (Contratos/Frotas)
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPerfilPredefinido("CONSULTA_TODOS")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  Apenas Visualização em Todos
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPerfilPredefinido("LIMPAR")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 font-semibold border border-slate-200 text-xs transition-colors shadow-2xs ml-auto cursor-pointer"
                >
                  Desmarcar Todos
                </button>
              </div>

              {/* Lista dos 10 Módulos com opções simultâneas de Edição e Visualização */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {MODULOS_SISTEMA_DISPONIVEIS.map((modulo) => {
                  const estado = permissoesMap[modulo.id] || { visualizar: false, editar: false };
                  const temAmbos = estado.visualizar && estado.editar;
                  const temNenhum = !estado.visualizar && !estado.editar;

                  return (
                    <div
                      key={modulo.id}
                      className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                        temAmbos
                          ? "bg-indigo-50/40"
                          : estado.editar
                          ? "bg-emerald-50/30"
                          : estado.visualizar
                          ? "bg-amber-50/30"
                          : "bg-white opacity-85 hover:opacity-100"
                      }`}
                    >
                      {/* Descrição do Módulo */}
                      <div className="space-y-0.5 max-w-sm lg:max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {modulo.nome}
                          </span>
                          {modulo.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {modulo.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {modulo.descricao}
                        </p>
                      </div>

                      {/* Controles de Autorização: Visualização & Edição simultâneas */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {modulo.id === "cadastro" ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold select-none">
                            <Ban className="h-3.5 w-3.5 text-slate-400" />
                            <span>Privativo da Coordenadora Geral</span>
                          </div>
                        ) : (
                          <>
                            {/* 1. Botão/Checkbox de Visualização */}
                            <button
                              type="button"
                              onClick={() => handleToggleVisualizar(modulo.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                                estado.visualizar
                                  ? "bg-amber-500 border-amber-600 text-white shadow-xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                              title="Permitir que o servidor visualize e consulte este módulo"
                            >
                              <Eye className={`h-4 w-4 ${estado.visualizar ? "text-white" : "text-amber-500"}`} />
                              <span>Visualização</span>
                              {estado.visualizar ? (
                                <Check className="h-3 w-3 stroke-[3]" />
                              ) : (
                                <span className="text-[10px] text-slate-400 font-normal">Off</span>
                              )}
                            </button>

                            {/* 2. Botão/Checkbox de Edição */}
                            <button
                              type="button"
                              onClick={() => handleToggleEditar(modulo.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                                estado.editar
                                  ? "bg-emerald-600 border-emerald-700 text-white shadow-xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                              title="Permitir que o servidor crie, altere, edite e despache neste módulo"
                            >
                              <Edit3 className={`h-4 w-4 ${estado.editar ? "text-white" : "text-emerald-600"}`} />
                              <span>Edição</span>
                              {estado.editar ? (
                                <Check className="h-3 w-3 stroke-[3]" />
                              ) : (
                                <span className="text-[10px] text-slate-400 font-normal">Off</span>
                              )}
                            </button>

                            {/* 3. Atalho rápido Ambos / Status do Módulo */}
                            <button
                              type="button"
                              onClick={() => handleToggleAmbos(modulo.id)}
                              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
                                temAmbos
                                  ? "bg-indigo-100 text-indigo-950 border-indigo-300 hover:bg-indigo-200"
                                  : temNenhum
                                  ? "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                              title="Clique para alternar permissão completa (Visualização + Edição)"
                            >
                              {temAmbos ? "Ambos Ativos ✓" : temNenhum ? "Sem Acesso" : "Marcar Ambos"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Observações da SG */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Despacho / Observações da Autorização (SG)
                </label>
                <textarea
                  rows={2}
                  value={observacoesSG}
                  onChange={(e) => setObservacoesSG(e.target.value)}
                  placeholder="Ex: Acesso autorizado para consulta e edição conforme portaria de designação da SMS..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                />
              </div>

              <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-[11px] text-indigo-900 flex items-center justify-between">
                <span>
                  <strong>Autorizador Responsável:</strong> {autorizadorPadrao}
                </span>
                <span className="font-mono text-indigo-700 text-[10px]">
                  SuperGestão Saúde • Governança SG
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <div>
            {!modoRejeicao ? (
              <button
                type="button"
                onClick={() => setModoRejeicao(true)}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
              >
                Rejeitar esta solicitação
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModoRejeicao(false)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                Voltar à Matriz de Permissões
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {solicitacao?.status === "AUTORIZADO" && !modoRejeicao && (
              <button
                type="button"
                onClick={handleReenviarEmailDireto}
                disabled={reenviandoEmail || salvando}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                title={`Reenviar e-mail de boas-vindas e dados de acesso para ${solicitacao.email}`}
              >
                {reenviandoEmail ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Disparando E-mail...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Reenviar E-mail ao Servidor</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {modoRejeicao ? (
              <button
                type="button"
                onClick={handleConfirmarRejeicao}
                disabled={salvando}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Ban className="h-4 w-4" />
                <span>Confirmar Rejeição do Cadastro</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmarAutorizacao}
                disabled={salvando}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{solicitacao?.status === "AUTORIZADO" ? "Salvar Alterações de Acesso" : "Salvar & Autorizar Acesso"}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
