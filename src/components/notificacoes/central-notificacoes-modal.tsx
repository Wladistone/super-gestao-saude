"use client";

import { useState, useEffect } from "react";
import {
  X,
  Mail,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Send,
  History,
  Settings,
  Eye,
  Calendar,
  User,
  Inbox,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  DadosNotificacaoDemanda,
  gerarEmailDemanda,
  gerarLinkEmail,
} from "@/lib/notificacoes-utils";
import { dataStore } from "@/lib/data-store";
import { RegistroEmailEnviado } from "@/lib/types";
import {
  testarConexaoSmtpAction,
  salvarConfiguracaoSmtpAction,
  obterStatusConfiguracaoEmailAction,
} from "@/actions/super-gestao-actions";

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

  const [abaAtiva, setAbaAtiva] = useState<"historico" | "testar" | "config">("historico");
  const [servidorSelecionadoId, setServidorSelecionadoId] = useState("wladi");
  const [emailCustom, setEmailCustom] = useState("hellywladi87@gmail.com");
  const [nomeCustom, setNomeCustom] = useState("Wladistone Pereira (Luma do Cururu)");
  const [copiadoEmail, setCopiadoEmail] = useState(false);
  const [emailsEnviados, setEmailsEnviados] = useState<RegistroEmailEnviado[]>([]);
  const [emailSelecionadoVisualizar, setEmailSelecionadoVisualizar] = useState<RegistroEmailEnviado | null>(null);
  const [enviandoTeste, setEnviandoTeste] = useState(false);
  const [feedbackTeste, setFeedbackTeste] = useState<string | null>(null);

  // Estados de Configuração SMTP Interativa
  const [smtpProvedor, setSmtpProvedor] = useState<"gmail" | "office365" | "custom">("gmail");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("SuperGestão Saúde <sg.saude@municipio.gov.br>");
  const [testandoSmtp, setTestandoSmtp] = useState(false);
  const [salvandoSmtp, setSalvandoSmtp] = useState(false);
  const [resultadoTesteSmtp, setResultadoTesteSmtp] = useState<{ success: boolean; message: string } | null>(null);
  const [statusSmtpAtual, setStatusSmtpAtual] = useState<{ configurado: boolean; modo: string; host?: string; remetente?: string } | null>(null);

  const carregarStatusSmtp = async () => {
    try {
      const res = await obterStatusConfiguracaoEmailAction();
      setStatusSmtpAtual(res);
      if (res.host && !res.host.includes("Modo")) setSmtpHost(res.host);
      if (res.port) setSmtpPort(res.port);
      if (res.remetente) setSmtpFrom(res.remetente);
    } catch {
      // ignore
    }
  };

  const handleMudarProvedor = (prov: "gmail" | "office365" | "custom") => {
    setSmtpProvedor(prov);
    setResultadoTesteSmtp(null);
    if (prov === "gmail") {
      setSmtpHost("smtp.gmail.com");
      setSmtpPort(587);
    } else if (prov === "office365") {
      setSmtpHost("smtp.office365.com");
      setSmtpPort(587);
    }
  };

  const handleTestarSmtp = async () => {
    if (!smtpHost.trim() || !smtpUser.trim() || !smtpPass.trim()) {
      setResultadoTesteSmtp({
        success: false,
        message: "Por favor, informe o Host, o E-mail de usuário e a Senha de Aplicativo para testar.",
      });
      return;
    }
    setTestandoSmtp(true);
    setResultadoTesteSmtp(null);
    try {
      const res = await testarConexaoSmtpAction({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPass,
      });
      setResultadoTesteSmtp(res);
    } catch (err: any) {
      setResultadoTesteSmtp({
        success: false,
        message: `Erro ao testar conexão: ${err?.message || err}`,
      });
    } finally {
      setTestandoSmtp(false);
    }
  };

  const handleSalvarSmtp = async () => {
    if (!smtpHost.trim() || !smtpUser.trim() || !smtpPass.trim()) {
      setResultadoTesteSmtp({
        success: false,
        message: "Por favor, preencha o Host, o Usuário e a Senha para salvar no .env.local.",
      });
      return;
    }
    setSalvandoSmtp(true);
    try {
      const res = await salvarConfiguracaoSmtpAction({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom || `SuperGestão Saúde <${smtpUser}>`,
      });
      setResultadoTesteSmtp(res);
      await carregarStatusSmtp();
    } catch (err: any) {
      setResultadoTesteSmtp({
        success: false,
        message: `Erro ao salvar: ${err?.message || err}`,
      });
    } finally {
      setSalvandoSmtp(false);
    }
  };

  // Carregar histórico e status SMTP
  const carregarEmails = () => {
    const logs = dataStore.obterEmailsEnviados();
    setEmailsEnviados([...logs]);
  };

  useEffect(() => {
    if (!isOpen) return;
    carregarEmails();
    carregarStatusSmtp();

    const handler = () => carregarEmails();
    window.addEventListener("supergestao_emails_atualizados", handler);
    return () => window.removeEventListener("supergestao_emails_atualizados", handler);
  }, [isOpen]);

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

  const handleDispararEmailAutomaticoTeste = async () => {
    setEnviandoTeste(true);
    setFeedbackTeste(null);
    try {
      const resp = await fetch("/api/notificacoes/enviar-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "ENQUADRAMENTO_DEMANDA",
          dados: {
            servidorNome: nomeCustom,
            servidorEmail: emailCustom,
            numeroDemanda: servidorAtual.demandaNumero,
            superintendencia: `${servidorAtual.superintendencia} - Atenção à Saúde`,
            objeto: servidorAtual.objeto,
            coordenadoraNome: "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG)",
            modalidadeNome: servidorAtual.modalidade,
            artigoLei: servidorAtual.artigoLei,
            numeroProcesso: servidorAtual.processo,
            artefatos: dadosNotif.artefatos,
          },
        }),
      });

      const json = await resp.json();
      if (json.success) {
        setFeedbackTeste(`E-mail disparado com sucesso! Modo: ${json.modo.toUpperCase()} (ID: ${json.messageId})`);
        carregarEmails();
      } else {
        setFeedbackTeste(`Falha ao disparar: ${json.error || "Erro desconhecido"}`);
      }
    } catch {
      setFeedbackTeste("Erro na conexão com o serviço de e-mail.");
    } finally {
      setEnviandoTeste(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-900/80 border border-sky-700 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-sky-400" />
                Módulo Oficial de Notificações da SG
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Disparo Automático Ativo
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Central de E-mails & Notificações Automáticas da SMS
            </h3>
            <p className="text-xs text-sky-200/90 mt-0.5">
              Acompanhamento em tempo real dos e-mails disparados ao autorizar cadastros e ao enquadrar demandas nas modalidades licitatórias.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAbaAtiva("historico")}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              abaAtiva === "historico"
                ? "border-sky-600 text-sky-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Histórico de E-mails Enviados ({emailsEnviados.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("testar")}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              abaAtiva === "testar"
                ? "border-sky-600 text-sky-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Simulador & Disparo Manual de Teste</span>
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("config")}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              abaAtiva === "config"
                ? "border-sky-600 text-sky-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Configuração do Provedor SMTP</span>
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* ABA 1: HISTÓRICO DE E-MAILS ENVIADOS */}
          {abaAtiva === "historico" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Auditoria de E-mails Disparados pela Coordenação Geral
                  </h4>
                  <p className="text-slate-500 text-xs">
                    Todos os e-mails gerados após autorização de cadastro ou enquadramento de demanda ficam registrados aqui com data, hora e destinatário.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={carregarEmails}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>

              {emailsEnviados.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Inbox className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">Nenhum e-mail disparado nesta sessão ainda.</p>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    Assim que a Coordenadora Geral de Gestão autorizar um cadastro no módulo <strong>/cadastro</strong> ou realizar um enquadramento no módulo <strong>/tramitacao</strong>, o registro aparecerá imediatamente aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {emailsEnviados.map((em) => {
                    const isCadastro = em.tipo === "AUTORIZACAO_CADASTRO";
                    return (
                      <div
                        key={em.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                isCadastro
                                  ? "bg-purple-50 text-purple-800 border-purple-200"
                                  : "bg-sky-50 text-sky-800 border-sky-200"
                              }`}
                            >
                              {isCadastro ? "Autorização de Cadastro" : "Enquadramento Licitatório"}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                              {em.modo === "smtp" ? "Enviado via SMTP Real" : "Auditado e Registrado"}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(em.dataHoraEnvio).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {em.assunto}
                          </div>
                          <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-400" />
                              Destinatário: <strong className="text-slate-800">{em.destinatarioNome}</strong> ({em.destinatarioEmail})
                            </span>
                            <span>•</span>
                            <span>Autor: <strong>{em.autorNome}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEmailSelecionadoVisualizar(em)}
                            className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Visualizar E-mail</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ABA 2: SIMULADOR & DISPARO DE TESTE */}
          {abaAtiva === "testar" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Selecione um Modelo de Servidor para Testar:
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
                  Destinatário Personalizado do Teste:
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
                      Prévia da Mensagem Oficial
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-sky-100 text-sky-900 border border-sky-200">
                      {emailCustom}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    <strong>Assunto:</strong> {emailObj.assunto}
                    {"\n\n"}
                    {emailObj.corpo}
                  </div>
                </div>

                {feedbackTeste && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-xs flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{feedbackTeste}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleDispararEmailAutomaticoTeste}
                    disabled={enviandoTeste}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{enviandoTeste ? "Disparando..." : "Testar Disparo no Servidor"}</span>
                  </button>

                  <a
                    href={linkEmail}
                    className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Abrir Cliente Local (mailto:)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopiarEmail}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copiadoEmail ? "Conteúdo Copiado!" : "Copiar Texto"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: CONFIGURAÇÃO SMTP INTERATIVA */}
          {abaAtiva === "config" && (
            <div className="space-y-5">
              {/* Status Atual do Sistema */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-sky-950">
                    <ShieldCheck className="h-5 w-5 text-sky-600" />
                    <span>Status de Envio de E-mails Institucionais</span>
                  </div>
                  <p className="text-xs text-sky-800">
                    Modo em execução:{" "}
                    <strong className="text-slate-900 font-mono">
                      {statusSmtpAtual?.configurado ? "SMTP REAL ATIVO" : "MODO AUTÔNOMO (AUDITORIA INTERNA)"}
                    </strong>
                    {statusSmtpAtual?.host && ` • Host: ${statusSmtpAtual.host}`}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${
                    statusSmtpAtual?.configurado
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}
                >
                  {statusSmtpAtual?.configurado ? "✓ Entrega Externa Ativa" : "Modo Simulado / Testes"}
                </span>
              </div>

              {/* Formulário de Configuração SMTP Direta */}
              <div className="p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-sky-600" />
                    Configurar Credenciais do Servidor de Correio (SMTP)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informe os dados da conta remetente para que os e-mails alcancem diretamente as caixas de entrada de qualquer servidor (Gmail, Outlook, etc.).
                  </p>
                </div>

                {/* Seleção Rápida de Provedor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Selecione o seu Provedor de E-mail:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleMudarProvedor("gmail")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        smtpProvedor === "gmail"
                          ? "bg-red-50/80 border-red-500 ring-2 ring-red-500/20 font-bold text-red-950"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-extrabold flex items-center justify-between">
                        <span>Google Gmail / Workspace</span>
                        {smtpProvedor === "gmail" && <CheckCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">smtp.gmail.com:587</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMudarProvedor("office365")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        smtpProvedor === "office365"
                          ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 font-bold text-blue-950"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-extrabold flex items-center justify-between">
                        <span>Microsoft 365 / Outlook</span>
                        {smtpProvedor === "office365" && <CheckCircle className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">smtp.office365.com:587</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMudarProvedor("custom")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        smtpProvedor === "custom"
                          ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 font-bold text-indigo-950"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-extrabold flex items-center justify-between">
                        <span>Outro / SMTP da Prefeitura</span>
                        {smtpProvedor === "custom" && <CheckCircle className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Personalizado</div>
                    </button>
                  </div>
                </div>

                {/* Campos do Formulário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Servidor Host SMTP:
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Porta do Servidor:
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value) || 587)}
                      placeholder="587"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      E-mail do Remetente (Usuário de Login):
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="seu-email@gmail.com ou sg@municipio.gov.br"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Senha de Aplicativo (App Password) / Senha:
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="Código de 16 letras gerado na conta"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nome de Exibição do Remetente:
                    </label>
                    <input
                      type="text"
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value)}
                      placeholder='SuperGestão Saúde <sg.saude@municipio.gov.br>'
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Alerta de Feedback de Teste */}
                {resultadoTesteSmtp && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                      resultadoTesteSmtp.success
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold"
                        : "bg-rose-50 border-rose-300 text-rose-950"
                    }`}
                  >
                    {resultadoTesteSmtp.success ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{resultadoTesteSmtp.message}</span>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestarSmtp}
                    disabled={testandoSmtp || salvandoSmtp}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${testandoSmtp ? "animate-spin" : ""}`} />
                    <span>{testandoSmtp ? "Testando Autenticação..." : "Testar Conexão"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSalvarSmtp}
                    disabled={salvandoSmtp || testandoSmtp}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{salvandoSmtp ? "Salvando no .env.local..." : "Salvar no .env.local e Ativar"}</span>
                  </button>
                </div>

                {/* Dica para Gmail */}
                {smtpProvedor === "gmail" && (
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                    <strong>Como obter a Senha de Aplicativo no Gmail:</strong>
                    <ol className="list-decimal list-inside space-y-0.5 text-amber-800">
                      <li>Acesse a sua Conta Google &gt; <em>Segurança</em> (ou acesse diretamente <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">myaccount.google.com/apppasswords</a>).</li>
                      <li>Certifique-se de que a verificação em 2 etapas está ativada.</li>
                      <li>Em <em>Senhas de app</em>, digite o nome &quot;SuperGestão&quot; e clique em <em>Criar</em>.</li>
                      <li>Copie o código gerado de 16 letras e cole no campo &quot;Senha de Aplicativo&quot; acima.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Visualização do E-mail Completo */}
        {emailSelecionadoVisualizar && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-300">
                    Visualização do E-mail Oficial
                  </span>
                  <h4 className="text-sm font-bold text-white truncate max-w-md">
                    {emailSelecionadoVisualizar.assunto}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailSelecionadoVisualizar(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs space-y-1">
                <div><strong>Para:</strong> {emailSelecionadoVisualizar.destinatarioNome} ({emailSelecionadoVisualizar.destinatarioEmail})</div>
                <div><strong>Data de Envio:</strong> {new Date(emailSelecionadoVisualizar.dataHoraEnvio).toLocaleString("pt-BR")}</div>
                <div><strong>Autorizador:</strong> {emailSelecionadoVisualizar.autorNome}</div>
                <div><strong>Status:</strong> {emailSelecionadoVisualizar.statusEnvio} ({emailSelecionadoVisualizar.modo})</div>
              </div>

              <div className="p-4 overflow-y-auto flex-1 bg-white">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailSelecionadoVisualizar.corpoHtml }}
                />
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setEmailSelecionadoVisualizar(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Fechar Visualização
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            SuperGestão Saúde • Sistema de Governança e Notificações Institucionais da SG.
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
