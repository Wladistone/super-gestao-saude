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

  // Demandas com prazo expirado
  const agoraTimestamp = new Date().getTime();
  const demandasExpiradas = demandas.filter(
    (d) => d.status !== "CUMPRIDA" && new Date(d.prazoCumprimento).getTime() < agoraTimestamp
  );

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
      header: "Prazo & Situação",
      accessorKey: "prazoCumprimento",
      sortable: true,
      cell: (row) => {
        const agora = new Date().getTime();
        const prazo = new Date(row.prazoCumprimento).getTime();
        const horas = Math.round((prazo - agora) / (1000 * 60 * 60));

        return (
          <div className="space-y-1">
            <div className="font-mono text-slate-700 text-xs font-medium">
              {formatDate(row.prazoCumprimento)}
            </div>
            {row.status === "CUMPRIDA" ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                Cumprida
              </span>
            ) : horas <= 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs">
                <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />
                Prazo expirado
              </span>
            ) : horas <= 48 ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                Restam {horas}h
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-50 text-slate-600 border border-slate-200">
                Em andamento
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
            Núcleo de Judicialização
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Gestão de Demandas Judiciais & Liminares
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento e cumprimento de decisões judiciais, fornecimento de itens e vinculação contratual.
          </p>
        </div>

        <button
          onClick={() => setIsNovaDemandaOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nova Demanda Judicial</span>
        </button>
      </div>

      {/* Painel Informativo com Alerta Suave de Prazos */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  Acompanhamento de Demandas • Vara da Fazenda Pública
                </h3>
                {demandasExpiradas.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                    {demandasExpiradas.length} {demandasExpiradas.length === 1 ? "prazo expirado" : "prazos expirados"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                O cumprimento tempestivo via ata de registro de preços ou contrato vigente garante celeridade no atendimento ao cidadão e a regularidade do processo judicial.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Total Estimado em Liminares
            </span>
            <div className="text-lg font-black text-slate-900 font-mono">
              {formatCurrency(demandas.reduce((acc, d) => acc + d.valorEstimado, 0))}
            </div>
          </div>
        </div>

        {demandasExpiradas.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Alerta de Cumprimento:</strong> {demandasExpiradas.length} {demandasExpiradas.length === 1 ? "demanda judicial com prazo expirado requer" : "demandas judiciais com prazos expirados requerem"} atenção da equipe para fornecimento tempestivo.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0">
              Atenção
            </span>
          </div>
        )}
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
