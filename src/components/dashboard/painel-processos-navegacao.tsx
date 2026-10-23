"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data-store";
import {
  ProcessoAdministrativo,
  Contrato,
  AtaRegistroPrecos,
  DocumentoElaborado,
  StatusProcesso,
} from "@/lib/types";
import { formatCurrency, formatDate, extrairPrimeiroNome } from "@/lib/utils";
import {
  Layers,
  Gavel,
  Zap,
  AlertTriangle,
  Award,
  GitMerge,
  ArrowRightCircle,
  Briefcase,
  UserCheck,
  Inbox,
  Megaphone,
  Handshake,
  Sparkles,
  Scroll,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  FolderTree,
  ExternalLink,
  FileEdit,
  ShieldCheck,
  FileText,
  Users,
  Download,
  FileCheck2,
  Scale,
  X,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { NovoProcessoModal } from "@/components/processos/novo-processo-modal";
import { DossieProcessoModal } from "@/components/processos/dossie-processo-modal";
import { ElaboradorDocumentoModal } from "@/components/documentos/elaborador-documento-modal";
import { NovaOrdemModal } from "@/components/contratos/nova-ordem-modal";
import { NovaSolicitacaoPagamentoModal } from "@/components/contratos/nova-solicitacao-pagamento-modal";
import {
  obterModelosPorModalidade,
  obterModalidadeInfo,
  ModeloDocumentoProcesso,
} from "@/data/modelos-licitacao-catalog";
import { gerarDocumentoInicial } from "@/lib/documento-templates-service";

// Configuração das 14 Modalidades Solicitadas
export interface CategoriaProcessoConfig {
  id: string;
  nome: string;
  sigla: string;
  artigoBase: string;
  descricao: string;
  iconName: string;
  tipo: "PROCESSO" | "CONTRATO" | "ATA";
  corBadge: string;
  corBorda: string;
  match: (proc: ProcessoAdministrativo) => boolean;
}

export const CATEGORIAS_CONFIG: CategoriaProcessoConfig[] = [
  {
    id: "registro-de-precos",
    nome: "REGISTRO DE PREÇOS",
    sigla: "SRP",
    artigoBase: "Art. 82 a 86 (Lei nº 14.133/2021)",
    descricao: "Sistema de Registro de Preços para futuras e eventuais contratações de bens e insumos continuados da Saúde.",
    iconName: "Layers",
    tipo: "PROCESSO",
    corBadge: "bg-sky-100 text-sky-850 border-sky-300",
    corBorda: "hover:border-sky-400 group-hover:text-sky-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("REGISTRO DE PREÇOS") && !m.includes("SEM REGISTRO") && !m.includes("ADESÃO");
    },
  },
  {
    id: "pregao-sem-srp",
    nome: "PREGÃO SEM REGISTRO DE PREÇOS",
    sigla: "Pregão Eletrônico",
    artigoBase: "Art. 34 (Lei nº 14.133/2021)",
    descricao: "Contratação direta ou certame tradicional com entrega imediata e integral do objeto.",
    iconName: "Gavel",
    tipo: "PROCESSO",
    corBadge: "bg-indigo-100 text-indigo-850 border-indigo-300",
    corBorda: "hover:border-indigo-400 group-hover:text-indigo-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("SEM REGISTRO") || m.includes("PREGÃO TRADICIONAL");
    },
  },
  {
    id: "dispensa",
    nome: "DISPENSA",
    sigla: "Art. 75",
    artigoBase: "Art. 75, I e II (Lei nº 14.133/2021)",
    descricao: "Contratação direta em razão do valor reduzido para compras e serviços comuns da Saúde.",
    iconName: "Zap",
    tipo: "PROCESSO",
    corBadge: "bg-emerald-100 text-emerald-850 border-emerald-300",
    corBorda: "hover:border-emerald-400 group-hover:text-emerald-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("DISPENSA") && !m.includes("EMERGENCIAL");
    },
  },
  {
    id: "emergencial",
    nome: "EMERGENCIAL",
    sigla: "Art. 75, VIII",
    artigoBase: "Art. 75, VIII (Lei nº 14.133/2021)",
    descricao: "Dispensa para atendimento a situações de urgência e calamidade pública na rede de saúde.",
    iconName: "AlertTriangle",
    tipo: "PROCESSO",
    corBadge: "bg-amber-100 text-amber-900 border-amber-300",
    corBorda: "hover:border-amber-400 group-hover:text-amber-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("EMERGENCIAL");
    },
  },
  {
    id: "inexigibilidade",
    nome: "INEXIGIBILIDADE",
    sigla: "Art. 74",
    artigoBase: "Art. 74 (Lei nº 14.133/2021)",
    descricao: "Inviabilidade de competição para serviços técnicos especializados, cooperativas médicas ou exclusividade.",
    iconName: "Award",
    tipo: "PROCESSO",
    corBadge: "bg-purple-100 text-purple-900 border-purple-300",
    corBorda: "hover:border-purple-400 group-hover:text-purple-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("INEXIGIBILIDADE");
    },
  },
  {
    id: "adesao-de-ata",
    nome: "ADESÃO DE ATA",
    sigla: "Carona",
    artigoBase: "Art. 86 (Lei nº 14.133/2021)",
    descricao: "Aproveitamento de Ata de Registro de Preços gerenciada por outros órgãos ou consórcios públicos.",
    iconName: "GitMerge",
    tipo: "PROCESSO",
    corBadge: "bg-teal-100 text-teal-900 border-teal-300",
    corBorda: "hover:border-teal-400 group-hover:text-teal-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("ADESÃO") || m.includes("CARONA");
    },
  },
  {
    id: "contratacao-direta",
    nome: "CONTRATAÇÃO DIRETA",
    sigla: "Art. 72",
    artigoBase: "Art. 72 (Lei nº 14.133/2021)",
    descricao: "Instrução sumária de contratações diretas, pareceres jurídicos e autorizações da pasta.",
    iconName: "ArrowRightCircle",
    tipo: "PROCESSO",
    corBadge: "bg-slate-200 text-slate-800 border-slate-300",
    corBorda: "hover:border-slate-400 group-hover:text-slate-900",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("DIRETA") && !m.includes("DISPENSA") && !m.includes("INEXIGIBILIDADE");
    },
  },
  {
    id: "diarias",
    nome: "DIÁRIAS",
    sigla: "Deslocamentos",
    artigoBase: "Decreto Municipal & Instrução Normativa SMS",
    descricao: "Processos de concessão e liquidação de diárias para viagens e deslocamentos a serviço da Saúde.",
    iconName: "Briefcase",
    tipo: "PROCESSO",
    corBadge: "bg-blue-100 text-blue-900 border-blue-300",
    corBorda: "hover:border-blue-400 group-hover:text-blue-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      const o = (p.objeto || "").toUpperCase();
      return m.includes("DIÁRIA") || m.includes("DIARIA") || o.includes("DIÁRIA") || o.includes("DIARIA");
    },
  },
  {
    id: "credenciamento",
    nome: "CREDENCIAMENTO",
    sigla: "Art. 79",
    artigoBase: "Art. 79 (Lei nº 14.133/2021)",
    descricao: "Habilitação contínua de clínicas médicas, laboratórios, exames e prestadores de serviços de saúde.",
    iconName: "UserCheck",
    tipo: "PROCESSO",
    corBadge: "bg-rose-100 text-rose-900 border-rose-300",
    corBorda: "hover:border-rose-400 group-hover:text-rose-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("CREDENCIAMENTO");
    },
  },
  {
    id: "chamamento-publico",
    nome: "CHAMAMENTO PÚBLICO",
    sigla: "MROSC 13.019",
    artigoBase: "Art. 24 (Lei Federal nº 13.019/2014)",
    descricao: "Edital público de chamamento para seleção isonômica de Organizações da Sociedade Civil (OSC).",
    iconName: "Megaphone",
    tipo: "PROCESSO",
    corBadge: "bg-orange-100 text-orange-900 border-orange-300",
    corBorda: "hover:border-orange-400 group-hover:text-orange-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("CHAMAMENTO");
    },
  },
  {
    id: "termo-de-colaboracao",
    nome: "TERMO DE COLABORAÇÃO",
    sigla: "MROSC 13.019",
    artigoBase: "Art. 16 (Lei Federal nº 13.019/2014)",
    descricao: "Parceria com OSC para execução de planos de trabalho propostos pela Secretaria Municipal de Saúde.",
    iconName: "Handshake",
    tipo: "PROCESSO",
    corBadge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    corBorda: "hover:border-emerald-400 group-hover:text-emerald-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("COLABORAÇÃO") || m.includes("COLABORACAO");
    },
  },
  {
    id: "termo-de-fomento",
    nome: "TERMO DE FOMENTO",
    sigla: "MROSC 13.019",
    artigoBase: "Art. 16 (Lei Federal nº 13.019/2014)",
    descricao: "Parceria de mútua cooperação para planos e iniciativas propostos por Organizações da Sociedade Civil.",
    iconName: "Sparkles",
    tipo: "PROCESSO",
    corBadge: "bg-violet-100 text-violet-900 border-violet-300",
    corBorda: "hover:border-violet-400 group-hover:text-violet-700",
    match: (p) => {
      const m = (p.modalidade || "").toUpperCase();
      return m.includes("FOMENTO");
    },
  },
  {
    id: "contratos",
    nome: "CONTRATOS",
    sigla: "Contratos Vigentes",
    artigoBase: "Art. 89 a 95 (Lei nº 14.133/2021)",
    descricao: "Instrumentos contratuais formalizados, vigências, termos aditivos e gestão de saldos com fiscais designados.",
    iconName: "Scroll",
    tipo: "CONTRATO",
    corBadge: "bg-sky-100 text-sky-900 border-sky-300",
    corBorda: "hover:border-sky-400 group-hover:text-sky-700",
    match: () => false,
  },
  {
    id: "atas",
    nome: "ATAS",
    sigla: "ARP Homologadas",
    artigoBase: "Art. 82 a 86 (Lei nº 14.133/2021)",
    descricao: "Atas de Registro de Preços ativas, saldos quantitativos e itens disponíveis para ordens de fornecimento.",
    iconName: "BookOpen",
    tipo: "ATA",
    corBadge: "bg-cyan-100 text-cyan-900 border-cyan-300",
    corBorda: "hover:border-cyan-400 group-hover:text-cyan-700",
    match: () => false,
  },
];

