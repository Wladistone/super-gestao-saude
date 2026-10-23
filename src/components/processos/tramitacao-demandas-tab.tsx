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
  ArrowLeft,
  ShieldAlert,
  FolderTree,
  Send,
  Eye,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { DemandaPreviaProcesso, SuperintendenciaSigla } from "@/lib/types";
import { dataStore } from "@/lib/data-store";
import { formatCurrency, formatDate, extrairPrimeiroNome } from "@/lib/utils";
import { SUPERINTENDENCIAS_SMS } from "@/data/demandas-previas-data";
import { EnquadramentoSGModal } from "./enquadramento-sg-modal";
import { DetalhesDemandaModal } from "./detalhes-demanda-modal";
import { ConcluirDocumentosOriginadorModal } from "./concluir-documentos-originador-modal";

export function TramitacaoDemandasTab() {
  const [passoAtivo, setPassoAtivo] = useState(1);
  const [busca, setBusca] = useState("");
  const [superintendenciaFiltro, setSuperintendenciaFiltro] = useState<string>("TODAS");
  const [statusFiltro, setStatusFiltro] = useState<string>("TODOS");

  const [demandaParaEnquadrar, setDemandaParaEnquadrar] = useState<DemandaPreviaProcesso | null>(
    null
  );
  const [demandaParaConcluirDocs, setDemandaParaConcluirDocs] = useState<DemandaPreviaProcesso | null>(
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

  const [versaoDados, setVersaoDados] = useState(0);

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

    const handleAtualizar = () => setVersaoDados((v) => v + 1);
    window.addEventListener("supergestao_demanda_atualizada", handleAtualizar);
    return () => window.removeEventListener("supergestao_demanda_atualizada", handleAtualizar);
  }, []);

  const isCoordenadoraGeral = useMemo(() => {
    if (!usuarioLogado) return true;
    const email = (usuarioLogado.email || "").toLowerCase().trim();
    const nome = (usuarioLogado.nome || "").toLowerCase().trim();
    return email === "will2026@gmail.com" || nome.includes("willianne");
  }, [usuarioLogado]);

  const isServidorSG = useMemo(() => {
    if (!usuarioLogado) return true;
    const email = (usuarioLogado.email || "").toLowerCase().trim();
    const setor = (usuarioLogado.setor || "").toUpperCase().trim();
    const cargo = (usuarioLogado.cargo || "").toLowerCase().trim();
    const perfil = (usuarioLogado.perfil || "").toUpperCase().trim();

    return (
      email === "will2026@gmail.com" ||
      setor === "SG" ||
      setor.includes("SUPERINTENDÊNCIA DE GESTÃO") ||
      cargo.includes("gestão") ||
      perfil === "SERVIDOR_SG"
    );
  }, [usuarioLogado]);

  const foiDirecionadaParaServidor = (demanda: DemandaPreviaProcesso, usuario: any) => {
    if (!demanda.enquadramentoSG?.direcionamentoSG) return false;
    if (!usuario) return false;
    const dir = demanda.enquadramentoSG.direcionamentoSG;
    const alvoId = String(usuario.id || "").toLowerCase().trim();
    const dirId = String(dir.servidorSGId || "").toLowerCase().trim();
    if (alvoId && dirId && (alvoId === dirId || alvoId.replace(/^usr-/, "") === dirId.replace(/^usr-/, ""))) {
      return true;
    }
    const alvoEmail = String(usuario.email || "").toLowerCase().trim();
    const dirEmail = String(dir.servidorSGEmail || "").toLowerCase().trim();
    if (alvoEmail && dirEmail && alvoEmail === dirEmail) return true;
    const alvoNome = String(usuario.nome || "").toLowerCase().trim();
    const dirNome = String(dir.servidorSGNome || "").toLowerCase().trim();
    if (alvoNome && dirNome) {
      if (alvoNome === dirNome) return true;
      const primeiroAlvo = alvoNome.split(" ")[0];
      const primeiroDir = dirNome.split(" ")[0];
      if (primeiroAlvo.length >= 3 && primeiroAlvo === primeiroDir) return true;
    }
    return false;
  };

  const demandas = useMemo(() => {
    const lista = dataStore.demandasPrevias;
    if (isCoordenadoraGeral) return lista;
    if (isServidorSG) {
      return lista.filter((d) => foiDirecionadaParaServidor(d, usuarioLogado));
    }
    const lotacao = (usuarioLogado?.setor || "SAS").toUpperCase();
    return lista.filter((d) => d.superintendenciaOrigem.toUpperCase() === lotacao);
  }, [isCoordenadoraGeral, isServidorSG, usuarioLogado, versaoDados]);

  // Contadores analíticos
  const totalDemandas = demandas.length;
  const aguardandoSG = demandas.filter((d) => d.status === "AGUARDANDO_ENQUADRAMENTO_SG").length;
  const emAnaliseSG = demandas.filter((d) => d.status === "EM_ANALISE_SG").length;
  const enquadradas = demandas.filter((d) => d.status === "ENQUADRADA_E_AUTORIZADA").length;
  const diligencias = demandas.filter((d) => d.status === "DILIGENCIA_SOLICITADA").length;
  const direcionadasSG = demandas.filter((d) => Boolean(d.enquadramentoSG?.direcionamentoSG)).length;

  // Filtragem
  const demandasFiltradas = demandas.filter((d) => {
    if (superintendenciaFiltro !== "TODAS" && d.superintendenciaOrigem !== superintendenciaFiltro) {
      return false;
    }
    if (statusFiltro === "DIRECIONADA_SG") {
      if (!d.enquadramentoSG?.direcionamentoSG) return false;
    } else if (statusFiltro !== "TODOS" && d.status !== statusFiltro) {
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
      {/* GUIA INTERATIVO DO FLUXO PROCESSUAL EM CARDS (PASSOS 1, 2 e 3) */}
      {(() => {
        const passosFluxo = [
          {
            numero: 1,
            titulo: "1. Abertura da Demanda",
            resumo: "Início pelo Setor Demandante",
            badge: "Passo 1 de 3",
            corBadge: "bg-sky-100 text-sky-800 border-sky-200",
            corNumero: "bg-sky-700 text-white",
            descricao:
              "O servidor da unidade ou setor técnico (SAS, SUVIG, SGTES, SURCAA) cadastra uma Nova Demanda informando objeto, necessidade/justificativa da Saúde, itens e quantitativos estimados.",
            dica: "Nesta etapa inicial você não precisa pesquisar preços nem indicar a modalidade de licitação. Apenas registre a necessidade pública.",
            icone: PlusCircle,
          },
          {
            numero: 2,
            titulo: "2. Análise & Enquadramento SG",
            resumo: "Triagem Técnica da Gestão",
            badge: "Passo 2 de 3",
            corBadge: "bg-amber-100 text-amber-800 border-amber-200",
            corNumero: "bg-amber-600 text-white",
            descricao:
              "A solicitação chega à fila técnica da Superintendência de Gestão (SG). A equipe avalia o rito conforme a Lei nº 14.133/2021 e define formalmente a modalidade correta (Pregão Eletrônico, Dispensa de Valor, Inexigibilidade, etc.).",
            dica: "A SG atua para garantir a conformidade jurídica do seu pedido, eliminando riscos de devolução ou retrabalho.",
            icone: Scale,
          },
          {
            numero: 3,
            titulo: "3. Acesso aos Modelos da Modalidade",
            resumo: "Liberação de Minutas e Peças Oficiais",
            badge: "Passo 3 de 3",
            corBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
            corNumero: "bg-emerald-600 text-white",
            descricao:
              "Com a modalidade homologada e autuada pela SG, o demandante recebe acesso imediato a todas as peças do fluxo processual que terá que elaborar (DFD, ETP, Matriz de Riscos, Termo de Referência, etc.).",
            dica: "Todas as minutas ficam liberadas para edição no sistema ou download em Word (.docx) no padrão oficial timbrado da SMS.",
            icone: FolderTree,
          },
        ];

        const passoAtual = passosFluxo.find((p) => p.numero === passoAtivo) || passosFluxo[0];
        const IconePasso = passoAtual.icone;

        return (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            {/* Cabeçalho do Guia */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-sky-600" />
                  Regra de Governança • Lei Federal nº 14.133/2021
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Fluxo Oficial de Instrução e Liberação de Modelos
                </h3>
                <p className="text-xs text-slate-500">
                  Navegue pelas 3 etapas para conhecer o rito regulamentar da Secretaria de Saúde:
                </p>
              </div>

              {/* Atalho para Nova Demanda */}
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shrink-0">
                <span>Para iniciar: utilize</span>
                <strong className="text-white bg-slate-900 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                  + Nova Demanda
                </strong>
              </div>
            </div>

            {/* Seletor de Etapas (Pills Clicáveis) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {passosFluxo.map((passo) => {
                const isAtivo = passoAtivo === passo.numero;
                const isConcluido = passoAtivo > passo.numero;

                return (
                  <button
                    key={passo.numero}
                    type="button"
                    onClick={() => setPassoAtivo(passo.numero)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isAtivo
                        ? "bg-sky-50/80 border-sky-300 ring-2 ring-sky-400/20 shadow-xs"
                        : isConcluido
                        ? "bg-slate-50/90 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                        : "bg-white border-slate-200/80 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isAtivo
                          ? passo.corNumero
                          : isConcluido
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isConcluido ? <CheckCircle2 className="h-4 w-4" /> : passo.numero}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-bold truncate ${isAtivo ? "text-slate-900" : "text-slate-700"}`}>
                        {passo.titulo}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {passo.resumo}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Card da Etapa Ativa */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50/30 border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-2xl ${passoAtual.corNumero} shadow-xs shrink-0`}>
                  <IconePasso className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${passoAtual.corBadge}`}>
                    {passoAtual.badge} • {passoAtual.resumo}
                  </span>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                    {passoAtual.titulo}
                  </h4>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
                {passoAtual.descricao}
              </p>

              {/* Dica Prática Acolhedora */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-amber-900">Orientação prática: </strong>
                  <span>{passoAtual.dica}</span>
                </div>
              </div>

              {/* Botões de Navegação Progressiva */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  {passoAtivo > 1 ? (
                    <button
                      type="button"
                      onClick={() => setPassoAtivo((p) => p - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Voltar para Passo {passoAtivo - 1}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Início do fluxo de instrução
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Etapa {passoAtivo} de 3
                  </span>

                  {passoAtivo < 3 ? (
                    <button
                      type="button"
                      onClick={() => setPassoAtivo((p) => p + 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-all shadow-xs hover:shadow-sm cursor-pointer"
                    >
                      <span>Avançar para Passo {passoAtivo + 1}: {passosFluxo[passoAtivo].titulo.replace(/^\d+\.\s*/, "")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPassoAtivo(1)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Rever desde o Passo 1</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}


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
              <button
                type="button"
                onClick={() => setStatusFiltro("DIRECIONADA_SG")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  statusFiltro === "DIRECIONADA_SG"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                }`}
              >
                Caixa SG (Direcionadas) ({direcionadasSG})
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
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              <Clock className="h-3 w-3" />
                              Em Análise SG
                            </span>
                            {dem.enquadramentoSG?.direcionamentoSG && (
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded block truncate max-w-[130px]" title={dem.enquadramentoSG.direcionamentoSG.servidorSGNome}>
                                  📬 SG: {extrairPrimeiroNome(dem.enquadramentoSG.direcionamentoSG.servidorSGNome)}
                                </span>
                                {dem.enquadramentoSG.direcionamentoSG.visualizado ? (
                                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                    ✓ Visto SG
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
                        {dem.status === "ENQUADRADA_E_AUTORIZADA" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="h-3 w-3" />
                              Enquadrada
                            </span>
                            {dem.enquadramentoSG?.direcionamentoSG && (
                              <span className="text-[9px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded block truncate max-w-[130px]" title={dem.enquadramentoSG.direcionamentoSG.servidorSGNome}>
                                📬 SG: {extrairPrimeiroNome(dem.enquadramentoSG.direcionamentoSG.servidorSGNome)}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded block">
                              ✓ Devolvida ao Originador
                            </span>
                          </div>
                        )}
                        {dem.status === "DOCUMENTOS_PRONTOS_SG" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Docs Prontos p/ SG
                            </span>
                            {dem.enquadramentoSG?.direcionamentoSG && (
                              <span className="text-[9px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded block truncate max-w-[130px]" title={dem.enquadramentoSG.direcionamentoSG.servidorSGNome}>
                                📬 SG: {extrairPrimeiroNome(dem.enquadramentoSG.direcionamentoSG.servidorSGNome)}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-teal-900 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded block">
                              ✓ Elaboração Concluída
                            </span>
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
                          {/* Se aguardando análise ou em análise: Botão Enquadrar / Direcionar SG */}
                          {(dem.status === "AGUARDANDO_ENQUADRAMENTO_SG" || dem.status === "EM_ANALISE_SG") && (
                            <button
                              type="button"
                              onClick={() => setDemandaParaEnquadrar(dem)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                              title="Analisar e Fixar Modalidade Licitatória ou Direcionar ao Servidor da SG"
                            >
                              <Scale className="h-3.5 w-3.5" />
                              <span>Enquadrar / Direcionar</span>
                            </button>
                          )}

                          {/* Se enquadrada e documentos ainda não informados à SG */}
                          {dem.status === "ENQUADRADA_E_AUTORIZADA" && !dem.enquadramentoSG?.elaboracaoOriginadorConcluida?.concluido && (
                            <button
                              type="button"
                              onClick={() => setDemandaParaConcluirDocs(dem)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                              title="Informar Conclusão dos Documentos ao Servidor da SG"
                            >
                              <Send className="h-3 w-3" />
                              <span>Concluir Docs</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDemandaParaDetalhes(dem)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors border border-slate-200 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver Itens &amp; Processo</span>
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

      <ConcluirDocumentosOriginadorModal
        demanda={demandaParaConcluirDocs}
        isOpen={!!demandaParaConcluirDocs}
        onClose={() => setDemandaParaConcluirDocs(null)}
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
