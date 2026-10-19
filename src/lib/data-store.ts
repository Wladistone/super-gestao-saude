import {
  ProcessoAdministrativo,
  StatusProcesso,
  ItemPCA,
  DotacaoOrcamentaria,
  CreditoAdicional,
  Fornecedor,
  AtaRegistroPrecos,
  Contrato,
  ItemContrato,
  OrdemFornecimentoServico,
  PagamentoLiquidacao,
  Veiculo,
  Motorista,
  Abastecimento,
  ManutencaoVeiculo,
  EscalaPlantao24x7,
  AtivoTI,
  LicencaSoftware,
  DemandaJudicial,
  VinculoExecucao,
  Usuario,
  RegistroControleCredito,
  ContaOrcamentariaCredito,
  CadastrosReferencia,
  DemandaPreviaProcesso,
  ItemDemandaPrevia,
  SuperintendenciaSigla,
  StatusDemandaPrevia,
  DocumentoElaborado,
  SolicitacaoCadastro,
  PermissaoModulo,
} from "./types";
import {
  INITIAL_CONTROLE_CREDITOS,
  INITIAL_CONTAS_CREDITOS,
  CADASTROS_CREDITOS,
} from "@/data/creditos-adicionais-data";
import { MODELOS_LICITACAO_CATALOG, ModeloDocumentoProcesso } from "@/data/modelos-licitacao-catalog";
import {
  INITIAL_DEMANDAS_PREVIAS,
  SUPERINTENDENCIAS_SMS,
} from "@/data/demandas-previas-data";
import { getDaysRemaining } from "./utils";

// -------------------------------------------------------------
// SEED INICIAL REALISTA - SUPERINTENDÊNCIA DE GESTÃO DA SAÚDE
// -------------------------------------------------------------

const INITIAL_USUARIOS: Usuario[] = [
  {
    id: "usr-coord-geral",
    nome: "Dra. Willianne Soares",
    email: "will2026@gmail.com",
    senha: "123456",
    cpf: "098.765.432-11",
    matricula: "SG-2026-001",
    cargo: "Coordenadora Geral de Gestão",
    setor: "Coordenação Geral de Gestão (SG)",
    perfil: "ADMINISTRADOR",
    ativo: true,
    whatsapp: "(82) 99876-5432",
  },
  {
    id: "usr-1",
    nome: "Dr. Carlos Eduardo Menezes",
    email: "carlos.menezes@saude.gov.br",
    cpf: "123.456.789-00",
    cargo: "Superintendente de Gestão",
    setor: "Superintendência Executiva",
    perfil: "ADMINISTRADOR",
    ativo: true,
  },
  {
    id: "usr-2",
    nome: "Mariana Alcantara Rios",
    email: "mariana.rios@saude.gov.br",
    cpf: "234.567.890-11",
    cargo: "Diretora de Compras e Contratos",
    setor: "Divisão de Contratos",
    perfil: "GESTOR_CONTRATOS",
    ativo: true,
  },
  {
    id: "usr-3",
    nome: "Felipe Bastos Oliveira",
    email: "felipe.bastos@saude.gov.br",
    cpf: "345.678.901-22",
    cargo: "Fiscal Técnico Titular",
    setor: "Assistência Farmacêutica",
    perfil: "FISCAL_CONTRATO",
    ativo: true,
  },
  {
    id: "usr-4",
    nome: "Tenente Roberto Nogueira",
    email: "roberto.nogueira@saude.gov.br",
    cpf: "456.789.012-33",
    cargo: "Coordenador de Transportes e Frotas",
    setor: "Coordenação de Transportes e Logística (TFD/Frota Municipal)",
    perfil: "COORDENACAO_FROTAS",
    ativo: true,
  },
  {
    id: "usr-5",
    nome: "Juliana Mendes Prado",
    email: "juliana.prado@saude.gov.br",
    cpf: "567.890.123-44",
    cargo: "Procuradora Adjunta da Saúde",
    setor: "Núcleo de Judicialização da Saúde",
    perfil: "JUDICIALIZACAO",
    ativo: true,
  },
  {
    id: "usr-6",
    nome: "Lucas Silveira Dantas",
    email: "lucas.dantas@saude.gov.br",
    cpf: "678.901.234-55",
    cargo: "Diretor de Orçamento e Finanças",
    setor: "Contabilidade e Orçamento",
    perfil: "ORCAMENTO_FINANCAS",
    ativo: true,
  },
  {
    id: "usr-7",
    nome: "Thiago Rocha Lima",
    email: "thiago.rocha@saude.gov.br",
    cpf: "789.012.345-66",
    cargo: "Coordenador de Tecnologia da Informação",
    setor: "Núcleo de TI e Prontuário Eletrônico",
    perfil: "TI",
    ativo: true,
  },
];

const INITIAL_FORNECEDORES: Fornecedor[] = [
  {
    id: "forn-1",
    cnpj: "33.000.167/0001-01",
    razaoSocial: "Vibra Energia S/A - Posto Central Saúde Ltda",
    nomeFantasia: "Posto Central de Combustíveis",
    contato: "Valter Silveira",
    email: "licitacoes@postocentral.com.br",
    telefone: "(31) 3220-4001",
    endereco: "Av. do Contorno, 4500",
    cidade: "Belo Horizonte",
    uf: "MG",
    ativo: true,
  },
  {
    id: "forn-2",
    cnpj: "12.345.678/0001-90",
    razaoSocial: "Hospitalar Distribuidora de Medicamentos e Insumos S/A",
    nomeFantasia: "Hospitalar Farma Minas",
    contato: "Renata Vasconcelos",
    email: "publico@hospitalarfarma.com.br",
    telefone: "(31) 3340-9000",
    endereco: "Rodovia Anel Rodoviário, Km 12",
    cidade: "Belo Horizonte",
    uf: "MG",
    ativo: true,
  },
  {
    id: "forn-3",
    cnpj: "04.992.831/0001-44",
    razaoSocial: "COOPEVALE - Cooperativa Médica Vale da Saúde",
    nomeFantasia: "Coopevale Médicos Plantonistas",
    contato: "Dr. André Villas",
    email: "contratos@coopevale.med.br",
    telefone: "(31) 3450-7788",
    endereco: "Rua Paraíba, 800 - Sala 1201",
    cidade: "Belo Horizonte",
    uf: "MG",
    ativo: true,
  },
  {
    id: "forn-4",
    cnpj: "18.774.221/0001-33",
    razaoSocial: "AutoLoc Serviços de Locação e Ambulâncias Ltda",
    nomeFantasia: "AutoLoc Resgate",
    contato: "Marcos Paulo",
    email: "gestao@autolocsaude.com.br",
    telefone: "(31) 3660-1234",
    endereco: "Av. Cristiano Machado, 10200",
    cidade: "Belo Horizonte",
    uf: "MG",
    ativo: true,
  },
  {
    id: "forn-5",
    cnpj: "29.441.110/0001-52",
    razaoSocial: "White Martins Gases Industriais e Medicinais Ltda",
    nomeFantasia: "White Martins Oxigênio Hospitalar",
    contato: "Sandra Guimarães",
    email: "hospitalar@whitemartins.com.br",
    telefone: "(31) 3390-5000",
    endereco: "Distrito Industrial Simão da Cunha",
    cidade: "Contagem",
    uf: "MG",
    ativo: true,
  },
  {
    id: "forn-6",
    cnpj: "08.123.987/0001-19",
    razaoSocial: "Automec Assistência e Manutenção de Frotas Ltda",
    nomeFantasia: "Oficina Especializada Automec",
    contato: "Geraldo Morais",
    email: "contato@automecmg.com.br",
    telefone: "(31) 3398-2233",
    endereco: "Av. Teresa Cristina, 2100",
    cidade: "Belo Horizonte",
    uf: "MG",
    ativo: true,
  },
  {
    id: "forn-7",
    cnpj: "14.552.339/0001-81",
    razaoSocial: "TechSaúde Soluções em Informática e Redes Ltda",
    nomeFantasia: "TechSaúde Informática",
    contato: "Guilherme Santos",
    email: "governo@techsaude.inf.br",
    telefone: "(31) 3211-9876",
    endereco: "Av. Afonso Pena, 3110",
    cidade: "Belo Horizonte",
    uf: "MG",
    ativo: true,
  },
];

const INITIAL_DOTACÕES: DotacaoOrcamentaria[] = [
  {
    id: "dot-1",
    programaDeTrabalho: "10.301.0012.2045",
    elementoDespesa: "3.3.90.30 - Material de Consumo (Medicamentos e Insumos)",
    fonteRecurso: "1.500.1002 - Receitas de Impostos (Saúde 15%)",
    orcamentoInicial: 12500000,
    saldoDisponivel: 4850000,
    valorReservado: 1850000,
    valorEmpenhado: 5800000,
  },
  {
    id: "dot-2",
    programaDeTrabalho: "10.302.0012.2050",
    elementoDespesa: "3.3.90.39 - Outros Serviços de Terceiros PJ (Plantões e Transportes Sanitários)",
    fonteRecurso: "1.600.0000 - Bloco de Manutenção SUS - MAC",
    orcamentoInicial: 18200000,
    saldoDisponivel: 6150000,
    valorReservado: 3200000,
    valorEmpenhado: 8850000,
  },
  {
    id: "dot-3",
    programaDeTrabalho: "10.303.0012.2055",
    elementoDespesa: "3.3.90.30 - Combustíveis e Lubrificantes Automotivos",
    fonteRecurso: "1.500.1002 - Tesouro Municipal",
    orcamentoInicial: 1800000,
    saldoDisponivel: 540000,
    valorReservado: 310000,
    valorEmpenhado: 950000,
  },
  {
    id: "dot-4",
    programaDeTrabalho: "10.122.0001.2010",
    elementoDespesa: "4.4.90.52 - Equipamentos e Material Permanente (TI e Redes)",
    fonteRecurso: "1.500.1002 - Tesouro Municipal",
    orcamentoInicial: 950000,
    saldoDisponivel: 320000,
    valorReservado: 180000,
    valorEmpenhado: 450000,
  },
  {
    id: "dot-5",
    programaDeTrabalho: "10.302.0012.2065",
    elementoDespesa: "3.3.90.91 - Sentenças Judiciais e Liminares em Saúde",
    fonteRecurso: "1.500.1002 - Tesouro Municipal",
    orcamentoInicial: 3500000,
    saldoDisponivel: 820000,
    valorReservado: 450000,
    valorEmpenhado: 2230000,
  },
];

const INITIAL_CREDITOS: CreditoAdicional[] = [
  {
    id: "cred-1",
    tipo: "SUPLEMENTAR",
    decretoNumero: "Decreto Municipal nº 4.521/2025",
    valor: 1500000,
    origem: "SUPERAVIT",
    dataAprovacao: "2025-05-10",
    processoOrigemId: "proc-1",
    dotacaoDestinoId: "dot-1",
  },
  {
    id: "cred-2",
    tipo: "ESPECIAL",
    decretoNumero: "Decreto Municipal nº 4.605/2025",
    valor: 450000,
    origem: "EXCESSO_ARRECADACAO",
    dataAprovacao: "2025-07-22",
    processoOrigemId: "proc-5",
    dotacaoDestinoId: "dot-5",
  },
];

const INITIAL_PCA: ItemPCA[] = [
  {
    id: "pca-1",
    anoExercicio: 2025,
    codigoItem: "PCA-2025-014",
    descricao: "Aquisição centralizada de medicamentos essenciais da RENAME",
    categoria: "Medicamentos e Farmácia",
    valorEstimado: 3800000,
    status: "CONTRATADO",
    dataPrevisaoContratacao: "2025-02-15",
  },
  {
    id: "pca-2",
    anoExercicio: 2025,
    codigoItem: "PCA-2025-021",
    descricao: "Fornecimento de combustíveis (Diesel S10 e Gasolina Comum)",
    categoria: "Combustíveis e Lubrificantes",
    valorEstimado: 950000,
    status: "CONTRATADO",
    dataPrevisaoContratacao: "2025-01-20",
  },
  {
    id: "pca-3",
    anoExercicio: 2025,
    codigoItem: "PCA-2025-032",
    descricao: "Locação de ambulâncias e veículos para transporte sanitário e TFD",
    categoria: "Veículos e Locação",
    valorEstimado: 1500000,
    status: "CONTRATADO",
    dataPrevisaoContratacao: "2025-03-10",
  },
  {
    id: "pca-4",
    anoExercicio: 2025,
    codigoItem: "PCA-2025-045",
    descricao: "Fornecimento contínuo de oxigênio medicinal líquido e gasoso",
    categoria: "Gases Medicinais",
    valorEstimado: 1200000,
    status: "CONTRATADO",
    dataPrevisaoContratacao: "2025-03-30",
  },
  {
    id: "pca-5",
    anoExercicio: 2025,
    codigoItem: "PCA-2025-058",
    descricao: "Contratação de Cooperativa Médica para UPAs e Pronto Atendimento",
    categoria: "Serviços Médicos",
    valorEstimado: 5500000,
    status: "CONTRATADO",
    dataPrevisaoContratacao: "2025-04-05",
  },
  {
    id: "pca-6",
    anoExercicio: 2025,
    codigoItem: "PCA-2025-072",
    descricao: "Modernização do Parque Tecnológico das 18 Unidades Básicas de Saúde",
    categoria: "Tecnologia da Informação",
    valorEstimado: 600000,
    status: "EM_LICITACAO",
    dataPrevisaoContratacao: "2025-11-20",
  },
  {
    id: "pca-7",
    anoExercicio: 2025,
    codigoItem: "PCA-2025-089",
    descricao: "Manutenção preventiva e corretiva da frota de veículos da Saúde",
    categoria: "Manutenção Mecânica",
    valorEstimado: 450000,
    status: "CONTRATADO",
    dataPrevisaoContratacao: "2025-04-12",
  },
];

