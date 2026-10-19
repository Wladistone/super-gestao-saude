"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data-store";
import {
  DemandaPreviaProcesso,
  SuperintendenciaSigla,
  StatusDemandaPrevia,
} from "@/lib/types";
import {
  SERVIDORES_SMS,
  ServidorSMS,
  SUPERINTENDENCIAS_SMS,
} from "@/data/demandas-previas-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EnquadramentoSGModal } from "@/components/processos/enquadramento-sg-modal";
import { ResponderDiligenciaModal } from "@/components/tramitacao/responder-diligencia-modal";
import { DespacharTramitacaoModal } from "@/components/tramitacao/despachar-tramitacao-modal";
import { obterModelosPorModalidade } from "@/data/modelos-licitacao-catalog";
import { registrarVisualizacaoDirecionamentoSGAction } from "@/actions/super-gestao-actions";
import {
  gerarEmailDemanda,
  gerarLinkEmail,
} from "@/lib/notificacoes-utils";
import {
  Inbox,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Mail,
  Reply,
  ArrowRight,
  ShieldAlert,
  Building2,
  User,
  FileText,
  Calendar,
  Sparkles,
  Download,
  Printer,
  Copy,
  ChevronLeft,
  Check,
  FolderOpen,
  MessageSquare,
  BadgeAlert,
  ArrowLeft,
  CheckCircle2,
  CheckCheck,
  UserCheck,
  Eye,
  Bell,
  LayoutGrid,
  List,
  Scale,
  SlidersHorizontal,
  X,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

type PastaCaixa = "todas" | "entrada" | "enviadas_nao_retornadas" | "retornadas" | "diligencias";

export default function TramitacaoGovernancaPage() {
  // Estado do servidor ativo selecionado
  const [servidorAtivoId, setServidorAtivoId] = useState<string>("serv-carlos-sg");

  // Estado da navegação: inicia sem pasta ativa para deixar a área ao lado em branco (conforme solicitado pelo usuário)
  const [pastaAtiva, setPastaAtiva] = useState<PastaCaixa | null>(null);
  const [demandaSelecionadaId, setDemandaSelecionadaId] = useState<string | null>(null);

  const [superintendenciaFiltro, setSuperintendenciaFiltro] = useState<string>("TODAS");
  const [busca, setBusca] = useState<string>("");
  const [modoVisualizacao, setModoVisualizacao] = useState<"cards" | "tabela">("cards");
  const [mostrarTrocaServidor, setMostrarTrocaServidor] = useState(false);

  // Estados de Modais
  const [isEnquadramentoOpen, setIsEnquadramentoOpen] = useState(false);
  const [isResponderDiligenciaOpen, setIsResponderDiligenciaOpen] = useState(false);
  const [isDespachoOpen, setIsDespachoOpen] = useState(false);
  const [copiadoProtocolo, setCopiadoProtocolo] = useState(false);
  const [copiadoNotificacao, setCopiadoNotificacao] = useState(false);
  const [visualizadoMap, setVisualizadoMap] = useState<Record<string, { visualizado: boolean; dataHora: string }>>({});
  const [salvandoVisualizacao, setSalvandoVisualizacao] = useState(false);
  const [qtdPendentesCadastros, setQtdPendentesCadastros] = useState(0);
  const [usuarioLogado, setUsuarioLogado] = useState<{
    id?: string;
    nome?: string;
    email?: string;
    cargo?: string;
    setor?: string;
    perfil?: string;
    whatsapp?: string;
  } | null>(null);

  const carregarUsuario = () => {
    try {
      const salvo = localStorage.getItem("supergestao_usuario_logado");
      if (salvo) {
        const u = JSON.parse(salvo);
        setUsuarioLogado(u);
        if (u.setor && u.setor !== "SG" && u.email !== "will2026@gmail.com") {
          setSuperintendenciaFiltro(u.setor);
        }
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    carregarUsuario();
    const atualizar = () => {
      setQtdPendentesCadastros(dataStore.obterQtdCadastrosPendentes());
      carregarUsuario();
    };
    atualizar();

    window.addEventListener("supergestao_cadastro_atualizado", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("supergestao_cadastro_atualizado", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  // Determina se o usuário logado é da SG (Superintendência de Gestão)
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

  const handleVisualizarDirecionamento = async (demandaId: string, servidorNome?: string) => {
    setSalvandoVisualizacao(true);
    try {
      const res = await registrarVisualizacaoDirecionamentoSGAction({ demandaId, servidorNome });
      if (res.success) {
        setVisualizadoMap((prev) => ({
          ...prev,
          [demandaId]: { visualizado: true, dataHora: res.dataHoraVisualizacao || new Date().toISOString() },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSalvandoVisualizacao(false);
    }
  };

  // Servidor ativo
  const servidorAtivo: ServidorSMS | undefined = useMemo(() => {
    return SERVIDORES_SMS.find((s) => s.id === servidorAtivoId);
  }, [servidorAtivoId]);

  // ISOLAMENTO SETORIAL E REGRAS DE VISIBILIDADE:
  // "Quando a coordenadora Geral de Gestão autorizar a visualização para determinado servidor,
  // ele só terá acesso aos processos e demandas relativas a sua superintendência.
  // As demandas das demais superintendências ele não terá acesso.
  // Essa regra não serve para os servidores da SG."
  const todasDemandas = useMemo(() => {
    const listaCompleta = dataStore.demandasPrevias;
    if (isGestorSG) {
      return listaCompleta;
    }
    const lotacao = (usuarioLogado?.setor || "SAS").toUpperCase();
    return listaCompleta.filter((d) => d.superintendenciaOrigem.toUpperCase() === lotacao);
  }, [isGestorSG, usuarioLogado]);

  const handleCopiarTextoNotificacao = (demanda: DemandaPreviaProcesso) => {
    const dados = {
      servidorNome: demanda.responsavelNome,
      servidorEmail: demanda.responsavelEmail || usuarioLogado?.email || "hellywladi87@gmail.com",
      numeroDemanda: demanda.numeroDemanda,
      superintendencia: `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})`,
      objeto: demanda.objeto,
      coordenadoraNome: demanda.enquadramentoSG?.coordenadoraNome || "Dra. Willianne Soares",
      modalidadeNome: demanda.enquadramentoSG?.modalidadeDefinidaNome || "Enquadrada pela SG",
      artigoLei: demanda.enquadramentoSG?.artigoLeiBase || "Lei Federal nº 14.133/2021",
      numeroProcesso: demanda.enquadramentoSG?.numeroProcessoGerado,
      artefatos: demanda.enquadramentoSG?.notificacoesOriginador?.artefatosDisponibilizados || ["DFD", "ETP", "TR"],
    };
    const { assunto, corpo } = gerarEmailDemanda(dados);
    navigator.clipboard.writeText(`Assunto: ${assunto}\n\n${corpo}`);
    setCopiadoNotificacao(true);
    setTimeout(() => setCopiadoNotificacao(false), 2500);
  };

  // Função para verificar se a demanda foi enviada pelo servidor ou sua superintendência
  const isEnviadaPorServidor = (demanda: DemandaPreviaProcesso, servidor?: ServidorSMS) => {
    if (!servidor) return true;
    if (servidor.isSG) {
      return demanda.historicoTramitacao.some((h) =>
        h.origem.includes("Superintendência de Gestão")
      );
    }
    return (
      demanda.superintendenciaOrigem === servidor.superintendencia ||
      demanda.responsavelEmail?.toLowerCase() === servidor.email.toLowerCase() ||
      demanda.responsavelNome.toLowerCase().includes(servidor.nome.toLowerCase().split(" ")[0])
    );
  };

  // Função para verificar se o servidor participa da tramitação
  const servidorParticipa = (demanda: DemandaPreviaProcesso, servidor?: ServidorSMS) => {
    if (!servidor) return true;
    if (servidor.isSG) return true;
    return (
      demanda.superintendenciaOrigem === servidor.superintendencia ||
      demanda.historicoTramitacao.some(
        (h) =>
          h.origem.includes(servidor.superintendencia) ||
          h.destino.includes(servidor.superintendencia) ||
          h.usuario.toLowerCase().includes(servidor.nome.toLowerCase().split(" ")[0])
      )
    );
  };

  // Classificação dos itens conforme regras da Caixa Postal
  const categorizacaoDemandas = useMemo(() => {
    const queParticipa = todasDemandas.filter((d) =>
      servidorParticipa(d, servidorAtivo)
    );

    const enviadasNaoRetornadas = queParticipa.filter((d) => {
      if (servidorAtivo?.isSG) {
        return d.status === "DILIGENCIA_SOLICITADA";
      }
      return (
        isEnviadaPorServidor(d, servidorAtivo) &&
        (d.status === "AGUARDANDO_ENQUADRAMENTO_SG" || d.status === "EM_ANALISE_SG")
      );
    });

    const jaRetornaram = queParticipa.filter((d) => {
      if (servidorAtivo?.isSG) {
        return (
          d.status === "ENQUADRADA_E_AUTORIZADA" ||
          d.status === "INDEFERIDA_SG"
        );
      }
      return (
        isEnviadaPorServidor(d, servidorAtivo) &&
        (d.status === "ENQUADRADA_E_AUTORIZADA" ||
          d.status === "DILIGENCIA_SOLICITADA" ||
          d.status === "INDEFERIDA_SG")
      );
    });

    const caixaEntrada = queParticipa.filter((d) => {
      if (servidorAtivo?.isSG) {
        return (
          d.status === "AGUARDANDO_ENQUADRAMENTO_SG" ||
          d.status === "EM_ANALISE_SG"
        );
      }
      return d.status === "DILIGENCIA_SOLICITADA";
    });

    const diligencias = queParticipa.filter(
      (d) => d.status === "DILIGENCIA_SOLICITADA"
    );

    return {
      todas: queParticipa,
      enviadasNaoRetornadas,
      jaRetornaram,
      caixaEntrada,
      diligencias,
    };
  }, [todasDemandas, servidorAtivo]);

  // Lista filtrada da pasta ativa
  const demandasFiltradas = useMemo(() => {
    if (!pastaAtiva) return [];

    let lista: DemandaPreviaProcesso[] = [];

    switch (pastaAtiva) {
      case "entrada":
        lista = categorizacaoDemandas.caixaEntrada;
        break;
      case "enviadas_nao_retornadas":
        lista = categorizacaoDemandas.enviadasNaoRetornadas;
        break;
      case "retornadas":
        lista = categorizacaoDemandas.jaRetornaram;
        break;
      case "diligencias":
        lista = categorizacaoDemandas.diligencias;
        break;
      case "todas":
      default:
        lista = categorizacaoDemandas.todas;
        break;
    }

    if (superintendenciaFiltro !== "TODAS") {
      lista = lista.filter(
        (d) => d.superintendenciaOrigem === superintendenciaFiltro
      );
    }

    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (d) =>
          d.numeroDemanda.toLowerCase().includes(q) ||
          d.objeto.toLowerCase().includes(q) ||
          d.responsavelNome.toLowerCase().includes(q) ||
          d.coordenacaoOrigem.toLowerCase().includes(q) ||
          d.itens.some((i) => i.descricao.toLowerCase().includes(q)) ||
          (d.enquadramentoSG?.modalidadeDefinidaNome &&
            d.enquadramentoSG.modalidadeDefinidaNome.toLowerCase().includes(q)) ||
          (d.enquadramentoSG?.numeroProcessoGerado &&
            d.enquadramentoSG.numeroProcessoGerado.toLowerCase().includes(q))
      );
    }

    return lista;
  }, [pastaAtiva, categorizacaoDemandas, superintendenciaFiltro, busca]);

  // Demanda selecionada para exibição individual
  const demandaAtiva: DemandaPreviaProcesso | null = useMemo(() => {
    if (!demandaSelecionadaId) return null;
    return todasDemandas.find((d) => d.id === demandaSelecionadaId) || null;
  }, [demandaSelecionadaId, todasDemandas]);

  // Modelos de documentos oficiais da modalidade enquadrada pela SG
  const modelosSugeridos = useMemo(() => {
    if (!demandaAtiva?.enquadramentoSG?.modalidadeDefinidaNome) return [];
    return obterModelosPorModalidade(
      demandaAtiva.enquadramentoSG.modalidadeDefinidaNome
    );
  }, [demandaAtiva]);

  const handleCopiarProtocolo = (numero: string) => {
    navigator.clipboard.writeText(numero);
    setCopiadoProtocolo(true);
    setTimeout(() => setCopiadoProtocolo(false), 2000);
  };

  const getNomePasta = (pasta: PastaCaixa | null): string => {
    switch (pasta) {
      case "entrada":
        return "Caixa de Entrada (A Fazer)";
      case "enviadas_nao_retornadas":
        return "Enviadas (Não Retornaram)";
      case "retornadas":
        return "Retornadas (Despachadas)";
      case "diligencias":
        return "Em Diligência (Ajustes)";
      case "todas":
      default:
        return "Todas as Tramitações";
    }
  };

  const handleSelecionarPasta = (pasta: PastaCaixa) => {
    setPastaAtiva(pasta);
    setDemandaSelecionadaId(null); // Fecha qualquer demanda aberta para mostrar a lista limpa
  };

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & SWITCHER DE SERVIDOR                           */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 1. TOP HEADER EXECUTIVO & GOVERNANÇA                           */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Título & Badge Governança */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-200 shadow-2xs">
                <Inbox className="h-3.5 w-3.5 text-sky-600" />
                Caixa Postal Oficial de Tramitação
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Governança SG • Lei Federal nº 14.133/2021
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Tramitação & Governança da Saúde
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Instrução processual prévia entre as Superintendências (SAS, SUVIG, SGTES, SURCAA) e a Superintendência de Gestão (SG) com indicação privativa de modalidade licitatória.
            </p>
          </div>

          {/* Identificação do Servidor Autenticado (Limpa e Objetiva) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {isGestorSG ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/70 border border-sky-200/90 shadow-2xs flex items-center justify-between gap-3 min-w-[280px]">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                    {usuarioLogado?.nome ? usuarioLogado.nome.slice(0, 2).toUpperCase() : "WS"}
                  </div>
                  <div>
                    <div className="text-[10px] text-sky-800 font-bold uppercase tracking-wider flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-sky-600" />
                      Coordenadora Geral da SG
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs leading-tight">
                      {usuarioLogado?.nome || "Dra. Willianne Soares"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Visão 360º de Todas as Superintendências
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarTrocaServidor(!mostrarTrocaServidor)}
                  className="p-1.5 rounded-lg border border-sky-200 bg-white hover:bg-sky-100/70 text-sky-800 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  title="Simular visualização de outro servidor da SMS"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 shadow-2xs flex items-center gap-3 min-w-[280px]">
                <div className="h-10 w-10 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  {usuarioLogado?.nome ? usuarioLogado.nome.slice(0, 2).toUpperCase() : "WP"}
                </div>
                <div>
                  <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Servidor Setorial Conectado
                  </div>
                  <div className="font-extrabold text-slate-900 text-xs leading-tight">
                    {usuarioLogado?.nome || "Wladistone Pereira"}
                  </div>
                  <div className="text-[10px] text-blue-800 font-bold">
                    Lotação: {usuarioLogado?.setor || "SAS"} • Acesso Restrito ao Setor
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Auxiliar de Simulação de Servidor (Apenas se Coordenadora acionar) */}
        {isGestorSG && mostrarTrocaServidor && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              Simular perspectiva de servidor específico para conferência:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={servidorAtivoId}
                onChange={(e) => {
                  setServidorAtivoId(e.target.value);
                  setDemandaSelecionadaId(null);
                }}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg py-1 px-2.5 font-medium focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
              >
                <optgroup label="Superintendência de Gestão (SG)">
                  {SERVIDORES_SMS.filter((s) => s.isSG).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({s.cargo})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Superintendências Setoriais">
                  {SERVIDORES_SMS.filter((s) => !s.isSG).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — {s.superintendencia} ({s.coordenacao})
                    </option>
                  ))}
                </optgroup>
              </select>
              <button
                type="button"
                onClick={() => setMostrarTrocaServidor(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Banner de Isolamento Setorial para Servidores não-SG */}
        {!isGestorSG && (
          <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-blue-700 shrink-0" />
              <span>
                <strong>Isolamento Setorial Ativo (Regra SG):</strong> Você está visualizando exclusivamente os processos e demandas da <strong>{usuarioLogado?.setor || "SAS"}</strong>. Processos de outras superintendências são restritos à governança da SG.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-blue-200/80 text-blue-900 border border-blue-300 shrink-0">
              {usuarioLogado?.setor || "SAS"} Exclusivo
            </span>
          </div>
        )}

        {/* Alerta de Cadastros Pendentes da SG (Elegante e Compacto) */}
        {isGestorSG && qtdPendentesCadastros > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bell className="h-4 w-4 animate-bounce" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  Atenção Coordenadora Geral: Existem {qtdPendentesCadastros} novos cadastros de servidores aguardando avaliação no módulo CADASTRO.
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Defina os privilégios de visualização e edição por módulo para liberar seus acessos institucionais.
                </span>
              </div>
            </div>
            <Link
              href="/cadastro"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Avaliar e Autorizar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. CARDS DE SITUAÇÃO OPERACIONAL (KPIS INTERATIVOS DE 1 CLIQUE) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Todas */}
        <button
          type="button"
          onClick={() => {
            handleSelecionarPasta("todas");
            setSuperintendenciaFiltro("TODAS");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
            pastaAtiva === "todas" && superintendenciaFiltro === "TODAS"
              ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400"
              : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${pastaAtiva === "todas" ? "text-slate-300" : "text-slate-600"}`}>
              Total de Demandas
            </span>
            <FolderOpen className={`h-4 w-4 ${pastaAtiva === "todas" ? "text-sky-400" : "text-slate-400 group-hover:text-slate-700"}`} />
          </div>
          <div className="text-2xl font-black font-mono leading-none">
            {categorizacaoDemandas.todas.length}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${pastaAtiva === "todas" ? "text-slate-300" : "text-slate-500"}`}>
            Todas as tramitações ativas
          </div>
        </button>

        {/* KPI 2: Aguardando SG */}
        <button
          type="button"
          onClick={() => handleSelecionarPasta("entrada")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
            pastaAtiva === "entrada"
              ? "bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300"
              : "bg-white hover:bg-amber-50/50 border-amber-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${pastaAtiva === "entrada" ? "text-amber-100" : "text-amber-700"}`}>
              Aguardando SG
            </span>
            <Clock className={`h-4 w-4 ${pastaAtiva === "entrada" ? "text-white" : "text-amber-600 animate-pulse"}`} />
          </div>
          <div className="text-2xl font-black font-mono leading-none text-amber-950">
            {categorizacaoDemandas.caixaEntrada.length}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${pastaAtiva === "entrada" ? "text-amber-100" : "text-amber-800"}`}>
            Fila para enquadramento legal
          </div>
        </button>

        {/* KPI 3: Enquadradas / Artefatos */}
        <button
          type="button"
          onClick={() => handleSelecionarPasta("retornadas")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
            pastaAtiva === "retornadas"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300"
              : "bg-white hover:bg-emerald-50/50 border-emerald-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${pastaAtiva === "retornadas" ? "text-emerald-100" : "text-emerald-700"}`}>
              Enquadradas & Prontas
            </span>
            <CheckCircle className={`h-4 w-4 ${pastaAtiva === "retornadas" ? "text-white" : "text-emerald-600"}`} />
          </div>
          <div className="text-2xl font-black font-mono leading-none text-emerald-950">
            {categorizacaoDemandas.jaRetornaram.length}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${pastaAtiva === "retornadas" ? "text-emerald-100" : "text-emerald-800"}`}>
            Artefatos liberados p/ servidor
          </div>
        </button>

        {/* KPI 4: Diligências */}
        <button
          type="button"
          onClick={() => handleSelecionarPasta("diligencias")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
            pastaAtiva === "diligencias"
              ? "bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-300"
              : "bg-white hover:bg-rose-50/50 border-rose-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${pastaAtiva === "diligencias" ? "text-rose-100" : "text-rose-700"}`}>
              Em Diligência
            </span>
            <BadgeAlert className={`h-4 w-4 ${pastaAtiva === "diligencias" ? "text-white" : "text-rose-600"}`} />
          </div>
          <div className="text-2xl font-black font-mono leading-none text-rose-950">
            {categorizacaoDemandas.diligencias.length}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${pastaAtiva === "diligencias" ? "text-rose-100" : "text-rose-800"}`}>
            Requer saneamento setorial
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. WORKSPACE PRINCIPAL (COLUNA PASTAS + LISTA/TABELA DEMANDAS) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* ------------------------------------------------------------ */}
        {/* COLUNA 1: PASTAS DA CAIXA POSTAL & FILTROS DE SUPERINTENDÊNCIA*/}
        {/* ------------------------------------------------------------ */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-4 shadow-sm space-y-4">
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pastas de Trabalho
            </div>

            {/* 1. Todas as Tramitações */}
            <button
              onClick={() => handleSelecionarPasta("todas")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                pastaAtiva === "todas"
                  ? "bg-sky-50 text-sky-950 font-extrabold border-l-4 border-sky-600 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className={`h-4 w-4 ${pastaAtiva === "todas" ? "text-sky-600" : "text-slate-400"}`} />
                <span>Todas as Tramitações</span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${pastaAtiva === "todas" ? "bg-sky-200/80 text-sky-950" : "bg-slate-100 text-slate-600"}`}>
                {categorizacaoDemandas.todas.length}
              </span>
            </button>

            {/* 2. Caixa de Entrada / A Fazer */}
            <button
              onClick={() => handleSelecionarPasta("entrada")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                pastaAtiva === "entrada"
                  ? "bg-amber-50 text-amber-950 font-extrabold border-l-4 border-amber-600 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className={`h-4 w-4 ${pastaAtiva === "entrada" ? "text-amber-600" : "text-amber-500"}`} />
                <span>Caixa de Entrada (A Fazer)</span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${pastaAtiva === "entrada" ? "bg-amber-200/80 text-amber-950" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                {categorizacaoDemandas.caixaEntrada.length}
              </span>
            </button>

            {/* 3. Enviadas (Não retornaram) */}
            <button
              onClick={() => handleSelecionarPasta("enviadas_nao_retornadas")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                pastaAtiva === "enviadas_nao_retornadas"
                  ? "bg-sky-50 text-sky-950 font-extrabold border-l-4 border-sky-600 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className={`h-4 w-4 ${pastaAtiva === "enviadas_nao_retornadas" ? "text-sky-600" : "text-slate-400"}`} />
                <span>Enviadas (Não Retornaram)</span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${pastaAtiva === "enviadas_nao_retornadas" ? "bg-sky-200/80 text-sky-950" : "bg-slate-100 text-slate-600"}`}>
                {categorizacaoDemandas.enviadasNaoRetornadas.length}
              </span>
            </button>

            {/* 4. Já Retornadas */}
            <button
              onClick={() => handleSelecionarPasta("retornadas")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                pastaAtiva === "retornadas"
                  ? "bg-emerald-50 text-emerald-950 font-extrabold border-l-4 border-emerald-600 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className={`h-4 w-4 ${pastaAtiva === "retornadas" ? "text-emerald-600" : "text-emerald-500"}`} />
                <span>Já Retornadas (Despachadas)</span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${pastaAtiva === "retornadas" ? "bg-emerald-200/80 text-emerald-950" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>
                {categorizacaoDemandas.jaRetornaram.length}
              </span>
            </button>

            {/* 5. Em Diligência */}
            <button
              onClick={() => handleSelecionarPasta("diligencias")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                pastaAtiva === "diligencias"
                  ? "bg-rose-50 text-rose-950 font-extrabold border-l-4 border-rose-600 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className={`h-4 w-4 ${pastaAtiva === "diligencias" ? "text-rose-600" : "text-rose-500"}`} />
                <span>Em Diligência (Ajustes)</span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${pastaAtiva === "diligencias" ? "bg-rose-200/80 text-rose-950" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                {categorizacaoDemandas.diligencias.length}
              </span>
            </button>
          </div>

          {/* Filtro por Superintendência Origem (Estilo Segmentado & Dot) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Superintendência de Origem
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setSuperintendenciaFiltro("TODAS")}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  superintendenciaFiltro === "TODAS"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                }`}
              >
                Todas ({todasDemandas.length})
              </button>

              {SUPERINTENDENCIAS_SMS.map((sup) => {
                const count = todasDemandas.filter((d) => d.superintendenciaOrigem === sup.sigla).length;
                const isSelected = superintendenciaFiltro === sup.sigla;

                const dotColor =
                  sup.sigla === "SAS"
                    ? "bg-blue-600"
                    : sup.sigla === "SUVIG"
                    ? "bg-amber-500"
                    : sup.sigla === "SGTES"
                    ? "bg-emerald-600"
                    : "bg-purple-600";

                return (
                  <button
                    key={sup.sigla}
                    type="button"
                    onClick={() => setSuperintendenciaFiltro(sup.sigla)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-sky-700 text-white shadow-2xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-white" : dotColor}`} />
                      <span>{sup.sigla}</span>
                    </span>
                    <span className={`text-[10px] font-mono ${isSelected ? "text-white/90" : "text-slate-600 font-bold"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Resumo de Governança Institucional */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white space-y-2 text-xs shadow-sm">
            <div className="font-extrabold flex items-center gap-1.5 text-sky-400">
              <Sparkles className="h-4 w-4" />
              Governança Central da SG
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Fixação privativa de modalidade legal conforme a <strong>Lei nº 14.133/2021</strong> e liberação das minutas oficiais (DFD, ETP, TR) para os servidores setoriais.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Lei 14.133 / MROSC</span>
              <span className="text-emerald-400 font-bold">100% Auditável</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* ÁREA DINÂMICA DA DIREITA (LISTA OU TABELA DE TRAMITAÇÕES)     */}
        {/* ------------------------------------------------------------ */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {/* ESTADO 1: INICIAL - SE NENHUMA PASTA ESTIVER ATIVA */}
          {pastaAtiva === null && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 shadow-sm flex flex-col items-center justify-center min-h-[560px] text-center space-y-4 animate-in fade-in">
              <div className="h-16 w-16 rounded-3xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-2xs">
                <Inbox className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">
                  Caixa Postal de Tramitação & Governança
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Selecione uma pasta ao lado ou clique no botão abaixo para carregar todas as tramitações ativas da Secretaria Municipal de Saúde.
                </p>
              </div>
              <button
                onClick={() => handleSelecionarPasta("todas")}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.01]"
              >
                <FolderOpen className="h-4 w-4 text-sky-400" />
                <span>Abrir Todas as Tramitações ({categorizacaoDemandas.todas.length})</span>
              </button>
            </div>
          )}

          {/* ESTADO 2: LISTA OU TABELA DE TRAMITAÇÕES */}
          {pastaAtiva !== null && !demandaSelecionadaId && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col min-h-[580px] overflow-hidden animate-in fade-in">
              {/* Toolbar Superior: Busca, Filtro e Alternância de Visualização */}
              <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-sky-700" />
                      <span>{getNomePasta(pastaAtiva)}</span>
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
                      {demandasFiltradas.length} demanda(s)
                    </span>
                    {superintendenciaFiltro !== "TODAS" && (
                      <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                        Setor: {superintendenciaFiltro}
                      </span>
                    )}
                  </div>

                  {/* Alternador de Modo de Visualização: Cards vs Tabela Executiva */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setModoVisualizacao("cards")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        modoVisualizacao === "cards"
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                      title="Exibir em Grade de Cards com visual moderno"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span>Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoVisualizacao("tabela")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        modoVisualizacao === "tabela"
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                      title="Exibir em Tabela Executiva para varredura rápida"
                    >
                      <List className="h-3.5 w-3.5" />
                      <span>Tabela Resumo</span>
                    </button>
                  </div>
                </div>

                {/* Input de Busca Rápida 360º */}
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por protocolo, objeto, item, servidor, ou modalidade..."
                    className="w-full pl-10 pr-9 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium placeholder:text-slate-400 shadow-2xs"
                  />
                  {busca && (
                    <button
                      onClick={() => setBusca("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Corpo da Listagem */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                {demandasFiltradas.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 space-y-3">
                    <Inbox className="h-12 w-12 mx-auto text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-bold text-slate-700">
                      Nenhuma tramitação encontrada nesta pasta.
                    </p>
                    <p className="text-xs text-slate-400">
                      Tente alterar a pasta ou limpar o filtro de superintendência.
                    </p>
                  </div>
                ) : modoVisualizacao === "cards" ? (
                  /* ======================================================== */
                  /* MODO 1: GRADE DE CARDS MODERNA COM EXCELÊNCIA VISUAL    */
                  /* ======================================================== */
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {demandasFiltradas.map((demanda) => {
                      const ultimoDespacho =
                        demanda.historicoTramitacao[demanda.historicoTramitacao.length - 1];

                      // Cores e detalhes por Superintendência
                      const infoSetor = {
                        SAS: { topBar: "bg-blue-600", pill: "bg-blue-50 text-blue-800 border-blue-200" },
                        SUVIG: { topBar: "bg-amber-500", pill: "bg-amber-50 text-amber-800 border-amber-200" },
                        SGTES: { topBar: "bg-emerald-600", pill: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                        SURCAA: { topBar: "bg-purple-600", pill: "bg-purple-50 text-purple-800 border-purple-200" },
                        SG: { topBar: "bg-slate-800", pill: "bg-slate-100 text-slate-800 border-slate-300" },
                      }[demanda.superintendenciaOrigem] || { topBar: "bg-sky-600", pill: "bg-slate-100 text-slate-800 border-slate-200" };

                      // Badges de Status Semânticos e de Alta Visibilidade
                      let statusBadge = (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>Aguardando SG</span>
                        </span>
                      );

                      if (demanda.status === "ENQUADRADA_E_AUTORIZADA") {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Enquadrada & Pronta</span>
                          </span>
                        );
                      } else if (demanda.status === "DILIGENCIA_SOLICITADA") {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-900 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                            <BadgeAlert className="h-3.5 w-3.5 text-rose-600" />
                            <span>Diligência Solicitada</span>
                          </span>
                        );
                      } else if (demanda.status === "EM_ANALISE_SG") {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-900 border border-sky-200 flex items-center gap-1.5 shadow-2xs">
                            <Clock className="h-3.5 w-3.5 text-sky-600" />
                            <span>Em Análise Técnica SG</span>
                          </span>
                        );
                      }

                      return (
                        <div
                          key={demanda.id}
                          onClick={() => setDemandaSelecionadaId(demanda.id)}
                          className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer overflow-hidden text-left"
                        >
                          {/* Faixa Colorida de Identificação Visual do Setor */}
                          <div className={`h-1.5 w-full ${infoSetor.topBar}`} />

                          <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-2.5">
                              {/* Linha 1: Origem -> Destino & Data de Tramitação */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold border ${infoSetor.pill}`}>
                                    {demanda.superintendenciaOrigem}
                                  </span>
                                  <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="text-[11px] font-bold text-slate-700">
                                    SG (Gestão)
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1 font-mono">
                                  <Calendar className="h-3 w-3 text-slate-600" />
                                  {formatDate(demanda.dataSolicitacao)}
                                </span>
                              </div>

                              {/* Linha 2: Protocolo & Status */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-black text-sky-950 bg-sky-50/80 px-2.5 py-0.5 rounded-lg border border-sky-200">
                                  {demanda.numeroDemanda}
                                </span>
                                {statusBadge}
                              </div>

                              {/* Linha 3: Objeto da Contratação */}
                              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                                {demanda.objeto}
                              </h3>

                              {/* Linha 4: Servidor Demandante */}
                              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                  {demanda.responsavelNome.slice(0, 1)}
                                </span>
                                <span className="truncate">
                                  <strong>{demanda.responsavelNome}</strong> &bull; {demanda.coordenacaoOrigem}
                                </span>
                              </div>

                              {/* Linha 5: Último Despacho em Box Estruturado */}
                              {ultimoDespacho && (
                                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1 text-xs">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                    <span className="font-bold text-slate-700 flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3 text-sky-600" />
                                      {ultimoDespacho.usuario}
                                    </span>
                                    <span>{formatDate(ultimoDespacho.data)}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-700 italic line-clamp-2 leading-relaxed">
                                    &ldquo;{ultimoDespacho.motivoOuDespacho}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Rodapé do Card: Quantidade de Itens, Valor Estimado e Ação */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {demanda.itens.length} {demanda.itens.length === 1 ? "item" : "itens"}
                              </span>

                              <div className="text-right">
                                <span className="text-[9px] text-slate-600 uppercase font-bold block">
                                  Valor Estimado
                                </span>
                                <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
                                  {formatCurrency(demanda.valorTotalEstimado)}
                                </span>
                              </div>

                              <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 group-hover:text-sky-900 group-hover:translate-x-0.5 transition-all">
                                <span>Ver Tramitação</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ======================================================== */
                  /* MODO 2: TABELA EXECUTIVA (VARREDURA RÁPIDA DE DADOS)     */
                  /* ======================================================== */
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 text-slate-700 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-3.5">Protocolo</th>
                            <th className="py-3 px-3.5">Origem & Demandante</th>
                            <th className="py-3 px-3.5">Objeto da Demanda</th>
                            <th className="py-3 px-3.5 text-right font-mono">Valor Estimado</th>
                            <th className="py-3 px-3.5 text-center">Status</th>
                            <th className="py-3 px-3.5">Último Despacho</th>
                            <th className="py-3 px-3.5 text-center">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {demandasFiltradas.map((demanda) => {
                            const ultimoDespacho =
                              demanda.historicoTramitacao[demanda.historicoTramitacao.length - 1];

                            return (
                              <tr
                                key={demanda.id}
                                onClick={() => setDemandaSelecionadaId(demanda.id)}
                                className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                              >
                                <td className="py-3 px-3.5 font-mono font-bold text-sky-950 whitespace-nowrap">
                                  {demanda.numeroDemanda}
                                </td>
                                <td className="py-3 px-3.5 whitespace-nowrap">
                                  <span className="font-bold text-slate-900 block">
                                    {demanda.superintendenciaOrigem}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                                    {demanda.responsavelNome}
                                  </span>
                                </td>
                                <td className="py-3 px-3.5 max-w-xs">
                                  <span className="font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                                    {demanda.objeto}
                                  </span>
                                </td>
                                <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                  {formatCurrency(demanda.valorTotalEstimado)}
                                </td>
                                <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                  {demanda.status === "ENQUADRADA_E_AUTORIZADA" ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                      Enquadrada
                                    </span>
                                  ) : demanda.status === "DILIGENCIA_SOLICITADA" ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-900 border border-rose-200">
                                      Diligência
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                      Aguardando SG
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3.5 max-w-xs text-[11px] text-slate-600 truncate">
                                  {ultimoDespacho ? (
                                    <span>
                                      <strong>{ultimoDespacho.usuario}:</strong> {ultimoDespacho.motivoOuDespacho}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 group-hover:text-sky-950">
                                    <span>Abrir</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ESTADO 3: DETALHES DA DEMANDA (ESTILO VISÃO GERAL, APENAS APÓS O SERVIDOR CLICAR NA DEMANDA) */}
          {pastaAtiva !== null && demandaAtiva && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
              {/* Barra Superior de Navegação: Voltar para Lista */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDemandaSelecionadaId(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-950 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Voltar para lista de {getNomePasta(pastaAtiva)}</span>
                </button>

                {/* Ações Rápidas de Topo */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 border border-sky-200">
                    {demandaAtiva.numeroDemanda}
                  </span>

                  <button
                    onClick={() => handleCopiarProtocolo(demandaAtiva.numeroDemanda)}
                    title="Copiar número do protocolo"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiadoProtocolo ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsDespachoOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Reply className="h-3.5 w-3.5 text-sky-700" />
                    <span>Despachar</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    title="Imprimir Folha de Tramitação"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Corpo da Demanda em Detalhes */}
              <div className="p-6 space-y-6 text-sm">
                {/* 1. Header do Objeto e Solicitante */}
                <div className="space-y-3 pb-5 border-b border-slate-200">
                  <h2 className="text-lg font-black text-slate-900 leading-snug">
                    {demandaAtiva.objeto}
                  </h2>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {demandaAtiva.responsavelNome.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {demandaAtiva.responsavelNome}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {demandaAtiva.coordenacaoOrigem} ({demandaAtiva.superintendenciaOrigem})
                        </div>
                        <div className="text-[10px] text-sky-700 font-mono">
                          {demandaAtiva.responsavelEmail || "protocolo.sms@saude.gov.br"}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-[11px] text-slate-500 space-y-0.5">
                      <div>
                        Tramitado em: <strong>{formatDate(demandaAtiva.dataSolicitacao)}</strong>
                      </div>
                      <div className="text-slate-400">
                        Destino: <strong>Superintendência de Gestão (SG)</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CARD EXCLUSIVO DE ENQUADRAMENTO DA SG (LEI 14.133/2021) */}
                {demandaAtiva.enquadramentoSG ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        Despacho Oficial da Superintendência de Gestão (SG)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                        Lei nº 14.133/2021
                      </span>
                    </div>

                    <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] text-slate-500 uppercase font-semibold">
                          Modalidade Fixada Privativamente:
                        </span>
                        <span className="font-extrabold text-xs text-emerald-900 font-mono">
                          {demandaAtiva.enquadramentoSG.modalidadeDefinidaNome}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong>Fundamentação Legal:</strong>{" "}
                        {demandaAtiva.enquadramentoSG.artigoLeiBase}
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed pt-1 border-t border-emerald-100">
                        <strong>Motivação do Enquadramento:</strong>{" "}
                        {demandaAtiva.enquadramentoSG.justificativaEnquadramento}
                      </div>
                      {demandaAtiva.enquadramentoSG.numeroProcessoGerado && (
                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-600">
                            Processo Administrativo Gerado:
                          </span>
                          <span className="font-bold text-sky-950 font-mono bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                            {demandaAtiva.enquadramentoSG.numeroProcessoGerado}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Modelos Oficiais da Minuta */}
                    {modelosSugeridos.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[11px] font-bold text-emerald-900 mb-1 flex items-center gap-1">
                          <FileText className="h-3 w-3 text-emerald-700" />
                          Minutas Oficiais da SG Recomendadas para esta Modalidade:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {modelosSugeridos.slice(0, 3).map((mod) => (
                            <a
                              key={mod.id}
                              href={mod.downloadUrl}
                              download
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-emerald-200 text-[10px] font-medium flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <Download className="h-3 w-3 text-emerald-600" />
                              <span className="truncate max-w-[200px]">{mod.titulo}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ROTEAMENTO DUPLO SIMULTÂNEO: DEVOLUÇÃO AO DEMANDANTE + DIRECIONAMENTO AO SERVIDOR DA SG */}
                    {(() => {
                      const dirSG = demandaAtiva.enquadramentoSG.direcionamentoSG;
                      const notif = demandaAtiva.enquadramentoSG.notificacoesOriginador;
                      const stLocal = visualizadoMap[demandaAtiva.id];
                      const isVis = stLocal ? stLocal.visualizado : Boolean(dirSG?.visualizado);
                      const dataVis = stLocal ? stLocal.dataHora : dirSG?.dataHoraVisualizacao;

                      return (
                        <div className="pt-3 border-t border-emerald-200 space-y-3">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            Roteamento Simultâneo & Auditoria de Comunicações
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Card 1: Devolução ao Demandante com E-mail Automático */}
                            <div className="p-3 bg-white/95 rounded-xl border border-emerald-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5 text-emerald-700" />
                                  1. Devolução com Artefatos Liberados
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                  Ao Originador
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-700">
                                <strong>Servidor:</strong> {demandaAtiva.responsavelNome}
                              </div>

                              <div className="space-y-1 pt-1 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                                    <Mail className="h-3 w-3 text-blue-600" />
                                    E-mail Automático:
                                  </span>
                                  <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                                    <CheckCheck className="h-3 w-3" />
                                    {notif?.destinatarioEmail || demandaAtiva.responsavelEmail || "e-mail cadastrado"}
                                  </span>
                                </div>
                              </div>

                              {notif?.artefatosDisponibilizados && (
                                <div className="pt-1.5 border-t border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Artefatos Técnicos Liberados para Elaboração:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {notif.artefatosDisponibilizados.map((art) => (
                                      <span
                                        key={art}
                                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[9px] font-semibold"
                                      >
                                        {art}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Botão Ativo de Disparo de E-mail */}
                              <div className="pt-2 border-t border-emerald-100 space-y-1.5">

                                <a
                                  href={gerarLinkEmail({
                                    servidorNome: demandaAtiva.responsavelNome,
                                    servidorEmail: notif?.destinatarioEmail || demandaAtiva.responsavelEmail || "hellywladi87@gmail.com",
                                    numeroDemanda: demandaAtiva.numeroDemanda,
                                    superintendencia: `${demandaAtiva.superintendenciaNome} (${demandaAtiva.superintendenciaOrigem})`,
                                    objeto: demandaAtiva.objeto,
                                    coordenadoraNome: demandaAtiva.enquadramentoSG.coordenadoraNome || "Dra. Willianne Soares",
                                    modalidadeNome: demandaAtiva.enquadramentoSG.modalidadeDefinidaNome,
                                    artigoLei: demandaAtiva.enquadramentoSG.artigoLeiBase,
                                    numeroProcesso: demandaAtiva.enquadramentoSG.numeroProcessoGerado,
                                    artefatos: notif?.artefatosDisponibilizados || ["DFD", "ETP", "TR"],
                                  })}
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                                  title="Abrir no cliente de e-mail institucional"
                                >
                                  <Mail className="h-3 w-3" />
                                  <span>Abrir e Testar no E-mail ({notif?.destinatarioEmail || demandaAtiva.responsavelEmail || "hellywladi87@gmail.com"})</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleCopiarTextoNotificacao(demandaAtiva)}
                                  className="w-full py-1 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[9px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Copy className="h-2.5 w-2.5" />
                                  <span>{copiadoNotificacao ? "Texto da Notificação Copiado!" : "Copiar Texto da Notificação"}</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 2: Direcionamento ao Servidor da SG com Auditoria de Visualização */}
                            <div className="p-3 bg-white/95 rounded-xl border border-indigo-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                                  <UserCheck className="h-3.5 w-3.5 text-indigo-700" />
                                  2. Direcionamento ao Servidor da SG
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                                  Condução do Processo
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-800">
                                <strong>Servidor Designado:</strong>
                                <div className="font-bold text-indigo-900 mt-0.5">
                                  {dirSG?.servidorSGNome || "Mariana Alcantara Rios (Diretora de Compras e Contratos / SG)"}
                                </div>
                              </div>

                              <div className="text-[10px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Data e Hora do Direcionamento:</span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {formatDate(dirSG?.dataHoraDirecionamento || demandaAtiva.enquadramentoSG.dataDespacho)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Direcionado pela Coordenadora:</span>
                                  <span className="font-semibold text-slate-700">
                                    {dirSG?.coordenadoraNome || demandaAtiva.enquadramentoSG.analistaSG}
                                  </span>
                                </div>
                              </div>

                              {/* Status de Visualização */}
                              <div className="pt-2 border-t border-indigo-100">
                                {isVis ? (
                                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <div>
                                      <span className="font-bold text-emerald-900 text-[10px] block">
                                        Visualizado pelo Servidor da SG
                                      </span>
                                      <span className="text-[10px] text-emerald-700 font-mono">
                                        Registrado em: {formatDate(dataVis || "")}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
                                      <div>
                                        <span className="font-bold text-amber-900 text-[10px] block">
                                          Aguardando Visualização pelo Servidor da SG
                                        </span>
                                        <span className="text-[10px] text-amber-700">
                                          O servidor da SG ainda não abriu este direcionamento.
                                        </span>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      disabled={salvandoVisualizacao}
                                      onClick={() => handleVisualizarDirecionamento(demandaAtiva.id, dirSG?.servidorSGNome)}
                                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                    >
                                      <Eye className="h-3 w-3" />
                                      <span>
                                        {salvandoVisualizacao
                                          ? "Registrando..."
                                          : "Confirmar Visualização como Servidor da SG"}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : demandaAtiva.status === "DILIGENCIA_SOLICITADA" ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                        <BadgeAlert className="h-4 w-4 text-amber-600" />
                        Diligência da Superintendência de Gestão (SG)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Ação Necessária
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium bg-white/80 p-3 rounded-lg border border-amber-200">
                      A SG analisou a demanda e devolveu solicitando esclarecimento técnico, mapa de distribuição ou comprovação sanitária antes de fixar a modalidade licitatória.
                    </p>
                    <button
                      onClick={() => setIsResponderDiligenciaOpen(true)}
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Responder Diligência & Reenviar à SG
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Aguardando Enquadramento Privativo da SG
                      </span>
                      <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Em Análise
                      </span>
                    </div>
                    <p className="text-xs text-blue-900/80 leading-relaxed">
                      A demanda com os itens e quantitativos está sob competência privativa da <strong>Superintendência de Gestão (SG)</strong> para fixação da modalidade (Lei nº 14.133/2021).
                    </p>
                    {servidorAtivo?.isSG && (
                      <button
                        onClick={() => setIsEnquadramentoOpen(true)}
                        className="mt-2 w-full py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Enquadrar Modalidade Licitatória Agora (Competência SG)
                      </button>
                    )}
                  </div>
                )}

                {/* 3. Justificativa da Necessidade Pública */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Justificativa da Necessidade Pública
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {demandaAtiva.justificativaNecessidade}
                  </p>
                </div>

                {/* 4. Público-Alvo e Destino */}
                {demandaAtiva.publicoAlvoOuDestino && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Público-Alvo e Destinação dos Bens/Serviços
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      {demandaAtiva.publicoAlvoOuDestino}
                    </p>
                  </div>
                )}

                {/* 5. Tabela Completa de Itens Solicitados */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Itens e Quantitativos Solicitados ({demandaAtiva.itens.length})
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 font-mono">
                      Total: {formatCurrency(demandaAtiva.valorTotalEstimado)}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">#</th>
                          <th className="py-2.5 px-3">Descrição do Item</th>
                          <th className="py-2.5 px-3 w-24">Unidade</th>
                          <th className="py-2.5 px-3 w-20 text-right">Qtd</th>
                          <th className="py-2.5 px-3 w-28 text-right">Valor Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {demandaAtiva.itens.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-bold">
                              {item.numeroItem}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">
                                {item.descricao}
                              </div>
                              {item.especificacaoTecnica && (
                                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                  {item.especificacaoTecnica}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">
                              {item.unidadeMedida}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                              {item.quantidade.toLocaleString("pt-BR")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(
                                item.valorTotalEstimado ||
                                  item.quantidade * (item.valorUnitarioEstimado || 0)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Linha do Tempo / Thread de E-mails e Despachos */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                    <span>Thread de Mensagens & Despachos Administrativos</span>
                  </div>

                  <div className="space-y-2.5 border-l-2 border-slate-200 pl-3 ml-2">
                    {demandaAtiva.historicoTramitacao.map((hist, idx) => (
                      <div
                        key={hist.id || idx}
                        className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1 relative"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">
                            {hist.usuario} ({hist.origem})
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {formatDate(hist.data)}
                          </span>
                        </div>
                        <div className="text-[11px] text-sky-800 font-medium">
                          Para: {hist.destino} • {hist.acao}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium pt-1">
                          {hist.motivoOuDespacho}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rodapé da Leitura: Botões de Ação */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  Status Atual: <strong className="text-slate-800">{demandaAtiva.status}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {/* Se SG e ainda não enquadrada */}
                  {servidorAtivo?.isSG && demandaAtiva.status !== "ENQUADRADA_E_AUTORIZADA" && (
                    <button
                      onClick={() => setIsEnquadramentoOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Enquadrar SG</span>
                    </button>
                  )}

                  {/* Se Diligência */}
                  {demandaAtiva.status === "DILIGENCIA_SOLICITADA" && (
                    <button
                      onClick={() => setIsResponderDiligenciaOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>Responder Diligência</span>
                    </button>
                  )}

                  {/* Se autorizada, link para ver no hub */}
                  {demandaAtiva.status === "ENQUADRADA_E_AUTORIZADA" && (
                    <Link
                      href="/processos"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>Ver no Hub Licitatório</span>
                    </Link>
                  )}

                  <button
                    onClick={() => setIsDespachoOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Adicionar Despacho</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODAIS CONECTADOS                                           */}
      {/* ============================================================== */}
      {/* Modal de Enquadramento da SG */}
      <EnquadramentoSGModal
        demanda={demandaAtiva}
        isOpen={isEnquadramentoOpen}
        onClose={() => setIsEnquadramentoOpen(false)}
      />

      {/* Modal de Responder Diligência */}
      <ResponderDiligenciaModal
        demanda={demandaAtiva}
        isOpen={isResponderDiligenciaOpen}
        onClose={() => setIsResponderDiligenciaOpen(false)}
        nomeServidor={servidorAtivo?.nome}
      />

      {/* Modal de Novo Despacho Administrativo */}
      <DespacharTramitacaoModal
        demanda={demandaAtiva}
        isOpen={isDespachoOpen}
        onClose={() => setIsDespachoOpen(false)}
        nomeServidor={servidorAtivo?.nome}
        setorServidor={
          servidorAtivo
            ? `${servidorAtivo.superintendencia} - ${servidorAtivo.coordenacao}`
            : "Superintendência de Gestão (SG)"
        }
      />
    </div>
  );
}
