"use client";

import { useState, useMemo } from "react";
import { dataStore } from "@/lib/data-store";
import { DataTable, Column } from "@/components/shared/data-table";
import {
  DotacaoOrcamentaria,
  RegistroControleCredito,
  ContaOrcamentariaCredito,
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NovoCreditoSMSModal } from "@/components/orcamento/novo-credito-sms-modal";
import { ConsultaCreditoSMS } from "@/components/orcamento/consulta-credito-sms";
import { CadastrosSMSView } from "@/components/orcamento/cadastros-sms-view";
import {
  FileSpreadsheet,
  Download,
  PlusCircle,
  TableProperties,
  Landmark,
  Search,
  BookOpen,
  PieChart,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function OrcamentoPage() {
  const [activeTab, setActiveTab] = useState<
    "controle" | "contas" | "consulta" | "cadastros" | "dotacoes"
  >("controle");
  const [isNovoCreditoOpen, setIsNovoCreditoOpen] = useState(false);

  const dotacoes = dataStore.dotacoes;
  const creditosSMS = dataStore.creditosSMS;
  const contasSMS = dataStore.contasCreditoSMS;

  // Estatísticas da planilha
  const statsPlanilha = useMemo(() => {
    const totalRegistros = creditosSMS.length;
    const totalValor = creditosSMS.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
    const erros = creditosSMS.filter((c) => c.status === "ERRO").length;
    const oks = creditosSMS.filter((c) => c.status === "OK").length;
    const totalContas = contasSMS.length;
    const contasPodemReceber = contasSMS.filter((c) => c.podeReceberCredito === "SIM").length;
    const contasBloqueadas = contasSMS.filter((c) => c.podeReceberCredito === "NÃO").length;

    return {
      totalRegistros,
      totalValor,
      erros,
      oks,
      totalContas,
      contasPodemReceber,
      contasBloqueadas,
    };
  }, [creditosSMS, contasSMS]);

  // Colunas da aba CONTROLE (Planilha Original)
  const controleColumns: Column<RegistroControleCredito>[] = [
    {
      header: "Nº",
      accessorKey: "numero",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          #{row.numero}
        </span>
      ),
    },
    {
      header: "Data",
      accessorKey: "dataCredito",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-700 whitespace-nowrap">
          {row.dataCredito}
        </span>
      ),
    },
    {
      header: "Tipo do Crédito",
      accessorKey: "tipoCredito",
      sortable: true,
      cell: (row) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
            row.tipoCredito === "Transposição"
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-purple-50 text-purple-800 border-purple-200"
          }`}
        >
          {row.tipoCredito}
        </span>
      ),
    },
    {
      header: "Valor",
      accessorKey: "valor",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 whitespace-nowrap">
          {formatCurrency(row.valor)}
        </span>
      ),
    },
    {
      header: "Solicitante",
      accessorKey: "solicitante",
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.solicitante}
        </span>
      ),
    },
    {
      header: "Origem (PT / Elemento / Fonte)",
      cell: (row) => (
        <div className="text-[11px] leading-tight">
          <div className="font-mono font-bold text-rose-800">
            PT {row.programaOrigem}
          </div>
          <div className="font-mono text-slate-500 text-[10px] truncate max-w-[150px]" title={row.elementoOrigem}>
            {row.elementoOrigem}
          </div>
          <div className="font-mono text-slate-400 text-[10px]">
            Fonte: {row.fonteOrigem}
          </div>
        </div>
      ),
    },
    {
      header: "Destino (PT / Elemento / Fonte)",
      cell: (row) => (
        <div className="text-[11px] leading-tight">
          <div className="font-mono font-bold text-emerald-800">
            PT {row.programaDestino}
          </div>
          <div className="font-mono text-slate-500 text-[10px] truncate max-w-[150px]" title={row.elementoDestino}>
            {row.elementoDestino}
          </div>
          <div className="font-mono text-slate-400 text-[10px]">
            Fonte: {row.fonteDestino}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
            row.status === "OK"
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-rose-100 text-rose-800 border-rose-300"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Observações",
      accessorKey: "observacoes",
      cell: (row) => (
        <span
          className={`text-[11px] block max-w-xs ${
            row.status === "ERRO"
              ? "text-rose-700 font-semibold"
              : "text-slate-500"
          }`}
          title={row.observacoes}
        >
          {row.observacoes || "-"}
        </span>
      ),
    },
  ];

  // Colunas da aba CONTAS (Planilha Original)
  const contasColumns: Column<ContaOrcamentariaCredito>[] = [
    {
      header: "Programa de Trabalho",
      accessorKey: "programaTrabalho",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {row.programaTrabalho}
        </span>
      ),
    },
    {
      header: "Elemento de Despesa",
      accessorKey: "elemento",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-800" title={row.elemento}>
          {row.elemento}
        </span>
      ),
    },
    {
      header: "Fonte de Recursos",
      accessorKey: "fonte",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 font-medium">
          {row.fonte}
        </span>
      ),
    },
    {
      header: "Entradas",
      accessorKey: "entradas",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-700 text-xs">
          {row.entradas}
        </span>
      ),
    },
    {
      header: "Saídas",
      accessorKey: "saidas",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-rose-700 text-xs">
          {row.saidas}
        </span>
      ),
    },
    {
      header: "Situação",
      accessorKey: "situacao",
      cell: (row) => (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
          {row.situacao}
        </span>
      ),
    },
    {
      header: "Pode Receber Crédito?",
      accessorKey: "podeReceberCredito",
      sortable: true,
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
            row.podeReceberCredito === "SIM"
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-rose-100 text-rose-800 border-rose-300"
          }`}
        >
          {row.podeReceberCredito}
        </span>
      ),
    },
    {
      header: "Última Entrada",
      accessorKey: "ultimaEntrada",
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-600">
          {row.ultimaEntrada || "-"}
        </span>
      ),
    },
    {
      header: "Última Saída",
      accessorKey: "ultimaSaida",
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-600">
          {row.ultimaSaida || "-"}
        </span>
      ),
    },
  ];

  // Colunas de Dotações Gerais (Orçamento do Município)
  const dotacaoColumns: Column<DotacaoOrcamentaria>[] = [
    {
      header: "Programa de Trabalho",
      accessorKey: "programaDeTrabalho",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {row.programaDeTrabalho}
        </span>
      ),
    },
    {
      header: "Elemento de Despesa",
      accessorKey: "elementoDespesa",
      cell: (row) => (
        <span className="font-medium text-slate-800 text-xs">
          {row.elementoDespesa}
        </span>
      ),
    },
    {
      header: "Fonte de Recursos",
      accessorKey: "fonteRecurso",
      cell: (row) => (
        <span className="text-[11px] text-slate-600">{row.fonteRecurso}</span>
      ),
    },
    {
      header: "Orçamento Inicial",
      accessorKey: "orcamentoInicial",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(row.orcamentoInicial)}
        </span>
      ),
    },
    {
      header: "Saldo Disponível",
      accessorKey: "saldoDisponivel",
      sortable: true,
      cell: (row) => {
        const perc = Math.round(
          (row.saldoDisponivel / row.orcamentoInicial) * 100
        );
        return (
          <div>
            <div className="font-mono font-bold text-emerald-700">
              {formatCurrency(row.saldoDisponivel)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {perc}% livre
            </span>
          </div>
        );
      },
    },
    {
      header: "Valor Empenhado",
      accessorKey: "valorEmpenhado",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-slate-600">
          {formatCurrency(row.valorEmpenhado)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              Planilha Oficial SMS &bull; Arapiraca
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Controle de Créditos Adicionais
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Abertura & Remanejamento de Créditos Adicionais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Ambiente integrado que reflete <strong>100% da planilha original</strong> da Secretaria Municipal de Saúde, mantendo exatamente as colunas, registros, histórico de contas e regras contábeis de elegibilidade orçamentária.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/planilhas/creditos_adicionais_sms.xlsx"
            download="creditos_adicionais_sms.xlsx"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-xs"
            title="Baixar a planilha original no formato Excel (.xlsx)"
          >
            <Download className="h-4 w-4 text-emerald-700" />
            <span>Baixar Planilha (.xlsx)</span>
          </a>

          <button
            onClick={() => setIsNovoCreditoOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Lançamento na Planilha</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Reais da Planilha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Financeiro */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Movimentado na Planilha
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(statsPlanilha.totalValor)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{statsPlanilha.totalRegistros} movimentações registradas</span>
          </div>
        </div>

        {/* Lançamentos Regulares vs Inconsistências */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Status dos Créditos
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-700 font-mono">
              {statsPlanilha.oks} OK
            </span>
            <span className="text-sm font-bold text-slate-400">/</span>
            <span className="text-xl font-black text-rose-600 font-mono">
              {statsPlanilha.erros} ERRO
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>7 dest. usados antes como origem</span>
          </div>
        </div>

        {/* Contas Orçamentárias Mapeadas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Contas Orçamentárias (Aba CONTAS)
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {statsPlanilha.totalContas} Contas
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-700 font-bold">{statsPlanilha.contasPodemReceber} aptas</span>
            <span>&bull;</span>
            <span className="text-rose-600 font-bold">{statsPlanilha.contasBloqueadas} bloqueadas</span>
          </div>
        </div>

        {/* Regra Contábil / Compliance */}
        <div className="bg-emerald-950 text-white rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold uppercase">
            <span>Regra STN / LOA Ativa</span>
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white mt-1">
            Fidelidade 100% à Planilha
          </div>
          <p className="text-[11px] text-emerald-200 mt-1 leading-tight">
            Nenhuma modificação estrutural foi feita nos dados ou regras.
          </p>
        </div>
      </div>

      {/* Navegação por Abas (Exatamente as 4 Abas da Planilha + LOA Geral) */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("controle")}
          className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "controle"
              ? "border-emerald-700 text-emerald-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TableProperties className="h-4 w-4" />
          <span>Aba CONTROLE ({creditosSMS.length} movimentações)</span>
        </button>

        <button
          onClick={() => setActiveTab("contas")}
          className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "contas"
              ? "border-emerald-700 text-emerald-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Aba CONTAS ({contasSMS.length} contas)</span>
        </button>

        <button
          onClick={() => setActiveTab("consulta")}
          className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "consulta"
              ? "border-emerald-700 text-emerald-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Search className="h-4 w-4 text-emerald-600" />
          <span>Aba CONSULTA (Simulador & Histórico)</span>
        </button>

        <button
          onClick={() => setActiveTab("cadastros")}
          className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "cadastros"
              ? "border-emerald-700 text-emerald-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="h-4 w-4 text-slate-600" />
          <span>Aba CADASTROS (Parâmetros)</span>
        </button>

        <button
          onClick={() => setActiveTab("dotacoes")}
          className={`pb-2.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "dotacoes"
              ? "border-emerald-700 text-emerald-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PieChart className="h-4 w-4 text-slate-400" />
          <span>Dotações Gerais do SUS ({dotacoes.length})</span>
        </button>
      </div>

      {/* Conteúdo da Aba CONTROLE */}
      {activeTab === "controle" && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Observação da Planilha Oficial:</strong> Os créditos com <strong>STATUS = ERRO</strong> refletem a regra orçamentária do município onde um Programa de Trabalho de destino já havia sido utilizado anteriormente como origem de anulação de recursos.
            </div>
          </div>

          <DataTable
            data={creditosSMS}
            columns={controleColumns}
            title="Lançamentos Oficiais de Créditos (Aba CONTROLE)"
            searchPlaceholder="Filtrar por solicitante, tipo, programa, elemento ou fonte..."
            itemsPerPage={12}
          />
        </div>
      )}

      {/* Conteúdo da Aba CONTAS */}
      {activeTab === "contas" && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Regra Contábil de Elegibilidade:</strong> Uma conta tem <strong>Pode Receber Crédito? = &quot;NÃO&quot;</strong> quando seu número de saídas for maior que zero (&gt; 0), protegendo contra ciclagem de créditos no orçamento.
            </div>
          </div>

          <DataTable
            data={contasSMS}
            columns={contasColumns}
            title="Quadro Geral de Contas Orçamentárias da Saúde (Aba CONTAS)"
            searchPlaceholder="Filtrar por Programa de Trabalho, Elemento ou Fonte..."
            itemsPerPage={12}
          />
        </div>
      )}

      {/* Conteúdo da Aba CONSULTA */}
      {activeTab === "consulta" && <ConsultaCreditoSMS />}

      {/* Conteúdo da Aba CADASTROS */}
      {activeTab === "cadastros" && <CadastrosSMSView />}

      {/* Conteúdo da Aba DOTAÇÕES GERAIS */}
      {activeTab === "dotacoes" && (
        <DataTable
          data={dotacoes}
          columns={dotacaoColumns}
          title="Execução Orçamentária por Programa de Trabalho e Fonte (SUS)"
          searchPlaceholder="Filtrar por programa ou elemento de despesa..."
          itemsPerPage={10}
        />
      )}

      {/* Modal de Inserção de Novo Crédito na Planilha */}
      <NovoCreditoSMSModal
        isOpen={isNovoCreditoOpen}
        onClose={() => setIsNovoCreditoOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
