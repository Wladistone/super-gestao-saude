"use client";

import { useState } from "react";
import { dataStore } from "@/lib/data-store";
import { DataTable, Column } from "@/components/shared/data-table";
import { Veiculo, Motorista, Abastecimento, EscalaPlantao24x7 } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime, getDaysRemaining } from "@/lib/utils";
import { NovoAbastecimentoModal } from "@/components/frotas/novo-abastecimento-modal";
import {
  Ambulance,
  Fuel,
  Users,
  ShieldCheck,
  Wrench,
  Clock,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";

export default function FrotasPage() {
  const [activeTab, setActiveTab] = useState<"veiculos" | "escalas" | "abastecimentos" | "motoristas">("veiculos");
  const [isAbastecimentoOpen, setIsAbastecimentoOpen] = useState(false);

  const veiculos = dataStore.veiculos;
  const motoristas = dataStore.motoristas;
  const escalas = dataStore.escalas;
  const abastecimentos = dataStore.abastecimentos;

  // Colunas de Veículos
  const veiculoColumns: Column<Veiculo>[] = [
    {
      header: "Placa",
      accessorKey: "placa",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold bg-slate-900 text-white px-2 py-1 rounded text-xs">
          {row.placa}
        </span>
      ),
    },
    {
      header: "Modelo & Destinação",
      accessorKey: "modelo",
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.modelo}</div>
          <div className="text-[10px] text-slate-500">{row.marca} • Ano {row.ano} • {row.tipo}</div>
        </div>
      ),
    },
    {
      header: "Capacidade Operacional",
      accessorKey: "capacidade",
      cell: (row) => <span className="text-slate-700 text-[11px]">{row.capacidade}</span>,
    },
    {
      header: "Status Operacional",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const styles: Record<string, string> = {
          PLANTAO_24_7: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold animate-pulse",
          DISPONIVEL: "bg-blue-100 text-blue-800 border-blue-300",
          EM_ROTA: "bg-purple-100 text-purple-800 border-purple-300",
          MANUTENCAO: "bg-amber-100 text-amber-800 border-amber-300",
        };
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[row.status] || ""}`}>
            {row.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      header: "Odômetro (KM)",
      accessorKey: "quilometragemAtual",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-800">
          {row.quilometragemAtual.toLocaleString()} km
        </span>
      ),
    },
    {
      header: "Licenciamento",
      accessorKey: "dataLicenciamento",
      sortable: true,
      cell: (row) => formatDate(row.dataLicenciamento),
    },
  ];

  // Colunas de Abastecimento
  const abastecimentoColumns: Column<Abastecimento>[] = [
    {
      header: "Data / Hora",
      accessorKey: "dataHora",
      sortable: true,
      cell: (row) => formatDateTime(row.dataHora),
    },
    {
      header: "Veículo (Placa)",
      accessorKey: "veiculoPlaca",
      cell: (row) => (
        <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
          {row.veiculoPlaca}
        </span>
      ),
    },
    {
      header: "Motorista",
      accessorKey: "motoristaNome",
      cell: (row) => <span className="font-medium text-slate-800">{row.motoristaNome}</span>,
    },
    {
      header: "Combustível",
      accessorKey: "tipoCombustivel",
      cell: (row) => <span className="text-slate-700">{row.tipoCombustivel}</span>,
    },
    {
      header: "Volume (L)",
      accessorKey: "litros",
      sortable: true,
      cell: (row) => <span className="font-mono font-bold">{row.litros} L</span>,
    },
    {
      header: "Valor Total",
      accessorKey: "valorTotal",
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-sky-900">{formatCurrency(row.valorTotal)}</span>,
    },
    {
      header: "Cupom Fiscal",
      accessorKey: "cupomFiscal",
      cell: (row) => <span className="font-mono text-[10px] text-slate-500">{row.cupomFiscal}</span>,
    },
  ];

  // Colunas de Motoristas
  const motoristaColumns: Column<Motorista>[] = [
    {
      header: "Nome do Condutor",
      accessorKey: "nome",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.nome}</div>
          <div className="text-[10px] text-slate-400 font-mono">Matrícula: {row.matricula}</div>
        </div>
      ),
    },
    {
      header: "Categoria CNH",
      accessorKey: "categoriaCnh",
      cell: (row) => <span className="font-semibold text-slate-700">{row.categoriaCnh}</span>,
    },
    {
      header: "Validade da CNH",
      accessorKey: "validadeCnh",
      sortable: true,
      cell: (row) => {
        const dias = getDaysRemaining(row.validadeCnh);
        const isCritico = dias <= 30;
        return (
          <div>
            <div className="font-semibold text-slate-800">{formatDate(row.validadeCnh)}</div>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold inline-block mt-0.5 ${
                isCritico ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse" : "bg-slate-100 text-slate-600"
              }`}
            >
              {dias > 0 ? `${dias} dias restantes` : "CNH Vencida!"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Escala",
      accessorKey: "escalaTrabalho",
      cell: (row) => <span className="font-medium text-slate-700">{row.escalaTrabalho}</span>,
    },
    {
      header: "Telefone de Plantão",
      accessorKey: "telefone",
      cell: (row) => <span className="font-mono text-slate-600">{row.telefone}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
            Coordenação de Transportes da Saúde (TFD & Frota Municipal)
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Hub de Frotas, Transporte Sanitário & Combustíveis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoramento operacional de veículos e ambulâncias de remoção da rede municipal, transporte fora de domicílio (TFD), escala de condutores e consumo de combustível amarrado a contrato.
          </p>
        </div>

        <button
          onClick={() => setIsAbastecimentoOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Fuel className="h-4 w-4" />
          <span>Registrar Abastecimento</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("veiculos")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "veiculos"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Ambulance className="h-4 w-4" />
          <span>Frota Operacional ({veiculos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("escalas")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "escalas"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="h-4 w-4 text-emerald-600" />
          <span>Escalas de Plantão 24/7 ({escalas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("abastecimentos")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "abastecimentos"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Fuel className="h-4 w-4 text-amber-600" />
          <span>Histórico de Abastecimentos ({abastecimentos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("motoristas")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "motoristas"
              ? "border-sky-700 text-sky-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4 text-indigo-600" />
          <span>Motoristas & CNHs ({motoristas.length})</span>
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "veiculos" && (
        <DataTable
          data={veiculos}
          columns={veiculoColumns}
          title="Veículos, Ambulâncias e Vans da Secretaria Municipal de Saúde"
          searchPlaceholder="Filtrar por placa, modelo ou status..."
        />
      )}

      {activeTab === "escalas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escalas.map((esc) => (
              <div
                key={esc.id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-slate-900 text-white font-bold px-2 py-0.5 rounded text-xs">
                      {esc.veiculoPlaca}
                    </span>
                    <span className="font-bold text-slate-900">{esc.veiculoModelo}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {esc.statusProntidao}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-400">Condutor Escalado:</span>{" "}
                    <strong className="text-slate-800 text-sm">{esc.motoristaNome}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Turno de Cobertura:</span>{" "}
                    <span className="text-slate-700 font-semibold">{esc.turno}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Contato de Emergência:</span>{" "}
                    <span className="text-sky-700 font-bold">{esc.contatoEmergencia}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "abastecimentos" && (
        <DataTable
          data={abastecimentos}
          columns={abastecimentoColumns}
          title="Registro Contábil de Abastecimentos com Cupom Fiscal"
          searchPlaceholder="Filtrar por placa ou motorista..."
        />
      )}

      {activeTab === "motoristas" && (
        <DataTable
          data={motoristas}
          columns={motoristaColumns}
          title="Condutores Oficiais e Monitoramento de Validade da CNH"
          searchPlaceholder="Filtrar por nome ou matrícula..."
        />
      )}

      {/* Modal de Abastecimento */}
      <NovoAbastecimentoModal
        isOpen={isAbastecimentoOpen}
        onClose={() => setIsAbastecimentoOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
