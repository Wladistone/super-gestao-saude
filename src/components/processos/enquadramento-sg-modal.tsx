"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Scale,
  Building2,
  FolderTree,
  Send,
  FileCheck2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Mail,
  Clock,
  UserCheck,
  CheckSquare,
  Square,
  ShieldCheck,
  Bell,
  Eye,
  FileText,
  Copy,
} from "lucide-react";
import { DemandaPreviaProcesso } from "@/lib/types";
import { MODALIDADES_LICITACAO, obterModelosPorModalidade, obterModalidadeInfo } from "@/data/modelos-licitacao-catalog";
import { enquadrarDemandaSGAction, solicitarDiligenciaSGAction } from "@/actions/super-gestao-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
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
}

export function EnquadramentoSGModal({
  demanda,
  isOpen,
  onClose,
  onSuccess,
}: EnquadramentoSGModalProps) {
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
  const [observacoes, setObservacoes] = useState("");
  const [autuarImediato, setAutuarImediato] = useState(true);
  const [selectedDotacaoId, setSelectedDotacaoId] = useState("");

  // Servidor da SG para Direcionamento Simultâneo
  const servidoresSGOpcoes = [
    {
      id: "usr-2",
      nome: "Mariana Alcantara Rios",
      cargo: "Diretora de Compras e Contratos / SG",
      email: "mariana.rios@saude.gov.br",
    },
    {
      id: "usr-1",
      nome: "Dr. Carlos Eduardo Menezes",
      cargo: "Superintendente de Gestão / SG",
      email: "carlos.menezes@saude.gov.br",
    },
    {
      id: "usr-6",
      nome: "Lucas Silveira Dantas",
      cargo: "Diretor de Orçamento e Finanças / SG",
      email: "lucas.dantas@saude.gov.br",
    },
    {
      id: "usr-3",
      nome: "Felipe Bastos Oliveira",
      cargo: "Fiscal Técnico Titular e Analista de Contratos / SG",
      email: "felipe.bastos@saude.gov.br",
    },
    {
      id: "serv-valeria-sg",
      nome: "Dra. Valéria Andrade",
      cargo: "Diretoria de Compras e Licitações / SG",
      email: "valeria.andrade@saude.gov.br",
    },
    {
      id: "serv-marcos-asjur",
      nome: "Dr. Marcos Aurélio Fontes",
      cargo: "Assessoria Jurídica da Saúde / ASJUR-SG",
      email: "marcos.fontes@saude.gov.br",
    },
  ];

  const [servidorSGDestinoId, setServidorSGDestinoId] = useState("usr-2");

  // Artefatos disponibilizados para elaboração pelo servidor originador
  const todosArtefatos = [
    "Documento de Formalização da Demanda (DFD)",
    "Estudo Técnico Preliminar (ETP)",
    "Termo de Referência (TR)",
    "Matriz de Gerenciamento de Riscos",
    "Pesquisa Mercadológica / Mapa de Preços",
  ];
  const [artefatosSelecionados, setArtefatosSelecionados] = useState<string[]>([...todosArtefatos]);

  // Modo Diligência
  const [modoDiligencia, setModoDiligencia] = useState(false);
  const [motivoDiligencia, setMotivoDiligencia] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Estado de sucesso com painel de confirmação e disparo de mensagens
  const [notificacaoConcluida, setNotificacaoConcluida] = useState<{
    dados: DadosNotificacaoDemanda;
    mensagem: string;
    processoNumero?: string;
  } | null>(null);
  const [copiadoEmail, setCopiadoEmail] = useState(false);

  if (!isOpen || !demanda) return null;

  const dotacoes = dataStore.dotacoes;
  const modInfo = obterModalidadeInfo(modalidadeId);
  const modelosExigidos = obterModelosPorModalidade(modalidadeId);
  const servidorSGAlvo = servidoresSGOpcoes.find((s) => s.id === servidorSGDestinoId) || servidoresSGOpcoes[0];

  const toggleArtefato = (artefato: string) => {
    if (artefatosSelecionados.includes(artefato)) {
      setArtefatosSelecionados(artefatosSelecionados.filter((a) => a !== artefato));
    } else {
      setArtefatosSelecionados([...artefatosSelecionados, artefato]);
    }
  };

  const emailDestinoOriginador = demanda.responsavelEmail || "hellywladi87@gmail.com";

  const handleEnquadrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!justificativa.trim()) {
      setFeedback({
        type: "error",
        text: "Por favor, emita a justificativa técnica do enquadramento legal realizado pela Coordenadora Geral da SG.",
      });
      return;
    }

    if (!servidorSGDestinoId) {
      setFeedback({
        type: "error",
        text: "Por favor, selecione o servidor da SG para dar andamento ao processo.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await enquadrarDemandaSGAction({
        demandaId: demanda.id,
        analistaSG: coordenadoraNome,
        coordenadoraNome,
        modalidadeDefinidaId: modalidadeId,
        modalidadeDefinidaNome: modInfo ? modInfo.alias : modalidadeId,
        artigoLeiBase: modInfo ? modInfo.artigoBase : "Lei nº 14.133/2021",
        justificativaEnquadramento: justificativa,
        observacoesSG: observacoes || undefined,
        autuarProcessoImediato: autuarImediato,
        dotacaoId: selectedDotacaoId || undefined,
        servidorSGDestinoId: servidorSGAlvo.id,
        servidorSGDestinoNome: `${servidorSGAlvo.nome} (${servidorSGAlvo.cargo})`,
        servidorSGDestinoCargo: servidorSGAlvo.cargo,
        servidorSGDestinoEmail: servidorSGAlvo.email,
        artefatosDisponibilizados: artefatosSelecionados,
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
          artefatos: artefatosSelecionados,
        };

        setNotificacaoConcluida({
          dados: dadosNotif,
          mensagem: res.message,
          processoNumero: res.processoGerado?.numeroProcesso,
        });

        if (onSuccess) onSuccess();
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao processar despacho e direcionamento da SG." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarEmail = () => {
    if (!notificacaoConcluida) return;
    const { assunto, corpo } = gerarEmailDemanda(notificacaoConcluida.dados);
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-250 bg-sky-800/90 border border-sky-600/50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Scale className="h-3 w-3" />
                Coordenação Geral da SG — Enquadramento & Roteamento Duplo
              </span>
              <span className="text-[10px] font-bold text-sky-300 bg-sky-950/80 border border-sky-600/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Disparo Automático de E-mail Institucional
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Enquadramento Licitatório & Direcionamento Simultâneo ao Servidor da SG
            </h3>
            <p className="text-xs text-sky-200/90 mt-0.5">
              Demanda: <strong className="text-white font-mono">{demanda.numeroDemanda}</strong> &bull; Origem: <strong>{demanda.superintendenciaNome} ({demanda.superintendenciaOrigem})</strong> &bull; Servidor Originador: <strong>{demanda.responsavelNome}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Formulário ou Tela de Disparo de Notificações */}
        {notificacaoConcluida ? (
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 text-xs animate-in fade-in">
            {/* Banner Sucesso */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-start gap-3.5 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-emerald-900">
                  Enquadramento Concluído e Autuado com Sucesso!
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  O processo foi direcionado ao servidor da SG e as notificações automáticas para o originador (<strong>{notificacaoConcluida.dados.servidorNome}</strong>) foram preparadas. Confirme os envios abaixo:
                </p>
                {notificacaoConcluida.processoNumero && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-mono font-bold text-[11px]">
                    Processo Autuado: {notificacaoConcluida.processoNumero}
                  </span>
                )}
              </div>
            </div>

            {/* Painel de Disparo de E-mail Institucional */}
            <div className="p-5 rounded-2xl border-2 border-sky-300 bg-white shadow-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                      <Mail className="h-4 w-4" />
                    </div>
                    Disparo de E-mail Institucional Oficial
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-sky-100 text-sky-900 border border-sky-200 truncate max-w-[220px]" title={notificacaoConcluida.dados.servidorEmail}>
                    {notificacaoConcluida.dados.servidorEmail}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Clique no botão azul abaixo para abrir o seu cliente de e-mail corporativo (Outlook/Gmail) com remetente, assunto oficial e o despacho de enquadramento preenchidos:
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  <strong>Assunto:</strong> {gerarEmailDemanda(notificacaoConcluida.dados).assunto}
                  {"\n\n"}
                  {gerarEmailDemanda(notificacaoConcluida.dados).corpo}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={gerarLinkEmail(notificacaoConcluida.dados)}
                  className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Mail className="h-4 w-4" />
                  <span>Abrir Cliente de E-mail (mailto:)</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopiarEmail}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiadoEmail ? "Conteúdo Copiado!" : "Copiar Texto do E-mail"}</span>
                </button>
              </div>
            </div>

            {/* Rodapé com botão de fechar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Os registros de data/hora e ciência do servidor foram arquivados para fins de governança da SG.
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Concluir & Voltar à Tramitação
              </button>
            </div>
          </div>
        ) : (
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl flex items-center gap-2.5 font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Dados da Demanda Submetida pela Coordenação de Origem */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Servidor Demandante de Origem:
                </span>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm">{demanda.responsavelNome}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono font-bold">
                    {demanda.superintendenciaOrigem} / {demanda.coordenacaoOrigem}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Valor Global Estimado:</span>
                <div className="font-mono font-bold text-emerald-700 text-sm">
                  {formatCurrency(demanda.valorTotalEstimado)}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Objeto Solicitado:</span>
              <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">{demanda.objeto}</p>
            </div>

            {/* Relação de Itens e Quantidades Submetidos */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                Itens e Quantidades ({demanda.itens.length}):
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
                        <td className="p-2 font-medium text-slate-800">{it.descricao}</td>
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
            /* Formulário Principal de Enquadramento e Roteamento Duplo */
            <form onSubmit={handleEnquadrar} className="space-y-4">
              {/* 1. SEÇÃO DE DECISÃO TÉCNICA E ENQUADRAMENTO DA MODALIDADE */}
              <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-sky-700" />
                    1. Enquadramento da Demanda (Decisão da Coordenadora Geral)
                  </span>
                  <span className="text-[10px] font-bold text-sky-800 bg-white border border-sky-200 px-2 py-0.5 rounded">
                    Lei Federal nº 14.133/2021
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Coordenadora Geral Responsável pelo Enquadramento *
                    </label>
                    <select
                      value={coordenadoraNome}
                      onChange={(e) => setCoordenadoraNome(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="Dra. Rosana Vasconcelos (Coordenadora Geral de Gestão / SG)">
                        Dra. Rosana Vasconcelos (Coordenadora Geral de Gestão / SG)
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
                      Modalidade Indicada & Fixada Privativamente *
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
                    Parecer Técnico & Justificativa do Enquadramento da Coordenadora Geral *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Fundamente o enquadramento: volume de itens, caráter contínuo, limites de valor da Lei 14.133/2021, inexigibilidade ou registro de preços..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. DIRECIONAMENTO SIMULTÂNEO PARA SERVIDOR DA SG DAR ANDAMENTO */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-700" />
                    2. Direcionar Simultaneamente para Servidor da SG (Dar Andamento ao Processo) *
                  </span>
                  <span className="text-[10px] font-bold text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Auditoria de Dia, Hora & Visualização
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Servidor da SG Designado para Conduzir o Processo *
                    </label>
                    <select
                      value={servidorSGDestinoId}
                      onChange={(e) => setServidorSGDestinoId(e.target.value)}
                      className="w-full p-2 border border-indigo-300 rounded-lg bg-white text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {servidoresSGOpcoes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome} — {s.cargo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-indigo-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-900 block">
                      Rastreabilidade do Direcionamento:
                    </span>
                    <p className="text-[11px] text-slate-700 leading-tight">
                      O sistema registrará o <strong>dia e horário exatos</strong> em que a Coordenadora Geral direcionou o processo para <strong>{servidorSGAlvo.nome}</strong>, bem como monitorará e gravará o <strong>dia e horário em que este servidor visualizar</strong> a demanda.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. DEVOLUÇÃO AO ORIGINADOR COM DISPARO AUTOMÁTICO DE EMAIL INSTITUCIONAL */}
              <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-sky-700" />
                    3. Devolução ao Servidor Originador com Disparo Automático (E-mail Institucional)
                  </span>
                  <span className="text-[10px] font-bold text-sky-800 bg-white border border-sky-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-sky-600" />
                    Envio Automático Oficial
                  </span>
                </div>

                {/* Card Notificação: E-mail Automático */}
                <div className="p-3 bg-white rounded-xl border border-sky-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      E-mail Automático Institucional ao Servidor
                    </span>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Disparo Imediato
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    <strong>Destinatário Oficial:</strong> <span className="font-mono text-blue-800 font-bold">{emailDestinoOriginador}</span>
                  </p>
                  <div className="text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 leading-relaxed font-mono">
                    Assunto: [SG-NOTIFICAÇÃO] Demanda {demanda.numeroDemanda} Enquadrada em {modInfo ? modInfo.alias : modalidadeId}. Artefatos Oficiais Liberados para Elaboração.
                  </div>
                </div>

                {/* Artefatos Técnicos Disponibilizados para Elaboração */}
                <div className="pt-2 border-t border-emerald-200 space-y-1.5">
                  <span className="font-bold text-[11px] text-slate-800 block">
                    Artefatos Técnicos Oficiais Disponibilizados para Elaboração pelo Servidor Originador:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {todosArtefatos.map((art) => {
                      const ativo = artefatosSelecionados.includes(art);
                      return (
                        <button
                          key={art}
                          type="button"
                          onClick={() => toggleArtefato(art)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                            ativo
                              ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold"
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          {ativo ? (
                            <CheckSquare className="h-3.5 w-3.5 text-emerald-700" />
                          ) : (
                            <Square className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <span>{art}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Opção de Autuação Imediata do Processo */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autuarImediato}
                    onChange={(e) => setAutuarImediato(e.target.checked)}
                    className="h-4 w-4 rounded border-sky-400 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-bold text-slate-900 text-xs">
                    Autuar Processo Administrativo Imediatamente com os Itens e Modalidade Fixados
                  </span>
                </label>

                {autuarImediato && (
                  <div className="pt-2 pl-6 space-y-2">
                    <p className="text-[11px] text-slate-600">
                      O sistema gerará automaticamente o número oficial de Processo Administrativo (PA) e vinculará os {demanda.itens.length} itens cadastrados pela {demanda.superintendenciaOrigem}.
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Dotação Orçamentária de Origem (Bloqueio Prévio de Saldo):
                      </label>
                      <select
                        value={selectedDotacaoId}
                        onChange={(e) => setSelectedDotacaoId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="">Selecione a dotação orçamentária (opcional)...</option>
                        {dotacoes.map((dot) => (
                          <option key={dot.id} value={dot.id}>
                            {dot.programaDeTrabalho} | {dot.elementoDespesa} (Saldo: {formatCurrency(dot.saldoDisponivel)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModoDiligencia(true)}
                  className="px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Solicitar Diligência / Ajuste à {demanda.superintendenciaOrigem}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>
                    {loading
                      ? "Processando Enquadramento & Notificações..."
                      : "Concluir Enquadramento, Notificar & Direcionar"}
                  </span>
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
                  placeholder="Ex: Favor reavaliar o quantitativo do Item 2 pois excede a série histórica em 300%. Necessário juntar memória de cálculo do consumo estimado antes do enquadramento definitivo pela SG..."
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
      </div>
    </div>
  );
}
