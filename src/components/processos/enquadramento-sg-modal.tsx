"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Scale,
  Building2,
  Send,
  FileCheck2,
  RotateCcw,
  Sparkles,
  Mail,
  Clock,
  UserCheck,
  CheckSquare,
  Square,
  ShieldCheck,
  FileText,
  Copy,
  ArrowRight,
  Layers,
  ChevronRight,
  Download,
} from "lucide-react";
import { DemandaPreviaProcesso } from "@/lib/types";
import {
  MODALIDADES_LICITACAO,
  obterModelosPorModalidade,
  obterModalidadeInfo,
  ModeloDocumentoProcesso,
} from "@/data/modelos-licitacao-catalog";
import {
  enquadrarDemandaSGAction,
  solicitarDiligenciaSGAction,
  direcionarDemandaSGAction,
} from "@/actions/super-gestao-actions";
import { formatCurrency, formatDate, extrairPrimeiroNome } from "@/lib/utils";
import { dataStore } from "@/lib/data-store";

import {
  DadosNotificacaoDemanda,
  gerarEmailDemanda,
  gerarLinkEmail,
} from "@/lib/notificacoes-utils";

interface EnquadramentoSGModalProps {
  demanda: DemandaPreviaProcesso | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  modoInicial?: "ENQUADRAMENTO" | "DIRECIONAMENTO_SG";
}