const INITIAL_PROCESSOS: ProcessoAdministrativo[] = [
  {
    id: "proc-1",
    numeroProcesso: "PA-2025/00142",
    numeroCapa: "CP-142/25",
    objeto: "Registro de Preços para aquisição centralizada de medicamentos da Farmácia Básica Municipal (Lei nº 14.133/2021)",
    modalidade: "Registro de Preços - Aquisição",
    setorAtual: "Divisão de Contratos",
    status: "CONTRATADO",
    statusDescritivo: "Processo encontra-se no setor de COTAÇÃO desde 05/10/2026.",
    dataEntradaSetor: "2026-10-05",
    itemPcaId: "pca-1",
    valorEstimado: 3800000,
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-03-01T14:30:00Z",
  },
  {
    id: "proc-2",
    numeroProcesso: "PA-2025/00289",
    numeroCapa: "CP-289/25",
    objeto: "Locação de ambulâncias para transporte inter-hospitalar e eletivo com manutenção integral",
    modalidade: "Pregão sem Registro de Preços",
    setorAtual: "Divisão de Contratos",
    status: "CONTRATADO",
    statusDescritivo: "Processo encontra-se no setor de ANÁLISE JURÍDICA desde 08/10/2026.",
    dataEntradaSetor: "2026-10-08",
    itemPcaId: "pca-3",
    valorEstimado: 1500000,
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-03-20T17:00:00Z",
  },
  {
    id: "proc-3",
    numeroProcesso: "PA-2025/00315",
    numeroCapa: "CP-315/25",
    objeto: "Fornecimento continuado de combustíveis (Gasolina Comum e Diesel S10) via cartão magnético para a frota da Saúde",
    modalidade: "Registro de Preços - Aquisição",
    setorAtual: "Coordenação de Transportes",
    status: "CONTRATADO",
    statusDescritivo: "Processo encontra-se no setor de PESQUISA DE PREÇOS desde 02/10/2026.",
    dataEntradaSetor: "2026-10-02",
    itemPcaId: "pca-2",
    valorEstimado: 950000,
    createdAt: "2025-01-10T08:30:00Z",
    updatedAt: "2025-02-18T15:00:00Z",
  },
  {
    id: "proc-4",
    numeroProcesso: "PA-2025/00480",
    numeroCapa: "CP-480/25",
    objeto: "Aquisição de computadores, nobreaks e licenças corporativas para informatização completa das 18 Unidades Básicas de Saúde (e-SUS PEC)",
    modalidade: "Pregão sem Registro de Preços",
    setorAtual: "Assessoria Jurídica da Saúde",
    status: "JURIDICO",
    itemPcaId: "pca-6",
    valorEstimado: 620000,
    createdAt: "2025-08-01T14:00:00Z",
    updatedAt: "2025-09-28T16:45:00Z",
  },
  {
    id: "proc-5",
    numeroProcesso: "PA-2025/00520",
    numeroCapa: "CP-520/25",
    objeto: "Contratação de cooperativa de médicos para cobertura ininterrupta de plantões de urgência e emergência nas UPAs 24 Horas",
    modalidade: "Inexigibilidade de Licitação",
    setorAtual: "Divisão de Contratos",
    status: "CONTRATADO",
    itemPcaId: "pca-5",
    valorEstimado: 8900000,
    createdAt: "2025-03-05T09:15:00Z",
    updatedAt: "2025-04-10T11:00:00Z",
  },
  {
    id: "proc-6",
    numeroProcesso: "PA-2025/00611",
    numeroCapa: "CP-611/25",
    objeto: "Registro de Preços para fornecimento ininterrupto de oxigênio medicinal e locação de cilindros para hospitais e UPAs",
    modalidade: "Registro de Preços - Aquisição",
    setorAtual: "Divisão de Contratos",
    status: "CONTRATADO",
    itemPcaId: "pca-4",
    valorEstimado: 1200000,
    createdAt: "2025-02-15T11:00:00Z",
    updatedAt: "2025-03-25T10:00:00Z",
  },
  {
    id: "proc-7",
    numeroProcesso: "PA-2025/00730",
    numeroCapa: "CP-730/25",
    objeto: "Dispensa de Licitação para aquisição direta de testes rápidos de antígeno para dengue, zika e chikungunya para a Rede de Atenção Básica",
    modalidade: "Dispensa",
    setorAtual: "Superintendência de Vigilância em Saúde (SUVIG)",
    status: "FASE_PREPARATORIA",
    valorEstimado: 54000,
    createdAt: "2025-09-01T08:30:00Z",
    updatedAt: "2025-09-15T10:00:00Z",
    itensProcesso: [
      { id: "it-7-1", numeroItem: 1, descricao: "Teste Rápido Imunocromatográfico Dengue NS1/IgG/IgM", unidadeMedida: "TESTE", quantidade: 2000, valorUnitarioEstimado: 18.0, valorTotalEstimado: 36000 },
      { id: "it-7-2", numeroItem: 2, descricao: "Lancetas retráteis descartáveis estéreis 28G", unidadeMedida: "UNIDADE", quantidade: 2000, valorUnitarioEstimado: 0.5, valorTotalEstimado: 1000 },
      { id: "it-7-3", numeroItem: 3, descricao: "Teste Rápido de Antígeno para Chikungunya IgM/IgG", unidadeMedida: "TESTE", quantidade: 1000, valorUnitarioEstimado: 17.0, valorTotalEstimado: 17000 },
    ],
  },
  {
    id: "proc-8",
    numeroProcesso: "PA-2025/00912",
    numeroCapa: "CP-912/25",
    objeto: "Contratação Emergencial por Dispensa para aquisição de dietas enterais de alta densidade e fórmulas nutricionais infantis especiais",
    modalidade: "Emergencial",
    setorAtual: "Superintendência de Atenção à Saúde (SAS)",
    status: "JURIDICO",
    valorEstimado: 145000,
    createdAt: "2025-09-10T11:00:00Z",
    updatedAt: "2025-09-22T14:15:00Z",
    itensProcesso: [
      { id: "it-8-1", numeroItem: 1, descricao: "Fórmula Nutricional Enteral Polimérica Hipercalórica 1.5 kcal/ml", unidadeMedida: "LITRO", quantidade: 1500, valorUnitarioEstimado: 58.0, valorTotalEstimado: 87000 },
      { id: "it-8-2", numeroItem: 2, descricao: "Fórmula Infantil com Proteína Extensamente Hidrolisada 400g", unidadeMedida: "LATA", quantidade: 800, valorUnitarioEstimado: 72.5, valorTotalEstimado: 58000 },
    ],
  },
  {
    id: "proc-9",
    numeroProcesso: "PA-2025/01015",
    numeroCapa: "CP-1015/25",
    objeto: "Adesão de Ata de Registro de Preços (Carona) nº 12/2025 do Consórcio Regional de Saúde para aquisição de insumos hospitalares e descartáveis",
    modalidade: "Adesão de Ata",
    setorAtual: "Divisão de Contratos",
    status: "FASE_PREPARATORIA",
    valorEstimado: 210000,
    createdAt: "2025-08-20T09:00:00Z",
    updatedAt: "2025-09-18T16:00:00Z",
    itensProcesso: [
      { id: "it-9-1", numeroItem: 1, descricao: "Seringa descartável 10ml com bico Luer Lock", unidadeMedida: "UNIDADE", quantidade: 100000, valorUnitarioEstimado: 0.85, valorTotalEstimado: 85000 },
      { id: "it-9-2", numeroItem: 2, descricao: "Agulha descartável estéril 25x7 para injeção", unidadeMedida: "UNIDADE", quantidade: 150000, valorUnitarioEstimado: 0.20, valorTotalEstimado: 30000 },
      { id: "it-9-3", numeroItem: 3, descricao: "Luvas cirúrgicas estéreis látex tamanho 7.5", unidadeMedida: "PAR", quantidade: 50000, valorUnitarioEstimado: 1.90, valorTotalEstimado: 95000 },
    ],
  },
  {
    id: "proc-10",
    numeroProcesso: "PA-2025/01120",
    numeroCapa: "CP-1120/25",
    objeto: "Contratação Direta de serviços postais e telegráficos oficiais para remessa e notificação de atos da Vigilância Sanitária e Fiscalização em Saúde",
    modalidade: "Contratação Direta",
    setorAtual: "Assessoria Jurídica da Saúde",
    status: "FASE_PREPARATORIA",
    valorEstimado: 78000,
    createdAt: "2025-08-05T14:30:00Z",
    updatedAt: "2025-09-02T11:20:00Z",
    itensProcesso: [
      { id: "it-10-1", numeroItem: 1, descricao: "Serviços de envio de cartas registradas com aviso de recebimento (AR Digital)", unidadeMedida: "ENVIO", quantidade: 12000, valorUnitarioEstimado: 6.5, valorTotalEstimado: 78000 },
    ],
  },
  {
    id: "proc-11",
    numeroProcesso: "PA-2025/01205",
    numeroCapa: "CP-1205/25",
    objeto: "Concessão e Liquidação de Diárias a servidores públicos da Saúde para transporte interestadual de pacientes em TFD de alta complexidade",
    modalidade: "Diárias",
    setorAtual: "Coordenação de Transportes e Frotas",
    status: "FASE_PREPARATORIA",
    valorEstimado: 18400,
    createdAt: "2025-09-15T09:10:00Z",
    updatedAt: "2025-09-28T10:40:00Z",
    itensProcesso: [
      { id: "it-11-1", numeroItem: 1, descricao: "Diárias para deslocamento com pernoite para transporte intermunicipal/TFD", unidadeMedida: "DIÁRIA", quantidade: 40, valorUnitarioEstimado: 320.0, valorTotalEstimado: 12800 },
      { id: "it-11-2", numeroItem: 2, descricao: "Diárias sem pernoite para viagens de tratamento sanitário contínuo", unidadeMedida: "DIÁRIA", quantidade: 35, valorUnitarioEstimado: 160.0, valorTotalEstimado: 5600 },
    ],
  },
  {
    id: "proc-12",
    numeroProcesso: "PA-2025/01301",
    numeroCapa: "CP-1301/25",
    objeto: "Credenciamento de clínicas médicas e laboratórios especializados para realização de exames complementares de diagnóstico por imagem e patologia clínica",
    modalidade: "Credenciamento",
    setorAtual: "Superintendência de Regulação e Controle (SURCAA)",
    status: "LICITACAO",
    valorEstimado: 1850000,
    createdAt: "2025-07-10T10:00:00Z",
    updatedAt: "2025-08-30T17:00:00Z",
    itensProcesso: [
      { id: "it-12-1", numeroItem: 1, descricao: "Ressonância Magnética com contraste", unidadeMedida: "EXAME", quantidade: 1200, valorUnitarioEstimado: 450.0, valorTotalEstimado: 540000 },
      { id: "it-12-2", numeroItem: 2, descricao: "Tomografia Computadorizada Multislice de Abdome e Tórax", unidadeMedida: "EXAME", quantidade: 2500, valorUnitarioEstimado: 260.0, valorTotalEstimado: 650000 },
      { id: "it-12-3", numeroItem: 3, descricao: "Ultrassonografia com Doppler Colorido Vascular", unidadeMedida: "EXAME", quantidade: 4400, valorUnitarioEstimado: 150.0, valorTotalEstimado: 660000 },
    ],
  },
  {
    id: "proc-13",
    numeroProcesso: "PA-2025/01410",
    numeroCapa: "CP-1410/25",
    objeto: "Edital de Chamamento Público para seleção de Organização da Sociedade Civil (OSC) visando à execução do Projeto 'Saúde Mental Integrada'",
    modalidade: "Chamamento Público",
    setorAtual: "Comissão Especial de Seleção de Parcerias MROSC",
    status: "LICITACAO",
    valorEstimado: 920000,
    createdAt: "2025-06-15T08:00:00Z",
    updatedAt: "2025-07-20T15:30:00Z",
    itensProcesso: [
      { id: "it-13-1", numeroItem: 1, descricao: "Execução descentralizada de oficinas terapêuticas e reinserção psicossocial", unidadeMedida: "MÊS", quantidade: 12, valorUnitarioEstimado: 76666.67, valorTotalEstimado: 920000 },
    ],
  },
  {
    id: "proc-14",
    numeroProcesso: "PA-2025/01520",
    numeroCapa: "CP-1520/25",
    objeto: "Termo de Colaboração com a APAE de Arapiraca para oferta continuada de atendimentos multiprofissionais em reabilitação física e intelectual",
    modalidade: "Termo de Colaboração",
    setorAtual: "Superintendência de Gestão do Trabalho e Educação na Saúde (SGTES)",
    status: "CONTRATADO",
    valorEstimado: 680000,
    createdAt: "2025-04-10T11:00:00Z",
    updatedAt: "2025-05-18T16:00:00Z",
    itensProcesso: [
      { id: "it-14-1", numeroItem: 1, descricao: "Atendimento integrado em Fisioterapia Neurofuncional, Fonoaudiologia e Terapia Ocupacional", unidadeMedida: "ATENDIMENTO", quantidade: 3600, valorUnitarioEstimado: 188.89, valorTotalEstimado: 680000 },
    ],
  },
  {
    id: "proc-15",
    numeroProcesso: "PA-2025/01630",
    numeroCapa: "CP-1630/25",
    objeto: "Termo de Fomento em parceria com a Pastoral da Criança para vigilância e promoção do aleitamento materno e combate à desnutrição",
    modalidade: "Termo de Fomento",
    setorAtual: "Superintendência de Atenção à Saúde (SAS)",
    status: "CONTRATADO",
    valorEstimado: 240000,
    createdAt: "2025-05-02T13:40:00Z",
    updatedAt: "2025-06-12T10:15:00Z",
    itensProcesso: [
      { id: "it-15-1", numeroItem: 1, descricao: "Capacitação comunitária e visitas domiciliares de suporte nutricional e puericultura", unidadeMedida: "MÊS", quantidade: 12, valorUnitarioEstimado: 20000.0, valorTotalEstimado: 240000 },
    ],
  },
];

const INITIAL_ATAS: AtaRegistroPrecos[] = [
  {
    id: "ata-1",
    numeroAta: "ARP nº 042/2025",
    processoOrigemId: "proc-1",
    fornecedorId: "forn-2",
    objeto: "Registro de Preços para Medicamentos da Farmácia Básica Municipal",
    vigenciaInicio: "2025-03-01",
    vigenciaFim: "2026-03-01",
    valorTotalRegistrado: 3800000,
    saldoTotalDisponivel: 2450000,
    status: "Ativa",
    itens: [
      {
        id: "item-ata-1",
        ataId: "ata-1",
        codigoItem: "MED-001",
        descricao: "Insulina Glargina 100 UI/ml refil com 3ml para caneta aplicadora",
        unidadeMedida: "FRASCO",
        quantidadeContratada: 12000,
        quantidadeDisponivel: 8200,
        valorUnitario: 85.0,
        saldoItem: 697000.0,
      },
      {
        id: "item-ata-2",
        ataId: "ata-1",
        codigoItem: "MED-002",
        descricao: "Amoxicilina + Clavulanato de Potássio 875mg + 125mg comprimido",
        unidadeMedida: "COMPRIMIDO",
        quantidadeContratada: 150000,
        quantidadeDisponivel: 95000,
        valorUnitario: 3.2,
        saldoItem: 304000.0,
      },
      {
        id: "item-ata-3",
        ataId: "ata-1",
        codigoItem: "MED-003",
        descricao: "Dipirona Monoidratada 500mg/ml solução injetável ampola 2ml",
        unidadeMedida: "AMPOLA",
        quantidadeContratada: 200000,
        quantidadeDisponivel: 140000,
        valorUnitario: 1.45,
        saldoItem: 203000.0,
      },
    ],
  },
  {
    id: "ata-2",
    numeroAta: "ARP nº 058/2025",
    processoOrigemId: "proc-6",
    fornecedorId: "forn-5",
    objeto: "Registro de Preços para fornecimento de Oxigênio Medicinal Líquido e Gasoso",
    vigenciaInicio: "2025-03-25",
    vigenciaFim: "2026-03-25",
    valorTotalRegistrado: 1200000,
    saldoTotalDisponivel: 780000,
    status: "Ativa",
    itens: [
      {
        id: "item-ata-4",
        ataId: "ata-2",
        codigoItem: "GAS-001",
        descricao: "Oxigênio Medicinal Gasoso a granel (m³)",
        unidadeMedida: "M3",
        quantidadeContratada: 50000,
        quantidadeDisponivel: 32500,
        valorUnitario: 16.0,
        saldoItem: 520000.0,
      },
    ],
  },
];

