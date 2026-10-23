"use client";

import { useState, useEffect, useMemo } from "react";
import { dataStore } from "@/lib/data-store";
import { DataTable, Column } from "@/components/shared/data-table";
import { ProcessoAdministrativo, ItemPCA } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { NovoProcessoModal } from "@/components/processos/novo-processo-modal";
import { DossieProcessoModal } from "@/components/processos/dossie-processo-modal";
import { CatalogoModelosTab, MODELOS_OFICIOS_MEMOS } from "@/components/processos/catalogo-modelos-tab";
import { TramitacaoDemandasTab } from "@/components/processos/tramitacao-demandas-tab";
import { NovoItemPcaModal } from "@/components/processos/novo-item-pca-modal";
import { ImportarPcaModal } from "@/components/processos/importar-pca-modal";
import { DetalhesItemPcaModal } from "@/components/processos/detalhes-item-pca-modal";
import {
  baixarPlanilhaModeloPCA,
  exportarPcaCompletoExcel,
} from "@/lib/pca-parser-service";
import {
  obterModelosPorModalidade,
  obterModalidadeInfo,
  MODELOS_LICITACAO_CATALOG,
} from "@/data/modelos-licitacao-catalog";
import {
  FileText,
  PlusCircle,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  FolderTree,
  Scale,
  Download,
  Building2,
  ShieldAlert,
  FileSpreadsheet,
  Upload,
  Plus,
  Eye,
  Trash2,
  Layers,
  Calculator,
} from "lucide-react";

