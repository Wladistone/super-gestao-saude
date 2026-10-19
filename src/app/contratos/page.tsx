"use client";

import { useState } from "react";
import { dataStore } from "@/lib/data-store";
import { DataTable, Column } from "@/components/shared/data-table";
import { Contrato, AtaRegistroPrecos, OrdemFornecimentoServico } from "@/lib/types";
import { formatCurrency, formatDate, getVigenciaBadge, getDaysRemaining } from "@/lib/utils";
import { NovaOrdemModal } from "@/components/contratos/nova-ordem-modal";
import { NovoParecerAceitacaoModal } from "@/components/contratos/novo-parecer-aceitacao-modal";
import { NovaSolicitacaoPagamentoModal } from "@/components/contratos/nova-solicitacao-pagamento-modal";
import {
  FileCheck2,
  ShoppingCart,
  PlusCircle,
  Clock,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  ClipboardCheck,
} from "lucide-react";

export default function ContratosPage() {
  const [activeTab, setActiveTab] = useState<"contratos" | "atas" | "ordens">("contratos");
  const [isNovaOrdemOpen, setIsNovaOrdemOpen] = useState(false);
  const [isNovoParecerOpen, setIsNovoParecerOpen] = useState(false);
  const [isNovaSolicitacaoPagamentoOpen, setIsNovaSolicitacaoPagamentoOpen] = useState(false);
  const [contratoPreselecionadoId, setContratoPreselecionadoId] = useState<string | undefined>();

  const contratos = dataStore.contratos;
  const atas = dataStore.atas;
  const ordens = dataStore.ordens;
  const fornecedores = dataStore.fornecedores;

  // Colunas dos Contratos
  const contratoColumns: Column<Contrato>[] = [
    {
      header: "Nº Contrato",
      accessorKey: "numeroContrato",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 font-mono">{row.numeroContrato}</div>
          <div className="text-[10px] text-slate-400">
            {row.ataOrigemId ? "Derivado de ARP" : "Contrato Direto"}
          </div>
        </div>
      ),
    },
    {
      header: "Fornecedor Contratado",
      accessorKey: "fornecedorId",
      cell: (row) => {
        const forn = fornecedores.find((f) => f.id === row.fornecedorId);
        return (
          <div>
            <div className="font-semibold text-slate-800">{forn?.nomeFantasia || "Fornecedor"}</div>
            <div className="text-[10px] text-slate-400 font-mono">{forn?.cnpj}</div>
          </div>
        );
      },
    },
    {
      header: "Objeto do Contrato",
      accessorKey: "objeto",
      cell: (row) => (
        <p className="line-clamp-2 max-w-sm text-slate-700 font-medium">{row.objeto}</p>
      ),
    },
    {
      header: "Vigência & Alerta",
      accessorKey: "vigenciaFim",
      sortable: true,
      cell: (row) => {
        const dias = getDaysRemaining(row.vigenciaFim);
        const badge = getVigenciaBadge(dias);
        return (
          <div>
            <div className="text-slate-800 font-semibold">{formatDate(row.vigenciaFim)}</div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold inline-block mt-0.5 ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        );
      },
    },
    {
      header: "Execução Financeira (Saldo)",
      accessorKey: "saldoFinanceiroAtual",
      sortable: true,
      cell: (row) => {
        const perc = Math.round((row.saldoFinanceiroAtual / row.valorGlobal) * 100);
        return (
          <div className="w-36">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-bold text-emerald-700">{formatCurrency(row.saldoFinanceiroAtual)}</span>
              <span className="text-slate-400 font-mono">{perc}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  perc < 20 ? "bg-rose-500" : perc < 50 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.max(5, perc)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Global: {formatCurrency(row.valorGlobal)}
            </div>
          </div>
        );
      },
    },
    {
      header: "Ações",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setContratoPreselecionadoId(row.id);
              setIsNovaOrdemOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors"
            title="Emitir Ordem de Fornecimento ou de Serviço (OF/OS)"
          >
            <ShoppingCart className="h-3 w-3" />
            <span>Emitir OF/OS</span>
          </button>
          <button
            onClick={() => {
              setContratoPreselecionadoId(row.id);
              setIsNovoParecerOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors"
            title="Emitir Parecer de Aceitação Técnica e Definitiva (Art. 140 da Lei 14.133/2021)"
          >
            <ClipboardCheck className="h-3 w-3" />
            <span>Parecer de Aceitação</span>
          </button>
          <button
            onClick={() => {
              setContratoPreselecionadoId(row.id);
              setIsNovaSolicitacaoPagamentoOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200 transition-colors"
            title="Solicitar Pagamento e Liquidação com atesto do Fiscal"
          >
            <Receipt className="h-3 w-3" />
            <span>Pagamento</span>
          </button>
        </div>
      ),
    },
  ];

  // Colunas de Atas de Registro de Preços
  const ataColumns: Column<AtaRegistroPrecos>[] = [
    {
      header: "Nº da Ata",
      accessorKey: "numeroAta",
      sortable: true,
      cell: (row) => <span className="font-bold font-mono text-purple-900">{row.numeroAta}</span>,
    },
    {
      header: "Fornecedor Registrado",
      accessorKey: "fornecedorId",
      cell: (row) => {
        const forn = fornecedores.find((f) => f.id === row.fornecedorId);
        return <span className="font-semibold text-slate-800">{forn?.nomeFantasia}</span>;
      },
    },
    {
      header: "Objeto",
      accessorKey: "objeto",
      cell: (row) => <span className="line-clamp-2 text-slate-700">{row.objeto}</span>,
    },
    {
      header: "Valor Registrado",
      accessorKey: "valorTotalRegistrado",
      sortable: true,
      cell: (row) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(row.valorTotalRegistrado)}</span>,
    },
    {
      header: "Saldo Disponível",
      accessorKey: "saldoTotalDisponivel",
      sortable: true,
      cell: (row) => <span className="font-bold text-emerald-700 font-mono">{formatCurrency(row.saldoTotalDisponivel)}</span>,
    },
    {
      header: "Validade",
      accessorKey: "vigenciaFim",
      sortable: true,
      cell: (row) => formatDate(row.vigenciaFim),
    },
  ];

  // Colunas de Ordens de Fornecimento
  const ordemColumns: Column<OrdemFornecimentoServico>[] = [
    {
      header: "Nº da Ordem",
      accessorKey: "numeroOF",
      sortable: true,
      cell: (row) => <span className="font-bold font-mono text-sky-900">{row.numeroOF}</span>,
    },
    {
      header: "Contrato Vinculado",
      accessorKey: "contratoNumero",
      cell: (row) => <span className="font-mono text-slate-700 font-semibold">{row.contratoNumero}</span>,
    },
    {
      header: "Fornecedor",
      accessorKey: "fornecedorNome",
      cell: (row) => <span className="text-slate-800 font-medium">{row.fornecedorNome}</span>,
    },
    {
      header: "Valor Total",
      accessorKey: "valorTotal",
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-slate-900">{formatCurrency(row.valorTotal)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          row.status === "ENTREGUE" ? "bg-emerald-100 text-emerald-800" :
          row.status === "LIQUIDADA" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Data de Emissão",
      accessorKey: "dataEmissao",
      sortable: true,
      cell: (row) => formatDate(row.dataEmissao),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
          Execução Contratual Reativa
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Atas de Registro de Preços & Contratos
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedução atômica de saldos em Ordens de Fornecimento, alertas preventivos de vigências (120, 90, 60 e 30 dias) e controle de aditivos.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("contratos")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "contratos"
              ? "border-emerald-700 text-emerald-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Contratos Vigentes ({contratos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("atas")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "atas"
              ? "border-emerald-700 text-emerald-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4 text-purple-600" />
          <span>Atas de Registro de Preços ({atas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ordens")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "ordens"
              ? "border-emerald-700 text-emerald-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="h-4 w-4 text-sky-600" />
          <span>Ordens de Fornecimento Emitidas ({ordens.length})</span>
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "contratos" && (
        <DataTable
          data={contratos}
          columns={contratoColumns}
          title="Contratos Administrativos Ativos da Secretaria de Saúde"
          searchPlaceholder="Filtrar contratos por objeto ou fornecedor..."
        />
      )}

      {activeTab === "atas" && (
        <DataTable
          data={atas}
          columns={ataColumns}
          title="Atas de Registro de Preços (ARP) Homologadas"
          searchPlaceholder="Filtrar atas por número ou objeto..."
        />
      )}

      {activeTab === "ordens" && (
        <DataTable
          data={ordens}
          columns={ordemColumns}
          title="Histórico de Ordens de Fornecimento / Serviço (OF/OS)"
          searchPlaceholder="Filtrar por número da OF ou contrato..."
        />
      )}

      {/* Modal de Nova Ordem com Dedução Atômica */}
      <NovaOrdemModal
        isOpen={isNovaOrdemOpen}
        onClose={() => setIsNovaOrdemOpen(false)}
        contratoIdPreselecionado={contratoPreselecionadoId}
        onSuccess={() => window.location.reload()}
      />

      {/* Modal de Parecer de Aceitação */}
      <NovoParecerAceitacaoModal
        isOpen={isNovoParecerOpen}
        onClose={() => setIsNovoParecerOpen(false)}
        contratoIdPreselecionado={contratoPreselecionadoId}
        onSuccess={() => window.location.reload()}
      />

      {/* Modal de Solicitação de Pagamento */}
      <NovaSolicitacaoPagamentoModal
        isOpen={isNovaSolicitacaoPagamentoOpen}
        onClose={() => setIsNovaSolicitacaoPagamentoOpen(false)}
        contratoIdPreselecionado={contratoPreselecionadoId}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
