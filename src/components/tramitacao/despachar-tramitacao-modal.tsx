"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  UserCheck,
} from "lucide-react";
import { DemandaPreviaProcesso } from "@/lib/types";
import { adicionarDespachoAction } from "@/actions/super-gestao-actions";

interface DespacharTramitacaoModalProps {
  demanda: DemandaPreviaProcesso | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  nomeServidor?: string;
  setorServidor?: string;
}

export function DespacharTramitacaoModal({
  demanda,
  isOpen,
  onClose,
  onSuccess,
  nomeServidor = "Servidor Responsável",
  setorServidor = "Superintendência de Gestão (SG)",
}: DespacharTramitacaoModalProps) {
  const [destino, setDestino] = useState(
    demanda?.superintendenciaOrigem
      ? `${demanda.superintendenciaOrigem} - ${demanda.coordenacaoOrigem}`
      : "Superintendência de Gestão (SG)"
  );
  const [acao, setAcao] = useState("Despacho Administrativo / Encaminhamento");
  const [motivoOuDespacho, setMotivoOuDespacho] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen || !demanda) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoOuDespacho.trim()) {
      setFeedback({
        type: "error",
        text: "Por favor, informe o conteúdo do despacho administrativo.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await adicionarDespachoAction({
        demandaId: demanda.id,
        origem: setorServidor,
        destino,
        acao,
        motivoOuDespacho,
        usuario: nomeServidor,
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Erro ao registrar despacho.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 font-bold">
                  {demanda.numeroDemanda}
                </span>
                <span className="text-xs text-slate-300">Tramitação Interna</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Emitir Novo Despacho / Parecer
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm flex-1 overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Origem (Remetente)
              </label>
              <input
                type="text"
                value={setorServidor}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destino (Setor / Órgão) *
              </label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ação ou Finalidade do Despacho *
            </label>
            <input
              type="text"
              value={acao}
              onChange={(e) => setAcao(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Texto do Despacho Administrativo / Instrução *
            </label>
            <textarea
              rows={4}
              value={motivoOuDespacho}
              onChange={(e) => setMotivoOuDespacho(e.target.value)}
              placeholder="Digite o teor do despacho administrativo, considerações técnicas ou encaminhamento..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
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
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              {loading ? "Registrando..." : "Registrar Despacho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
