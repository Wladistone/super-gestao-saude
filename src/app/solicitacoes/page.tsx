"use client";

import { useState, useEffect, useMemo } from "react";
import { dataStore } from "@/lib/data-store";
import {
  DemandaPreviaProcesso,
  SuperintendenciaSigla,
  StatusDemandaPrevia,
} from "@/lib/types";
import { SUPERINTENDENCIAS_SMS } from "@/data/demandas-previas-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NovaDemandaPreviaModal } from "@/components/processos/nova-demanda-previa-modal";
import { DespacharTramitacaoModal } from "@/components/tramitacao/despachar-tramitacao-modal";
import { EnquadramentoSGModal } from "@/components/processos/enquadramento-sg-modal";
import { ResponderDiligenciaModal } from "@/components/tramitacao/responder-diligencia-modal";
import {
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  Download,
  Building2,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Eye,
  Check,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Printer,
  Sparkles,
} from "lucide-react";

export default function SolicitacoesPage() {
  const [busca, setBusca] = useState("");
  const [filtroSuperintendencia, setFiltroSuperintendencia] = useState<string>("TODAS");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [isNovaSolicitacaoOpen, setIsNovaSolicitacaoOpen] = useState(false);
  const [solicitacaoDetalhes, setSolicitacaoDetalhes] = useState<DemandaPreviaProcesso | null>(null);
  const [solicitacaoParaDespacho, setSolicitacaoParaDespacho] = useState<DemandaPreviaProcesso | null>(null);
  const [solicitacaoParaEnquadramento, setSolicitacaoParaEnquadramento] = useState<DemandaPreviaProcesso | null>(null);
  const [solicitacaoParaDiligencia, setSolicitacaoParaDiligencia] = useState<DemandaPreviaProcesso | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [usuarioLogado, setUsuarioLogado] = useState<{
    nome?: string;
    email?: string;
    cargo?: string;
    setor?: string;
    perfil?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("supergestao_usuario_logado");
      if (salvo) {
        const u = JSON.parse(salvo);
        setUsuarioLogado(u);
        if (u.setor && u.setor !== "SG" && u.email !== "will2026@gmail.com") {
          setFiltroSuperintendencia(u.setor);
        }
      }
    } catch {}
  }, []);

  const isGestorSG = useMemo(() => {
    if (!usuarioLogado) return true;
    const email = (usuarioLogado.email || "").toLowerCase();
    const setor = (usuarioLogado.setor || "").toUpperCase();
    const cargo = (usuarioLogado.cargo || "").toLowerCase();
    return (
      email === "will2026@gmail.com" ||
      setor === "SG" ||
      cargo.includes("gestão") ||
      cargo.includes("coordenadora geral") ||
      (usuarioLogado.perfil === "ADMINISTRADOR" && setor === "SG")
    );
  }, [usuarioLogado]);

  // Recarrega lista viva de demandas da store respeitando a segregação por superintendência
  const todasSolicitacoes = useMemo(() => {
    let lista = [...dataStore.demandasPrevias];
    if (!isGestorSG) {
      const lotacao = (usuarioLogado?.setor || "SAS").toUpperCase();
      lista = lista.filter((d) => d.superintendenciaOrigem.toUpperCase() === lotacao);
    }
    return lista.sort((a, b) => {
      return new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime();
    });
  }, [refreshTrigger, isGestorSG, usuarioLogado]);

  // Contadores / Indicadores de KPIs
  const totalSolicitacoes = todasSolicitacoes.length;
  const aguardandoSG = todasSolicitacoes.filter((d) => d.status === "AGUARDANDO_ENQUADRAMENTO_SG").length;
  const diligencias = todasSolicitacoes.filter((d) => d.status === "DILIGENCIA_SOLICITADA").length;
  const autorizadas = todasSolicitacoes.filter((d) => d.status === "ENQUADRADA_E_AUTORIZADA").length;
  const valorTotalSolicitado = todasSolicitacoes.reduce((acc, d) => acc + (d.valorTotalEstimado || 0), 0);

  // Filtragem ativa
  const solicitacoesFiltradas = useMemo(() => {
    return todasSolicitacoes.filter((sol) => {
      const matchBusca =
        busca.trim() === "" ||
        sol.numeroDemanda.toLowerCase().includes(busca.toLowerCase()) ||
        sol.objeto.toLowerCase().includes(busca.toLowerCase()) ||
        sol.superintendenciaNome.toLowerCase().includes(busca.toLowerCase()) ||
        sol.coordenacaoOrigem.toLowerCase().includes(busca.toLowerCase()) ||
        sol.responsavelNome.toLowerCase().includes(busca.toLowerCase());

      const matchSuper =
        filtroSuperintendencia === "TODAS" || sol.superintendenciaOrigem === filtroSuperintendencia;

      const matchStatus =
        filtroStatus === "TODOS" || sol.status === filtroStatus;

      return matchBusca && matchSuper && matchStatus;
    });
  }, [todasSolicitacoes, busca, filtroSuperintendencia, filtroStatus]);

  // Função para exportar CSV
  const exportarCSV = () => {
    const headers = [
      "Número Demanda",
      "Superintendência",
      "Coordenação",
      "Responsável",
      "Data Solicitação",
      "Objeto",
      "Valor Estimado",
      "Status",
    ];

    const rows = solicitacoesFiltradas.map((s) => [
      s.numeroDemanda,
      s.superintendenciaOrigem,
      `"${s.coordenacaoOrigem}"`,
      `"${s.responsavelNome}"`,
      s.dataSolicitacao.slice(0, 10),
      `"${s.objeto.replace(/"/g, '""')}"`,
      s.valorTotalEstimado.toFixed(2),
      s.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `solicitacoes_sms_arapiraca_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cores de Badge de Superintendência
  const getSuperintendenciaBadge = (sigla: SuperintendenciaSigla) => {
    const configs: Record<SuperintendenciaSigla, { bg: string; text: string; border: string }> = {
      SAS: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
      SUVIG: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      SGTES: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      SURCAA: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
      SG: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
    };
    const c = configs[sigla] || configs.SAS;
    return `${c.bg} ${c.text} ${c.border} border`;
  };

  // Cores de Badge de Status
  const getStatusBadge = (status: StatusDemandaPrevia) => {
    switch (status) {
      case "AGUARDANDO_ENQUADRAMENTO_SG":
        return {
          label: "Aguardando Triagem SG",
          className: "bg-amber-50 text-amber-700 border-amber-200 border",
          icon: Clock,
        };
      case "EM_ANALISE_SG":
        return {
          label: "Em Análise Técnica",
          className: "bg-sky-50 text-sky-700 border-sky-200 border",
          icon: Clock,
        };
      case "DILIGENCIA_SOLICITADA":
        return {
          label: "Ajuste Solicitado",
          className: "bg-amber-50 text-amber-800 border-amber-200 border",
          icon: Clock,
        };
      case "ENQUADRADA_E_AUTORIZADA":
        return {
          label: "Autorizada para Licitação",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200 border",
          icon: CheckCircle,
        };
      case "INDEFERIDA_SG":
        return {
          label: "Não Aprovada",
          className: "bg-slate-100 text-slate-700 border-slate-300 border",
          icon: Clock,
        };
      default:
        return {
          label: status,
          className: "bg-slate-50 text-slate-700 border-slate-200 border",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-100 text-sky-800 border border-sky-200">
              Protocolo & Requisições de Saúde
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-sky-600" />
            Solicitações & Demandas
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Painel de requisições de bens, medicamentos e contratações de serviços das Unidades
            Básicas (UBS), UPAs, Vigilância em Saúde e demais setores da Secretaria Municipal de Saúde.
          </p>
        </div>

        {/* Botão de Ação Primária */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Exportar dados das solicitações em formato CSV"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas / KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total de Demandas</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalSolicitacoes}</span>
            <span className="text-[10px] text-slate-400 font-medium">Protocoladas</span>
          </div>
        </div>

        {/* Aguardando Triagem */}
        <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Aguardando Triagem</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700">{aguardandoSG}</span>
            <span className="text-[10px] text-amber-600 font-medium">Fila SG</span>
          </div>
        </div>

        {/* Ajustes / Diligências */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ajustes Solicitados</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{diligencias}</span>
            <span className="text-[10px] text-slate-400 font-medium">Revisão Pendente</span>
          </div>
        </div>

        {/* Autorizadas */}
        <div className="p-4 rounded-xl bg-white border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Autorizadas / SG</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{autorizadas}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Em Contratação</span>
          </div>
        </div>

        {/* Valor Total Estimado */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Montante Estimado</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-sky-900 leading-tight">
              {formatCurrency(valorTotalSolicitado)}
            </span>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Soma dos Itens</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros & Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número, objeto, coordenação ou solicitante..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros em Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por Superintendência */}
          {isGestorSG ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={filtroSuperintendencia}
                onChange={(e) => setFiltroSuperintendencia(e.target.value)}
                className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="TODAS">Todas Superintendências</option>
                {SUPERINTENDENCIAS_SMS.map((s) => (
                  <option key={s.sigla} value={s.sigla}>
                    {s.sigla} - {s.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-900 font-bold">
              <Building2 className="h-3.5 w-3.5 text-blue-700" />
              <span>Lotação Fixa: {usuarioLogado?.setor || "SAS"}</span>
            </div>
          )}

          {/* Filtro por Status */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="AGUARDANDO_ENQUADRAMENTO_SG">Aguardando Triagem SG</option>
              <option value="EM_ANALISE_SG">Em Análise Técnica</option>
              <option value="DILIGENCIA_SOLICITADA">Diligência / Adequação</option>
              <option value="ENQUADRADA_E_AUTORIZADA">Autorizada / Licitando</option>
              <option value="INDEFERIDA_SG">Indeferida</option>
            </select>
          </div>

          {(busca || filtroSuperintendencia !== "TODAS" || filtroStatus !== "TODOS") && (
            <button
              onClick={() => {
                setBusca("");
                setFiltroSuperintendencia("TODAS");
                setFiltroStatus("TODOS");
              }}
              className="p-2 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 flex items-center gap-1 transition-colors"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <span>Listagem de Solicitações Oficiais</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
              {solicitacoesFiltradas.length} {solicitacoesFiltradas.length === 1 ? "registro" : "registros"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Regulamentado sob os termos da Lei Federal nº 14.133/2021
          </span>
        </div>

        {solicitacoesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Nenhuma solicitação encontrada</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tente alterar os termos de busca ou filtros de status e superintendência.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Demanda / DFD</th>
                  <th className="py-3 px-4">Origem Solicitante</th>
                  <th className="py-3 px-4">Objeto da Solicitação</th>
                  <th className="py-3 px-4">Qtd. Itens</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitacoesFiltradas.map((sol) => {
                  const statusInfo = getStatusBadge(sol.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={sol.id}
                      className="hover:bg-sky-50/40 transition-colors group"
                    >
                      {/* Nº Demanda */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {sol.numeroDemanda}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(sol.dataSolicitacao)}</span>
                        </div>
                      </td>

                      {/* Origem */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getSuperintendenciaBadge(
                            sol.superintendenciaOrigem
                          )}`}
                        >
                          {sol.superintendenciaOrigem}
                        </span>
                        <div className="text-[11px] font-medium text-slate-700 truncate max-w-[180px] mt-0.5">
                          {sol.coordenacaoOrigem}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          Resp: {sol.responsavelNome}
                        </div>
                      </td>

                      {/* Objeto */}
                      <td className="py-3 px-4 max-w-sm">
                        <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                          {sol.objeto}
                        </p>
                        {sol.justificativaNecessidade && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            Justificativa: {sol.justificativaNecessidade}
                          </p>
                        )}
                      </td>

                      {/* Qtd Itens */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {sol.itens?.length || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          {sol.itens?.length === 1 ? "item" : "itens"}
                        </span>
                      </td>

                      {/* Valor Estimado */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {formatCurrency(sol.valorTotalEstimado)}
                        </div>
                        <div className="text-[10px] text-slate-400">Previsão DFD</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusInfo.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detalhes / DFD */}
                          <button
                            onClick={() => setSolicitacaoDetalhes(sol)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-100 rounded-md transition-colors"
                            title="Ver Processo e Itens da Demanda"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Se aguardando SG: Botão Enquadrar */}
                          {sol.status === "AGUARDANDO_ENQUADRAMENTO_SG" && (
                            <button
                              onClick={() => setSolicitacaoParaEnquadramento(sol)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="Fixar Modalidade e Enquadrar Demanda na SG"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>Enquadrar SG</span>
                            </button>
                          )}

                          {/* Se diligência: Botão Responder */}
                          {sol.status === "DILIGENCIA_SOLICITADA" && (
                            <button
                              onClick={() => setSolicitacaoParaDiligencia(sol)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="Responder Diligência da SG"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Responder</span>
                            </button>
                          )}

                          {/* Despachar Tramitação */}
                          <button
                            onClick={() => setSolicitacaoParaDespacho(sol)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Despachar ou Tramitar Demanda"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Solicitação */}
      {solicitacaoDetalhes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Topo do Modal */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 font-mono">
                      {solicitacaoDetalhes.numeroDemanda}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSuperintendenciaBadge(
                        solicitacaoDetalhes.superintendenciaOrigem
                      )}`}
                    >
                      {solicitacaoDetalhes.superintendenciaOrigem}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Documento de Formalização de Demanda (DFD) • Protocolado em{" "}
                    {formatDate(solicitacaoDetalhes.dataSolicitacao)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSolicitacaoDetalhes(null)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {/* Informações Gerais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Unidade Solicitante
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {solicitacaoDetalhes.superintendenciaNome}
                  </p>
                  <p className="text-slate-500">{solicitacaoDetalhes.coordenacaoOrigem}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Servidor Responsável
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {solicitacaoDetalhes.responsavelNome}
                  </p>
                  <p className="text-slate-500">{solicitacaoDetalhes.responsavelEmail || "Não informado"}</p>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Objeto Solicitado
                  </span>
                  <p className="font-medium text-slate-800 mt-0.5 text-xs leading-relaxed">
                    {solicitacaoDetalhes.objeto}
                  </p>
                </div>

                {solicitacaoDetalhes.justificativaNecessidade && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Justificativa de Interesse Público & Saúde
                    </span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      {solicitacaoDetalhes.justificativaNecessidade}
                    </p>
                  </div>
                )}
              </div>

              {/* Tabela de Itens Solicitados */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-sky-600" />
                    Itens e Quantitativos Solicitados ({solicitacaoDetalhes.itens?.length || 0})
                  </h4>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    Total: {formatCurrency(solicitacaoDetalhes.valorTotalEstimado)}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Descrição do Material / Serviço</th>
                        <th className="py-2.5 px-3">Unid.</th>
                        <th className="py-2.5 px-3 text-right">Qtd.</th>
                        <th className="py-2.5 px-3 text-right">Valor Unit.</th>
                        <th className="py-2.5 px-3 text-right">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {solicitacaoDetalhes.itens?.map((it, idx) => (
                        <tr key={it.id || idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                            {String(it.numeroItem || idx + 1).padStart(2, "0")}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="font-medium text-slate-800">{it.descricao}</div>
                            {it.especificacaoTecnica && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {it.especificacaoTecnica}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono">{it.unidadeMedida}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            {it.quantidade}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {it.valorUnitarioEstimado ? formatCurrency(it.valorUnitarioEstimado) : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {it.valorTotalEstimado
                              ? formatCurrency(it.valorTotalEstimado)
                              : it.valorUnitarioEstimado
                              ? formatCurrency(it.valorUnitarioEstimado * it.quantidade)
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Histórico de Tramitação */}
              {solicitacaoDetalhes.historicoTramitacao && solicitacaoDetalhes.historicoTramitacao.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Histórico de Tramitação e Despachos
                  </h4>
                  <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-3">
                    {solicitacaoDetalhes.historicoTramitacao.map((h, i) => (
                      <div key={h.id || i} className="relative pb-2">
                        <div className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-sky-600 ring-4 ring-white" />
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-mono">{formatDate(h.data)}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{h.acao}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{h.motivoOuDespacho}</p>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Por: <span className="text-slate-600 font-medium">{h.usuario}</span> ({h.origem} → {h.destino})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Modal com Ações */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir DFD</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const d = solicitacaoDetalhes;
                    setSolicitacaoDetalhes(null);
                    setSolicitacaoParaDespacho(d);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Despachar Demanda</span>
                </button>
                <button
                  onClick={() => setSolicitacaoDetalhes(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Demanda / Solicitação */}
      <NovaDemandaPreviaModal
        isOpen={isNovaSolicitacaoOpen}
        onClose={() => setIsNovaSolicitacaoOpen(false)}
        onSuccess={() => {
          setIsNovaSolicitacaoOpen(false);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* Modal Despachar Tramitação */}
      {solicitacaoParaDespacho && (
        <DespacharTramitacaoModal
          demanda={solicitacaoParaDespacho}
          isOpen={!!solicitacaoParaDespacho}
          onClose={() => setSolicitacaoParaDespacho(null)}
          onSuccess={() => {
            setSolicitacaoParaDespacho(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
          nomeServidor="Dr. Carlos Eduardo Menezes"
          setorServidor="Superintendência de Gestão (SG)"
        />
      )}

      {/* Modal Enquadramento SG */}
      {solicitacaoParaEnquadramento && (
        <EnquadramentoSGModal
          demanda={solicitacaoParaEnquadramento}
          isOpen={!!solicitacaoParaEnquadramento}
          onClose={() => setSolicitacaoParaEnquadramento(null)}
          onSuccess={() => {
            setSolicitacaoParaEnquadramento(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {/* Modal Responder Diligência */}
      {solicitacaoParaDiligencia && (
        <ResponderDiligenciaModal
          demanda={solicitacaoParaDiligencia}
          isOpen={!!solicitacaoParaDiligencia}
          onClose={() => setSolicitacaoParaDiligencia(null)}
          onSuccess={() => {
            setSolicitacaoParaDiligencia(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
