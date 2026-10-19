"use client";

import { dataStore } from "@/lib/data-store";
import { FolderTree, Layers, Wallet, Users } from "lucide-react";

export function CadastrosSMSView() {
  const cadastros = dataStore.cadastrosCreditoSMS;

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-slate-900">
          Tabelas de Apoio e Cadastros Oficiais (Aba CADASTROS)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Parâmetros mestres extraídos da planilha original para alimentação dos lançamentos de créditos da SMS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Programas de Trabalho */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-slate-900">Programas de Trabalho</h4>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {cadastros.programasTrabalho.length} itens
            </span>
          </div>
          <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs font-mono">
            {cadastros.programasTrabalho.map((pt, i) => (
              <div key={i} className="py-2 px-1 flex items-center justify-between hover:bg-slate-50">
                <span className="font-bold text-slate-800">{pt}</span>
                <span className="text-[10px] text-slate-400">SMS Arapiraca</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elementos de Despesa */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-slate-900">Elementos de Despesa</h4>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {cadastros.elementos.length} itens
            </span>
          </div>
          <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs font-mono">
            {cadastros.elementos.map((el, i) => (
              <div key={i} className="py-2 px-1 hover:bg-slate-50">
                <div className="font-bold text-slate-800 text-[11px] truncate" title={el}>
                  {el}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fontes de Recursos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-slate-900">Fontes de Recursos</h4>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {cadastros.fontes.length} itens
            </span>
          </div>
          <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs font-mono">
            {cadastros.fontes.map((f, i) => (
              <div key={i} className="py-2 px-1 flex items-center justify-between hover:bg-slate-50">
                <span className="font-bold text-slate-800">{f}</span>
                <span className="text-[10px] text-slate-400">SUS/Orçamento</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solicitantes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-slate-900">Solicitantes</h4>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {cadastros.solicitantes.length} pessoas
            </span>
          </div>
          <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
            {cadastros.solicitantes.map((s, i) => (
              <div key={i} className="py-2 px-1 flex items-center justify-between hover:bg-slate-50">
                <span className="font-bold text-slate-800">{s}</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Autorizado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
