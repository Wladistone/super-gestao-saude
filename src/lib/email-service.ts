import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { RegistroEmailEnviado, PermissaoModulo } from "@/lib/types";
import { dataStore } from "@/lib/data-store";

// ============================================================
// CONFIGURAÇÃO DO TRANSPORTE DE E-MAILS
// ============================================================

export interface EmailConfigStatus {
  configurado: boolean;
  modo: "smtp" | "simulado";
  host?: string;
  port?: number;
  remetente: string;
  secure?: boolean;
}

export interface DadosConfiguracaoSmtp {
  host: string;
  port: number;
  secure?: boolean;
  user: string;
  pass: string;
  from?: string;
}

export function obterConfiguracaoEmail(): EmailConfigStatus {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const remetente = process.env.SMTP_FROM || "SuperGestão Saúde <sg.saude@municipio.gov.br>";

  const configurado = Boolean(host && user && pass);

  return {
    configurado,
    modo: configurado ? "smtp" : "simulado",
    host: host || undefined,
    port,
    remetente,
    secure,
  };
}

// Testa a autenticação real com o servidor SMTP
export async function testarConexaoSmtp(config: DadosConfiguracaoSmtp): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host.trim(),
      port: Number(config.port) || 587,
      secure: config.secure ?? (Number(config.port) === 465),
      auth: {
        user: config.user.trim(),
        pass: config.pass.trim(),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    return {
      success: true,
      message: "Conexão com servidor SMTP estabelecida e autenticada com sucesso! As credenciais estão válidas e prontas para entrega real.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na autenticação SMTP: ${err?.message || err}`,
    };
  }
}

// Salva e ativa credenciais SMTP no .env.local e em memória
export async function salvarConfiguracaoSmtp(config: DadosConfiguracaoSmtp): Promise<{ success: boolean; message: string }> {
  try {
    const host = config.host.trim();
    const port = String(Number(config.port) || 587);
    const secure = String(config.secure ?? (Number(port) === 465));
    const user = config.user.trim();
    const pass = config.pass.trim();
    const from = (config.from || `SuperGestão Saúde <${user}>`).trim();

    // 1. Atualiza variáveis em memória imediatamente
    process.env.SMTP_HOST = host;
    process.env.SMTP_PORT = port;
    process.env.SMTP_SECURE = secure;
    process.env.SMTP_USER = user;
    process.env.SMTP_PASS = pass;
    process.env.SMTP_FROM = from;

    // 2. Atualiza arquivo .env.local
    const envPath = path.resolve(process.cwd(), ".env.local");
    let conteudo = "";
    if (fs.existsSync(envPath)) {
      conteudo = fs.readFileSync(envPath, "utf-8");
    }

    const mapa = new Map<string, string>();
    conteudo.split(/\r?\n/).forEach((linha) => {
      const match = linha.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        mapa.set(match[1], match[2]);
      }
    });

    mapa.set("SMTP_HOST", host);
    mapa.set("SMTP_PORT", port);
    mapa.set("SMTP_SECURE", secure);
    mapa.set("SMTP_USER", user);
    mapa.set("SMTP_PASS", pass);
    mapa.set("SMTP_FROM", from);
    if (!mapa.has("NEXT_PUBLIC_APP_URL")) {
      mapa.set("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    }

    const novoConteudo = Array.from(mapa.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") + "\n";

    fs.writeFileSync(envPath, novoConteudo, "utf-8");

    return {
      success: true,
      message: "Configurações SMTP salvas com sucesso no arquivo .env.local e ativas imediatamente!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao salvar configurações no .env.local: ${err?.message || err}`,
    };
  }
}

// Cria transporte Nodemailer quando as credenciais estiverem preenchidas
function criarTransportador() {
  const cfg = obterConfiguracaoEmail();
  if (!cfg.configurado) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Facilita servidores corporativos e auto-assinados
    },
  });
}

// ============================================================
// DISPARADOR CENTRAL DE E-MAILS (COM FALLBACK SEGURO)
// ============================================================

