"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Scale,
  FileText,
  ArrowRight,
  ShieldAlert,
  FolderTree,
  Send,
  Eye,
  RotateCcw,
} from "lucide-react";
import { DemandaPreviaProcesso, SuperintendenciaSigla } from "@/lib/types";
import { dataStore } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SUPERINTENDENCIAS_SMS } from "@/data/demandas-previas-data";
import { EnquadramentoSGModal } from "./enquadramento-sg-modal";
import { DetalhesDemandaModal } from "./detalhes-demanda-modal";

export function TramitacaoDemandasTab() {
  const [busca, setBusca] = useState("");
  const [superintendenciaFiltro, setSuperintendenciaFiltro] = useState<string>("TODAS");
  const [statusFiltro, setStatusFiltro] = useState<string>("TODOS");

  const [demandaParaEnquadrar, setDemandaParaEnquadrar] = useState<DemandaPreviaProcesso | null>(
    null
  );
  const [demandaParaDetalhes, setDemandaParaDetalhes] = useState<DemandaPreviaProcesso | null>(
    null
  );

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
          setSuperintendenciaFiltro(u.setor);
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

  const demandas = useMemo(() => {
    const lista = dataStore.demandasPrevias;
    if (isGestorSG) return lista;
    const lotacao = (usuarioLogado?.setor || "SAS").toUpperCase();
    return lista.filter((d) => d.superintendenciaOrigem.toUpperCase() === lotacao);
  }, [isGestorSG, usuarioLogado]);

  // Contadores analíticos
  const totalDemandas = demandas.length;
  const aguardandoSG = demandas.filter((d) => d.status === "AGUARDANDO_ENQUADRAMENTO_SG").length;
  const emAnaliseSG = demandas.filter((d) => d.status === "EM_ANALISE_SG").length;
  const enquadradas = demandas.filter((d) => d.status === "ENQUADRADA_E_AUTORIZADA").length;
  const diligencias = demandas.filter((d) => d.status === "DILIGENCIA_SOLICITADA").length;

  // Filtragem
  const demandasFiltradas = demandas.filter((d) => {
    if (superintendenciaFiltro !== "TODAS" && d.superintendenciaOrigem !== superintendenciaFiltro) {
      return false;
    }
    if (statusFiltro !== "TODOS" && d.status !== statusFiltro) {
      return false;
    }
    if (busca.trim()) {
      const b = busca.toLowerCase();
      const matchItens = d.itens.some((it) => it.descricao.toLowerCase().includes(b));
      return (
        d.numeroDemanda.toLowerCase().includes(b) ||
        d.objeto.toLowerCase().includes(b) ||
        d.superintendenciaOrigem.toLowerCase().includes(b) ||
        d.coordenacaoOrigem.toLowerCase().includes(b) ||
        d.responsavelNome.toLowerCase().includes(b) ||
        matchItens
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* QUADRO EXPLICATIVO: REGRA DE GOVERNANÇA E INSTRUÇÃO PROCESSUAL */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50 via-sky-50 to-indigo-50 border-2 border-sky-300 shadow-xs relative overflow-hidden">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-850 text-white flex items-center gap-1.5 shadow-2xs">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
                REGRA DE GOVERNANÇA & INSTRUÇÃO PROCESSUAL
              </span>
              <span className="text-[11px] font-bold text-sky-950 bg-white/90 border border-sky-200 px-2.5 py-0.5 rounded-full">
                Fluxo Oficial SMS / SG
              </span>
            </div>

            <div className="text-[11px] text-slate-700 bg-white/90 border border-sky-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Para abrir nova solicitação: utilize o botão</span>
              <strong className="text-white bg-slate-900 px-2 py-0.5 rounded font-bold">
                + Nova Demanda
              </strong>
              <span className="text-sky-700 font-bold">no canto superior direito ↗</span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Os modelos das modalidades de processos são liberados após o Enquadramento da SG
          </h3>

          <p className="text-xs text-slate-700 leading-relaxed max-w-5xl">
            Nesta plataforma, a instrução processual sob a <strong>Lei Federal nº 14.133/2021</strong> obedece estritamente ao rito público de governança. Não é permitida a abertura avulsa de minutas ou modelos sem o devido apontamento técnico. Todo processo de compras e serviços da Saúde segue obrigatoriamente o seguinte <strong>fluxo regulamentar</strong>:
          </p>

          {/* Fluxo Visual dos 3 Passos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-white/95 rounded-xl border border-sky-200 shadow-2xs flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                1
              </div>
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900">Abertura da Demanda</div>
                <div className="text-[11px] text-slate-600 leading-snug">
                  O servidor demandante (Coordenação ou Superintendência: SAS, SUVIG, SGTES, SURCAA) cadastra uma <strong>Nova Demanda</strong> pelo botão no canto superior direito informando objeto, necessidade/justificativa, itens e quantitativos estimados.
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white/95 rounded-xl border border-amber-200 shadow-2xs flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                2
              </div>
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900">Análise & Enquadramento SG</div>
                <div className="text-[11px] text-slate-600 leading-snug">
                  A demanda é recebida na fila técnica da <strong>Superintendência de Gestão (SG)</strong>, que avalia a necessidade legal e aponta formalmente a <strong>modalidade</strong> a ser realizada (Pregão SRP, Dispensa, Inexigibilidade, etc.).
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white/95 rounded-xl border border-emerald-200 shadow-2xs flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                3
              </div>
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900">Acesso aos Modelos da Modalidade</div>
                <div className="text-[11px] text-slate-600 leading-snug">
                  Com a modalidade formalizada e autuada pela SG, o demandante recebe acesso direto a todos os modelos do <strong>fluxo processual</strong> que terá que elaborar (DFD, ETP, Matriz de Riscos, Termo de Referência, etc.).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Status de Tramitação e KPIs */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white shadow-md border border-sky-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Scale className="h-3.5 w-3.5" />
              Fila Central de Tramitação: SAS, SUVIG, SGTES, SURCAA ➔ SG
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Demandas Prévias & Pareceres de Enquadramento Licitatório
            </h3>
            <p className="text-xs text-sky-200/90 leading-relaxed">
              Painel de triagem e controle prévio das demandas abertas pelas áreas técnicas da Saúde antes da instauração oficial de processos licitatórios.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xl font-black text-amber-300">{aguardandoSG}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Pendente SG</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xl font-black text-sky-300">{emAnaliseSG}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Em Análise SG</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xl font-black text-emerald-350">{enquadradas}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Enquadradas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xl font-black text-white">{totalDemandas}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Total Geral</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca (Sem botão de Nova Demanda, mantido unicamente no canto superior direito) */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Busca Textual */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por número da demanda, objeto, item, coordenação ou servidor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {(busca || superintendenciaFiltro !== "TODAS" || statusFiltro !== "TODOS") && (
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setSuperintendenciaFiltro("TODAS");
                setStatusFiltro("TODOS");
              }}
              className="text-xs text-sky-700 hover:text-sky-900 underline font-semibold cursor-pointer shrink-0"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Filtros por Superintendência e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filtrar por Superintendência Solicitante:
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSuperintendenciaFiltro("TODAS")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  superintendenciaFiltro === "TODAS"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todas ({demandas.length})
              </button>
              {SUPERINTENDENCIAS_SMS.map((sup) => {
                const count = demandas.filter(
                  (d) => d.superintendenciaOrigem === sup.sigla
                ).length;
                return (
                  <button
                    key={sup.sigla}
                    type="button"
                    onClick={() => setSuperintendenciaFiltro(sup.sigla)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                      superintendenciaFiltro === sup.sigla
                        ? "bg-sky-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{sup.sigla}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filtrar por Status do Enquadramento SG:
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setStatusFiltro("TODOS")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  statusFiltro === "TODOS"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFiltro("AGUARDANDO_ENQUADRAMENTO_SG")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  statusFiltro === "AGUARDANDO_ENQUADRAMENTO_SG"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                Pendente SG ({aguardandoSG})
              </button>
              <button
                type="button"
                onClick={() => setStatusFiltro("EM_ANALISE_SG")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  statusFiltro === "EM_ANALISE_SG"
                    ? "bg-sky-600 text-white"
                    : "bg-sky-50 text-sky-800 hover:bg-sky-100"
                }`}
              >
                Em Análise ({emAnaliseSG})
              </button>
              <button
                type="button"
                onClick={() => setStatusFiltro("ENQUADRADA_E_AUTORIZADA")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  statusFiltro === "ENQUADRADA_E_AUTORIZADA"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Enquadradas ({enquadradas})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Demandas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky-700" />
            <h4 className="font-bold text-sm text-slate-900">
              Demandas das Coordenações e Superintendências
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              ({demandasFiltradas.length} encontradas)
            </span>
          </div>
        </div>

        {demandasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhuma demanda encontrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Tente alterar os filtros de busca ou cadastre uma nova demanda no canto superior direito.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nº Demanda</th>
                  <th className="py-3 px-4">Origem / Solicitante</th>
                  <th className="py-3 px-4">Objeto & Justificativa</th>
                  <th className="py-3 px-4">Itens</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Status SG</th>
                  <th className="py-3 px-4">Modalidade Fixada</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demandasFiltradas.map((dem) => {
                  const superInfo = SUPERINTENDENCIAS_SMS.find(
                    (s) => s.sigla === dem.superintendenciaOrigem
                  );
                  return (
                    <tr
                      key={dem.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Nº Demanda */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-950">
                        <div>{dem.numeroDemanda}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {formatDate(dem.dataSolicitacao)}
                        </div>
                      </td>

                      {/* Origem */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            superInfo?.corBadge || "bg-slate-100"
                          }`}
                        >
                          {dem.superintendenciaOrigem}
                        </span>
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-1">
                          {dem.coordenacaoOrigem}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {dem.responsavelNome}
                        </div>
                      </td>

                      {/* Objeto */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                          {dem.objeto}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {dem.justificativaNecessidade}
                        </div>
                      </td>

                      {/* Itens */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {dem.itens.length} {dem.itens.length === 1 ? "item" : "itens"}
                        </span>
                      </td>

                      {/* Valor Estimado */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {dem.valorTotalEstimado
                          ? formatCurrency(dem.valorTotalEstimado)
                          : "A Cotar"}
                      </td>

                      {/* Status SG */}
                      <td className="py-3.5 px-4">
                        {dem.status === "AGUARDANDO_ENQUADRAMENTO_SG" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="h-3 w-3" />
                            Aguardando SG
                          </span>
                        )}
                        {dem.status === "EM_ANALISE_SG" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            <Clock className="h-3 w-3" />
                            Em Análise SG
                          </span>
                        )}
                        {dem.status === "ENQUADRADA_E_AUTORIZADA" && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="h-3 w-3" />
                              Enquadrada
                            </span>
                            {dem.enquadramentoSG?.direcionamentoSG && (
                              <div className="mt-1">
                                {dem.enquadramentoSG.direcionamentoSG.visualizado ? (
                                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                    ✓ Visto pela SG
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 animate-pulse">
                                    ⏱️ Aguardando Visto SG
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {dem.status === "DILIGENCIA_SOLICITADA" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="h-3 w-3" />
                            Diligência
                          </span>
                        )}
                      </td>

                      {/* Modalidade Fixada pela SG */}
                      <td className="py-3.5 px-4">
                        {dem.enquadramentoSG?.modalidadeDefinidaNome ? (
                          <div>
                            <span className="font-bold text-slate-900 text-[11px] block">
                              {dem.enquadramentoSG.modalidadeDefinidaNome}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {dem.enquadramentoSG.artigoLeiBase}
                            </span>
                            {dem.enquadramentoSG.numeroProcessoGerado && (
                              <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">
                                PA: {dem.enquadramentoSG.numeroProcessoGerado}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Aguardando parecer da SG
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Se aguardando análise: Botão Enquadrar SG */}
                          {dem.status === "AGUARDANDO_ENQUADRAMENTO_SG" && (
                            <button
                              type="button"
                              onClick={() => setDemandaParaEnquadrar(dem)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                              title="Analisar e Fixar Modalidade Licitatória (Superintendência de Gestão)"
                            >
                              <Scale className="h-3.5 w-3.5" />
                              <span>Enquadrar (SG)</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDemandaParaDetalhes(dem)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors border border-slate-200 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver Itens & Processo</span>
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

      {/* Modais Integrados */}
      <EnquadramentoSGModal
        demanda={demandaParaEnquadrar}
        isOpen={!!demandaParaEnquadrar}
        onClose={() => setDemandaParaEnquadrar(null)}
        onSuccess={() => window.location.reload()}
      />

      <DetalhesDemandaModal
        demanda={demandaParaDetalhes}
        isOpen={!!demandaParaDetalhes}
        onClose={() => setDemandaParaDetalhes(null)}
        onAbrirEnquadramentoSG={(dem) => setDemandaParaEnquadrar(dem)}
      />
    </div>
  );
}
