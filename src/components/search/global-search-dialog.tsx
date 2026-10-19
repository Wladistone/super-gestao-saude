"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Search,
  X,
  FileText,
  FileCheck2,
  Ambulance,
  CreditCard,
  Scale,
  Car,
  User,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Coins,
  Landmark,
  ExternalLink,
  Download,
  FolderTree,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { dataStore } from "@/lib/data-store";
import { formatCurrency, formatDate, getVigenciaBadge, getDaysRemaining } from "@/lib/utils";
import { ModeloDocumentoProcesso } from "@/data/modelos-licitacao-catalog";
import { DemandaPreviaProcesso } from "@/lib/types";

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchDialog({ isOpen, onClose }: GlobalSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"todos" | "grafo" | "contratos" | "processos" | "frotas" | "judicial">("todos");
  const [isPending, startTransition] = useTransition();
  const [searchResult, setSearchResult] = useState<ReturnType<typeof dataStore.busca360> | null>(null);

  // Escuta tecla Cmd+K / Ctrl+K e Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // se já estiver aberto ou fechado, alterna
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Executa a busca reativa conforme o usuário digita
  useEffect(() => {
    if (!isOpen) return;
    if (searchTerm.trim().length === 0) {
      setSearchResult(null);
      return;
    }

    startTransition(() => {
      const res = dataStore.busca360(searchTerm);
      setSearchResult(res);
    });
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  const quickTerms = [
    "combustível",
    "ambulância",
    "crédito adicional",
    "transposição",
    "PT 2098",
    "oxigênio",
    "insulina",
    "Waléria",
    "CT-2025/012",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Barra de Entrada de Pesquisa */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <div className="h-9 w-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Search className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o objeto, processo, placa, remédio ou fornecedor (ex: combustível, ambulância, oxigênio)..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd
            onClick={onClose}
            className="cursor-pointer px-2 py-1 text-[11px] bg-slate-200 text-slate-600 rounded border border-slate-300 font-mono hover:bg-slate-300"
          >
            ESC
          </kbd>
        </div>

        {/* Sugestões Rápidas */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles className="h-3 w-3 text-sky-600" /> Sugestões 360º:
          </span>
          {quickTerms.map((term) => (
            <button
              key={term}
              onClick={() => setSearchTerm(term)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 text-slate-600 text-xs transition-all whitespace-nowrap shadow-2xs"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Conteúdo dos Resultados 360º */}
        <div className="flex-1 overflow-y-auto p-5">
          {!searchTerm.trim() ? (
            <div className="py-12 text-center text-slate-400">
              <Layers className="h-12 w-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
              <h3 className="font-semibold text-sm text-slate-700">Central Intelligence - Motor 360º</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Conecte em segundos processos administrativos, atas de registro de preços, contratos com dedução de saldo, frotas vinculadas e ordens judiciais.
              </p>
            </div>
          ) : searchResult && searchResult.totalResultados === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                Nenhum registro encontrado para &quot;{searchTerm}&quot;
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tente palavras mais genéricas como &quot;remédio&quot;, &quot;veículo&quot;, &quot;2025&quot; ou &quot;transporte&quot;.
              </p>
            </div>
          ) : searchResult ? (
            <div className="space-y-6">
              
              {/* Header do Hub 360º com métricas conectadas */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-900 to-slate-900 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                      Resultado do Hub Relacional 360º
                    </span>
                    <h2 className="text-base font-bold mt-1 text-white">
                      Objeto / Entidade: &quot;{searchResult.termo}&quot;
                    </h2>
                    <p className="text-xs text-sky-200">
                      Encontrados {searchResult.totalResultados} nós relacionais conectados entre licitações, contratos e operação.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                      <div className="text-sm font-bold text-sky-300">{searchResult.processos.length}</div>
                      <div className="text-[10px] text-slate-300">Processos</div>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                      <div className="text-sm font-bold text-emerald-300">{searchResult.contratos.length}</div>
                      <div className="text-[10px] text-slate-300">Contratos</div>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                      <div className="text-sm font-bold text-amber-300">{searchResult.ordens.length}</div>
                      <div className="text-[10px] text-slate-300">Ordens OF</div>
                    </div>
                    {searchResult.creditos && searchResult.creditos.length > 0 && (
                      <div className="text-center px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
                        <div className="text-sm font-bold text-emerald-300">{searchResult.creditos.length}</div>
                        <div className="text-[10px] text-emerald-100">Créditos SMS</div>
                      </div>
                    )}
                    {searchResult.modelosLicitacao && searchResult.modelosLicitacao.length > 0 && (
                      <div className="text-center px-3 py-1.5 rounded-lg bg-sky-500/20 backdrop-blur-sm border border-sky-400/30">
                        <div className="text-sm font-bold text-sky-200">{searchResult.modelosLicitacao.length}</div>
                        <div className="text-[10px] text-sky-100">Minutas .docx</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção Modelos Oficiais de Atos Administrativos (C:\SISTEMA LICITAÇÃO) */}
              {searchResult.modelosLicitacao && searchResult.modelosLicitacao.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <FolderTree className="h-4 w-4 text-sky-600" /> Modelos Oficiais de Atos Administrativos ({searchResult.modelosLicitacao.length})
                    </span>
                    <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      SISTEMA LICITAÇÃO (114 Modelos)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResult.modelosLicitacao.slice(0, 6).map((mod: ModeloDocumentoProcesso) => (
                      <div
                        key={mod.id}
                        className="p-3 rounded-xl border border-sky-200 bg-sky-50/40 hover:border-sky-300 hover:shadow-xs transition-all text-xs flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-sky-800 bg-white border border-sky-200 px-1.5 py-0.2 rounded">
                              {mod.tipoPeca}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate">
                              {mod.modalidade}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 truncate" title={mod.titulo}>
                            {mod.titulo}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {mod.artigoLei}
                          </span>
                        </div>
                        <a
                          href={mod.downloadUrl}
                          download
                          className="px-2.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] inline-flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                          title="Baixar Modelo Editável .docx"
                        >
                          <Download className="h-3 w-3" />
                          .docx
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção Demandas Prévias das Superintendências (SAS, SUVIG, SGTES, SURCAA ➔ SG) */}
              {searchResult.demandasPrevias && searchResult.demandasPrevias.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-indigo-600" /> Demandas das Superintendências ({searchResult.demandasPrevias.length})
                    </span>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      SAS, SUVIG, SGTES, SURCAA ➔ SG
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResult.demandasPrevias.map((dem: DemandaPreviaProcesso) => (
                      <Link
                        key={dem.id}
                        href="/processos"
                        onClick={onClose}
                        className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:border-indigo-300 hover:shadow-xs transition-all text-xs block group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-indigo-950 group-hover:text-indigo-700 transition">
                            {dem.numeroDemanda}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-indigo-800 border border-indigo-200">
                            {dem.superintendenciaOrigem}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium line-clamp-2 mb-1.5">
                          {dem.objeto}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-indigo-100">
                          <span>{dem.itens.length} itens &bull; {formatCurrency(dem.valorTotalEstimado)}</span>
                          <span className="font-bold text-indigo-700">
                            {dem.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção 1: Processos Licitatórios Conectados */}
              {searchResult.processos.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-sky-600" /> Processos Administrativos ({searchResult.processos.length})
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Lei nº 14.133/2021</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResult.processos.map((proc) => (
                      <div
                        key={proc.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-md transition-all text-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {proc.numeroProcesso}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                            {proc.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium line-clamp-2 mb-2">
                          {proc.objeto}
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Setor Atual: <strong className="text-slate-800">{proc.setorAtual}</strong></span>
                          <span>{formatDate(proc.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção 2: Atas e Contratos Ativos com Linha do Tempo e Saldo Financeiro */}
              {searchResult.contratos.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <FileCheck2 className="h-4 w-4 text-emerald-600" /> Contratos Vinculados & Saldos Restantes ({searchResult.contratos.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {searchResult.contratos.map((ct) => {
                      const diasRestantes = getDaysRemaining(ct.vigenciaFim);
                      const badgeVigencia = getVigenciaBadge(diasRestantes);
                      const percSaldo = Math.round((ct.saldoFinanceiroAtual / ct.valorGlobal) * 100);

                      return (
                        <div
                          key={ct.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {ct.numeroContrato}
                              </span>
                              {ct.ataOrigemId && (
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                                  Derivado de Ata de Registro de Preços
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeVigencia.color}`}>
                              {badgeVigencia.label}
                            </span>
                          </div>

                          <p className="text-slate-700 font-medium line-clamp-2 mb-3">
                            {ct.objeto}
                          </p>

                          {/* Linha do Tempo Financeira (Saldo Restante) */}
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">
                                Valor Global: <strong className="text-slate-800">{formatCurrency(ct.valorGlobal)}</strong>
                              </span>
                              <span className="text-emerald-700 font-bold">
                                Saldo Disponível: {formatCurrency(ct.saldoFinanceiroAtual)} ({percSaldo}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  percSaldo < 20 ? "bg-rose-500" : percSaldo < 50 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.max(5, percSaldo)}%` }}
                              />
                            </div>
                          </div>

                          {/* Itens com saldo unitário contratado */}
                          {ct.itens && ct.itens.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                                Itens Contratados com Saldo Reativo:
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {ct.itens.map((it) => (
                                  <div
                                    key={it.id}
                                    className="p-2 rounded bg-slate-50 border border-slate-200/70 flex items-center justify-between text-[11px]"
                                  >
                                    <div className="truncate pr-2">
                                      <div className="font-semibold text-slate-800 truncate">{it.descricao}</div>
                                      <div className="text-[10px] text-slate-400">Unit: {formatCurrency(it.valorUnitario)}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-bold text-emerald-700">
                                        {it.quantidadeDisponivel} {it.unidadeMedida}
                                      </span>
                                      <div className="text-[10px] text-slate-400">restantes</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seção 3: Ordens de Fornecimento e Pagamentos Liquidados */}
              {(searchResult.ordens.length > 0 || searchResult.pagamentos.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ordens Emitidas */}
                  {searchResult.ordens.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <div className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-sky-600" /> Ordens de Fornecimento ({searchResult.ordens.length})
                      </div>
                      <div className="space-y-2">
                        {searchResult.ordens.map((ord) => (
                          <div key={ord.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>{ord.numeroOF}</span>
                              <span className="text-sky-700">{formatCurrency(ord.valorTotal)}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Status: <strong className="text-slate-700">{ord.status}</strong> | Emitida: {formatDate(ord.dataEmissao)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pagamentos e Notas Fiscais */}
                  {searchResult.pagamentos.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <div className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> Pagamentos & Empenhos ({searchResult.pagamentos.length})
                      </div>
                      <div className="space-y-2">
                        {searchResult.pagamentos.map((pag) => (
                          <div key={pag.id} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>{pag.numeroNotaFiscal}</span>
                              <span className="text-emerald-800">{formatCurrency(pag.valorPago)}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1">
                              Empenho: {pag.numeroEmpenho} | Pago: {formatDate(pag.dataPagamento)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seção 3.1: Créditos Adicionais da Planilha Oficial SMS */}
              {searchResult.creditos && searchResult.creditos.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Créditos Adicionais SMS &bull; Planilha Oficial ({searchResult.creditos.length})
                    </span>
                    <Link
                      href="/orcamento"
                      onClick={onClose}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 normal-case hover:underline"
                    >
                      <span>Ver na Planilha Completa</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResult.creditos.slice(0, 6).map((cr) => (
                      <div
                        key={cr.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Nº {cr.numero}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  cr.tipoCredito === "Transposição"
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : "bg-purple-50 text-purple-800 border-purple-200"
                                }`}
                              >
                                {cr.tipoCredito}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                cr.status === "OK"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border-rose-300"
                              }`}
                            >
                              {cr.status}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between mt-1 mb-2">
                            <span className="text-sm font-black font-mono text-emerald-800">
                              {formatCurrency(cr.valor)}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {cr.dataCredito}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg text-[10px] font-mono mb-2 border border-slate-100">
                            <div>
                              <span className="text-rose-700 font-bold block">Origem:</span>
                              <span className="text-slate-800 font-semibold">PT {cr.programaOrigem}</span>
                              <div className="text-slate-400 truncate">F: {cr.fonteOrigem}</div>
                            </div>
                            <div>
                              <span className="text-emerald-700 font-bold block">Destino:</span>
                              <span className="text-slate-800 font-semibold">PT {cr.programaDestino}</span>
                              <div className="text-slate-400 truncate">F: {cr.fonteDestino}</div>
                            </div>
                          </div>

                          {cr.observacoes && (
                            <p className="text-[10px] text-slate-500 italic line-clamp-1 mb-2">
                              {cr.observacoes}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Solicitante: <strong className="text-slate-800">{cr.solicitante}</strong></span>
                          <Link
                            href="/orcamento"
                            onClick={onClose}
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Acessar</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {searchResult.creditos.length > 6 && (
                    <div className="text-center pt-1">
                      <Link
                        href="/orcamento"
                        onClick={onClose}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 hover:underline"
                      >
                        <span>Ver todos os {searchResult.creditos.length} créditos no Orçamento &rarr;</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Seção 3.2: Contas Orçamentárias Mapeadas */}
              {searchResult.contas && searchResult.contas.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-emerald-700" /> Contas Orçamentárias da Saúde ({searchResult.contas.length})
                    </span>
                    <Link
                      href="/orcamento"
                      onClick={onClose}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                    >
                      Consultar Saldos
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {searchResult.contas.slice(0, 6).map((cta, idx) => (
                      <Link
                        key={idx}
                        href="/orcamento"
                        onClick={onClose}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-xs block group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-emerald-700 transition">
                            PT {cta.programaTrabalho}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                              cta.podeReceberCredito === "SIM"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {cta.podeReceberCredito === "SIM" ? "Apta a receber" : "Bloqueada"}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 truncate" title={cta.elemento}>
                          {cta.elemento}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          Fonte: {cta.fonte}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                          <span className="text-emerald-700 font-bold">Entradas: {cta.entradas}</span>
                          <span className="text-rose-700 font-bold">Saídas: {cta.saidas}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção 4: Veículos e Motoristas da Frota Conectados */}
              {searchResult.veiculos.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Ambulance className="h-4 w-4 text-sky-600" /> Veículos da Frota Municipal Conectados ({searchResult.veiculos.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResult.veiculos.map((veic) => (
                      <div key={veic.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{veic.modelo}</span>
                          <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded text-[10px]">
                            {veic.placa}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mb-2">
                          Tipo: {veic.tipo} | Odômetro: {veic.quilometragemAtual.toLocaleString()} km
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          veic.status === "PLANTAO_24_7" ? "bg-emerald-100 text-emerald-800" :
                          veic.status === "MANUTENCAO" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {veic.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção 5: Demandas Judiciais Relacionadas */}
              {searchResult.demandas.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-rose-600" /> Demandas Judiciais Relacionadas ({searchResult.demandas.length})
                  </div>
                  <div className="space-y-2">
                    {searchResult.demandas.map((dem) => (
                      <div key={dem.id} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-rose-900">Processo: {dem.numeroProcessoJudicial}</span>
                          <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-bold">
                            {dem.prioridade}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] mb-2">{dem.relatoCaso}</p>
                        <div className="text-[11px] text-slate-500">
                          Polo Ativo: <strong className="text-slate-800">{dem.poloAtivo}</strong> | Vara: {dem.varaJuizo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Pressione <strong>ESC</strong> para fechar</span>
            <span>•</span>
            <span>Indexação relacional em tempo real</span>
          </div>
          <div className="text-slate-400">SuperGestão Saúde v2.0</div>
        </div>
      </div>
    </div>
  );
}
