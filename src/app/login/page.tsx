"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Building2,
  UserPlus,
  UserCheck,
  Calendar,
  CreditCard,
  Briefcase,
  Send,
  Clock,
  MessageSquare,
  Phone,
  KeyRound,
  User,
  Copy,
  Check,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { adicionarSolicitacaoCadastroAction } from "@/actions/super-gestao-actions";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#18398A] flex items-center justify-center text-white text-sm">
          Carregando portal de acesso...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aba ativa: Login vs Cadastro (suporta ?aba=cadastro na URL)
  const [abaAtiva, setAbaAtiva] = useState<"login" | "cadastro">("login");

  useEffect(() => {
    const abaParam = searchParams.get("aba");
    if (abaParam === "cadastro") {
      setAbaAtiva("cadastro");
    }
  }, [searchParams]);

  // Estados do formulário de login (Ambiente Oficial de Produção)
  const [emailOuMatricula, setEmailOuMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [sucessoLogin, setSucessoLogin] = useState(false);
  const [mostrarSuporteModal, setMostrarSuporteModal] = useState(false);

  // Estados do formulário de cadastro oficial
  const [cadEmail, setCadEmail] = useState("");
  const [cadNome, setCadNome] = useState("");
  const [cadDataNascimento, setCadDataNascimento] = useState("");
  const [cadCpf, setCadCpf] = useState("");
  const [cadMatricula, setCadMatricula] = useState("");
  const [cadSuperintendencia, setCadSuperintendencia] = useState("SAS");
  const [cadCargo, setCadCargo] = useState("");
  const [cadSenha, setCadSenha] = useState("");
  const [cadConfirmarSenha, setCadConfirmarSenha] = useState("");
  const [mostrarCadSenha, setMostrarCadSenha] = useState(false);
  const [cadLoading, setCadLoading] = useState(false);
  const [cadSucesso, setCadSucesso] = useState(false);
  const [cadErro, setCadErro] = useState<string | null>(null);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin(null);

    if (!emailOuMatricula.trim()) {
      setErroLogin("Por favor, digite seu e-mail institucional ou matrícula.");
      return;
    }

    if (!senha.trim()) {
      setErroLogin("Por favor, informe sua senha de acesso.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const autenticacao = dataStore.autenticarUsuario(emailOuMatricula, senha);

      if (!autenticacao.success) {
        setIsLoading(false);
        setErroLogin(autenticacao.message);
        return;
      }

      // Persiste sessão do usuário logado no navegador
      if (typeof window !== "undefined" && autenticacao.usuario) {
        try {
          localStorage.setItem(
            "supergestao_usuario_logado",
            JSON.stringify(autenticacao.usuario)
          );
        } catch {
          // ignora erro de storage restrito
        }
      }

      setIsLoading(false);
      setSucessoLogin(true);

      setTimeout(() => {
        router.push("/tramitacao");
      }, 700);
    }, 600);
  };

  // Submissão de Cadastro Oficial (Envia para o módulo CADASTRO da SG)
  const handleSubmeterCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadErro(null);

    if (
      !cadEmail.trim() ||
      !cadNome.trim() ||
      !cadDataNascimento.trim() ||
      !cadCpf.trim() ||
      !cadMatricula.trim() ||
      !cadSuperintendencia.trim() ||
      !cadCargo.trim()
    ) {
      setCadErro("Todos os campos marcados com asterisco (*) são obrigatórios.");
      return;
    }

    if (!cadSenha.trim()) {
      setCadErro("Por favor, crie uma senha para acessar o sistema.");
      return;
    }

    if (cadSenha.length < 4) {
      setCadErro("A senha de acesso deve possuir pelo menos 4 caracteres.");
      return;
    }

    if (cadSenha !== cadConfirmarSenha) {
      setCadErro("As senhas digitadas não conferem. Por favor, digite a mesma senha nos dois campos.");
      return;
    }

    setCadLoading(true);

    try {
      const payload = {
        email: cadEmail.trim(),
        nomeCompleto: cadNome.trim(),
        dataNascimento: cadDataNascimento,
        cpf: cadCpf.trim(),
        whatsapp: "",
        matricula: cadMatricula.trim(),
        superintendenciaLotacao: cadSuperintendencia,
        cargo: cadCargo.trim(),
        senha: cadSenha.trim(),
      };

      // 1. Salva na dataStore do cliente (sincronizado automaticamente no localStorage)
      dataStore.adicionarSolicitacaoCadastro(payload);

      // 2. Salva no servidor via server action (Next.js)
      await adicionarSolicitacaoCadastroAction(payload);
    } catch (err) {
      console.warn("Aviso ao persistir no servidor:", err);
    } finally {
      setCadLoading(false);
      setCadSucesso(true);
    }
  };

  const handleResetCadastro = () => {
    setCadEmail("");
    setCadNome("");
    setCadDataNascimento("");
    setCadCpf("");
    setCadMatricula("");
    setCadCargo("");
    setCadSenha("");
    setCadConfirmarSenha("");
    setCadSucesso(false);
    setCadErro(null);
    setAbaAtiva("login");
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:p-12 xl:pr-24 overflow-x-hidden bg-[#18398A] select-none"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Selo institucional discreto no canto inferior esquerdo */}
      <div className="hidden lg:flex absolute bottom-8 left-8 z-10 items-center gap-3 bg-blue-950/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold leading-tight tracking-wide text-white">
            Prefeitura Municipal de Arapiraca • AL
          </p>
          <p className="text-[11px] text-sky-200/90 leading-tight">
            Secretaria Municipal de Saúde (SMS) • Uma Cidade Para Todos
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* QUADRO PRINCIPAL (LOGIN & CADASTRO DE SERVIDORES)         */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-[500px] bg-white rounded-3xl shadow-2xl shadow-blue-950/60 border border-slate-100 p-6 sm:p-8 text-slate-800 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Cabeçalho do Quadro */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50 border border-blue-100 shadow-xs mb-2">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <Image
                src="/timbre/brasao-oficial.png"
                alt="Brasão Oficial de Arapiraca"
                width={48}
                height={48}
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold tracking-wider uppercase mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            Portal de Governança Integrada
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            SuperGestão Saúde
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Secretaria Municipal de Saúde de Arapiraca (SMS)
          </p>
        </div>

        {/* SELETOR DE ABAS: ENTRAR VS CADASTRAR */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAbaAtiva("login");
              setCadSucesso(false);
            }}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
              abaAtiva === "login"
                ? "bg-white text-blue-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Acessar Plataforma
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("cadastro")}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              abaAtiva === "cadastro"
                ? "bg-white text-blue-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-600" />
            <span>Cadastrar Servidor</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* ABA 1: FORMULÁRIO DE LOGIN                                */}
        {/* ========================================================= */}
        {abaAtiva === "login" && (
          <div className="space-y-4 animate-in fade-in duration-200">

            {/* Informação Institucional de Acesso Oficial */}
            <div className="p-3 bg-gradient-to-r from-slate-50 to-sky-50/60 border border-slate-200/90 rounded-2xl text-xs text-slate-700 flex items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
                  <span>Ambiente Oficial de Produção</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Acesso exclusivo a servidores credenciados da Secretaria Municipal de Saúde.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailOuMatricula("will2026@gmail.com");
                  setSenha("123456");
                  setErroLogin(null);
                }}
                className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer"
                title="Acesso da Coordenadora Geral de Gestão"
              >
                Acesso SG
              </button>
            </div>

            {/* Mensagem de Erro */}
            {erroLogin && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{erroLogin}</span>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {sucessoLogin && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Autenticação validada! Acessando ambiente governamental...</span>
              </div>
            )}

            {/* Formulário de Acesso */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail Institucional ou Matrícula
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={emailOuMatricula}
                    onChange={(e) => setEmailOuMatricula(e.target.value)}
                    placeholder="nome.sobrenome@saude.gov.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-xs text-slate-900 font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs font-mono"
                    disabled={isLoading || sucessoLogin}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarSuporteModal(true)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-xs text-slate-900 font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs font-mono"
                    disabled={isLoading || sucessoLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lembrarMe}
                    onChange={(e) => setLembrarMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 select-none font-medium">
                    Lembrar meu usuário
                  </span>
                </label>

                <span className="text-[11px] text-slate-600 flex items-center gap-1.5 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  SMS Online
                </span>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={isLoading || sucessoLogin}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-700 via-blue-800 to-sky-700 hover:from-blue-800 hover:to-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validando credenciais...</span>
                  </>
                ) : sucessoLogin ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Acesso Autorizado! Redirecionando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Plataforma</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Link para Cadastro */}
            <div className="text-center pt-1">
              <p className="text-xs text-slate-600">
                Primeiro acesso à plataforma?{" "}
                <button
                  type="button"
                  onClick={() => setAbaAtiva("cadastro")}
                  className="font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                >
                  Cadastre-se para solicitar autorização à SG
                </button>
              </p>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: FORMULÁRIO DE CADASTRO DE SERVIDORES               */}
        {/* ========================================================= */}
        {abaAtiva === "cadastro" && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {cadSucesso ? (
              /* Tela de Confirmação de Envio à SG */
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950">
                    Cadastro Submetido com Sucesso à SG!
                  </h3>
                  <p className="text-xs text-emerald-900/90 leading-relaxed mt-1">
                    Sua solicitação de acesso foi encaminhada diretamente para o módulo <strong>CADASTRO</strong> da <strong>Superintendência de Gestão (SG)</strong>.
                  </p>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-left text-xs space-y-1">
                  <p><strong>Servidor:</strong> {cadNome}</p>
                  <p><strong>Matrícula:</strong> {cadMatricula} • <strong>CPF:</strong> {cadCpf}</p>
                  <p><strong>E-mail:</strong> {cadEmail}</p>
                  <p><strong>Lotação:</strong> {cadSuperintendencia} • <strong>Cargo:</strong> {cadCargo}</p>
                  <div className="pt-1.5 flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Status: Aguardando Autorização da SG</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  A Coordenadora Geral e servidores da SG irão analisar seu cadastro e configurar seus privilégios de <strong>visualização e edição</strong> por módulo.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleResetCadastro}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Realizar Novo Cadastro
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/cadastro")}
                    className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Ver Fila no Módulo CADASTRO (Acesso SG)
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário com os campos solicitados */
              <form onSubmit={handleSubmeterCadastro} className="space-y-3">
                <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>
                    Preencha os dados funcionais. O cadastro será remetido à <strong>Superintendência de Gestão (SG)</strong> para autorização de módulos.
                  </span>
                </div>

                {cadErro && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{cadErro}</span>
                  </div>
                )}

                {/* 1. Nome Completo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cadNome}
                    onChange={(e) => setCadNome(e.target.value)}
                    placeholder="Ex: Dra. Juliana Ferreira Lima"
                    className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* 2. E-mail Institucional */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail Institucional ou Pessoal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={cadEmail}
                    onChange={(e) => setCadEmail(e.target.value)}
                    placeholder="servidor@saude.gov.br"
                    className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>



                {/* 3. Data de Nascimento & 4. CPF */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Data de Nascimento <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={cadDataNascimento}
                      onChange={(e) => setCadDataNascimento(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CPF <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cadCpf}
                      onChange={(e) => setCadCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 font-mono font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. Matrícula Funcional & 6. Superintendência */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Matrícula Funcional <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cadMatricula}
                      onChange={(e) => setCadMatricula(e.target.value)}
                      placeholder="Ex: 148.920-1"
                      className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 font-mono font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Superintendência <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={cadSuperintendencia}
                      onChange={(e) => setCadSuperintendencia(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 text-xs text-slate-900 font-semibold rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="SG">SG - Gestão</option>
                      <option value="SAS">SAS - Atenção à Saúde</option>
                      <option value="SUVIG">SUVIG - Vigilância</option>
                      <option value="SGTES">SGTES - Trabalho/Educação</option>
                      <option value="SURCAA">SURCAA - Regulação</option>
                      <option value="GABINETE">GABINETE - Gabinete SMS</option>
                    </select>
                  </div>
                </div>

                {/* 7. Cargo / Função */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cargo / Função <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cadCargo}
                    onChange={(e) => setCadCargo(e.target.value)}
                    placeholder="Ex: Médico Plantonista, Enfermeiro, Analista..."
                    className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* 8. Criar Senha & Confirmar Senha */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Criar Senha <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Mín. 4 dígitos</span>
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarCadSenha ? "text" : "password"}
                        required
                        value={cadSenha}
                        onChange={(e) => setCadSenha(e.target.value)}
                        placeholder="Crie sua senha"
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 text-xs text-slate-900 font-mono font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarCadSenha(!mostrarCadSenha)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={mostrarCadSenha ? "Ocultar senha" : "Ver senha"}
                      >
                        {mostrarCadSenha ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirmar Senha <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={mostrarCadSenha ? "text" : "password"}
                      required
                      value={cadConfirmarSenha}
                      onChange={(e) => setCadConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 font-mono font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Botão Submeter à Autorização */}
                <button
                  type="submit"
                  disabled={cadLoading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {cadLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Encaminhando à SG...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-sky-300 group-hover:translate-x-0.5 transition-transform" />
                      <span>Submeter Cadastro para Autorização da SG</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("login")}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer font-medium"
                  >
                    Já possui cadastro ativo? Voltar ao Login
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Rodapé do Quadro com Segurança & Certificação */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ambiente Seguro TLS 1.3 • SMS Arapiraca</span>
          </div>
          <span className="font-mono text-slate-600">SG Governança</span>
        </div>
      </div>

      {/* Modal de Suporte / Recuperação de Senha */}
      {mostrarSuporteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Recuperação de Acesso Institucional
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Por medidas de segurança e conformidade com a LGPD e governança da SMS Arapiraca, as credenciais corporativas são gerenciadas pelo setor de Tecnologia da Informação.
            </p>

            <div className="my-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">Coordenação de TI - SMS Arapiraca</p>
              <p className="text-slate-600">Ramal Interno: <strong>2104 / 2105</strong></p>
              <p className="text-slate-600">E-mail: <strong>ti.saude@arapiraca.al.gov.br</strong></p>
            </div>

            <button
              onClick={() => setMostrarSuporteModal(false)}
              className="w-full py-2 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Entendido, voltar ao login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
