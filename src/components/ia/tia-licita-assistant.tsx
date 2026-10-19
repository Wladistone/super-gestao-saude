"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Copy,
  Check,
  Bot,
  RefreshCw,
  FileText,
  HelpCircle,
  Scale,
  Building2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface MensagemChat {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SUGESTOES_RAPIDAS = [
  {
    rotulo: "📝 Regras do DFD (Sem Preços)",
    prompt: "Tia Licita, quais informações devo colocar no DFD e por que não devemos colocar preços nele?",
  },
  {
    rotulo: "⚖️ Redigir Justificativa Técnica",
    prompt: "Tia Licita, por favor redija uma justificativa técnica formal para aquisição de insumos de saúde pública conforme a Lei 14.133/2021.",
  },
  {
    rotulo: "🏛️ Ofício ao Prefeito Luciano Barbosa",
    prompt: "Tia Licita, elabore um modelo de ofício formal endereçado ao Prefeito Luciano Barbosa solicitando autorização de contratação.",
  },
  {
    rotulo: "💰 ETP vs. DFD",
    prompt: "Qual a diferença entre o DFD (Formalização de Demanda) e o ETP (Estudo Técnico Preliminar)? Onde entra a pesquisa de preços?",
  },
  {
    rotulo: "📍 Localizar Ferramentas",
    prompt: "Onde encontro no sistema o controle de contratos, ordens de fornecimento e a frota do SAMU?",
  },
];

export function TiaLicitaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputTexto, setInputTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [inseridoId, setInseridoId] = useState<string | null>(null);

  const [mensagens, setMensagens] = useState<MensagemChat[]>([
    {
      id: "boas-vindas",
      role: "assistant",
      content:
        "Olá, meu querido servidor da Saúde de Arapiraca! Sou a **Tia Licita**, sua assessora de IA alimentada por Groq. Estou aqui para te guiar pela plataforma, tirar dúvidas da Lei 14.133/2021 e **redigir cláusulas, justificativas, DFDs, ETPs e ofícios** para os seus processos. Como posso te ajudar agora?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const fimMensagensRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Rolagem suave automática para a mensagem mais recente
  useEffect(() => {
    if (isOpen && !isMinimized) {
      fimMensagensRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens, isOpen, isMinimized]);

  // Listener para eventos de outras partes da plataforma
  useEffect(() => {
    const handlerAbrirTiaLicita = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.prompt) {
        enviarMensagem(e.detail.prompt, e.detail.context);
      }
    };

    window.addEventListener("abrir-tia-licita" as any, handlerAbrirTiaLicita);
    return () => window.removeEventListener("abrir-tia-licita" as any, handlerAbrirTiaLicita);
  }, []);

  const enviarMensagem = async (texto: string, contextCustom?: any) => {
    if (!texto.trim() || carregando) return;

    const novaMensagemUsuario: MensagemChat = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: texto.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const novoHistorico = [...mensagens, novaMensagemUsuario];
    setMensagens(novoHistorico);
    setInputTexto("");
    setCarregando(true);

    try {
      const res = await fetch("/api/tia-licita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: novoHistorico.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: contextCustom || {
            pagina: typeof window !== "undefined" ? window.location.pathname : "",
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na resposta da Tia Licita");
      }

      const data = await res.json();
      const respostaIA: MensagemChat = {
        id: `ia-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Desculpe querido, tive uma breve oscilação. Poderia repetir?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMensagens((prev) => [...prev, respostaIA]);
    } catch (err) {
      console.error(err);
      setMensagens((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Tive uma pequena instabilidade de conexão com a Groq API, meu bem. Por favor tente novamente em alguns instantes!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setCarregando(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopiarTexto = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  const handleInserirNoDocumento = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("inserir-texto-tia-licita", {
          detail: { texto },
        })
      );
    }
    setInseridoId(id);
    setTimeout(() => setInseridoId(null), 2500);
  };

  const handleLimparHistorico = () => {
    setMensagens([
      {
        id: "reiniciado",
        role: "assistant",
        content:
          "Conversa reiniciada! Diga-me, qual processo ou documento da Saúde de Arapiraca vamos estruturar agora?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Se estiver fechado, exibe botão flutuante discreto e compacto (oculto na impressão)
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-[99999] print:hidden flex items-center">
        {/* Botão de Disparo Discreto e Compacto */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 transition-all duration-150 cursor-pointer backdrop-blur-xs text-[11px] font-medium"
          title="Tia Licita! Sua Assistente IA! (Groq AI)"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          
          <span className="tracking-tight text-slate-700 group-hover:text-slate-900">
            Tia Licita! Sua Assistente IA!
          </span>

          <div className="h-5 w-5 rounded-full bg-slate-100 group-hover:bg-sky-50 flex items-center justify-center text-sky-700 shrink-0 transition-colors">
            <Sparkles className="h-3 w-3 text-sky-600" />
          </div>

          <span className="sr-only">Abrir Tia Licita! Sua Assistente IA!</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-[99999] print:hidden flex pointer-events-none">
      {/* ---------------- JANELINHA DE LADO (SIDE DRAWER) ---------------- */}
      <div
        className={`pointer-events-auto bg-white shadow-[-12px_0_45px_rgba(0,0,0,0.35)] border-l border-slate-300 w-[95vw] sm:w-[480px] md:w-[500px] flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 transition-all ${
          isMinimized
            ? "h-16 self-end bottom-0 rounded-tl-2xl border-t border-slate-300 shadow-xl"
            : "h-full"
        }`}
      >
        {/* CABEÇALHO DA TIA LICITA */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0 select-none border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-sky-400 p-0.5 shadow-md shrink-0">
              <div className="h-full w-full rounded-[14px] bg-slate-900 flex items-center justify-center text-amber-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-wide text-white">
                  Tia Licita
                </h3>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950">
                  Groq IA
                </span>
              </div>
              <p className="text-[11px] text-sky-200/80 leading-tight">
                Sua Assistente IA &bull; SMS Arapiraca
              </p>
            </div>
          </div>

          {/* Ações do Cabeçalho */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleLimparHistorico}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Limpar conversa"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMinimized ? "Expandir janelinha" : "Minimizar"}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar janelinha de lado"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CORPO DO CHAT (SE NÃO ESTIVER MINIMIZADO) */}
        {!isMinimized && (
          <>
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 text-xs">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 shadow-2xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-sky-700 text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                    }`}
                  >
                    {/* Renderização de texto formatado com quebras e tópicos */}
                    <div className="whitespace-pre-wrap font-sans text-[12px] space-y-1.5">
                      {msg.content}
                    </div>

                    {/* Botões de Ação para respostas da IA */}
                    {msg.role === "assistant" && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10.5px] text-slate-500 flex-wrap">
                        <span className="font-mono text-[10px]">{msg.timestamp}</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInserirNoDocumento(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition-colors shadow-2xs cursor-pointer"
                            title="Inserir diretamente no documento aberto como uma nova cláusula"
                          >
                            {inseridoId === msg.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Inserido!</span>
                              </>
                            ) : (
                              <>
                                <FileText className="h-3 w-3 text-amber-600" />
                                <span>Inserir no Documento</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopiarTexto(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
                            title="Copiar texto para colar no processo"
                          >
                            {copiadoId === msg.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-slate-500" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Indicador de Digitação da Groq */}
              {carregando && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200/80 w-fit text-slate-600 shadow-2xs animate-pulse">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
                  <span className="text-xs font-medium">Tia Licita está redigindo...</span>
                </div>
              )}

              <div ref={fimMensagensRef} />
            </div>

            {/* SUGESTÕES RÁPIDAS (CHIPS) */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {SUGESTOES_RAPIDAS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => enviarMensagem(sug.prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200/80 hover:border-sky-300 transition-colors shrink-0"
                >
                  {sug.rotulo}
                </button>
              ))}
            </div>

            {/* CAMPO DE ENTRADA */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enviarMensagem(inputTexto);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      enviarMensagem(inputTexto);
                    }
                  }}
                  placeholder="Pergunte sobre leis, rotas ou peça para criar uma cláusula..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none font-sans text-slate-800"
                />

                <button
                  type="submit"
                  disabled={carregando || !inputTexto.trim()}
                  className="h-10 w-10 rounded-xl bg-sky-700 hover:bg-sky-800 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                  title="Enviar mensagem para a Tia Licita"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Alimentada por Groq IA • Especializada em Lei 14.133/21 & SMS Arapiraca
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