export interface OpcoesEnvioEmail {
  tipo:
    | "AUTORIZACAO_CADASTRO"
    | "CADASTRO_REJEITADO"
    | "ENQUADRAMENTO_DEMANDA"
    | "DILIGENCIA_DEMANDA"
    | "DIRECIONAMENTO_SG"
    | "TESTE_SISTEMA"
    | "OUTRO";
  to: string;
  destinatarioNome: string;
  subject: string;
  html: string;
  text: string;
  autorNome?: string;
  metadados?: Record<string, any>;
}

export interface ResultadoEnvioEmail {
  success: boolean;
  messageId: string;
  modo: "smtp" | "simulado";
  timestamp: string;
  destinatario: string;
  assunto: string;
  aviso?: string;
}

export async function enviarEmail(opcoes: OpcoesEnvioEmail): Promise<ResultadoEnvioEmail> {
  const agora = new Date().toISOString();
  const cfg = obterConfiguracaoEmail();
  const autor = opcoes.autorNome || "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG)";

  let messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  let modoEnvio: "smtp" | "simulado" = "simulado";
  let statusFinal: "ENVIADO" | "SIMULADO_SUCESSO" = "SIMULADO_SUCESSO";
  let aviso: string | undefined;

  const transport = criarTransportador();

  if (transport) {
    try {
      const info = await transport.sendMail({
        from: cfg.remetente,
        to: opcoes.to,
        subject: opcoes.subject,
        text: opcoes.text,
        html: opcoes.html,
      });

      messageId = info.messageId || messageId;
      modoEnvio = "smtp";
      statusFinal = "ENVIADO";
    } catch (err: any) {
      console.warn("⚠️ [SuperGestão Email] Falha no transporte SMTP real, aplicando fallback simulado com auditoria:", err?.message || err);
      modoEnvio = "simulado";
      statusFinal = "SIMULADO_SUCESSO";
      aviso = `SMTP offline/não autenticado: ${err?.message || "conexão recusada"}. E-mail registrado no histórico de auditoria.`;
    }
  } else {
    // Modo Simulado Inteligente
    modoEnvio = "simulado";
    statusFinal = "SIMULADO_SUCESSO";
  }

  // Registrar auditoria no dataStore
  const registro: RegistroEmailEnviado = {
    id: `email-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tipo: opcoes.tipo,
    destinatarioEmail: opcoes.to,
    destinatarioNome: opcoes.destinatarioNome,
    assunto: opcoes.subject,
    corpoTexto: opcoes.text,
    corpoHtml: opcoes.html,
    dataHoraEnvio: agora,
    autorNome: autor,
    statusEnvio: statusFinal,
    modo: modoEnvio,
    mensagemId: messageId,
    metadados: opcoes.metadados,
  };

  dataStore.registrarEmailEnviado(registro);

  return {
    success: true,
    messageId,
    modo: modoEnvio,
    timestamp: agora,
    destinatario: opcoes.to,
    assunto: opcoes.subject,
    aviso,
  };
}

// ============================================================
// HELPER: EXTRAIR PRIMEIRO NOME DO SERVIDOR
// ============================================================
export function extrairPrimeiroNome(nomeCompleto?: string): string {
  if (!nomeCompleto) return "Servidor";
  let limpo = nomeCompleto.trim().replace(/^([Dd]r\.|[Dd]ra\.|[Ee]nf\.|[Pp]rof\.|[Ss]r\.|[Ss]ra\.)\s+/i, "");
  limpo = limpo.replace(/\s*\([^)]*\)$/, "").trim();
  const partes = limpo.split(/\s+/);
  return partes[0] || "Servidor";
}

// ============================================================
// TEMPLATE 1: AUTORIZAÇÃO DE CADASTRO PELA COORDENADORA GERAL (SG)
// ============================================================

export interface DadosEmailCadastroAprovado {
  nomeCompleto: string;
  email: string;
  matricula: string;
  superintendencia: string;
  cargo: string;
  autorizadorNome?: string;
  observacoesSG?: string;
  permissoes?: PermissaoModulo[];
  appUrl?: string;
}

export function gerarTemplateCadastroAprovado(dados: DadosEmailCadastroAprovado) {
  const primeiroNome = extrairPrimeiroNome(dados.nomeCompleto);
  const mensagemUsuario = `Olá, ${primeiroNome}! Seu cadastro foi aprovado com sucesso! Seu cadastro foi analisado e validado pela Superintendência de Gestão! Utilize seu email e sua senha para acessar a plataforma. Vamos ao trabalho!!`;
  const urlBase = dados.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${urlBase}/login`;

  const permissoesHtml = dados.permissoes && dados.permissoes.length > 0
    ? dados.permissoes
        .filter((p) => p.visualizar || p.editar)
        .map((p) => {
          const nivelBadge = p.visualizar && p.editar
            ? `<span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">Visualização & Edição</span>`
            : p.editar
            ? `<span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">Edição</span>`
            : `<span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">Visualização</span>`;

          return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-size: 13px; color: #334155; font-weight: 600;">${p.moduloNome}</td>
              <td style="padding: 10px 12px; text-align: right;">${nivelBadge}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="2" style="padding: 12px; text-align: center; color: #64748b; font-size: 13px;">Acesso padrão liberado pela Coordenação Geral.</td></tr>`;

  const assunto = `[SuperGestão Saúde] Cadastro Aprovado! Olá, ${primeiroNome} - Acesso Liberado`;

  const text = `
${mensagemUsuario}

DADOS DO SERVIDOR:
- Matrícula: ${dados.matricula}
- Superintendência de Lotação: ${dados.superintendencia}
- Cargo Oficial: ${dados.cargo}
- E-mail de Acesso: ${dados.email}
${dados.observacoesSG ? `- Despacho / Observações da SG: ${dados.observacoesSG}\n` : ""}
COMO ACESSAR:
Utilize seu e-mail cadastrado (${dados.email}) e sua senha definida:
${loginUrl}

Atenciosamente,
Coordenação Geral de Gestão (SG)
Superintendência de Gestão
Secretaria Municipal de Saúde
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${assunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header Institucional -->
          <tr>
            <td style="background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%); padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #bae6fd; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
                Superintendência de Gestão (SG) • Governança SMS
              </span>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Cadastro Aprovado com Sucesso!
              </h1>
              <p style="color: #e0f2fe; font-size: 13px; margin: 0;">
                Seu acesso foi validado e autorizado pela Coordenação Geral de Gestão.
              </p>
            </td>
          </tr>

          <!-- Corpo Principal com Destaque da Mensagem -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px; font-size: 15px; font-weight: 700; color: #15803d; line-height: 1.6;">
                ${mensagemUsuario}
              </div>

              <!-- Bloco de Dados do Servidor -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  Dados de Lotação e Credenciamento
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; width: 130px;">Matrícula:</td>
                    <td style="padding: 4px 0; font-weight: 600;">${dados.matricula}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Superintendência:</td>
                    <td style="padding: 4px 0; font-weight: 600;">${dados.superintendencia}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Cargo Oficial:</td>
                    <td style="padding: 4px 0; font-weight: 600;">${dados.cargo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">E-mail de Acesso:</td>
                    <td style="padding: 4px 0; font-weight: 600; color: #0284c7;">${dados.email}</td>
                  </tr>
                </table>
              </div>

              <!-- Tabela de Módulos Autorizados -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  Módulos e Privilégios Concedidos
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                  <thead style="background-color: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
                    <tr>
                      <th style="padding: 8px 12px;">Módulo do Sistema</th>
                      <th style="padding: 8px 12px; text-align: right;">Nível de Acesso</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${permissoesHtml}
                  </tbody>
                </table>
              </div>

              ${
                dados.observacoesSG
                  ? `
                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px;">
                  <div style="font-size: 11px; font-weight: bold; color: #047857; text-transform: uppercase; margin-bottom: 4px;">
                    Despacho / Observações da SG:
                  </div>
                  <div style="font-size: 13px; color: #065f46; line-height: 1.5;">
                    ${dados.observacoesSG}
                  </div>
                </div>
              `
                  : ""
              }

              <!-- Botão de Ação -->
              <div style="text-align: center; margin: 32px 0 24px 0;">
                <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);">
                  Entrar na Plataforma SuperGestão
                </a>
                <p style="font-size: 12px; color: #64748b; margin: 10px 0 0 0;">
                  Utilize seu e-mail cadastrado e a senha definida para fazer login.
                </p>
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">
                <strong>SuperGestão Saúde</strong> • Sistema Integrado de Governança, Contratos & Licitações
              </p>
              <p style="margin: 0;">
                Coordenação Geral de Gestão (SG) • Secretaria Municipal de Saúde<br>
                Este é um e-mail oficial gerado automaticamente pela plataforma.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { assunto, text, html };
}

export async function enviarEmailBoasVindasCadastro(
  dados: DadosEmailCadastroAprovado
): Promise<ResultadoEnvioEmail> {
  const template = gerarTemplateCadastroAprovado(dados);

  return enviarEmail({
    tipo: "AUTORIZACAO_CADASTRO",
    to: dados.email,
    destinatarioNome: dados.nomeCompleto,
    subject: template.assunto,
    text: template.text,
    html: template.html,
    autorNome: dados.autorizadorNome,
    metadados: {
      matricula: dados.matricula,
      superintendencia: dados.superintendencia,
      cargo: dados.cargo,
      observacoesSG: dados.observacoesSG,
    },
  });
}

// ============================================================
// TEMPLATE 2: CADASTRO NÃO AUTORIZADO / RECUSADO PELA SG
// ============================================================

export interface DadosEmailCadastroRejeitado {
  nomeCompleto: string;
  email: string;
  motivoRejeicao?: string;
  matricula?: string;
  superintendencia?: string;
  cargo?: string;
  autorizadorNome?: string;
  appUrl?: string;
}

export function gerarTemplateCadastroRejeitado(dados: DadosEmailCadastroRejeitado) {
  const primeiroNome = extrairPrimeiroNome(dados.nomeCompleto);
  const mensagemUsuario = `Olá, ${primeiroNome}! Seu cadastro não foi aprovado. Por favor, dirija-se a Superintendência de gestão para sanar quaisquer inconformidades do seu cadastro. Esperamos por você!`;
  const assunto = `[SuperGestão Saúde] Comunicado de Solicitação de Cadastro - Olá, ${primeiroNome}`;

  const text = `
${mensagemUsuario}

${dados.motivoRejeicao ? `MOTIVO INFORMADO PELA SG:\n${dados.motivoRejeicao}\n\n` : ""}DADOS DA SOLICITAÇÃO:
- Nome Completo: ${dados.nomeCompleto}
${dados.matricula ? `- Matrícula: ${dados.matricula}\n` : ""}${dados.superintendencia ? `- Lotação: ${dados.superintendencia}\n` : ""}${dados.cargo ? `- Cargo: ${dados.cargo}\n` : ""}- E-mail: ${dados.email}

Para regularizar o seu cadastro, compareça à Superintendência de Gestão (SG) no prédio da Secretaria Municipal de Saúde de Arapiraca.

Atenciosamente,
Coordenação Geral de Gestão (SG)
Superintendência de Gestão
Secretaria Municipal de Saúde
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${assunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #881337 0%, #be123c 100%); padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #fecdd3; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
                Superintendência de Gestão (SG) • Governança SMS
              </span>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Comunicado sobre Solicitação de Cadastro
              </h1>
              <p style="color: #ffe4e6; font-size: 13px; margin: 0;">
                Orientações da Coordenação Geral de Gestão.
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px; font-size: 15px; font-weight: 700; color: #be123c; line-height: 1.6;">
                ${mensagemUsuario}
              </div>

              ${
                dados.motivoRejeicao
                  ? `
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px 18px; border-radius: 10px; margin-bottom: 24px;">
                  <div style="font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase; margin-bottom: 6px;">
                    Motivo Informado pela SG:
                  </div>
                  <div style="font-size: 13px; color: #7f1d1d; line-height: 1.5;">
                    ${dados.motivoRejeicao}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  Dados da Solicitação
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; width: 130px;">Servidor:</td>
                    <td style="padding: 4px 0; font-weight: 600;">${dados.nomeCompleto}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">E-mail:</td>
                    <td style="padding: 4px 0; font-weight: 600;">${dados.email}</td>
                  </tr>
                  ${dados.matricula ? `<tr><td style="padding: 4px 0; color: #64748b;">Matrícula:</td><td style="padding: 4px 0; font-weight: 600;">${dados.matricula}</td></tr>` : ""}
                  ${dados.superintendencia ? `<tr><td style="padding: 4px 0; color: #64748b;">Lotação:</td><td style="padding: 4px 0; font-weight: 600;">${dados.superintendencia}</td></tr>` : ""}
                </table>
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 10px 0;">
                Para regularizar seu cadastro, dirija-se à <strong>Superintendência de Gestão (SG)</strong> na Secretaria Municipal de Saúde de Arapiraca.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">
                <strong>SuperGestão Saúde</strong> • Sistema Integrado de Governança, Contratos & Licitações
              </p>
              <p style="margin: 0;">
                Superintendência de Gestão (SG) • Secretaria Municipal de Saúde
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { assunto, text, html };
}

export async function enviarEmailCadastroRejeitado(
  dados: DadosEmailCadastroRejeitado
): Promise<ResultadoEnvioEmail> {
  const template = gerarTemplateCadastroRejeitado(dados);

  return enviarEmail({
    tipo: "CADASTRO_REJEITADO",
    to: dados.email,
    destinatarioNome: dados.nomeCompleto,
    subject: template.assunto,
    text: template.text,
    html: template.html,
    autorNome: dados.autorizadorNome,
    metadados: {
      matricula: dados.matricula,
      superintendencia: dados.superintendencia,
      cargo: dados.cargo,
      motivoRejeicao: dados.motivoRejeicao,
    },
  });
}

// ============================================================
// TEMPLATE 3: DEMANDA ENQUADRADA PELA SG (PARA O DEMANDANTE)
// ============================================================

export interface DadosEmailEnquadramentoDemanda {
  servidorNome: string;
  servidorEmail: string;
  numeroDemanda: string;
  superintendencia: string;
  objeto: string;
  coordenadoraNome?: string;
  modalidadeNome: string;
  artigoLei: string;
  justificativaEnquadramento?: string;
  numeroProcesso?: string;
  servidorSGDesignado?: string;
  artefatos: string[];
  appUrl?: string;
}

export function gerarTemplateEnquadramentoDemanda(dados: DadosEmailEnquadramentoDemanda) {
  const primeiroNome = extrairPrimeiroNome(dados.servidorNome);
  const mensagemUsuario = `Olá, ${primeiroNome}. Sua demanda já foi enquadrada com sucesso! Os documentos necessários para a abertura do processo já estão disponíveis na plataforma. Vamos ao trabalho!`;
  const urlBase = dados.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const tramitacaoUrl = `${urlBase}/tramitacao`;

  const artefatosLista = dados.artefatos && dados.artefatos.length > 0
    ? dados.artefatos
    : [
        "Documento de Formalização da Demanda (DFD)",
        "Estudo Técnico Preliminar (ETP)",
        "Termo de Referência (TR)",
        "Matriz de Riscos da Contratação",
      ];

  const artefatosHtml = artefatosLista
    .map(
      (art) => `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #166534; display: flex; align-items: center;">
          ✓ ${art}
        </div>
      `
    )
    .join("");

  const assunto = `[SuperGestão Saúde] Demanda ${dados.numeroDemanda} Enquadrada - Olá, ${primeiroNome}`;

  const text = `
${mensagemUsuario}

DADOS DO ENQUADRAMENTO:
- Modalidade Licitatória: ${dados.modalidadeNome}
- Fundamentação Legal: ${dados.artigoLei}
${dados.numeroProcesso ? `- Processo Administrativo Autuado: ${dados.numeroProcesso}\n` : ""}- Objeto: ${dados.objeto}
${dados.servidorSGDesignado ? `- Servidor da SG Designado: ${dados.servidorSGDesignado}\n` : ""}${dados.justificativaEnquadramento ? `- Justificativa Técnica: ${dados.justificativaEnquadramento}\n` : ""}
DOCUMENTOS E MODELOS TÉCNICOS DISPONIBILIZADOS:
${artefatosLista.map((a) => `• ${a}`).join("\n")}

Link de Acesso à Tramitação: ${tramitacaoUrl}

Atenciosamente,
Coordenação Geral de Gestão (SG)
Superintendência de Gestão
Secretaria Municipal de Saúde
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${assunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header Institucional -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #93c5fd; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
                Coordenação Geral da SG • Enquadramento Licitatório
              </span>
              <h1 style="color: #ffffff; font-size: 21px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Demanda Enquadrada com Sucesso!
              </h1>
              <p style="color: #bfdbfe; font-size: 13px; margin: 0;">
                Demanda <strong>${dados.numeroDemanda}</strong> • ${dados.superintendencia}
              </p>
            </td>
          </tr>

          <!-- Corpo Principal -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px; font-size: 15px; font-weight: 700; color: #15803d; line-height: 1.6;">
                ${mensagemUsuario}
              </div>

              <!-- Card de Enquadramento -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
                <div style="font-size: 11px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  Despacho Decisório de Enquadramento Legal
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #1e293b;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 140px;">Modalidade Fixada:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #1e40af; font-size: 14px;">${dados.modalidadeNome}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Fundamentação Legal:</td>
                    <td style="padding: 5px 0; font-weight: 600;">${dados.artigoLei}</td>
                  </tr>
                  ${
                    dados.numeroProcesso
                      ? `
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Processo Autuado:</td>
                    <td style="padding: 5px 0; font-weight: 700; color: #047857; font-family: monospace;">${dados.numeroProcesso}</td>
                  </tr>
                  `
                      : ""
                  }
                  ${
                    dados.servidorSGDesignado
                      ? `
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Servidor SG Designado:</td>
                    <td style="padding: 5px 0; font-weight: 600;">${dados.servidorSGDesignado}</td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; vertical-align: top;">Objeto:</td>
                    <td style="padding: 5px 0; font-weight: 500; color: #334155;">${dados.objeto}</td>
                  </tr>
                </table>
              </div>

              <!-- Artefatos Liberados -->
              <div style="margin-bottom: 22px;">
                <div style="font-size: 12px; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Artefatos e Modelos Técnicos Liberados para Elaboração
                </div>
                <p style="font-size: 12px; color: #64748b; margin: 0 0 10px 0;">
                  As minutas oficiais já estão disponíveis no sistema para redação pela equipe técnica demandante:
                </p>
                ${artefatosHtml}
              </div>

              ${
                dados.justificativaEnquadramento
                  ? `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px;">
                  <div style="font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; margin-bottom: 4px;">
                    Justificativa da Coordenadora Geral:
                  </div>
                  <div style="font-size: 13px; color: #334155; line-height: 1.5; font-style: italic;">
                    "${dados.justificativaEnquadramento}"
                  </div>
                </div>
              `
                  : ""
              }

              <!-- Botão de Ação -->
              <div style="text-align: center; margin: 30px 0 20px 0;">
                <a href="${tramitacaoUrl}" target="_blank" style="display: inline-block; background-color: #0369a1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 10px rgba(3, 105, 161, 0.3);">
                  Acessar Demanda na Tramitação
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">
                <strong>SuperGestão Saúde</strong> • Sistema Integrado de Governança, Contratos & Licitações
              </p>
              <p style="margin: 0;">
                Superintendência de Gestão (SG) • Secretaria Municipal de Saúde
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { assunto, text, html };
}

export async function enviarEmailEnquadramentoDemanda(
  dados: DadosEmailEnquadramentoDemanda
): Promise<ResultadoEnvioEmail> {
  const template = gerarTemplateEnquadramentoDemanda(dados);

  return enviarEmail({
    tipo: "ENQUADRAMENTO_DEMANDA",
    to: dados.servidorEmail,
    destinatarioNome: dados.servidorNome,
    subject: template.assunto,
    text: template.text,
    html: template.html,
    autorNome: dados.coordenadoraNome,
    metadados: {
      numeroDemanda: dados.numeroDemanda,
      superintendencia: dados.superintendencia,
      modalidade: dados.modalidadeNome,
      processoNumero: dados.numeroProcesso,
      artefatos: dados.artefatos,
      servidorSGDesignado: dados.servidorSGDesignado,
    },
  });
}

// ============================================================
// TEMPLATE 4: DEMANDA COM DILIGÊNCIA / DEVOLVIDA PARA REVISÃO PELA SG
// ============================================================

export interface DadosEmailDiligenciaDemanda {
  servidorNome: string;
  servidorEmail: string;
  numeroDemanda: string;
  superintendencia: string;
  objeto: string;
  motivoDiligencia: string;
  analistaNome?: string;
  appUrl?: string;
}

export function gerarTemplateDiligenciaDemanda(dados: DadosEmailDiligenciaDemanda) {
  const primeiroNome = extrairPrimeiroNome(dados.servidorNome);
  const mensagemUsuario = `Olá, ${primeiroNome}. Devolvemos sua solicitação para que reveja as informações constantes na mesma. Acesse a plataforma que lá constará mais informações. Vamos ao Trabalho!`;
  const urlBase = dados.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const tramitacaoUrl = `${urlBase}/tramitacao`;
  const assunto = `[SuperGestão Saúde] Demanda ${dados.numeroDemanda} Devolvida para Revisão - Olá, ${primeiroNome}`;

  const text = `
${mensagemUsuario}

DADOS DA SOLICITAÇÃO:
- Demanda: ${dados.numeroDemanda}
- Objeto: ${dados.objeto}
- Solicitante: ${dados.servidorNome} (${dados.superintendencia})
- Responsável pela Análise: ${dados.analistaNome || "Coordenação Geral da SG"}

ORIENTAÇÕES E APONTAMENTOS DA SG:
${dados.motivoDiligencia}

Link de Acesso para Revisão: ${tramitacaoUrl}

Atenciosamente,
Coordenação Geral de Gestão (SG)
Superintendência de Gestão
Secretaria Municipal de Saúde
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${assunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #78350f 0%, #b45309 100%); padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #fde68a; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
                Coordenação Geral da SG • Devolução para Diligência
              </span>
              <h1 style="color: #ffffff; font-size: 21px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Demanda Devolvida para Revisão
              </h1>
              <p style="color: #fef3c7; font-size: 13px; margin: 0;">
                Demanda <strong>${dados.numeroDemanda}</strong> • ${dados.superintendencia}
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px; font-size: 15px; font-weight: 700; color: #b45309; line-height: 1.6;">
                ${mensagemUsuario}
              </div>

              <!-- Motivo da Diligência -->
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
                <div style="font-size: 11px; font-weight: bold; color: #a16207; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Instruções e Apontamentos da SG:
                </div>
                <div style="font-size: 13px; color: #713f12; line-height: 1.6;">
                  ${dados.motivoDiligencia}
                </div>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Dados da Demanda
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; width: 130px;">Demanda:</td>
                    <td style="padding: 4px 0; font-weight: 600;">${dados.numeroDemanda}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Objeto:</td>
                    <td style="padding: 4px 0; font-weight: 500;">${dados.objeto}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Superintendência:</td>
                    <td style="padding: 4px 0; font-weight: 600;">${dados.superintendencia}</td>
                  </tr>
                </table>
              </div>

              <!-- Botão de Ação -->
              <div style="text-align: center; margin: 30px 0 20px 0;">
                <a href="${tramitacaoUrl}" target="_blank" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.3);">
                  Acessar Plataforma para Revisar
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">
                <strong>SuperGestão Saúde</strong> • Sistema Integrado de Governança, Contratos & Licitações
              </p>
              <p style="margin: 0;">
                Coordenação Geral de Gestão (SG) • Secretaria Municipal de Saúde
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { assunto, text, html };
}

export async function enviarEmailDiligenciaDemanda(
  dados: DadosEmailDiligenciaDemanda
): Promise<ResultadoEnvioEmail> {
  const template = gerarTemplateDiligenciaDemanda(dados);

  return enviarEmail({
    tipo: "DILIGENCIA_DEMANDA",
    to: dados.servidorEmail,
    destinatarioNome: dados.servidorNome,
    subject: template.assunto,
    text: template.text,
    html: template.html,
    autorNome: dados.analistaNome,
    metadados: {
      numeroDemanda: dados.numeroDemanda,
      superintendencia: dados.superintendencia,
      motivoDiligencia: dados.motivoDiligencia,
    },
  });
}

// ============================================================
// TEMPLATE 5: DIRECIONAMENTO DE DEMANDA AO SERVIDOR DA SG
// ============================================================

export interface DadosEmailDirecionamentoSG {
  servidorNome: string;
  servidorEmail: string;
  numeroDemanda: string;
  superintendencia: string;
  objeto: string;
  modalidadeNome: string;
  artigoLei: string;
  numeroProcesso?: string;
  servidorOriginadorNome?: string;
  coordenadoraNome?: string;
  appUrl?: string;
}

export function gerarTemplateDirecionamentoDemandaSG(dados: DadosEmailDirecionamentoSG) {
  const primeiroNome = extrairPrimeiroNome(dados.servidorNome);
  const mensagemUsuario = `Olá, ${primeiroNome}. Segue demanda para que você dê seguimento a mesma. Para qualquer dúvida, estou a disposição! Vamos ao Trabalho!`;
  const urlBase = dados.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const tramitacaoUrl = `${urlBase}/tramitacao`;
  const assunto = `[SuperGestão Saúde] Demanda ${dados.numeroDemanda} Atribuída para Andamento - Olá, ${primeiroNome}`;

  const text = `
${mensagemUsuario}

DADOS DA DEMANDA ATRIBUÍDA:
- Demanda: ${dados.numeroDemanda}
- Modalidade Definida: ${dados.modalidadeNome}
- Fundamentação Legal: ${dados.artigoLei}
${dados.numeroProcesso ? `- Processo Administrativo: ${dados.numeroProcesso}\n` : ""}- Objeto: ${dados.objeto}
- Área Demandante: ${dados.superintendencia}
${dados.servidorOriginadorNome ? `- Servidor Demandante Responsável: ${dados.servidorOriginadorNome}\n` : ""}
Link de Acesso para Acompanhamento: ${tramitacaoUrl}

Atenciosamente,
Dra. Willianne Soares
Coordenadora Geral de Gestão (SG)
Superintendência de Gestão • Secretaria Municipal de Saúde
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${assunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%); padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #c7d2fe; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
                Superintendência de Gestão (SG) • Coordenação Geral
              </span>
              <h1 style="color: #ffffff; font-size: 21px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Demanda Direcionada para Acompanhamento
              </h1>
              <p style="color: #e0e7ff; font-size: 13px; margin: 0;">
                Demanda <strong>${dados.numeroDemanda}</strong> • ${dados.superintendencia}
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px; font-size: 15px; font-weight: 700; color: #4338ca; line-height: 1.6;">
                ${mensagemUsuario}
              </div>

              <!-- Card de Informações -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: bold; color: #4338ca; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  Instruções da Demanda Atribuída
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 140px;">Modalidade:</td>
                    <td style="padding: 5px 0; font-weight: 700; color: #312e81;">${dados.modalidadeNome}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Fundamentação:</td>
                    <td style="padding: 5px 0; font-weight: 600;">${dados.artigoLei}</td>
                  </tr>
                  ${
                    dados.numeroProcesso
                      ? `
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Processo Autuado:</td>
                    <td style="padding: 5px 0; font-weight: 700; color: #047857; font-family: monospace;">${dados.numeroProcesso}</td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Origem:</td>
                    <td style="padding: 5px 0; font-weight: 600;">${dados.superintendencia}</td>
                  </tr>
                  ${
                    dados.servidorOriginadorNome
                      ? `
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Demandante:</td>
                    <td style="padding: 5px 0; font-weight: 600;">${dados.servidorOriginadorNome}</td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; vertical-align: top;">Objeto:</td>
                    <td style="padding: 5px 0; font-weight: 500;">${dados.objeto}</td>
                  </tr>
                </table>
              </div>

              <!-- Botão de Ação -->
              <div style="text-align: center; margin: 30px 0 20px 0;">
                <a href="${tramitacaoUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">
                  Acessar Painel de Tramitação
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">
                <strong>SuperGestão Saúde</strong> • Sistema Integrado de Governança, Contratos & Licitações
              </p>
              <p style="margin: 0;">
                Coordenação Geral de Gestão (SG) • Dra. Willianne Soares
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { assunto, text, html };
}

export async function enviarEmailDirecionamentoDemandaSG(
  dados: DadosEmailDirecionamentoSG
): Promise<ResultadoEnvioEmail> {
  const template = gerarTemplateDirecionamentoDemandaSG(dados);

  return enviarEmail({
    tipo: "DIRECIONAMENTO_SG",
    to: dados.servidorEmail,
    destinatarioNome: dados.servidorNome,
    subject: template.assunto,
    text: template.text,
    html: template.html,
    autorNome: dados.coordenadoraNome || "Dra. Willianne Soares",
    metadados: {
      numeroDemanda: dados.numeroDemanda,
      superintendencia: dados.superintendencia,
      modalidade: dados.modalidadeNome,
      processoNumero: dados.numeroProcesso,
      servidorOriginador: dados.servidorOriginadorNome,
    },
  });
}