const INITIAL_CONTRATOS: Contrato[] = [
  {
    id: "ct-1",
    numeroContrato: "CT-2025/012",
    processoOrigemId: "proc-3",
    fornecedorId: "forn-1",
    objeto: "Fornecimento continuado de combustíveis (Diesel S10 e Gasolina Comum) para veículos da Frota Municipal, TFD e Vigilância em Saúde",
    dataAssinatura: "2025-02-18",
    vigenciaInicio: "2025-02-18",
    vigenciaFim: "2025-11-22", // Expira em ~45 dias! Alerta de 60/30 dias
    valorGlobal: 850000,
    saldoFinanceiroAtual: 342150,
    fiscalTitularId: "usr-4",
    fiscalTitularNome: "Tenente Roberto Nogueira",
    fiscalSubstitutoId: "usr-2",
    fiscalSubstitutoNome: "Mariana Alcantara Rios",
    status: "Vigente",
    itens: [
      {
        id: "item-ct-1",
        contratoId: "ct-1",
        codigoItem: "COMB-01",
        descricao: "Óleo Diesel S10 para Ambulâncias Municipais e Vans TFD",
        unidadeMedida: "LITRO",
        quantidadeContratada: 90000,
        quantidadeDisponivel: 34100,
        valorUnitario: 6.25,
        saldoItem: 213125,
        dotacoes: [
          {
            id: "dot-item-1a",
            programaDeTrabalho: "10.302.0012.2050",
            programaNome: "Manutenção dos Serviços de Urgência, Emergência e TFD (SAMU 192)",
            elementoDespesa: "3.3.90.30 - Combustíveis e Lubrificantes Automotivos",
            fonteRecurso: "1.600.0000 - Bloco de Manutenção SUS - MAC",
            saldoDotacaoItem: 149187.50,
            quantidadeDisponivelDotacao: 23870,
            percentual: 70,
          },
          {
            id: "dot-item-1b",
            programaDeTrabalho: "10.301.0012.2045",
            programaNome: "Atenção Básica e Estratégia de Saúde da Família (ESF / UBS)",
            elementoDespesa: "3.3.90.30 - Combustíveis e Lubrificantes Automotivos",
            fonteRecurso: "1.500.1002 - Receitas de Impostos (Saúde 15%)",
            saldoDotacaoItem: 63937.50,
            quantidadeDisponivelDotacao: 10230,
            percentual: 30,
          },
        ],
      },
      {
        id: "item-ct-2",
        contratoId: "ct-1",
        codigoItem: "COMB-02",
        descricao: "Gasolina Comum para frota leve e fiscalização de Vigilância Sanitária",
        unidadeMedida: "LITRO",
        quantidadeContratada: 50000,
        quantidadeDisponivel: 21504,
        valorUnitario: 6.0,
        saldoItem: 129025,
        dotacoes: [
          {
            id: "dot-item-2a",
            programaDeTrabalho: "10.304.0012.2060",
            programaNome: "Vigilância em Saúde, Sanitária e Epidemiológica Municipal",
            elementoDespesa: "3.3.90.30 - Combustíveis e Lubrificantes Automotivos",
            fonteRecurso: "1.602.0000 - Bloco de Vigilância em Saúde SUS",
            saldoDotacaoItem: 77415.00,
            quantidadeDisponivelDotacao: 12902,
            percentual: 60,
          },
          {
            id: "dot-item-2b",
            programaDeTrabalho: "10.122.0001.2010",
            programaNome: "Gestão e Apoio Administrativo da Secretaria Municipal de Saúde",
            elementoDespesa: "3.3.90.30 - Combustíveis e Lubrificantes Automotivos",
            fonteRecurso: "1.500.1002 - Tesouro Municipal (Saúde)",
            saldoDotacaoItem: 51610.00,
            quantidadeDisponivelDotacao: 8602,
            percentual: 40,
          },
        ],
      },
    ],
    termosAditivos: [],
  },
  {
    id: "ct-2",
    numeroContrato: "CT-2025/034",
    processoOrigemId: "proc-2",
    fornecedorId: "forn-4",
    objeto: "Locação de 03 Ambulâncias de Suporte Avançado (Tipo D - UTI Móvel) com manutenção e seguro total para atendimento 24h",
    dataAssinatura: "2025-03-20",
    vigenciaInicio: "2025-03-20",
    vigenciaFim: "2026-03-20",
    valorGlobal: 1440000,
    saldoFinanceiroAtual: 840000,
    fiscalTitularId: "usr-4",
    fiscalTitularNome: "Tenente Roberto Nogueira",
    status: "Vigente",
    itens: [
      {
        id: "item-ct-3",
        contratoId: "ct-2",
        codigoItem: "LOC-01",
        descricao: "Locação mensal de ambulância UTI Móvel Tipo D com seguro e rastreamento",
        unidadeMedida: "MÊS",
        quantidadeContratada: 36,
        quantidadeDisponivel: 21,
        valorUnitario: 40000,
        saldoItem: 840000,
        dotacoes: [
          {
            id: "dot-item-3a",
            programaDeTrabalho: "10.302.0012.2050",
            programaNome: "Manutenção dos Serviços de Urgência SAMU 192 e Transporte de Pacientes Graves",
            elementoDespesa: "3.3.90.39 - Outros Serviços de Terceiros PJ (Locação de Ambulâncias)",
            fonteRecurso: "1.600.0000 - Bloco de Manutenção SUS - MAC",
            saldoDotacaoItem: 840000,
            quantidadeDisponivelDotacao: 21,
            percentual: 100,
          },
        ],
      },
    ],
  },
  {
    id: "ct-3",
    numeroContrato: "CT-2025/055",
    processoOrigemId: "proc-5",
    fornecedorId: "forn-3",
    objeto: "Contratação de Cooperativa Médica para gestão de plantões médicos de urgência e emergência nas UPAs 24 Horas",
    dataAssinatura: "2025-04-10",
    vigenciaInicio: "2025-04-10",
    vigenciaFim: "2025-11-05", // Expira em 28 dias! Alerta CRÍTICO < 30 dias
    valorGlobal: 5200000,
    saldoFinanceiroAtual: 890000,
    fiscalTitularId: "usr-1",
    fiscalTitularNome: "Dr. Carlos Eduardo Menezes",
    status: "Vigente",
    itens: [
      {
        id: "item-ct-4",
        contratoId: "ct-3",
        codigoItem: "MED-PLANT",
        descricao: "Hora de plantão médico clínico presencial 12h UPA",
        unidadeMedida: "HORA",
        quantidadeContratada: 26000,
        quantidadeDisponivel: 4450,
        valorUnitario: 200,
        saldoItem: 890000,
        dotacoes: [
          {
            id: "dot-item-4a",
            programaDeTrabalho: "10.302.0012.2050",
            programaNome: "Gestão de Serviços Médicos de Urgência e UPAs 24 Horas",
            elementoDespesa: "3.3.90.39 - Outros Serviços de Terceiros PJ (Serviços Médicos Especializados)",
            fonteRecurso: "1.600.0000 - Bloco MAC",
            saldoDotacaoItem: 623000,
            quantidadeDisponivelDotacao: 3115,
            percentual: 70,
          },
          {
            id: "dot-item-4b",
            programaDeTrabalho: "10.302.0012.2050",
            programaNome: "Suporte Emergencial e Plantões Médicos Complementares",
            elementoDespesa: "3.3.90.39 - Outros Serviços de Terceiros PJ (Serviços Médicos Especializados)",
            fonteRecurso: "1.500.1002 - Tesouro Municipal (Saúde 15%)",
            saldoDotacaoItem: 267000,
            quantidadeDisponivelDotacao: 1335,
            percentual: 30,
          },
        ],
      },
    ],
    termosAditivos: [
      {
        id: "adit-1",
        contratoId: "ct-3",
        numeroTermo: "1º Termo Aditivo",
        tipo: "VALOR",
        valorAcrescido: 400000,
        novaVigenciaFim: "2025-11-05",
        justificativa: "Acréscimo de 8% devido à epidemia sazonal de arboviroses (Dengue/Chikungunya).",
        dataAssinatura: "2025-06-15",
      },
    ],
  },
  {
    id: "ct-4",
    numeroContrato: "CT-2025/078",
    ataOrigemId: "ata-1",
    processoOrigemId: "proc-1",
    fornecedorId: "forn-2",
    objeto: "Fornecimento parcelado de Insulina Glargina e Amoxicilina derivado da Ata de Registro de Preços nº 042/2025",
    dataAssinatura: "2025-03-10",
    vigenciaInicio: "2025-03-10",
    vigenciaFim: "2026-03-10",
    valorGlobal: 1350000,
    saldoFinanceiroAtual: 685000,
    fiscalTitularId: "usr-3",
    fiscalTitularNome: "Felipe Bastos Oliveira",
    status: "Vigente",
    itens: [
      {
        id: "item-ct-5",
        contratoId: "ct-4",
        codigoItem: "MED-001",
        descricao: "Insulina Glargina 100 UI/ml refil com 3ml para caneta aplicadora",
        unidadeMedida: "FRASCO",
        quantidadeContratada: 10000,
        quantidadeDisponivel: 5200,
        valorUnitario: 85.0,
        saldoItem: 442000.0,
        dotacoes: [
          {
            id: "dot-item-5a",
            programaDeTrabalho: "10.303.0012.2055",
            programaNome: "Assistência Farmacêutica Básica e Medicamentos Especiais",
            elementoDespesa: "3.3.90.30 - Material de Consumo (Medicamentos)",
            fonteRecurso: "1.600.0000 - Custeio SUS Assistência Farmacêutica",
            saldoDotacaoItem: 442000.0,
            quantidadeDisponivelDotacao: 5200,
            percentual: 100,
          },
        ],
      },
      {
        id: "item-ct-6",
        contratoId: "ct-4",
        codigoItem: "MED-002",
        descricao: "Amoxicilina + Clavulanato de Potássio 875mg + 125mg comprimido",
        unidadeMedida: "COMPRIMIDO",
        quantidadeContratada: 75000,
        quantidadeDisponivel: 42000,
        valorUnitario: 3.2,
        saldoItem: 134400.0,
        dotacoes: [
          {
            id: "dot-item-6a",
            programaDeTrabalho: "10.303.0012.2055",
            programaNome: "Assistência Farmacêutica Básica e Dispensação Geral",
            elementoDespesa: "3.3.90.30 - Material de Consumo (Medicamentos)",
            fonteRecurso: "1.600.0000 - Custeio SUS Assistência Farmacêutica",
            saldoDotacaoItem: 80640.0,
            quantidadeDisponivelDotacao: 25200,
            percentual: 60,
          },
          {
            id: "dot-item-6b",
            programaDeTrabalho: "10.301.0012.2045",
            programaNome: "Atenção Básica Municipal e Saúde da Família",
            elementoDespesa: "3.3.90.30 - Material de Consumo (Medicamentos)",
            fonteRecurso: "1.500.1002 - Tesouro Municipal (Contrapartida)",
            saldoDotacaoItem: 53760.0,
            quantidadeDisponivelDotacao: 16800,
            percentual: 40,
          },
        ],
      },
    ],
  },
  {
    id: "ct-5",
    numeroContrato: "CT-2025/090",
    processoOrigemId: "proc-3",
    fornecedorId: "forn-6",
    objeto: "Serviços mecânicos de manutenção preventiva e corretiva com reposição de peças originais para a frota veicular da Saúde",
    dataAssinatura: "2025-04-12",
    vigenciaInicio: "2025-04-12",
    vigenciaFim: "2026-04-12",
    valorGlobal: 420000,
    saldoFinanceiroAtual: 284500,
    fiscalTitularId: "usr-4",
    fiscalTitularNome: "Tenente Roberto Nogueira",
    status: "Vigente",
    itens: [
      {
        id: "item-ct-7",
        contratoId: "ct-5",
        codigoItem: "MANUT-01",
        descricao: "Hora de serviço mecânico especializado em ambulâncias e veículos pesados",
        unidadeMedida: "HORA",
        quantidadeContratada: 1200,
        quantidadeDisponivel: 812,
        valorUnitario: 180,
        saldoItem: 146160,
        dotacoes: [
          {
            id: "dot-item-7a",
            programaDeTrabalho: "10.302.0012.2050",
            programaNome: "Manutenção de Ambulâncias do SAMU / Resgate Municipal",
            elementoDespesa: "3.3.90.39 - Outros Serviços de Terceiros PJ",
            fonteRecurso: "1.600.0000 - Bloco MAC",
            saldoDotacaoItem: 102312,
            quantidadeDisponivelDotacao: 568.4,
            percentual: 70,
          },
          {
            id: "dot-item-7b",
            programaDeTrabalho: "10.122.0001.2010",
            programaNome: "Manutenção da Frota Administrativa e Logística da Saúde",
            elementoDespesa: "3.3.90.39 - Outros Serviços de Terceiros PJ",
            fonteRecurso: "1.500.1002 - Tesouro Municipal",
            saldoDotacaoItem: 43848,
            quantidadeDisponivelDotacao: 243.6,
            percentual: 30,
          },
        ],
      },
      {
        id: "item-ct-8",
        contratoId: "ct-5",
        codigoItem: "MANUT-02",
        descricao: "Peças e componentes de reposição automotiva genuína",
        unidadeMedida: "VERBA",
        quantidadeContratada: 204000,
        quantidadeDisponivel: 138340,
        valorUnitario: 1,
        saldoItem: 138340,
        dotacoes: [
          {
            id: "dot-item-8a",
            programaDeTrabalho: "10.302.0012.2050",
            programaNome: "Peças para Ambulâncias do SAMU / Resgate Municipal",
            elementoDespesa: "3.3.90.30 - Material de Consumo (Peças)",
            fonteRecurso: "1.600.0000 - Bloco MAC",
            saldoDotacaoItem: 96838,
            quantidadeDisponivelDotacao: 96838,
            percentual: 70,
          },
          {
            id: "dot-item-8b",
            programaDeTrabalho: "10.122.0001.2010",
            programaNome: "Peças para Frota Administrativa da Saúde",
            elementoDespesa: "3.3.90.30 - Material de Consumo (Peças)",
            fonteRecurso: "1.500.1002 - Tesouro Municipal",
            saldoDotacaoItem: 41502,
            quantidadeDisponivelDotacao: 41502,
            percentual: 30,
          },
        ],
      },
    ],
  },
];

const INITIAL_ORDENS: OrdemFornecimentoServico[] = [
  {
    id: "of-1",
    numeroOF: "OF-2025/0088",
    contratoId: "ct-1",
    contratoNumero: "CT-2025/012",
    fornecedorNome: "Posto Central de Combustíveis",
    dataEmissao: "2025-09-01T08:00:00Z",
    prazoEntrega: "2025-09-30T23:59:00Z",
    valorTotal: 54200,
    status: "ENTREGUE",
    observacoes: "Cota mensal de abastecimento para ambulâncias da frota municipal, vans de TFD e fiscalização sanitária.",
    itens: [
      {
        id: "itof-1",
        ordemId: "of-1",
        itemContratoId: "item-ct-1",
        descricao: "Óleo Diesel S10",
        quantidadeSolicitada: 6000,
        valorUnitario: 6.25,
        valorTotal: 37500,
      },
      {
        id: "itof-2",
        ordemId: "of-1",
        itemContratoId: "item-ct-2",
        descricao: "Gasolina Comum",
        quantidadeSolicitada: 2783.33,
        valorUnitario: 6.0,
        valorTotal: 16700,
      },
    ],
  },
  {
    id: "of-2",
    numeroOF: "OF-2025/0104",
    contratoId: "ct-4",
    contratoNumero: "CT-2025/078",
    fornecedorNome: "Hospitalar Farma Minas",
    dataEmissao: "2025-09-15T10:30:00Z",
    prazoEntrega: "2025-09-25T18:00:00Z",
    valorTotal: 170000,
    status: "EMITIDA",
    observacoes: "Lote emergencial de Insulina Glargina para abastecimento das 18 farmácias das UBS.",
    itens: [
      {
        id: "itof-3",
        ordemId: "of-2",
        itemContratoId: "item-ct-5",
        descricao: "Insulina Glargina 100 UI/ml",
        quantidadeSolicitada: 2000,
        valorUnitario: 85.0,
        valorTotal: 170000,
      },
    ],
  },
];

const INITIAL_PAGAMENTOS: PagamentoLiquidacao[] = [
  {
    id: "pag-1",
    contratoId: "ct-1",
    ordemId: "of-1",
    numeroNotaFiscal: "NF-e 004128",
    numeroEmpenho: "EMP-2025/001890",
    numeroLiquidacao: "LIQ-2025/003411",
    valorPago: 54200,
    dataPagamento: "2025-09-18",
    fonteRecursoId: "dot-3",
    fonteRecursoNome: "1.500.1002 - Tesouro Municipal",
    tipoFavorecido: "CONTRATADA",
    status: "Liquidado",
    observacoes: "Abastecimento do mês de Agosto/Setembro certificado pela Fiscalização de Frotas.",
  },
  {
    id: "pag-2",
    contratoId: "ct-3",
    numeroNotaFiscal: "NF-e 001923",
    numeroEmpenho: "EMP-2025/002400",
    numeroLiquidacao: "LIQ-2025/004012",
    valorPago: 385000,
    dataPagamento: "2025-09-05",
    fonteRecursoId: "dot-2",
    fonteRecursoNome: "1.600.0000 - Bloco MAC",
    tipoFavorecido: "CONTRATADA",
    status: "Liquidado",
    observacoes: "Plantões médicos realizados e atestados pelo Diretor Clínico das UPAs.",
  },
];

const INITIAL_VEICULOS: Veiculo[] = [
  {
    id: "veic-1",
    placa: "SAU-1A24",
    modelo: "Sprinter 416 CDI Suporte Avançado (USA-01)",
    marca: "Mercedes-Benz",
    ano: 2024,
    chassi: "8AC904678PB019284",
    status: "PLANTAO_24_7",
    tipo: "LOCADO",
    capacidade: "UTI Móvel (1 Médico, 1 Enfermeiro, 1 Condutor, 1 Paciente)",
    quilometragemAtual: 42800,
    dataLicenciamento: "2025-12-15",
    contratoLocacaoId: "ct-2",
  },
  {
    id: "veic-2",
    placa: "SAU-2B35",
    modelo: "Master Ambulância Básico L2H2 (USB-02)",
    marca: "Renault",
    ano: 2023,
    chassi: "93YMA1288PJ981240",
    status: "PLANTAO_24_7",
    tipo: "PROPRIO",
    capacidade: "Suporte Básico (1 Condutor, 1 Técnico Enfermagem)",
    quilometragemAtual: 68120,
    dataLicenciamento: "2025-10-25", // Licenciamento a vencer em breve!
  },
  {
    id: "veic-3",
    placa: "SAU-3C46",
    modelo: "Ducato Maxicargo Remoção (USB-03)",
    marca: "Fiat",
    ano: 2022,
    chassi: "3C8DF4412LK812733",
    status: "MANUTENCAO",
    tipo: "PROPRIO",
    capacidade: "Remoção Hospitalar Simples",
    quilometragemAtual: 91400,
    dataLicenciamento: "2025-11-30",
  },
  {
    id: "veic-4",
    placa: "SAU-4D57",
    modelo: "Daily Minibus 19 Lugares - Tratamento Fora Domicílio (TFD)",
    marca: "Iveco",
    ano: 2023,
    chassi: "93ZIV18290PA123491",
    status: "EM_ROTA",
    tipo: "PROPRIO",
    capacidade: "18 Passageiros Pacientes Hemodiálise/Oncologia",
    quilometragemAtual: 83500,
    dataLicenciamento: "2026-02-28",
  },
  {
    id: "veic-5",
    placa: "SAU-5E68",
    modelo: "Gol 1.0 Vigilância Sanitária e Epidemiológica",
    marca: "Volkswagen",
    ano: 2021,
    chassi: "9BWAB45U9MP029381",
    status: "DISPONIVEL",
    tipo: "PROPRIO",
    capacidade: "5 Passageiros (Fiscalização Sanitária)",
    quilometragemAtual: 54100,
    dataLicenciamento: "2025-11-10",
  },
];

const INITIAL_MOTORISTAS: Motorista[] = [
  {
    id: "mot-1",
    nome: "Marcos Vinicius de Souza",
    matricula: "MAT-4890",
    cnh: "04981726354",
    categoriaCnh: "D (Com curso de Emergência e Resgate)",
    validadeCnh: "2025-10-26", // Vence em 18 dias! Alerta CRÍTICO de CNH!
    escalaTrabalho: "PLANTAO",
    status: "Ativo",
    telefone: "(31) 98844-1234",
  },
  {
    id: "mot-2",
    nome: "José Antônio Silveira",
    matricula: "MAT-3210",
    cnh: "01827364519",
    categoriaCnh: "D",
    validadeCnh: "2026-08-15",
    escalaTrabalho: "PLANTAO",
    status: "Ativo",
    telefone: "(31) 99123-5566",
  },
  {
    id: "mot-3",
    nome: "Edmilson de Paula Cunha",
    matricula: "MAT-5102",
    cnh: "03928174620",
    categoriaCnh: "D (Curso TFD / Coletivo de Passageiros)",
    validadeCnh: "2026-04-10",
    escalaTrabalho: "DIURNO",
    status: "Ativo",
    telefone: "(31) 98777-3322",
  },
  {
    id: "mot-4",
    nome: "Cláudio Barreto Fonseca",
    matricula: "MAT-2980",
    cnh: "05566778899",
    categoriaCnh: "B",
    validadeCnh: "2026-11-20",
    escalaTrabalho: "DIURNO",
    status: "Ativo",
    telefone: "(31) 99881-2244",
  },
];

const INITIAL_ESCALAS: EscalaPlantao24x7[] = [
  {
    id: "esc-1",
    veiculoId: "veic-1",
    veiculoPlaca: "SAU-1A24",
    veiculoModelo: "USA-01 (UTI Móvel)",
    motoristaId: "mot-1",
    motoristaNome: "Marcos Vinicius de Souza",
    turno: "Plantão Diurno 12h (07:00 às 19:00)",
    dataInicio: "2025-10-08T07:00:00Z",
    dataFim: "2025-10-08T19:00:00Z",
    contatoEmergencia: "Central de Transportes da SMS (Ramal 101)",
    statusProntidao: "Operacional / Em Prontidão Máxima",
  },
  {
    id: "esc-2",
    veiculoId: "veic-2",
    veiculoPlaca: "SAU-2B35",
    veiculoModelo: "USB-02 (Suporte Básico)",
    motoristaId: "mot-2",
    motoristaNome: "José Antônio Silveira",
    turno: "Plantão Noturno 12h (19:00 às 07:00)",
    dataInicio: "2025-10-08T19:00:00Z",
    dataFim: "2025-10-09T07:00:00Z",
    contatoEmergencia: "Central de Transportes da SMS (Ramal 102)",
    statusProntidao: "Escalado",
  },
];

const INITIAL_ABASTECIMENTOS: Abastecimento[] = [
  {
    id: "abast-1",
    veiculoId: "veic-1",
    veiculoPlaca: "SAU-1A24",
    motoristaId: "mot-1",
    motoristaNome: "Marcos Vinicius de Souza",
    contratoCombustivelId: "ct-1",
    dataHora: "2025-10-07T14:20:00Z",
    quilometragem: 42720,
    litros: 68.5,
    tipoCombustivel: "Diesel S10",
    valorTotal: 428.12,
    cupomFiscal: "NFC-e 981240",
    postoConveniado: "Posto Central Saúde (Unidade Contorno)",
  },
  {
    id: "abast-2",
    veiculoId: "veic-4",
    veiculoPlaca: "SAU-4D57",
    motoristaId: "mot-3",
    motoristaNome: "Edmilson de Paula Cunha",
    contratoCombustivelId: "ct-1",
    dataHora: "2025-10-06T06:15:00Z",
    quilometragem: 83120,
    litros: 85.0,
    tipoCombustivel: "Diesel S10",
    valorTotal: 531.25,
    cupomFiscal: "NFC-e 979512",
    postoConveniado: "Posto Central Saúde (Unidade Contorno)",
  },
];

