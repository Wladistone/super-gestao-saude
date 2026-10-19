"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Building2,
  FileText,
  ShieldAlert,
  ListOrdered,
} from "lucide-react";
import { DemandaPreviaProcesso, ItemDemandaPrevia } from "@/lib/types";
import { responderDiligenciaAction } from "@/actions/super-gestao-actions";
import { formatCurrency } from "@/lib/utils";

interface ResponderDiligenciaModalProps {
  demanda: DemandaPreviaProcesso | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  nomeServidor?: string;
}

export function ResponderDiligenciaModal({
  demanda,
  isOpen,
  onClose,
  onSuccess,
  nomeServidor = "Servidor Responsável",
}: ResponderDiligenciaModalProps) {
  const [respostaTexto, setRespostaTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen || !demanda) return null;

  // Encontrar o último despacho de diligência
  const ultimoDespachoDiligencia = [...demanda.historicoTramitacao]
    .reverse()
    .find(
      (h) =>
        h.acao.toLowerCase().includes("diligência") ||
        h.origem.includes("Superintendência de Gestão")
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respostaTexto.trim()) {
      setFeedback({
        type: "error",
        text: "Por favor, preencha o esclarecimento ou justificativa da resposta.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await responderDiligenciaAction({
        demandaId: demanda.id,
        usuario: nomeServidor,
        respostaTexto,
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
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Erro ao responder diligência.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-amber-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-bold">
                  {demanda.numeroDemanda}
                </span>
                <span className="text-xs text-amber-200/80">
                  Diligência da Superintendência de Gestão
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Responder Diligência & Reenviar Demanda à SG
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              )}
              <span className="text-xs font-medium">{feedback.text}</span>
            </div>
          )}

          {/* Diligência Solicitada pela SG */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Despacho de Diligência Emitido pela SG
              </span>
              <span className="font-normal text-amber-700">
                {ultimoDespachoDiligencia?.usuario || "Superintendência de Gestão"}
              </span>
            </div>
            <p className="text-xs text-amber-950 font-medium leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-200/60">
              {ultimoDespachoDiligencia?.motivoOuDespacho ||
                "A SG solicitou complementação técnica, documentação ou detalhamento de quantitativos antes da fixação da modalidade licitatória oficial."}
            </p>
          </div>

          {/* Objeto e Itens */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700">Objeto da Demanda</div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {demanda.objeto}
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
              <span>
                Total de Itens: <strong>{demanda.itens.length}</strong>
              </span>
              <span>
                Valor Estimado:{" "}
                <strong className="text-slate-900">
                  {formatCurrency(demanda.valorTotalEstimado)}
                </strong>
              </span>
            </div>
          </div>

          {/* Resposta do Servidor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Esclarecimentos, Justificativa ou Documentação de Resposta *
            </label>
            <textarea
              rows={5}
              value={respostaTexto}
              onChange={(e) => setRespostaTexto(e.target.value)}
              placeholder="Ex: Juntamos os registros da ANVISA vigentes dos lotes solicitados, comprovante do estudo de série histórica de consumo do ano anterior e mapas de zoneamento que justificam os quantitativos calculados..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400"
              required
            />
            <p className="text-[11px] text-slate-500">
              Ao responder, a tramitação retornará à Superintendência de Gestão (SG) com
              status <strong>Aguardando Enquadramento SG</strong>.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-amber-900/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              {loading ? "Reenviando à SG..." : "Enviar Resposta e Devolver à SG"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
