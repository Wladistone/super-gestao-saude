"use client";

import { useState } from "react";
import { X, Scale, CheckCircle, AlertCircle } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { registrarDemandaJudicialAction } from "@/actions/super-gestao-actions";

interface NovaDemandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovaDemandaModal({
  isOpen,
  onClose,
  onSuccess,
}: NovaDemandaModalProps) {
  const contratos = dataStore.contratos;

  const [numeroProcessoJudicial, setNumeroProcessoJudicial] = useState(
    `500${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 89)}.2025.8.13.0024`
  );
  const [varaJuizo, setVaraJuizo] = useState("1ª Vara da Fazenda Pública Municipal");
  const [poloAtivo, setPoloAtivo] = useState("");
  const [tipoDemanda, setTipoDemanda] = useState<"MEDICAMENTO" | "PROCEDIMENTO_CIRURGIA" | "LEITO_UTI" | "INSUMO">("MEDICAMENTO");
  const [prazoCumprimento, setPrazoCumprimento] = useState("2025-10-10T18:00");
  const [valorEstimado, setValorEstimado] = useState<number>(35000);
  const [prioridade, setPrioridade] = useState("URGÊNCIA MÁXIMA / LIMINAR");
  const [relatoCaso, setRelatoCaso] = useState("");
  const [contratoId, setContratoId] = useState(contratos[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poloAtivo.trim() || !relatoCaso.trim()) {
      setFeedback({ type: "error", text: "Preencha o polo ativo e o relato da decisão judicial." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await registrarDemandaJudicialAction({
        numeroProcessoJudicial,
        varaJuizo,
        poloAtivo,
        tipoDemanda,
        prazoCumprimento: new Date(prazoCumprimento).toISOString(),
        valorEstimado,
        prioridade,
        relatoCaso,
        contratoId: contratoId || undefined,
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
      setFeedback({ type: "error", text: "Erro ao cadastrar demanda judicial." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
              Controle Rigoroso de Liminares
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Cadastrar Demanda Judicial da Saúde
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número do Processo Judicial (CNJ)
              </label>
              <input
                type="text"
                value={numeroProcessoJudicial}
                onChange={(e) => setNumeroProcessoJudicial(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vara / Juízo Competente
              </label>
              <input
                type="text"
                value={varaJuizo}
                onChange={(e) => setVaraJuizo(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Polo Ativo (Paciente / Autor / Defensoria)
            </label>
            <input
              type="text"
              value={poloAtivo}
              onChange={(e) => setPoloAtivo(e.target.value)}
              placeholder="Ex: Maria das Graças Souza (Representada pela Defensoria Pública do Estado)"
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Demanda
              </label>
              <select
                value={tipoDemanda}
                onChange={(e) => setTipoDemanda(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              >
                <option value="MEDICAMENTO">Medicamento</option>
                <option value="PROCEDIMENTO_CIRURGIA">Cirurgia/Procedimento</option>
                <option value="LEITO_UTI">Leito de UTI</option>
                <option value="INSUMO">Insumo / Equipamento</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prazo Fatal (Data e Hora)
              </label>
              <input
                type="datetime-local"
                value={prazoCumprimento}
                onChange={(e) => setPrazoCumprimento(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Valor Estimado (R$)
              </label>
              <input
                type="number"
                value={valorEstimado}
                onChange={(e) => setValorEstimado(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contrato a ser Acionado para Cumprimento Imediato
            </label>
            <select
              value={contratoId}
              onChange={(e) => setContratoId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">Nenhum vínculo imediato</option>
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numeroContrato} - {c.objeto.slice(0, 60)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Relato da Decisão / Medicamento / Cirurgia Determinada
            </label>
            <textarea
              rows={3}
              value={relatoCaso}
              onChange={(e) => setRelatoCaso(e.target.value)}
              placeholder="Descreva a prescrição médica e os cominatória judicial sob pena de bloqueio de contas..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold transition-colors disabled:opacity-50"
            >
              <Scale className="h-4 w-4" />
              <span>{loading ? "Cadastrando..." : "Cadastrar Demanda com Alerta"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
