"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Search,
  Filter,
} from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFilterKey?: keyof T | ((row: T, query: string) => boolean);
  itemsPerPage?: number;
  title?: string;
  actionButton?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Filtrar registros...",
  searchFilterKey,
  itemsPerPage = 8,
  title,
  actionButton,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtro
  const filteredData = useMemo(() => {
    if (!query.trim()) return data;
    const lower = query.toLowerCase();

    return data.filter((item) => {
      if (typeof searchFilterKey === "function") {
        return searchFilterKey(item, lower);
      }
      if (searchFilterKey) {
        const val = item[searchFilterKey];
        return String(val || "").toLowerCase().includes(lower);
      }
      // Se não especificado filtro chave, busca em todos os campos primitivos
      return Object.values(item).some((val) =>
        String(val || "").toLowerCase().includes(lower)
      );
    });
  }, [data, query, searchFilterKey]);

  // Ordenação
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      return sortDirection === "asc" ? 1 : -1;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginação
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  // Ajusta a página atual caso os filtros ou total de páginas mudem
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedData.length);

  const paginatedData = useMemo(() => {
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    const page = Math.max(1, Math.min(totalPages, newPage));
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const exportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map((c) => c.header).join(";");
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          if (c.accessorKey) {
            const raw = row[c.accessorKey];
            return `"${String(raw ?? "").replace(/"/g, '""')}"`;
          }
          return '""';
        })
        .join(";")
    );
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `export_${title || "dados"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Topo da Tabela: Título, Filtro e Ações */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {title && (
            <h3 className="font-bold text-sm text-slate-800 tracking-tight whitespace-nowrap">
              {title}
            </h3>
          )}
          <span className="text-[11px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full font-medium">
            {sortedData.length} registros
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="Exportar dados para CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">Exportar CSV</span>
          </button>

          {actionButton}
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-3 px-4 select-none"
                  onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <span>{col.header}</span>
                    {col.sortable && col.accessorKey && (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 hover:text-slate-700" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                  Nenhum dado encontrado para os critérios pesquisados.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="py-3 px-4 align-middle">
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? "-") : "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação Aconchegante, Clara e 100% Funcional */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none">
        {/* Informações de Registros e Itens por Página */}
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <div className="text-slate-600">
            Mostrando{" "}
            <strong className="text-slate-800 font-bold">
              {sortedData.length > 0 ? startIndex + 1 : 0}
            </strong>{" "}
            a{" "}
            <strong className="text-slate-800 font-bold">{endIndex}</strong> de{" "}
            <strong className="text-slate-800 font-bold">
              {sortedData.length}
            </strong>{" "}
            registros
          </div>

          <span className="text-slate-300 hidden sm:inline">&bull;</span>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Exibir:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
            >
              {[8, 12, 20, 50].map((sz) => (
                <option key={sz} value={sz}>
                  {sz} por pág.
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controles de Navegação: Anterior, Pílulas Numéricas e Próxima */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* Botão Página Anterior */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-2xs transition-all cursor-pointer"
            title="Ir para a página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-medium">Anterior</span>
          </button>

          {/* Pílulas de Números das Páginas */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-medium select-none text-[11px]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-btn-${page}`}
                  type="button"
                  onClick={() => handlePageChange(Number(page))}
                  className={`h-7 min-w-[30px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-sky-700 text-white shadow-xs border border-sky-800"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 shadow-2xs"
                  }`}
                  title={`Ir para a página ${page}`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Botão Próxima Página */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-2xs transition-all cursor-pointer"
            title="Ir para a próxima página"
          >
            <span className="font-medium">Próxima</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
