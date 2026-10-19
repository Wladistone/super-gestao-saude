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
} from "lucide-react";

export default function ProcessosPage() {
  const [activeTab, setActiveTab] = useState<"demandas" | "processos" | "modelos" | "pca">("demandas");
  const [isNovoProcessoOpen, setIsNovoProcessoOpen] = useState(false);
  const [selectedProcessoDossie, setSelectedProcessoDossie] =
    useState<ProcessoAdministrativo | null>(null);

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

  const itensPCA = dataStore.pca;
  const demandasAguardandoSG = dataStore.demandasPrevias.filter(
    (d) => d.status === "AGUARDANDO_ENQUADRAMENTO_SG"
  ).length;

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
                PCA 2025
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
      header: "Código PCA",
      accessorKey: "codigoItem",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900">{row.codigoItem}</span>
      ),
    },
    {
      header: "Categoria",
      accessorKey: "categoria",
      sortable: true,
      cell: (row) => <span className="text-slate-600 font-medium">{row.categoria}</span>,
    },
    {
      header: "Descrição do Item",
      accessorKey: "descricao",
      cell: (row) => <span className="text-slate-800 font-semibold">{row.descricao}</span>,
    },
    {
      header: "Valor Estimado",
      accessorKey: "valorEstimado",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(row.valorEstimado)}
        </span>
      ),
    },
    {
      header: "Status no Ciclo",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const styles: Record<string, string> = {
          PLANEJADO: "bg-slate-100 text-slate-700 border-slate-300",
          EM_LICITACAO:
            "bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse",
          CONTRATADO: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
          CANCELADO: "bg-rose-100 text-rose-800 border-rose-300",
        };
        return (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              styles[row.status] || ""
            }`}
          >
            {row.status.replace("_", " ")}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Scale className="h-3 w-3" />
              Lei Federal nº 14.133/2021 & MROSC
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
              Instrução por Demanda & Enquadramento SG
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Hub de Processos Licitatórios & PCA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instrução processual completa, fluxo de atos administrativos, catálogo de minutas oficiais (.docx) e integração reativa ao PCA.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-3 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("demandas")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "demandas"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4 text-sky-600" />
          <span>Tramitação de Demandas (SAS, SUVIG, SGTES, SURCAA ➔ SG)</span>
          {demandasAguardandoSG > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white animate-pulse">
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
          <span>Ofícios, Pareceres & Memorandos ({MODELOS_OFICIOS_MEMOS.length})</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-100 text-sky-800 uppercase">
            Comunicações SMS
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pca")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "pca"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span>PCA 2025 - Plano de Contratações Anual ({itensPCA.length})</span>
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
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm">
                Ciclo Reativo do PCA (Art. 12, VII, Lei 14.133/2021)
              </span>
              <p className="text-[11px] text-purple-800 mt-0.5">
                Cada item planejado no PCA é automaticamente transicionado para{" "}
                <strong>&quot;Em Licitação&quot;</strong> quando autuado o processo administrativo e para{" "}
                <strong>&quot;Contratado&quot;</strong> após a homologação e assinatura do contrato.
              </p>
            </div>
            <span className="px-3 py-1 bg-white rounded-lg border border-purple-200 text-purple-900 font-bold text-xs shrink-0 shadow-2xs">
              Exercício 2025
            </span>
          </div>

          <DataTable
            data={itensPCA}
            columns={pcaColumns}
            title="Itens do Plano de Contratações Anual (PCA 2025)"
            searchPlaceholder="Filtrar por código ou categoria do PCA..."
          />
        </div>
      )}

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

