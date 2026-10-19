"use client";

import { useState } from "react";
import { AlertTriangle, Clock, ShieldAlert, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { dataStore } from "@/lib/data-store";

export function VigenciaAlertBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const alertas = dataStore.obterAlertasPreventivos();

  if (alertas.totalAlertas === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 shadow-sm text-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Alerta Preventivo de Vigências & Prazos Críticos ({alertas.totalAlertas})
              </h4>
              <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                Lei 14.133/2021 & Compliance
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Existem {alertas.alertasContratos.length} contratos/atas em faixa de expiração (120, 90, 60 ou 30 dias),{" "}
              {alertas.alertasJudiciais.length} prazos fatais de liminares e {alertas.alertasCNH.length} CNHs a renovar.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <span>{isExpanded ? "Recolher Detalhes" : "Ver Ações Preventivas"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-amber-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in">
          {/* Contratos com prazo crítico */}
          <div className="p-3 bg-white/90 rounded-lg border border-amber-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" /> Contratos a Vencer
            </div>
            <div className="space-y-1.5 divide-y divide-slate-100">
              {alertas.alertasContratos.map((alerta) => (
                <div key={alerta.contrato.id} className="pt-1.5 first:pt-0">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">{alerta.contrato.numeroContrato}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      alerta.dias <= 30 ? "bg-rose-100 text-rose-800 font-bold" : "bg-amber-100 text-amber-800"
                    }`}>
                      {alerta.dias} dias
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{alerta.contrato.objeto}</div>
                  <div className="text-[10px] text-sky-700 font-medium mt-0.5">
                    💡 Recomendado: Abrir Termo Aditivo de Prazo ou novo certame
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liminares e Decisões Judiciais */}
          <div className="p-3 bg-white/90 rounded-lg border border-rose-200 space-y-2">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" /> Prazos Fatais Judiciais
            </div>
            <div className="space-y-1.5 divide-y divide-slate-100">
              {alertas.alertasJudiciais.map((alerta) => (
                <div key={alerta.demanda.id} className="pt-1.5 first:pt-0">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-rose-800 text-[11px] truncate">{alerta.demanda.numeroProcessoJudicial}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      {alerta.horas > 0 ? `${alerta.horas}h` : "Vencido"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">{alerta.demanda.relatoCaso}</div>
                  <Link
                    href="/judicializacao"
                    className="text-[10px] text-rose-700 hover:underline font-bold mt-0.5 inline-flex items-center gap-1"
                  >
                    Atender no Painel Jurídico <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Validade de CNHs e Frota */}
          <div className="p-3 bg-white/90 rounded-lg border border-sky-200 space-y-2">
            <div className="font-bold text-sky-950 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-sky-600" /> CNHs da Frota de Transportes
            </div>
            <div className="space-y-1.5 divide-y divide-slate-100">
              {alertas.alertasCNH.map((alerta) => (
                <div key={alerta.motorista.id} className="pt-1.5 first:pt-0">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">{alerta.motorista.nome}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                      {alerta.dias} dias
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    CNH Cat. {alerta.motorista.categoriaCnh} - Matrícula {alerta.motorista.matricula}
                  </div>
                  <div className="text-[10px] text-sky-700 font-medium mt-0.5">
                    💡 Notificar condutor para renovação preventiva
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
