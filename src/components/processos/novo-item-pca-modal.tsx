"use client";

import { useState } from "react";
import { ItemPCA, ItemEstimadoPCA, StatusPCA } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { dataStore } from "@/lib/data-store";
import {
  X,
  Plus,
  Trash2,
  Save,
  FileText,
  Layers,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Tag,
} from "lucide-react";

interface NovoItemPcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  usuarioNome?: string;
}

const CATEGORIAS_SAUDE = [
  "Medicamentos & Farmácia Básica/Especializada",
  "Material Médico-Hospitalar & Insumos",
  "Equipamentos de Saúde & Diagnóstico",
  "Manutenção Predial & Engenharia Clínica",
  "Locação de Veículos & Transporte Sanitário",
  "Tecnologia da Informação & Licenças",
  "Alimentação Hospitalar & Nutrição Enteral",
  "Serviços Contínuos & Apoio Administrativo",
  "Serviços Laboratoriais & Exames Complementares",
  "Obras e Reformas de Unidades de Saúde",
  "Outros Fornecimentos & Serviços",
];

const UNIDADES_MEDIDA = [
  "Unidade",
  "Frasco",
  "Caixa",
  "Caixa c/ 50",
  "Caixa c/ 100",
  "Pacote",
  "Ampola",
  "Galão",
  "Litro",
  "Quilo",
  "Kit",
  "Mês",
  "Serviço",
  "Diária",
  "Hora",
];

