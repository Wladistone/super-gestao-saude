"use client";

import { Breadcrumbs } from "./breadcrumbs";
import { Search, Bell, PlusCircle, AlertTriangle, Clock, ShieldCheck, UserCheck, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data-store";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNovoProcesso?: () => void;
  onOpenNovaOrdem?: () => void;
  onOpenCentralNotificacoes?: () => void;
}

export function Header({
  onOpenSearch,
  onOpenNovoProcesso,
  onOpenNovaOrdem,
  onOpenCentralNotificacoes,
}: HeaderProps) {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [qtdPendentes, setQtdPendentes] = useState(0);
  const alertas = dataStore.obterAlertasPreventivos();

  useEffect(() => {
    const atualizar = () => {
      setQtdPendentes(dataStore.obterQtdCadastrosPendentes());
    };
    atualizar();

    window.addEventListener("supergestao_cadastro_atualizado", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("supergestao_cadastro_atualizado", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm gap-4">
      {/* Lado Esquerdo: Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-[180px] shrink-0">
        <Breadcrumbs />
      </div>

      {/* Centro: Busca 360º Omnipresente Centralizada */}
      <div className="flex-1 flex justify-center max-w-xl mx-auto px-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all shadow-2xs group w-full max-w-md justify-between cursor-pointer"
          title="Abrir Busca 360º Omnipresente (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-700">Busca 360º Omnipresente</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded font-mono text-slate-600 shadow-2xs font-bold">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Lado Direito: Nova Demanda e Alertas no Cantinho Direito */}
      <div className="flex items-center justify-end gap-3 min-w-[180px] shrink-0">
        {/* Chip de Cadastros Pendentes da SG */}
        {qtdPendentes > 0 && (
          <Link
            href="/cadastro"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 transition-all text-xs font-bold shadow-2xs group"
            title="Existem cadastros de servidores pendentes para sua avaliação na SG"
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-600 group-hover:scale-110 transition-transform animate-pulse" />
            <span>{qtdPendentes} Cadastros Pendentes</span>
          </Link>
        )}

        {/* Botão Central de Notificações por E-mail */}
        {onOpenCentralNotificacoes && (
          <button
            onClick={onOpenCentralNotificacoes}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
            title="Abrir Central de Teste e Disparo de Notificações por E-mail"
          >
            <Mail className="h-3.5 w-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
            <span>Notificação por E-mail</span>
          </button>
        )}

        {/* Botão Nova Demanda (anteriormente Novo Processo) */}
        {onOpenNovoProcesso && (
          <button
            onClick={onOpenNovoProcesso}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Criar Nova Demanda / Processo"
          >
            <PlusCircle className="h-3.5 w-3.5 text-sky-400" />
            <span>Nova Demanda</span>
          </button>
        )}

        {/* Dropdown de Alertas Preventivos no Cantinho do Lado Direito */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Alertas de Vigência e Prazos"
          >
            <Bell className="h-4 w-4" />
            {(alertas.totalAlertas > 0 || qtdPendentes > 0) && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {alertas.totalAlertas + (qtdPendentes > 0 ? 1 : 0)}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-xs text-slate-900">
                    Alertas Preventivos de Gestão ({alertas.totalAlertas + (qtdPendentes > 0 ? 1 : 0)})
                  </h3>
                </div>
                <button
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Alerta de Cadastros Pendentes da SG */}
              {qtdPendentes > 0 && (
                <div className="mt-2.5 mb-1 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold text-xs text-amber-950">
                          {qtdPendentes} novos servidores aguardando SG
                        </div>
                        <div className="text-[10px] text-amber-800">
                          Avalie para liberar visualização e edição
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/cadastro"
                      onClick={() => setShowAlertsDropdown(false)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shadow-2xs transition-colors shrink-0"
                    >
                      Avaliar
                    </Link>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto text-xs py-1">
                {/* Demandas Judiciais Fatais */}
                {alertas.alertasJudiciais.map((alerta) => (
                  <div key={alerta.demanda.id} className="py-2.5 px-1 flex items-start gap-2.5">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
                    <div>
                      <div className="font-semibold text-rose-700">
                        Judicial: {alerta.demanda.numeroProcessoJudicial}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {alerta.demanda.relatoCaso}
                      </p>
                      <div className="text-[10px] font-medium text-rose-600 mt-0.5">
                        Prazo fatal: {alerta.horas > 0 ? `${alerta.horas} horas restantes` : "VENCIDO"}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Contratos com Vigência Crítica */}
                {alertas.alertasContratos.map((alerta) => (
                  <div key={alerta.contrato.id} className="py-2.5 px-1 flex items-start gap-2.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">
                        {alerta.contrato.numeroContrato} - {alerta.dias} dias para vencer
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {alerta.contrato.objeto}
                      </p>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                        Saldo restante: {alerta.percentualSaldo}%
                      </span>
                    </div>
                  </div>
                ))}

                {/* Validade de CNH */}
                {alertas.alertasCNH.map((alerta) => (
                  <div key={alerta.motorista.id} className="py-2.5 px-1 flex items-start gap-2.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">
                        CNH de Motorista: {alerta.motorista.nome}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Validade expira em {alerta.dias} dias (Cat. {alerta.motorista.categoriaCnh})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
