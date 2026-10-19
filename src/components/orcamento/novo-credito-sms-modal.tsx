"use client";

import { useState, useMemo } from "react";
import { X, PlusCircle, AlertTriangle, CheckCircle, Info, Database } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { adicionarCreditoSMSAction } from "@/actions/super-gestao-actions";
import { CADASTROS_CREDITOS } from "@/data/creditos-adicionais-data";
import { formatCurrency } from "@/lib/utils";

interface NovoCreditoSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovoCreditoSMSModal({
  isOpen,
  onClose,
  onSuccess,
}: NovoCreditoSMSModalProps) {
  const cadastros = dataStore.cadastrosCreditoSMS || CADASTROS_CREDITOS;
  const creditosExistentes = dataStore.creditosSMS;

  const [tipoCredito, setTipoCredito] = useState<string>("Transposição");
  const [solicitante, setSolicitante] = useState<string>(cadastros.solicitantes[0] || "Waléria");
  const [dataCredito, setDataCredito] = useState<string>(() => {
    const hoje = new Date();
    const d = String(hoje.getDate()).padStart(2, "0");
    const m = String(hoje.getMonth() + 1).padStart(2, "0");
    const y = hoje.getFullYear();
    return `${d}/${m}/${y}`;
  });
  const [valor, setValor] = useState<number>(50000);

  // Origem
  const [programaOrigem, setProgramaOrigem] = useState<number | string>(cadastros.programasTrabalho[0] || 2098);
  const [elementoOrigem, setElementoOrigem] = useState<string>(cadastros.elementos[5] || "3.3.9.0.39.00.00.00.0000");
  const [fonteOrigem, setFonteOrigem] = useState<string>(cadastros.fontes[1] || "15001001002");

  // Destino
  const [programaDestino, setProgramaDestino] = useState<number | string>(cadastros.programasTrabalho[1] || 2112);
  const [elementoDestino, setElementoDestino] = useState<string>(cadastros.elementos[5] || "3.3.9.0.39.00.00.00.0000");
  const [fonteDestino, setFonteDestino] = useState<string>(cadastros.fontes[1] || "15001001002");

  const [observacoes, setObservacoes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  // Validação em tempo real conforme as regras originais da planilha
  const destinoJaFoiOrigem = useMemo(() => {
    return creditosExistentes.some(
      (c) =>
        String(c.programaOrigem).trim() === String(programaDestino).trim() &&
        String(c.elementoOrigem).trim() === String(elementoDestino).trim() &&
        String(c.fonteOrigem).trim() === String(fonteDestino).trim()
    );
  }, [creditosExistentes, programaDestino, elementoDestino, fonteDestino]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valor <= 0) {
      setFeedback({ type: "error", text: "Informe um valor positivo para a movimentação." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await adicionarCreditoSMSAction({
        tipoCredito,
        solicitante,
        dataCredito,
        valor,
        programaOrigem,
        elementoOrigem,
        fonteOrigem,
        programaDestino,
        elementoDestino,
        fonteDestino,
        observacoes,
      });

      if (res.success) {
        setFeedback({
          type: res.registro.status === "OK" ? "success" : "warning",
          text: res.message,
        });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao processar inserção na planilha." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded">
                Planilha SMS de Arapiraca
              </span>
              <span className="text-[10px] font-mono text-emerald-300">
                Aba CONTROLE
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Inserir Novo Crédito Adicional
            </h3>
            <p className="text-[11px] text-emerald-100">
              Registra uma nova movimentação orçamentária exatamente na estrutura oficial da planilha.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto grow">
          {feedback && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : feedback.type === "warning"
                  ? "bg-amber-50 text-amber-900 border border-amber-300"
                  : "bg-rose-50 text-rose-900 border border-rose-200"
              }`}
            >
              {feedback.type === "success" && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />}
              {feedback.type === "warning" && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />}
              {feedback.type === "error" && <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />}
              <span className="font-medium">{feedback.text}</span>
            </div>
          )}

          {/* Alerta de Validação da Regra Contábil da Planilha */}
          {destinoJaFoiOrigem && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Restrição Contábil da Planilha Detectada</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Esta conta de destino (<strong>PT {programaDestino} / Elem {elementoDestino} / Fonte {fonteDestino}</strong>) já foi utilizada como origem de recursos em créditos anteriores.
              </p>
              <div className="text-[11px] font-semibold text-rose-700 bg-amber-100/70 p-2 rounded border border-amber-300/60 mt-1">
                ⚠️ Conforme a regra da planilha, o registro será gravado com <strong>STATUS = ERRO</strong> e observação: <em>&ldquo;Este destino recebeu crédito após já ter sido utilizado como origem.&rdquo;</em>
              </div>
            </div>
          )}

          {/* Dados Gerais do Crédito */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tipo do Crédito</label>
              <select
                value={tipoCredito}
                onChange={(e) => setTipoCredito(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="Transposição">Transposição</option>
                <option value="Anulação">Anulação</option>
                <option value="Suplementação">Suplementação</option>
                <option value="Remanejamento">Remanejamento</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Solicitante</label>
              <select
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                {cadastros.solicitantes.map((sol) => (
                  <option key={sol} value={sol}>
                    {sol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Data do Crédito</label>
              <input
                type="text"
                value={dataCredito}
                onChange={(e) => setDataCredito(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
              />
            </div>
          </div>

          {/* Bloco Conta Origem (Saída) */}
          <div className="bg-rose-50/50 border border-rose-200 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>DOTAÇÃO DE ORIGEM (Cedente / Saída de Recursos)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Programa de Trabalho Origem</label>
                <select
                  value={programaOrigem}
                  onChange={(e) => setProgramaOrigem(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {cadastros.programasTrabalho.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Elemento Origem</label>
                <select
                  value={elementoOrigem}
                  onChange={(e) => setElementoOrigem(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {cadastros.elementos.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Fonte Origem</label>
                <select
                  value={fonteOrigem}
                  onChange={(e) => setFonteOrigem(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {cadastros.fontes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bloco Conta Destino (Entrada) */}
          <div className="bg-emerald-50/50 border border-emerald-200 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>DOTAÇÃO DE DESTINO (Beneficiária / Entrada de Recursos)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Programa de Trabalho Destino</label>
                <select
                  value={programaDestino}
                  onChange={(e) => setProgramaDestino(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {cadastros.programasTrabalho.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Elemento Destino</label>
                <select
                  value={elementoDestino}
                  onChange={(e) => setElementoDestino(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {cadastros.elementos.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Fonte Destino</label>
                <select
                  value={fonteDestino}
                  onChange={(e) => setFonteDestino(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {cadastros.fontes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Observações Adicionais</label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Justificativa da transposição ou processo de origem..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
            />
          </div>

          {/* Preview do Lançamento */}
          <div className="bg-slate-100 p-2.5 rounded-lg flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>Status Previsto: <strong className={destinoJaFoiOrigem ? "text-rose-600" : "text-emerald-700"}>{destinoJaFoiOrigem ? "ERRO" : "OK"}</strong></span>
            <span>Valor Formatado: <strong className="text-slate-900 font-bold">{formatCurrency(valor)}</strong></span>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <span>Gravando na Planilha...</span>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Gravar na Planilha</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
