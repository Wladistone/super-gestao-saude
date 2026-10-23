"use client";

import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Receipt,
  Lock,
  Layers,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  FileCheck,
  CheckCircle2,
  Download,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { solicitarPagamentoContratoAction } from "@/actions/super-gestao-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ElaboradorDocumentoModal } from "@/components/documentos/elaborador-documento-modal";
import { DocumentoElaborado } from "@/lib/types";

interface NovaSolicitacaoPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contratoIdPreselecionado?: string;
}

export function NovaSolicitacaoPagamentoModal({
  isOpen,
  onClose,
  onSuccess,
  contratoIdPreselecionado,
}: NovaSolicitacaoPagamentoModalProps) {
  const contratos = dataStore.contratos;
  const ordens = dataStore.ordens;
  const fornecedores = dataStore.fornecedores;

  const [selectedContratoId, setSelectedContratoId] = useState(
    contratoIdPreselecionado || contratos[0]?.id || ""
  );

  useEffect(() => {
    if (contratoIdPreselecionado) {
      setSelectedContratoId(contratoIdPreselecionado);
    }
    // Reset form fields
    setNumeroNF("");
    setDataEmissao(new Date().toISOString().split("T")[0]);
    setValorSolicitado("");
    setNumeroEmpenho("");
    setNumeroLiquidacao("");
    setSelectedItemId("");
    setSelectedDotacaoIndex(0);
    setSelectedOrdemId("");
    setAtestado(true);
    setObservacoes("");
    setFeedback(null);
  }, [contratoIdPreselecionado, isOpen]);

  const contrato = contratos.find((c) => c.id === selectedContratoId);
  const fornecedor = fornecedores.find((f) => f.id === contrato?.fornecedorId);
  const ordensDoContrato = ordens.filter((o) => o.contratoId === selectedContratoId);

  // Form states
  const [numeroNF, setNumeroNF] = useState("");
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split("T")[0]);
  const [valorSolicitado, setValorSolicitado] = useState<string>("");
  const [numeroEmpenho, setNumeroEmpenho] = useState("");
  const [numeroLiquidacao, setNumeroLiquidacao] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedDotacaoIndex, setSelectedDotacaoIndex] = useState<number>(0);
  const [selectedOrdemId, setSelectedOrdemId] = useState<string>("");
  const [atestado, setAtestado] = useState(true);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal para Elaborador do Documento Oficial
  const [docParaElaborar, setDocParaElaborar] = useState<DocumentoElaborado | null>(null);

  if (!isOpen) return null;

  const itemSelecionado = contrato?.itens?.find((i) => i.id === selectedItemId);
  const dotacoesDoItem = itemSelecionado?.dotacoes || [];
  const dotacaoSelecionada = dotacoesDoItem[selectedDotacaoIndex];

  const valorNumerico = parseFloat(valorSolicitado) || 0;
  const saldoMaximoContrato = contrato?.saldoFinanceiroAtual || 0;
  const saldoMaximoItem = itemSelecionado ? itemSelecionado.saldoItem : saldoMaximoContrato;
  const saldoMaximoDotacao = dotacaoSelecionada ? dotacaoSelecionada.saldoDotacaoItem : saldoMaximoItem;

  const excedeContrato = valorNumerico > saldoMaximoContrato;
  const excedeItem = itemSelecionado ? valorNumerico > itemSelecionado.saldoItem : false;
  const excedeDotacao = dotacaoSelecionada ? valorNumerico > dotacaoSelecionada.saldoDotacaoItem : false;
  const isBlocked =
    !numeroNF.trim() ||
    valorNumerico <= 0 ||
    excedeContrato ||
    excedeItem ||
    excedeDotacao ||
    !atestado;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await solicitarPagamentoContratoAction({
        contratoId: selectedContratoId,
        ordemId: selectedOrdemId || undefined,
        numeroNotaFiscal: numeroNF.trim(),
        numeroEmpenho: numeroEmpenho.trim() || undefined,
        numeroLiquidacao: numeroLiquidacao.trim() || undefined,
        valorPago: valorNumerico,
        dataPagamento: dataEmissao,
        itemId: selectedItemId || undefined,
        dotacaoIndex: dotacaoSelecionada ? selectedDotacaoIndex : undefined,
        programaDeTrabalho: dotacaoSelecionada?.programaDeTrabalho,
        elementoDespesa: dotacaoSelecionada?.elementoDespesa,
        fonteRecursoId: dotacaoSelecionada?.fonteRecurso,
        fonteRecursoNome: dotacaoSelecionada?.fonteRecurso,
        atestadoPor: contrato?.fiscalTitularNome || "Fiscal Designado SMS",
        observacoes: observacoes.trim() || "Atesto fiscal e conformidade da Nota Fiscal com o contrato.",
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
      setFeedback({ type: "error", text: "Erro ao registrar solicitação de pagamento." });
    } finally {
      setLoading(false);
    }
  };

  // Gerador de Ofício de Solicitação de Pagamento baseado no modelo oficial da SMS
  const handleAbrirElaboradorOficio = () => {
    const fiscalNome = contrato?.fiscalTitularNome || "Fiscal do Contrato";
    const valorFormatado = formatCurrency(valorNumerico > 0 ? valorNumerico : saldoMaximoContrato);
    const ptTexto = dotacaoSelecionada
      ? `Programa de Trabalho: ${dotacaoSelecionada.programaDeTrabalho} - ${dotacaoSelecionada.programaNome || 'Saúde'}\nElemento de Despesa: ${dotacaoSelecionada.elementoDespesa}\nFonte de Recursos: ${dotacaoSelecionada.fonteRecurso}`
      : "Dotações orçamentárias vinculadas ao Contrato Administrativo";

    const novoDoc: DocumentoElaborado = {
      id: `doc-of-pag-${Date.now()}`,
      modeloId: "mod-of-pagamento",
      titulo: `OFÍCIO Nº ${String(Math.floor(Math.random() * 800) + 100)}/2025 - SMS/SG - Solicitação de Pagamento`,
      tipoPeca: "Ofício",
      modalidade: "OFÍCIOS E MEMORANDOS",
      artigoLei: "Art. 141 (Lei 14.133/2021) e Lei 4.320/1964",
      numeroProcesso: contrato?.numeroContrato || "CT-2025/012",
      dataDocumento: new Date().toISOString().split("T")[0],
      cidadeDataExtenso: `Arapiraca/AL, ${new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}`,
      orgaoRequisitante: "Secretaria Municipal de Saúde - Superintendência de Gestão (SG)",
      servidorResponsavel: fiscalNome,
      cargoServidor: "Fiscal de Contrato Titular",
      matriculaServidor: "SMS-2024-FISC",
      objeto: `Solicitação de liquidação e pagamento da ${numeroNF || "Nota Fiscal"} referente ao ${contrato?.numeroContrato || "Contrato"}`,
      justificativa: "Comprovação da regularidade dos fornecimentos/serviços atestados pela fiscalização.",
      itens: itemSelecionado
        ? [
            {
              item: 1,
              descricao: `${itemSelecionado.descricao} (${itemSelecionado.codigoItem})`,
              unidade: itemSelecionado.unidadeMedida,
              quantidade: Math.round(valorNumerico / (itemSelecionado.valorUnitario || 1)) || 1,
              valorUnitario: itemSelecionado.valorUnitario,
              valorTotal: valorNumerico,
            },
          ]
        : [],
      secoes: [
        {
          id: "sec-dest",
          titulo: "Destinatário Oficial",
          conteudo: "Ao Ilmo. Sr. Diretor de Contabilidade e Finanças\nSecretaria Municipal de Saúde - SMS Arapiraca",
          obrigatoria: true,
        },
        {
          id: "sec-assunto",
          titulo: "Assunto",
          conteudo: `Assunto: Solicitação de Liquidação e Pagamento - ${numeroNF || "Nota Fiscal"} - ${contrato?.numeroContrato}`,
          obrigatoria: true,
        },
        {
          id: "sec-corpo",
          titulo: "Texto Oficial / Atesto de Execução",
          conteudo: `Cumprimentando-o cordialmente, encaminho a Vossa Senhoria a Nota Fiscal nº ${numeroNF || "[NÚMERO DA NOTA FISCAL]"}, no valor global de ${valorFormatado}, emitida pela contratada ${fornecedor?.razaoSocial || contrato?.fornecedorId} (CNPJ: ${fornecedor?.cnpj || "Inscrito no CNPJ"}), referente ao ${contrato?.numeroContrato}.\n\nCertifico e atesto que os serviços/fornecimentos descritos na referida fatura foram devidamente executados/entregues, conferidos qualitativa e quantitativamente, encontrando-se em conformidade com as cláusulas contratuais e especificações do Termo de Referência.\n\nInformo a respectiva dotação orçamentária para apropriação e liquidação da despesa:\n${ptTexto}\n\nDiante do exposto, solicito a adoção dos procedimentos pertinentes para liquidação e efetivo pagamento.`,
          obrigatoria: true,
        },
      ],
      status: "RASCUNHO",
      downloadUrlOriginal: "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO SOLICITAÇÃO DE PAGAMENTO.docx",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocParaElaborar(novoDoc);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Solicitação de Pagamento & Liquidação
                </h2>
                <p className="text-xs text-slate-500">
                  Emissão de atesto do fiscal, liquidação da fatura e baixa orçamentária por dotação
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mx-6 mt-4 flex items-center gap-2 p-3 rounded-lg text-xs font-semibold ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-rose-50 text-rose-900 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* Seleção do Contrato */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contrato Administrativo
              </label>
              <select
                value={selectedContratoId}
                onChange={(e) => {
                  setSelectedContratoId(e.target.value);
                  setSelectedItemId("");
                  setSelectedDotacaoIndex(0);
                  setSelectedOrdemId("");
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numeroContrato} - {c.objeto.substring(0, 75)}... ({formatCurrency(c.saldoFinanceiroAtual)} disponível)
                  </option>
                ))}
              </select>
            </div>

            {/* Cartão de Contexto do Contrato Selecionado */}
            {contrato && (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Fornecedor Contratado
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {fornecedor?.razaoSocial || contrato.fornecedorId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      CNPJ: {fornecedor?.cnpj || "Inscrito no CNPJ"}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Saldo do Contrato
                    </span>
                    <span className="text-base font-black font-mono text-emerald-700">
                      {formatCurrency(contrato.saldoFinanceiroAtual)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Global: {formatCurrency(contrato.valorGlobal)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-semibold">Fiscal Titular: </span>
                    <span className="font-medium text-slate-800">{contrato.fiscalTitularNome || "Não informado"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Vigência: </span>
                    <span className="font-medium text-slate-800">{formatDate(contrato.vigenciaFim)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ordem de Fornecimento Vinculada (Opcional) */}
            {ordensDoContrato.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ordem de Fornecimento / Serviço (Opcional)
                </label>
                <select
                  value={selectedOrdemId}
                  onChange={(e) => setSelectedOrdemId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Sem OF vinculada (Execução / Liquidação Direta)</option>
                  {ordensDoContrato.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.numeroOF} - Emitida em {formatDate(ord.dataEmissao)} ({formatCurrency(ord.valorTotal)}) [{ord.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Seleção do Item do Contrato e sua Dotação Orçamentária */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                Item do Contrato & Programa de Trabalho / Elemento / Fonte
              </label>

              {contrato?.itens && contrato.itens.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      setSelectedDotacaoIndex(0);
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="">-- Selecione o item a liquidar (opcional) --</option>
                    {contrato.itens.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.codigoItem} - {it.descricao} (Saldo do Item: {formatCurrency(it.saldoItem)})
                      </option>
                    ))}
                  </select>

                  {/* Se selecionou um item que tem múltiplos Programas de Trabalho */}
                  {itemSelecionado && dotacoesDoItem.length > 0 && (
                    <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-sky-950 flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-sky-700" />
                          Selecione o Programa de Trabalho / Fonte para apropriação da despesa:
                        </span>
                        <span className="text-[10px] font-bold text-sky-700">
                          {dotacoesDoItem.length} PT(s) disponível(is)
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {dotacoesDoItem.map((dot, idx) => (
                          <label
                            key={idx}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                              selectedDotacaoIndex === idx
                                ? "bg-white border-sky-400 ring-2 ring-sky-200 shadow-2xs"
                                : "bg-white/70 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="dotacaoItem"
                              checked={selectedDotacaoIndex === idx}
                              onChange={() => setSelectedDotacaoIndex(idx)}
                              className="mt-0.5 text-sky-600 focus:ring-sky-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded text-[10px]">
                                  PT {dot.programaDeTrabalho}
                                </span>
                                <span className="font-mono font-bold text-emerald-800 text-xs">
                                  Saldo: {formatCurrency(dot.saldoDotacaoItem)} {dot.percentual ? `(${dot.percentual}%)` : ""}
                                </span>
                              </div>
                              {dot.programaNome && (
                                <p className="text-[11px] font-semibold text-slate-800 mt-1">{dot.programaNome}</p>
                              )}
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                <strong>ED:</strong> {dot.elementoDespesa} | <strong>Fonte:</strong> {dot.fonteRecurso}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 italic">Nenhum item cadastrado para este contrato.</div>
              )}
            </div>

            {/* Dados da Nota Fiscal e Valor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Número da Nota Fiscal / Fatura <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NF-e 004.892"
                  value={numeroNF}
                  onChange={(e) => setNumeroNF(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Data de Emissão / Liquidação <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dataEmissao}
                  onChange={(e) => setDataEmissao(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Valor Solicitado a Pagar (R$) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={valorSolicitado}
                    onChange={(e) => setValorSolicitado(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-black text-right text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                {saldoMaximoDotacao > 0 && (
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Saldo disponível na dotação/item: <strong className="text-emerald-700">{formatCurrency(saldoMaximoDotacao)}</strong>
                  </span>
                )}
                {excedeDotacao && (
                  <span className="text-[10px] text-rose-600 font-bold mt-0.5 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Valor ultrapassa o saldo disponível da dotação!
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Número do Empenho (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: EMP-2025/001890"
                  value={numeroEmpenho}
                  onChange={(e) => setNumeroEmpenho(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Atesto do Fiscal */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={atestado}
                  onChange={(e) => setAtestado(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-emerald-950 block">
                    Declaração de Atesto do Fiscal de Contrato
                  </span>
                  <p className="text-[11px] text-emerald-900 leading-relaxed mt-0.5">
                    Atesto para os devidos fins de liquidação e pagamento que os materiais/serviços faturados nesta
                    Nota Fiscal foram devidamente entregues/prestados, inspecionados qualitativa e quantitativamente,
                    estando em total conformidade com os termos pactuados.
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 block mt-1">
                    Fiscal Responsável: {contrato?.fiscalTitularNome || "Fiscal do Contrato"}
                  </span>
                </div>
              </label>
            </div>

            {/* Observações / Despacho */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Despacho / Observações da Solicitação
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Atesto emitido pelo Fiscal de Frotas referente à cota mensal de combustíveis..."
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
            <button
              type="button"
              onClick={handleAbrirElaboradorOficio}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-sky-300 hover:bg-sky-50 text-sky-800 text-xs font-bold transition-all shadow-2xs w-full sm:w-auto justify-center"
              title="Elaborar e imprimir Ofício de Pagamento oficial com Timbre da Prefeitura de Arapiraca"
            >
              <FileCheck className="h-4 w-4 text-sky-700" />
              <span>Gerar Ofício de Pagamento (Oficial)</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isBlocked || loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Registrar e Liquidar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Elaborador de Documento se clicou em Gerar Ofício */}
      {docParaElaborar && (
        <ElaboradorDocumentoModal
          isOpen={true}
          documentoInicial={docParaElaborar}
          onClose={() => setDocParaElaborar(null)}
          onSalvo={(salvo) => {
            setFeedback({
              type: "success",
              text: `Ofício '${salvo.titulo}' gerado e salvo com sucesso no banco de documentos!`,
            });
            setDocParaElaborar(null);
          }}
        />
      )}
    </>
  );
}