const INITIAL_MANUTENCOES: ManutencaoVeiculo[] = [
  {
    id: "manut-1",
    veiculoId: "veic-3",
    veiculoPlaca: "SAU-3C46",
    contratoManutencaoId: "ct-5",
    osNumero: "OS-MEC-2025/082",
    dataEntrada: "2025-10-05T09:00:00Z",
    servicosRealizados: "Substituição da embreagem, pastilhas de freio dianteiras e sangria do circuito de freios",
    valor: 3450,
    status: "Em Execução na Oficina",
  },
];

const INITIAL_ATIVOS_TI: AtivoTI[] = [
  {
    id: "ti-1",
    patrimonio: "SMS-TI-00421",
    tipo: "SERVIDOR",
    marca: "Dell",
    modelo: "PowerEdge R750 2x Xeon 32 Core 128GB RAM",
    setorAlocado: "Datacenter Central / Sala de Servidores",
    responsavel: "Thiago Rocha Lima",
    status: "EM_USO",
    dataAquisicao: "2023-05-10",
  },
  {
    id: "ti-2",
    patrimonio: "SMS-TI-00892",
    tipo: "DESKTOP",
    marca: "Dell",
    modelo: "OptiPlex 3000 Core i5 16GB SSD 512GB",
    setorAlocado: "Farmácia Central / Dispensação",
    responsavel: "Felipe Bastos Oliveira",
    status: "EM_USO",
    dataAquisicao: "2024-02-18",
  },
  {
    id: "ti-3",
    patrimonio: "SMS-TI-01104",
    tipo: "NOTEBOOK",
    marca: "Lenovo",
    modelo: "ThinkPad E14 AMD Ryzen 7 16GB",
    setorAlocado: "Coordenação de Vigilância Epidemiológica",
    responsavel: "Dr. Carlos Eduardo Menezes",
    status: "EM_USO",
    dataAquisicao: "2024-01-20",
  },
  {
    id: "ti-4",
    patrimonio: "SMS-TI-00650",
    tipo: "SWITCH",
    marca: "Cisco",
    modelo: "Catalyst 2960-X 48 Portas Gigabit PoE+",
    setorAlocado: "Central de Regulação de Leitos",
    responsavel: "Thiago Rocha Lima",
    status: "EM_USO",
    dataAquisicao: "2023-08-14",
  },
];

const INITIAL_LICENCAS: LicencaSoftware[] = [
  {
    id: "lic-1",
    software: "Windows Server 2022 Datacenter Edition",
    fabricante: "Microsoft",
    quantidade: 4,
    quantidadeEmUso: 4,
    vigenciaFim: "2027-12-31",
    chaveLicenca: "WNSVR-XXXXX-YYYYY-ZZZZZ",
  },
  {
    id: "lic-2",
    software: "Bitdefender GravityZone Security Endpoint (Antivírus Saúde)",
    fabricante: "Bitdefender",
    quantidade: 350,
    quantidadeEmUso: 312,
    vigenciaFim: "2026-03-30",
  },
];

const INITIAL_JUDICIAL: DemandaJudicial[] = [
  {
    id: "jud-1",
    numeroProcessoJudicial: "5001245-88.2025.8.13.0024",
    varaJuizo: "1ª Vara da Fazenda Pública Municipal",
    poloAtivo: "Maria Aparecida dos Santos (Representada pela Defensoria Pública)",
    tipoDemanda: "MEDICAMENTO",
    dataIntimacao: "2025-10-07T11:00:00Z",
    prazoCumprimento: "2025-10-09T18:00:00Z", // Faltam ~24h a 48h! Urgente!
    status: "EM_ANALISE",
    prioridade: "URGÊNCIA MÁXIMA / LIMINAR FATA",
    valorEstimado: 48500,
    relatoCaso: "Liminar deferida determinando fornecimento imediato em 48 horas de Trastuzumabe Entansina (Kadcyla 100mg) para paciente com Carcinoma de Mama metastático HER2+. Sob pena de bloqueio judicial das contas da Secretaria de Saúde e multa diária de R$ 5.000,00.",
    vinculosExecucao: [
      {
        id: "vinc-1",
        demandaId: "jud-1",
        contratoId: "ct-4",
        contratoNumero: "CT-2025/078",
        fornecedorId: "forn-2",
        fornecedorNome: "Hospitalar Farma Minas",
        dataVinculacao: "2025-10-07T16:00:00Z",
        valorEmpenhadoJudicial: 48500,
        statusCumprimento: "Em Cotação Emergencial com a Distribuidora Contratada",
      },
    ],
  },
  {
    id: "jud-2",
    numeroProcessoJudicial: "5003412-12.2025.8.13.0024",
    varaJuizo: "Vara da Infância e da Juventude",
    poloAtivo: "L. M. S. (Menor, representado por sua genitora Joana Silva)",
    tipoDemanda: "LEITO_UTI",
    dataIntimacao: "2025-10-08T08:00:00Z",
    prazoCumprimento: "2025-10-08T18:00:00Z", // Faltam 3 horas! Contagem regressiva fatal!
    status: "EM_ANALISE",
    prioridade: "PRAZO FATAL: 6 HORAS",
    valorEstimado: 25000,
    relatoCaso: "Determinação de transferência imediata com ambulância UTI Pediátrica Tipo D para leito de terapia intensiva neonatal em hospital credenciado SUS ou rede particular.",
    vinculosExecucao: [
      {
        id: "vinc-2",
        demandaId: "jud-2",
        contratoId: "ct-2",
        contratoNumero: "CT-2025/034",
        fornecedorId: "forn-4",
        fornecedorNome: "AutoLoc Resgate",
        dataVinculacao: "2025-10-08T09:30:00Z",
        valorEmpenhadoJudicial: 25000,
        statusCumprimento: "Viatura USA-01 Acionada para Transferência com Equipe Pediátrica",
      },
    ],
  },
  {
    id: "jud-3",
    numeroProcessoJudicial: "5004190-67.2025.8.13.0024",
    varaJuizo: "2ª Vara da Fazenda Pública Municipal",
    poloAtivo: "Benedito de Oliveira",
    tipoDemanda: "INSUMO",
    dataIntimacao: "2025-10-02T14:00:00Z",
    prazoCumprimento: "2025-10-15T18:00:00Z",
    status: "CUMPRIDA",
    prioridade: "Média",
    valorEstimado: 12800,
    relatoCaso: "Fornecimento de Concentrador de Oxigênio Domiciliar 5L/min e cilindro de reserva para paciente portador de DPOC grave com hipoxemia.",
    vinculosExecucao: [
      {
        id: "vinc-3",
        demandaId: "jud-3",
        contratoId: "ct-4",
        fornecedorId: "forn-5",
        fornecedorNome: "White Martins Oxigênio Hospitalar",
        dataVinculacao: "2025-10-03T10:00:00Z",
        valorEmpenhadoJudicial: 12800,
        statusCumprimento: "Entregue e Instalado na Residência do Paciente",
      },
    ],
  },
];

// -------------------------------------------------------------
// MODELOS DE DOCUMENTOS E OFÍCIOS PREVIAMENTE ELABORADOS NA PLATAFORMA
// -------------------------------------------------------------

const INITIAL_DOCUMENTOS_ELABORADOS: DocumentoElaborado[] = [
  {
    id: "doc-oficio-018",
    modeloId: "mod-79",
    titulo: "OFÍCIO Nº 018/2025 - SMS/SG - Solicitação de Reserva Orçamentária",
    tipoPeca: "Ofício",
    modalidade: "OFÍCIOS E MEMORANDOS",
    artigoLei: "Art. 72 (Lei 14.133/2021) e LRF",
    numeroProcesso: "PA-2025/00294",
    numeroCapa: "CP-031/25",
    dataDocumento: "2025-02-14",
    cidadeDataExtenso: "Arapiraca/AL, 14 de fevereiro de 2025",
    orgaoRequisitante: "Superintendência de Gestão (SG) - Secretaria Municipal de Saúde",
    servidorResponsavel: "Dr. Carlos Eduardo Menezes",
    matriculaServidor: "143660",
    cargoServidor: "Superintendente de Gestão (SG)",
    objeto: "Solicitação de Reserva Orçamentária para Aquisição Contínua de Insumos Hospitalares e Medicamentos da Farmácia Básica",
    justificativa: "A presente solicitação fundamenta-se na Lei Federal nº 14.133/2021 e na LRF, sendo indispensável para assegurar o fornecimento contínuo de materiais da rede municipal de saúde de Arapiraca.",
    itens: [
      { item: 1, descricao: "Insulina Glargina 100UI/ml Caneta Aplicadora", unidade: "UNID", quantidade: 1200, valorUnitario: 68.50, valorTotal: 82200.00 },
      { item: 2, descricao: "Amoxicilina + Clavulanato 500mg/125mg Comprimido", unidade: "CX", quantidade: 850, valorUnitario: 42.00, valorTotal: 35700.00 }
    ],
    secoes: [
      {
        id: "sec-destinatario",
        titulo: "Destinatário Oficial",
        conteudo: "Ao Excelentíssimo Senhor\nSecretário Municipal da Fazenda e Planejamento\nPrefeitura Municipal de Arapiraca / AL",
        obrigatoria: true,
      },
      {
        id: "sec-assunto",
        titulo: "Assunto",
        conteudo: "Assunto: Solicitação de Bloqueio e Reserva Orçamentária para Medicamentos - PA nº 2025/00294",
        obrigatoria: true,
      },
      {
        id: "sec-texto",
        titulo: "Texto Oficial / Solicitação",
        conteudo: "Cumprimentando-o cordialmente, servimo-nos do presente para solicitar a Vossa Excelência a emissão da competente Reserva Orçamentária no valor de R$ 117.900,00, vinculada à Dotação da Saúde Básica, para instrução do processo licitatório.",
        obrigatoria: true,
      }
    ],
    status: "CONCLUIDO",
    downloadUrlOriginal: "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO SOLICITAÇÃO DE RESERVA.docx",
    createdAt: "2025-02-14T10:00:00.000Z",
    updatedAt: "2025-02-14T10:30:00.000Z",
  },
  {
    id: "doc-oficio-024",
    modeloId: "mod-77",
    titulo: "OFÍCIO Nº 024/2025 - SMS/SG - Solicitação de Empenho",
    tipoPeca: "Ofício",
    modalidade: "OFÍCIOS E MEMORANDOS",
    artigoLei: "Art. 95 (Lei 14.133/2021) e Lei 4.320/1964",
    numeroProcesso: "PA-2025/00108",
    numeroCapa: "CP-012/25",
    dataDocumento: "2025-02-10",
    cidadeDataExtenso: "Arapiraca/AL, 10 de fevereiro de 2025",
    orgaoRequisitante: "Superintendência de Gestão (SG) - Coordenação de Frotas",
    servidorResponsavel: "Dr. Carlos Eduardo Menezes",
    matriculaServidor: "143660",
    cargoServidor: "Superintendente de Gestão (SG)",
    objeto: "Solicitação de Nota de Empenho para Manutenção Preventiva e Corretiva da Frota de Ambulâncias do SAMU Arapiraca",
    justificativa: "Garantir a operacionalidade das ambulâncias em plantão 24 horas.",
    itens: [
      { item: 1, descricao: "Revisão Geral e Troca de Pastilhas e Filtros - Ambulância SAMU USA-02", unidade: "SERV", quantidade: 1, valorUnitario: 4850.00, valorTotal: 4850.00 }
    ],
    secoes: [
      {
        id: "sec-destinatario",
        titulo: "Destinatário Oficial",
        conteudo: "À Diretoria de Contabilidade e Finanças\nSecretaria Municipal de Saúde - SMS Arapiraca",
        obrigatoria: true,
      },
      {
        id: "sec-assunto",
        titulo: "Assunto",
        conteudo: "Assunto: Emissão de Nota de Empenho Ordinário - CT nº 2025/090",
        obrigatoria: true,
      },
      {
        id: "sec-texto",
        titulo: "Texto Oficial / Solicitação",
        conteudo: "Solicitamos a emissão de Nota de Empenho no valor de R$ 4.850,00 em favor da empresa credenciada para manutenção das viaturas de resgate.",
        obrigatoria: true,
      }
    ],
    status: "ASSINADO",
    downloadUrlOriginal: "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO SOLICITAÇÃO DE EMPENHO.docx",
    createdAt: "2025-02-10T14:20:00.000Z",
    updatedAt: "2025-02-10T16:00:00.000Z",
  },
  {
    id: "doc-parecer-001",
    modeloId: "mod-128",
    titulo: "PARECER DE ACEITAÇÃO - CT Nº 1133/2025 - Vida Oxigênio",
    tipoPeca: "Parecer de Aceitação",
    modalidade: "OFÍCIOS E MEMORANDOS",
    artigoLei: "Art. 140 (Lei nº 14.133/2021) - Recebimento e Aceite Definitivo",
    numeroProcesso: "PA-2025/00133",
    numeroCapa: "CP-015/25",
    dataDocumento: "2026-08-27",
    cidadeDataExtenso: "Arapiraca/AL, 27 de agosto de 2026",
    orgaoRequisitante: "Superintendência de Gestão (SG) - Secretaria Municipal de Saúde",
    servidorResponsavel: "Eugênio Pereira de Sousa",
    matriculaServidor: "148920",
    cargoServidor: "Gestor de Contrato Titular",
    objeto: "Recebimento e Aceite Definitivo de Fornecimento de Gases Medicinais e Oxigênio Líquido - Nota Fiscal nº 000.001.783 (Contrato Administrativo nº 1133/2025).",
    justificativa: "Comprovação e ateste definitivo de fornecimento de oxigênio medicinal para a rede de saúde em conformidade com o Art. 140 da Lei nº 14.133/2021.",
    itens: [
      {
        item: 1,
        descricao: "Oxigênio Medicinal Gasoso e Líquido - Recarga e Fornecimento Contínuo (Nota Fiscal nº 000.001.783)",
        unidade: "M³",
        quantidade: 360,
        valorUnitario: 8.30,
        valorTotal: 2988.00,
      }
    ],
    secoes: [
      {
        id: "sec-contrato",
        titulo: "1. Dados do Contrato e Contratada",
        conteudo: "Contrato nº 1133/2025\nVigência do Contrato: A vigência do contrato será de 12 (doze) meses contados da data de assinatura do contrato, podendo ser prorrogado por até 05 (cinco) anos, nos termos do art. 107 da Lei nº 14133/2021.\nData de assinatura: 30 de janeiro de 2025.\nRazão Social da Contratada: Empresa VIDA OXIGÊNIO LTDA\nValor do Pagamento: R$ 2.988,00 (dois mil, novecentos e oitenta e oito reais).",
        obrigatoria: true,
      },
      {
        id: "sec-declaracao",
        titulo: "2. Declaração do Gestor e Verificação Técnica",
        conteudo: "Na qualidade de Gestor do Contrato n° 1133/2025, celebrado entre este município e a Empresa VIDA OXIGÊNIO LTDA, com CNPJ n° 44.735.857/0001-25, sediada na Rua José Adilson da Silva, nº 10, Bairro Domingos Acácio, CEP: 57.500-000, em atendimento a Cláusula Décima Quarta, do Contrato acima referenciado, declaro que os itens especificados na nota fiscal: de Nº 000.001.783, foram efetivamente fornecidos, conferidos e aceitos definitivamente.",
        obrigatoria: true,
      },
      {
        id: "sec-aprovacao",
        titulo: "3. Conclusão e Total Aprovação",
        conteudo: "Os itens foram submetidos a verificação deste Gestor, sendo considerados aceitos por atender aos requisitos da quantidade, qualidade desejada e ainda às especificações estabelecidas, tudo em conformidade com o Contrato em comento, celebrado entre a Município de Arapiraca e a CONTRATADA, reunindo condições de total aprovação.",
        obrigatoria: true,
      }
    ],
    status: "ASSINADO",
    downloadUrlOriginal: "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/PARECER DE ACEITAÇÃO.docx",
    createdAt: "2026-08-27T10:00:00.000Z",
    updatedAt: "2026-08-27T11:30:00.000Z",
  }
];

