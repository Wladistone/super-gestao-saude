"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Scale,
  FolderTree,
  ChevronRight,
  ShieldCheck,
  Check,
  Search,
  FileEdit,
} from "lucide-react";
import { ProcessoAdministrativo, DocumentoElaborado } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  obterModelosPorModalidade,
  obterModalidadeInfo,
  ModeloDocumentoProcesso,
  MODALIDADES_LICITACAO,
} from "@/data/modelos-licitacao-catalog";
import { dataStore } from "@/lib/data-store";
import { gerarDocumentoInicial } from "@/lib/documento-templates-service";
import { ElaboradorDocumentoModal } from "@/components/documentos/elaborador-documento-modal";

interface DossieProcessoModalProps {
  processo: ProcessoAdministrativo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DossieProcessoModal({ processo, isOpen, onClose }: DossieProcessoModalProps) {
  const [statusMap, setStatusMap] = useState<Record<string, "CONCLUIDO" | "EM_ANDAMENTO" | "PENDENTE">>({});
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [busca, setBusca] = useState<string>("");
  const [documentoParaElaborar, setDocumentoParaElaborar] = useState<DocumentoElaborado | null>(null);

  if (!isOpen || !processo) return null;

  const modalidade = processo.modalidade || "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO";
  const modalidadeInfo = obterModalidadeInfo(modalidade);
  const modelos = obterModelosPorModalidade(modalidade);

  // Status defaults: primeiro pode estar em andamento ou concluído
  const getDocumentStatus = (modId: string, index: number) => {
    if (statusMap[modId]) return statusMap[modId];
    if (index === 0) return "CONCLUIDO";
    if (index === 1) return "EM_ANDAMENTO";
    return "PENDENTE";
  };

  const toggleStatus = (modId: string, index: number) => {
    const atual = getDocumentStatus(modId, index);
    const proximo =
      atual === "PENDENTE"
        ? "EM_ANDAMENTO"
        : atual === "EM_ANDAMENTO"
        ? "CONCLUIDO"
        : "PENDENTE";
    setStatusMap((prev) => ({ ...prev, [modId]: proximo }));
  };

  const modelosFiltrados = modelos.filter((m) => {
    if (filtroTipo !== "TODOS" && m.tipoPeca !== filtroTipo) return false;
    if (busca.trim()) {
      const b = busca.toLowerCase();
      return (
        m.titulo.toLowerCase().includes(b) ||
        m.tipoPeca.toLowerCase().includes(b) ||
        m.artigoLei.toLowerCase().includes(b)
      );
    }
    return true;
  });

  const concluidosCount = modelos.filter((m, i) => getDocumentStatus(m.id, i) === "CONCLUIDO").length;
  const porcentagem = Math.round((concluidosCount / (modelos.length || 1)) * 100);

  // Lista de tipos de peças únicas nesta modalidade
  const tiposPecas = Array.from(new Set(modelos.map((m) => m.tipoPeca)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Superior */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Scale className="h-3 w-3" />
                Instrução do Processo
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200/70 border border-slate-300 px-2 py-0.5 rounded-full">
                {modalidadeInfo?.alias || modalidade}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                {modelos.length} Modelos Oficiais .docx
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{processo.numeroProcesso}</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                (Capa: {processo.numeroCapa})
              </span>
            </h3>
            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 max-w-2xl">
              <span className="font-semibold text-slate-700">Objeto:</span> {processo.objeto}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Progresso e Métricas */}
        <div className="px-5 py-3 bg-sky-50/60 border-b border-sky-200/70 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
              {porcentagem}%
            </div>
            <div>
              <div className="font-bold text-sky-950">Progresso dos Atos da Fase Preparatória</div>
              <div className="text-[11px] text-sky-800">
                {concluidosCount} de {modelos.length} peças instruídas e prontas
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {processo.valorEstimado ? (
              <div className="bg-white px-2.5 py-1 rounded border border-sky-200">
                <span className="text-slate-500">Valor Estimado:</span>{" "}
                <span className="font-bold text-emerald-700">
                  {formatCurrency(processo.valorEstimado)}
                </span>
              </div>
            ) : null}
            <div className="bg-white px-2.5 py-1 rounded border border-sky-200">
              <span className="text-slate-500">Setor:</span>{" "}
              <span className="font-bold text-slate-800">{processo.setorAtual}</span>
            </div>
          </div>
        </div>

        {/* Filtros e Busca de Peças */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar peça por título, tipo ou artigo legal..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full text-xs bg-transparent border-0 focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Filtrar:</span>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todos os tipos ({modelos.length})</option>
              {tiposPecas.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista Sequencial de Documentos / Pipeline */}
        <div className="p-5 space-y-2.5 overflow-y-auto flex-1">
          {modelosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma peça encontrada para os filtros selecionados.
            </div>
          ) : (
            modelosFiltrados.map((mod, index) => {
              const status = getDocumentStatus(mod.id, index);

              return (
                <div
                  key={mod.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    status === "CONCLUIDO"
                      ? "bg-emerald-50/40 border-emerald-200"
                      : status === "EM_ANDAMENTO"
                      ? "bg-amber-50/40 border-amber-200"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* Informações da Peça */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        status === "CONCLUIDO"
                          ? "bg-emerald-600 text-white"
                          : status === "EM_ANDAMENTO"
                          ? "bg-amber-500 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {mod.ordem.toString().padStart(2, "0")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {mod.titulo}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {mod.tipoPeca}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Fundamentação: <strong className="text-slate-700">{mod.artigoLei}</strong></span>
                        <span>&bull;</span>
                        <span>Arquivo: <span className="font-mono text-[10px] text-slate-600">.docx ({Math.round(mod.tamanhoBytes / 1024)} KB)</span></span>
                      </div>
                    </div>
                  </div>

                    {/* Ações: Elaborar na Plataforma + Download Direto */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {/* Botão de Toggle do Status */}
                      <button
                        type="button"
                        onClick={() => toggleStatus(mod.id, index)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors inline-flex items-center gap-1 ${
                          status === "CONCLUIDO"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : status === "EM_ANDAMENTO"
                            ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Clique para alternar o status da peça na instrução processual"
                      >
                        {status === "CONCLUIDO" && <Check className="h-3 w-3" />}
                        {status === "EM_ANDAMENTO" && <Clock className="h-3 w-3" />}
                        {status === "PENDENTE" && <AlertCircle className="h-3 w-3" />}
                        <span>
                          {status === "CONCLUIDO"
                            ? "Instruído"
                            : status === "EM_ANDAMENTO"
                            ? "Em Elaboração"
                            : "Pendente"}
                        </span>
                      </button>

                      {/* Botão para Elaborar Diretamente na Plataforma com Timbre */}
                      <button
                        type="button"
                        onClick={() => {
                          const docExistente = dataStore.obterDocumentoElaboradoPorModelo(processo.id, mod.id) ||
                            dataStore.obterDocumentoElaboradoPorModelo(processo.numeroProcesso, mod.id);
                          if (docExistente) {
                            setDocumentoParaElaborar(docExistente);
                          } else {
                            const novo = gerarDocumentoInicial(mod, {
                              processoId: processo.id,
                              numeroProcesso: processo.numeroProcesso,
                              numeroCapa: processo.numeroCapa,
                              objeto: processo.objeto,
                              modalidade: processo.modalidade,
                              superintendenciaOrigem: processo.superintendenciaOrigem,
                              valorEstimado: processo.valorEstimado,
                              itens: processo.itensProcesso?.map((it) => ({
                                descricao: it.descricao,
                                unidade: it.unidadeMedida,
                                quantidade: it.quantidade,
                                valorUnitario: it.valorUnitarioEstimado,
                                valorTotal: it.valorTotalEstimado,
                              })),
                            });
                            setDocumentoParaElaborar(novo);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs"
                        title="Elaborar ou Editar esta peça na própria plataforma com timbre oficial"
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                        <span>Elaborar na Plataforma</span>
                      </button>

                      {/* Botão de Download da Minuta Oficial do SISTEMA LICITAÇÃO */}
                      <a
                        href={mod.downloadUrl}
                        download
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1 border border-slate-200"
                        title="Baixar Minuta Oficial em Branco em Word (.docx)"
                      >
                        <Download className="h-3 w-3" />
                        <span>.docx</span>
                      </a>
                    </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé com Informações da Origem dos Modelos */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <FolderTree className="h-4 w-4 text-sky-600" />
            <span>
              Modelos extraídos diretamente de <strong className="text-slate-700">C:\SISTEMA LICITAÇÃO</strong> (114 modelos padronizados).
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Fechar Processo
          </button>
        </div>
      </div>

      {/* MODAL DE ELABORAÇÃO DO DOCUMENTO OFICIAL NA PLATAFORMA */}
      {documentoParaElaborar && (
        <ElaboradorDocumentoModal
          documentoInicial={documentoParaElaborar}
          isOpen={true}
          onClose={() => setDocumentoParaElaborar(null)}
          onSalvo={(docSalvo) => {
            // Atualiza o status da peça no dossiê para CONCLUIDO
            setStatusMap((prev) => ({
              ...prev,
              [docSalvo.modeloId]: "CONCLUIDO",
            }));
          }}
        />
      )}
    </div>
  );
}