export function EnquadramentoSGModal({
  demanda,
  isOpen,
  onClose,
  onSuccess,
  modoInicial = "ENQUADRAMENTO",
}: EnquadramentoSGModalProps) {
  // Controle de Etapas: 1. Enquadramento & Modelos -> 2. Direcionamento SG -> 3. Confirmação
  const [fase, setFase] = useState<"ENQUADRAMENTO" | "DIRECIONAMENTO_SG" | "CONFIRMACAO_FINAL">("ENQUADRAMENTO");

  // Coordenadora Geral que realiza o enquadramento
  const [coordenadoraNome, setCoordenadoraNome] = useState(
    "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG - will2026@gmail.com)"
  );

  // Modalidade e Justificativa Legal
  const [modalidadeId, setModalidadeId] = useState(
    "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO"
  );
  const [justificativa, setJustificativa] = useState(
    "Com base na análise técnica dos quantitativos informados, banco de preços da saúde e padrão de consumo contínuo com entregas parceladas ao longo de 12 meses, enquadra-se no Sistema de Registro de Preços (Lei Federal nº 14.133/2021)."
  );
  const [observacoesDirecionamento, setObservacoesDirecionamento] = useState("");
  const [autuarImediato, setAutuarImediato] = useState(true);
  const [selectedDotacaoId, setSelectedDotacaoId] = useState("");

  // Servidor da SG para Direcionamento Posterior (Carregamento Dinâmico Oficial)
  const servidoresSGOpcoes = useMemo(() => {
    const lista: { id: string; nome: string; cargo: string; email: string }[] = [
      {
        id: "usr-coord-geral",
        nome: "Dra. Willianne Soares",
        cargo: "Coordenadora Geral de Gestão / SG",
        email: "will2026@gmail.com",
      },
    ];

    // Usuários da SG do dataStore
    const usuariosSG = dataStore.obterUsuarios().filter(
      (u) =>
        u.email.toLowerCase() !== "will2026@gmail.com" &&
        (u.setor === "SG" ||
          u.cargo.toLowerCase().includes("gestão") ||
          u.perfil === "ADMINISTRADOR")
    );
    for (const u of usuariosSG) {
      if (!lista.some((l) => l.email.toLowerCase() === u.email.toLowerCase())) {
        lista.push({
          id: u.id,
          nome: u.nome,
          cargo: u.cargo,
          email: u.email,
        });
      }
    }

    // Solicitações autorizadas da SG
    const autorizadosSG = dataStore.obterSolicitacoesCadastro().filter(
      (s) =>
        s.status === "AUTORIZADO" &&
        (s.superintendenciaLotacao === "SG" || s.cargo.toLowerCase().includes("gestão"))
    );
    for (const s of autorizadosSG) {
      if (!lista.some((l) => l.email.toLowerCase() === s.email.toLowerCase())) {
        lista.push({
          id: `usr-${s.id}`,
          nome: s.nomeCompleto,
          cargo: s.cargo,
          email: s.email,
        });
      }
    }

    return lista;
  }, [isOpen]);

  const [servidorSGDestinoId, setServidorSGDestinoId] = useState("usr-coord-geral");

  // Modelos selecionados em Cards para o Servidor Originador
  const [modelosSelecionadosIds, setModelosSelecionadosIds] = useState<string[]>([]);

  // Modo Diligência
  const [modoDiligencia, setModoDiligencia] = useState(false);
  const [motivoDiligencia, setMotivoDiligencia] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingDirecionamento, setLoadingDirecionamento] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Informações de conclusão do enquadramento
  const [enquadramentoSucessoInfo, setEnquadramentoSucessoInfo] = useState<{
    modalidadeNome: string;
    processoNumero?: string;
    totalModelos: number;
    dadosNotificacao?: DadosNotificacaoDemanda;
  } | null>(null);

  // Informações de conclusão do direcionamento
  const [direcionamentoSucessoInfo, setDirecionamentoSucessoInfo] = useState<{
    servidorNome: string;
    servidorCargo: string;
    servidorEmail: string;
    dataHora: string;
  } | null>(null);

  const [copiadoEmail, setCopiadoEmail] = useState(false);

  // Sincronização e Reset quando a modal abre ou a demanda muda
  useEffect(() => {
    if (isOpen && demanda) {
      setFeedback(null);
      setModoDiligencia(false);

      if (modoInicial === "DIRECIONAMENTO_SG") {
        setFase("DIRECIONAMENTO_SG");
      } else {
        setFase("ENQUADRAMENTO");
      }

      if (
        demanda.enquadramentoSG?.modalidadeDefinidaId &&
        demanda.enquadramentoSG.modalidadeDefinidaId !== "A_DEFINIR"
      ) {
        setModalidadeId(demanda.enquadramentoSG.modalidadeDefinidaId);
      }
      if (demanda.enquadramentoSG?.justificativaEnquadramento) {
        setJustificativa(demanda.enquadramentoSG.justificativaEnquadramento);
      }
      if (demanda.enquadramentoSG?.direcionamentoSG?.servidorSGId) {
        setServidorSGDestinoId(demanda.enquadramentoSG.direcionamentoSG.servidorSGId);
      }

      // Inicializa os modelos da modalidade
      const mods = obterModelosPorModalidade(
        demanda.enquadramentoSG?.modalidadeDefinidaId || modalidadeId
      );

      if (
        demanda.enquadramentoSG?.modelosDisponibilizadosOriginador &&
        demanda.enquadramentoSG.modelosDisponibilizadosOriginador.length > 0
      ) {
        setModelosSelecionadosIds(
          demanda.enquadramentoSG.modelosDisponibilizadosOriginador.map((m) => m.id)
        );
      } else {
        // Por padrão, seleciona todos os modelos da modalidade
        setModelosSelecionadosIds(mods.map((m) => m.id));
      }
    }
  }, [isOpen, demanda?.id, modoInicial]);

  // Atualiza os modelos disponíveis e a seleção ao mudar a modalidade
  useEffect(() => {
    if (isOpen) {
      const mods = obterModelosPorModalidade(modalidadeId);
      setModelosSelecionadosIds(mods.map((m) => m.id));
    }
  }, [modalidadeId, isOpen]);

  if (!isOpen || !demanda) return null;

  const dotacoes = dataStore.dotacoes;
  const modInfo = obterModalidadeInfo(modalidadeId);
  const modelosDisponiveis = obterModelosPorModalidade(modalidadeId);
  const servidorSGAlvo =
    servidoresSGOpcoes.find((s) => s.id === servidorSGDestinoId) || servidoresSGOpcoes[0];

  const emailDestinoOriginador = demanda.responsavelEmail || "comprassaude@arapiraca.al.gov.br";

  const toggleModeloCard = (modeloId: string) => {
    if (modelosSelecionadosIds.includes(modeloId)) {
      setModelosSelecionadosIds(modelosSelecionadosIds.filter((id) => id !== modeloId));
    } else {
      setModelosSelecionadosIds([...modelosSelecionadosIds, modeloId]);
    }
  };

  const selecionarTodosModelos = () => {
    setModelosSelecionadosIds(modelosDisponiveis.map((m) => m.id));
  };

  const selecionarApenasEtpTr = () => {
    const etpTr = modelosDisponiveis
      .filter(
        (m) =>
          m.tipoPeca.toLowerCase().includes("etp") ||
          m.tipoPeca.toLowerCase().includes("tr") ||
          m.tipoPeca.toLowerCase().includes("termo de referência") ||
          m.tipoPeca.toLowerCase().includes("estudo técnico") ||
          m.titulo.toLowerCase().includes("etp") ||
          m.titulo.toLowerCase().includes("tr")
      )
      .map((m) => m.id);
    setModelosSelecionadosIds(etpTr.length > 0 ? etpTr : modelosDisponiveis.slice(0, 3).map((m) => m.id));
  };

  const desmarcarTodosModelos = () => {
    setModelosSelecionadosIds([]);
  };

  // -------------------------------------------------------------
  // PASSO 1: CONCLUIR ENQUADRAMENTO & DEVOLVER AO SERVIDOR ORIGINADOR
  // -------------------------------------------------------------
  const handleEnquadrarEDevolver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!justificativa.trim()) {
      setFeedback({
        type: "error",
        text: "Por favor, emita o parecer técnico e justificativa legal do enquadramento.",
      });
      return;
    }

    if (modelosSelecionadosIds.length === 0) {
      setFeedback({
        type: "error",
        text: "Por favor, selecione ao menos 1 modelo oficial em card para liberar ao servidor originador.",
      });
      return;
    }

    setLoading(true);
    try {
      const modelosObjetos = modelosDisponiveis
        .filter((m) => modelosSelecionadosIds.includes(m.id))
        .map((m) => ({
          id: m.id,
          titulo: m.titulo,
          tipoPeca: m.tipoPeca,
          artigoLei: m.artigoLei,
          downloadUrl: m.downloadUrl,
        }));

      const res = await enquadrarDemandaSGAction({
        demandaId: demanda.id,
        analistaSG: coordenadoraNome,
        coordenadoraNome,
        modalidadeDefinidaId: modalidadeId,
        modalidadeDefinidaNome: modInfo ? modInfo.alias : modalidadeId,
        artigoLeiBase: modInfo ? modInfo.artigoBase : "Lei nº 14.133/2021",
        justificativaEnquadramento: justificativa,
        autuarProcessoImediato: autuarImediato,
        dotacaoId: selectedDotacaoId || undefined,
        modelosDisponibilizadosOriginador: modelosObjetos,
        artefatosDisponibilizados: modelosObjetos.map((m) => m.titulo),
        servidorOriginadorEmail: emailDestinoOriginador,
        servidorOriginadorNome: demanda.responsavelNome,
      });

      if (res.success) {
        const dadosNotif: DadosNotificacaoDemanda = {
          servidorNome: demanda.responsavelNome,
          servidorEmail: emailDestinoOriginador,
          numeroDemanda: demanda.numeroDemanda,
          superintendencia: `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})`,
          objeto: demanda.objeto,
          coordenadoraNome,
          modalidadeNome: modInfo ? modInfo.alias : modalidadeId,
          artigoLei: modInfo ? modInfo.artigoBase : "Lei nº 14.133/2021",
          numeroProcesso: res.processoGerado?.numeroProcesso || "PA-2025/00104",
          artefatos: modelosObjetos.map((m) => m.titulo),
        };

        setEnquadramentoSucessoInfo({
          modalidadeNome: modInfo ? modInfo.alias : modalidadeId,
          processoNumero: res.processoGerado?.numeroProcesso,
          totalModelos: modelosObjetos.length,
          dadosNotificacao: dadosNotif,
        });

        // Transiciona imediatamente para a etapa seguinte: DIRECIONAMENTO AO SERVIDOR DA SG
        setFase("DIRECIONAMENTO_SG");
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao concluir enquadramento e devolução da demanda." });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PASSO 2: DIRECIONAR PARA O SERVIDOR DA SG
  // -------------------------------------------------------------
  const handleConfirmarDirecionamentoSG = async () => {
    setFeedback(null);

    if (!servidorSGDestinoId) {
      setFeedback({
        type: "error",
        text: "Por favor, selecione o servidor da SG para conduzir o processo.",
      });
      return;
    }

    setLoadingDirecionamento(true);
    try {
      const res = await direcionarDemandaSGAction({
        demandaId: demanda.id,
        coordenadoraNome,
        servidorSGDestinoId: servidorSGAlvo.id,
        servidorSGDestinoNome: servidorSGAlvo.nome,
        servidorSGDestinoCargo: servidorSGAlvo.cargo,
        servidorSGDestinoEmail: servidorSGAlvo.email,
        observacoes: observacoesDirecionamento || undefined,
      });

      if (res.success) {
        setDirecionamentoSucessoInfo({
          servidorNome: servidorSGAlvo.nome,
          servidorCargo: servidorSGAlvo.cargo,
          servidorEmail: servidorSGAlvo.email,
          dataHora: new Date().toISOString(),
        });

        // Dispara evento global para atualização imediata de telas
        window.dispatchEvent(
          new CustomEvent("supergestao_demanda_atualizada", {
            detail: { demandaId: demanda.id, servidorSGId: servidorSGAlvo.id },
          })
        );

        setFase("CONFIRMACAO_FINAL");
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Erro ao direcionar a demanda para o servidor da SG.",
      });
    } finally {
      setLoadingDirecionamento(false);
    }
  };

  const handleCopiarEmailOriginador = () => {
    if (!enquadramentoSucessoInfo?.dadosNotificacao) return;
    const { assunto, corpo } = gerarEmailDemanda(enquadramentoSucessoInfo.dadosNotificacao);
    navigator.clipboard.writeText(`Assunto: ${assunto}\n\n${corpo}`);
    setCopiadoEmail(true);
    setTimeout(() => setCopiadoEmail(false), 2500);
  };

  const handleDiligencia = async () => {
    if (!motivoDiligencia.trim()) {
      setFeedback({
        type: "error",
        text: "Informe o motivo e as orientações de adequação para a Superintendência de origem.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await solicitarDiligenciaSGAction({
        demandaId: demanda.id,
        analistaSG: coordenadoraNome,
        motivoDiligencia,
        servidorOriginadorEmail: emailDestinoOriginador,
        servidorOriginadorNome: demanda.responsavelNome,
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1300);
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao registrar diligência da SG." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Exclusivo da Coordenação Geral / SG */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-sky-900 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200 bg-sky-800/90 border border-sky-600/50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Scale className="h-3 w-3" />
                Coordenação Geral da SG — Competência Privativa
              </span>
              <span className="text-[10px] font-bold text-sky-300 bg-sky-950/80 border border-sky-600/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Notificação Automática Institucional
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {fase === "ENQUADRAMENTO"
                ? "Enquadramento Licitatório & Liberação de Modelos à Unidade Demandante"
                : fase === "DIRECIONAMENTO_SG"
                ? "Direcionamento Formal ao Servidor da SG"
                : "Processo Enquadrado & Direcionado com Sucesso"}
            </h3>
            <p className="text-xs text-sky-200/90 mt-0.5">
              Demanda: <strong className="text-white font-mono">{demanda.numeroDemanda}</strong> &bull; Origem: <strong>{demanda.superintendenciaNome} ({demanda.superintendenciaOrigem})</strong> &bull; Servidor Originador: <strong>{demanda.responsavelNome}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Progresso em Passos Claros (Um de cada vez) */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] ${
                fase === "ENQUADRAMENTO"
                  ? "bg-sky-700 text-white font-bold shadow-2xs"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold"
              }`}
            >
              {fase !== "ENQUADRAMENTO" ? <CheckCircle className="h-3 w-3" /> : "1."}
              Enquadramento &amp; Modelos do Originador
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] ${
                fase === "DIRECIONAMENTO_SG"
                  ? "bg-indigo-700 text-white font-bold shadow-2xs"
                  : fase === "CONFIRMACAO_FINAL"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {fase === "CONFIRMACAO_FINAL" ? <CheckCircle className="h-3 w-3" /> : "2."}
              Direcionamento ao Servidor da SG
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
            Etapas sequenciais e independentes
          </span>
        </div>

        {/* FEEDBACK DE ERRO OU SUCESSO GLOBAL */}
        {feedback && (
          <div className="px-5 pt-3">
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FASE 1: ENQUADRAMENTO LICITATÓRIO & SELEÇÃO DE MODELOS EM CARDS           */}
        {/* ========================================================================= */}
        {fase === "ENQUADRAMENTO" && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* 1. DADOS COMPLETOS DA DEMANDA (Objeto, Justificativa, Itens, Qtds, Setor) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-600" />
                  1. Dados da Demanda Submetida pela Unidade de Origem
                </span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatCurrency(demanda.valorTotalEstimado)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 font-semibold block">Setor e Coordenação de Origem:</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {demanda.superintendenciaNome} ({demanda.superintendenciaOrigem}) &bull; {demanda.coordenacaoOrigem}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Servidor Demandante:</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {demanda.responsavelNome} <span className="font-mono text-sky-800 font-normal">({emailDestinoOriginador})</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold text-[11px] block">Objeto Solicitado:</span>
                <p className="text-slate-800 font-medium mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {demanda.objeto}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold text-[11px] block">Justificativa da Necessidade Pública:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {demanda.justificativaNecessidade}
                </p>
              </div>

              {/* Relação de Itens e Quantitativos */}
              <div>
                <span className="text-slate-700 font-bold text-[11px] block mb-1">
                  Itens, Especificações e Quantidades Solicitadas ({demanda.itens.length}):
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-36 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2 w-10 text-center">#</th>
                        <th className="p-2">Descrição do Item</th>
                        <th className="p-2 w-24">Unidade</th>
                        <th className="p-2 w-24 text-right">Qtd</th>
                        <th className="p-2 w-28 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {demanda.itens.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50/60">
                          <td className="p-2 text-center font-bold text-slate-400">{it.numeroItem}</td>
                          <td className="p-2 font-medium text-slate-800">
                            <div>{it.descricao}</div>
                            {it.especificacaoTecnica && (
                              <div className="text-[10px] text-slate-500 line-clamp-1">{it.especificacaoTecnica}</div>
                            )}
                          </td>
                          <td className="p-2 text-slate-600">{it.unidadeMedida}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            {it.quantidade.toLocaleString()}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-700">
                            {it.valorTotalEstimado ? formatCurrency(it.valorTotalEstimado) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {!modoDiligencia ? (
              <form onSubmit={handleEnquadrarEDevolver} className="space-y-4">
                {/* 2. ENQUADRAMENTO DA MODALIDADE (Decisão da Coordenadora Geral) */}
                <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/40 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-sky-700" />
                      2. Enquadramento da Modalidade Licitatória (Decisão da Coordenadora Geral)
                    </span>
                    <span className="text-[10px] font-bold text-sky-800 bg-white border border-sky-200 px-2 py-0.5 rounded">
                      Lei Federal nº 14.133/2021
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Coordenadora Geral Responsável *
                      </label>
                      <select
                        value={coordenadoraNome}
                        onChange={(e) => setCoordenadoraNome(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="Dra. Willianne Soares (Coordenadora Geral de Gestão / SG - will2026@gmail.com)">
                          Dra. Willianne Soares (Coordenadora Geral de Gestão / SG)
                        </option>
                        <option value="Dr. Carlos Eduardo Menezes (Superintendente de Gestão / SG)">
                          Dr. Carlos Eduardo Menezes (Superintendente de Gestão / SG)
                        </option>
                        <option value="Gabinete da Superintendência de Gestão (SG)">
                          Gabinete da Superintendência de Gestão (SG)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Modalidade Fixada Privativamente pela SG *
                      </label>
                      <select
                        value={modalidadeId}
                        onChange={(e) => setModalidadeId(e.target.value)}
                        className="w-full p-2 border border-sky-300 rounded-lg bg-white text-slate-900 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-2xs"
                      >
                        <optgroup label="Lei nº 14.133/2021 - Licitações e SRP">
                          {MODALIDADES_LICITACAO.filter((m) => m.grupo === "LEI_14133").map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.alias} — {m.artigoBase}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="MROSC - Parcerias com Terceiro Setor (Lei 13.019/14)">
                          {MODALIDADES_LICITACAO.filter((m) => m.grupo === "MROSC_13019").map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.alias}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {modInfo && (
                    <div className="p-2.5 rounded-lg bg-white border border-sky-200 flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                      <div className="text-[11px]">
                        <span className="font-bold text-sky-950">{modInfo.alias}</span> &bull;{" "}
                        <span className="text-slate-600">{modInfo.descricao}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Parecer Técnico &amp; Justificativa do Enquadramento da Coordenadora Geral *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                      placeholder="Fundamente o enquadramento: volume de itens, caráter contínuo, limites de valor da Lei 14.133/2021, inexigibilidade ou registro de preços..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  {/* Autuação Imediata de PA */}
                  <div className="pt-2 border-t border-sky-200 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autuarImediato}
                        onChange={(e) => setAutuarImediato(e.target.checked)}
                        className="h-4 w-4 rounded border-sky-400 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="font-bold text-slate-900 text-xs">
                        Autuar Processo Administrativo Imediatamente com os Itens Cadastrados
                      </span>
                    </label>

                    {autuarImediato && (
                      <select
                        value={selectedDotacaoId}
                        onChange={(e) => setSelectedDotacaoId(e.target.value)}
                        className="p-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-[11px]"
                      >
                        <option value="">Dotação orçamentária (opcional)...</option>
                        {dotacoes.map((dot) => (
                          <option key={dot.id} value={dot.id}>
                            {dot.programaDeTrabalho} (Saldo: {formatCurrency(dot.saldoDisponivel)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* 3. SELEÇÃO EM CARDS DOS MODELOS DA MODALIDADE DISPONIBILIZADOS PARA O SERVIDOR ORIGINÁRIO */}
                <div className="p-4 rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 space-y-3.5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-emerald-700" />
                        3. Seleção de Modelos Disponibilizados para o Servidor Originário *
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Clique nos cards para selecionar quais minutas oficiais da modalidade <strong>{modInfo ? modInfo.alias : modalidadeId}</strong> serão liberadas para o servidor originador preencher.
                      </p>
                    </div>

                    {/* Botões Rápidos de Seleção */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={selecionarTodosModelos}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        ✓ Marcar Todos
                      </button>
                      <button
                        type="button"
                        onClick={selecionarApenasEtpTr}
                        className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        📄 Apenas ETP &amp; TR
                      </button>
                      <button
                        type="button"
                        onClick={desmarcarTodosModelos}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        ✗ Desmarcar
                      </button>
                    </div>
                  </div>

                  {/* Contador de Seleção */}
                  <div className="flex items-center justify-between text-[11px] px-1">
                    <span className="text-slate-600">
                      Modelos Liberados: <strong className="text-emerald-800">{modelosSelecionadosIds.length}</strong> de{" "}
                      <strong>{modelosDisponiveis.length}</strong> modelos da modalidade
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      {Math.round((modelosSelecionadosIds.length / (modelosDisponiveis.length || 1)) * 100)}% Liberados
                    </span>
                  </div>

                  {/* Grid de Cards dos Modelos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                    {modelosDisponiveis.map((mod: ModeloDocumentoProcesso) => {
                      const selecionado = modelosSelecionadosIds.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModeloCard(mod.id)}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                            selecionado
                              ? "bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-300/60"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-500 opacity-80"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-1.5">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  selecionado
                                    ? "bg-emerald-200 text-emerald-900"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {mod.tipoPeca}
                              </span>
                              {selecionado ? (
                                <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-300 shrink-0" />
                              )}
                            </div>

                            <h4
                              className={`text-[11px] font-bold line-clamp-2 leading-tight ${
                                selecionado ? "text-slate-900" : "text-slate-600"
                              }`}
                            >
                              {mod.titulo}
                            </h4>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-mono truncate max-w-[140px]">
                              {mod.artigoLei}
                            </span>
                            <span
                              className={`font-bold ${
                                selecionado ? "text-emerald-700" : "text-slate-400"
                              }`}
                            >
                              {selecionado ? "Liberado" : "Bloqueado"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rodapé da Etapa 1 */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setModoDiligencia(true)}
                    className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Solicitar Diligência à {demanda.superintendenciaOrigem}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    <span>
                      {loading
                        ? "Processando Enquadramento..."
                        : "Concluir Enquadramento & Devolver ao Originador"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Modo de Diligência / Devolução */
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4 text-amber-700" />
                    Devolução em Diligência para {demanda.superintendenciaNome} ({demanda.superintendenciaOrigem})
                  </span>
                  <button
                    type="button"
                    onClick={() => setModoDiligencia(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Voltar ao Enquadramento
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Motivo da Diligência e Instruções de Adequação à {demanda.superintendenciaOrigem} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={motivoDiligencia}
                    onChange={(e) => setMotivoDiligencia(e.target.value)}
                    placeholder="Descreva as orientações de adequação antes do enquadramento definitivo pela SG..."
                    className="w-full p-2.5 border border-amber-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModoDiligencia(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleDiligencia}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{loading ? "Devolvendo..." : "Devolver Demanda em Diligência"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FASE 2: DIRECIONAMENTO FORMAL PARA O SERVIDOR DA SG                       */}
        {/* ========================================================================= */}
        {fase === "DIRECIONAMENTO_SG" && (
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 text-xs animate-in fade-in">
            {/* Banner Sucesso do Enquadramento */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-start gap-3.5 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-emerald-900">
                    Enquadramento Concluído e Devolvido ao Servidor Originador com Sucesso!
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                    Etapa 1 Concluída
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  A demanda foi enquadrada na modalidade <strong>{enquadramentoSucessoInfo?.modalidadeNome || modalidadeId}</strong> e devolvida para <strong>{demanda.responsavelNome}</strong> com{" "}
                  <strong>{modelosSelecionadosIds.length} modelos oficiais liberados</strong>. Notificação automática por e-mail preparada.
                </p>
                {enquadramentoSucessoInfo?.processoNumero && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-mono font-bold text-[11px]">
                    Processo Administrativo Gerado: {enquadramentoSucessoInfo.processoNumero}
                  </span>
                )}
              </div>
            </div>

            {/* Painel de Direcionamento ao Servidor da SG */}
            <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-white shadow-sm space-y-4">
              <div className="pb-3 border-b border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    Direcionar Condução do Processo ao Servidor da SG
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Selecione o servidor da SG responsável por conduzir o processo licitatório.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Acesso Total a Todos os Modelos
                </span>
              </div>

              {/* Informação sobre os privilégios do servidor da SG */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5 leading-relaxed">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  O servidor designado da SG receberá a demanda diretamente em sua <strong>Caixa de Entrada</strong>. 
                  Ele terá <strong>acesso irrestrito a todos os dados cadastrados</strong> e a <strong>todos os 128 modelos oficiais da SG</strong> para instruir o processo e elaborar as peças da sua competência.
                </p>
              </div>

              {/* Seletor do Servidor da SG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-xs">
                    Servidor da SG Designado para Conduzir o Processo *
                  </label>
                  <select
                    value={servidorSGDestinoId}
                    onChange={(e) => setServidorSGDestinoId(e.target.value)}
                    className="w-full p-2.5 border border-indigo-300 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {servidoresSGOpcoes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} — {s.cargo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Dados do Servidor Selecionado:
                  </span>
                  <div className="font-bold text-slate-900 text-xs">{servidorSGAlvo.nome}</div>
                  <div className="text-[11px] text-slate-600">{servidorSGAlvo.cargo}</div>
                  <div className="font-mono text-[10px] text-indigo-700 font-bold">{servidorSGAlvo.email}</div>
                </div>
              </div>

              {/* Instruções / Despacho Opcional para o Servidor da SG */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 text-xs">
                  Instruções / Despacho Interno para o Servidor da SG (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={observacoesDirecionamento}
                  onChange={(e) => setObservacoesDirecionamento(e.target.value)}
                  placeholder="Ex: Segue demanda para prosseguimento e elaboração da minuta de edital. Demandante já está preenchendo os modelos de ETP e TR..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Rodapé da Etapa 2 */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFase("ENQUADRAMENTO")}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                &larr; Voltar para Revisar Enquadramento
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Direcionar Mais Tarde
                </button>
                <button
                  type="button"
                  disabled={loadingDirecionamento}
                  onClick={handleConfirmarDirecionamentoSG}
                  className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4 text-indigo-200" />
                  <span>
                    {loadingDirecionamento
                      ? "Direcionando ao Servidor..."
                      : `Confirmar Direcionamento para ${extrairPrimeiroNome(servidorSGAlvo.nome)} (SG)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FASE 3: CONFIRMAÇÃO FINAL COM AUDITORIA & DISPARO DE E-MAIL               */}
        {/* ========================================================================= */}
        {fase === "CONFIRMACAO_FINAL" && (
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 text-xs animate-in fade-in">
            {/* Banner Conclusão Completa */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-400 text-emerald-950 flex items-start gap-4 shadow-sm">
              <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-extrabold text-sm text-emerald-950">
                  Enquadramento e Direcionamento Concluídos com Sucesso!
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  A demanda <strong>{demanda.numeroDemanda}</strong> foi enquadrada na modalidade <strong>{enquadramentoSucessoInfo?.modalidadeNome || modalidadeId}</strong>.
                  Os modelos oficiais foram liberados para o demandante <strong>{demanda.responsavelNome}</strong> e a condução do processo foi direcionada para <strong>{direcionamentoSucessoInfo?.servidorNome || servidorSGAlvo.nome}</strong> na SG.
                </p>
              </div>
            </div>

            {/* Painel Duplo de Auditoria de Comunicações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Servidor Originador */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-white space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    E-mail Oficial ao Demandante
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Disparado
                  </span>
                </div>
                <div className="text-[11px] text-slate-700">
                  <strong>Destinatário:</strong> {demanda.responsavelNome}
                </div>
                <div className="font-mono text-[10px] text-sky-800 font-bold truncate">
                  {emailDestinoOriginador}
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  {modelosSelecionadosIds.length} modelos oficiais liberados para elaboração técnica.
                </div>
              </div>

              {/* Card 2: Servidor da SG */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-white space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                    Caixa de Entrada da SG Atualizada
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    Ativo na SG
                  </span>
                </div>
                <div className="text-[11px] text-slate-700">
                  <strong>Servidor da SG:</strong> {direcionamentoSucessoInfo?.servidorNome || servidorSGAlvo.nome}
                </div>
                <div className="font-mono text-[10px] text-indigo-800 font-bold truncate">
                  {direcionamentoSucessoInfo?.servidorEmail || servidorSGAlvo.email}
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  Acesso completo a todos os dados e a todos os 128 modelos oficiais da SG.
                </div>
              </div>
            </div>

            {/* Texto do e-mail do demandante para cópia */}
            {enquadramentoSucessoInfo?.dadosNotificacao && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Conteúdo da Notificação Institucional:</span>
                  <button
                    type="button"
                    onClick={handleCopiarEmailOriginador}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiadoEmail ? "Copiado!" : "Copiar Texto"}</span>
                  </button>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 font-mono text-[10px] max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  <strong>Assunto:</strong> {gerarEmailDemanda(enquadramentoSucessoInfo.dadosNotificacao).assunto}
                  {"\n\n"}
                  {gerarEmailDemanda(enquadramentoSucessoInfo.dadosNotificacao).corpo}
                </div>
              </div>
            )}

            {/* Rodapé com botão de fechar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Os registros foram salvos e arquivados no módulo de governança da SG.
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Concluir &amp; Voltar à Tramitação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
