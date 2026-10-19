"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  FolderTree,
  Scale,
  Sparkles,
  Layers,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  FileEdit,
  ShieldCheck,
  FilePlus2,
  Copy,
  Trash2,
  Calendar,
  User,
  History,
  RotateCcw,
  Clock,
  Printer,
  CheckCircle2,
  Building2,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Send,
} from "lucide-react";
import {
  MODELOS_LICITACAO_CATALOG,
  ModeloDocumentoProcesso,
} from "@/data/modelos-licitacao-catalog";
import { DocumentoElaborado } from "@/lib/types";
import { gerarDocumentoInicial } from "@/lib/documento-templates-service";
import { ElaboradorDocumentoModal } from "@/components/documentos/elaborador-documento-modal";
import { dataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";

// Filtragem estrita: apenas OFÍCIOS & MEMORANDOS OFICIAIS (excluindo modelos vinculados a modalidades licitatórias)
export const MODELOS_OFICIOS_MEMOS = MODELOS_LICITACAO_CATALOG.filter(
  (m: ModeloDocumentoProcesso) =>
    m.modalidade === "OFÍCIOS E MEMORANDOS" ||
    m.categoriaPrincipal === "OFÍCIOS E MEMORANDOS"
);

interface CatalogoModelosTabProps {
  onIrParaDemandas?: () => void;
}

export function CatalogoModelosTab({ onIrParaDemandas }: CatalogoModelosTabProps) {
  const [abaPrincipal, setAbaPrincipal] = useState<"modelos" | "elaborados">("modelos");
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<"TODOS" | "OFICIO" | "PARECER" | "MEMO" | "TIMBRE">("TODOS");
  const [documentoParaElaborar, setDocumentoParaElaborar] = useState<DocumentoElaborado | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Lista viva de documentos já elaborados na plataforma
  const documentosElaborados = dataStore.documentosElaborados;

  // Contadores dinâmicos por categoria
  const qtdOficios = MODELOS_OFICIOS_MEMOS.filter((m) => m.tipoPeca === "Ofício").length;
  const qtdPareceres = MODELOS_OFICIOS_MEMOS.filter((m) => m.tipoPeca.includes("Parecer") || m.titulo.includes("PARECER")).length;
  const qtdMemos = MODELOS_OFICIOS_MEMOS.filter((m) => m.tipoPeca === "Memorando de Comunicação").length;
  const qtdTimbres = MODELOS_OFICIOS_MEMOS.filter((m) => m.tipoPeca === "Timbre Oficial").length;

  // Filtros combinados de modelos (ofícios, pareceres e memorandos gerais)
  const modelosFiltrados = MODELOS_OFICIOS_MEMOS.filter((m: ModeloDocumentoProcesso) => {
    // Categoria de peça
    if (categoriaFiltro === "OFICIO" && m.tipoPeca !== "Ofício") return false;
    if (categoriaFiltro === "PARECER" && !m.tipoPeca.includes("Parecer") && !m.titulo.includes("PARECER")) return false;
    if (categoriaFiltro === "MEMO" && m.tipoPeca !== "Memorando de Comunicação") return false;
    if (categoriaFiltro === "TIMBRE" && m.tipoPeca !== "Timbre Oficial") return false;

    // Busca textual
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      return (
        m.titulo.toLowerCase().includes(termo) ||
        m.tipoPeca.toLowerCase().includes(termo) ||
        m.artigoLei.toLowerCase().includes(termo)
      );
    }

    return true;
  });

  // Filtro de documentos elaborados
  const elaboradosFiltrados = documentosElaborados.filter((d) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      d.titulo.toLowerCase().includes(termo) ||
      d.tipoPeca.toLowerCase().includes(termo) ||
      d.numeroProcesso.toLowerCase().includes(termo) ||
      d.servidorResponsavel.toLowerCase().includes(termo) ||
      d.objeto.toLowerCase().includes(termo)
    );
  });

  // Handler para duplicar documento elaborado
  const handleDuplicar = (id: string) => {
    const copia = dataStore.duplicarDocumentoElaborado(id);
    if (copia) {
      setRefreshTrigger((prev) => prev + 1);
      setDocumentoParaElaborar(copia);
    }
  };

  // Handler para excluir documento elaborado
  const handleExcluir = (id: string, titulo: string) => {
    if (
      confirm(
        `Deseja realmente remover esta cópia de "${titulo}"? O gabarito original do modelo permanece intacto no catálogo.`
      )
    ) {
      dataStore.excluirDocumentoElaborado(id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">

      {/* Banner Informativo de Ofícios & Memorandos Oficiais */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-900 via-sky-850 to-indigo-950 text-white shadow-md relative overflow-hidden border border-sky-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30">
              <FolderTree className="h-3.5 w-3.5" />
              Expediente & Comunicações Oficiais da Secretaria de Saúde
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              {MODELOS_OFICIOS_MEMOS.length} Ofícios, Pareceres & Memorandos Oficiais de Arapiraca
            </h3>
            <p className="text-xs text-sky-200/90 leading-relaxed">
              Modelos padronizados para pareceres de aceitação técnica (Art. 140 da Lei 14.133/21), comunicações internas (Memorandos), solicitações financeiras/orçamentárias (Reserva, Empenho, Pagamento, Crédito Adicional) e folhas timbradas oficiais da SMS e SG. Gabaritos em <code>.docx</code> protegidos contra sobrescrita.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 shrink-0 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xl font-black text-sky-300">{MODELOS_OFICIOS_MEMOS.length}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Gabaritos .docx</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xl font-black text-emerald-350">{documentosElaborados.length}</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Peças Elaboradas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xl font-black text-amber-300">100%</div>
              <div className="text-[10px] text-sky-200 uppercase font-semibold">Preservados</div>
            </div>
          </div>
        </div>
      </div>

      {/* SELETOR DE SUB-ABAS: GABARITOS vs DOCUMENTOS JÁ ELABORADOS */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAbaPrincipal("modelos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaPrincipal === "modelos"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FolderTree className="h-4 w-4" />
            <span>Biblioteca de Ofícios, Pareceres & Memorandos ({MODELOS_OFICIOS_MEMOS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaPrincipal("elaborados")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaPrincipal === "elaborados"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Peças Já Elaboradas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                abaPrincipal === "elaborados"
                  ? "bg-sky-500 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {documentosElaborados.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {abaPrincipal === "modelos"
            ? "Gabaritos oficiais limpos prontos para novos documentos"
            : "Histórico de peças preenchidas e salvas na plataforma"}
        </span>
      </div>

      {/* BANNER DE GARANTIA DE PRESERVAÇÃO */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold">Gabaritos Originais 100% Protegidos & Imutáveis:</span> Ao clicar em{" "}
            <strong>"Elaborar Novo"</strong>, o sistema cria uma <u>cópia de trabalho independente</u> na folha timbrada oficial. O modelo original em branco permanece intacto.
          </div>
        </div>

        {abaPrincipal === "modelos" && documentosElaborados.length > 0 && (
          <button
            onClick={() => setAbaPrincipal("elaborados")}
            className="shrink-0 px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
          >
            Ver Peças Já Elaboradas ({documentosElaborados.length}) →
          </button>
        )}
      </div>

      {/* ======================= ABA 1: MODELOS ORIGINAIS (GABARITOS DE OFÍCIOS & MEMOS) ======================= */}
      {abaPrincipal === "modelos" && (
        <div className="space-y-6">
          {/* Controles de Filtros e Busca */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Campo de Busca */}
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por título (ex: Parecer de Aceitação, Ofício de Reserva, Empenho, Pagamento, Crédito, Memo Informativo, Timbre)..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Seletor Rápido por Categoria */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCategoriaFiltro("TODOS")}
                  className={`px-3 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                    categoriaFiltro === "TODOS" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Todos ({MODELOS_OFICIOS_MEMOS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoriaFiltro("OFICIO")}
                  className={`px-3 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                    categoriaFiltro === "OFICIO" ? "bg-white text-sky-850 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ofícios ({qtdOficios})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoriaFiltro("PARECER")}
                  className={`px-3 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                    categoriaFiltro === "PARECER" ? "bg-white text-amber-850 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Pareceres ({qtdPareceres})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoriaFiltro("MEMO")}
                  className={`px-3 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                    categoriaFiltro === "MEMO" ? "bg-white text-indigo-850 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Memorandos ({qtdMemos})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoriaFiltro("TIMBRE")}
                  className={`px-3 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                    categoriaFiltro === "TIMBRE" ? "bg-white text-emerald-850 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Timbres ({qtdTimbres})
                </button>
              </div>
            </div>

            {(busca || categoriaFiltro !== "TODOS") && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Mostrando <strong>{modelosFiltrados.length}</strong> de {MODELOS_OFICIOS_MEMOS.length} modelos
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setCategoriaFiltro("TODOS");
                  }}
                  className="text-xs text-sky-700 hover:text-sky-900 underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {/* Listagem de Modelos de Ofícios e Memorandos */}
          {modelosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Nenhum modelo encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Tente buscar por outro termo ou limpar os filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {modelosFiltrados.map((mod: ModeloDocumentoProcesso) => (
                <div
                  key={mod.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="h-6 w-6 rounded-md bg-sky-100 text-sky-850 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                        {mod.ordem.toString().padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          mod.tipoPeca === "Ofício"
                            ? "bg-sky-50 text-sky-800 border border-sky-200"
                            : mod.tipoPeca === "Memorando de Comunicação"
                            ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                            : mod.tipoPeca.includes("Parecer")
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {mod.tipoPeca}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
                        {mod.titulo}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">
                        {mod.artigoLei}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[10px] text-slate-400">
                      {Math.round(mod.tamanhoBytes / 1024)} KB (.docx)
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Botão Elaborar Novo: Gera cópia de trabalho na folha timbrada */}
                      <button
                        type="button"
                        onClick={() => {
                          const doc = gerarDocumentoInicial(mod);
                          setDocumentoParaElaborar(doc);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer group"
                        title="Criar nova cópia limpa a partir deste modelo (gabarito original permanece 100% preservado)"
                      >
                        <FilePlus2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>Elaborar Novo</span>
                      </button>

                      {/* Download do gabarito original */}
                      <a
                        href={mod.downloadUrl}
                        download
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
                        title="Baixar Gabarito Original em Branco em Word (.docx)"
                      >
                        <Download className="h-3 w-3" />
                        <span>.docx</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= ABA 2: OFÍCIOS & DOCUMENTOS JÁ ELABORADOS ======================= */}
      {abaPrincipal === "elaborados" && (
        <div className="space-y-6">
          {/* Barra de Filtro de Elaborados */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por número do ofício, processo, responsável ou objeto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Exibindo <strong>{elaboradosFiltrados.length}</strong> peças elaboradas
            </div>
          </div>

          {/* Listagem de Peças Elaboradas */}
          {elaboradosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 space-y-3">
              <History className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">Nenhum documento elaborado encontrado</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Para redigir uma nova peça, acesse a <strong>Biblioteca de Ofícios & Memorandos</strong> e clique em <strong>"Elaborar Novo"</strong> no modelo desejado.
              </p>
              <button
                onClick={() => setAbaPrincipal("modelos")}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors cursor-pointer"
              >
                Explorar Gabaritos Oficiais
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {elaboradosFiltrados.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          {doc.tipoPeca}
                        </span>
                        <span className="font-mono text-xs text-slate-500 font-semibold">
                          {doc.numeroProcesso}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          doc.status === "ASSINADO"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : doc.status === "CONCLUIDO"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {doc.titulo}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {doc.objeto}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Responsável: <strong className="text-slate-700">{doc.servidorResponsavel}</strong> ({doc.cargoServidor})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Última Edição: <strong className="text-slate-700">{formatDate(doc.updatedAt)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações da Peça Elaborada */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDuplicar(doc.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Duplicar esta peça para gerar uma nova versão independente"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleExcluir(doc.id, doc.titulo)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir apenas esta cópia (o gabarito original permanece intacto)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDocumentoParaElaborar(doc)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      <FileEdit className="h-3.5 w-3.5" />
                      <span>Continuar Editando</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE ELABORAÇÃO DO DOCUMENTO OFICIAL NA PLATAFORMA */}
      {documentoParaElaborar && (
        <ElaboradorDocumentoModal
          documentoInicial={documentoParaElaborar}
          isOpen={true}
          onClose={() => setDocumentoParaElaborar(null)}
          onSalvo={() => {
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
