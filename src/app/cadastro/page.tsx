"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Ban,
  Search,
  Filter,
  UserPlus,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  Eye,
  Edit3,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Bell,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { SolicitacaoCadastro, StatusSolicitacaoCadastro } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { AutorizarCadastroModal } from "@/components/cadastro/autorizar-cadastro-modal";

export default function CadastroPage() {
  const [tabAtiva, setTabAtiva] = useState<"PENDENTES" | "AUTORIZADOS" | "REJEITADOS" | "TODOS">("PENDENTES");
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroSuperintendencia, setFiltroSuperintendencia] = useState("TODAS");
  const [solicitacaoParaAutorizar, setSolicitacaoParaAutorizar] = useState<SolicitacaoCadastro | null>(null);
  const [isNovoCadastroManualOpen, setIsNovoCadastroManualOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Lista reativa viva de cadastros (sincronizada com localStorage e dataStore)
  const [cadastros, setCadastros] = useState<SolicitacaoCadastro[]>(() => dataStore.obterSolicitacoesCadastro());

  const recarregarCadastros = () => {
    const lista = dataStore.obterSolicitacoesCadastro();
    setCadastros([...lista]);
  };

  useEffect(() => {
    recarregarCadastros();

    const handleAtualizacao = () => {
      recarregarCadastros();
    };

    window.addEventListener("supergestao_cadastro_atualizado", handleAtualizacao);
    window.addEventListener("storage", handleAtualizacao);

    return () => {
      window.removeEventListener("supergestao_cadastro_atualizado", handleAtualizacao);
      window.removeEventListener("storage", handleAtualizacao);
    };
  }, [refreshTrigger]);

  // Contadores
  const qtdPendentes = cadastros.filter((c) => c.status === "PENDENTE_SG").length;
  const qtdAutorizados = cadastros.filter((c) => c.status === "AUTORIZADO").length;
  const qtdRejeitados = cadastros.filter((c) => c.status === "REJEITADO").length;

  // Filtragem
  const cadastrosFiltrados = cadastros.filter((c) => {
    // Filtro por Tab
    if (tabAtiva === "PENDENTES" && c.status !== "PENDENTE_SG") return false;
    if (tabAtiva === "AUTORIZADOS" && c.status !== "AUTORIZADO") return false;
    if (tabAtiva === "REJEITADOS" && c.status !== "REJEITADO") return false;

    // Filtro por Superintendência
    if (filtroSuperintendencia !== "TODAS" && c.superintendenciaLotacao !== filtroSuperintendencia) {
      return false;
    }

    // Filtro por Texto
    if (termoBusca.trim()) {
      const termo = termoBusca.toLowerCase();
      const matchNome = c.nomeCompleto.toLowerCase().includes(termo);
      const matchEmail = c.email.toLowerCase().includes(termo);
      const matchCpf = c.cpf.includes(termo);
      const matchMatricula = c.matricula.toLowerCase().includes(termo);
      const matchCargo = c.cargo.toLowerCase().includes(termo);
      return matchNome || matchEmail || matchCpf || matchMatricula || matchCargo;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-700" />
            Superintendência de Gestão (SG) • Governança & Controle de Acessos
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            CADASTRO & Autorização de Servidores
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Fila oficial da SG para autorização de acessos solicitados na tela de login. Defina granularmente quais módulos cada servidor poderá visualizar e quais terá permissão de editar.
          </p>
        </div>

        {/* Informação do Operador SG */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              SG
            </div>
            <div className="text-left text-xs">
              <span className="font-bold text-slate-900 block leading-tight">
                Dra. Willianne Soares
              </span>
              <span className="text-[10px] text-indigo-700 font-semibold block leading-tight">
                Coordenadora Geral de Gestão (SG) • will2026@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* INFORME OFICIAL DA COORDENADORA GERAL: NÚMERO DE CADASTROS PENDENTES */}
      {/* =================================================================== */}
      {qtdPendentes > 0 ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-500/25 border-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner border border-white/30">
              <Bell className="h-7 w-7 animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 text-[11px] font-bold tracking-wider uppercase text-amber-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Informe de Gestão • Coordenadora Geral (will2026@gmail.com)
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-1 text-white leading-tight">
                {qtdPendentes === 1
                  ? "Existe 1 novo cadastro de servidor aguardando sua avaliação e autorização!"
                  : `Existem ${qtdPendentes} novos cadastros de servidores aguardando sua avaliação e autorização!`}
              </h2>
              <p className="text-xs text-amber-100/95 mt-1 leading-relaxed max-w-2xl">
                Os servidores preencheram seus dados cadastrais no portal de login. Avalie os acessos abaixo para configurar granularmente os módulos que poderão <strong>visualizar</strong> e <strong>editar</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t border-amber-400/40 md:border-t-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-200 block">Fila Atual</span>
              <span className="text-2xl font-black font-mono leading-none text-white drop-shadow-sm">
                {qtdPendentes} PENDENTES
              </span>
            </div>
            <button
              onClick={() => {
                setTabAtiva("PENDENTES");
                const primeiro = cadastros.find((c) => c.status === "PENDENTE_SG");
                if (primeiro) {
                  setSolicitacaoParaAutorizar(primeiro);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-black text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2 shrink-0"
              title="Abrir o primeiro cadastro da fila para autorizar"
            >
              <span>Avaliar e Autorizar</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Todos os cadastros foram avaliados com sucesso! Não há servidores pendentes de autorização na SG.</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-200/70 text-emerald-950 rounded-md font-bold">
            0 PENDENTES
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pendentes SG */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Aguardando SG
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">{qtdPendentes}</span>
            <span className="text-[11px] font-bold text-amber-700">cadastros pendentes</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Requerem autorização e atribuição de permissões da SG
          </p>
        </div>

        {/* Card 2: Autorizados */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Servidores Autorizados
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">{qtdAutorizados}</span>
            <span className="text-[11px] font-bold text-emerald-700">acessos ativos</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Com privilégios atribuídos por módulo
          </p>
        </div>

        {/* Card 3: Rejeitados */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recusados / Devolvidos
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <Ban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-900">{qtdRejeitados}</span>
            <span className="text-[11px] font-bold text-rose-700">inconformidades</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Pendências funcionais ou de matrícula
          </p>
        </div>

        {/* Card 4: Total */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de Solicitações
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{cadastros.length}</span>
            <span className="text-[11px] font-bold text-indigo-700">registros totais</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Histórico auditável de governança SG
          </p>
        </div>
      </div>

      {/* Tabs & Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Sub-abas de Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setTabAtiva("PENDENTES")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                tabAtiva === "PENDENTES"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Pendentes de Autorização</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                tabAtiva === "PENDENTES" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              }`}>
                {qtdPendentes}
              </span>
            </button>

            <button
              onClick={() => setTabAtiva("AUTORIZADOS")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                tabAtiva === "AUTORIZADOS"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Autorizados</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                tabAtiva === "AUTORIZADOS" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}>
                {qtdAutorizados}
              </span>
            </button>

            <button
              onClick={() => setTabAtiva("REJEITADOS")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                tabAtiva === "REJEITADOS"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Rejeitados</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                tabAtiva === "REJEITADOS" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
              }`}>
                {qtdRejeitados}
              </span>
            </button>

            <button
              onClick={() => setTabAtiva("TODOS")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                tabAtiva === "TODOS"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Todos os Cadastros ({cadastros.length})</span>
            </button>
          </div>
        </div>

        {/* Barra de Busca e Filtro de Lotação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, matrícula ou cargo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 font-bold text-[11px] shrink-0">Lotação:</span>
            <select
              value={filtroSuperintendencia}
              onChange={(e) => setFiltroSuperintendencia(e.target.value)}
              className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs"
            >
              <option value="TODAS">Todas as Superintendências</option>
              <option value="SG">SG - Superintendência de Gestão</option>
              <option value="SAS">SAS - Superintendência de Atenção à Saúde</option>
              <option value="SUVIG">SUVIG - Superintendência de Vigilância em Saúde</option>
              <option value="SGTES">SGTES - Gestão do Trabalho e Educação</option>
              <option value="SURCAA">SURCAA - Regulação, Controle e Avaliação</option>
              <option value="GABINETE">GABINETE - Gabinete da Secretária</option>
            </select>
          </div>
        </div>

      </div>

      {/* Tabela de Cadastros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {cadastrosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <UserCheck className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">
              Nenhuma solicitação de cadastro encontrada com os filtros selecionados.
            </p>
            <p className="text-xs">
              Altere o filtro de status ou limpe o termo de busca para visualizar mais cadastros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Servidor / Solicitante</th>
                  <th className="py-3 px-4">Matrícula & CPF</th>
                  <th className="py-3 px-4">Lotação & Cargo</th>
                  <th className="py-3 px-4">Submetido em</th>
                  <th className="py-3 px-4">Status SG</th>
                  <th className="py-3 px-4">Permissões Módulos</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cadastrosFiltrados.map((cad) => {
                  const qtdEdicao = cad.permissoes?.filter((p) => p.editar || p.nivel === "EDICAO" || p.nivel === "VISUALIZACAO_E_EDICAO").length || 0;
                  const qtdVis = cad.permissoes?.filter((p) => p.visualizar || p.nivel === "VISUALIZACAO" || p.nivel === "VISUALIZACAO_E_EDICAO").length || 0;
                  const qtdAmbos = cad.permissoes?.filter((p) => (p.visualizar && p.editar) || p.nivel === "VISUALIZACAO_E_EDICAO").length || 0;

                  return (
                    <tr key={cad.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Servidor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {cad.nomeCompleto.split(" ")[0]?.[0]}
                            {cad.nomeCompleto.split(" ").slice(-1)[0]?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {cad.nomeCompleto}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {cad.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Matrícula & CPF */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">
                          {cad.matricula}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {cad.cpf}
                        </div>
                      </td>

                      {/* Lotação & Cargo */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          {cad.superintendenciaLotacao}
                        </span>
                        <div className="font-medium text-slate-800 text-[11px] mt-0.5 line-clamp-1">
                          {cad.cargo}
                        </div>
                      </td>

                      {/* Data */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {formatDate(cad.dataSolicitacao)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {cad.status === "PENDENTE_SG" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Aguardando SG
                          </span>
                        )}
                        {cad.status === "AUTORIZADO" && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Autorizado SG
                            </span>
                            {cad.autorizadoPor && (
                              <span className="text-[9px] text-slate-400 block mt-0.5 truncate max-w-[140px]" title={cad.autorizadoPor}>
                                por {cad.autorizadoPor.split(" ")[0]}
                              </span>
                            )}
                          </div>
                        )}
                        {cad.status === "REJEITADO" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <Ban className="h-3 w-3 text-rose-600" />
                            Rejeitado
                          </span>
                        )}
                      </td>

                      {/* Permissões Módulos */}
                      <td className="py-3.5 px-4">
                        {cad.status === "AUTORIZADO" ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {qtdAmbos > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-bold border border-indigo-200 text-[9px]" title={`${qtdAmbos} módulos com Visualização e Edição simultâneas`}>
                                {qtdAmbos} Ambos
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200 text-[9px]">
                              {qtdVis} Vis
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 text-[9px]">
                              {qtdEdicao} Ed
                            </span>
                          </div>
                        ) : cad.status === "PENDENTE_SG" ? (
                          <span className="text-[10px] text-amber-700 font-medium italic">
                            A definir pela SG
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-600 font-medium italic">
                            Acesso bloqueado
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        {cad.status === "PENDENTE_SG" ? (
                          <button
                            type="button"
                            onClick={() => setSolicitacaoParaAutorizar(cad)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                            title="Avaliar dados e definir quais módulos o servidor poderá visualizar e editar"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Avaliar & Autorizar</span>
                          </button>
                        ) : cad.status === "AUTORIZADO" ? (
                          <button
                            type="button"
                            onClick={() => setSolicitacaoParaAutorizar(cad)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            title="Revisar e alterar permissões de módulos"
                          >
                            <Edit3 className="h-3 w-3 text-slate-500" />
                            <span>Ajustar Permissões</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSolicitacaoParaAutorizar(cad)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-50 text-rose-800 font-bold text-xs transition-colors cursor-pointer"
                            title="Reabrir e reavaliar solicitação recusada"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reavaliar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Autorização & Atribuição de Permissões pela SG */}
      {solicitacaoParaAutorizar && (
        <AutorizarCadastroModal
          isOpen={!!solicitacaoParaAutorizar}
          solicitacao={solicitacaoParaAutorizar}
          autorizadorPadrao="Dra. Willianne Soares (Coordenadora Geral de Gestão - will2026@gmail.com)"
          onClose={() => setSolicitacaoParaAutorizar(null)}
          onSuccess={() => {
            recarregarCadastros();
            setRefreshTrigger((prev) => prev + 1);
            setSolicitacaoParaAutorizar(null);
          }}
        />
      )}

    </div>
  );
}
