"use client";

import { useState } from "react";
import { X, Coins, CheckCircle, AlertCircle } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { adicionarCreditoAction } from "@/actions/super-gestao-actions";
import { formatCurrency } from "@/lib/utils";

interface NovoCreditoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovoCreditoModal({
  isOpen,
  onClose,
  onSuccess,
}: NovoCreditoModalProps) {
  const dotacoes = dataStore.dotacoes;
  const processos = dataStore.processos;

  const [tipo, setTipo] = useState<"SUPLEMENTAR" | "ESPECIAL" | "EXTRAORDINARIO">("SUPLEMENTAR");
  const [decretoNumero, setDecretoNumero] = useState(
    `Decreto Municipal nº 4.${Math.floor(600 + Math.random() * 300)}/2025`
  );
  const [valor, setValor] = useState<number>(500000);
  const [origem, setOrigem] = useState<"ANULACAO" | "EXCESSO_ARRECADACAO" | "SUPERAVIT">("SUPERAVIT");
  const [dotacaoDestinoId, setDotacaoDestinoId] = useState(dotacoes[0]?.id || "");
  const [processoOrigemId, setProcessoOrigemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dotacaoDestinoId || valor <= 0) {
      setFeedback({ type: "error", text: "Preencha a dotação de destino e um valor válido." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await adicionarCreditoAction({
        tipo,
        decretoNumero,
        valor,
        origem,
        dotacaoDestinoId,
        processoOrigemId: processoOrigemId || undefined,
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
      setFeedback({ type: "error", text: "Erro ao registrar crédito adicional." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Suplementação Orçamentária
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Homologar Crédito Adicional Suplementar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {feedback && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
            <strong>Vínculo Orçamentário Direto:</strong> O valor homologado será adicionado imediatamente ao saldo disponível da dotação orçamentária selecionada.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Crédito
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="SUPLEMENTAR">Suplementar (Reforço)</option>
                <option value="ESPECIAL">Especial (Nova Ação)</option>
                <option value="EXTRAORDINARIO">Extraordinário (Calamidade)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Origem do Recurso
              </label>
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="SUPERAVIT">Superávit Financeiro</option>
                <option value="EXCESSO_ARRECADACAO">Excesso de Arrecadação</option>
                <option value="ANULACAO">Anulação Parcial/Total de Dotação</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Decreto Municipal Autorizador
            </label>
            <input
              type="text"
              value={decretoNumero}
              onChange={(e) => setDecretoNumero(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Dotação Orçamentária de Destino
            </label>
            <select
              value={dotacaoDestinoId}
              onChange={(e) => setDotacaoDestinoId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {dotacoes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.programaDeTrabalho} - {d.elementoDespesa.slice(0, 45)}... (Atual: {formatCurrency(d.saldoDisponivel)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Valor Suplementado (R$)
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Processo Administrativo de Origem (Opcional)
            </label>
            <select
              value={processoOrigemId}
              onChange={(e) => setProcessoOrigemId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">Nenhum processo vinculado</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numeroProcesso} - {p.objeto.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors disabled:opacity-50"
            >
              <Coins className="h-4 w-4" />
              <span>{loading ? "Homologando..." : "Homologar e Atualizar Saldo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
