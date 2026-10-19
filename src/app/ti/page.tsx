"use client";

import { useState } from "react";
import { dataStore } from "@/lib/data-store";
import { DataTable, Column } from "@/components/shared/data-table";
import { AtivoTI, LicencaSoftware } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  Server,
  Key,
  Shield,
  Laptop,
  HardDrive,
  Cpu,
  Monitor,
} from "lucide-react";

export default function ModuloTIPage() {
  const [activeTab, setActiveTab] = useState<"ativos" | "licencas">("ativos");
  const ativos = dataStore.ativosTI;
  const licencas = dataStore.licencas;

  // Colunas de Ativos de TI
  const ativoColumns: Column<AtivoTI>[] = [
    {
      header: "Tombamento / Patrimônio",
      accessorKey: "patrimonio",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-xs">
          {row.patrimonio}
        </span>
      ),
    },
    {
      header: "Equipamento & Modelo",
      accessorKey: "modelo",
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.modelo}</div>
          <div className="text-[10px] text-slate-500">{row.marca} • Tipo: {row.tipo}</div>
        </div>
      ),
    },
    {
      header: "Setor Alocado",
      accessorKey: "setorAlocado",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {row.setorAlocado}
        </span>
      ),
    },
    {
      header: "Responsável",
      accessorKey: "responsavel",
      cell: (row) => <span className="text-slate-700 font-medium">{row.responsavel}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {row.status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Data de Aquisição",
      accessorKey: "dataAquisicao",
      sortable: true,
      cell: (row) => formatDate(row.dataAquisicao),
    },
  ];

  // Colunas de Licenças
  const licencaColumns: Column<LicencaSoftware>[] = [
    {
      header: "Software / Sistema",
      accessorKey: "software",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.software}</div>
          <div className="text-[10px] text-slate-400">{row.fabricante}</div>
        </div>
      ),
    },
    {
      header: "Licenças Contratadas",
      accessorKey: "quantidade",
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-slate-800">{row.quantidade}</span>,
    },
    {
      header: "Em Uso nas Unidades",
      accessorKey: "quantidadeEmUso",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-sky-800">
          {row.quantidadeEmUso} ({Math.round((row.quantidadeEmUso / row.quantidade) * 100)}%)
        </span>
      ),
    },
    {
      header: "Vigência de Suporte",
      accessorKey: "vigenciaFim",
      sortable: true,
      cell: (row) => formatDate(row.vigenciaFim),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
            Núcleo de Tecnologia da Informação (TI)
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Parque Tecnológico de TI & Licenciamento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de patrimônio, computadores para e-SUS PEC nas Unidades Básicas de Saúde, servidores de datacenter e switches.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ativos")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "ativos"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Ativos de TI & Equipamentos ({ativos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("licencas")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "licencas"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Key className="h-4 w-4 text-purple-600" />
          <span>Licenças Corporativas de Software ({licencas.length})</span>
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "ativos" && (
        <DataTable
          data={ativos}
          columns={ativoColumns}
          title="Equipamentos Cadastrados com Registro de Tombamento"
          searchPlaceholder="Filtrar por patrimônio, setor ou modelo..."
        />
      )}

      {activeTab === "licencas" && (
        <DataTable
          data={licencas}
          columns={licencaColumns}
          title="Controle de Licenciamento de Sistemas e Segurança"
          searchPlaceholder="Filtrar por software ou fabricante..."
        />
      )}
    </div>
  );
}
