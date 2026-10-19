"use client";

import { useState } from "react";
import {
  X,
  Mail,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  DadosNotificacaoDemanda,
  gerarEmailDemanda,
  gerarLinkEmail,
} from "@/lib/notificacoes-utils";

interface CentralNotificacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CentralNotificacoesModal({
  isOpen,
  onClose,
}: CentralNotificacoesModalProps) {
  // Modelos de servidores para teste rápido
  const servidoresTeste = [
    {
      id: "wladi",
      nome: "Wladistone Pereira (Luma do Cururu)",
      email: "hellywladi87@gmail.com",
      superintendencia: "SAS",
      cargo: "Diretora da Atenção Primária à Saúde",
      demandaNumero: "DEM-2025/SAS-001",
      objeto: "Aquisição de tiras reagentes para glicemia capilar e lancetas descartáveis.",
      modalidade: "Registro de Preços - Aquisição",
      artigoLei: "Art. 82 a 86 (Lei Federal nº 14.133/2021)",
      processo: "PA-2025/00104",
    },
    {
      id: "juliana",
      nome: "Dra. Juliana Ferreira Lima",
      email: "juliana.lima@saude.gov.br",
      superintendencia: "SAS",
      cargo: "Médica Especialista - Regulação",
      demandaNumero: "DEM-2025/SAS-005",
      objeto: "Aquisição de bolsas de nutrição parenteral total (NPT) individualizadas.",
      modalidade: "Registro de Preços - Aquisição",
      artigoLei: "Art. 82 a 86 (Lei Federal nº 14.133/2021)",
      processo: "PA-2025/00234",
    },
    {
      id: "thiago",
      nome: "Thiago Albuquerque Cavalcante",
      email: "thiago.cavalcante@saude.gov.br",
      superintendencia: "SUVIG",
      cargo: "Fiscal Sanitário e Epidemiológico",
      demandaNumero: "DEM-2025/SUVIG-002",
      objeto: "Aquisição de testes rápidos de arboviroses (Dengue, Zika, Chikungunya).",
      modalidade: "Pregão Eletrônico",
      artigoLei: "Art. 34 (Lei Federal nº 14.133/2021)",
      processo: "PA-2025/00389",
    },
  ];

  const [servidorSelecionadoId, setServidorSelecionadoId] = useState("wladi");
  const [emailCustom, setEmailCustom] = useState("hellywladi87@gmail.com");
  const [nomeCustom, setNomeCustom] = useState("Wladistone Pereira (Luma do Cururu)");
  const [copiadoEmail, setCopiadoEmail] = useState(false);

  if (!isOpen) return null;

  const servidorAtual = servidoresTeste.find((s) => s.id === servidorSelecionadoId) || servidoresTeste[0];

  const handleSelecionarServidor = (s: typeof servidoresTeste[0]) => {
    setServidorSelecionadoId(s.id);
    setEmailCustom(s.email);
    setNomeCustom(s.nome);
  };

  const dadosNotif: DadosNotificacaoDemanda = {
    servidorNome: nomeCustom,
    servidorEmail: emailCustom,
    numeroDemanda: servidorAtual.demandaNumero,
    superintendencia: `${servidorAtual.superintendencia} - Atenção à Saúde`,
    objeto: servidorAtual.objeto,
    coordenadoraNome: "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG)",
    modalidadeNome: servidorAtual.modalidade,
    artigoLei: servidorAtual.artigoLei,
    numeroProcesso: servidorAtual.processo,
    artefatos: [
      "DFD - Documento de Formalização da Demanda",
      "ETP - Estudo Técnico Preliminar",
      "TR - Termo de Referência",
      "Matriz de Gerenciamento de Riscos",
    ],
  };

  const linkEmail = gerarLinkEmail(dadosNotif);
  const emailObj = gerarEmailDemanda(dadosNotif);

  const handleCopiarEmail = () => {
    navigator.clipboard.writeText(`Assunto: ${emailObj.assunto}\n\n${emailObj.corpo}`);
    setCopiadoEmail(true);
    setTimeout(() => setCopiadoEmail(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-950/80 border border-sky-700 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-sky-400" />
                Validação de Usabilidade em Tempo Real
              </span>
              <span className="text-[10px] font-bold text-slate-300 bg-slate-950/80 border border-slate-700 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Governança SMS / SG
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Central de Disparo & Confirmação: Notificações por E-mail Institucional
            </h3>
            <p className="text-xs text-sky-200/90 mt-0.5">
              Valide o disparo de e-mails automáticos emitidos após a conclusão do enquadramento pela Coordenadora Geral da SG.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Seleção Rápida de Perfil / Servidor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Selecione o Modelo de Servidor para Validar o Envio do E-mail:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {servidoresTeste.map((s) => {
                const ativo = s.id === servidorSelecionadoId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelecionarServidor(s)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      ativo
                        ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-500/20 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {s.nome.split(" ")[0]} ({s.superintendencia})
                      </span>
                      {ativo && <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate font-mono">
                      {s.email}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {s.cargo}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campos Editáveis para Testar Qualquer E-mail */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Destinatário Ativo do E-mail (Você pode editar e informar o e-mail de teste):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nome do Servidor:
                </label>
                <input
                  type="text"
                  value={nomeCustom}
                  onChange={(e) => setNomeCustom(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  E-mail Institucional:
                </label>
                <input
                  type="email"
                  value={emailCustom}
                  onChange={(e) => setEmailCustom(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-sky-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Card E-mail */}
          <div className="p-5 rounded-2xl border-2 border-sky-300 bg-white shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  Notificação Formal via Cliente de E-mail (mailto:)
                </span>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-sky-100 text-sky-900 border border-sky-200">
                  {emailCustom}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                <strong>Assunto:</strong> {emailObj.assunto}
                {"\n\n"}
                {emailObj.corpo}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <a
                href={linkEmail}
                className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Mail className="h-4 w-4" />
                <span>Abrir Cliente de E-mail (mailto:)</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopiarEmail}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                <span>{copiadoEmail ? "Conteúdo Copiado!" : "Copiar Texto do E-mail"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Disparo de notificação oficial compatível com qualquer cliente de correio eletrônico corporativo (Outlook, Gmail, Thunderbird).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer"
          >
            Fechar Central
          </button>
        </div>
      </div>
    </div>
  );
}
