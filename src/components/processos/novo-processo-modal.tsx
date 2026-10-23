"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Check,
  AlertCircle,
  Download,
  FolderTree,
  Scale,
  Sparkles,
  Building2,
  FileEdit,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { criarProcessoAction } from "@/actions/super-gestao-actions";
import { formatCurrency } from "@/lib/utils";
import {
  MODALIDADES_LICITACAO,
  obterModelosPorModalidade,
  obterModalidadeInfo,
} from "@/data/modelos-licitacao-catalog";
import { DocumentoElaborado } from "@/lib/types";
import { gerarDocumentoInicial } from "@/lib/documento-templates-service";
import { ElaboradorDocumentoModal } from "@/components/documentos/elaborador-documento-modal";

interface NovoProcessoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovoProcessoModal({ isOpen, onClose, onSuccess }: NovoProcessoModalProps) {
  const [step, setStep] = useState(1);
  const [numeroProcesso, setNumeroProcesso] = useState(
    `PA-2025/00${Math.floor(100 + Math.random() * 900)}`
  );
  const [numeroCapa, setNumeroCapa] = useState(`CP-${Math.floor(100 + Math.random() * 900)}/25`);
  const [objeto, setObjeto] = useState("");
  const [selectedDemandaId, setSelectedDemandaId] = useState("");
  const [selectedModalidade, setSelectedModalidade] = useState(
    "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO"
  );
  const [selectedPcaId, setSelectedPcaId] = useState("");
  const [selectedDotacaoId, setSelectedDotacaoId] = useState("");
  const [valorEstimado, setValorEstimado] = useState<number>(150000);
  const [setorAtual, setSetorAtual] = useState("Fase Preparatória / Coordenação Solicitante");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [verTodosModelos, setVerTodosModelos] = useState(false);
  const [documentoParaElaborar, setDocumentoParaElaborar] = useState<DocumentoElaborado | null>(null);

  if (!isOpen) return null;

  const itensPca = dataStore.pca;
  const dotacoes = dataStore.dotacoes;
  const demandasAutorizadas = dataStore.demandasPrevias.filter(
    (d) => d.status === "ENQUADRADA_E_AUTORIZADA"
  );
  const demandaSelecionada = demandasAutorizadas.find((d) => d.id === selectedDemandaId);

  // Modelos associados à modalidade escolhida
  const modelosModalidade = obterModelosPorModalidade(selectedModalidade);
  const modalidadeInfo = obterModalidadeInfo(selectedModalidade);

