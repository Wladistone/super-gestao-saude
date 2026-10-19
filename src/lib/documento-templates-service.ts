import JSZip from "jszip";
import { DocumentoElaborado, ItemDocumento, SecaoDocumento } from "./types";
import { ModeloDocumentoProcesso } from "@/data/modelos-licitacao-catalog";

// Formatação de data em português para documentos oficiais
export function formatarDataExtenso(dataStr?: string): string {
  const d = dataStr ? new Date(dataStr) : new Date();
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return `Arapiraca/AL, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

export interface ContextoElaboracao {
  processoId?: string;
  numeroProcesso?: string;
  numeroCapa?: string;
  demandaId?: string;
  objeto?: string;
  modalidade?: string;
  superintendenciaOrigem?: string;
  valorEstimado?: number;
  servidorNome?: string;
  servidorMatricula?: string;
  servidorCargo?: string;
  // Campos de Contrato / Parecer de Aceitação
  contratoId?: string;
  numeroContrato?: string;
  contratadaNome?: string;
  contratadaCnpj?: string;
  contratadaEndereco?: string;
  dataAssinatura?: string;
  vigenciaFim?: string;
  valorPagamento?: string;
  numeroNotaFiscal?: string;
  clausulaContrato?: string;
  itens?: {
    descricao: string;
    unidade?: string;
    quantidade: number;
    valorUnitario?: number;
    valorTotal?: number;
  }[];
}

// Gera o modelo inicial com base no tipo da peça e contexto
export function gerarDocumentoInicial(
  modelo: ModeloDocumentoProcesso,
  contexto?: ContextoElaboracao
): DocumentoElaborado {
  const hoje = new Date().toISOString().split("T")[0];
  const dataExtenso = formatarDataExtenso(hoje);

  const isParecerAceitacao =
    modelo.tipoPeca === "Parecer de Aceitação" ||
    modelo.titulo.toUpperCase().includes("PARECER DE ACEITAÇÃO");

  const numProcesso = contexto?.numeroProcesso || (isParecerAceitacao ? "PA-2025/00133" : "PA-2025/00294");
  const numCapa = contexto?.numeroCapa || (isParecerAceitacao ? "CP-015/25" : "CP-031/25");
  const obj =
    contexto?.objeto ||
    (isParecerAceitacao
      ? "Recebimento e Aceite Definitivo de Fornecimento de Gases Medicinais e Oxigênio Líquido - Nota Fiscal nº 000.001.783 (Contrato Administrativo nº 1133/2025)."
      : "Aquisição de insumos hospitalares e aparelhos para atender às demandas das Unidades de Saúde da Rede Municipal da Secretaria de Saúde de Arapiraca.");
  const modalidade = contexto?.modalidade || modelo.modalidade;
  const orgaoReq =
    contexto?.superintendenciaOrigem ||
    "Superintendência de Gestão (SG) - Secretaria Municipal de Saúde";
  const servidor =
    contexto?.servidorNome || (isParecerAceitacao ? "Eugênio Pereira de Sousa" : "Laura Rossana Acioly de Carvalho Rios");
  const matricula = contexto?.servidorMatricula || (isParecerAceitacao ? "148920" : "143660");
  const cargo =
    contexto?.servidorCargo || (isParecerAceitacao ? "Gestor de Contrato Titular" : "Superintendente de Atenção à Saúde");
  const respTecnico = "Aparecido Barbosa Silva";
  const matTecnico = "143657";

  const itensConvertidos: ItemDocumento[] =
    contexto?.itens && contexto.itens.length > 0
      ? contexto.itens.map((it, idx) => ({
          item: idx + 1,
          descricao: it.descricao,
          unidade: it.unidade || "UNID",
          quantidade: it.quantidade,
          valorUnitario: it.valorUnitario,
          valorTotal: it.valorTotal,
        }))
      : isParecerAceitacao
      ? [
          {
            item: 1,
            descricao: "Oxigênio Medicinal Gasoso e Líquido - Recarga e Fornecimento Contínuo (Nota Fiscal nº 000.001.783)",
            unidade: "M³",
            quantidade: 360,
            valorUnitario: 8.30,
            valorTotal: 2988.0,
          },
        ]
      : [
          {
            item: 1,
            descricao: "Aparelho de Ar-Condicionado Split 12.000 BTUs Inverter Classe A",
            unidade: "UNID",
            quantidade: 25,
            valorUnitario: 2450.0,
            valorTotal: 61250.0,
          },
          {
            item: 2,
            descricao: "Aparelho de Ar-Condicionado Split 18.000 BTUs Inverter Classe A",
            unidade: "UNID",
            quantidade: 15,
            valorUnitario: 3350.0,
            valorTotal: 50250.0,
          },
        ];

  // Seções específicas pelo tipo de peça
  const secoes = obterSecoesPadrao(modelo.tipoPeca, {
    objeto: obj,
    orgaoReq,
    servidor,
    matricula,
    cargo,
    respTecnico,
    matTecnico,
    numProcesso,
    modalidade,
    numeroContrato: contexto?.numeroContrato,
    contratadaNome: contexto?.contratadaNome,
    contratadaCnpj: contexto?.contratadaCnpj,
    contratadaEndereco: contexto?.contratadaEndereco,
    dataAssinatura: contexto?.dataAssinatura,
    vigenciaFim: contexto?.vigenciaFim,
    valorPagamento: contexto?.valorPagamento,
    numeroNotaFiscal: contexto?.numeroNotaFiscal,
    clausulaContrato: contexto?.clausulaContrato,
  });

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    modeloId: modelo.id,
    titulo: modelo.titulo,
    tipoPeca: modelo.tipoPeca,
    modalidade,
    artigoLei: modelo.artigoLei,
    processoId: contexto?.processoId,
    numeroProcesso: numProcesso,
    numeroCapa: numCapa,
    demandaId: contexto?.demandaId,
    dataDocumento: hoje,
    cidadeDataExtenso: dataExtenso,
    orgaoRequisitante: orgaoReq,
    servidorResponsavel: servidor,
    matriculaServidor: matricula,
    cargoServidor: cargo,
    responsavelTecnico: respTecnico,
    matriculaTecnico: matTecnico,
    objeto: obj,
    justificativa:
      "A presente contratação fundamenta-se na Lei Federal nº 14.133/2021 e no Art. 196 da Constituição Federal de 1988, garantindo que o acesso à saúde é direito de todos e dever do Estado. A medida é indispensável para assegurar a continuidade, humanização e segurança das atividades prestadas pelas Unidades Básicas de Saúde e Serviços Especializados de Arapiraca/AL.",
    itens: itensConvertidos,
    secoes,
    status: "RASCUNHO",
    downloadUrlOriginal: modelo.downloadUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function obterSecoesPadrao(
  tipoPeca: string,
  ctx: {
    objeto: string;
    orgaoReq: string;
    servidor: string;
    matricula: string;
    cargo?: string;
    respTecnico: string;
    matTecnico: string;
    numProcesso: string;
    modalidade: string;
    numeroContrato?: string;
    contratadaNome?: string;
    contratadaCnpj?: string;
    contratadaEndereco?: string;
    dataAssinatura?: string;
    vigenciaFim?: string;
    valorPagamento?: string;
    numeroNotaFiscal?: string;
    clausulaContrato?: string;
  }
): SecaoDocumento[] {
  switch (tipoPeca) {
    case "DFD":
      return [
        {
          id: "sec-1",
          titulo: "1. Objeto da Demanda",
          conteudo: ctx.objeto,
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "2. Área Requisitante",
          conteudo: ctx.orgaoReq,
          obrigatoria: true,
        },
        {
          id: "sec-3",
          titulo: "3. Responsável pela Demanda",
          conteudo: `${ctx.servidor}, Matrícula nº ${ctx.matricula}.`,
          obrigatoria: true,
        },
        {
          id: "sec-4",
          titulo: "4. Responsável Técnico pela Demanda",
          conteudo: `${ctx.respTecnico}, Matrícula nº ${ctx.matTecnico}.`,
          obrigatoria: true,
        },
        {
          id: "sec-5",
          titulo: "5. Justificativa da Necessidade Pública",
          conteudo:
            "Tendo como base legal a Lei Federal nº 14.133/2021 (art. 12, inciso VII). O direito à saúde, consagrado como direito social no art. 6º da CF/88 e no art. 196, exige a atuação direta do Poder Público para garantir ambientes dignos e climatizados nas unidades municipais de saúde de Arapiraca.",
          obrigatoria: true,
        },
        {
          id: "sec-6",
          titulo: "6. Previsão no Plano de Contratações Anual (PCA)",
          conteudo:
            "A demanda encontra-se alinhada às metas do Plano de Contratações Anual (PCA) do exercício financeiro, possuindo dotação orçamentária compatível.",
        },
        {
          id: "sec-7",
          titulo: "7. Indicação dos Membros da Fiscalização",
          conteudo:
            "Indica-se a designação de Gestor e Fiscais de Contrato conforme previsto no Decreto Municipal nº 2.898/2024 e Art. 117 da Lei 14.133/2021.",
        },
      ];

    case "ETP":
      return [
        {
          id: "sec-1",
          titulo: "1. Descrição da Necessidade",
          conteudo:
            "Conforme art. 18, § 1º, I da Lei 14.133/2021, evidencia-se a imperiosa necessidade de atendimento às unidades de saúde pública para assegurar a dignidade do paciente e a salubridade dos profissionais do SUS.",
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "2. Requisitos da Contratação",
          conteudo:
            "Os bens/serviços deverão observar padrões rígidos de qualidade, garantia mínima de 12 meses, eficiência energética e assistência técnica autorizada.",
          obrigatoria: true,
        },
        {
          id: "sec-3",
          titulo: "3. Levantamento de Mercado e Análise das Soluções",
          conteudo:
            "Foram avaliadas soluções de mercado disponíveis, optando-se pela alternativa mais eficiente e econômica que melhor atende às peculiaridades da Rede Municipal de Arapiraca.",
        },
        {
          id: "sec-4",
          titulo: "4. Estimativa das Quantidades a Serem Contratadas",
          conteudo:
            "O quantitativo foi dimensionado considerando o histórico de consumo, o número de unidades ativas e o plano de expansão dos serviços de saúde.",
        },
        {
          id: "sec-5",
          titulo: "5. Estimativa do Valor da Contratação",
          conteudo:
            "O valor de referência será apurado mediante pesquisa formal de preços em consonância com o Art. 23 da Lei Federal nº 14.133/2021.",
        },
        {
          id: "sec-6",
          titulo: "6. Declaração de Viabilidade da Contratação",
          conteudo:
            "Com base nos elementos técnicos analisados, declara-se VIÁVEL a realização do procedimento com base no Art. 18, § 2º da Lei 14.133/2021.",
          obrigatoria: true,
        },
      ];

    case "Matriz de Riscos":
      return [
        {
          id: "sec-1",
          titulo: "1. Identificação do Objeto e Responsáveis",
          conteudo: `Objeto: ${ctx.objeto}\nResponsáveis pela Elaboração: ${ctx.servidor} e ${ctx.respTecnico}.`,
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "2. Risco de Inadequação da Modalidade Licitatória",
          conteudo:
            "Probabilidade: Baixa | Impacto: Alto | Ação Preventiva: Fixação de enquadramento fundamentado pela Superintendência de Gestão (SG) com base na Lei 14.133/21.",
        },
        {
          id: "sec-3",
          titulo: "3. Risco de Fracasso ou Deserção do Certame",
          conteudo:
            "Probabilidade: Média | Impacto: Alto | Ação Preventiva: Ampla pesquisa de mercado, termo de referência detalhado e publicidade oficial nos termos da lei.",
        },
        {
          id: "sec-4",
          titulo: "4. Risco de Inadimplemento ou Atraso na Entrega",
          conteudo:
            "Probabilidade: Baixa | Impacto: Médio | Ação de Contingência: Notificação prévia pela fiscalização, aplicação de sanções administrativas e convocação do remanescente.",
        },
      ];

    case "Termo de Referência (TR)":
      return [
        {
          id: "sec-1",
          titulo: "1. Definição do Objeto e Solução Escolhida",
          conteudo: ctx.objeto,
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "2. Justificativa e Motivação da Contratação",
          conteudo:
            "A contratação se justifica pela necessidade ininterrupta de abastecimento e manutenção da infraestrutura de saúde do Município de Arapiraca.",
          obrigatoria: true,
        },
        {
          id: "sec-3",
          titulo: "3. Especificações Técnicas e Critérios de Recebimento",
          conteudo:
            "Os produtos devem ser entregues lacrados, com nota fiscal, certificado de garantia e em conformidade estrita com o edital no Almoxarifado Central da SMS.",
        },
        {
          id: "sec-4",
          titulo: "4. Obrigações da Contratada e da Contratante",
          conteudo:
            "A contratada compromete-se com a entrega pontual no prazo de até 15 dias corridos; o Município compromete-se com a liquidação e pagamento regular.",
        },
        {
          id: "sec-5",
          titulo: "5. Gestão e Fiscalização Contratual",
          conteudo:
            "A fiscalização será exercida por servidores formalmente designados por Portaria da Secretária Municipal de Saúde (Decreto Municipal nº 2.898/2024).",
        },
      ];

    case "Memorando de Encaminhamento":
    case "Memorando de Comunicação":
      return [
        {
          id: "sec-1",
          titulo: "Destinatário Oficial",
          conteudo:
            "À Senhora\nRAFAELLA SOUZA ALBUQUERQUE\nSecretária Municipal de Saúde\nSecretaria Municipal de Saúde - SMS / Arapiraca-AL",
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "Assunto",
          conteudo: `Solicitação / Comunicação Oficial - ${ctx.objeto}`,
          obrigatoria: true,
        },
        {
          id: "sec-3",
          titulo: "Exposição de Motivos",
          conteudo:
            "Senhora Secretária,\n\nEncaminhamos a Vossa Senhoria o presente expediente solicitando as providências administrativas pertinentes para o regular atendimento das demandas da rede de saúde de Arapiraca.",
          obrigatoria: true,
        },
      ];

    case "Ofício":
      return [
        {
          id: "sec-destinatario",
          titulo: "Destinatário Oficial",
          conteudo:
            "Ao(À) Excelentíssimo(a) Senhor(a)\nSecretário(a) Municipal da Fazenda e Gestão\nPrefeitura Municipal de Arapiraca / AL",
          obrigatoria: true,
        },
        {
          id: "sec-assunto",
          titulo: "Assunto",
          conteudo: `Assunto: ${ctx.objeto}`,
          obrigatoria: true,
        },
        {
          id: "sec-vocativo",
          titulo: "Vocativo e Cumprimento",
          conteudo: "Senhor(a) Secretário(a),",
          obrigatoria: true,
        },
        {
          id: "sec-texto",
          titulo: "Texto Oficial / Solicitação",
          conteudo: `Cumprimentando-o(a) cordialmente, servimo-nos do presente para solicitar a Vossa Senhoria as providências administrativas e orçamentárias necessárias para atender à demanda de saúde pública referente a: ${ctx.objeto}, conforme instrução formalizada no Processo Administrativo nº ${ctx.numProcesso}.`,
          obrigatoria: true,
        },
        {
          id: "sec-fundamentacao",
          titulo: "Fundamentação Legal & Recursos",
          conteudo:
            "A presente solicitação encontra amparo na Lei Federal nº 14.133/2021, na Lei de Responsabilidade Fiscal (LC 101/2000) e na Lei Federal nº 4.320/1964, destinando-se a garantir a regularidade das ações da Secretaria Municipal de Saúde de Arapiraca.",
        },
        {
          id: "sec-fecho",
          titulo: "Fecho de Cortesia",
          conteudo:
            "Certos de contarmos com a costumeira atenção de Vossa Senhoria, renovamos nossos protestos de elevada estima e consideração.\n\nAtenciosamente,",
          obrigatoria: true,
        },
      ];

    case "Despacho Administrativo":
      return [
        {
          id: "sec-1",
          titulo: "Assunto do Despacho",
          conteudo: `Autorização e Deliberação para Prosseguimento do Processo Administrativo nº ${ctx.numProcesso}.`,
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "Deliberação da Autoridade Superior",
          conteudo:
            "Autorizo a Superintendência de Gestão (SG) a adotar as providências administrativas e legais cabíveis para o regular prosseguimento do feito, com observância estrita da Lei Federal nº 14.133/2021.",
          obrigatoria: true,
        },
      ];

    case "Parecer de Aceitação":
    case "Parecer Técnico": {
      const numContrato = ctx.numeroContrato || "1133/2025";
      const contratada = ctx.contratadaNome || "Empresa VIDA OXIGÊNIO LTDA";
      const cnpj = ctx.contratadaCnpj || "44.735.857/0001-25";
      const endereco =
        ctx.contratadaEndereco ||
        "Rua José Adilson da Silva, nº 10, Bairro Domingos Acácio, CEP: 57.500-000";
      const dataAssinatura = ctx.dataAssinatura || "30 de janeiro de 2025";
      const valorPagamento =
        ctx.valorPagamento || "R$ 2.988,00 (dois mil, novecentos e oitenta e oito reais)";
      const notaFiscal = ctx.numeroNotaFiscal || "000.001.783";
      const clausula = ctx.clausulaContrato || "Cláusula Décima Quarta";

      return [
        {
          id: "sec-contrato",
          titulo: "1. Dados do Contrato e Contratada",
          conteudo:
            `Contrato nº ${numContrato}\n` +
            `Vigência do Contrato: A vigência do contrato será de 12 (doze) meses contados da data de assinatura do contrato, podendo ser prorrogado por até 05 (cinco) anos, nos termos do art. 107 da Lei nº 14133/2021.\n` +
            `Data de assinatura: ${dataAssinatura}.\n` +
            `Razão Social da Contratada: ${contratada}\n` +
            `Valor do Pagamento: ${valorPagamento}.`,
          obrigatoria: true,
        },
        {
          id: "sec-declaracao",
          titulo: "2. Declaração do Gestor e Verificação Técnica",
          conteudo:
            `Na qualidade de Gestor do Contrato n° ${numContrato}, celebrado entre este município e a ${contratada}, com CNPJ n° ${cnpj}, sediada na ${endereco}, em atendimento a ${clausula}, do Contrato acima referenciado, declaro que os itens especificados na nota fiscal: de Nº ${notaFiscal}, foram efetivamente fornecidos, conferidos e aceitos definitivamente.`,
          obrigatoria: true,
        },
        {
          id: "sec-aprovacao",
          titulo: "3. Conclusão e Total Aprovação",
          conteudo:
            "Os itens foram submetidos a verificação deste Gestor, sendo considerados aceitos por atender aos requisitos da quantidade, qualidade desejada e ainda às especificações estabelecidas, tudo em conformidade com o Contrato em comento, celebrado entre a Município de Arapiraca e a CONTRATADA, reunindo condições de total aprovação.",
          obrigatoria: true,
        },
      ];
    }

    case "Portaria":
      return [
        {
          id: "sec-1",
          titulo: "Preâmbulo e Fundamentação da Portaria",
          conteudo:
            "A SECRETÁRIA MUNICIPAL DE SAÚDE DE ARAPIRACA, no uso de suas atribuições legais e em conformidade com o Decreto Municipal nº 2.898/2024 e Art. 117 da Lei Federal nº 14.133/2021, RESOLVE:",
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "Artigo 1º - Designação de Gestor e Fiscal Titulares",
          conteudo: `Designar os servidores ${ctx.servidor}, Matrícula nº ${ctx.matricula}, e ${ctx.respTecnico}, Matrícula nº ${ctx.matTecnico}, para desempenharem as funções de Gestor e Fiscal do Contrato resultante do Processo nº ${ctx.numProcesso}.`,
          obrigatoria: true,
        },
        {
          id: "sec-3",
          titulo: "Artigo 2º - Atribuições e Vigência",
          conteudo:
            "Os fiscais deverão acompanhar a execução do objeto, atestar notas fiscais e relatar formalmente eventuais intercorrências. Esta portaria entra em vigor na data de sua publicação.",
        },
      ];

    default:
      return [
        {
          id: "sec-1",
          titulo: "1. Objeto",
          conteudo: ctx.objeto,
          obrigatoria: true,
        },
        {
          id: "sec-2",
          titulo: "2. Justificativa Legal",
          conteudo:
            "Documento elaborado em estrita conformidade com as normas da Lei Federal nº 14.133/2021 e Decretos Regulamentares do Município de Arapiraca.",
          obrigatoria: true,
        },
        {
          id: "sec-3",
          titulo: "3. Disposições Gerais",
          conteudo:
            "Encaminhe-se aos setores competentes para as devidas anotações e prosseguimento instrucional.",
        },
      ];
  }
}

// -----------------------------------------------------------------------------------
// GERAÇÃO DE ARQUIVO .DOCX COM TIMBRE OFICIAL PRESERVADO
// -----------------------------------------------------------------------------------

// Converte caracteres especiais para entidades XML seguras
function xmlEscape(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Constrói parágrafos XML compatíveis com Word
function criarParagrafoXml(
  texto: string,
  opcoes?: {
    bold?: boolean;
    center?: boolean;
    size?: number;
    spaceBefore?: number;
    spaceAfter?: number;
  }
): string {
  const align = opcoes?.center ? `<w:jc w:val="center"/>` : `<w:jc w:val="both"/>`;
  const bold = opcoes?.bold ? `<w:b/>` : "";
  const sz = opcoes?.size ? `<w:sz w:val="${opcoes.size}"/>` : `<w:sz w:val="24"/>`;
  const spaceBefore = opcoes?.spaceBefore ?? 120;
  const spaceAfter = opcoes?.spaceAfter ?? 120;

  return `<w:p>
    <w:pPr>
      ${align}
      <w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}" w:line="360" w:lineRule="auto"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        ${bold}
        ${sz}
      </w:rPr>
      <w:t xml:space="preserve">${xmlEscape(texto)}</w:t>
    </w:r>
  </w:p>`;
}

// Constrói tabela XML para itens da contratação
function criarTabelaItensXml(itens: ItemDocumento[], isDFD = false): string {
  if (!itens || itens.length === 0) return "";

  const headerRow = isDFD
    ? `
    <w:tr>
      <w:trPr><w:tblHeader/></w:trPr>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Item</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="6000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Descrição do Item / Objeto</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Unid</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Quantidade</w:t></w:r></w:p></w:tc>
    </w:tr>`
    : `
    <w:tr>
      <w:trPr><w:tblHeader/></w:trPr>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="800" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Item</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="4800" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Descrição do Item</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Unid</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Qtd</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="1200" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Valor Unit.</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/><w:tcW w:w="1200" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Total</w:t></w:r></w:p></w:tc>
    </w:tr>`;

  const dataRows = itens
    .map((it) =>
      isDFD
        ? `
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${it.item}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${xmlEscape(it.descricao)}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${xmlEscape(it.unidade)}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${it.quantidade}</w:t></w:r></w:p></w:tc>
    </w:tr>`
        : `
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="800" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${it.item}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="4800" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${xmlEscape(it.descricao)}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${xmlEscape(it.unidade)}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${it.quantidade}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1200" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${it.valorUnitario ? "R$ " + it.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-"}</w:t></w:r></w:p></w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1200" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${it.valorTotal ? "R$ " + it.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-"}</w:t></w:r></w:p></w:tc>
    </w:tr>`
    )
    .join("");

  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="10000" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
      </w:tblBorders>
    </w:tblPr>
    ${headerRow}
    ${dataRows}
  </w:tbl>`;
}

