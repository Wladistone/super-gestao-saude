"use client";

import { useState, useRef } from "react";
import { ItemPCA } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { dataStore } from "@/lib/data-store";
import {
  parsearArquivoPCA,
  baixarPlanilhaModeloPCA,
  ResultadoParsePca,
} from "@/lib/pca-parser-service";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Building2,
  FileText,
} from "lucide-react";

interface ImportarPcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  usuarioNome?: string;
}

export function ImportarPcaModal({
  isOpen,
  onClose,
  onSuccess,
  usuarioNome,
}: ImportarPcaModalProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoParsePca | null>(null);
  const [substituirBase, setSubstituirBase] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      await processarArquivo(f);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      await processarArquivo(f);
    }
  };

  const processarArquivo = async (f: File) => {
    setArquivo(f);
    setProcessando(true);
    setFeedback(null);
    setResultado(null);

    try {
      const res = await parsearArquivoPCA(f, usuarioNome);
      if (res.success && res.itens.length > 0) {
        setResultado(res);
        setFeedback({
          tipo: "sucesso",
          mensagem: res.mensagem,
        });
      } else {
        setFeedback({
          tipo: "erro",
          mensagem: res.mensagem || "Não foi possível extrair dados válidos da planilha.",
        });
      }
    } catch (err: any) {
      setFeedback({
        tipo: "erro",
        mensagem: `Erro na leitura: ${err?.message || "Arquivo inválido ou corrompido"}`,
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleConfirmarImportacao = () => {
    if (!resultado || resultado.itens.length === 0) return;

    setSalvando(true);
    try {
      const res = dataStore.importarItensPCA(resultado.itens, substituirBase);
      if (res.success) {
        setFeedback({
          tipo: "sucesso",
          mensagem: `${res.totalImportado} contratação(ões) e ${resultado.totalItensEstimados} itens foram integrados ao PCA com sucesso!`,
        });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setFeedback({ tipo: "erro", mensagem: res.message });
      }
    } catch (err: any) {
      setFeedback({
        tipo: "erro",
        mensagem: `Erro ao salvar: ${err?.message || "Tente novamente"}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-purple-900 via-indigo-900 to-sky-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 backdrop-blur-xs">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Extração Automática de Dados
              </span>
              <span className="text-[10px] font-bold bg-purple-500/30 text-purple-100 border border-purple-400/30 px-2 py-0.5 rounded-full">
                Excel (.xlsx, .xls) & CSV
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight mt-1 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-purple-200" />
              Importar Planilha do PCA da Saúde Atualizado
            </h3>
            <p className="text-xs text-purple-200/90 mt-0.5">
              Insira o arquivo do PCA e o sistema fará a leitura e extração automática de todos os DFDs, itens, quantidades e valores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 shrink-0 ${
              feedback.tipo === "sucesso"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-rose-50 text-rose-800 border-b border-rose-200"
            }`}
          >
            {feedback.tipo === "sucesso" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.mensagem}</span>
          </div>
        )}

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Zona de Upload / Arrastar Arquivo */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-3 ${
              arquivo
                ? "border-emerald-400 bg-emerald-50/40"
                : "border-purple-300 bg-purple-50/30 hover:bg-purple-50/60 hover:border-purple-400"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
              {processando ? (
                <RefreshCw className="h-7 w-7 animate-spin text-purple-600" />
              ) : arquivo ? (
                <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
              ) : (
                <Upload className="h-7 w-7 text-purple-600" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {processando
                  ? "Lendo e interpretando arquivo..."
                  : arquivo
                  ? `Arquivo selecionado: ${arquivo.name}`
                  : "Arraste o arquivo do PCA aqui ou clique para selecionar"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Compatível com arquivos <strong>.xlsx</strong>, <strong>.xls</strong> e <strong>.csv</strong> de qualquer tamanho
              </p>
            </div>

            {/* Botão de baixar modelo de planilha */}
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={baixarPlanilhaModeloPCA}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 text-[11px] font-bold shadow-2xs transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-purple-600" />
                <span>Baixar Modelo Oficial de Planilha PCA (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Resultado da Leitura Automática */}
          {resultado && resultado.itens.length > 0 && (
            <div className="space-y-4 animate-in fade-in">
              {/* KPIs Consolidados Extraídos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-[11px] text-purple-800 font-semibold block uppercase">
                    Contratações / DFDs
                  </span>
                  <span className="text-2xl font-extrabold text-purple-950 font-mono">
                    {resultado.totalContratacoes}
                  </span>
                  <span className="text-[10px] text-purple-700 block mt-0.5">
                    Processos estruturados no PCA
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[11px] text-indigo-800 font-semibold block uppercase">
                    Itens Estimados
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-950 font-mono">
                    {resultado.totalItensEstimados}
                  </span>
                  <span className="text-[10px] text-indigo-700 block mt-0.5">
                    Especificações individuais com preços
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 font-semibold block uppercase">
                    Valor Global Estimado
                  </span>
                  <span className="text-xl font-extrabold text-emerald-900 font-mono">
                    {formatCurrency(resultado.valorGlobal)}
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    Soma financeira consolidada
                  </span>
                </div>
              </div>

              {/* Tabela de Pré-visualização */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-purple-600" />
                    Pré-visualização das Contratações Extraídas da Planilha ({resultado.itens.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Verifique os dados antes de consolidar
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 sticky top-0 font-semibold">
                      <tr>
                        <th className="p-2.5">Nº DFD / Código</th>
                        <th className="p-2.5">Categoria</th>
                        <th className="p-2.5">Objeto da Contratação</th>
                        <th className="p-2.5 text-center">Qtd. Itens</th>
                        <th className="p-2.5 text-right">Valor Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resultado.itens.map((it, idx) => (
                        <tr key={it.id || idx} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-2.5">
                            <span className="font-bold text-slate-900 font-mono block">
                              {it.numeroDFD || it.codigoItem}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {it.codigoItem}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block max-w-[150px] truncate">
                              {it.categoria}
                            </span>
                          </td>
                          <td className="p-2.5 max-w-xs">
                            <p className="line-clamp-2 text-slate-800 font-medium">{it.descricao}</p>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Unidade: {it.unidadeRequisitante || "SAS"} &bull; Prioridade: {it.grauPrioridade || "ALTA"}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {it.itensEstimados ? it.itensEstimados.length : 1} item(ns)
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                            {formatCurrency(it.valorEstimado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Opção de Modo de Importação */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="chkSubstituir"
                    checked={substituirBase}
                    onChange={(e) => setSubstituirBase(e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="chkSubstituir" className="cursor-pointer text-slate-700">
                    <span className="font-bold text-xs block">
                      Substituir base atual do PCA com os dados deste arquivo
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (Se desmarcado, as contratações da planilha serão adicionadas mantendo os dados já existentes)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmarImportacao}
            disabled={!resultado || resultado.itens.length === 0 || salvando}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {salvando
                ? "Gravando no PCA..."
                : `Confirmar e Importar (${resultado?.itens.length || 0} contratações)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
