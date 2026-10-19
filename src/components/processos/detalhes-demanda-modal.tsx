"use client";

import { useState } from "react";
import {
  X,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Scale,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  FolderTree,
  Mail,
  MessageSquare,
  Eye,
  CheckCheck,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { DemandaPreviaProcesso } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SUPERINTENDENCIAS_SMS } from "@/data/demandas-previas-data";
import { registrarVisualizacaoDirecionamentoSGAction } from "@/actions/super-gestao-actions";
import {
  gerarLinkEmail,
} from "@/lib/notificacoes-utils";

interface DetalhesDemandaModalProps {
  demanda: DemandaPreviaProcesso | null;
  isOpen: boolean;
  onClose: () => void;
  onAbrirEnquadramentoSG?: (demanda: DemandaPreviaProcesso) => void;
}

export function DetalhesDemandaModal({
  demanda,
  isOpen,
  onClose,
  onAbrirEnquadramentoSG,
}: DetalhesDemandaModalProps) {
  const [salvandoVisualizacao, setSalvandoVisualizacao] = useState(false);
  const [visualizadoLocal, setVisualizadoLocal] = useState<boolean | null>(null);
  const [dataVisualizacaoLocal, setDataVisualizacaoLocal] = useState<string | null>(null);

  if (!isOpen || !demanda) return null;

  const superInfo = SUPERINTENDENCIAS_SMS.find((s) => s.sigla === demanda.superintendenciaOrigem);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENQUADRADA_E_AUTORIZADA":
        return {
          label: "Enquadrada & Autorizada pela SG",
          color: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: CheckCircle,
        };
      case "EM_ANALISE_SG":
        return {
          label: "Em Análise Técnica na SG",
          color: "bg-sky-100 text-sky-800 border-sky-300",
          icon: Clock,
        };
      case "DILIGENCIA_SOLICITADA":
        return {
          label: "Diligência Solicitada pela SG",
          color: "bg-amber-100 text-amber-800 border-amber-300",
          icon: AlertCircle,
        };
      case "INDEFERIDA_SG":
        return {
          label: "Indeferida pela SG",
          color: "bg-rose-100 text-rose-800 border-rose-300",
          icon: X,
        };
      default:
        return {
          label: "Aguardando Enquadramento da SG",
          color: "bg-purple-100 text-purple-800 border-purple-300 animate-pulse",
          icon: Clock,
        };
    }
  };

  const statusBadge = getStatusBadge(demanda.status);
  const StatusIcon = statusBadge.icon;

  const direcionamento = demanda.enquadramentoSG?.direcionamentoSG;
  const notificacoes = demanda.enquadramentoSG?.notificacoesOriginador;

  const isVisualizado = visualizadoLocal !== null ? visualizadoLocal : Boolean(direcionamento?.visualizado);
  const dataVisualizacao = dataVisualizacaoLocal || direcionamento?.dataHoraVisualizacao;

  const handleConfirmarVisualizacaoSG = async () => {
    setSalvandoVisualizacao(true);
    try {
      const res = await registrarVisualizacaoDirecionamentoSGAction({
        demandaId: demanda.id,
        servidorNome: direcionamento?.servidorSGNome || "Servidor SG Responsável",
      });
      if (res.success) {
        setVisualizadoLocal(true);
        setDataVisualizacaoLocal(res.dataHoraVisualizacao || new Date().toISOString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSalvandoVisualizacao(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Superior */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${superInfo?.corBadge || "bg-slate-100"}`}>
                {demanda.superintendenciaOrigem} — {demanda.superintendenciaNome}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${statusBadge.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusBadge.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{demanda.numeroDemanda}</span>
              <span className="text-xs font-normal text-slate-500">
                (Protocolado em: {formatDate(demanda.dataSolicitacao)})
              </span>
            </h3>
            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
              Coordenação Solicitante: <strong className="text-slate-800">{demanda.coordenacaoOrigem}</strong> &bull; Responsável: <strong className="text-slate-800">{demanda.responsavelNome}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Objeto e Justificativa */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div>
              <span className="font-bold text-[11px] text-slate-500 uppercase">Objeto da Demanda:</span>
              <p className="text-slate-900 font-medium text-xs mt-0.5 leading-relaxed">
                {demanda.objeto}
              </p>
            </div>

            {demanda.justificativaNecessidade && (
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-[11px] text-slate-500 uppercase">Justificativa da Necessidade:</span>
                <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                  {demanda.justificativaNecessidade}
                </p>
              </div>
            )}

            {demanda.publicoAlvoOuDestino && (
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-[11px] text-slate-500 uppercase">Destinação / Público-Alvo:</span>
                <p className="text-slate-700 text-xs mt-0.5">
                  {demanda.publicoAlvoOuDestino}
                </p>
              </div>
            )}
          </div>

          {/* Tabela de Itens e Quantidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Itens e Quantidades Submetidos ({demanda.itens.length}):
              </span>
              <span className="font-bold text-emerald-700 font-mono text-xs">
                Total Estimado: {formatCurrency(demanda.valorTotalEstimado)}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Item</th>
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5 w-24">Unidade</th>
                    <th className="p-2.5 w-24 text-right">Quantidade</th>
                    <th className="p-2.5 w-28 text-right">Valor Unit.</th>
                    <th className="p-2.5 w-28 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demanda.itens.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/60">
                      <td className="p-2.5 text-center font-bold text-slate-400">
                        {it.numeroItem}
                      </td>
                      <td className="p-2.5">
                        <span className="font-bold text-slate-900 block">{it.descricao}</span>
                        {it.especificacaoTecnica && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {it.especificacaoTecnica}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600">{it.unidadeMedida}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {it.quantidade.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-600">
                        {it.valorUnitarioEstimado ? formatCurrency(it.valorUnitarioEstimado) : "—"}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                        {it.valorTotalEstimado ? formatCurrency(it.valorTotalEstimado) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Despacho de Enquadramento da SG (Se já realizado) */}
          {demanda.enquadramentoSG ? (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="font-bold text-emerald-950 text-xs uppercase flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Despacho de Enquadramento Legal da Coordenação Geral (SG)
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold font-mono">
                  Despachado em: {formatDate(demanda.enquadramentoSG.dataDespacho)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase">
                    Modalidade Indicada & Fixada pela SG:
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {demanda.enquadramentoSG.modalidadeDefinidaNome}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {demanda.enquadramentoSG.artigoLeiBase}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase">
                    Coordenadora Geral Responsável:
                  </span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {demanda.enquadramentoSG.coordenadoraNome || demanda.enquadramentoSG.analistaSG}
                  </div>
                  {demanda.enquadramentoSG.numeroProcessoGerado && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold text-[11px]">
                      Processo Autuado: {demanda.enquadramentoSG.numeroProcessoGerado}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-900 uppercase">
                  Fundamentação Técnica do Enquadramento:
                </span>
                <p className="text-slate-800 text-xs mt-0.5 leading-relaxed">
                  {demanda.enquadramentoSG.justificativaEnquadramento}
                </p>
              </div>

              {/* ROTEAMENTO DUPLO: 1. DEVOLUÇÃO AO DEMANDANTE + 2. DIRECIONAMENTO AO SERVIDOR DA SG */}
              <div className="pt-3 border-t border-emerald-200 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Roteamento Simultâneo & Auditoria de Comunicações
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bloco 1: Devolução com Notificações Automáticas */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-emerald-700" />
                        1. Devolução ao Servidor Originador
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        Artefatos Liberados
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700">
                      <strong>Servidor:</strong> {demanda.responsavelNome}
                    </div>

                    {/* Status de Notificações */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Mail className="h-3 w-3 text-blue-600" />
                          E-mail Automático:
                        </span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                          <CheckCheck className="h-3 w-3" />
                          Enviado para {notificacoes?.destinatarioEmail || demanda.responsavelEmail || "e-mail cadastrado"}
                        </span>
                      </div>
                    </div>

                    {/* Artefatos Liberados */}
                    {notificacoes?.artefatosDisponibilizados && (
                      <div className="pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Artefatos para Elaboração:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {notificacoes.artefatosDisponibilizados.map((art) => (
                            <span
                              key={art}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[9px] font-semibold"
                            >
                              {art}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botão Ativo de Disparo de E-mail */}
                    <div className="pt-2 border-t border-emerald-100 space-y-1.5">
                      <a
                        href={gerarLinkEmail({
                          servidorNome: demanda.responsavelNome,
                          servidorEmail: notificacoes?.destinatarioEmail || demanda.responsavelEmail || "hellywladi87@gmail.com",
                          numeroDemanda: demanda.numeroDemanda,
                          superintendencia: `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})`,
                          objeto: demanda.objeto,
                          coordenadoraNome: demanda.enquadramentoSG.coordenadoraNome || "Dra. Willianne Soares",
                          modalidadeNome: demanda.enquadramentoSG.modalidadeDefinidaNome,
                          artigoLei: demanda.enquadramentoSG.artigoLeiBase,
                          numeroProcesso: demanda.enquadramentoSG.numeroProcessoGerado,
                          artefatos: notificacoes?.artefatosDisponibilizados || ["DFD", "ETP", "TR"],
                        })}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                        title="Abrir no cliente de e-mail institucional"
                      >
                        <Mail className="h-3 w-3" />
                        <span>Abrir e Testar no E-mail ({notificacoes?.destinatarioEmail || demanda.responsavelEmail || "hellywladi87@gmail.com"})</span>
                      </a>
                    </div>
                  </div>

                  {/* Bloco 2: Direcionamento para Servidor da SG com Rastreio de Visualização */}
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-700" />
                        2. Direcionamento ao Servidor da SG
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                        Andamento do Processo
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-800">
                      <strong>Servidor da SG Designado:</strong>
                      <div className="font-bold text-indigo-900 mt-0.5">
                        {direcionamento?.servidorSGNome || "Servidor da SG Conductor"}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Data e Hora do Direcionamento:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatDate(direcionamento?.dataHoraDirecionamento || demanda.enquadramentoSG.dataDespacho)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Direcionado por:</span>
                        <span className="font-semibold text-slate-700">
                          {direcionamento?.coordenadoraNome || demanda.enquadramentoSG.analistaSG}
                        </span>
                      </div>
                    </div>

                    {/* Status de Visualização do Servidor da SG */}
                    <div className="pt-2 border-t border-indigo-100">
                      {isVisualizado ? (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-900 text-[10px] block">
                              Visualizado pelo Servidor da SG
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono">
                              Registrado em: {formatDate(dataVisualizacao || "")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
                            <div>
                              <span className="font-bold text-amber-900 text-[10px] block">
                                Aguardando Visualização pelo Servidor da SG
                              </span>
                              <span className="text-[10px] text-amber-700">
                                O servidor ainda não acessou o direcionamento.
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={salvandoVisualizacao}
                            onClick={handleConfirmarVisualizacaoSG}
                            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            <span>
                              {salvandoVisualizacao
                                ? "Registrando..."
                                : "Confirmar Visualização como Servidor da SG"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Alerta caso ainda esteja aguardando enquadramento */
            <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/60 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-sky-950 text-xs block">
                  Aguardando Despacho Técnico de Enquadramento da Coordenação Geral
                </span>
                <p className="text-[11px] text-sky-800 mt-0.5">
                  Esta demanda está na fila técnica da Superintendência de Gestão para indicação da modalidade, devolução ao demandante com artefatos e direcionamento ao servidor da SG.
                </p>
              </div>

              {onAbrirEnquadramentoSG && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAbrirEnquadramentoSG(demanda);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-colors shrink-0 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Scale className="h-3.5 w-3.5" /> Enquadrar Agora (Coordenadora Geral)
                </button>
              )}
            </div>
          )}

          {/* Histórico Completo de Tramitação */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
              Histórico Cronológico de Tramitação:
            </span>

            <div className="space-y-2">
              {demanda.historicoTramitacao.map((hist, i) => (
                <div
                  key={hist.id || i}
                  className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span>{hist.origem}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>{hist.destino}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {formatDate(hist.data)}
                    </span>
                  </div>

                  <div className="font-semibold text-sky-900 text-xs">{hist.acao}</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{hist.motivoOuDespacho}</p>
                  <div className="text-[10px] text-slate-400">Responsável: {hist.usuario}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            SuperGestão Saúde &bull; Central de Governança e Tramitação das Superintendências
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