// Helper de Ícones dinâmicos
function CategoriaIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  switch (name) {
    case "Layers":
      return <Layers className={className} />;
    case "Gavel":
      return <Gavel className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "AlertTriangle":
      return <AlertTriangle className={className} />;
    case "Award":
      return <Award className={className} />;
    case "GitMerge":
      return <GitMerge className={className} />;
    case "ArrowRightCircle":
      return <ArrowRightCircle className={className} />;
    case "Briefcase":
      return <Briefcase className={className} />;
    case "UserCheck":
      return <UserCheck className={className} />;
    case "Megaphone":
      return <Megaphone className={className} />;
    case "Handshake":
      return <Handshake className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Scroll":
      return <Scroll className={className} />;
    case "BookOpen":
      return <BookOpen className={className} />;
    default:
      return <FileText className={className} />;
  }
}

// Modal Interativo para Informar e Atualizar o Status/Setor do Processo
interface ModalAtualizarStatusProps {
  processo: ProcessoAdministrativo;
  isOpen: boolean;
  onClose: () => void;
  onSalvo: () => void;
}

function ModalAtualizarStatus({ processo, isOpen, onClose, onSalvo }: ModalAtualizarStatusProps) {
  const [setor, setSetor] = useState(processo.setorAtual || "COTAÇÃO");
  const [dataEntrada, setDataEntrada] = useState(() => {
    if (processo.dataEntradaSetor) return processo.dataEntradaSetor.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  });
  const [etapa, setEtapa] = useState<StatusProcesso>(processo.status || "FASE_PREPARATORIA");

  const formatarDataPtBr = (isoDate: string) => {
    try {
      const partes = isoDate.split("-");
      if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
      return formatDate(isoDate);
    } catch {
      return isoDate;
    }
  };

  const gerarTextoPadrao = (s: string, d: string) => {
    return `Processo encontra-se no setor de ${s.toUpperCase()} desde ${formatarDataPtBr(d)}.`;
  };

  const [textoPersonalizado, setTextoPersonalizado] = useState(() => {
    if (processo.statusDescritivo && processo.statusDescritivo.trim().length > 0) {
      return processo.statusDescritivo;
    }
    const initialDate = processo.dataEntradaSetor ? processo.dataEntradaSetor.slice(0, 10) : new Date().toISOString().slice(0, 10);
    return gerarTextoPadrao(processo.setorAtual || "COTAÇÃO", initialDate);
  });

  const handleSetorChange = (novoSetor: string) => {
    setSetor(novoSetor);
    setTextoPersonalizado(gerarTextoPadrao(novoSetor, dataEntrada));
  };

  const handleDataChange = (novaData: string) => {
    setDataEntrada(novaData);
    setTextoPersonalizado(gerarTextoPadrao(setor, novaData));
  };

  const chipsSetores = [
    "COTAÇÃO",
    "PESQUISA DE PREÇOS",
    "ASSESSORIA JURÍDICA",
    "DIVISÃO DE CONTRATOS",
    "COMISSÃO DE LICITAÇÃO",
    "ORDENAÇÃO DE DESPESAS",
    "GABINETE DO SECRETÁRIO",
    "REGULAÇÃO & CONTROLE",
    "VIGILÂNCIA EM SAÚDE",
  ];

  const handleSalvar = () => {
    dataStore.atualizarStatusTramitacaoProcesso(processo.id, {
      setorAtual: setor,
      dataEntradaSetor: dataEntrada,
      statusDescritivo: textoPersonalizado,
      status: etapa,
    });
    onSalvo();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-700" />
              Tramitação & Localização
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Informar Status do Processo
            </h3>
            <p className="text-xs font-mono text-slate-600 mt-0.5">
              {processo.numeroProcesso} &bull; {processo.numeroCapa}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Setor onde se encontra o processo:
            </label>
            <input
              type="text"
              value={setor}
              onChange={(e) => handleSetorChange(e.target.value)}
              placeholder="Ex: COTAÇÃO, ANÁLISE JURÍDICA..."
              className="w-full text-xs font-semibold uppercase px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            {/* Sugestões rápidas de setores */}
            <div className="flex flex-wrap gap-1 mt-2">
              {chipsSetores.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSetorChange(s)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                    setor.toUpperCase() === s
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data de entrada no setor:
              </label>
              <input
                type="date"
                value={dataEntrada}
                onChange={(e) => handleDataChange(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Etapa do Processo:
              </label>
              <select
                value={etapa}
                onChange={(e) => setEtapa(e.target.value as StatusProcesso)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="FASE_PREPARATORIA">Fase Preparatória</option>
                <option value="JURIDICO">Parecer Jurídico</option>
                <option value="LICITACAO">Em Licitação</option>
                <option value="CONTRATADO">Contratado</option>
                <option value="ENCERRADO">Encerrado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Texto Oficial do Status (Exibido nas telas):
            </label>
            <textarea
              rows={2}
              value={textoPersonalizado}
              onChange={(e) => setTextoPersonalizado(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Exemplo: <em>STATUS: Processo encontra-se no setor de COTAÇÃO desde 05/10/2026.</em>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Salvar Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PainelProcessosNavegacao() {
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaProcessoConfig | null>(null);
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoAdministrativo | null>(null);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [selectedAta, setSelectedAta] = useState<AtaRegistroPrecos | null>(null);
  
  // Modais auxiliares
  const [isNovoProcessoOpen, setIsNovoProcessoOpen] = useState(false);
  const [processoParaDossie, setProcessoParaDossie] = useState<ProcessoAdministrativo | null>(null);
  const [documentoParaElaborar, setDocumentoParaElaborar] = useState<DocumentoElaborado | null>(null);
  const [processoParaAtualizarStatus, setProcessoParaAtualizarStatus] = useState<ProcessoAdministrativo | null>(null);
  const [isNovaOrdemOpen, setIsNovaOrdemOpen] = useState(false);
  const [isNovaSolicitacaoPagamentoOpen, setIsNovaSolicitacaoPagamentoOpen] = useState(false);
  const [versaoDados, setVersaoDados] = useState(0);

  // Busca interna
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [abaModalidades, setAbaModalidades] = useState<"comuns" | "contratos" | "especiais" | "todas">("comuns");
  const [buscaModalidade, setBuscaModalidade] = useState("");

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
        setUsuarioLogado(JSON.parse(salvo));
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

  // Dados do DataStore com segregação departamental para servidores não-SG
  const processos = useMemo(() => {
    const lista = dataStore.processos;
    if (isGestorSG) return lista;
    const lotacao = (usuarioLogado?.setor || "SAS").toUpperCase();
    return lista.filter(
      (p) =>
        (p.superintendenciaOrigem && p.superintendenciaOrigem.toUpperCase() === lotacao) ||
        (p.setorAtual && p.setorAtual.toUpperCase().includes(lotacao))
    );
  }, [isGestorSG, usuarioLogado, versaoDados]);

  const contratos = dataStore.contratos;
  const atas = dataStore.atas;

  // Helper para formatar o texto oficial de STATUS solicitado pelo usuário
  const obterTextoStatus = (proc: ProcessoAdministrativo): string => {
    if (proc.statusDescritivo && proc.statusDescritivo.trim().length > 0) {
      return proc.statusDescritivo;
    }
    const setor = (proc.setorAtual || "Gabinete da Saúde").toUpperCase();
    const dataRef = formatDate(proc.dataEntradaSetor || proc.updatedAt || proc.createdAt);
    return `Processo encontra-se no setor de ${setor} desde ${dataRef}.`;
  };

  // Contadores por categoria
  const contadores = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIAS_CONFIG) {
      if (cat.tipo === "CONTRATO") {
        counts[cat.id] = contratos.length;
      } else if (cat.tipo === "ATA") {
        counts[cat.id] = atas.length;
      } else {
        counts[cat.id] = processos.filter(cat.match).length;
      }
    }
    return counts;
  }, [processos, contratos, atas, versaoDados]);

  // Lista filtrada para a categoria selecionada (Nível 2)
  const itensCategoria = useMemo(() => {
    if (!selectedCategoria) return [];

    if (selectedCategoria.tipo === "CONTRATO") {
      let cts = contratos;
      if (busca.trim()) {
        const b = busca.toLowerCase();
        cts = cts.filter(
          (c) =>
            c.numeroContrato.toLowerCase().includes(b) ||
            c.objeto.toLowerCase().includes(b) ||
            (c.fiscalTitularNome && c.fiscalTitularNome.toLowerCase().includes(b))
        );
      }
      return cts;
    }

    if (selectedCategoria.tipo === "ATA") {
      let at = atas;
      if (busca.trim()) {
        const b = busca.toLowerCase();
        at = at.filter(
          (a) =>
            a.numeroAta.toLowerCase().includes(b) ||
            a.objeto.toLowerCase().includes(b)
        );
      }
      return at;
    }

    // Processos
    let procs = processos.filter(selectedCategoria.match);
    if (filtroStatus !== "TODOS") {
      procs = procs.filter((p) => p.status === filtroStatus);
    }
    if (busca.trim()) {
      const b = busca.toLowerCase();
      procs = procs.filter(
        (p) =>
          p.numeroProcesso.toLowerCase().includes(b) ||
          p.numeroCapa.toLowerCase().includes(b) ||
          p.objeto.toLowerCase().includes(b) ||
          p.setorAtual.toLowerCase().includes(b)
      );
    }
    return procs;
  }, [selectedCategoria, processos, contratos, atas, busca, filtroStatus, versaoDados]);

  // Helpers de Navegação
  const voltarParaCategorias = () => {
    setSelectedCategoria(null);
    setSelectedProcesso(null);
    setSelectedContrato(null);
    setSelectedAta(null);
    setBusca("");
    setFiltroStatus("TODOS");
  };

  const voltarParaLista = () => {
    setSelectedProcesso(null);
    setSelectedContrato(null);
    setSelectedAta(null);
  };

  const handleAbrirElaborador = (proc: ProcessoAdministrativo, modelo: ModeloDocumentoProcesso) => {
    const docInicial = gerarDocumentoInicial(modelo, proc);
    setDocumentoParaElaborar(docInicial);
  };

  // Status mapping
  const statusLabels: Record<string, { label: string; color: string }> = {
    FASE_PREPARATORIA: { label: "Fase Preparatória", color: "bg-blue-100 text-blue-900 border-blue-200" },
    JURIDICO: { label: "Parecer Jurídico", color: "bg-amber-100 text-amber-900 border-amber-200" },
    LICITACAO: { label: "Em Licitação", color: "bg-purple-100 text-purple-900 border-purple-200" },
    CONTRATADO: { label: "Contratado", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
    ENCERRADO: { label: "Encerrado", color: "bg-slate-100 text-slate-700 border-slate-300" },
  };

  // =========================================================================
  // NÍVEL 3: DETALHES DE UM PROCESSO ESPECÍFICO
  // =========================================================================
  if (selectedProcesso) {
    const modelosDossie = obterModelosPorModalidade(selectedProcesso.modalidade);

    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        {/* Barra Superior de Retorno e Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={voltarParaLista}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar para lista de {selectedCategoria?.nome}</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={voltarParaCategorias}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Início (Todas as Modalidades)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setProcessoParaDossie(selectedProcesso)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <FolderTree className="h-4 w-4" />
              <span>Abrir Processo Completo ({modelosDossie.length} peças)</span>
            </button>
          </div>
        </div>

        {/* Card Cabeçalho do Processo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-black text-sky-950 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                  {selectedProcesso.numeroProcesso}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                  {selectedProcesso.numeroCapa}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusLabels[selectedProcesso.status]?.color || "bg-slate-100 text-slate-800"}`}>
                  {statusLabels[selectedProcesso.status]?.label || selectedProcesso.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug max-w-3xl mt-2">
                {selectedProcesso.objeto}
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0 text-right min-w-[200px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Valor Estimado / Global
              </span>
              <span className="text-lg font-black font-mono text-emerald-700 block">
                {formatCurrency(selectedProcesso.valorEstimado || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Autuado em {formatDate(selectedProcesso.createdAt)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Modalidade / Enquadramento:</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{selectedProcesso.modalidade}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Setor Atual:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{selectedProcesso.setorAtual}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Superintendência Solicitante:</span>
              <span className="font-semibold text-sky-850 mt-0.5 block">{selectedProcesso.superintendenciaOrigem || "SMS - Gabinete / Gestão"}</span>
            </div>
          </div>

          {/* STATUS OFICIAL DA TRAMITAÇÃO */}
          <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-amber-950 font-medium">
              <Clock className="h-4 w-4 text-amber-700 shrink-0" />
              <span className="text-xs">
                <strong className="font-black text-amber-900 tracking-wide text-xs">STATUS:</strong>{" "}
                {obterTextoStatus(selectedProcesso)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setProcessoParaAtualizarStatus(selectedProcesso)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all shrink-0 shadow-2xs"
            >
              <FileEdit className="h-3.5 w-3.5 text-amber-700" />
              <span>Atualizar Status</span>
            </button>
          </div>
        </div>

        {/* Seção de Itens / Insumos do Processo */}
        {selectedProcesso.itensProcesso && selectedProcesso.itensProcesso.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-sky-700" /> Itens e Quantitativos da Demanda
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                  <tr>
                    <th className="py-2 px-3 text-center w-12">Item</th>
                    <th className="py-2 px-3">Descrição do Objeto / Insumo</th>
                    <th className="py-2 px-3 text-center w-16">Unid</th>
                    <th className="py-2 px-3 text-center w-20">Qtd</th>
                    <th className="py-2 px-3 text-right w-28">V. Unitário Est.</th>
                    <th className="py-2 px-3 text-right w-32">V. Total Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedProcesso.itensProcesso.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                        {String(it.numeroItem).padStart(2, "0")}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {it.descricao}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600">
                        {it.unidadeMedida}
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-800">
                        {it.quantidade.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        {it.valorUnitarioEstimado ? formatCurrency(it.valorUnitarioEstimado) : "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {it.valorTotalEstimado ? formatCurrency(it.valorTotalEstimado) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seção Dossiê de Documentos Oficiais (com Folha Timbrada e Download) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-sky-700" /> Peças Oficiais & Minutas deste Processo
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Elabore peças oficiais no padrão da Secretaria de Saúde com o timbre oficial de Arapiraca ou baixe a minuta Word (.docx).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modelosDossie.map((mod) => (
              <div
                key={mod.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all flex flex-col justify-between shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-sky-850 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded">
                      {mod.tipoPeca}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mod.artigoLei}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-950 transition-colors">
                    {mod.titulo}
                  </h4>
                </div>

                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleAbrirElaborador(selectedProcesso, mod)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-bold transition-all shadow-xs"
                    title="Abrir elaborador na folha timbrada oficial"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    <span>Elaborar / Imprimir</span>
                  </button>

                  <a
                    href={mod.downloadUrl}
                    download
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-semibold transition-all"
                    title="Baixar minuta em formato Word .docx"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>.docx</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Elaboração de Documento com Timbre Oficial */}
        {documentoParaElaborar && (
          <ElaboradorDocumentoModal
            documentoInicial={documentoParaElaborar}
            isOpen={Boolean(documentoParaElaborar)}
            onClose={() => setDocumentoParaElaborar(null)}
          />
        )}

        {/* Modal de Dossiê */}
        {processoParaDossie && (
          <DossieProcessoModal
            processo={processoParaDossie}
            isOpen={Boolean(processoParaDossie)}
            onClose={() => setProcessoParaDossie(null)}
          />
        )}

        {/* Modal para Informar/Atualizar Status */}
        {processoParaAtualizarStatus && (
          <ModalAtualizarStatus
            processo={processoParaAtualizarStatus}
            isOpen={Boolean(processoParaAtualizarStatus)}
            onClose={() => setProcessoParaAtualizarStatus(null)}
            onSalvo={() => {
              setVersaoDados((v) => v + 1);
              if (selectedProcesso && selectedProcesso.id === processoParaAtualizarStatus.id) {
                const atualizado = dataStore.processos.find((p) => p.id === selectedProcesso.id);
                if (atualizado) setSelectedProcesso({ ...atualizado });
              }
            }}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // NÍVEL 3: DETALHES DE UM CONTRATO ESPECÍFICO (Se clicou em CONTRATOS)
  // =========================================================================
  if (selectedContrato) {
    const percSaldo = Math.round((selectedContrato.saldoFinanceiroAtual / selectedContrato.valorGlobal) * 100);

    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={voltarParaLista}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para lista de CONTRATOS</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={voltarParaCategorias}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Início (Todas as Modalidades)
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-black text-sky-950 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                  {selectedContrato.numeroContrato}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-900 border-emerald-200">
                  {selectedContrato.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug max-w-3xl mt-2">
                {selectedContrato.objeto}
              </h2>
            </div>

            <div className="flex flex-col items-end gap-2.5 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right min-w-[220px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Saldo Financeiro Disponível
                </span>
                <span className="text-lg font-black font-mono text-emerald-700 block">
                  {formatCurrency(selectedContrato.saldoFinanceiroAtual)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  de {formatCurrency(selectedContrato.valorGlobal)} ({percSaldo}% disponível)
                </span>
              </div>

              {/* Botões de Ação Direta no Contrato */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNovaOrdemOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all hover:shadow-xs"
                  title="Emitir Ordem de Fornecimento ou de Serviço deste Contrato"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Emitir OF / OS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNovaSolicitacaoPagamentoOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-2xs transition-all hover:shadow-xs"
                  title="Solicitar Pagamento e Liquidação da Nota Fiscal com atesto do Fiscal"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Solicitação de Pagamento</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Vigência:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {formatDate(selectedContrato.vigenciaInicio)} até {formatDate(selectedContrato.vigenciaFim)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Fiscal Titular:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {selectedContrato.fiscalTitularNome || "Comissão de Fiscalização"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Fiscal Substituto:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {selectedContrato.fiscalSubstitutoNome || "Designado pela SMS"}
              </span>
            </div>
          </div>
        </div>

        {/* Itens do Contrato */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Scroll className="h-4 w-4 text-sky-700" /> Itens Registrados no Contrato
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Detalhamento dos saldos físicos e apropriação orçamentária por Programa de Trabalho, Elemento de Despesa e Fonte
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNovaOrdemOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
              >
                <ShoppingCart className="h-3 w-3" />
                <span>Emitir OF/OS</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNovaSolicitacaoPagamentoOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-colors"
              >
                <Receipt className="h-3 w-3" />
                <span>Solicitação de Pagamento</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Descrição do Item</th>
                  <th className="py-2.5 px-3 text-center">Unid</th>
                  <th className="py-2.5 px-3 text-center">Contratada</th>
                  <th className="py-2.5 px-3 text-center">Disponível</th>
                  <th className="py-2.5 px-3 text-right">V. Unitário</th>
                  <th className="py-2.5 px-3 text-right">Saldo Item</th>
                  {/* NOVA COLUNA SOLICITADA */}
                  <th className="py-2.5 px-3 min-w-[340px]">
                    Programa de Trabalho / Elemento de Despesa / Fonte (Saldo por Dotação)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedContrato.itens || []).map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/50 align-top">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{it.codigoItem}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">{it.descricao}</td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">{it.unidadeMedida}</td>
                    <td className="py-3 px-3 text-center font-mono">{it.quantidadeContratada.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">{it.quantidadeDisponivel.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatCurrency(it.valorUnitario)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(it.saldoItem)}</td>
                    {/* Célula com o desdobramento de Programas de Trabalho */}
                    <td className="py-3 px-3">
                      {it.dotacoes && it.dotacoes.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Layers className="h-3 w-3 text-sky-700" />
                            <span>
                              {it.dotacoes.length === 1
                                ? "1 Programa de Trabalho vinculado"
                                : `${it.dotacoes.length} Programas de Trabalho vinculados`}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {it.dotacoes.map((d, dIdx) => (
                              <div
                                key={dIdx}
                                className="bg-slate-50/90 hover:bg-sky-50/70 p-2.5 rounded-lg border border-slate-200 transition-colors shadow-2xs space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-sky-950 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded text-[10px]">
                                      PT {d.programaDeTrabalho}
                                    </span>
                                    {d.percentual !== undefined && (
                                      <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                                        {d.percentual}%
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono font-black text-emerald-800 text-xs">
                                      {formatCurrency(d.saldoDotacaoItem)}
                                    </span>
                                  </div>
                                </div>

                                {d.programaNome && (
                                  <p className="text-[11px] font-semibold text-slate-800 leading-snug">
                                    {d.programaNome}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                                  <span>
                                    <strong className="text-slate-700">ED:</strong> {d.elementoDespesa}
                                  </span>
                                  <span>&bull;</span>
                                  <span>
                                    <strong className="text-slate-700">Fonte:</strong> {d.fonteRecurso}
                                  </span>
                                  {d.quantidadeDisponivelDotacao !== undefined && (
                                    <>
                                      <span>&bull;</span>
                                      <span>
                                        <strong className="text-slate-700">Qtd Saldo:</strong>{" "}
                                        {d.quantidadeDisponivelDotacao.toLocaleString()} {it.unidadeMedida}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Dotação não especificada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Emitir Ordem de Fornecimento / Serviço (OF / OS) */}
        {isNovaOrdemOpen && (
          <NovaOrdemModal
            isOpen={isNovaOrdemOpen}
            contratoIdPreselecionado={selectedContrato.id}
            onClose={() => setIsNovaOrdemOpen(false)}
            onSuccess={() => {
              setVersaoDados((v) => v + 1);
              const atualizado = dataStore.contratos.find((c) => c.id === selectedContrato.id);
              if (atualizado) setSelectedContrato({ ...atualizado });
            }}
          />
        )}

        {/* Modal Solicitação de Pagamento */}
        {isNovaSolicitacaoPagamentoOpen && (
          <NovaSolicitacaoPagamentoModal
            isOpen={isNovaSolicitacaoPagamentoOpen}
            contratoIdPreselecionado={selectedContrato.id}
            onClose={() => setIsNovaSolicitacaoPagamentoOpen(false)}
            onSuccess={() => {
              setVersaoDados((v) => v + 1);
              const atualizado = dataStore.contratos.find((c) => c.id === selectedContrato.id);
              if (atualizado) setSelectedContrato({ ...atualizado });
            }}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // NÍVEL 3: DETALHES DE UMA ATA ESPECÍFICA (Se clicou em ATAS)
  // =========================================================================
  if (selectedAta) {
    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={voltarParaLista}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para lista de ATAS</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={voltarParaCategorias}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Início (Todas as Modalidades)
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-black text-sky-950 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                  {selectedAta.numeroAta}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-cyan-100 text-cyan-900 border-cyan-200">
                  {selectedAta.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug max-w-3xl mt-2">
                {selectedAta.objeto}
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0 text-right min-w-[220px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Saldo Total Disponível
              </span>
              <span className="text-lg font-black font-mono text-cyan-800 block">
                {formatCurrency(selectedAta.saldoTotalDisponivel)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Valor Registrado: {formatCurrency(selectedAta.valorTotalRegistrado)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Vigência Homologada:</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {formatDate(selectedAta.vigenciaInicio)} até {formatDate(selectedAta.vigenciaFim)}
            </span>
          </div>
        </div>

        {/* Itens da Ata */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-sky-700" /> Itens Registrados na Ata
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Descrição do Item</th>
                  <th className="py-2 px-3 text-center">Unid</th>
                  <th className="py-2 px-3 text-center">Qtd Registrada</th>
                  <th className="py-2 px-3 text-center">Qtd Disponível</th>
                  <th className="py-2 px-3 text-right">V. Unitário</th>
                  <th className="py-2 px-3 text-right">Saldo Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedAta.itens || []).map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono text-slate-600">{it.codigoItem}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{it.descricao}</td>
                    <td className="py-2 px-3 text-center text-slate-600">{it.unidadeMedida}</td>
                    <td className="py-2 px-3 text-center font-mono">{it.quantidadeContratada.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-cyan-800">{it.quantidadeDisponivel.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.valorUnitario)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(it.saldoItem)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // NÍVEL 2: TELA COM OS PROCESSOS DA MODALIDADE SELECIONADA
  // =========================================================================
  if (selectedCategoria) {
    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        {/* Barra Superior com Botão de Voltar ao Início */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={voltarParaCategorias}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar ao Início (Todas as Modalidades)</span>
            </button>
          </div>
        </div>

        {/* Banner da Modalidade Selecionada */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
              <CategoriaIcon name={selectedCategoria.iconName} className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${selectedCategoria.corBadge}`}>
                  {selectedCategoria.sigla}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {selectedCategoria.artigoBase}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {selectedCategoria.nome}
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {selectedCategoria.descricao}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-center shrink-0">
            <span className="text-2xl font-black text-slate-900 block font-mono">
              {itensCategoria.length}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {selectedCategoria.tipo === "CONTRATO" ? "Contratos" : selectedCategoria.tipo === "ATA" ? "Atas" : "Processos"}
            </span>
          </div>
        </div>

        {/* Filtros e Busca Rápida dentro da Modalidade */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Buscar em ${selectedCategoria.nome}...`}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>

          {selectedCategoria.tipo === "PROCESSO" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold shrink-0">Status:</span>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 py-2 px-2.5 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="FASE_PREPARATORIA">Fase Preparatória</option>
                <option value="JURIDICO">Parecer Jurídico</option>
                <option value="LICITACAO">Em Licitação</option>
                <option value="CONTRATADO">Contratado</option>
              </select>
            </div>
          )}
        </div>

        {/* Relação dos Processos / Contratos / Atas */}
        {selectedCategoria.tipo === "CONTRATO" ? (
          // Lista de Contratos
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {(itensCategoria as Contrato[]).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum contrato localizado com os filtros aplicados.
              </div>
            ) : (
              (itensCategoria as Contrato[]).map((ct) => (
                <div
                  key={ct.id}
                  onClick={() => setSelectedContrato(ct)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-950 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                        {ct.numeroContrato}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                        {ct.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-sky-900 transition-colors line-clamp-1">
                      {ct.objeto}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Fiscal: <strong className="text-slate-700">{ct.fiscalTitularNome || "Designado pela SMS"}</strong> &bull; Vigência até {formatDate(ct.vigenciaFim)}
                    </p>

                    {/* STATUS DO CONTRATO */}
                    <div className="mt-2 p-2 rounded-lg bg-sky-50/80 border border-sky-200/80 text-[11px] flex items-center gap-2 text-sky-950 font-medium">
                      <Clock className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span>
                        <strong className="font-black text-sky-900">STATUS:</strong> Contrato Administrativo VIGENTE sob fiscalização contínua desde {formatDate(ct.vigenciaInicio)}.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Saldo Disponível
                      </span>
                      <span className="font-mono font-bold text-xs text-emerald-700 block">
                        {formatCurrency(ct.saldoFinanceiroAtual)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContrato(ct);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-700 text-sky-850 hover:text-white border border-sky-200 transition-all text-xs font-bold shadow-2xs"
                    >
                      <span>Ver Detalhes</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : selectedCategoria.tipo === "ATA" ? (
          // Lista de Atas
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {(itensCategoria as AtaRegistroPrecos[]).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhuma ata de registro de preços localizada.
              </div>
            ) : (
              (itensCategoria as AtaRegistroPrecos[]).map((ata) => (
                <div
                  key={ata.id}
                  onClick={() => setSelectedAta(ata)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-950 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                        {ata.numeroAta}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-100 text-cyan-900 border-cyan-200">
                        {ata.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-cyan-950 transition-colors line-clamp-1">
                      {ata.objeto}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Vigência: {formatDate(ata.vigenciaInicio)} até {formatDate(ata.vigenciaFim)}
                    </p>

                    {/* STATUS DA ATA */}
                    <div className="mt-2 p-2 rounded-lg bg-cyan-50/80 border border-cyan-200/80 text-[11px] flex items-center gap-2 text-cyan-950 font-medium">
                      <Clock className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                      <span>
                        <strong className="font-black text-cyan-900">STATUS:</strong> Ata de Registro de Preços ATIVA e homologada para fornecimento desde {formatDate(ata.vigenciaInicio)}.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Saldo Registrado
                      </span>
                      <span className="font-mono font-bold text-xs text-cyan-800 block">
                        {formatCurrency(ata.saldoTotalDisponivel)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAta(ata);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-700 text-cyan-900 hover:text-white border border-cyan-200 transition-all text-xs font-bold shadow-2xs"
                    >
                      <span>Ver Detalhes</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Lista de Processos Administrativos da Modalidade
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {(itensCategoria as ProcessoAdministrativo[]).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum processo cadastrado para esta modalidade com os filtros informados.
              </div>
            ) : (
              (itensCategoria as ProcessoAdministrativo[]).map((proc) => {
                const s = statusLabels[proc.status] || {
                  label: proc.status,
                  color: "bg-slate-100 text-slate-700",
                };

                return (
                  <div
                    key={proc.id}
                    onClick={() => setSelectedProcesso(proc)}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-950 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          {proc.numeroProcesso}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                          {proc.numeroCapa}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>
                          {s.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Autuado em {formatDate(proc.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-sky-900 transition-colors line-clamp-1">
                        {proc.objeto}
                      </h3>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Setor: <strong className="text-slate-700">{proc.setorAtual}</strong></span>
                        {proc.itensProcesso && proc.itensProcesso.length > 0 && (
                          <span className="text-sky-750 font-semibold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 text-[10px]">
                            {proc.itensProcesso.length} {proc.itensProcesso.length === 1 ? "item cadastrado" : "itens cadastrados"}
                          </span>
                        )}
                      </div>

                      {/* STATUS OFICIAL DISCRETO E AMIGÁVEL */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{obterTextoStatus(proc)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProcessoParaAtualizarStatus(proc);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors"
                          title="Atualizar setor ou localização do processo"
                        >
                          <FileEdit className="h-3 w-3 text-slate-500" />
                          <span>Atualizar setor</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Valor Estimado
                        </span>
                        <span className="font-mono font-semibold text-xs text-slate-800 block">
                          {proc.valorEstimado ? formatCurrency(proc.valorEstimado) : "-"}
                        </span>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modal Novo Processo */}
        {isNovoProcessoOpen && (
          <NovoProcessoModal
            isOpen={isNovoProcessoOpen}
            onClose={() => setIsNovoProcessoOpen(false)}
          />
        )}

        {/* Modal para Informar/Atualizar Status */}
        {processoParaAtualizarStatus && (
          <ModalAtualizarStatus
            processo={processoParaAtualizarStatus}
            isOpen={Boolean(processoParaAtualizarStatus)}
            onClose={() => setProcessoParaAtualizarStatus(null)}
            onSalvo={() => {
              setVersaoDados((v) => v + 1);
            }}
          />
        )}
      </div>
    );
  }

  // Categorização amigável das modalidades para evitar sobrecarga de informação
  const categoriasFiltradas = useMemo(() => {
    let lista = CATEGORIAS_CONFIG;

    if (abaModalidades === "comuns") {
      lista = lista.filter((c) =>
        ["registro-de-precos", "pregao-sem-srp", "dispensa", "inexigibilidade", "adesao-de-ata", "contratacao-direta"].includes(c.id)
      );
    } else if (abaModalidades === "contratos") {
      lista = lista.filter((c) => ["contratos", "atas", "diarias"].includes(c.id));
    } else if (abaModalidades === "especiais") {
      lista = lista.filter((c) =>
        ["credenciamento", "termo-de-colaboracao", "termo-de-fomento", "chamamento-publico", "emergencial"].includes(c.id)
      );
    }

    if (buscaModalidade.trim()) {
      const q = buscaModalidade.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          c.sigla.toLowerCase().includes(q) ||
          c.descricao.toLowerCase().includes(q)
      );
    }

    return lista;
  }, [abaModalidades, buscaModalidade]);

  // =========================================================================
  // NÍVEL 1: VISÃO PRINCIPAL ACONCHEGANTE E ORGANIZADA
  // =========================================================================
  const primeiroNome = extrairPrimeiroNome(usuarioLogado?.nome);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Boas-vindas Aconchegante e Humanizada */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/40 rounded-3xl border border-sky-100/80 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-sky-800 tracking-wider uppercase">
              Secretaria Municipal de Saúde • Arapiraca
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Olá, {primeiroNome} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Bem-vindo ao SuperGestão. Aqui você acompanha demandas, processos e contratações com calma, agilidade e segurança técnica.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs">
              Lotação: <strong>{usuarioLogado?.setor || "Gabinete da Saúde"}</strong>
            </span>
          </div>
        </div>

        {/* 3 Portais de Acesso Rápido e Descomplicado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-200/60">
          <Link
            href="/tramitacao"
            className="p-4 rounded-2xl bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 transition-all shadow-2xs group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-sky-100/70 text-sky-700 group-hover:scale-105 transition-transform shrink-0">
              <Inbox className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                Tramitação & Demandas
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                Envio, despacho e pareceres entre setores
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </Link>

          <Link
            href="/processos"
            className="p-4 rounded-2xl bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 transition-all shadow-2xs group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-indigo-100/70 text-indigo-700 group-hover:scale-105 transition-transform shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">
                Processos & Licitações
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                Autos autuados, minutas Word e PCA
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </Link>

          <Link
            href="/contratos"
            className="p-4 rounded-2xl bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 transition-all shadow-2xs group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100/70 text-emerald-700 group-hover:scale-105 transition-transform shrink-0">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Contratos & Fornecimento
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                Vigências, atas SRP e ordens de compra
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </Link>
        </div>
      </div>

      {/* 2. Diretório de Modalidades com Navegação Limpa */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Consultar por Modalidade de Contratação
            </h2>
            <p className="text-xs text-slate-500">
              Selecione o instrumento jurídico para localizar processos e documentos
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar tipo..."
              value={buscaModalidade}
              onChange={(e) => setBuscaModalidade(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {/* Abas Suaves de Organização */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium border-b border-slate-200">
          <button
            type="button"
            onClick={() => setAbaModalidades("comuns")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              abaModalidades === "comuns"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Mais Utilizadas
          </button>

          <button
            type="button"
            onClick={() => setAbaModalidades("contratos")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              abaModalidades === "contratos"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Contratos & Atas
          </button>

          <button
            type="button"
            onClick={() => setAbaModalidades("especiais")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              abaModalidades === "especiais"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Parcerias & Especiais
          </button>

          <button
            type="button"
            onClick={() => setAbaModalidades("todas")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              abaModalidades === "todas"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Todas as Modalidades ({CATEGORIAS_CONFIG.length})
          </button>
        </div>

        {/* Grade de Modalidades com Design Calmo e Sem Botões Repetidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoriasFiltradas.map((cat) => {
            const totalItens = contadores[cat.id] || 0;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoria(cat)}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-sky-300 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-sky-100/70 text-slate-700 group-hover:text-sky-800 transition-colors shrink-0">
                      <CategoriaIcon name={cat.iconName} className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                      {cat.sigla}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-sky-900 transition-colors leading-snug">
                      {cat.nome}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {cat.descricao}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-600">
                    {totalItens} {cat.tipo === "CONTRATO" ? "contratos" : cat.tipo === "ATA" ? "atas" : totalItens === 1 ? "processo" : "processos"}
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Novo Processo */}
      {isNovoProcessoOpen && (
        <NovoProcessoModal
          isOpen={isNovoProcessoOpen}
          onClose={() => setIsNovoProcessoOpen(false)}
        />
      )}
    </div>
  );
}