// =============================================================
// DADOS INICIAIS DE SOLICITAÇÕES DE CADASTRO (PARA AUTORIZAÇÃO SG)
// =============================================================
export const INITIAL_SOLICITACOES_CADASTRO: SolicitacaoCadastro[] = [
  {
    id: "cad-001",
    email: "juliana.lima@saude.gov.br",
    nomeCompleto: "Dra. Juliana Ferreira Lima",
    dataNascimento: "1988-06-14",
    cpf: "058.491.824-30",
    whatsapp: "(81) 99876-1234",
    matricula: "152.890-1",
    superintendenciaLotacao: "SAS",
    cargo: "Médica Especialista - Regulação Ambulatorial",
    dataSolicitacao: "2026-10-18T14:20:00.000Z",
    status: "PENDENTE_SG",
  },
  {
    id: "cad-002",
    email: "thiago.cavalcante@saude.gov.br",
    nomeCompleto: "Thiago Albuquerque Cavalcante",
    dataNascimento: "1994-11-22",
    cpf: "072.338.914-55",
    whatsapp: "(81) 99234-5678",
    matricula: "153.104-7",
    superintendenciaLotacao: "SUVIG",
    cargo: "Fiscal Sanitário e Epidemiológico",
    dataSolicitacao: "2026-10-19T08:15:00.000Z",
    status: "PENDENTE_SG",
  },
  {
    id: "cad-003",
    email: "mariana.albuquerque@saude.gov.br",
    nomeCompleto: "Enfª. Mariana Albuquerque",
    dataNascimento: "1985-03-29",
    cpf: "039.812.504-12",
    whatsapp: "(81) 98765-4321",
    matricula: "143.660-2",
    superintendenciaLotacao: "SAS",
    cargo: "Coordenadora de Atenção Básica",
    dataSolicitacao: "2026-10-10T09:30:00.000Z",
    status: "AUTORIZADO",
    autorizadoPor: "Dr. Carlos Eduardo Menezes (Superintendente SG)",
    dataAutorizacao: "2026-10-10T10:45:00.000Z",
    observacoesSG: "Acesso autorizado com perfil solicitante para demandas da Atenção Primária.",
    permissoes: [
      { moduloId: "cadastro", moduloNome: "CADASTRO & Controle de Acessos", visualizar: false, editar: false, nivel: "SEM_ACESSO" },
      { moduloId: "tramitacao", moduloNome: "Tramitação & Governança", visualizar: true, editar: true, nivel: "VISUALIZACAO_E_EDICAO" },
      { moduloId: "visao_geral", moduloNome: "Visão Geral 360º", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "solicitacoes", moduloNome: "Solicitações de Demandas Prévias", visualizar: true, editar: true, nivel: "VISUALIZACAO_E_EDICAO" },
      { moduloId: "processos", moduloNome: "Processos & Licitações", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "contratos", moduloNome: "Contratos & Atas de Registro de Preços", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "frotas", moduloNome: "Frotas & Transportes Sanitários", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "orcamento", moduloNome: "Orçamento & Créditos Adicionais", visualizar: false, editar: false, nivel: "SEM_ACESSO" },
      { moduloId: "judicializacao", moduloNome: "Judicialização da Saúde", visualizar: false, editar: false, nivel: "SEM_ACESSO" },
      { moduloId: "ti", moduloNome: "Parque TI & Licenças", visualizar: false, editar: false, nivel: "SEM_ACESSO" },
    ],
  },
  {
    id: "cad-004",
    email: "roberto.nogueira@saude.gov.br",
    nomeCompleto: "Tenente Roberto Nogueira",
    dataNascimento: "1978-08-10",
    cpf: "012.983.474-09",
    whatsapp: "(81) 99654-3210",
    matricula: "141.055-3",
    superintendenciaLotacao: "SG",
    cargo: "Fiscal de Contratos & Atas Titular",
    dataSolicitacao: "2026-10-05T11:00:00.000Z",
    status: "AUTORIZADO",
    autorizadoPor: "Dr. Carlos Eduardo Menezes (Superintendente SG)",
    dataAutorizacao: "2026-10-05T11:30:00.000Z",
    observacoesSG: "Fiscal titular de contratos de combustíveis e locação de ambulâncias.",
    permissoes: [
      { moduloId: "cadastro", moduloNome: "CADASTRO & Controle de Acessos", visualizar: false, editar: false, nivel: "SEM_ACESSO" },
      { moduloId: "tramitacao", moduloNome: "Tramitação & Governança", visualizar: true, editar: true, nivel: "VISUALIZACAO_E_EDICAO" },
      { moduloId: "visao_geral", moduloNome: "Visão Geral 360º", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "solicitacoes", moduloNome: "Solicitações de Demandas Prévias", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "processos", moduloNome: "Processos & Licitações", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "contratos", moduloNome: "Contratos & Atas de Registro de Preços", visualizar: true, editar: true, nivel: "VISUALIZACAO_E_EDICAO" },
      { moduloId: "frotas", moduloNome: "Frotas & Transportes Sanitários", visualizar: true, editar: true, nivel: "VISUALIZACAO_E_EDICAO" },
      { moduloId: "orcamento", moduloNome: "Orçamento & Créditos Adicionais", visualizar: true, editar: false, nivel: "VISUALIZACAO" },
      { moduloId: "judicializacao", moduloNome: "Judicialização da Saúde", visualizar: false, editar: false, nivel: "SEM_ACESSO" },
      { moduloId: "ti", moduloNome: "Parque TI & Licenças", visualizar: false, editar: false, nivel: "SEM_ACESSO" },
    ],
  },
  {
    id: "cad-005",
    email: "marcos.silvestre.externo@gmail.com",
    nomeCompleto: "Marcos Paulo Silvestre",
    dataNascimento: "1999-01-15",
    cpf: "099.112.334-88",
    whatsapp: "(81) 98111-2233",
    matricula: "PENDENTE",
    superintendenciaLotacao: "GABINETE",
    cargo: "Estagiário Voluntário",
    dataSolicitacao: "2026-10-12T16:00:00.000Z",
    status: "REJEITADO",
    autorizadoPor: "Dr. Carlos Eduardo Menezes (Superintendente SG)",
    dataAutorizacao: "2026-10-13T09:10:00.000Z",
    motivoRejeicao: "Matrícula funcional não localizada no quadro oficial da SMS. Necessário comprovar vínculo formal ou portaria.",
  },
];

// -------------------------------------------------------------
// CLASSE SINGLETON COM MECANISMO DE REATIVIDADE
// -------------------------------------------------------------

class SuperGestaoDataStore {
  private static instance: SuperGestaoDataStore;

  public usuarios: Usuario[] = [...INITIAL_USUARIOS];
  public solicitacoesCadastro: SolicitacaoCadastro[] = [...INITIAL_SOLICITACOES_CADASTRO];
  public fornecedores: Fornecedor[] = [...INITIAL_FORNECEDORES];
  public dotacoes: DotacaoOrcamentaria[] = [...INITIAL_DOTACÕES];
  public creditos: CreditoAdicional[] = [...INITIAL_CREDITOS];
  public creditosSMS: RegistroControleCredito[] = [...INITIAL_CONTROLE_CREDITOS];
  public contasCreditoSMS: ContaOrcamentariaCredito[] = [...INITIAL_CONTAS_CREDITOS];
  public cadastrosCreditoSMS: CadastrosReferencia = { ...CADASTROS_CREDITOS };
  public pca: ItemPCA[] = [...INITIAL_PCA];
  public processos: ProcessoAdministrativo[] = [...INITIAL_PROCESSOS];
  public atas: AtaRegistroPrecos[] = [...INITIAL_ATAS];
  public contratos: Contrato[] = [...INITIAL_CONTRATOS];
  public ordens: OrdemFornecimentoServico[] = [...INITIAL_ORDENS];
  public pagamentos: PagamentoLiquidacao[] = [...INITIAL_PAGAMENTOS];
  public veiculos: Veiculo[] = [...INITIAL_VEICULOS];
  public motoristas: Motorista[] = [...INITIAL_MOTORISTAS];
  public escalas: EscalaPlantao24x7[] = [...INITIAL_ESCALAS];
  public abastecimentos: Abastecimento[] = [...INITIAL_ABASTECIMENTOS];
  public manutencoes: ManutencaoVeiculo[] = [...INITIAL_MANUTENCOES];
  public ativosTI: AtivoTI[] = [...INITIAL_ATIVOS_TI];
  public licencas: LicencaSoftware[] = [...INITIAL_LICENCAS];
  public demandasJudiciais: DemandaJudicial[] = [...INITIAL_JUDICIAL];
  public demandasPrevias: DemandaPreviaProcesso[] = [...INITIAL_DEMANDAS_PREVIAS];
  public documentosElaborados: DocumentoElaborado[] = [...INITIAL_DOCUMENTOS_ELABORADOS];

  private constructor() {}

  public static getInstance(): SuperGestaoDataStore {
    if (!SuperGestaoDataStore.instance) {
      SuperGestaoDataStore.instance = new SuperGestaoDataStore();
    }
    return SuperGestaoDataStore.instance;
  }

  // -----------------------------------------------------------
  // 1. REATIVIDADE: EMISSÃO DE OF COM DEDUÇÃO ATÔMICA DE SALDO
  // -----------------------------------------------------------
  public emitirOrdemFornecimento(dados: {
    contratoId: string;
    itens: { itemContratoId: string; quantidade: number }[];
    prazoEntrega?: string;
    observacoes?: string;
  }): { success: boolean; message: string; ordem?: OrdemFornecimentoServico } {
    const contrato = this.contratos.find((c) => c.id === dados.contratoId);
    if (!contrato) {
      return { success: false, message: "Contrato não encontrado." };
    }

    if (!contrato.itens || contrato.itens.length === 0) {
      return { success: false, message: "O contrato não possui itens vinculados." };
    }

    // Validação prévia de saldos de cada item
    let valorTotalCalculado = 0;
    const itensValidados: {
      itemContrato: ItemContrato;
      quantidadeSolicitada: number;
      valorTotalItem: number;
    }[] = [];

    for (const sol of dados.itens) {
      if (sol.quantidade <= 0) continue;
      const itemContrato = contrato.itens.find((i) => i.id === sol.itemContratoId);
      if (!itemContrato) {
        return {
          success: false,
          message: `Item de contrato ID ${sol.itemContratoId} não localizado.`,
        };
      }

      if (sol.quantidade > itemContrato.quantidadeDisponivel) {
        return {
          success: false,
          message: `Saldo insuficiente para o item '${itemContrato.descricao}'. Saldo disponível: ${itemContrato.quantidadeDisponivel} ${itemContrato.unidadeMedida}, Solicitado: ${sol.quantidade}.`,
        };
      }

      const valorTotalItem = sol.quantidade * itemContrato.valorUnitario;
      valorTotalCalculado += valorTotalItem;

      itensValidados.push({
        itemContrato,
        quantidadeSolicitada: sol.quantidade,
        valorTotalItem,
      });
    }

    if (itensValidados.length === 0) {
      return { success: false, message: "Nenhum item com quantidade válida foi selecionado." };
    }

    // Validação do saldo financeiro global do contrato
    if (valorTotalCalculado > contrato.saldoFinanceiroAtual) {
      return {
        success: false,
        message: `Valor total da ordem (R$ ${valorTotalCalculado.toFixed(
          2
        )}) excede o saldo financeiro disponível do contrato (R$ ${contrato.saldoFinanceiroAtual.toFixed(
          2
        )}). Operação bloqueada!`,
      };
    }

    // Execução atômica da dedução
    contrato.saldoFinanceiroAtual -= valorTotalCalculado;

    // Se derivado de ata de registro de preços, abater também da ata
    if (contrato.ataOrigemId) {
      const ata = this.atas.find((a) => a.id === contrato.ataOrigemId);
      if (ata) {
        ata.saldoTotalDisponivel = Math.max(0, ata.saldoTotalDisponivel - valorTotalCalculado);
      }
    }

    const ordemId = `of-${Date.now()}`;
    const numeroOF = `OF-2025/${String(this.ordens.length + 1).padStart(4, "0")}`;

    const novosItensOF = itensValidados.map((iv, idx) => {
      // Abate item do contrato
      iv.itemContrato.quantidadeDisponivel = Math.max(0, iv.itemContrato.quantidadeDisponivel - iv.quantidadeSolicitada);
      iv.itemContrato.saldoItem = Math.max(0, iv.itemContrato.saldoItem - iv.valorTotalItem);

      // Abate proporcional/sequencial nas dotações do item (Programa de Trabalho / Elemento / Fonte)
      if (iv.itemContrato.dotacoes && iv.itemContrato.dotacoes.length > 0) {
        let valorRestante = iv.valorTotalItem;
        for (const dot of iv.itemContrato.dotacoes) {
          if (valorRestante <= 0) break;
          const abatimento = Math.min(dot.saldoDotacaoItem, valorRestante);
          dot.saldoDotacaoItem = Math.max(0, dot.saldoDotacaoItem - abatimento);
          if (dot.quantidadeDisponivelDotacao !== undefined) {
            const qtdAbatida = Math.min(dot.quantidadeDisponivelDotacao, abatimento / iv.itemContrato.valorUnitario);
            dot.quantidadeDisponivelDotacao = Math.max(0, dot.quantidadeDisponivelDotacao - qtdAbatida);
          }
          valorRestante -= abatimento;
        }
      }

      return {
        id: `itof-${Date.now()}-${idx}`,
        ordemId,
        itemContratoId: iv.itemContrato.id,
        descricao: iv.itemContrato.descricao,
        quantidadeSolicitada: iv.quantidadeSolicitada,
        valorUnitario: iv.itemContrato.valorUnitario,
        valorTotal: iv.valorTotalItem,
      };
    });

    const novaOrdem: OrdemFornecimentoServico = {
      id: ordemId,
      numeroOF,
      contratoId: contrato.id,
      contratoNumero: contrato.numeroContrato,
      fornecedorNome: this.fornecedores.find((f) => f.id === contrato.fornecedorId)?.nomeFantasia,
      dataEmissao: new Date().toISOString(),
      prazoEntrega: dados.prazoEntrega,
      valorTotal: valorTotalCalculado,
      status: "EMITIDA",
      observacoes: dados.observacoes,
      itens: novosItensOF,
    };

    this.ordens.unshift(novaOrdem);

    return {
      success: true,
      message: `Ordem ${numeroOF} emitida com sucesso! Saldo financeiro, dotações e quantidades atualizados reativamente.`,
      ordem: novaOrdem,
    };
  }

