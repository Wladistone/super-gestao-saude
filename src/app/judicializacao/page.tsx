"use client";

import { useState } from "react";
import { dataStore } from "@/lib/data-store";
import { DataTable, Column } from "@/components/shared/data-table";
import { DemandaJudicial } from "@/lib/types";
import { formatCurrency, formatDate, getDaysRemaining } from "@/lib/utils";
import { NovaDemandaModal } from "@/components/judicializacao/nova-demanda-modal";
import {
  Scale,
  PlusCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle,
  Link2,
} from "lucide-react";

export default function JudicializacaoPage() {
  const [isNovaDemandaOpen, setIsNovaDemandaOpen] = useState(false);
  const demandas = dataStore.demandasJudiciais;

  // Colunas da Judicialização
  const demandaColumns: Column<DemandaJudicial>[] = [
    {
      header: "Nº Processo Judicial",
      accessorKey: "numeroProcessoJudicial",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">
            {row.numeroProcessoJudicial}
          </span>
          <div className="text-[10px] text-slate-500">{row.varaJuizo}</div>
        </div>
      ),
    },
    {
      header: "Polo Ativo (Paciente)",
      accessorKey: "poloAtivo",
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.poloAtivo}</div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Tipo: {row.tipoDemanda.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      header: "Determinação / Liminar",
      accessorKey: "relatoCaso",
      cell: (row) => (
        <p className="line-clamp-2 max-w-sm text-slate-700 text-xs font-medium">
          {row.relatoCaso}
        </p>
      ),
    },
    {
      header: "Prazo Fatal & Contagem",
      accessorKey: "prazoCumprimento",
      sortable: true,
      cell: (row) => {
        const dias = getDaysRemaining(row.prazoCumprimento);
        const agora = new Date().getTime();
        const prazo = new Date(row.prazoCumprimento).getTime();
        const horas = Math.round((prazo - agora) / (1000 * 60 * 60));
        const isCritica = row.status !== "CUMPRIDA" && horas <= 48;

        return (
          <div>
            <div className="font-mono font-bold text-slate-800 text-xs">
              {formatDate(row.prazoCumprimento)}
            </div>
            {row.status === "CUMPRIDA" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Cumprida
              </span>
            ) : (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 ${
                  horas <= 6
                    ? "bg-rose-600 text-white animate-ping"
                    : isCritica
                    ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {horas > 0 ? `🚨 Restam ${horas} horas` : "⚠️ PRAZO EXPIRADO"}
              </span>
            )}
          </div>
        );
      },
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
      header: "Vínculo Contratual / Execução",
      cell: (row) => {
        const vinculo = row.vinculosExecucao?.[0];
        if (!vinculo) {
          return (
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Pendente de Vínculo
            </span>
          );
        }
        return (
          <div>
            <div className="font-bold text-sky-900 text-xs">{vinculo.contratoNumero || "Contrato Direto"}</div>
            <div className="text-[10px] text-slate-500 truncate max-w-xs">{vinculo.statusCumprimento}</div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
            Núcleo de Judicialização da Saúde
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Gestão Rigorosa de Demandas & Liminares
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoramento de decisões judiciais urgentes sob pena de bloqueio financeiro das contas da Secretaria de Saúde e multas diárias.
          </p>
        </div>

        <button
          onClick={() => setIsNovaDemandaOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Cadastrar Demanda com Alerta</span>
        </button>
      </div>

      {/* Banner de Risco de Bloqueio Judicial */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950 to-slate-900 text-white border border-rose-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                Alerta de Cumprimento Célere - Vara da Fazenda Pública
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                O cumprimento tempestivo via ata ou contrato já homologado previne ordens de sequestro de verba municipal e responsabilidade pessoal do gestor.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Judicializado</span>
            <div className="text-base font-black text-rose-300">
              {formatCurrency(demandas.reduce((acc, d) => acc + d.valorEstimado, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Demandas */}
      <DataTable
        data={demandas}
        columns={demandaColumns}
        title="Ações Judiciais & Cumprimento de Liminares"
        searchPlaceholder="Filtrar por paciente, número CNJ ou juízo..."
      />

      {/* Modal de Nova Demanda */}
      <NovaDemandaModal
        isOpen={isNovaDemandaOpen}
        onClose={() => setIsNovaDemandaOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
