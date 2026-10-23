"use client";

import { Breadcrumbs } from "./breadcrumbs";
import { Search, Bell, PlusCircle, AlertTriangle, Clock, ShieldCheck, UserCheck, Mail } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const alertas = dataStore.obterAlertasPreventivos();

  useEffect(() => {
    const carregar = () => {
      try {
        const salvo = localStorage.getItem("supergestao_usuario_logado");
        if (salvo) setUsuarioLogado(JSON.parse(salvo));
      } catch {}
    };
    carregar();

    const atualizar = () => {
      setQtdPendentes(dataStore.obterQtdCadastrosPendentes());
      carregar();
    };
    atualizar();

    window.addEventListener("supergestao_cadastro_atualizado", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("supergestao_cadastro_atualizado", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  const isCoordenadoraGeral = useMemo(() => {
    if (!usuarioLogado) return true;
    const email = (usuarioLogado.email || "").toLowerCase().trim();
    const id = (usuarioLogado.id || "").trim();
    const nome = (usuarioLogado.nome || "").toLowerCase().trim();

    return (
      email === "will2026@gmail.com" ||
      id === "usr-coord-geral" ||
      nome.includes("willianne")
    );
  }, [usuarioLogado]);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs gap-4">
      {/* Lado Esquerdo: Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-[180px] shrink-0">
        <Breadcrumbs />
      </div>

      {/* Centro: Busca Rápida Unificada */}
      <div className="flex-1 flex justify-center max-w-xl mx-auto px-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 text-xs font-medium transition-all shadow-2xs group w-full max-w-md justify-between cursor-pointer"
          title="Pesquisar processos, demandas e documentos (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
            <span>Pesquisar por palavra-chave, número ou setor...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-mono text-slate-500 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Lado Direito: Ações Essenciais */}
      <div className="flex items-center justify-end gap-3 min-w-[180px] shrink-0">
        {/* Botão Nova Demanda / Solicitação */}
        {onOpenNovoProcesso && (
          <button
            onClick={onOpenNovoProcesso}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-all shadow-xs hover:shadow-sm cursor-pointer"
            title="Criar nova demanda ou solicitação"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nova Demanda</span>
          </button>
        )}

        {/* Notificações e Prazos */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notificações e avisos de gestão"
          >
            <Bell className="h-4 w-4" />
            {(alertas.totalAlertas > 0 || (isCoordenadoraGeral && qtdPendentes > 0)) && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-xs text-slate-900">
                    Alertas Preventivos de Gestão ({alertas.totalAlertas + (isCoordenadoraGeral && qtdPendentes > 0 ? 1 : 0)})
                  </h3>
                </div>
                <button
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Alerta de Cadastros Pendentes da SG (Exclusivo da Coordenadora Geral de Gestão) */}
              {isCoordenadoraGeral && qtdPendentes > 0 && (
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