  // -----------------------------------------------------------
  // 1.1 REATIVIDADE: SOLICITAÇÃO DE PAGAMENTO / LIQUIDAÇÃO
  // -----------------------------------------------------------
  public solicitarPagamentoContrato(dados: {
    contratoId: string;
    ordemId?: string;
    numeroNotaFiscal: string;
    numeroEmpenho?: string;
    numeroLiquidacao?: string;
    valorPago: number;
    dataPagamento?: string;
    itemId?: string;
    dotacaoIndex?: number;
    programaDeTrabalho?: string;
    elementoDespesa?: string;
    fonteRecursoId?: string;
    fonteRecursoNome?: string;
    observacoes?: string;
    atestadoPor?: string;
  }): {
    success: boolean;
    message: string;
    pagamento?: PagamentoLiquidacao;
  } {
    const contrato = this.contratos.find((c) => c.id === dados.contratoId);
    if (!contrato) {
      return { success: false, message: `Contrato ID ${dados.contratoId} não localizado.` };
    }

    if (dados.valorPago <= 0) {
      return { success: false, message: "O valor da solicitação de pagamento deve ser maior que zero." };
    }

    if (dados.valorPago > contrato.saldoFinanceiroAtual) {
      return {
        success: false,
        message: `Valor solicitado (R$ ${dados.valorPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) excede o saldo financeiro disponível do contrato (R$ ${contrato.saldoFinanceiroAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}).`,
      };
    }

    // Se informou item e dotação específica, valida e debita
    if (dados.itemId && contrato.itens) {
      const item = contrato.itens.find((i) => i.id === dados.itemId);
      if (item) {
        if (dados.valorPago > item.saldoItem) {
          return {
            success: false,
            message: `Valor solicitado excede o saldo disponível do item (${item.descricao}). Saldo do item: R$ ${item.saldoItem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
          };
        }
        item.saldoItem = Math.max(0, item.saldoItem - dados.valorPago);
        const qtdAbatida = Math.min(item.quantidadeDisponivel, dados.valorPago / item.valorUnitario);
        item.quantidadeDisponivel = Math.max(0, item.quantidadeDisponivel - qtdAbatida);

        if (item.dotacoes && item.dotacoes.length > 0) {
          if (dados.dotacaoIndex !== undefined && item.dotacoes[dados.dotacaoIndex]) {
            const dot = item.dotacoes[dados.dotacaoIndex];
            dot.saldoDotacaoItem = Math.max(0, dot.saldoDotacaoItem - dados.valorPago);
            if (dot.quantidadeDisponivelDotacao !== undefined) {
              dot.quantidadeDisponivelDotacao = Math.max(0, dot.quantidadeDisponivelDotacao - qtdAbatida);
            }
          } else {
            // Abate proporcional/sequencial nas dotações
            let rest = dados.valorPago;
            for (const d of item.dotacoes) {
              if (rest <= 0) break;
              const ab = Math.min(d.saldoDotacaoItem, rest);
              d.saldoDotacaoItem = Math.max(0, d.saldoDotacaoItem - ab);
              if (d.quantidadeDisponivelDotacao !== undefined) {
                d.quantidadeDisponivelDotacao = Math.max(0, d.quantidadeDisponivelDotacao - (ab / item.valorUnitario));
              }
              rest -= ab;
            }
          }
        }
      }
    }

    // Debita o saldo global do contrato
    contrato.saldoFinanceiroAtual = Math.max(0, contrato.saldoFinanceiroAtual - dados.valorPago);

    const pagamentoId = `pag-${Date.now()}`;
    const numLiq = dados.numeroLiquidacao || `LIQ-2025/${String(this.pagamentos.length + 1).padStart(6, "0")}`;
    const numEmp = dados.numeroEmpenho || `EMP-2025/${String(this.pagamentos.length + 10).padStart(6, "0")}`;

    const novoPagamento: PagamentoLiquidacao = {
      id: pagamentoId,
      contratoId: contrato.id,
      ordemId: dados.ordemId,
      numeroNotaFiscal: dados.numeroNotaFiscal,
      numeroEmpenho: numEmp,
      numeroLiquidacao: numLiq,
      valorPago: dados.valorPago,
      dataPagamento: dados.dataPagamento || new Date().toISOString().split("T")[0],
      fonteRecursoId: dados.fonteRecursoId || "dot-3",
      fonteRecursoNome: dados.fonteRecursoNome || (dados.programaDeTrabalho ? `PT ${dados.programaDeTrabalho}` : "1.500.1002 - Tesouro Municipal"),
      tipoFavorecido: "CONTRATADA",
      status: "Liquidado",
      observacoes: dados.observacoes || (dados.atestadoPor ? `Atesto emitido por: ${dados.atestadoPor}` : undefined),
    };

    this.pagamentos.unshift(novoPagamento);

    // Se tiver ordem vinculada, atualiza status da ordem
    if (dados.ordemId) {
      const ord = this.ordens.find((o) => o.id === dados.ordemId);
      if (ord) {
        ord.status = "ENTREGUE";
      }
    }

    return {
      success: true,
      message: `Solicitação de pagamento para ${dados.numeroNotaFiscal} no valor de R$ ${dados.valorPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} registrada e liquidada com sucesso!`,
      pagamento: novoPagamento,
    };
  }

  // -----------------------------------------------------------
  // 2. REATIVIDADE: NOVO PROCESSO E ATUALIZAÇÃO DO STATUS DO PCA
  // -----------------------------------------------------------
  public criarProcesso(dados: {
    numeroProcesso: string;
    numeroCapa: string;
    objeto: string;
    setorAtual: string;
    itemPcaId?: string;
    dotacaoId?: string;
    valorEstimado?: number;
    modalidade?: string;
    demandaPreviaId?: string;
    superintendenciaOrigem?: SuperintendenciaSigla;
    itensProcesso?: ItemDemandaPrevia[];
  }): { success: boolean; message: string; processo?: ProcessoAdministrativo } {
    // Verificar unicidade do número
    if (this.processos.some((p) => p.numeroProcesso.toLowerCase() === dados.numeroProcesso.toLowerCase())) {
      return { success: false, message: `Já existe um processo com o número ${dados.numeroProcesso}.` };
    }

    const novoProcessoId = `proc-${Date.now()}`;

    const novoProcesso: ProcessoAdministrativo = {
      id: novoProcessoId,
      numeroProcesso: dados.numeroProcesso,
      numeroCapa: dados.numeroCapa,
      objeto: dados.objeto,
      setorAtual: dados.setorAtual,
      status: "FASE_PREPARATORIA",
      modalidade: dados.modalidade,
      valorEstimado: dados.valorEstimado,
      itemPcaId: dados.itemPcaId,
      demandaPreviaId: dados.demandaPreviaId,
      superintendenciaOrigem: dados.superintendenciaOrigem,
      itensProcesso: dados.itensProcesso,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ciclo do PCA: Transição automática para "EM_LICITACAO"
    if (dados.itemPcaId) {
      const itemPca = this.pca.find((p) => p.id === dados.itemPcaId);
      if (itemPca) {
        itemPca.status = "EM_LICITACAO";
      }
    }

    // Se informou dotação e valor, criar reserva orçamentária
    if (dados.dotacaoId && dados.valorEstimado) {
      const dotacao = this.dotacoes.find((d) => d.id === dados.dotacaoId);
      if (dotacao) {
        dotacao.saldoDisponivel = Math.max(0, dotacao.saldoDisponivel - dados.valorEstimado);
        dotacao.valorReservado += dados.valorEstimado;
      }
    }

    // Se vinculado a uma demanda prévia da Superintendência, atualizar a demanda
    if (dados.demandaPreviaId) {
      const dem = this.demandasPrevias.find((d) => d.id === dados.demandaPreviaId);
      if (dem) {
        dem.status = "ENQUADRADA_E_AUTORIZADA";
        if (dem.enquadramentoSG) {
          dem.enquadramentoSG.processoAdministrativoId = novoProcessoId;
          dem.enquadramentoSG.numeroProcessoGerado = dados.numeroProcesso;
        }
      }
    }

    this.processos.unshift(novoProcesso);

    return {
      success: true,
      message: `Processo ${dados.numeroProcesso} instaurado com sucesso. Item do PCA e demanda sincronizados!`,
      processo: novoProcesso,
    };
  }

  // -----------------------------------------------------------
  // 2.2 ATUALIZAÇÃO DO STATUS / LOCALIZAÇÃO DESCRITIVA DO PROCESSO
  // -----------------------------------------------------------
  public atualizarStatusTramitacaoProcesso(
    processoId: string,
    dados: {
      statusDescritivo?: string;
      setorAtual?: string;
      dataEntradaSetor?: string;
      status?: StatusProcesso;
    }
  ): { success: boolean; message: string; processo?: ProcessoAdministrativo } {
    const proc = this.processos.find((p) => p.id === processoId);
    if (!proc) {
      return { success: false, message: "Processo não encontrado." };
    }

    if (dados.statusDescritivo !== undefined) {
      proc.statusDescritivo = dados.statusDescritivo;
    }
    if (dados.setorAtual) {
      proc.setorAtual = dados.setorAtual;
    }
    if (dados.dataEntradaSetor) {
      proc.dataEntradaSetor = dados.dataEntradaSetor;
    }
    if (dados.status) {
      proc.status = dados.status;
    }
    proc.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: `Status do processo ${proc.numeroProcesso} atualizado com sucesso!`,
      processo: proc,
    };
  }

  // -----------------------------------------------------------
  // 2.1 TRAMITAÇÃO DE DEMANDAS PRÉVIAS (SAS, SUVIG, SGTES, SURCAA ➔ SG)
  // -----------------------------------------------------------
  public criarDemandaPrevia(dados: {
    superintendenciaOrigem: SuperintendenciaSigla;
    coordenacaoOrigem: string;
    responsavelNome: string;
    responsavelEmail?: string;
    responsavelWhatsapp?: string;
    objeto: string;
    justificativaNecessidade: string;
    publicoAlvoOuDestino?: string;
    itens: {
      descricao: string;
      unidadeMedida: string;
      quantidade: number;
      valorUnitarioEstimado?: number;
      especificacaoTecnica?: string;
    }[];
  }): { success: boolean; message: string; demanda?: DemandaPreviaProcesso } {
    const sigla = dados.superintendenciaOrigem;
    const superInfo = SUPERINTENDENCIAS_SMS.find((s) => s.sigla === sigla);
    const superNome = superInfo ? superInfo.nome : sigla;

    const countExistente = this.demandasPrevias.filter((d) => d.superintendenciaOrigem === sigla).length + 1;
    const ano = new Date().getFullYear();
    const numeroDemanda = `DEM-${ano}/${sigla}-${countExistente.toString().padStart(3, "0")}`;

    let valorTotal = 0;
    const itensMapeados: ItemDemandaPrevia[] = dados.itens.map((it, idx) => {
      const vUnit = it.valorUnitarioEstimado || 0;
      const vTotal = it.quantidade * vUnit;
      valorTotal += vTotal;
      return {
        id: `itdem-${Date.now()}-${idx}`,
        numeroItem: idx + 1,
        descricao: it.descricao,
        unidadeMedida: it.unidadeMedida,
        quantidade: it.quantidade,
        valorUnitarioEstimado: it.valorUnitarioEstimado,
        valorTotalEstimado: vTotal,
        especificacaoTecnica: it.especificacaoTecnica,
      };
    });

    const novaDemanda: DemandaPreviaProcesso = {
      id: `dem-${Date.now()}`,
      numeroDemanda,
      superintendenciaOrigem: sigla,
      superintendenciaNome: superNome,
      coordenacaoOrigem: dados.coordenacaoOrigem,
      responsavelNome: dados.responsavelNome,
      responsavelEmail: dados.responsavelEmail,
      responsavelWhatsapp: dados.responsavelWhatsapp,
      dataSolicitacao: new Date().toISOString(),
      objeto: dados.objeto,
      justificativaNecessidade: dados.justificativaNecessidade,
      publicoAlvoOuDestino: dados.publicoAlvoOuDestino || "Usuários da Rede de Saúde Pública Municipal",
      itens: itensMapeados,
      valorTotalEstimado: valorTotal,
      status: "AGUARDANDO_ENQUADRAMENTO_SG",
      historicoTramitacao: [
        {
          id: `hist-${Date.now()}`,
          data: new Date().toISOString(),
          origem: `${sigla} - ${dados.coordenacaoOrigem}`,
          destino: "Superintendência de Gestão (SG)",
          acao: "Submissão de Demanda Prévia com Itens e Quantidades",
          motivoOuDespacho: `Demanda protocolada contendo ${itensMapeados.length} item(ns). Aguardando análise de competência da SG para indicação da modalidade licitatória.`,
          usuario: dados.responsavelNome,
        },
      ],
    };

    this.demandasPrevias.unshift(novaDemanda);

    return {
      success: true,
      message: `Demanda ${numeroDemanda} protocolada com sucesso e tramitada para a Superintendência de Gestão (SG).`,
      demanda: novaDemanda,
    };
  }

  // -----------------------------------------------------------
  // 2.2 ENQUADRAMENTO EXCLUSIVO PELA SUPERINTENDÊNCIA DE GESTÃO (SG)
  // -----------------------------------------------------------
  public enquadrarDemandaSG(dados: {
    demandaId: string;
    analistaSG: string; // Coordenadora Geral
    coordenadoraNome?: string;
    modalidadeDefinidaId: string;
    modalidadeDefinidaNome: string;
    artigoLeiBase: string;
    justificativaEnquadramento: string;
    observacoesSG?: string;
    autuarProcessoImediato?: boolean;
    dotacaoId?: string;
    servidorSGDestinoId?: string;
    servidorSGDestinoNome?: string;
    servidorSGDestinoCargo?: string;
    servidorSGDestinoEmail?: string;
    artefatosDisponibilizados?: string[];
  }): { success: boolean; message: string; processoGerado?: ProcessoAdministrativo } {
    const demanda = this.demandasPrevias.find((d) => d.id === dados.demandaId);
    if (!demanda) {
      return { success: false, message: "Demanda prévia não localizada." };
    }

    const agora = new Date().toISOString();
    const nomeCoordenadora = dados.coordenadoraNome || dados.analistaSG;
    const servidorSGNome = dados.servidorSGDestinoNome || "Mariana Alcantara Rios (Diretora de Compras e Contratos / SG)";
    const servidorSGId = dados.servidorSGDestinoId || "usr-2";
    const emailDemandante = demanda.responsavelEmail || "servidor.demandante@saude.gov.br";

    const artefatosLista = dados.artefatosDisponibilizados && dados.artefatosDisponibilizados.length > 0
      ? dados.artefatosDisponibilizados
      : [
          "Documento de Formalização da Demanda (DFD)",
          "Estudo Técnico Preliminar (ETP)",
          "Termo de Referência (TR)",
          "Matriz de Riscos da Contratação",
        ];

    demanda.status = "ENQUADRADA_E_AUTORIZADA";
    demanda.enquadramentoSG = {
      dataDespacho: agora,
      analistaSG: dados.analistaSG,
      coordenadoraNome: nomeCoordenadora,
      modalidadeDefinidaId: dados.modalidadeDefinidaId,
      modalidadeDefinidaNome: dados.modalidadeDefinidaNome,
      artigoLeiBase: dados.artigoLeiBase,
      justificativaEnquadramento: dados.justificativaEnquadramento,
      observacoesSG: dados.observacoesSG,
      // 1. Direcionamento para servidor da SG dar andamento ao processo (com dia e hora)
      direcionamentoSG: {
        servidorSGId,
        servidorSGNome,
        servidorSGCargo: dados.servidorSGDestinoCargo || "Divisão de Contratos e Compras / SG",
        servidorSGEmail: dados.servidorSGDestinoEmail || "sg.processos@saude.gov.br",
        dataHoraDirecionamento: agora,
        coordenadoraNome: nomeCoordenadora,
        visualizado: false,
      },
      // 2. Notificação automática por e-mail encaminhada ao servidor que originou a demanda
      notificacoesOriginador: {
        emailEnviado: true,
        dataHoraEmail: agora,
        destinatarioEmail: emailDemandante,
        mensagemResumo: `Demanda enquadrada em '${dados.modalidadeDefinidaNome}' (${dados.artigoLeiBase}). Artefatos técnicos liberados para elaboração: ${artefatosLista.join(", ")}.`,
        artefatosDisponibilizados: artefatosLista,
      },
    };

    let processoGerado: ProcessoAdministrativo | undefined;

    if (dados.autuarProcessoImediato) {
      const numeroProc = `PA-${new Date().getFullYear()}/00${Math.floor(100 + Math.random() * 900)}`;
      const numeroCapa = `CP-${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear().toString().slice(-2)}`;

      const resProc = this.criarProcesso({
        numeroProcesso: numeroProc,
        numeroCapa,
        objeto: demanda.objeto,
        setorAtual: `${demanda.superintendenciaOrigem} / ${demanda.coordenacaoOrigem}`,
        modalidade: dados.modalidadeDefinidaNome,
        valorEstimado: demanda.valorTotalEstimado,
        dotacaoId: dados.dotacaoId,
        demandaPreviaId: demanda.id,
        superintendenciaOrigem: demanda.superintendenciaOrigem,
        itensProcesso: demanda.itens,
      });

      if (resProc.success && resProc.processo) {
        processoGerado = resProc.processo;
        demanda.enquadramentoSG.processoAdministrativoId = processoGerado.id;
        demanda.enquadramentoSG.numeroProcessoGerado = processoGerado.numeroProcesso;
      }
    }

    // Histórico: 1. Devolução com enquadramento e disparo automático de e-mail institucional
    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}-1`,
      data: agora,
      origem: "Coordenação Geral (SG)",
      destino: `${demanda.superintendenciaOrigem} - ${demanda.coordenacaoOrigem} (${demanda.responsavelNome})`,
      acao: "Enquadramento Licitatório & Devolução com Liberação de Artefatos",
      motivoOuDespacho: `Modalidade definida: ${dados.modalidadeDefinidaNome} (${dados.artigoLeiBase}). Artefatos liberados para elaboração: ${artefatosLista.join(", ")}. Notificação automática enviada via E-mail institucional (${emailDemandante}) ao servidor que originou a demanda.${
        processoGerado ? ` Processo autuado: ${processoGerado.numeroProcesso}.` : ""
      }`,
      usuario: nomeCoordenadora,
    });

    // Histórico: 2. Direcionamento simultâneo para o servidor da SG com data e hora
    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}-2`,
      data: agora,
      origem: "Coordenação Geral (SG)",
      destino: `SG - ${servidorSGNome}`,
      acao: "Direcionamento de Demanda para Servidor da SG",
      motivoOuDespacho: `A Coordenadora Geral direcionou a demanda para ${servidorSGNome} dar andamento ao processo na SG. Direcionamento registrado às ${new Date(agora).toLocaleTimeString("pt-BR")}. Aguardando visualização do servidor designado.`,
      usuario: nomeCoordenadora,
    });

    return {
      success: true,
      message: `Enquadramento concluído pela Coordenadora Geral! Notificação oficial enviada para o e-mail (${emailDemandante}) do demandante com artefatos liberados. Demanda direcionada para ${servidorSGNome} com dia e hora registrados.${
        processoGerado ? ` Processo ${processoGerado.numeroProcesso} autuado.` : ""
      }`,
      processoGerado,
    };
  }

  // -----------------------------------------------------------
  // 2.2.1 REGISTRO DE CIÊNCIA / VISUALIZAÇÃO DO SERVIDOR DA SG
  // -----------------------------------------------------------
  public registrarVisualizacaoDirecionamentoSG(
    demandaId: string,
    servidorNome?: string
  ): { success: boolean; message: string; dataHoraVisualizacao?: string } {
    const demanda = this.demandasPrevias.find((d) => d.id === demandaId);
    if (!demanda || !demanda.enquadramentoSG?.direcionamentoSG) {
      return { success: false, message: "Demanda ou direcionamento não localizado." };
    }

    if (demanda.enquadramentoSG.direcionamentoSG.visualizado) {
      return {
        success: true,
        message: "Direcionamento já havia sido visualizado anteriormente.",
        dataHoraVisualizacao: demanda.enquadramentoSG.direcionamentoSG.dataHoraVisualizacao,
      };
    }

    const agora = new Date().toISOString();
    const nomeVisualizador = servidorNome || demanda.enquadramentoSG.direcionamentoSG.servidorSGNome;

    demanda.enquadramentoSG.direcionamentoSG.visualizado = true;
    demanda.enquadramentoSG.direcionamentoSG.dataHoraVisualizacao = agora;

    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}`,
      data: agora,
      origem: "Superintendência de Gestão (SG)",
      destino: "Plataforma Super Gestão Saúde",
      acao: "Ciência e Visualização do Direcionamento pelo Servidor da SG",
      motivoOuDespacho: `O servidor da SG ${nomeVisualizador} visualizou e deu ciência ao direcionamento do processo em ${new Date(agora).toLocaleString("pt-BR")}.`,
      usuario: nomeVisualizador,
    });