  const handleDemandaChange = (demId: string) => {
    setSelectedDemandaId(demId);
    if (!demId) return;

    const dem = demandasAutorizadas.find((d) => d.id === demId);
    if (dem) {
      setObjeto(dem.objeto);
      setSetorAtual(`${dem.superintendenciaOrigem} - ${dem.coordenacaoOrigem}`);
      setValorEstimado(dem.valorTotalEstimado);
      if (dem.enquadramentoSG?.modalidadeDefinidaId) {
        setSelectedModalidade(dem.enquadramentoSG.modalidadeDefinidaId);
      }
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!objeto.trim()) {
        setFeedback({
          type: "error",
          text: "Por favor, descreva o objeto do processo administrativo.",
        });
        return;
      }
      if (!selectedModalidade) {
        setFeedback({
          type: "error",
          text: "Por favor, selecione a modalidade da contratação / ato administrativo.",
        });
        return;
      }
    }
    setFeedback(null);
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await criarProcessoAction({
        numeroProcesso,
        numeroCapa,
        objeto,
        setorAtual,
        itemPcaId: selectedPcaId || undefined,
        dotacaoId: selectedDotacaoId || undefined,
        valorEstimado: valorEstimado || undefined,
        modalidade: modalidadeInfo ? modalidadeInfo.alias : selectedModalidade,
        demandaPreviaId: selectedDemandaId || undefined,
        superintendenciaOrigem: demandaSelecionada?.superintendenciaOrigem,
        itensProcesso: demandaSelecionada?.itens,
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao processar solicitação." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header com Stepper */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Scale className="h-3 w-3" />
                Lei nº 14.133/2021 & MROSC 13.019
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                114 Modelos Oficiais Integrados
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Novo Processo Administrativo & Instrução Licitatória
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold shrink-0">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-sky-700 font-bold" : "text-slate-400"}`}>
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 1 ? "bg-sky-600 text-white" : "bg-slate-300 text-slate-600"
              }`}
            >
              1
            </span>
            <span>Identificação & Modalidade</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-sky-700 font-bold" : "text-slate-400"}`}>
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 2 ? "bg-sky-600 text-white" : "bg-slate-300 text-slate-600"
              }`}
            >
              2
            </span>
            <span>PCA & Orçamento</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <div className={`flex items-center gap-2 ${step === 3 ? "text-sky-700 font-bold" : "text-slate-400"}`}>
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 3 ? "bg-sky-600 text-white" : "bg-slate-300 text-slate-600"
              }`}
            >
              3
            </span>
            <span>Revisão & Processo</span>
          </div>
        </div>

        {/* Corpo do Formulário com Rolagem Própria */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número do Processo Administrativo *
                  </label>
                  <input
                    type="text"
                    value={numeroProcesso}
                    onChange={(e) => setNumeroProcesso(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número da Capa de Autuação *
                  </label>
                  <input
                    type="text"
                    value={numeroCapa}
                    onChange={(e) => setNumeroCapa(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* VÍNCULO COM DEMANDA PRÉVIA ENQUADRADA PELA SG */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-indigo-700" />
                    Vincular a uma Demanda Prévia Enquadrada pela SG (Governança SMS)
                  </label>
                  <span className="text-[10px] font-bold text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded">
                    SAS, SUVIG, SGTES, SURCAA ➔ SG
                  </span>
                </div>

                <select
                  value={selectedDemandaId}
                  onChange={(e) => handleDemandaChange(e.target.value)}
                  className="w-full p-2.5 border border-indigo-300 rounded-lg bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
                >
                  <option value="">Abertura Direta pela SG (sem demanda prévia vinculada)...</option>
                  {demandasAutorizadas.map((dem) => (
                    <option key={dem.id} value={dem.id}>
                      {dem.numeroDemanda} — [{dem.superintendenciaOrigem}] {dem.objeto.slice(0, 75)}... ({formatCurrency(dem.valorTotalEstimado)}) [Modalidade SG: {dem.enquadramentoSG?.modalidadeDefinidaNome}]
                    </option>
                  ))}
                </select>

                {demandaSelecionada?.enquadramentoSG && (
                  <div className="p-2.5 rounded-lg bg-white border border-indigo-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">
                        Modalidade Fixada Exclusivamente pela SG: {demandaSelecionada.enquadramentoSG.modalidadeDefinidaNome}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {demandaSelecionada.enquadramentoSG.artigoLeiBase}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">
                      {demandaSelecionada.enquadramentoSG.justificativaEnquadramento}
                    </p>
                  </div>
                )}
              </div>

              {/* SELEÇÃO DE MODALIDADE COM BASE NOS MODELOS DO SISTEMA LICITAÇÃO */}
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-sky-950 text-xs">
                    Modalidade / Procedimento de Contratação (Modelos Integrados) *
                  </label>
                  {modalidadeInfo && (
                    <span className="text-[10px] font-semibold text-sky-800 bg-white border border-sky-200 px-2 py-0.5 rounded">
                      {modalidadeInfo.artigoBase}
                    </span>
                  )}
                </div>

                <select
                  value={selectedModalidade}
                  onChange={(e) => setSelectedModalidade(e.target.value)}
                  className="w-full p-2.5 border border-sky-300 rounded-lg bg-white text-slate-900 font-medium text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
                >
                  <optgroup label="Lei nº 14.133/2021 - Sistema de Registro de Preços & Licitações">
                    {MODALIDADES_LICITACAO.filter((m) => m.grupo === "LEI_14133").map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.alias} — {m.artigoBase}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="MROSC - Parcerias com Terceiro Setor (Lei nº 13.019/2014)">
                    {MODALIDADES_LICITACAO.filter((m) => m.grupo === "MROSC_13019").map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.alias}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {modalidadeInfo && (
                  <p className="text-[11px] text-sky-900/80 leading-relaxed">
                    {modalidadeInfo.descricao}
                  </p>
                )}

                {/* Prévia das Peças / Documentos Oficiais Disponíveis */}
                <div className="mt-3 pt-3 border-t border-sky-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                      <FolderTree className="h-3.5 w-3.5 text-sky-700" />
                      Documentos Oficiais desta Modalidade ({modelosModalidade.length} minutas .docx)
                    </span>
                    {modelosModalidade.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setVerTodosModelos(!verTodosModelos)}
                        className="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline"
                      >
                        {verTodosModelos ? "Recolher lista" : `Ver todos (${modelosModalidade.length})`}
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(verTodosModelos ? modelosModalidade : modelosModalidade.slice(0, 3)).map(
                      (mod) => (
                        <div
                          key={mod.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px] hover:border-sky-300 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            <span className="h-5 w-5 rounded bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {mod.ordem}
                            </span>
                            <div className="truncate">
                              <span className="font-semibold text-slate-900 truncate block">
                                {mod.titulo}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {mod.tipoPeca} &bull; {mod.artigoLei}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const docInit = gerarDocumentoInicial(mod, {
                                  numeroProcesso,
                                  numeroCapa,
                                  objeto: objeto || undefined,
                                  modalidade: selectedModalidade,
                                  demandaId: selectedDemandaId || undefined,
                                });
                                setDocumentoParaElaborar(docInit);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-800 text-white font-bold text-[10px] shrink-0 transition-colors shadow-2xs"
                              title="Elaborar Minuta Oficial na Plataforma com Timbre Preservado"
                            >
                              <FileEdit className="h-3 w-3" />
                              <span>Elaborar</span>
                            </button>
                            <a
                              href={mod.downloadUrl}
                              download
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] shrink-0 transition-colors border border-slate-200"
                              title="Baixar Modelo em Branco .docx"
                            >
                              <Download className="h-3 w-3" />
                              .docx
                            </a>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Objeto da Contratação / Aquisição *
                </label>
                <textarea
                  rows={3}
                  value={objeto}
                  onChange={(e) => setObjeto(e.target.value)}
                  placeholder="Ex: Aquisição emergencial de medicamentos oncológicos e insumos de nutrição enteral para a rede de Atenção Básica e UPAs..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Setor Solicitante Responsável
                </label>
                <select
                  value={setorAtual}
                  onChange={(e) => setSetorAtual(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="Fase Preparatória / Coordenação Solicitante">
                    Fase Preparatória / Coordenação Solicitante
                  </option>
                  <option value="Coordenação de Farmácia e Insumos (CAF)">
                    Coordenação de Farmácia e Insumos (CAF)
                  </option>
                  <option value="Superintendência de Gestão e Planejamento">
                    Superintendência de Gestão e Planejamento
                  </option>
                  <option value="Diretoria de Atenção Básica (DAB)">
                    Diretoria de Atenção Básica (DAB)
                  </option>
                  <option value="Coordenação de Urgência e Emergência (UPAs)">
                    Coordenação de Urgência e Emergência (UPAs)
                  </option>
                  <option value="Assessoria Jurídica da Saúde (ASJUR)">
                    Assessoria Jurídica da Saúde (ASJUR)
                  </option>
                  <option value="Departamento de Compras e Licitações (CPL)">
                    Departamento de Compras e Licitações (CPL)
                  </option>
                  <option value="Divisão de Contratos e Convênios">
                    Divisão de Contratos e Convênios
                  </option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
                <span className="font-bold">Regra de Negócio Automática (Ciclo do PCA):</span> Ao vincular este processo a um item do PCA, seu status será automaticamente promovido para <strong>&quot;Em Licitação&quot;</strong>.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vínculo com Plano de Contratações Anual (PCA)
                </label>
                <select
                  value={selectedPcaId}
                  onChange={(e) => setSelectedPcaId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">Selecione um item do PCA (opcional)...</option>
                  {itensPca.map((pca) => (
                    <option key={pca.id} value={pca.id}>
                      {pca.codigoItem} - {pca.descricao} ({formatCurrency(pca.valorEstimado)}) [{pca.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dotação Orçamentária de Origem (Bloqueio Prévio de Saldo)
                </label>
                <select
                  value={selectedDotacaoId}
                  onChange={(e) => setSelectedDotacaoId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">Selecione a dotação orçamentária...</option>
                  {dotacoes.map((dot) => (
                    <option key={dot.id} value={dot.id}>
                      {dot.programaDeTrabalho} | {dot.elementoDespesa} (Disponível: {formatCurrency(dot.saldoDisponivel)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Valor Estimado da Contratação (R$)
                </label>
                <input
                  type="number"
                  value={valorEstimado}
                  onChange={(e) => setValorEstimado(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-xs animate-in fade-in">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {numeroProcesso}
                    </span>
                    <span className="font-mono text-xs text-slate-500">Capa: {numeroCapa}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {modalidadeInfo?.alias || selectedModalidade}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Objeto:</div>
                  <div className="text-slate-800 font-medium">{objeto}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500">Setor Solicitante:</span>{" "}
                    <strong className="text-slate-800 block">{setorAtual}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Valor Estimado:</span>{" "}
                    <strong className="text-emerald-700 block">
                      {formatCurrency(valorEstimado)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-sky-900">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  Processo Integrado com {modelosModalidade.length} Minutas Oficiais
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Ao autuar o processo, ele receberá o fluxo legal de documentos (DFD, ETP, Matriz de Risco, TR, Portaria, Pesquisa de Preços, Parecer Jurídico), com download direto dos modelos em formato <strong>.docx editável</strong> do <strong>SISTEMA LICITAÇÃO</strong>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Processo pronto para tramitação com numeração oficial e sincronização imediata no painel.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Navegação */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-colors"
            >
              Avançar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{loading ? "Autuando..." : "Confirmar e Autuar Processo"}</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL DE ELABORAÇÃO DO DOCUMENTO OFICIAL NA PLATAFORMA */}
      {documentoParaElaborar && (
        <ElaboradorDocumentoModal
          documentoInicial={documentoParaElaborar}
          isOpen={true}
          onClose={() => setDocumentoParaElaborar(null)}
          onSalvo={(docSalvo) => {
            // Se o documento elaborado alterou o objeto e ainda estava em branco, sincroniza
            if (!objeto && docSalvo.objeto) {
              setObjeto(docSalvo.objeto);
            }
          }}
        />
      )}
    </div>
  );
}