export function NovoItemPcaModal({
  isOpen,
  onClose,
  onSuccess,
  usuarioNome,
}: NovoItemPcaModalProps) {
  // Form principal
  const [numeroDFD, setNumeroDFD] = useState("");
  const [codigoItem, setCodigoItem] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_SAUDE[0]);
  const [unidadeRequisitante, setUnidadeRequisitante] = useState("SAS");
  const [grauPrioridade, setGrauPrioridade] = useState<"ALTA" | "MEDIA" | "BAIXA">("ALTA");
  const [dataPrevisaoContratacao, setDataPrevisaoContratacao] = useState("2025-06");
  const [descricaoObjeto, setDescricaoObjeto] = useState("");
  const [status, setStatus] = useState<StatusPCA>("PLANEJADO");

  // Lista dinâmica de Itens Estimados
  const [itensEstimados, setItensEstimados] = useState<
    {
      id: string;
      numeroItem: number;
      descricao: string;
      unidadeMedida: string;
      quantidadeEstimada: number | string;
      valorUnitarioEstimado: number | string;
    }[]
  >([
    {
      id: "it-1",
      numeroItem: 1,
      descricao: "",
      unidadeMedida: "Unidade",
      quantidadeEstimada: "",
      valorUnitarioEstimado: "",
    },
  ]);

  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (!isOpen) return null;

  // Cálculos dinâmicos
  const itensComTotais = itensEstimados.map((it) => {
    const qtd = Number(it.quantidadeEstimada) || 0;
    const vlr = Number(it.valorUnitarioEstimado) || 0;
    return {
      ...it,
      qtdCalculada: qtd,
      vlrCalculado: vlr,
      totalCalculado: qtd * vlr,
    };
  });

  const totalUnidades = itensComTotais.reduce((acc, it) => acc + it.qtdCalculada, 0);
  const valorTotalContratacao = itensComTotais.reduce(
    (acc, it) => acc + it.totalCalculado,
    0
  );

  const handleAddItem = () => {
    setItensEstimados([
      ...itensEstimados,
      {
        id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        numeroItem: itensEstimados.length + 1,
        descricao: "",
        unidadeMedida: "Unidade",
        quantidadeEstimada: "",
        valorUnitarioEstimado: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itensEstimados.length <= 1) return;
    const novos = itensEstimados.filter((_, i) => i !== index);
    // Renumera itens
    const renumerados = novos.map((it, i) => ({ ...it, numeroItem: i + 1 }));
    setItensEstimados(renumerados);
  };

  const handleUpdateItem = (
    index: number,
    campo: "descricao" | "unidadeMedida" | "quantidadeEstimada" | "valorUnitarioEstimado",
    valor: any
  ) => {
    const novos = [...itensEstimados];
    novos[index] = { ...novos[index], [campo]: valor };
    setItensEstimados(novos);
  };

  const handleSalvar = () => {
    setFeedback(null);

    // Validações
    if (!descricaoObjeto.trim()) {
      setFeedback({
        tipo: "erro",
        mensagem: "Por favor, informe a descrição do objeto da contratação.",
      });
      return;
    }

    const itensValidos: ItemEstimadoPCA[] = [];
    for (let i = 0; i < itensEstimados.length; i++) {
      const it = itensEstimados[i];
      const desc = it.descricao.trim();
      const qtd = Number(it.quantidadeEstimada) || 0;
      const vlr = Number(it.valorUnitarioEstimado) || 0;

      if (!desc) {
        setFeedback({
          tipo: "erro",
          mensagem: `O Item Nº ${it.numeroItem} precisa ter uma descrição preenchida.`,
        });
        return;
      }
      if (qtd <= 0) {
        setFeedback({
          tipo: "erro",
          mensagem: `A quantidade estimada do Item Nº ${it.numeroItem} deve ser maior que zero.`,
        });
        return;
      }
      if (vlr <= 0) {
        setFeedback({
          tipo: "erro",
          mensagem: `O valor unitário estimado do Item Nº ${it.numeroItem} deve ser maior que zero.`,
        });
        return;
      }

      itensValidos.push({
        id: it.id,
        numeroItem: it.numeroItem,
        descricao: desc,
        unidadeMedida: it.unidadeMedida,
        quantidadeEstimada: qtd,
        valorUnitarioEstimado: vlr,
        valorTotalEstimado: qtd * vlr,
      });
    }

    setSalvando(true);

    try {
      const codItemFinal =
        codigoItem.trim() ||
        `PCA-2025/${String(dataStore.pca.length + 1).padStart(3, "0")}`;

      const res = dataStore.adicionarItemPCA({
        anoExercicio: 2025,
        codigoItem: codItemFinal,
        numeroDFD: numeroDFD.trim() || undefined,
        descricao: descricaoObjeto.trim(),
        categoria,
        unidadeRequisitante,
        grauPrioridade,
        quantidadeTotal: totalUnidades,
        valorEstimado: valorTotalContratacao,
        status,
        dataPrevisaoContratacao,
        itensEstimados: itensValidos,
        origemInsercao: "MANUAL",
        inseridoPor: usuarioNome || "Coordenação Geral de Gestão (SG)",
        inseridoEm: new Date().toISOString(),
      });

      if (res.success) {
        setFeedback({
          tipo: "sucesso",
          mensagem: "Contratação e itens do PCA salvos com sucesso!",
        });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1100);
      } else {
        setFeedback({ tipo: "erro", mensagem: res.message });
      }
    } catch (err: any) {
      setFeedback({
        tipo: "erro",
        mensagem: `Erro ao salvar: ${err?.message || "Tente novamente"}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 backdrop-blur-xs">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Coordenação de Gestão • SMS
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Exercício 2025
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight mt-1 flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-200" />
              Adicionar Contratação ao PCA (Entrada Manual)
            </h3>
            <p className="text-xs text-sky-200/90 mt-0.5">
              Cadastre o DFD, especificação do objeto, itens estimados, quantidades e valores de referência.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 shrink-0 ${
              feedback.tipo === "sucesso"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-rose-50 text-rose-800 border-b border-rose-200"
            }`}
          >
            {feedback.tipo === "sucesso" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.mensagem}</span>
          </div>
        )}

        {/* Corpo do Formulário com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Seção 1: Dados do DFD & Identificação da Contratação */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-sky-700" />
                1. Identificação do DFD & Objeto da Contratação
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Art. 12, VII da Lei nº 14.133/2021
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nº do DFD (Formalização da Demanda)
                </label>
                <input
                  type="text"
                  value={numeroDFD}
                  onChange={(e) => setNumeroDFD(e.target.value)}
                  placeholder="Ex: DFD 014/2025 - SAS"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código do PCA (Opcional / Auto)
                </label>
                <input
                  type="text"
                  value={codigoItem}
                  onChange={(e) => setCodigoItem(e.target.value)}
                  placeholder="Ex: PCA-2025/001"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unidade Requisitante / Setor
                </label>
                <select
                  value={unidadeRequisitante}
                  onChange={(e) => setUnidadeRequisitante(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="SAS">SAS - Superintendência de Atenção à Saúde</option>
                  <option value="SUVIG">SUVIG - Vigilância em Saúde</option>
                  <option value="SGTES">SGTES - Gestão do Trabalho e Educação</option>
                  <option value="SURCAA">SURCAA - Regulação, Controle e Auditoria</option>
                  <option value="SG">SG - Superintendência de Gestão</option>
                  <option value="GAB">Gabinete da Secretaria Municipal de Saúde</option>
                  <option value="CAF">CAF - Central de Abastecimento Farmacêutico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Categoria da Contratação *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {CATEGORIAS_SAUDE.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Grau de Prioridade
                </label>
                <div className="flex rounded-lg overflow-hidden border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setGrauPrioridade("ALTA")}
                    className={`flex-1 py-1.5 text-center font-bold text-[11px] transition-colors ${
                      grauPrioridade === "ALTA"
                        ? "bg-rose-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Alta
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrauPrioridade("MEDIA")}
                    className={`flex-1 py-1.5 text-center font-bold text-[11px] transition-colors ${
                      grauPrioridade === "MEDIA"
                        ? "bg-amber-500 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Média
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrauPrioridade("BAIXA")}
                    className={`flex-1 py-1.5 text-center font-bold text-[11px] transition-colors ${
                      grauPrioridade === "BAIXA"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Baixa
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Objeto Principal da Contratação *
              </label>
              <textarea
                rows={2}
                value={descricaoObjeto}
                onChange={(e) => setDescricaoObjeto(e.target.value)}
                placeholder="Ex: Registro de Preços para fornecimento contínuo e parcelado de medicamentos da Atenção Básica e Saúde Mental para a rede municipal de saúde..."
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Previsão de Início da Contratação (Mês/Ano)
                </label>
                <input
                  type="month"
                  value={dataPrevisaoContratacao}
                  onChange={(e) => setDataPrevisaoContratacao(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Inicial no PCA
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusPCA)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="PLANEJADO">PLANEJADO (Aguardando Autuação)</option>
                  <option value="EM_LICITACAO">EM LICITAÇÃO (Processo em Andamento)</option>
                  <option value="CONTRATADO">CONTRATADO (Homologado/Firmado)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Itens Estimados da Contratação */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-100">
              <div>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-700" />
                  2. Itens Estimados da Demanda ({itensEstimados.length} item(ns))
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cadastre cada item com especificação, unidade, quantidade estimada e valor de referência.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 text-white font-bold text-xs hover:bg-indigo-800 transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar Novo Item</span>
              </button>
            </div>

            {/* Lista dos Itens */}
            <div className="space-y-3">
              {itensEstimados.map((it, idx) => {
                const qtd = Number(it.quantidadeEstimada) || 0;
                const vlr = Number(it.valorUnitarioEstimado) || 0;
                const totalItem = qtd * vlr;

                return (
                  <div
                    key={it.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5 transition-all hover:border-indigo-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-mono font-bold">
                          {it.numeroItem}
                        </span>
                        Item Nº {it.numeroItem}
                      </span>

                      {itensEstimados.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Remover este item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      {/* Descrição */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Descrição / Especificação do Item *
                        </label>
                        <input
                          type="text"
                          value={it.descricao}
                          onChange={(e) => handleUpdateItem(idx, "descricao", e.target.value)}
                          placeholder="Ex: Paracetamol 500mg comprimidos"
                          className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Unidade */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Unidade
                        </label>
                        <select
                          value={it.unidadeMedida}
                          onChange={(e) => handleUpdateItem(idx, "unidadeMedida", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          {UNIDADES_MEDIDA.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantidade Estimada */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Qtd. Estimada *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={it.quantidadeEstimada}
                          onChange={(e) => handleUpdateItem(idx, "quantidadeEstimada", e.target.value)}
                          placeholder="0"
                          className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Valor Unitário */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Valor Unit. Estimado (R$) *
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={it.valorUnitarioEstimado}
                          onChange={(e) => handleUpdateItem(idx, "valorUnitarioEstimado", e.target.value)}
                          placeholder="0,00"
                          className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Subtotal da Linha */}
                    <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500">Subtotal do Item:</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {formatCurrency(totalItem)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção 3: Painel de Consolidação Financeira */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-sky-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Calculator className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <span className="text-xs text-sky-200 uppercase font-semibold tracking-wider">
                  Consolidação da Contratação
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  <strong>{itensEstimados.length}</strong> item(ns) &bull;{" "}
                  <strong>{totalUnidades.toLocaleString("pt-BR")}</strong> unidades estimadas
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-sky-200 block uppercase font-medium">
                Valor Total Estimado do PCA
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(valorTotalContratacao)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSalvar}
            disabled={salvando}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-700 text-white font-bold text-xs hover:bg-sky-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>{salvando ? "Salvando no PCA..." : "Salvar no Plano de Contratações"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
