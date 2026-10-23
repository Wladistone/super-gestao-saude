import { NextResponse } from "next/server";
import {
  enviarEmail,
  enviarEmailBoasVindasCadastro,
  enviarEmailCadastroRejeitado,
  enviarEmailEnquadramentoDemanda,
  enviarEmailDiligenciaDemanda,
  enviarEmailDirecionamentoDemandaSG,
  obterConfiguracaoEmail,
} from "@/lib/email-service";

export async function GET() {
  const config = obterConfiguracaoEmail();
  return NextResponse.json({
    status: "online",
    configuracao: {
      modo: config.modo,
      host: config.host || "(Modo Simulado / Registro Interno de Auditoria)",
      port: config.port,
      remetente: config.remetente,
      configurado: config.configurado,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, dados } = body;

    if (tipo === "AUTORIZACAO_CADASTRO") {
      const res = await enviarEmailBoasVindasCadastro(dados);
      return NextResponse.json(res);
    }

    if (tipo === "CADASTRO_REJEITADO") {
      const res = await enviarEmailCadastroRejeitado(dados);
      return NextResponse.json(res);
    }

    if (tipo === "ENQUADRAMENTO_DEMANDA") {
      const res = await enviarEmailEnquadramentoDemanda(dados);
      return NextResponse.json(res);
    }

    if (tipo === "DILIGENCIA_DEMANDA") {
      const res = await enviarEmailDiligenciaDemanda(dados);
      return NextResponse.json(res);
    }

    if (tipo === "DIRECIONAMENTO_SG" || tipo === "DIRECIONAMENTO_DEMANDA_SG") {
      const res = await enviarEmailDirecionamentoDemandaSG(dados);
      return NextResponse.json(res);
    }

    if (tipo === "CUSTOM") {
      const res = await enviarEmail(dados);
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { success: false, error: "Tipo de notificação inválido." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erro na API de envio de e-mails:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao processar disparo de e-mail." },
      { status: 500 }
    );
  }
}
