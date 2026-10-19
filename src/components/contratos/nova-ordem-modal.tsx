"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, ShoppingCart, Lock, Layers } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { emitirOrdemAction } from "@/actions/super-gestao-actions";
import { formatCurrency } from "@/lib/utils";

interface NovaOrdemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contratoIdPreselecionado?: string;
}

export function NovaOrdemModal({
  isOpen,
  onClose,
  onSuccess,
  contratoIdPreselecionado,
}: NovaOrdemModalProps) {
  const contratos = dataStore.contratos;
  const [selectedContratoId, setSelectedContratoId] = useState(
    contratoIdPreselecionado || contratos[0]?.id || ""
  );

  useEffect(() => {
    if (contratoIdPreselecionado) {
      setSelectedContratoId(contratoIdPreselecionado);
    }
    setQuantidades({});
    setObservacoes("");
    setFeedback(null);
  }, [contratoIdPreselecionado, isOpen]);

  const contrato = contratos.find((c) => c.id === selectedContratoId);

  // Armazena as quantidades solicitadas por item
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleQtdChange = (itemId: string, valor: number) => {
    setQuantidades((prev) => ({
      ...prev,
      [itemId]: Math.max(0, valor),
    }));
  };

  // Cálculo total da ordem
  let totalOrdem = 0;
  let hasItemExceeded = false;
  let itemsCount = 0;

  if (contrato?.itens) {
    for (const item of contrato.itens) {
      const qtd = quantidades[item.id] || 0;
      if (qtd > 0) {
        itemsCount++;
        totalOrdem += qtd * item.valorUnitario;
        if (qtd > item.quantidadeDisponivel) {
          hasItemExceeded = true;
        }
      }
    }
  }

  const hasBalanceExceeded = contrato ? totalOrdem > contrato.saldoFinanceiroAtual : false;
  const isBlocked = hasItemExceeded || hasBalanceExceeded || itemsCount === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    setLoading(true);
    setFeedback(null);

    const itensParaEnvio = Object.entries(quantidades)
      .filter(([_, qtd]) => qtd > 0)
      .map(([itemId, qtd]) => ({
        itemContratoId: itemId,
        quantidade: qtd,
      }));

    try {
      const res = await emitirOrdemAction({
        contratoId: selectedContratoId,
        itens: itensParaEnvio,
        observacoes,
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
      setFeedback({ type: "error", text: "Erro ao emitir ordem de fornecimento." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Dedução Reativa Instantânea
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Emitir Ordem de Fornecimento / Serviço (OF/OS)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário com rolagem interna */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
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

          {/* Seleção do Contrato */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Selecione o Contrato Administrativo
            </label>
            <select
              value={selectedContratoId}
              onChange={(e) => {
                setSelectedContratoId(e.target.value);
                setQuantidades({});
              }}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numeroContrato} - {c.objeto.slice(0, 70)}... (Saldo: {formatCurrency(c.saldoFinanceiroAtual)})
                </option>
              ))}
            </select>
          </div>

          {/* Resumo do Saldo do Contrato */}
          {contrato && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Valor Global Contratado</span>
                <div className="font-bold text-slate-800 text-sm">{formatCurrency(contrato.valorGlobal)}</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Saldo Financeiro Atual</span>
                <div className="font-extrabold text-emerald-700 text-sm">
                  {formatCurrency(contrato.saldoFinanceiroAtual)}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Itens do Contrato com Dedução */}
          {contrato?.itens && contrato.itens.length > 0 ? (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Itens Disponíveis para Emissão da Ordem
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {contrato.itens.map((item) => {
                  const qtd = quantidades[item.id] || 0;
                  const itemExceeded = qtd > item.quantidadeDisponivel;
                  const subtotal = qtd * item.valorUnitario;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-all ${
                        itemExceeded
                          ? "bg-rose-50 border-rose-300 text-rose-900"
                          : qtd > 0
                          ? "bg-sky-50/70 border-sky-300"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="font-bold text-slate-900">{item.descricao}</div>
                          <div className="text-[11px] text-slate-500">
                            Unitário: <strong className="text-slate-700">{formatCurrency(item.valorUnitario)}</strong> | 
                            Saldo disponível: <strong className="text-emerald-700 font-bold">{item.quantidadeDisponivel.toLocaleString()} {item.unidadeMedida}</strong>
                          </div>
                          {item.dotacoes && item.dotacoes.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {item.dotacoes.map((dot, dIdx) => (
                                <span key={dIdx} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                                  <Layers className="h-2.5 w-2.5 text-sky-700" />
                                  <strong className="font-mono text-sky-900">PT {dot.programaDeTrabalho}</strong>
                                  <span className="text-slate-400">|</span>
                                  <span className="font-semibold text-emerald-800">{formatCurrency(dot.saldoDotacaoItem)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 uppercase">Subtotal</span>
                          <div className="font-bold text-slate-900">{formatCurrency(subtotal)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Qtd a Solicitar:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.quantidadeDisponivel}
                          value={quantidades[item.id] || ""}
                          onChange={(e) => handleQtdChange(item.id, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-32 p-1.5 border border-slate-300 rounded font-mono font-bold text-right text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <span className="text-[11px] text-slate-500">{item.unidadeMedida}</span>

                        {itemExceeded && (
                          <span className="text-[11px] text-rose-600 font-bold ml-auto flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Quantidade excede saldo!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 py-4 text-center">Nenhum item vinculado a este contrato.</div>
          )}

          {/* Observações da Ordem */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observações / Justificativa da Remessa
            </label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Cota quinzenal para reabastecimento das farmácias das UBS do Distrito Sul..."
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Alerta de Saldo Insuficiente Bloqueante */}
          {hasBalanceExceeded && (
            <div className="p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-rose-700" />
              <span>
                <strong>BLOQUEIO:</strong> O valor total desta ordem ({formatCurrency(totalOrdem)}) excede o saldo financeiro disponível do contrato ({formatCurrency(contrato?.saldoFinanceiroAtual || 0)}). Reduza as quantidades para prosseguir.
              </span>
            </div>
          )}

          {/* Barra de Totais */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total da Ordem (OF)</span>
              <div className="text-lg font-black text-sky-300">{formatCurrency(totalOrdem)}</div>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <div>Novo Saldo Contratual:</div>
              <strong className={hasBalanceExceeded ? "text-rose-400" : "text-emerald-400"}>
                {contrato ? formatCurrency(Math.max(0, contrato.saldoFinanceiroAtual - totalOrdem)) : "-"}
              </strong>
            </div>
          </div>

          {/* Ações */}
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
              disabled={isBlocked || loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{loading ? "Processando..." : "Emitir Ordem e Abater Saldo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
