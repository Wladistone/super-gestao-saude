"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  ClipboardCheck,
  FileText,
  CheckCircle2,
  Download,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Sparkles,
  Printer,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Check,
  ChevronRight,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MODELOS_LICITACAO_CATALOG,
  ModeloDocumentoProcesso,
} from "@/data/modelos-licitacao-catalog";
import {
  gerarDocumentoInicial,
  gerarArquivoDocxComTimbre,
  downloadBlob,
  ContextoElaboracao,
} from "@/lib/documento-templates-service";
import { ElaboradorDocumentoModal } from "@/components/documentos/elaborador-documento-modal";
import { DocumentoElaborado, Contrato } from "@/lib/types";

interface NovoParecerAceitacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contratoIdPreselecionado?: string;
}

export function NovoParecerAceitacaoModal({
  isOpen,
  onClose,
  onSuccess,
  contratoIdPreselecionado,
}: NovoParecerAceitacaoModalProps) {
  const contratos = dataStore.contratos;
  const fornecedores = dataStore.fornecedores;

  // Modelo oficial de Parecer de Aceitação (mod-128)
  const modeloParecer = useMemo(() => {
    return (
      MODELOS_LICITACAO_CATALOG.find(
        (m) =>
          m.id === "mod-128" ||
          m.tipoPeca === "Parecer de Aceitação" ||
          m.titulo.toUpperCase().includes("PARECER DE ACEITAÇÃO")
      ) || {
        id: "mod-128",
        modalidade: "OFÍCIOS E MEMORANDOS",
        categoriaPrincipal: "OFÍCIOS E MEMORANDOS",
        subcategoria: "",
        ordem: 80,
        titulo: "PARECER DE ACEITAÇÃO",
        tipoPeca: "Parecer de Aceitação",
        artigoLei: "Art. 140 (Lei nº 14.133/2021) - Recebimento e Aceite Definitivo",
        downloadUrl:
          "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/PARECER DE ACEITAÇÃO.docx",
        tamanhoBytes: 133286,
      }
    );
  }, []);

  const [selectedContratoId, setSelectedContratoId] = useState(
    contratoIdPreselecionado || contratos[0]?.id || ""
  );

  // Campos do Parecer de Aceitação
  const [numeroNF, setNumeroNF] = useState("000.001.783");
  const [dataAceite, setDataAceite] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [valorAceite, setValorAceite] = useState<string>("");
  const [clausulaReferencia, setClausulaReferencia] = useState(
    "Cláusula Décima Quarta"
  );
  const [gestorNome, setGestorNome] = useState("Eugênio Pereira de Sousa");
  const [gestorCargo, setGestorCargo] = useState("Gestor de Contrato Titular");
  const [gestorMatricula, setGestorMatricula] = useState("148920");

  // Checklist de Verificação Técnica
  const [chkQuantidade, setChkQuantidade] = useState(true);
  const [chkQualidade, setChkQualidade] = useState(true);
  const [chkEspecificacoes, setChkEspecificacoes] = useState(true);

  // Estados de controle de elaboração e feedback
  const [docParaElaborar, setDocParaElaborar] =
    useState<DocumentoElaborado | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [gerandoDocx, setGerandoDocx] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Contrato e fornecedor ativos
  const contratoAtivo: Contrato | undefined = contratos.find(
    (c) => c.id === selectedContratoId
  );
  const fornecedorAtivo = fornecedores.find(
    (f) => f.id === contratoAtivo?.fornecedorId
  );

  // Atualiza dados quando contrato pré-selecionado muda ou modal abre
  useEffect(() => {
    if (contratoIdPreselecionado) {
      setSelectedContratoId(contratoIdPreselecionado);
    }
  }, [contratoIdPreselecionado, isOpen]);

  useEffect(() => {
    if (contratoAtivo) {
      // Valor padrão: saldo financeiro atual ou valor global
      const val =
        contratoAtivo.saldoFinanceiroAtual > 0
          ? contratoAtivo.saldoFinanceiroAtual
          : contratoAtivo.valorGlobal;
      setValorAceite(val.toString());

      if (contratoAtivo.fiscalTitularNome) {
        setGestorNome(contratoAtivo.fiscalTitularNome);
      } else {
        setGestorNome("Eugênio Pereira de Sousa");
      }
    }
    setFeedback(null);
  }, [selectedContratoId, contratoAtivo]);

  if (!isOpen) return null;

  const valorNumerico = parseFloat(valorAceite) || 0;
  const valorFormatadoTexto =
    valorNumerico > 0
      ? formatCurrency(valorNumerico)
      : formatCurrency(contratoAtivo?.saldoFinanceiroAtual || 2988);

  const razaoSocialContratada =
    fornecedorAtivo?.razaoSocial ||
    fornecedorAtivo?.nomeFantasia ||
    "Empresa VIDA OXIGÊNIO LTDA";
  const cnpjContratada = fornecedorAtivo?.cnpj || "44.735.857/0001-25";
  const enderecoContratada =
    fornecedorAtivo?.endereco && fornecedorAtivo?.cidade
      ? `${fornecedorAtivo.endereco}, ${fornecedorAtivo.cidade}/${fornecedorAtivo.uf || "AL"}`
      : "Rua José Adilson da Silva, nº 10, Bairro Domingos Acácio, CEP: 57.500-000";

  const numContratoFormatado =
    contratoAtivo?.numeroContrato || "1133/2025";
  const dataAssinaturaFormatada = contratoAtivo?.dataAssinatura
    ? formatDate(contratoAtivo.dataAssinatura)
    : "30 de janeiro de 2025";

  // Constrói o DocumentoElaborado baseado no modelo oficial da plataforma
  const construirDocumentoParecer = (): DocumentoElaborado => {
    const contexto: ContextoElaboracao = {
      contratoId: contratoAtivo?.id,
      numeroContrato: numContratoFormatado,
      contratadaNome: razaoSocialContratada,
      contratadaCnpj: cnpjContratada,
      contratadaEndereco: enderecoContratada,
      dataAssinatura: dataAssinaturaFormatada,
      vigenciaFim: contratoAtivo?.vigenciaFim,
      valorPagamento: valorFormatadoTexto,
      numeroNotaFiscal: numeroNF || "000.001.783",
      clausulaContrato: clausulaReferencia || "Cláusula Décima Quarta",
      servidorNome: gestorNome,
      servidorCargo: gestorCargo,
      servidorMatricula: gestorMatricula,
      objeto:
        contratoAtivo?.objeto ||
        "Recebimento e Aceite Definitivo de Bens/Serviços Contratados",
      itens: contratoAtivo?.itens?.map((it, idx) => ({
        descricao: it.descricao,
        unidade: it.unidadeMedida,
        quantidade: it.quantidadeContratada,
        valorUnitario: it.valorUnitario,
        valorTotal: it.saldoItem,
      })),
    };

    const doc = gerarDocumentoInicial(modeloParecer, contexto);
    doc.titulo = `PARECER DE ACEITAÇÃO - CT Nº ${numContratoFormatado} - ${razaoSocialContratada}`;
    return doc;
  };

  // Abrir no Elaborador Completo com Timbre
  const handleAbrirElaborador = () => {
    const doc = construirDocumentoParecer();
    setDocParaElaborar(doc);
  };

  // Baixar Word (.docx) já gerado com dados
  const handleBaixarDocxPreenchido = async () => {
    try {
      setGerandoDocx(true);
      const doc = construirDocumentoParecer();
      const blob = await gerarArquivoDocxComTimbre(doc);
      downloadBlob(
        blob,
        `PARECER_DE_ACEITACAO_${numContratoFormatado.replace(/[/\\?%*:|"<>]/g, "_")}.docx`
      );
      setFeedback({
        type: "success",
        text: "Arquivo .docx gerado e transferido com sucesso!",
      });
    } catch (e) {
      console.error(e);
      setFeedback({
        type: "error",
        text: "Erro ao gerar arquivo Word. Tente abrir pelo Elaborador.",
      });
    } finally {
      setGerandoDocx(false);
    }
  };

  // Salvar diretamente na plataforma
  const handleEmitirESalvar = () => {
    try {
      setSalvando(true);
      const doc = construirDocumentoParecer();
      doc.status = "ASSINADO";
      dataStore.salvarDocumentoElaborado(doc);
      setFeedback({
        type: "success",
        text: `Parecer de Aceitação registrado com sucesso no banco de documentos oficiais!`,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Erro ao registrar o Parecer de Aceitação.",
      });
    } finally {
      setSalvando(false);
    }
  };

  const todosConferidos = chkQuantidade && chkQualidade && chkEspecificacoes;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-500/10 via-amber-50 to-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Emitir Parecer de Aceitação
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Art. 140 da Lei 14.133/21
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Recebimento Definitivo de bens e serviços pelo Gestor do Contrato para liberação de pagamento.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Feedback Toast */}
          {feedback && (
            <div
              className={`mx-6 mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Seletor do Contrato Administrativo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  Contrato Administrativo Vinculado
                </label>
                <span className="text-[11px] text-slate-500">
                  Total de contratos ativos: {contratos.length}
                </span>
              </div>

              <select
                value={selectedContratoId}
                onChange={(e) => setSelectedContratoId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {contratos.map((c) => {
                  const f = fornecedores.find((fn) => fn.id === c.fornecedorId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.numeroContrato} — {f?.nomeFantasia || f?.razaoSocial} (Saldo: {formatCurrency(c.saldoFinanceiroAtual)})
                    </option>
                  );
                })}
              </select>

              {/* Card de Resumo do Contrato */}
              {contratoAtivo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Fornecedor Contratado
                    </span>
                    <span className="font-bold text-slate-800 block truncate">
                      {razaoSocialContratada}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      CNPJ: {cnpjContratada}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Vigência & Assinatura
                    </span>
                    <span className="font-bold text-slate-800 block">
                      Assinado em: {dataAssinaturaFormatada}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Até: {formatDate(contratoAtivo.vigenciaFim)}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Saldo Contratual
                    </span>
                    <span className="font-bold text-emerald-700 block">
                      {formatCurrency(contratoAtivo.saldoFinanceiroAtual)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Global: {formatCurrency(contratoAtivo.valorGlobal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Formulário de Dados da Nota Fiscal e do Recebimento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nota Fiscal nº <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={numeroNF}
                  onChange={(e) => setNumeroNF(e.target.value)}
                  placeholder="Ex: 000.001.783"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Identificador da NF / Danfe conferida
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data de Ateste / Aceite <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dataAceite}
                  onChange={(e) => setDataAceite(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Data da verificação técnica
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor do Ateste (R$) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorAceite}
                    onChange={(e) => setValorAceite(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-black text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block text-right font-mono">
                  {valorFormatadoTexto}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cláusula Contratual de Referência
                </label>
                <input
                  type="text"
                  value={clausulaReferencia}
                  onChange={(e) => setClausulaReferencia(e.target.value)}
                  placeholder="Ex: Cláusula Décima Quarta"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gestor Responsável
                </label>
                <input
                  type="text"
                  value={gestorNome}
                  onChange={(e) => setGestorNome(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cargo / Matrícula
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gestorCargo}
                    onChange={(e) => setGestorCargo(e.target.value)}
                    placeholder="Cargo"
                    className="w-2/3 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    value={gestorMatricula}
                    onChange={(e) => setGestorMatricula(e.target.value)}
                    placeholder="Matrícula"
                    className="w-1/3 p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Checklist de Verificação Técnica Legal (Art. 140 Lei 14.133/2021) */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Declarações e Atestes Obrigatórios do Gestor (Lei nº 14.133/2021)
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {todosConferidos ? "3/3 Atendidos" : "Pendência no Checklist"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                <label className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={chkQuantidade}
                    onChange={(e) => setChkQuantidade(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      1. Quantidade Conferida
                    </span>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Itens entregues fisicamente na quantidade exata solicitada.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={chkQualidade}
                    onChange={(e) => setChkQualidade(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      2. Qualidade Desejada
                    </span>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Materiais e serviços testados e aprovados pelo fiscal técnico.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={chkEspecificacoes}
                    onChange={(e) => setChkEspecificacoes(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      3. Especificações Técnicas
                    </span>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Em total conformidade com o Termo de Referência e Contrato.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Prévia ao Vivo do Modelo Oficial da Plataforma */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                  Visualização do Gabarito Oficial Integrado (PARECER DE ACEITAÇÃO)
                </span>
                <span className="text-[10px] text-slate-400">
                  Gabarito Word: {modeloParecer.downloadUrl}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-serif text-xs text-slate-800 space-y-3 leading-relaxed shadow-inner">
                <div className="text-center font-bold tracking-wide text-sm border-b pb-2 text-slate-900">
                  PARECER DE ACEITAÇÃO
                </div>

                <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900">
                    Contrato nº {numContratoFormatado}
                  </div>
                  <div>
                    <strong>Vigência do Contrato:</strong> A vigência do contrato será de 12 (doze) meses contados da data de assinatura do contrato, podendo ser prorrogado por até 05 (cinco) anos, nos termos do art. 107 da Lei nº 14133/2021.
                  </div>
                  <div>
                    <strong>Data de assinatura:</strong> {dataAssinaturaFormatada}.
                  </div>
                  <div>
                    <strong>Razão Social da Contratada:</strong> {razaoSocialContratada}
                  </div>
                  <div>
                    <strong>Valor do Pagamento:</strong> {valorFormatadoTexto}.
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p>
                    Na qualidade de Gestor do Contrato nº <strong>{numContratoFormatado}</strong>, celebrado entre este município e a <strong>{razaoSocialContratada}</strong>, com CNPJ nº <strong>{cnpjContratada}</strong>, sediada na {enderecoContratada}, em atendimento a {clausulaReferencia}, do Contrato acima referenciado, declaro que os itens especificados na nota fiscal: de Nº <strong>{numeroNF || "000.001.783"}</strong>, foram efetivamente fornecidos, conferidos e aceitos definitivamente.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p>
                    Os itens foram submetidos a verificação deste Gestor, sendo considerados aceitos por atender aos requisitos da quantidade, qualidade desejada e ainda às especificações estabelecidas, tudo em conformidade com o Contrato em comento, celebrado entre a Município de Arapiraca e a CONTRATADA, reunindo condições de total aprovação.
                  </p>
                </div>

                <div className="pt-2 text-center text-slate-600 text-[11px]">
                  <div>Arapiraca, {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.</div>
                  <div className="font-bold text-slate-800 mt-2">{gestorNome}</div>
                  <div className="text-[10px] text-slate-500">{gestorCargo}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
            {/* Download Modelo Original Gabarito */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={modeloParecer.downloadUrl}
                download="PARECER DE ACEITAÇÃO.docx"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Baixar arquivo original do Word (.docx) sem alterações"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Baixar Gabarito Original (.docx)</span>
              </a>

              <button
                type="button"
                onClick={handleBaixarDocxPreenchido}
                disabled={gerandoDocx}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
                title="Gerar arquivo Word (.docx) preenchido com os dados deste contrato"
              >
                <FileCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>{gerandoDocx ? "Gerando Word..." : "Baixar .docx Preenchido"}</span>
              </button>
            </div>

            {/* Botões Principais */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={handleAbrirElaborador}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Abrir no Elaborador Completo com Papel Timbrado e assistente Tia Licita"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-200" />
                <span>Abrir no Elaborador Timbrado</span>
              </button>

              <button
                type="button"
                onClick={handleEmitirESalvar}
                disabled={salvando || !todosConferidos}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {salvando ? (
                  <span>Salvando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Emitir & Salvar Parecer</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Elaborador Documento Modal para visualização completa com timbre oficial */}
      {docParaElaborar && (
        <ElaboradorDocumentoModal
          isOpen={true}
          documentoInicial={docParaElaborar}
          onClose={() => setDocParaElaborar(null)}
          onSalvo={(salvo) => {
            setFeedback({
              type: "success",
              text: `Parecer '${salvo.titulo}' salvo com sucesso!`,
            });
            setDocParaElaborar(null);
            if (onSuccess) onSuccess();
          }}
        />
      )}
    </>
  );
}
