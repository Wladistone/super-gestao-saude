"use client";

import { useState } from "react";
import { X, Fuel, CheckCircle, AlertCircle } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { registrarAbastecimentoAction } from "@/actions/super-gestao-actions";
import { formatCurrency } from "@/lib/utils";

interface NovoAbastecimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovoAbastecimentoModal({
  isOpen,
  onClose,
  onSuccess,
}: NovoAbastecimentoModalProps) {
  const veiculos = dataStore.veiculos;
  const motoristas = dataStore.motoristas;
  const contratoCombustivel = dataStore.contratos.find((c) =>
    c.objeto.toLowerCase().includes("combustí")
  ) || dataStore.contratos[0];

  const [veiculoId, setVeiculoId] = useState(veiculos[0]?.id || "");
  const [motoristaId, setMotoristaId] = useState(motoristas[0]?.id || "");
  const [tipoCombustivel, setTipoCombustivel] = useState("Diesel S10");
  const [litros, setLitros] = useState<number>(65);
  const [quilometragem, setQuilometragem] = useState<number>(
    (veiculos[0]?.quilometragemAtual || 40000) + 180
  );
  const [cupomFiscal, setCupomFiscal] = useState(`NFC-e ${Math.floor(100000 + Math.random() * 900000)}`);
  const [postoConveniado, setPostoConveniado] = useState("Posto Central Saúde (Unidade Contorno)");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const precoPorLitro = tipoCombustivel.includes("Diesel") ? 6.25 : 6.0;
  const valorTotal = litros * precoPorLitro;

  const handleVeiculoChange = (id: string) => {
    setVeiculoId(id);
    const v = veiculos.find((x) => x.id === id);
    if (v) {
      setQuilometragem(v.quilometragemAtual + 150);
      if (v.modelo.toLowerCase().includes("gol") || v.modelo.toLowerCase().includes("sanitária")) {
        setTipoCombustivel("Gasolina Comum");
      } else {
        setTipoCombustivel("Diesel S10");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratoCombustivel) {
      setFeedback({ type: "error", text: "Nenhum contrato de combustível ativo encontrado." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await registrarAbastecimentoAction({
        veiculoId,
        motoristaId,
        contratoCombustivelId: contratoCombustivel.id,
        quilometragem,
        litros,
        tipoCombustivel,
        cupomFiscal,
        postoConveniado,
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
      setFeedback({ type: "error", text: "Erro ao registrar abastecimento." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
              Controle de Frotas & Transporte Sanitário
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Registrar Abastecimento de Veículo
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Veículo / Ambulância
              </label>
              <select
                value={veiculoId}
                onChange={(e) => handleVeiculoChange(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} - {v.modelo.slice(0, 24)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motorista / Condutor
              </label>
              <select
                value={motoristaId}
                onChange={(e) => setMotoristaId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {motoristas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} ({m.matricula})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo Combustível
              </label>
              <select
                value={tipoCombustivel}
                onChange={(e) => setTipoCombustivel(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                <option value="Diesel S10">Diesel S10</option>
                <option value="Gasolina Comum">Gasolina Comum</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Litros Abastecidos
              </label>
              <input
                type="number"
                step="0.1"
                value={litros}
                onChange={(e) => setLitros(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Odômetro Atual (KM)
              </label>
              <input
                type="number"
                value={quilometragem}
                onChange={(e) => setQuilometragem(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cupom Fiscal Eletrônico (NFC-e)
              </label>
              <input
                type="text"
                value={cupomFiscal}
                onChange={(e) => setCupomFiscal(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Posto Conveniado
              </label>
              <input
                type="text"
                value={postoConveniado}
                onChange={(e) => setPostoConveniado(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Resumo do Valor Total e Dedução do Contrato */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Valor do Abastecimento</span>
              <div className="text-base font-bold text-sky-300">{formatCurrency(valorTotal)}</div>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <div>Dedução do Contrato:</div>
              <strong className="text-emerald-400">{contratoCombustivel?.numeroContrato}</strong>
            </div>
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold transition-colors disabled:opacity-50"
            >
              <Fuel className="h-4 w-4" />
              <span>{loading ? "Registrando..." : "Registrar e Abater"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
