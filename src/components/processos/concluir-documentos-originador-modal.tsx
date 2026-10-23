"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  FileCheck2,
  Mail,
  UserCheck,
  Building2,
  FileText,
} from "lucide-react";
import { DemandaPreviaProcesso } from "@/lib/types";
import { concluirElaboracaoDocumentosOriginadorAction } from "@/actions/super-gestao-actions";

interface ConcluirDocumentosOriginadorModalProps {
  demanda: DemandaPreviaProcesso | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ConcluirDocumentosOriginadorModal({
  demanda,
  isOpen,
  onClose,
  onSuccess,
}: ConcluirDocumentosOriginadorModalProps) {
  const [observacoes, setObservacoes] = useState(
    "Prezada equipe da SG, concluímos a elaboração técnica dos documentos liberados pela Coordenação Geral. Os arquivos, especificações e quantitativos estão conferidos e prontos para prosseguimento da instrução e competências da SG."
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isOpen || !demanda) return null;

  const dirSG = demanda.enquadramentoSG?.direcionamentoSG;
  const servidorSGNome = dirSG?.servidorSGNome || "Dra. Willianne Soares";
  const servidorSGCargo = dirSG?.servidorSGCargo || "Coordenadora Geral de Gestão (SG)";
  const servidorSGEmail = dirSG?.servidorSGEmail || "will2026@gmail.com";

  const modelosLiberados =
    demanda.enquadramentoSG?.modelosDisponibilizadosOriginador &&
    demanda.enquadramentoSG.modelosDisponibilizadosOriginador.length > 0
      ? demanda.enquadramentoSG.modelosDisponibilizadosOriginador
      : [
          { id: "mod-etp", titulo: "Estudo Técnico Preliminar (ETP)", tipoPeca: "ETP" },
          { id: "mod-tr", titulo: "Termo de Referência (TR)", tipoPeca: "TR" },
          { id: "mod-dfd", titulo: "Documento de Formalização da Demanda (DFD)", tipoPeca: "DFD" },
        ];

  const handleConcluir = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const res = await concluirElaboracaoDocumentosOriginadorAction({
        demandaId: demanda.id,
        servidorNome: demanda.responsavelNome || "Servidor Originador",
        servidorEmail: demanda.responsavelEmail || "comprassaude@arapiraca.al.gov.br",
        observacoes,
        documentosProntos: modelosLiberados.map((m) => m.titulo),
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Erro ao registrar conclusão dos documentos e notificação da SG.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-emerald-800 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 bg-emerald-900/80 border border-emerald-600/50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Unidade Técnica Originadora — Conclusão de Documentos
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Concluir Elaboração dos Documentos &amp; Notificar a SG
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Demanda: <strong className="text-white font-mono">{demanda.numeroDemanda}</strong> &bull; Origem: <strong>{demanda.superintendenciaOrigem} / {demanda.coordenacaoOrigem}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário Enxuto */}
        <form onSubmit={handleConcluir} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
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

          {/* Servidor da SG que receberá o aviso */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
              Servidor da SG Designado que Receberá os Documentos:
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{servidorSGNome}</div>
                  <div className="text-[11px] text-slate-500">{servidorSGCargo}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-indigo-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-indigo-600" />
                  {servidorSGEmail}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-indigo-950 pt-1 border-t border-indigo-100 leading-relaxed">
              O servidor da SG terá acesso imediato aos dados cadastrais e a todos os documentos elaborados pela sua equipe para iniciar a elaboração das minutas e atos de sua competência.
            </p>
          </div>

          {/* Documentos que foram elaborados */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5 uppercase">
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
              Documentos Técnicos Elaborados pela Unidade ({modelosLiberados.length}):
            </span>
            <div className="space-y-1.5">
              {modelosLiberados.map((mod, idx) => (
                <div
                  key={mod.id || idx}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 text-[11px]">{mod.titulo}</span>
                      <span className="text-[10px] text-slate-500 block">{mod.tipoPeca}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Elaborado
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mensagem / Observações para o Servidor da SG */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 text-xs">
              Observações / Instruções para o Servidor da SG (Opcional):
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva detalhes ou observações pertinentes para o servidor da SG..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Rodapé com botões */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? "Enviando à SG..." : "Concluir Elaboração & Enviar ao Servidor da SG"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
