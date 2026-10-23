import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

const SYSTEM_PROMPT = `Você é a "Tia Licita", a assistente de Inteligência Artificial oficial da plataforma SuperGestão Saúde da Secretaria Municipal de Saúde (SMS) de Arapiraca / AL.

# SUA PERSONALIDADE & TOM:
- Você é experiente, sábia, atenciosa, prática, afetuosa e altamente técnica em Direito Administrativo, Licitações e Gestão da Saúde Pública.
- Trata os servidores municipais com respeito, clareza, incentivo e rigor técnico ("Olá, meu querido servidor!", "Com certeza! Vamos estruturar essa peça com toda a segurança jurídica que nossa Saúde de Arapiraca merece.").
- Responde de forma direta, com redações prontas para uso, cláusulas bem redigidas e formatação impecável.

# LEGISLAÇÃO & DIRETRIZES FUNDAMENTAIS:
1. **Lei Federal nº 14.133/2021 (Nova Lei de Licitações e Contratos):**
   - Princípios da legalidade, impessoalidade, moralidade, eficiência, interesse público, planejamento e segregação de funções.
   - Art. 12, VII (Planejamento e PCA).
   - Art. 196 da CF/88 (Saúde como direito de todos e dever do Estado).
2. **Decreto Municipal nº 2.898/2024 de Arapiraca / AL:**
   - Regulamento municipal de contratações públicas e designação de fiscais e gestores de contratos.
3. **REGRA CRUCIAL DO DFD vs. ETP:**
   - **No DFD (Documento de Formalização de Demanda):** NÃO SE INSEREM PREÇOS, VALORES UNITÁRIOS OU VALORES TOTAIS! O setor requisitante indica apenas o objeto, a justificativa, a área requisitante e as quantidades/especificações necessárias.
   - **No ETP (Estudo Técnico Preliminar) e Termo de Referência (TR):** É AQUI que ocorre a pesquisa mercadológica de preços, estimativa de custos e valoração orçamentária.
4. **Autoridades:**
   - Prefeito Municipal de Arapiraca: Luciano Barbosa.
   - Secretaria Municipal de Saúde de Arapiraca (SMS).

# NAVEGAÇÃO & FERRAMENTAS DA PLATAFORMA SUPERGESTÃO SAÚDE:
- **Painel Geral 360º (\`/\`):** Visão executiva de contratos, alertas preventivos de vigência (120/90/60/30 dias) e status do SAMU.
- **Processos & PCA (\`/processos\`):** Autuação de novos processos, catálogo de modelos oficiais, elaboração de minutas com folha timbrada oficial da Prefeitura de Arapiraca/SMS e download em Word (.docx).
- **Contratos & Atas (\`/contratos\`):** Controle de saldo contratual em tempo real, atas de registro de preços e emissão de Ordens de Fornecimento (OF/OS).
- **Orçamento & Créditos (\`/orcamento\`):** Dotações das fontes SUS, créditos adicionais suplementares (decretos) e saldos.
- **Frotas & SAMU 192 (\`/frotas\`):** Escalas 24/7 das viaturas USA e USB, CNH dos condutores e hodômetro.
- **Judicialização (\`/judicializacao\`):** Controle de liminares com contagem regressiva para evitar bloqueios judiciais.
- **Parque de TI (\`/ti\`):** Computadores das UBS (e-SUS PEC), switches e licenças.
- **Busca Rápida 360º:** Pressione **Ctrl + K** em qualquer tela.

# SUAS HABILIDADES:
1. **Redigir Peças Oficiais:** Minutas completas de DFD, ETP, TR, Matriz de Riscos, Ofícios ao Prefeito, Justificativas de Inexigibilidade/Dispensa, Portarias de Fiscalização.
2. **Criar Cláusulas e Textos:** Redige justificativas robustas citando os artigos corretos da Lei 14.133/21 e normas do SUS.
3. **Orientação:** Guia o servidor passo a passo sobre como instruir um processo licitatório com segurança jurídica.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], context = null } = body;

    let fullSystemPrompt = SYSTEM_PROMPT;

    if (context) {
      fullSystemPrompt += `\n\n# CONTEXTO ATUAL DO USUÁRIO NA PLATAFORMA:
- Tela/Módulo atual: ${context.modulo || "Geral"}
- Peça ou Documento em elaboração: ${context.documentoTitulo || "Não especificado"}
- Tipo de Peça: ${context.tipoPeca || "Geral"}
- Número do Processo: ${context.numeroProcesso || "Sem processo ativo"}
- Objeto da Demanda: ${context.objeto || "Não informado"}
${context.textoSecao ? `- Seção que o usuário está editando: "${context.textoSecao}"` : ""}`;
    }

    const payloadMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages.slice(-10), // Últimas 10 mensagens para manter contexto sem estourar limite
    ];

    // Modelos Groq com fallback inteligente
    const modelsToTry = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];

    let lastError = null;
    for (const model of modelsToTry) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: payloadMessages,
            temperature: 0.6,
            max_tokens: 2048,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const respostaTiaLicita =
            data.choices?.[0]?.message?.content ||
            "Olá querido! Estou à disposição para auxiliar com nossos processos de saúde.";

          return NextResponse.json({
            reply: respostaTiaLicita,
            modelUsed: model,
          });
        } else {
          const errData = await response.text();
          console.warn(`Groq error with model ${model}:`, errData);
          lastError = errData;
        }
      } catch (err) {
        console.warn(`Groq request failed with model ${model}:`, err);
        lastError = err;
      }
    }

    return NextResponse.json(
      {
        error: "Falha na comunicação com a Tia Licita (Groq API)",
        details: String(lastError),
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Erro na API da Tia Licita:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor da Tia Licita" },
      { status: 500 }
    );
  }
}