// Gera o arquivo .docx mantendo o timbre original de Arapiraca
export async function gerarArquivoDocxComTimbre(
  doc: DocumentoElaborado
): Promise<Blob> {
  const zip = new JSZip();

  // Tentamos carregar o arquivo modelo original que possui o timbre oficial
  let templateBuffer: ArrayBuffer | null = null;
  if (doc.downloadUrlOriginal) {
    try {
      const resp = await fetch(doc.downloadUrlOriginal);
      if (resp.ok) {
        templateBuffer = await resp.arrayBuffer();
      }
    } catch (e) {
      console.warn("Não foi possível carregar o template original pela URL:", e);
    }
  }

  // Se não foi possível baixar pela rota relativa, tenta o modelo padrão de referência
  if (!templateBuffer) {
    try {
      const fallbackUrl =
        "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/01 - DFD - ADESÃO DE ATA.docx";
      const resp = await fetch(fallbackUrl);
      if (resp.ok) {
        templateBuffer = await resp.arrayBuffer();
      }
    } catch (e) {
      console.warn("Fallback de modelo não carregado:", e);
    }
  }

  let originalDocXml = "";
  let sectPr = "";

  if (templateBuffer) {
    await zip.loadAsync(templateBuffer);
    const existingDoc = await zip.file("word/document.xml")?.async("string");
    if (existingDoc) {
      originalDocXml = existingDoc;
      const sectMatch = existingDoc.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
      if (sectMatch) {
        sectPr = sectMatch[0];
      }
    }
  }

  // Fallback de sectPr vinculando ao cabeçalho (rId6/rId7)
  if (!sectPr) {
    sectPr = `<w:sectPr>
      <w:headerReference r:id="rId6" w:type="default"/>
      <w:footerReference r:id="rId7" w:type="default"/>
      <w:pgSz w:h="16838" w:w="11906" w:orient="portrait"/>
      <w:pgMar w:bottom="1020" w:top="1780" w:right="1440" w:left="1440" w:header="720" w:footer="720"/>
    </w:sectPr>`;
  }

  // Montagem do corpo do documento elaborado pelo servidor
  const partesXml: string[] = [];

  // Título do Documento
  partesXml.push(
    criarParagrafoXml(doc.titulo.toUpperCase(), {
      bold: true,
      center: true,
      size: 28,
      spaceBefore: 180,
      spaceAfter: 300,
    })
  );

  // Se houver texto livre, usa os parágrafos dele
  if (doc.textoLivre && doc.textoLivre.trim().length > 0) {
    const linhas = doc.textoLivre.split("\n");
    for (const linha of linhas) {
      if (linha.trim()) {
        const isTitulo = /^\d+(\.\d+)*\./.test(linha.trim()) || /^[A-Z\s]{4,}:/.test(linha.trim());
        partesXml.push(
          criarParagrafoXml(linha.trim(), {
            bold: isTitulo,
            size: isTitulo ? 24 : 22,
            spaceBefore: isTitulo ? 200 : 80,
            spaceAfter: 80,
          })
        );
      }
    }
  } else {
    // Modo estruturado: renderiza as seções
    for (const secao of doc.secoes) {
      partesXml.push(
        criarParagrafoXml(secao.titulo, {
          bold: true,
          size: 24,
          spaceBefore: 240,
          spaceAfter: 80,
        })
      );

      const paragrafosConteudo = secao.conteudo.split("\n");
      for (const p of paragrafosConteudo) {
        if (p.trim()) {
          partesXml.push(
            criarParagrafoXml(p.trim(), {
              size: 22,
              spaceBefore: 60,
              spaceAfter: 100,
            })
          );
        }
      }

      // Se for a seção de itens ou objeto, renderiza tabela de itens
      if (
        (secao.titulo.toLowerCase().includes("objeto") ||
          secao.titulo.toLowerCase().includes("item") ||
          secao.titulo.toLowerCase().includes("quantitativo")) &&
        doc.itens.length > 0
      ) {
        const isDFD =
          doc.tipoPeca === "DFD" ||
          doc.titulo.toUpperCase().includes("DFD") ||
          Boolean(doc.modeloId && doc.modeloId.toUpperCase().includes("DFD"));
        partesXml.push(criarTabelaItensXml(doc.itens, isDFD));
      }
    }
  }

  // Data e local
  partesXml.push(
    criarParagrafoXml(doc.cidadeDataExtenso || formatarDataExtenso(doc.dataDocumento), {
      center: true,
      size: 22,
      spaceBefore: 360,
      spaceAfter: 240,
    })
  );

  // Bloco de Assinatura
  partesXml.push(
    criarParagrafoXml("____________________________________________________", {
      center: true,
      size: 20,
      spaceBefore: 200,
      spaceAfter: 40,
    })
  );
  partesXml.push(
    criarParagrafoXml(doc.servidorResponsavel, {
      bold: true,
      center: true,
      size: 22,
      spaceBefore: 0,
      spaceAfter: 40,
    })
  );
  partesXml.push(
    criarParagrafoXml(`${doc.cargoServidor} - Matrícula nº ${doc.matriculaServidor}`, {
      center: true,
      size: 20,
      spaceBefore: 0,
      spaceAfter: 40,
    })
  );
  partesXml.push(
    criarParagrafoXml(doc.orgaoRequisitante, {
      center: true,
      size: 18,
      spaceBefore: 0,
      spaceAfter: 120,
    })
  );
  partesXml.push(
    criarParagrafoXml("[Documento elaborado e autenticado via SuperGestão Saúde]", {
      center: true,
      size: 16,
      spaceBefore: 40,
      spaceAfter: 0,
    })
  );

  // Monta o novo document.xml mantendo w:document e w:body
  const novoDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:body>
    ${partesXml.join("\n")}
    ${sectPr}
  </w:body>
</w:document>`;

  zip.file("word/document.xml", novoDocumentXml);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return blob;
}

// Disparo de download no navegador
export function downloadBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