    return {
      success: true,
      message: `Visualização registrada com sucesso em ${new Date(agora).toLocaleString("pt-BR")}.`,
      dataHoraVisualizacao: agora,
    };
  }

  public solicitarDiligenciaSG(dados: {
    demandaId: string;
    analistaSG: string;
    motivoDiligencia: string;
  }): { success: boolean; message: string } {
    const demanda = this.demandasPrevias.find((d) => d.id === dados.demandaId);
    if (!demanda) {
      return { success: false, message: "Demanda não encontrada." };
    }

    demanda.status = "DILIGENCIA_SOLICITADA";
    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}`,
      data: new Date().toISOString(),
      origem: "Superintendência de Gestão (SG)",
      destino: `${demanda.superintendenciaOrigem} - ${demanda.coordenacaoOrigem}`,
      acao: "Solicitação de Diligência / Adequação de Quantitativos",
      motivoOuDespacho: dados.motivoDiligencia,
      usuario: dados.analistaSG,
    });

    return {
      success: true,
      message: "Diligência solicitada. Demanda devolvida à Superintendência de origem para adequação dos quantitativos.",
    };
  }

  public responderDiligenciaDemandante(dados: {
    demandaId: string;
    usuario: string;
    cargoUsuario?: string;
    respostaTexto: string;
    itensAtualizados?: ItemDemandaPrevia[];
  }): { success: boolean; message: string; demanda?: DemandaPreviaProcesso } {
    const demanda = this.demandasPrevias.find((d) => d.id === dados.demandaId);
    if (!demanda) {
      return { success: false, message: "Demanda não encontrada." };
    }

    if (dados.itensAtualizados && dados.itensAtualizados.length > 0) {
      demanda.itens = dados.itensAtualizados;
      demanda.valorTotalEstimado = dados.itensAtualizados.reduce(
        (acc, item) =>
          acc +
          (item.valorTotalEstimado ||
            item.quantidade * (item.valorUnitarioEstimado || 0)),
        0
      );
    }

    demanda.status = "AGUARDANDO_ENQUADRAMENTO_SG";
    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}`,
      data: new Date().toISOString(),
      origem: `${demanda.superintendenciaOrigem} - ${demanda.coordenacaoOrigem}`,
      destino: "Superintendência de Gestão (SG)",
      acao: "Resposta à Diligência / Retorno à SG",
      motivoOuDespacho: dados.respostaTexto,
      usuario: dados.usuario,
    });

    return {
      success: true,
      message:
        "Diligência respondida com sucesso! Demanda reencaminhada à Superintendência de Gestão (SG) para enquadramento.",
      demanda,
    };
  }

  public adicionarDespachoTramitacao(dados: {
    demandaId: string;
    origem: string;
    destino: string;
    acao: string;
    motivoOuDespacho: string;
    usuario: string;
  }): { success: boolean; message: string } {
    const demanda = this.demandasPrevias.find((d) => d.id === dados.demandaId);
    if (!demanda) {
      return { success: false, message: "Demanda não encontrada." };
    }

    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}`,
      data: new Date().toISOString(),
      origem: dados.origem,
      destino: dados.destino,
      acao: dados.acao,
      motivoOuDespacho: dados.motivoOuDespacho,
      usuario: dados.usuario,
    });

    return {
      success: true,
      message: "Despacho inserido com sucesso no histórico da tramitação.",
    };
  }

  // -----------------------------------------------------------
  // 3. REATIVIDADE ORÇAMENTÁRIA: CRÉDITOS ADICIONAIS
  // -----------------------------------------------------------
  public adicionarCreditoAdicional(dados: {
    tipo: "SUPLEMENTAR" | "ESPECIAL" | "EXTRAORDINARIO";
    decretoNumero: string;
    valor: number;
    origem: "ANULACAO" | "EXCESSO_ARRECADACAO" | "SUPERAVIT";
    dotacaoDestinoId: string;
    processoOrigemId?: string;
  }): { success: boolean; message: string; credito?: CreditoAdicional } {
    const dotacao = this.dotacoes.find((d) => d.id === dados.dotacaoDestinoId);
    if (!dotacao) return { success: false, message: "Dotação de destino não encontrada." };

    // Vínculo orçamentário direto: Atualizar imediatamente o saldo da dotação
    dotacao.saldoDisponivel += dados.valor;
    dotacao.orcamentoInicial += dados.valor;

    const novoCredito: CreditoAdicional = {
      id: `cred-${Date.now()}`,
      tipo: dados.tipo,
      decretoNumero: dados.decretoNumero,
      valor: dados.valor,
      origem: dados.origem,
      dataAprovacao: new Date().toISOString(),
      dotacaoDestinoId: dados.dotacaoDestinoId,
      processoOrigemId: dados.processoOrigemId,
    };

    this.creditos.unshift(novoCredito);

    return {
      success: true,
      message: `Crédito Adicional ${dados.tipo} homologado. Dotação suplementada com +R$ ${dados.valor.toLocaleString(
        "pt-BR"
      )}.`,
      credito: novoCredito,
    };
  }

  // -----------------------------------------------------------
  // 3.1. GESTÃO OFICIAL DE CRÉDITOS SMS (PLANILHA DE CONTROLE)
  // -----------------------------------------------------------
  public adicionarCreditoSMS(dados: {
    dataCredito?: string;
    tipoCredito: string;
    valor: number;
    solicitante: string;
    programaOrigem: number | string;
    elementoOrigem: string;
    fonteOrigem: string;
    programaDestino: number | string;
    elementoDestino: string;
    fonteDestino: string;
    observacoes?: string;
  }): { success: boolean; message: string; registro: RegistroControleCredito } {
    // Regra da Planilha: verificar se o destino já foi utilizado como origem no histórico
    const destinoJaFoiOrigem = this.creditosSMS.some(
      (c) =>
        String(c.programaOrigem).trim() === String(dados.programaDestino).trim() &&
        String(c.elementoOrigem).trim() === String(dados.elementoDestino).trim() &&
        String(c.fonteOrigem).trim() === String(dados.fonteDestino).trim()
    );

    const proximoNumero =
      this.creditosSMS.length > 0
        ? Math.max(...this.creditosSMS.map((c) => Number(c.numero) || 0)) + 1
        : 1;
    const proximoId =
      this.creditosSMS.length > 0
        ? Math.max(...this.creditosSMS.map((c) => Number(c.id) || 0)) + 1
        : 1;

    const dataHoje = new Date();
    const dataFormatada =
      dados.dataCredito ||
      `${String(dataHoje.getDate()).padStart(2, "0")}/${String(dataHoje.getMonth() + 1).padStart(
        2,
        "0"
      )}/${dataHoje.getFullYear()}`;
    const dataIso = `${dataHoje.getFullYear()}-${String(dataHoje.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(dataHoje.getDate()).padStart(2, "0")}`;

    const status = destinoJaFoiOrigem ? "ERRO" : "OK";
    let observacoes = dados.observacoes || "";
    if (destinoJaFoiOrigem) {
      const msgErro = "Este destino recebeu crédito após já ter sido utilizado como origem.";
      observacoes = observacoes ? `${observacoes} | ${msgErro}` : msgErro;
    }

    const novoRegistro: RegistroControleCredito = {
      id: proximoId,
      numero: proximoNumero,
      dataCredito: dataFormatada,
      dataCreditoIso: dataIso,
      tipoCredito: dados.tipoCredito,
      valor: dados.valor,
      solicitante: dados.solicitante,
      programaOrigem: dados.programaOrigem,
      elementoOrigem: dados.elementoOrigem,
      fonteOrigem: String(dados.fonteOrigem),
      programaDestino: dados.programaDestino,
      elementoDestino: dados.elementoDestino,
      fonteDestino: String(dados.fonteDestino),
      status,
      observacoes,
    };

    this.creditosSMS.unshift(novoRegistro);
    this.recalcularContasSMS();

    return {
      success: true,
      message:
        status === "OK"
          ? `Crédito nº ${proximoNumero} lançado com sucesso.`
          : `Crédito nº ${proximoNumero} lançado com STATUS = ERRO (Destino já foi origem).`,
      registro: novoRegistro,
    };
  }

  public recalcularContasSMS() {
    const contasMap = new Map<string, ContaOrcamentariaCredito>();

    for (const c of this.contasCreditoSMS) {
      const key = `${c.programaTrabalho}|${c.elemento}|${c.fonte}`;
      contasMap.set(key, {
        programaTrabalho: c.programaTrabalho,
        elemento: c.elemento,
        fonte: c.fonte,
        entradas: 0,
        saidas: 0,
        situacao: c.situacao || "ABERTA",
        ultimaEntrada: "",
        ultimaSaida: "",
        podeReceberCredito: "SIM",
        podeFornecerCredito: "SIM",
      });
    }

    for (const m of this.creditosSMS) {
      const origKey = `${m.programaOrigem}|${m.elementoOrigem}|${m.fonteOrigem}`;
      const destKey = `${m.programaDestino}|${m.elementoDestino}|${m.fonteDestino}`;

      if (!contasMap.has(origKey)) {
        contasMap.set(origKey, {
          programaTrabalho: m.programaOrigem,
          elemento: m.elementoOrigem,
          fonte: String(m.fonteOrigem),
          entradas: 0,
          saidas: 0,
          situacao: "ABERTA",
          ultimaEntrada: "",
          ultimaSaida: "",
          podeReceberCredito: "SIM",
          podeFornecerCredito: "SIM",
        });
      }

      if (!contasMap.has(destKey)) {
        contasMap.set(destKey, {
          programaTrabalho: m.programaDestino,
          elemento: m.elementoDestino,
          fonte: String(m.fonteDestino),
          entradas: 0,
          saidas: 0,
          situacao: "ABERTA",
          ultimaEntrada: "",
          ultimaSaida: "",
          podeReceberCredito: "SIM",
          podeFornecerCredito: "SIM",
        });
      }

      const orig = contasMap.get(origKey)!;
      orig.saidas += 1;
      if (!orig.ultimaSaida || m.dataCredito > orig.ultimaSaida) {
        orig.ultimaSaida = m.dataCredito;
      }

      const dest = contasMap.get(destKey)!;
      dest.entradas += 1;
      if (!dest.ultimaEntrada || m.dataCredito > dest.ultimaEntrada) {
        dest.ultimaEntrada = m.dataCredito;
      }
    }

    contasMap.forEach((conta) => {
      conta.podeReceberCredito = conta.saidas > 0 ? "NÃO" : "SIM";
      conta.podeFornecerCredito = "SIM";
    });

    this.contasCreditoSMS = Array.from(contasMap.values());
  }

  // -----------------------------------------------------------
  // 5. REGISTRO DE ABASTECIMENTO (FROTAS)
  // -----------------------------------------------------------
  public registrarAbastecimento(dados: {
    veiculoId: string;
    motoristaId: string;
    contratoCombustivelId: string;
    quilometragem: number;
    litros: number;
    tipoCombustivel: string;
    cupomFiscal: string;
    postoConveniado: string;
  }): { success: boolean; message: string } {
    const veiculo = this.veiculos.find((v) => v.id === dados.veiculoId);
    if (!veiculo) return { success: false, message: "Veículo não encontrado." };

    const contrato = this.contratos.find((c) => c.id === dados.contratoCombustivelId);
    if (!contrato) return { success: false, message: "Contrato de combustível não encontrado." };

    const itemComb = contrato.itens?.find((i) =>
      i.descricao.toLowerCase().includes(dados.tipoCombustivel.toLowerCase())
    ) || contrato.itens?.[0];

    const valorUnitario = itemComb ? itemComb.valorUnitario : 6.0;
    const valorTotal = dados.litros * valorUnitario;

    if (valorTotal > contrato.saldoFinanceiroAtual) {
      return { success: false, message: "Saldo do contrato de combustível insuficiente para este abastecimento." };
    }

    // Dedução de saldo do contrato
    contrato.saldoFinanceiroAtual -= valorTotal;
    if (itemComb) {
      itemComb.quantidadeDisponivel = Math.max(0, itemComb.quantidadeDisponivel - dados.litros);
      itemComb.saldoItem = Math.max(0, itemComb.saldoItem - valorTotal);
    }

    // Atualização da quilometragem do veículo
    if (dados.quilometragem > veiculo.quilometragemAtual) {
      veiculo.quilometragemAtual = dados.quilometragem;
    }

    const motorista = this.motoristas.find((m) => m.id === dados.motoristaId);

    const novoAbastecimento: Abastecimento = {
      id: `abast-${Date.now()}`,
      veiculoId: dados.veiculoId,
      veiculoPlaca: veiculo.placa,
      motoristaId: dados.motoristaId,
      motoristaNome: motorista?.nome,
      contratoCombustivelId: dados.contratoCombustivelId,
      dataHora: new Date().toISOString(),
      quilometragem: dados.quilometragem,
      litros: dados.litros,
      tipoCombustivel: dados.tipoCombustivel,
      valorTotal,
      cupomFiscal: dados.cupomFiscal,
      postoConveniado: dados.postoConveniado,
    };

    this.abastecimentos.unshift(novoAbastecimento);

    return {
      success: true,
      message: `Abastecimento de ${dados.litros}L de ${dados.tipoCombustivel} registrado com sucesso para o veículo ${veiculo.placa}.`,
    };
  }

  // -----------------------------------------------------------
  // 6. JUDICIALIZAÇÃO: NOVA DEMANDA COM VÍNCULO A CONTRATOS
  // -----------------------------------------------------------
  public registrarDemandaJudicial(dados: {
    numeroProcessoJudicial: string;
    varaJuizo: string;
    poloAtivo: string;
    tipoDemanda: "MEDICAMENTO" | "PROCEDIMENTO_CIRURGIA" | "LEITO_UTI" | "INSUMO";
    prazoCumprimento: string;
    valorEstimado: number;
    prioridade: string;
    relatoCaso: string;
    contratoId?: string;
  }): { success: boolean; message: string; demanda?: DemandaJudicial } {
    const demandaId = `jud-${Date.now()}`;
    const vinculos: VinculoExecucao[] = [];

    if (dados.contratoId) {
      const ct = this.contratos.find((c) => c.id === dados.contratoId);
      if (ct) {
        vinculos.push({
          id: `vinc-${Date.now()}`,
          demandaId,
          contratoId: ct.id,
          contratoNumero: ct.numeroContrato,
          fornecedorId: ct.fornecedorId,
          fornecedorNome: this.fornecedores.find((f) => f.id === ct.fornecedorId)?.nomeFantasia,
          dataVinculacao: new Date().toISOString(),
          valorEmpenhadoJudicial: dados.valorEstimado,
          statusCumprimento: "Contrato acionado para fornecimento célere",
        });
      }
    }

    const novaDemanda: DemandaJudicial = {
      id: demandaId,
      numeroProcessoJudicial: dados.numeroProcessoJudicial,
      varaJuizo: dados.varaJuizo,
      poloAtivo: dados.poloAtivo,
      tipoDemanda: dados.tipoDemanda,
      dataIntimacao: new Date().toISOString(),
      prazoCumprimento: dados.prazoCumprimento,
      status: "EM_ANALISE",
      prioridade: dados.prioridade,
      valorEstimado: dados.valorEstimado,
      relatoCaso: dados.relatoCaso,
      vinculosExecucao: vinculos,
    };

    this.demandasJudiciais.unshift(novaDemanda);

    return {
      success: true,
      message: `Demanda judicial nº ${dados.numeroProcessoJudicial} cadastrada no painel com contagem regressiva ativada!`,
      demanda: novaDemanda,
    };
  }

  // -----------------------------------------------------------
  // 7. MOTOR DE PESQUISA GLOBAL 360º (CENTRAL INTELLIGENCE)
  // -----------------------------------------------------------
  public busca360(termo: string) {
    if (!termo || termo.trim().length === 0) return null;
    const norm = (s: string) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const clean = norm(termo);
    const getRoot = (s: string) => {
      if (s.startsWith("combustiv")) return "combustiv";
      if (s.startsWith("ambulan")) return "ambulan";
      if (s.startsWith("medicam")) return "medicam";
      if (s.startsWith("oxigen")) return "oxigen";
      if (s.startsWith("cooperat")) return "cooperat";
      if (s.startsWith("locac")) return "locac";
      if (s.startsWith("credit")) return "credit";
      if (s.startsWith("adicion")) return "adicion";
      if (s.startsWith("transpos")) return "transpos";
      if (s.startsWith("anulac")) return "anulac";
      if (s.startsWith("suplemen")) return "suplemen";
      if (s.startsWith("remanej")) return "remanej";
      if (s.startsWith("orcamen")) return "orcamen";
      return s.length > 5 ? s.slice(0, 5) : s;
    };

    const cleanRoot = getRoot(clean);
    const matches = (target: string | undefined | null) => {
      if (!target) return false;
      const tNorm = norm(target);
      return tNorm.includes(clean) || (cleanRoot.length >= 4 && tNorm.includes(cleanRoot));
    };

    // 1. Processos correspondentes
    const processosEncontrados = this.processos.filter(
      (p) =>
        matches(p.numeroProcesso) ||
        matches(p.numeroCapa) ||
        matches(p.objeto) ||
        matches(p.setorAtual)
    );

    // 2. Contratos correspondentes (ou vinculados aos processos encontrados)
    const contratosEncontrados = this.contratos.filter(
      (c) =>
        matches(c.numeroContrato) ||
        matches(c.objeto) ||
        c.itens?.some((i) => matches(i.descricao)) ||
        processosEncontrados.some((p) => p.id === c.processoOrigemId)
    );

    // 3. Atas correspondentes
    const atasEncontradas = this.atas.filter(
      (a) =>
        matches(a.numeroAta) ||
        matches(a.objeto) ||
        a.itens?.some((i) => matches(i.descricao))
    );

    // 4. Ordens de Fornecimento correspondentes ou pertencentes aos contratos
    const ordensEncontradas = this.ordens.filter(
      (o) =>
        matches(o.numeroOF) ||
        matches(o.observacoes) ||
        contratosEncontrados.some((c) => c.id === o.contratoId)
    );

    // 5. Pagamentos / Liquidações vinculadas
    const pagamentosEncontrados = this.pagamentos.filter(
      (pag) =>
        matches(pag.numeroNotaFiscal) ||
        matches(pag.numeroEmpenho) ||
        contratosEncontrados.some((c) => c.id === pag.contratoId) ||
        ordensEncontradas.some((o) => o.id === pag.ordemId)
    );

    // 6. Veículos vinculados ao termo (ex: ambulância, locado, placa)
    const veiculosEncontrados = this.veiculos.filter(
      (v) =>
        matches(v.placa) ||
        matches(v.modelo) ||
        matches(v.marca) ||
        (cleanRoot === "ambulan" && matches(v.modelo)) ||
        (cleanRoot === "combustiv" && (v.status === "PLANTAO_24_7" || v.status === "EM_ROTA")) ||
        contratosEncontrados.some((c) => c.id === v.contratoLocacaoId)
    );

    // 7. Motoristas e escalas vinculados
    const motoristasEncontrados = this.motoristas.filter(
      (m) =>
        matches(m.nome) ||
        matches(m.cnh) ||
        matches(m.matricula)
    );

    // 8. Demandas Judiciais vinculadas ao contrato ou com palavras-chave
    const demandasEncontradas = this.demandasJudiciais.filter(
      (d) =>
        matches(d.numeroProcessoJudicial) ||
        matches(d.poloAtivo) ||
        matches(d.relatoCaso) ||
        matches(d.tipoDemanda) ||
        contratosEncontrados.some((c) => d.vinculosExecucao?.some((v) => v.contratoId === c.id))
    );

    // 9. Ativos de TI vinculados
    const ativosTIEncontrados = this.ativosTI.filter(
      (ti) =>
        matches(ti.patrimonio) ||
        matches(ti.modelo) ||
        matches(ti.marca) ||
        matches(ti.setorAlocado)
    );

    // 10. Fornecedores
    const fornecedoresEncontrados = this.fornecedores.filter(
      (f) =>
        matches(f.nomeFantasia) ||
        matches(f.razaoSocial) ||
        f.cnpj.includes(clean)
    );

    // 11. Créditos Adicionais da Planilha Oficial SMS (Aba CONTROLE)
    const isTermoGenericoCredito =
      clean.includes("credit") ||
      clean.includes("adicion") ||
      clean.includes("transpos") ||
      clean.includes("anulac") ||
      clean.includes("suplemen") ||
      clean.includes("remanej") ||
      clean === "sms";

    const creditosEncontrados = this.creditosSMS.filter((cr) => {
      if (
        isTermoGenericoCredito &&
        (clean === "credito" ||
          clean === "creditos" ||
          clean === "credito adicional" ||
          clean === "creditos adicionais" ||
          clean === "abertura de credito" ||
          clean === "aberturas de creditos")
      ) {
        return true;
      }
      return (
        matches(String(cr.numero)) ||
        matches(`crédito ${cr.numero}`) ||
        matches(`credito ${cr.numero}`) ||
        matches(`#${cr.numero}`) ||
        matches(cr.tipoCredito) ||
        matches(cr.solicitante) ||
        matches(String(cr.programaOrigem)) ||
        matches(`pt ${cr.programaOrigem}`) ||
        matches(String(cr.programaDestino)) ||
        matches(`pt ${cr.programaDestino}`) ||
        matches(cr.elementoOrigem) ||
        matches(cr.elementoDestino) ||
        matches(String(cr.fonteOrigem)) ||
        matches(String(cr.fonteDestino)) ||
        matches(cr.status) ||
        matches(cr.observacoes)
      );
    });

    // 12. Contas Orçamentárias da Saúde (Aba CONTAS)
    const isTermoConta =
      clean.includes("conta") ||
      clean.includes("dotacao") ||
      clean.includes("programa de trabalho") ||
      clean.includes("elemento de despesa");

    const contasEncontradas = this.contasCreditoSMS.filter((cta) => {
      if (
        isTermoConta &&
        (clean === "conta" ||
          clean === "contas" ||
          clean === "contas orcamentarias" ||
          clean === "dotacoes")
      ) {
        return true;
      }
      return (
        matches(String(cta.programaTrabalho)) ||
        matches(`pt ${cta.programaTrabalho}`) ||
        matches(cta.elemento) ||
        matches(String(cta.fonte)) ||
        matches(cta.situacao) ||
        matches(cta.podeReceberCredito)
      );
    });

    // 13. Modelos Oficiais de Atos Administrativos (C:\SISTEMA LICITAÇÃO)
    const isTermoModelo =
      clean.includes("modelo") ||
      clean.includes("minuta") ||
      clean.includes("dfd") ||
      clean.includes("etp") ||
      clean.includes("termo de referencia") ||
      clean.includes("tr") ||
      clean.includes("portaria") ||
      clean.includes("parecer") ||
      clean.includes("edital") ||
      clean.includes("arp") ||
      clean.includes("dispensa") ||
      clean.includes("inexigibilidade");

    const modelosEncontrados = MODELOS_LICITACAO_CATALOG.filter((mod: ModeloDocumentoProcesso) => {
      return (
        matches(mod.titulo) ||
        matches(mod.tipoPeca) ||
        matches(mod.modalidade) ||
        matches(mod.artigoLei) ||
        matches(mod.categoriaPrincipal) ||
        (isTermoModelo && clean.length > 2 && mod.tipoPeca.toLowerCase().includes(clean))
      );
    });

    // 14. Demandas Prévias e Tramitação das Superintendências (SAS, SUVIG, SGTES, SURCAA ➔ SG)
    const demandasPreviasEncontradas = this.demandasPrevias.filter((dp: DemandaPreviaProcesso) => {
      return (
        matches(dp.numeroDemanda) ||
        matches(dp.objeto) ||
        matches(dp.superintendenciaOrigem) ||
        matches(dp.superintendenciaNome) ||
        matches(dp.coordenacaoOrigem) ||
        matches(dp.responsavelNome) ||
        matches(dp.status) ||
        dp.itens.some((it: ItemDemandaPrevia) => matches(it.descricao) || matches(it.especificacaoTecnica || ""))
      );
    });

    return {
      termo,
      totalResultados:
        processosEncontrados.length +
        contratosEncontrados.length +
        atasEncontradas.length +
        ordensEncontradas.length +
        pagamentosEncontrados.length +
        veiculosEncontrados.length +
        motoristasEncontrados.length +
        demandasEncontradas.length +
        ativosTIEncontrados.length +
        fornecedoresEncontrados.length +
        creditosEncontrados.length +
        contasEncontradas.length +
        modelosEncontrados.length +
        demandasPreviasEncontradas.length,
      processos: processosEncontrados,
      contratos: contratosEncontrados,
      atas: atasEncontradas,
      ordens: ordensEncontradas,
      pagamentos: pagamentosEncontrados,
      veiculos: veiculosEncontrados,
      motoristas: motoristasEncontrados,
      demandas: demandasEncontradas,
      ativosTI: ativosTIEncontrados,
      fornecedores: fornecedoresEncontrados,
      creditos: creditosEncontrados,
      contas: contasEncontradas,
      modelosLicitacao: modelosEncontrados,
      demandasPrevias: demandasPreviasEncontradas,
    };
  }

  // -----------------------------------------------------------
  // 8. ALERTAS PREVENTIVOS DE VIGÊNCIA E COMPLIANCE
  // -----------------------------------------------------------
  public obterAlertasPreventivos() {
    const alertasContratos: {
      contrato: Contrato;
      dias: number;
      faixa: "critico" | "60dias" | "90dias" | "120dias";
      percentualSaldo: number;
    }[] = [];

    for (const ct of this.contratos) {
      const dias = getDaysRemaining(ct.vigenciaFim);
      const percentualSaldo = Math.round((ct.saldoFinanceiroAtual / ct.valorGlobal) * 100);

      if (dias <= 30) {
        alertasContratos.push({ contrato: ct, dias, faixa: "critico", percentualSaldo });
      } else if (dias <= 60) {
        alertasContratos.push({ contrato: ct, dias, faixa: "60dias", percentualSaldo });
      } else if (dias <= 90) {
        alertasContratos.push({ contrato: ct, dias, faixa: "90dias", percentualSaldo });
      } else if (dias <= 120) {
        alertasContratos.push({ contrato: ct, dias, faixa: "120dias", percentualSaldo });
      }
    }

    const alertasCNH: { motorista: Motorista; dias: number }[] = [];
    for (const mot of this.motoristas) {
      const dias = getDaysRemaining(mot.validadeCnh);
      if (dias <= 30) {
        alertasCNH.push({ motorista: mot, dias });
      }
    }

    const alertasJudiciais: { demanda: DemandaJudicial; dias: number; horas: number }[] = [];
    for (const dem of this.demandasJudiciais) {
      if (dem.status !== "CUMPRIDA") {
        const dias = getDaysRemaining(dem.prazoCumprimento);
        const agora = new Date().getTime();
        const prazo = new Date(dem.prazoCumprimento).getTime();
        const horas = Math.round((prazo - agora) / (1000 * 60 * 60));
        if (dias <= 3 || horas <= 48) {
          alertasJudiciais.push({ demanda: dem, dias, horas });
        }
      }
    }

    return {
      totalAlertas: alertasContratos.length + alertasCNH.length + alertasJudiciais.length,
      alertasContratos,
      alertasCNH,
      alertasJudiciais,
    };
  }

  // -------------------------------------------------------------
  // GESTÃO DE DOCUMENTOS OFICIAIS ELABORADOS NA PLATAFORMA
  // -------------------------------------------------------------

  public salvarDocumentoElaborado(doc: DocumentoElaborado): void {
    const idx = this.documentosElaborados.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      this.documentosElaborados[idx] = { ...doc, updatedAt: new Date().toISOString() };
    } else {
      this.documentosElaborados.unshift({ ...doc, updatedAt: new Date().toISOString() });
    }
  }

  public obterDocumentosDoProcesso(identificadorProcesso: string): DocumentoElaborado[] {
    const limpo = identificadorProcesso.toLowerCase().trim();
    return this.documentosElaborados.filter(
      (d) =>
        (d.processoId && d.processoId.toLowerCase() === limpo) ||
        (d.numeroProcesso && d.numeroProcesso.toLowerCase() === limpo)
    );
  }

  public obterDocumentoElaboradoPorModelo(
    identificadorProcesso: string,
    modeloId: string
  ): DocumentoElaborado | undefined {
    const limpo = identificadorProcesso.toLowerCase().trim();
    return this.documentosElaborados.find(
      (d) =>
        d.modeloId === modeloId &&
        ((d.processoId && d.processoId.toLowerCase() === limpo) ||
          (d.numeroProcesso && d.numeroProcesso.toLowerCase() === limpo))
    );
  }

  public obterDocumentoElaboradoPorId(id: string): DocumentoElaborado | undefined {
    return this.documentosElaborados.find((d) => d.id === id);
  }

  public duplicarDocumentoElaborado(id: string): DocumentoElaborado | undefined {
    const original = this.documentosElaborados.find((d) => d.id === id);
    if (!original) return undefined;
    const copia: DocumentoElaborado = {
      ...JSON.parse(JSON.stringify(original)),
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      titulo: `${original.titulo} (Nova Cópia)`,
      status: "RASCUNHO",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.documentosElaborados.unshift(copia);
    return copia;
  }

  public excluirDocumentoElaborado(id: string): boolean {
    const idx = this.documentosElaborados.findIndex((d) => d.id === id);
    if (idx >= 0) {
      this.documentosElaborados.splice(idx, 1);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // GESTÃO DE CADASTROS E AUTORIZAÇÕES DA SG (COM PERSISTÊNCIA DUAL)
  // -------------------------------------------------------------
  public carregarSolicitacoesStorage(): SolicitacaoCadastro[] {
    if (typeof window === "undefined") {
      return this.solicitacoesCadastro;
    }
    try {
      const data = localStorage.getItem("supergestao_solicitacoes_cadastro");
      if (data) {
        const parsed = JSON.parse(data) as SolicitacaoCadastro[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapa = new Map<string, SolicitacaoCadastro>();
          // Itens salvos primeiro
          parsed.forEach((item) => mapa.set(item.id, item));
          // Mescla com iniciais caso algum falte
          this.solicitacoesCadastro.forEach((item) => {
            if (!mapa.has(item.id)) {
              mapa.set(item.id, item);
            }
          });
          this.solicitacoesCadastro = Array.from(mapa.values());
        }
      } else {
        this.salvarSolicitacoesStorage();
      }
    } catch {
      // fallback gracioso em ambientes com restrição de cookies/storage
    }
    return this.solicitacoesCadastro;
  }

  public salvarSolicitacoesStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "supergestao_solicitacoes_cadastro",
        JSON.stringify(this.solicitacoesCadastro)
      );
      window.dispatchEvent(new CustomEvent("supergestao_cadastro_atualizado"));
    } catch {
      // fallback gracioso
    }
  }

  public obterSolicitacoesCadastro(): SolicitacaoCadastro[] {
    this.carregarSolicitacoesStorage();
    return [...this.solicitacoesCadastro];
  }

  public obterQtdCadastrosPendentes(): number {
    this.carregarSolicitacoesStorage();
    return this.solicitacoesCadastro.filter((c) => c.status === "PENDENTE_SG").length;
  }

  public adicionarSolicitacaoCadastro(dados: {
    email: string;
    nomeCompleto: string;
    dataNascimento: string;
    cpf: string;
    whatsapp?: string;
    matricula: string;
    superintendenciaLotacao: string;
    cargo: string;
    senha?: string;
  }): SolicitacaoCadastro {
    this.carregarSolicitacoesStorage();
    const nova: SolicitacaoCadastro = {
      id: `cad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: dados.email.trim(),
      nomeCompleto: dados.nomeCompleto.trim(),
      dataNascimento: dados.dataNascimento,
      cpf: dados.cpf.trim(),
      whatsapp: (dados.whatsapp || "").trim(),
      matricula: dados.matricula.trim(),
      superintendenciaLotacao: dados.superintendenciaLotacao,
      cargo: dados.cargo.trim(),
      senha: dados.senha ? dados.senha.trim() : undefined,
      dataSolicitacao: new Date().toISOString(),
      status: "PENDENTE_SG",
    };
    this.solicitacoesCadastro.unshift(nova);
    this.salvarSolicitacoesStorage();
    return nova;
  }

  public autorizarCadastro(
    id: string,
    permissoes: PermissaoModulo[],
    autorizadorNome: string,
    observacoesSG?: string
  ): boolean {
    this.carregarSolicitacoesStorage();
    const cad = this.solicitacoesCadastro.find((c) => c.id === id);
    if (!cad) return false;
    cad.status = "AUTORIZADO";
    cad.permissoes = permissoes;
    cad.autorizadoPor = autorizadorNome;
    cad.dataAutorizacao = new Date().toISOString();
    if (observacoesSG) cad.observacoesSG = observacoesSG;

    // Converte automaticamente para usuário ativo do sistema
    // Servidores que não são da SG recebem perfil SERVIDOR_SETORIAL restrito à sua superintendência
    const isSG = cad.superintendenciaLotacao === "SG" || cad.cargo.toLowerCase().includes("gestão");
    this.adicionarUsuario({
      id: `usr-${cad.id}`,
      nome: cad.nomeCompleto,
      email: cad.email,
      cpf: cad.cpf,
      matricula: cad.matricula,
      cargo: cad.cargo,
      setor: cad.superintendenciaLotacao, // e.g. "SAS"
      perfil: isSG ? "ADMINISTRADOR" : "SERVIDOR_SETORIAL",
      ativo: true,
      whatsapp: cad.whatsapp,
      permissoes: cad.permissoes,
      senha: cad.senha,
    });

    this.salvarSolicitacoesStorage();
    return true;
  }

  public rejeitarCadastro(
    id: string,
    motivoRejeicao: string,
    autorizadorNome: string
  ): boolean {
    this.carregarSolicitacoesStorage();
    const cad = this.solicitacoesCadastro.find((c) => c.id === id);
    if (!cad) return false;
    cad.status = "REJEITADO";
    cad.motivoRejeicao = motivoRejeicao;
    cad.autorizadoPor = autorizadorNome;
    cad.dataAutorizacao = new Date().toISOString();
    this.salvarSolicitacoesStorage();
    return true;
  }

  public excluirSolicitacaoCadastro(id: string): boolean {
    this.carregarSolicitacoesStorage();
    const idx = this.solicitacoesCadastro.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.solicitacoesCadastro.splice(idx, 1);
      this.salvarSolicitacoesStorage();
      return true;
    }
    return false;
  }

  public obterUsuarios(): Usuario[] {
    return [...this.usuarios];
  }

  public obterUsuarioPorEmail(email: string): Usuario | undefined {
    const e = email.trim().toLowerCase();
    return this.usuarios.find((u) => u.email.toLowerCase() === e);
  }

  public adicionarUsuario(usuario: Usuario): void {
    const existe = this.usuarios.find(
      (u) => u.email.toLowerCase() === usuario.email.toLowerCase()
    );
    if (!existe) {
      this.usuarios.push(usuario);
    }
  }

  public autenticarUsuario(
    emailOuMatricula: string,
    senhaDigitada: string
  ): { success: boolean; usuario?: Usuario; message: string } {
    const termo = emailOuMatricula.trim().toLowerCase();

    // Suporte prioritário à Coordenadora Geral de Gestão (will2026@gmail.com / 123456)
    this.carregarSolicitacoesStorage();

    // 1. Suporte prioritário à Coordenadora Geral de Gestão (will2026@gmail.com / 123456)
    if (termo === "will2026@gmail.com" || termo === "sg-2026-001") {
      if (senhaDigitada === "123456") {
        const coord = this.obterUsuarioPorEmail("will2026@gmail.com") || {
          id: "usr-coord-geral",
          nome: "Dra. Willianne Soares",
          email: "will2026@gmail.com",
          senha: "123456",
          cpf: "098.765.432-11",
          matricula: "SG-2026-001",
          cargo: "Coordenadora Geral de Gestão",
          setor: "SG",
          perfil: "ADMINISTRADOR",
          ativo: true,
          whatsapp: "(82) 99876-5432",
        };
        return {
          success: true,
          usuario: coord,
          message: "Autenticação confirmada! Bem-vinda, Coordenadora Geral de Gestão.",
        };
      }
      return {
        success: false,
        message: "Senha incorreta para a Coordenadora Geral. A senha oficial é 123456.",
      };
    }

    // 2. Busca na base de Solicitações de Cadastro (onde servidores se cadastram)
    const sol = this.solicitacoesCadastro.find(
      (s) =>
        s.email.toLowerCase() === termo ||
        (s.matricula && s.matricula.toLowerCase() === termo) ||
        (s.nomeCompleto && s.nomeCompleto.toLowerCase().includes(termo))
    );

    if (sol) {
      if (sol.status === "PENDENTE_SG") {
        return {
          success: false,
          message:
            "Acesso Pendente: Seu cadastro ainda não foi autorizado pela Coordenadora Geral de Gestão (SG). Por favor, aguarde a liberação dos seus módulos de acesso.",
        };
      }

      if (sol.status === "REJEITADO") {
        return {
          success: false,
          message: `Acesso Recusado: Sua solicitação de cadastro foi recusada pela SG. Motivo: ${sol.motivoRejeicao || "Inconformidade funcional ou de lotação"}.`,
        };
      }

      // Se autorizado: valida senha se foi cadastrada
      if (sol.senha && sol.senha.trim() !== "") {
        if (senhaDigitada !== sol.senha) {
          return {
            success: false,
            message: "Senha incorreta. Por favor, informe a senha criada no momento do cadastro.",
          };
        }
      }

      const isSG = sol.superintendenciaLotacao === "SG" || sol.cargo.toLowerCase().includes("gestão");
      const usuarioAuth: Usuario = {
        id: `usr-${sol.id}`,
        nome: sol.nomeCompleto,
        email: sol.email,
        cpf: sol.cpf,
        matricula: sol.matricula,
        cargo: sol.cargo,
        setor: sol.superintendenciaLotacao, // e.g. "SAS"
        perfil: isSG ? "ADMINISTRADOR" : "SERVIDOR_SETORIAL",
        ativo: true,
        whatsapp: sol.whatsapp,
        permissoes: sol.permissoes,
        senha: sol.senha,
      };

      this.adicionarUsuario(usuarioAuth);
      return {
        success: true,
        usuario: usuarioAuth,
        message: `Autenticação realizada com sucesso como ${sol.nomeCompleto} (${sol.superintendenciaLotacao})!`,
      };
    }

    // 3. Busca nos usuários pré-existentes
    const usuario = this.usuarios.find(
      (u) =>
        u.email.toLowerCase() === termo ||
        (u.matricula && u.matricula.toLowerCase() === termo)
    );

    if (usuario) {
      if (usuario.senha && senhaDigitada !== usuario.senha) {
        return {
          success: false,
          message: "Senha incorreta para este usuário.",
        };
      }
      return {
        success: true,
        usuario,
        message: "Autenticação realizada com sucesso.",
      };
    }

    return {
      success: false,
      message: "Usuário não localizado no sistema. Cadastre-se na aba 'Cadastrar Servidor' para solicitar autorização à SG.",
    };
  }
}

export const dataStore = SuperGestaoDataStore.getInstance();
