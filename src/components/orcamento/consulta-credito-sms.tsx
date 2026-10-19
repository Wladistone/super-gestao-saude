"use client";

import { useState, useMemo } from "react";
import { dataStore } from "@/lib/data-store";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export function ConsultaCreditoSMS() {
  const cadastros = dataStore.cadastrosCreditoSMS;
  const contas = dataStore.contasCreditoSMS;
  const controle = dataStore.creditosSMS;

  const [ptSelecionado, setPtSelecionado] = useState<string>(
    String(cadastros.programasTrabalho[0] || "2096")
  );
  const [elementoSelecionado, setElementoSelecionado] = useState<string>(
    cadastros.elementos[2] || "3.3.9.0.30.00.00.00.0000"
  );
  const [fonteSelecionada, setFonteSelecionada] = useState<string>(
    cadastros.fontes[1] || "15001001002"
  );

  // Encontra a conta no catálogo de CONTAS
  const contaEncontrada = useMemo(() => {
    return contas.find(
      (c) =>
        String(c.programaTrabalho).trim() === String(ptSelecionado).trim() &&
        String(c.elemento).trim() === String(elementoSelecionado).trim() &&
        String(c.fonte).trim() === String(fonteSelecionada).trim()
    );
  }, [contas, ptSelecionado, elementoSelecionado, fonteSelecionada]);

  // Histórico de movimentações vinculadas (tanto como Origem quanto como Destino)
  const historico = useMemo(() => {
    return controle.filter(
      (m) =>
        (String(m.programaOrigem).trim() === String(ptSelecionado).trim() &&
          String(m.elementoOrigem).trim() === String(elementoSelecionado).trim() &&
          String(m.fonteOrigem).trim() === String(fonteSelecionada).trim()) ||
        (String(m.programaDestino).trim() === String(ptSelecionado).trim() &&
          String(m.elementoDestino).trim() === String(elementoSelecionado).trim() &&
          String(m.fonteDestino).trim() === String(fonteSelecionada).trim())
    );
  }, [controle, ptSelecionado, elementoSelecionado, fonteSelecionada]);

  // Total financeiro de entradas e saídas
  const totaisFinanceiros = useMemo(() => {
    let totalEntradasValor = 0;
    let totalSaidasValor = 0;

    historico.forEach((h) => {
      const isDestino =
        String(h.programaDestino).trim() === String(ptSelecionado).trim() &&
        String(h.elementoDestino).trim() === String(elementoSelecionado).trim() &&
        String(h.fonteDestino).trim() === String(fonteSelecionada).trim();

      const isOrigem =
        String(h.programaOrigem).trim() === String(ptSelecionado).trim() &&
        String(h.elementoOrigem).trim() === String(elementoSelecionado).trim() &&
        String(h.fonteOrigem).trim() === String(fonteSelecionada).trim();

      if (isDestino) totalEntradasValor += h.valor;
      if (isOrigem) totalSaidasValor += h.valor;
    });

    return { totalEntradasValor, totalSaidasValor };
  }, [historico, ptSelecionado, elementoSelecionado, fonteSelecionada]);

  const podeReceber = contaEncontrada
    ? contaEncontrada.podeReceberCredito === "SIM"
    : true;

  return (
    <div className="space-y-6">
      {/* Bloco de Seleção dos 3 Parâmetros da Planilha */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Consulta de Créditos Orçamentários
              </h3>
              <p className="text-xs text-slate-500">
                Aba interativa da planilha: selecione os parâmetros para apurar situação, saldos e histórico da dotação.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md self-start sm:self-auto">
            Fórmula de Elegibilidade Ativa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Programa de Trabalho */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. Programa de Trabalho
            </label>
            <select
              value={ptSelecionado}
              onChange={(e) => setPtSelecionado(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
            >
              {cadastros.programasTrabalho.map((pt) => (
                <option key={pt} value={String(pt)}>
                  {pt}
                </option>
              ))}
            </select>
          </div>

          {/* Elemento de Despesa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2. Elemento de Despesa
            </label>
            <select
              value={elementoSelecionado}
              onChange={(e) => setElementoSelecionado(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
            >
              {cadastros.elementos.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </div>

          {/* Fonte de Recursos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              3. Fonte de Recursos
            </label>
            <select
              value={fonteSelecionada}
              onChange={(e) => setFonteSelecionada(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
            >
              {cadastros.fontes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resultados da Conta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status / Pode Receber Crédito? */}
        <div
          className={`rounded-2xl p-4.5 border transition-all ${
            podeReceber
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-rose-50/70 border-rose-200 text-rose-950"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Pode Receber Crédito?
            </span>
            {podeReceber ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600" />
            )}
          </div>
          <div className="text-2xl font-black tracking-tight">
            {podeReceber ? "SIM" : "NÃO"}
          </div>
          <p className="text-[11px] mt-1 leading-snug text-slate-600">
            {podeReceber
              ? "Conta apta a receber créditos suplementares ou transposições."
              : "Bloqueada: Esta conta já cedeu recursos como origem (vedado receber crédito posterior)."}
          </p>
        </div>

        {/* Situação e Fornecimento */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Situação da Conta
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">
              {contaEncontrada?.situacao || "ABERTA"}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            Pode Fornecer Crédito: <span className="text-emerald-700 font-black">SIM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Status cadastral ativo no orçamento da Secretaria Municipal de Saúde.
          </p>
        </div>

        {/* Movimentações de Entrada */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
              Entradas (Destino)
            </span>
            <span className="text-lg font-black font-mono text-emerald-700">
              {contaEncontrada?.entradas ?? 0}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-800">
            {formatCurrency(totaisFinanceiros.totalEntradasValor)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Última entrada: {contaEncontrada?.ultimaEntrada || "Nenhuma"}
          </div>
        </div>

        {/* Movimentações de Saída */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />
              Saídas (Origem)
            </span>
            <span className="text-lg font-black font-mono text-rose-700">
              {contaEncontrada?.saidas ?? 0}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-rose-800">
            {formatCurrency(totaisFinanceiros.totalSaidasValor)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Última saída: {contaEncontrada?.ultimaSaida || "Nenhuma"}
          </div>
        </div>
      </div>

      {/* Histórico da Conta */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-700" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              HISTÓRICO DA CONTA ({historico.length} movimentações encontradas)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Dotação: PT {ptSelecionado} &bull; Fonte {fonteSelecionada}
          </span>
        </div>

        {historico.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhuma movimentação de crédito vinculada a esta combinação de Programa, Elemento e Fonte até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-mono">Nº</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Papel Nesta Conta</th>
                  <th className="py-2.5 px-3 font-mono text-right">Valor</th>
                  <th className="py-2.5 px-3">Solicitante</th>
                  <th className="py-2.5 px-3">Contraparte</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historico.map((m) => {
                  const isDestino =
                    String(m.programaDestino).trim() === String(ptSelecionado).trim() &&
                    String(m.elementoDestino).trim() === String(elementoSelecionado).trim() &&
                    String(m.fonteDestino).trim() === String(fonteSelecionada).trim();

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {m.numero}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {m.dataCredito}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {m.tipoCredito}
                      </td>
                      <td className="py-2 px-3">
                        {isDestino ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <ArrowDownRight className="h-3 w-3" />
                            DESTINO (+Entrada)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                            <ArrowUpRight className="h-3 w-3" />
                            ORIGEM (-Saída)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                        {formatCurrency(m.valor)}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {m.solicitante}
                      </td>
                      <td className="py-2 px-3 text-[11px] font-mono text-slate-600">
                        {isDestino ? (
                          <span>De: PT {m.programaOrigem} / {m.fonteOrigem}</span>
                        ) : (
                          <span>Para: PT {m.programaDestino} / {m.fonteDestino}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === "OK"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 max-w-xs truncate">
                        {m.observacoes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
