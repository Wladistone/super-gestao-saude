"use client";

import { ItemPCA } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  FileText,
  Calendar,
  Building2,
  Tag,
  Layers,
  Sparkles,
  Calculator,
  AlertCircle,
  Clock,
  UserCheck,
} from "lucide-react";

interface DetalhesItemPcaModalProps {
  item: ItemPCA | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetalhesItemPcaModal({
  item,
  isOpen,
  onClose,
}: DetalhesItemPcaModalProps) {
  if (!isOpen || !item) return null;

  const itens = item.itensEstimados || [];
  const qtdTotal = item.quantidadeTotal || itens.reduce((acc, it) => acc + (it.quantidadeEstimada || 0), 0);
  const valorTotal = item.valorEstimado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 backdrop-blur-xs">
                <FileText className="h-3 w-3 text-sky-200" />
                {item.numeroDFD || "DFD Formalizado"}
              </span>
              <span className="text-[10px] font-mono font-bold bg-sky-500/30 text-sky-100 border border-sky-400/30 px-2 py-0.5 rounded-full">
                {item.codigoItem}
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                PCA
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight mt-1">
              Detalhamento da Demanda e Itens Estimados do PCA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Objeto e Informações Principais */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Objeto da Contratação
              </span>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {item.descricao}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Categoria</span>
                <span className="font-bold text-slate-800 text-[11px]">{item.categoria}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Unidade Demandante</span>
                <span className="font-bold text-slate-800 text-[11px]">{item.unidadeRequisitante || "SAS"}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Previsão Contratação</span>
                <span className="font-bold text-slate-800 text-[11px]">{item.dataPrevisaoContratacao || "-"}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Grau de Prioridade</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                  item.grauPrioridade === "ALTA"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : item.grauPrioridade === "MEDIA"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {item.grauPrioridade || "ALTA"}
                </span>
              </div>
            </div>
          </div>

          {/* Tabela de Itens Estimados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-sky-700" />
                Itens Estimados da Contratação ({itens.length > 0 ? itens.length : 1} item(ns))
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Total de Unidades: {qtdTotal.toLocaleString("pt-BR")}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Item</th>
                    <th className="p-2.5">Especificação Técnica</th>
                    <th className="p-2.5 w-24">Unidade</th>
                    <th className="p-2.5 text-right w-24">Qtd. Estimada</th>
                    <th className="p-2.5 text-right w-28">Valor Unit.</th>
                    <th className="p-2.5 text-right w-32">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itens.length > 0 ? (
                    itens.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70">
                        <td className="p-2.5 text-center font-bold text-slate-700">
                          {sub.numeroItem}
                        </td>
                        <td className="p-2.5 font-medium text-slate-800">
                          {sub.descricao}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {sub.unidadeMedida || "Unidade"}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {sub.quantidadeEstimada?.toLocaleString("pt-BR")}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          {formatCurrency(sub.valorUnitarioEstimado || 0)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(sub.valorTotalEstimado || (sub.quantidadeEstimada * sub.valorUnitarioEstimado))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 text-center font-bold text-slate-700">1</td>
                      <td className="p-2.5 font-medium text-slate-800">{item.descricao}</td>
                      <td className="p-2.5 text-slate-600">Global</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">1</td>
                      <td className="p-2.5 text-right font-mono text-slate-700">{formatCurrency(item.valorEstimado)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">{formatCurrency(item.valorEstimado)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Resumo Financeiro */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Valor Estimado Consolidado
                </span>
                <span className="text-xs text-slate-300">
                  Total para o Plano de Contratações da Saúde
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>

          {/* Rodapé Metadados */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" />
              Inserido por: <strong>{item.inseridoPor || "Coordenação Geral de Gestão (SG)"}</strong>
            </span>
            <span>
              Origem: <strong>{item.origemInsercao === "ARQUIVO_IMPORTADO" ? "Planilha Importada" : "Cadastro Manual"}</strong>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
