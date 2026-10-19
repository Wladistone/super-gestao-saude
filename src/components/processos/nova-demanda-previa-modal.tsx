"use client";

import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Building2,
  FileText,
  ListOrdered,
  DollarSign,
  ShieldAlert,
  Send,
} from "lucide-react";
import { SuperintendenciaSigla } from "@/lib/types";
import { SUPERINTENDENCIAS_SMS } from "@/data/demandas-previas-data";
import { criarDemandaPreviaAction } from "@/actions/super-gestao-actions";
import { formatCurrency } from "@/lib/utils";

interface NovaDemandaPreviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialSuperintendencia?: SuperintendenciaSigla;
  initialCoordenacao?: string;
  initialResponsavelNome?: string;
  initialResponsavelEmail?: string;
}

interface ItemForm {
  descricao: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitarioEstimado: number;
  especificacaoTecnica: string;
}

export function NovaDemandaPreviaModal({
  isOpen,
  onClose,
  onSuccess,
  initialSuperintendencia = "SAS",
  initialCoordenacao,
  initialResponsavelNome = "",
  initialResponsavelEmail = "",
}: NovaDemandaPreviaModalProps) {
  const [superintendencia, setSuperintendencia] = useState<SuperintendenciaSigla>(
    initialSuperintendencia === "SG" ? "SAS" : initialSuperintendencia
  );
  const [coordenacao, setCoordenacao] = useState(
    initialCoordenacao ||
      SUPERINTENDENCIAS_SMS.find((s) => s.sigla === (initialSuperintendencia === "SG" ? "SAS" : initialSuperintendencia))?.coordenacoes[0] ||
      ""
  );
  const [responsavelNome, setResponsavelNome] = useState(initialResponsavelNome);
  const [responsavelEmail, setResponsavelEmail] = useState(initialResponsavelEmail);
  const [objeto, setObjeto] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [publicoAlvo, setPublicoAlvo] = useState("");

  useEffect(() => {
    if (isOpen) {
      const defaultSigla = initialSuperintendencia === "SG" ? "SAS" : initialSuperintendencia;
      setSuperintendencia(defaultSigla);
      setCoordenacao(
        initialCoordenacao ||
          SUPERINTENDENCIAS_SMS.find((s) => s.sigla === defaultSigla)?.coordenacoes[0] ||
          ""
      );
      if (initialResponsavelNome) setResponsavelNome(initialResponsavelNome);
      if (initialResponsavelEmail) setResponsavelEmail(initialResponsavelEmail);
      setFeedback(null);
    }
  }, [isOpen, initialSuperintendencia, initialCoordenacao, initialResponsavelNome, initialResponsavelEmail]);

  const [itens, setItens] = useState<ItemForm[]>([
    {
      descricao: "",
      unidadeMedida: "Unidade",
      quantidade: 1,
      valorUnitarioEstimado: 0,
      especificacaoTecnica: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  // Filtrar superintendências solicitantes (SAS, SUVIG, SGTES, SURCAA)
  const superintendenciasSolicitantes = SUPERINTENDENCIAS_SMS.filter((s) => s.sigla !== "SG");
  const superAtualInfo = SUPERINTENDENCIAS_SMS.find((s) => s.sigla === superintendencia);

  const handleSuperintendenciaChange = (sigla: SuperintendenciaSigla) => {
    setSuperintendencia(sigla);
    const info = SUPERINTENDENCIAS_SMS.find((s) => s.sigla === sigla);
    if (info && info.coordenacoes.length > 0) {
      setCoordenacao(info.coordenacoes[0]);
    }
  };

  const handleAddItem = () => {
    setItens([
      ...itens,
      {
        descricao: "",
        unidadeMedida: "Unidade",
        quantidade: 1,
        valorUnitarioEstimado: 0,
        especificacaoTecnica: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itens.length <= 1) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemForm, value: string | number) => {
    const novos = [...itens];
    novos[index] = {
      ...novos[index],
      [field]: value,
    };
    setItens(novos);
  };

  const valorTotalGeral = itens.reduce((acc, it) => {
    return acc + (it.quantidade || 0) * (it.valorUnitarioEstimado || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!objeto.trim()) {
      setFeedback({ type: "error", text: "Por favor, informe o objeto da demanda." });
      return;
    }

    if (!responsavelNome.trim()) {
      setFeedback({ type: "error", text: "Informe o nome do servidor responsável pela solicitação." });
      return;
    }

    const itemIncompleto = itens.find((it) => !it.descricao.trim() || it.quantidade <= 0);
    if (itemIncompleto) {
      setFeedback({
        type: "error",
        text: "Todos os itens devem ter descrição preenchida e quantidade maior que zero.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await criarDemandaPreviaAction({
        superintendenciaOrigem: superintendencia,
        coordenacaoOrigem: coordenacao,
        responsavelNome,
        responsavelEmail,
        objeto,
        justificativaNecessidade: justificativa,
        publicoAlvoOuDestino: publicoAlvo,
        itens: itens.map((it) => ({
          descricao: it.descricao,
          unidadeMedida: it.unidadeMedida,
          quantidade: Number(it.quantidade),
          valorUnitarioEstimado: Number(it.valorUnitarioEstimado) || 0,
          especificacaoTecnica: it.especificacaoTecnica,
        })),
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1300);
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao submeter demanda à SG." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Tramitação de Demanda Prévia
              </span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                Destino: Superintendência de Gestão (SG)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Protocolo de Demanda para Enquadramento Licitatório
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordenações demandantes de <strong>SAS, SUVIG, SGTES e SURCAA</strong> submetem os itens e quantidades para que a <strong>SG</strong> indique e fixe a modalidade legal adequada.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Banner de Governança e Competência Exclusiva da SG */}
        <div className="px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-950 shrink-0">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong>Regra de Governança Administrativa:</strong> Conforme regimento da SMS, as coordenações solicitantes informam o <strong>objeto, itens e quantitativos</strong>. Cabe <strong>exclusivamente à Superintendência de Gestão (SG)</strong> avaliar a economicidade, banco de preços e limites da Lei nº 14.133/2021 para determinar a modalidade licitatória.
          </p>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {feedback && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* 1. Origem da Solicitação */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <span className="font-bold text-slate-900 text-xs block uppercase tracking-wider">
              1. Identificação da Superintendência e Coordenação Solicitante
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Superintendência Demandante *
                </label>
                <select
                  value={superintendencia}
                  onChange={(e) => handleSuperintendenciaChange(e.target.value as SuperintendenciaSigla)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {superintendenciasSolicitantes.map((s) => (
                    <option key={s.sigla} value={s.sigla}>
                      {s.sigla} — {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Coordenação Solicitante Responsável *
                </label>
                <select
                  value={coordenacao}
                  onChange={(e) => setCoordenacao(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {superAtualInfo?.coordenacoes.map((coord) => (
                    <option key={coord} value={coord}>
                      {coord}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Servidor Responsável Técnico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Roberto Silveira (Epidemiologista)"
                  value={responsavelNome}
                  onChange={(e) => setResponsavelNome(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  E-mail Institucional *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: roberto.silveira@saude.gov.br"
                  value={responsavelEmail}
                  onChange={(e) => setResponsavelEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Objeto e Justificativa */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <span className="font-bold text-slate-900 text-xs block uppercase tracking-wider">
              2. Objeto da Demanda e Justificativa Pública
            </span>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Objeto Resumido da Contratação / Aquisição *
              </label>
              <textarea
                rows={2}
                required
                value={objeto}
                onChange={(e) => setObjeto(e.target.value)}
                placeholder="Descreva de forma clara o que a sua coordenação necessita (ex: Aquisição de testes rápidos para diagnóstico precoce de arboviroses)..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Justificativa da Necessidade Pública
                </label>
                <textarea
                  rows={2}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Por que essa aquisição é imprescindível para as ações de saúde pública?..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destinação / Público-Alvo / Unidades Atendidas
                </label>
                <textarea
                  rows={2}
                  value={publicoAlvo}
                  onChange={(e) => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: 18 Unidades Básicas de Saúde, Farmácia Popular, UPAs 24 Horas..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Tabela Dinâmica de Itens e Quantidades */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sky-950 text-xs block uppercase tracking-wider">
                  3. Itens, Quantidades e Especificações ({itens.length} {itens.length === 1 ? "item" : "itens"})
                </span>
                <span className="text-[11px] text-sky-800">
                  A SG usará estes quantitativos para calcular os limites legais e fixar a modalidade licitatória.
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Item
              </button>
            </div>

            <div className="space-y-3">
              {itens.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      Item #{idx + 1}
                    </span>

                    {itens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Descrição do Item / Medicamento / Serviço *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Tira reagente para glicemia capilar..."
                        value={it.descricao}
                        onChange={(e) => handleItemChange(idx, "descricao", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Unidade de Medida *
                      </label>
                      <select
                        value={it.unidadeMedida}
                        onChange={(e) => handleItemChange(idx, "unidadeMedida", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="Unidade">Unidade</option>
                        <option value="Caixa">Caixa</option>
                        <option value="Caixa c/ 50 tiras">Caixa c/ 50 tiras</option>
                        <option value="Caixa c/ 100">Caixa c/ 100</option>
                        <option value="Frasco">Frasco</option>
                        <option value="Ampola">Ampola</option>
                        <option value="Diária">Diária</option>
                        <option value="Mês">Mês</option>
                        <option value="Turma">Turma</option>
                        <option value="Hora">Hora</option>
                        <option value="Quilograma">Quilograma</option>
                        <option value="Litro">Litro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Quantidade Estimada *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantidade}
                        onChange={(e) => handleItemChange(idx, "quantidade", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Valor Unit. Estimado (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={it.valorUnitarioEstimado || ""}
                        onChange={(e) =>
                          handleItemChange(idx, "valorUnitarioEstimado", parseFloat(e.target.value) || 0)
                        }
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Subtotal do Item
                      </label>
                      <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono font-bold text-emerald-700">
                        {formatCurrency((it.quantidade || 0) * (it.valorUnitarioEstimado || 0))}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Especificação Técnica / Observação do Item
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Registro Anvisa, estéril, compatível com leitor digital..."
                        value={it.especificacaoTecnica}
                        onChange={(e) => handleItemChange(idx, "especificacaoTecnica", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totalizador Geral */}
            <div className="p-3 bg-white rounded-xl border border-sky-300 flex items-center justify-between">
              <span className="font-bold text-slate-700">Valor Global Estimado da Demanda:</span>
              <span className="text-base font-black text-emerald-700 font-mono">
                {formatCurrency(valorTotalGeral)}
              </span>
            </div>
          </div>

          {/* Rodapé com Botões de Ação */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold transition-all shadow-md disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? "Tramitando à SG..." : "Protocolar e Tramitar para a SG"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