export default function ProcessosPage() {
  const [activeTab, setActiveTab] = useState<"demandas" | "processos" | "modelos" | "pca">("demandas");
  const [isNovoProcessoOpen, setIsNovoProcessoOpen] = useState(false);
  const [selectedProcessoDossie, setSelectedProcessoDossie] =
    useState<ProcessoAdministrativo | null>(null);

  // Estados do PCA
  const [itensPCA, setItensPCA] = useState<ItemPCA[]>([]);
  const [isNovoItemPcaOpen, setIsNovoItemPcaOpen] = useState(false);
  const [isImportarPcaOpen, setIsImportarPcaOpen] = useState(false);
  const [selectedItemPcaDetalhes, setSelectedItemPcaDetalhes] = useState<ItemPCA | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState<{
    nome?: string;
    email?: string;
    cargo?: string;
    setor?: string;
    perfil?: string;
  } | null>(null);

  const carregarPCA = () => {
    setItensPCA(dataStore.obterItensPCA());
  };

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("supergestao_usuario_logado");
      if (salvo) {
        setUsuarioLogado(JSON.parse(salvo));
      }
    } catch {}

    carregarPCA();
    const handleAtualizado = () => carregarPCA();
    window.addEventListener("supergestao_pca_atualizado", handleAtualizado);
    return () => {
      window.removeEventListener("supergestao_pca_atualizado", handleAtualizado);
    };
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

  const processos = useMemo(() => {
    const lista = dataStore.processos;
    if (isGestorSG) return lista;
    const lotacao = (usuarioLogado?.setor || "SAS").toUpperCase();
    return lista.filter(
      (p) =>
        (p.superintendenciaOrigem && p.superintendenciaOrigem.toUpperCase() === lotacao) ||
        (p.setorAtual && p.setorAtual.toUpperCase().includes(lotacao))
    );
  }, [isGestorSG, usuarioLogado]);

  const demandasAguardandoSG = dataStore.demandasPrevias.filter(
    (d) => d.status === "AGUARDANDO_ENQUADRAMENTO_SG"
  ).length;

  // Cálculos consolidados do PCA
  const totalItensEstimadosPCA = useMemo(() => {
    return itensPCA.reduce(
      (acc, it) => acc + (it.itensEstimados && it.itensEstimados.length > 0 ? it.itensEstimados.length : 1),
      0
    );
  }, [itensPCA]);

  const valorGlobalPCA = useMemo(() => {
    return itensPCA.reduce((acc, it) => acc + (it.valorEstimado || 0), 0);
  }, [itensPCA]);

  const handleRemoverItemPca = (id: string, codigo: string) => {
    if (confirm(`Deseja realmente remover a contratação ${codigo} do PCA?`)) {
      dataStore.removerItemPCA(id);
      carregarPCA();
    }
  };

  const handleLimparPca = () => {
    if (
      confirm(
        "ATENÇÃO: Deseja realmente zerar todos os itens do PCA da saúde? Todas as contratações e itens planejados serão limpos."
      )
    ) {
      dataStore.limparPCA();
      carregarPCA();
    }
  };

  // Colunas da Tabela de Processos
  const processoColumns: Column<ProcessoAdministrativo>[] = [
    {
      header: "Nº Processo",
      accessorKey: "numeroProcesso",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-sky-950 font-mono text-xs">{row.numeroProcesso}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.numeroCapa}</div>
        </div>
      ),
    },
    {
      header: "Modalidade / Enquadramento",
      accessorKey: "modalidade",
      sortable: true,
      cell: (row) => {
        const mod = row.modalidade || "Registro de Preços - Aquisição";
        const info = obterModalidadeInfo(mod);
        return (
          <div className="max-w-[200px]">
            <span className="text-[11px] font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md block truncate">
              {info?.alias || mod}
            </span>
            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
              {info?.artigoBase || "Lei Federal nº 14.133/2021"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Objeto da Contratação",
      accessorKey: "objeto",
      cell: (row) => (
        <div className="max-w-md">
          <p className="line-clamp-2 text-slate-800 font-medium text-xs">{row.objeto}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {row.itemPcaId && (
              <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-semibold inline-block">
                PCA
              </span>
            )}
            {row.valorEstimado ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {formatCurrency(row.valorEstimado)}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      header: "Setor Responsável",
      accessorKey: "setorAtual",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block max-w-[170px] truncate">
          {row.setorAtual}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          FASE_PREPARATORIA: {
            label: "Fase Preparatória",
            color: "bg-blue-50 text-blue-800 border-blue-200",
          },
          JURIDICO: {
            label: "Parecer Jurídico",
            color: "bg-amber-50 text-amber-800 border-amber-200",
          },
          LICITACAO: {
            label: "Em Licitação",
            color: "bg-purple-50 text-purple-800 border-purple-200",
          },
          CONTRATADO: {
            label: "Contratado",
            color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          },
          ENCERRADO: {
            label: "Encerrado",
            color: "bg-slate-100 text-slate-600 border-slate-200",
          },
        };
        const s = statusMap[row.status] || {
          label: row.status,
          color: "bg-slate-100 text-slate-700",
        };
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${s.color}`}>
            {s.label}
          </span>
        );
      },
    },
    {
      header: "Processo & Minutas",
      cell: (row) => {
        const modelosMod = obterModelosPorModalidade(row.modalidade);
        return (
          <button
            type="button"
            onClick={() => setSelectedProcessoDossie(row)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-700 hover:text-white border border-sky-200 transition-all font-bold text-[11px] shadow-2xs group"
            title="Abrir fluxo processual de documentos oficiais e baixar minutas (.docx)"
          >
            <FolderTree className="h-3.5 w-3.5 text-sky-600 group-hover:text-white transition-colors" />
            <span>Processo ({modelosMod.length})</span>
          </button>
        );
      },
    },
    {
      header: "Autuado em",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  // Colunas do PCA
  const pcaColumns: Column<ItemPCA>[] = [
    {
      header: "Nº DFD / Código PCA",
      accessorKey: "codigoItem",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-sky-950 font-mono text-xs flex items-center gap-1">
            <FileText className="h-3 w-3 text-sky-600 shrink-0" />
            <span>{row.numeroDFD || "DFD Formalizado"}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            {row.codigoItem}
          </span>
        </div>
      ),
    },
    {
      header: "Categoria & Setor",
      accessorKey: "categoria",
      sortable: true,
      cell: (row) => (
        <div className="max-w-[200px]">
          <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded block truncate">
            {row.categoria}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Setor: <strong>{row.unidadeRequisitante || "SAS"}</strong> &bull;{" "}
            Prioridade:{" "}
            <span
              className={`font-bold ${
                row.grauPrioridade === "ALTA"
                  ? "text-rose-600"
                  : row.grauPrioridade === "MEDIA"
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {row.grauPrioridade || "ALTA"}
            </span>
          </span>
        </div>
      ),
    },
    {
      header: "Objeto da Contratação",
      accessorKey: "descricao",
      cell: (row) => {
        const qtdItens = row.itensEstimados && row.itensEstimados.length > 0 ? row.itensEstimados.length : 1;
        return (
          <div className="max-w-md">
            <p className="line-clamp-2 text-slate-800 font-medium text-xs leading-snug">
              {row.descricao}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                <Layers className="h-3 w-3 text-indigo-600" />
                {qtdItens} item(ns) estimado(s)
              </span>
              {row.dataPrevisaoContratacao && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  Previsão: {row.dataPrevisaoContratacao}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Valor Estimado",
      accessorKey: "valorEstimado",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs block w-fit">
            {formatCurrency(row.valorEstimado)}
          </span>
          {row.quantidadeTotal ? (
            <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
              Qtd: {row.quantidadeTotal.toLocaleString("pt-BR")} un.
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Status no Ciclo",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const styles: Record<string, string> = {
          PLANEJADO: "bg-slate-100 text-slate-700 border-slate-300",
          EM_LICITACAO: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
          CONTRATADO: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
          CANCELADO: "bg-rose-100 text-rose-800 border-rose-300",
        };
        return (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
              styles[row.status] || ""
            }`}
          >
            {row.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      header: "Ações",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedItemPcaDetalhes(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-600 hover:text-white border border-sky-200 transition-all font-bold text-[11px] shadow-2xs group"
            title="Ver detalhes do DFD e itens estimados"
          >
            <Eye className="h-3.5 w-3.5 text-sky-600 group-hover:text-white transition-colors" />
            <span>Itens</span>
          </button>
          <button
            type="button"
            onClick={() => handleRemoverItemPca(row.id, row.codigoItem)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
            title="Remover esta contratação do PCA"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-sky-800 tracking-wide uppercase">
            Instrução Processual • SMS
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Processos & Licitações
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Instrução de autos, fluxo de atos administrativos, catálogo de minutas oficiais e integração ao PCA.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab("demandas")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "demandas"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4 text-sky-600" />
          <span>Tramitação de Demandas</span>
          {demandasAguardandoSG > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {demandasAguardandoSG} pendente(s)
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("processos")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "processos"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Processos Administrativos ({processos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("modelos")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "modelos"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FolderTree className="h-4 w-4 text-sky-600" />
          <span>Minutas & Modelos Oficiais ({MODELOS_OFICIOS_MEMOS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pca")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "pca"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>Plano de Contratações (PCA)</span>
          {itensPCA.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              {itensPCA.length}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "demandas" && <TramitacaoDemandasTab />}

      {activeTab === "processos" && (
        <DataTable
          data={processos}
          columns={processoColumns}
          title="Processos Administrativos e Licitatórios da Secretaria Municipal de Saúde"
          searchPlaceholder="Filtrar por número, modalidade, objeto ou setor..."
        />
      )}

      {activeTab === "modelos" && (
        <CatalogoModelosTab onIrParaDemandas={() => setActiveTab("demandas")} />
      )}

      {activeTab === "pca" && (
        <div className="space-y-4">
          {/* Banner Superior com Ciclo Reativo e Ações do PCA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-sky-900/90 text-white shadow-md border border-purple-800/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 backdrop-blur-xs">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    Governança & Planejamento • Art. 12, VII da Lei 14.133/2021
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight mt-1.5">
                  Plano de Contratações Anual da Saúde (PCA)
                </h3>
                <p className="text-xs text-purple-200/90 mt-0.5 max-w-2xl">
                  Centralize e acompanhe todas as contratações da SMS. A coordenadora pode inserir a planilha completa do PCA ou cadastrar individualmente cada DFD com seus itens e valores estimados.
                </p>
              </div>

              {/* Botões de Ação para a Coordenadora */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Opção 1: Importar Arquivo Automático */}
                <button
                  type="button"
                  onClick={() => setIsImportarPcaOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Inserir arquivo completo do PCA para leitura e extração automática de dados"
                >
                  <FileSpreadsheet className="h-4 w-4 text-purple-200" />
                  <span>Importar Planilha do PCA</span>
                </button>

                {/* Opção 2: Adicionar Manualmente Informação por Informação */}
                <button
                  type="button"
                  onClick={() => setIsNovoItemPcaOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Adicionar manualmente informação por informação (DFD, itens, quantidades e valores estimados)"
                >
                  <Plus className="h-4 w-4 text-sky-700" />
                  <span>Adicionar Manualmente</span>
                </button>
              </div>
            </div>

            {/* Linha Secundária: Atalhos de Modelo e Exportação */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={baixarPlanilhaModeloPCA}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-purple-300" />
                  <span>Baixar Modelo de Planilha (.xlsx)</span>
                </button>

                {itensPCA.length > 0 && (
                  <button
                    type="button"
                    onClick={() => exportarPcaCompletoExcel(itensPCA)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Exportar PCA Atual (.xlsx)</span>
                  </button>
                )}
              </div>

              {itensPCA.length > 0 && (
                <button
                  type="button"
                  onClick={handleLimparPca}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-[11px] border border-rose-400/30 transition-colors"
                >
                  <Trash2 className="h-3 w-3 text-rose-300" />
                  <span>Zerar Base do PCA</span>
                </button>
              )}
            </div>
          </div>

          {/* Cards de KPIs do PCA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Contratações / DFDs
                </span>
                <FileText className="h-4 w-4 text-sky-600" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
                {itensPCA.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Processos previstos no exercício
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Itens Estimados
                </span>
                <Layers className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
                {totalItensEstimadosPCA}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Itens individuais com preços
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Valor Estimado Total
                </span>
                <Calculator className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-lg font-extrabold text-emerald-700 font-mono mt-1 block truncate">
                {formatCurrency(valorGlobalPCA)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Previsão orçamentária do PCA
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Planejados / Em Aberto
                </span>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xl font-extrabold text-purple-700 font-mono mt-1 block">
                {itensPCA.filter((it) => it.status === "PLANEJADO").length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Aguardando autuação de processo
              </span>
            </div>
          </div>

          {/* Tabela do PCA */}
          <DataTable
            data={itensPCA}
            columns={pcaColumns}
            title="Itens do Plano de Contratações Anual (PCA)"
            searchPlaceholder="Filtrar por DFD, código, categoria ou descrição do objeto..."
          />
        </div>
      )}

      {/* Modal 1: Adicionar Manualmente (Informação por Informação) */}
      <NovoItemPcaModal
        isOpen={isNovoItemPcaOpen}
        onClose={() => setIsNovoItemPcaOpen(false)}
        onSuccess={carregarPCA}
        usuarioNome={usuarioLogado?.nome}
      />

      {/* Modal 2: Importar Arquivo Automático com Leitura Inteligente */}
      <ImportarPcaModal
        isOpen={isImportarPcaOpen}
        onClose={() => setIsImportarPcaOpen(false)}
        onSuccess={carregarPCA}
        usuarioNome={usuarioLogado?.nome}
      />

      {/* Modal 3: Visualizar Detalhes do DFD e Itens Estimados */}
      <DetalhesItemPcaModal
        item={selectedItemPcaDetalhes}
        isOpen={!!selectedItemPcaDetalhes}
        onClose={() => setSelectedItemPcaDetalhes(null)}
      />

      {/* Modal de Criação de Processo com Seleção de Modalidade e Modelos */}
      <NovoProcessoModal
        isOpen={isNovoProcessoOpen}
        onClose={() => setIsNovoProcessoOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Modal de Dossiê da Instrução Processual com Peças Oficiais .docx */}
      <DossieProcessoModal
        processo={selectedProcessoDossie}
        isOpen={!!selectedProcessoDossie}
        onClose={() => setSelectedProcessoDossie(null)}
      />
    </div>
  );
}
