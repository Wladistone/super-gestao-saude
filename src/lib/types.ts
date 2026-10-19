export type PerfilUsuario =
  | "ADMINISTRADOR"
  | "GESTOR_CONTRATOS"
  | "FISCAL_CONTRATO"
  | "COORDENACAO_FROTAS"
  | "TI"
  | "ORCAMENTO_FINANCAS"
  | "JUDICIALIZACAO"
  | "SERVIDOR_SETORIAL";

export type StatusProcesso =
  | "FASE_PREPARATORIA"
  | "JURIDICO"
  | "LICITACAO"
  | "CONTRATADO"
  | "ENCERRADO";

export type StatusPCA =
  | "PLANEJADO"
  | "EM_LICITACAO"
  | "CONTRATADO"
  | "CANCELADO";

export type TipoCreditoAdicional = "SUPLEMENTAR" | "ESPECIAL" | "EXTRAORDINARIO";
export type OrigemCredito = "ANULACAO" | "EXCESSO_ARRECADACAO" | "SUPERAVIT";
export type TipoAditivo = "PRAZO" | "VALOR" | "SUPRESSAO" | "REAJUSTE";
export type StatusOF = "EMITIDA" | "ENTREGUE" | "LIQUIDADA" | "CANCELADA";
export type TipoFavorecido = "CONTRATADA" | "PRESTADOR_SUS" | "FOLHA";
export type StatusVeiculo = "DISPONIVEL" | "EM_ROTA" | "MANUTENCAO" | "PLANTAO_24_7";
export type TipoVeiculo = "PROPRIO" | "LOCADO" | "COOPERATIVA";
export type EscalaMotorista = "PLANTAO" | "DIURNO" | "NOTURNO" | "FOLGA";
export type TipoAtivoTI = "DESKTOP" | "NOTEBOOK" | "IMPRESSORA" | "SWITCH" | "SERVIDOR";
export type StatusAtivoTI = "EM_USO" | "MANUTENCAO" | "RESERVA_TECNICA" | "DESCARTE";
export type TipoDemandaJudicial = "MEDICAMENTO" | "PROCEDIMENTO_CIRURGIA" | "LEITO_UTI" | "INSUMO";
export type StatusDemandaJudicial = "EM_ANALISE" | "CUMPRIDA" | "RECURSO" | "BLOQUEIO_JUDICIAL";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  cargo: string;
  setor: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  whatsapp?: string;
  senha?: string;
  matricula?: string;
  permissoes?: PermissaoModulo[];
}

// =====================================================================
// CONTROLE DE CADASTRO E AUTORIZAÇÃO DE SERVIDORES PELA SG
// =====================================================================
export type NivelAcessoModulo =
  | "SEM_ACESSO"
  | "VISUALIZACAO"
  | "EDICAO"
  | "VISUALIZACAO_E_EDICAO";

export interface PermissaoModulo {
  moduloId: string;
  moduloNome: string;
  visualizar: boolean;
  editar: boolean;
  nivel?: NivelAcessoModulo;
}

export type StatusSolicitacaoCadastro =
  | "PENDENTE_SG"
  | "AUTORIZADO"
  | "REJEITADO";

export interface SolicitacaoCadastro {
  id: string;
  email: string;
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  whatsapp: string;
  matricula: string;
  superintendenciaLotacao: string;
  cargo: string;
  senha?: string;
  dataSolicitacao: string;
  status: StatusSolicitacaoCadastro;
  permissoes?: PermissaoModulo[];
  autorizadoPor?: string;
  dataAutorizacao?: string;
  observacoesSG?: string;
  motivoRejeicao?: string;
}

export interface ModuloSistemaDef {
  id: string;
  nome: string;
  descricao: string;
  iconeNome: string;
  badge?: string;
}

export const MODULOS_SISTEMA_DISPONIVEIS: ModuloSistemaDef[] = [
  {
    id: "cadastro",
    nome: "CADASTRO & Controle de Acessos",
    descricao: "Módulo da SG para autorização de novos servidores e concessão de privilégios de visualização/edição.",
    iconeNome: "UserCheck",
    badge: "Exclusivo SG",
  },
  {
    id: "tramitacao",
    nome: "Tramitação & Governança",
    descricao: "Caixa postal oficial de despachos e tramitação entre superintendências e Superintendência de Gestão.",
    iconeNome: "Inbox",
    badge: "Caixa Postal",
  },
  {
    id: "visao_geral",
    nome: "Visão Geral 360º",
    descricao: "Dashboard consolidado com status em tempo real de toda a rede de saúde e alertas preventivos.",
    iconeNome: "LayoutDashboard",
  },
  {
    id: "solicitacoes",
    nome: "Solicitações de Demandas Prévias",
    descricao: "Abertura, justificativas e acompanhamento de demandas setoriais para contratações.",
    iconeNome: "ClipboardList",
    badge: "Demandas",
  },
  {
    id: "processos",
    nome: "Processos & Licitações",
    descricao: "PCA 2025, fase preparatória, catálogo de modelos, pareceres técnicos e instrução processual.",
    iconeNome: "FileText",
    badge: "PCA 2025",
  },
  {
    id: "contratos",
    nome: "Contratos & Atas de Registro de Preços",
    descricao: "Gestão reativa de saldos contratuais, emissão de OF/OS, pareceres de aceitação e liquidação.",
    iconeNome: "FileCheck2",
    badge: "Saldos Reativos",
  },
  {
    id: "frotas",
    nome: "Frotas & Transportes Sanitários",
    descricao: "Ambulâncias, TFD (Tratamento Fora do Domicílio), cotas de combustíveis e rastreamento.",
    iconeNome: "Ambulance",
    badge: "TFD & Frota",
  },
  {
    id: "orcamento",
    nome: "Orçamento & Créditos Adicionais",
    descricao: "Dotações orçamentárias, suplementações, anulações e saldo por programa de trabalho.",
    iconeNome: "Coins",
    badge: "Dotações",
  },
  {
    id: "judicializacao",
    nome: "Judicialização da Saúde",
    descricao: "Demandas judiciais, liminares, fornecimento de medicamentos e bloqueios sob prazos fatais.",
    iconeNome: "Scale",
    badge: "Prazos Fatais",
  },
  {
    id: "ti",
    nome: "Parque TI & Licenças",
    descricao: "Inventário de computadores, impressoras, ativos de rede e licenças de software da SMS.",
    iconeNome: "Server",
  },
];

export interface ItemPCA {
  id: string;
  anoExercicio: number;
  codigoItem: string;
  descricao: string;
  categoria: string;
  valorEstimado: number;
  status: StatusPCA;
  dataPrevisaoContratacao: string;
}

export interface ProcessoAdministrativo {
  id: string;
  numeroProcesso: string;
  numeroCapa: string;
  objeto: string;
  modalidade?: string;
  setorAtual: string;
  status: StatusProcesso;
  itemPcaId?: string;
  itemPca?: ItemPCA;
  valorEstimado?: number;
  demandaPreviaId?: string;
  superintendenciaOrigem?: SuperintendenciaSigla;
  itensProcesso?: ItemDemandaPrevia[];
  statusDescritivo?: string;
  dataEntradaSetor?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export type SuperintendenciaSigla = "SAS" | "SUVIG" | "SGTES" | "SURCAA" | "SG";

export type StatusDemandaPrevia =
  | "AGUARDANDO_ENQUADRAMENTO_SG"
  | "EM_ANALISE_SG"
  | "DILIGENCIA_SOLICITADA"
  | "ENQUADRADA_E_AUTORIZADA"
  | "INDEFERIDA_SG";

export interface ItemDemandaPrevia {
  id: string;
  numeroItem: number;
  descricao: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitarioEstimado?: number;
  valorTotalEstimado?: number;
  especificacaoTecnica?: string;
}

export interface DemandaPreviaProcesso {
  id: string;
  numeroDemanda: string;
  superintendenciaOrigem: SuperintendenciaSigla;
  superintendenciaNome: string;
  coordenacaoOrigem: string;
  responsavelNome: string;
  responsavelEmail?: string;
  responsavelWhatsapp?: string;
  dataSolicitacao: string;
  objeto: string;
  justificativaNecessidade: string;
  publicoAlvoOuDestino: string;
  itens: ItemDemandaPrevia[];
  valorTotalEstimado: number;
  status: StatusDemandaPrevia;
  enquadramentoSG?: {
    dataDespacho: string;
    analistaSG: string;
    coordenadoraNome?: string;
    modalidadeDefinidaId: string;
    modalidadeDefinidaNome: string;
    artigoLeiBase: string;
    justificativaEnquadramento: string;
    observacoesSG?: string;
    processoAdministrativoId?: string;
    numeroProcessoGerado?: string;
    // Direcionamento simultâneo para servidor da SG conduzir o processo
    direcionamentoSG?: {
      servidorSGId: string;
      servidorSGNome: string;
      servidorSGCargo?: string;
      servidorSGEmail?: string;
      dataHoraDirecionamento: string;
      coordenadoraNome: string;
      dataHoraVisualizacao?: string;
      visualizado: boolean;
    };
    // Notificações automáticas enviadas ao servidor originador da demanda
    notificacoesOriginador?: {
      emailEnviado: boolean;
      dataHoraEmail: string;
      destinatarioEmail: string;
      whatsappEnviado?: boolean;
      dataHoraWhatsapp?: string;
      destinatarioWhatsapp?: string;
      mensagemResumo: string;
      artefatosDisponibilizados: string[];
    };
  };
  historicoTramitacao: {
    id: string;
    data: string;
    origem: string;
    destino: string;
    acao: string;
    motivoOuDespacho: string;
    usuario: string;
  }[];
}

export interface DotacaoOrcamentaria {
  id: string;
  programaDeTrabalho: string;
  elementoDespesa: string;
  fonteRecurso: string;
  orcamentoInicial: number;
  saldoDisponivel: number;
  valorReservado: number;
  valorEmpenhado: number;
}

export interface CreditoAdicional {
  id: string;
  tipo: TipoCreditoAdicional;
  decretoNumero: string;
  valor: number;
  origem: OrigemCredito;
  dataAprovacao: string;
  processoOrigemId?: string;
  dotacaoDestinoId: string;
  dotacaoDestino?: DotacaoOrcamentaria;
}

export interface RegistroControleCredito {
  id: number;
  numero: number;
  dataCredito: string;
  dataCreditoIso: string;
  dataSerial?: number | null;
  tipoCredito: string;
  valor: number;
  solicitante: string;
  programaOrigem: number | string;
  elementoOrigem: string;
  fonteOrigem: string;
  programaDestino: number | string;
  elementoDestino: string;
  fonteDestino: string;
  status: "OK" | "ERRO" | string;
  observacoes: string;
}

export interface ContaOrcamentariaCredito {
  programaTrabalho: number | string;
  elemento: string;
  fonte: string;
  entradas: number;
  saidas: number;
  situacao: string;
  ultimaEntrada: string;
  ultimaSaida: string;
  podeReceberCredito: "SIM" | "NÃO" | string;
  podeFornecerCredito: "SIM" | "NÃO" | string;
}

export interface CadastrosReferencia {
  programasTrabalho: (number | string)[];
  elementos: string[];
  fontes: string[];
  solicitantes: string[];
}

export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  contato: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  uf: string;
  ativo: boolean;
}

export interface DotacaoItemContrato {
  id?: string;
  programaDeTrabalho: string;
  programaNome?: string;
  elementoDespesa: string;
  fonteRecurso: string;
  saldoDotacaoItem: number;
  quantidadeDisponivelDotacao?: number;
  percentual?: number;
}

export interface ItemContrato {
  id: string;
  contratoId?: string;
  ataId?: string;
  codigoItem: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeContratada: number;
  quantidadeDisponivel: number;
  valorUnitario: number;
  saldoItem: number;
  dotacoes?: DotacaoItemContrato[];
}

export interface TermoAditivo {
  id: string;
  contratoId: string;
  numeroTermo: string;
  tipo: TipoAditivo;
  valorAcrescido: number;
  novaVigenciaFim?: string;
  processoAditivoId?: string;
  justificativa: string;
  dataAssinatura: string;
}

export interface Contrato {
  id: string;
  numeroContrato: string;
  ataOrigemId?: string;
  processoOrigemId: string;
  fornecedorId: string;
  fornecedor?: Fornecedor;
  objeto: string;
  dataAssinatura: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  valorGlobal: number;
  saldoFinanceiroAtual: number;
  fiscalTitularId?: string;
  fiscalTitularNome?: string;
  fiscalSubstitutoId?: string;
  fiscalSubstitutoNome?: string;
  status: string;
  itens?: ItemContrato[];
  termosAditivos?: TermoAditivo[];
}

export interface AtaRegistroPrecos {
  id: string;
  numeroAta: string;
  processoOrigemId: string;
  fornecedorId: string;
  fornecedor?: Fornecedor;
  objeto: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  valorTotalRegistrado: number;
  saldoTotalDisponivel: number;
  status: string;
  itens?: ItemContrato[];
}

export interface ItensOF {
  id: string;
  ordemId: string;
  itemContratoId: string;
  descricao?: string;
  quantidadeSolicitada: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrdemFornecimentoServico {
  id: string;
  numeroOF: string;
  contratoId: string;
  contratoNumero?: string;
  fornecedorNome?: string;
  dataEmissao: string;
  prazoEntrega?: string;
  valorTotal: number;
  status: StatusOF;
  observacoes?: string;
  itens: ItensOF[];
}

export interface PagamentoLiquidacao {
  id: string;
  ordemId?: string;
  contratoId?: string;
  numeroNotaFiscal: string;
  numeroEmpenho: string;
  numeroLiquidacao: string;
  valorPago: number;
  dataPagamento: string;
  fonteRecursoId: string;
  fonteRecursoNome?: string;
  tipoFavorecido: TipoFavorecido;
  status: string;
  observacoes?: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  chassi: string;
  status: StatusVeiculo;
  tipo: TipoVeiculo;
  capacidade: string;
  quilometragemAtual: number;
  dataLicenciamento: string;
  contratoLocacaoId?: string;
}

export interface Motorista {
  id: string;
  nome: string;
  matricula: string;
  cnh: string;
  categoriaCnh: string;
  validadeCnh: string;
  escalaTrabalho: EscalaMotorista;
  status: string;
  telefone: string;
}

export interface Abastecimento {
  id: string;
  veiculoId: string;
  veiculoPlaca?: string;
  motoristaId: string;
  motoristaNome?: string;
  contratoCombustivelId: string;
  dataHora: string;
  quilometragem: number;
  litros: number;
  tipoCombustivel: string;
  valorTotal: number;
  cupomFiscal: string;
  postoConveniado: string;
}

export interface ManutencaoVeiculo {
  id: string;
  veiculoId: string;
  veiculoPlaca?: string;
  contratoManutencaoId: string;
  osNumero: string;
  dataEntrada: string;
  dataSaida?: string;
  servicosRealizados: string;
  valor: number;
  status: string;
}

export interface EscalaPlantao24x7 {
  id: string;
  veiculoId: string;
  veiculoPlaca?: string;
  veiculoModelo?: string;
  motoristaId: string;
  motoristaNome?: string;
  turno: string;
  dataInicio: string;
  dataFim: string;
  contatoEmergencia: string;
  statusProntidao: string;
}

export interface AtivoTI {
  id: string;
  patrimonio: string;
  tipo: TipoAtivoTI;
  marca: string;
  modelo: string;
  setorAlocado: string;
  responsavel: string;
  status: StatusAtivoTI;
  dataAquisicao: string;
}

export interface LicencaSoftware {
  id: string;
  software: string;
  fabricante: string;
  quantidade: number;
  quantidadeEmUso: number;
  vigenciaFim: string;
  chaveLicenca?: string;
  contratoId?: string;
}

export interface VinculoExecucao {
  id: string;
  demandaId: string;
  contratoId?: string;
  contratoNumero?: string;
  fornecedorId?: string;
  fornecedorNome?: string;
  ordemFornecimentoId?: string;
  ordemFornecimentoNumero?: string;
  dataVinculacao: string;
  valorEmpenhadoJudicial: number;
  statusCumprimento: string;
  observacoes?: string;
}

export interface DemandaJudicial {
  id: string;
  numeroProcessoJudicial: string;
  varaJuizo: string;
  poloAtivo: string;
  tipoDemanda: TipoDemandaJudicial;
  dataIntimacao: string;
  prazoCumprimento: string;
  status: StatusDemandaJudicial;
  prioridade: string;
  valorEstimado: number;
  relatoCaso: string;
  vinculosExecucao?: VinculoExecucao[];
}

// -------------------------------------------------------------
// MODELOS E ELABORAÇÃO DE DOCUMENTOS OFICIAIS NA PLATAFORMA
// -------------------------------------------------------------

export interface ItemDocumento {
  item: number;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario?: number;
  valorTotal?: number;
}

export interface SecaoDocumento {
  id: string;
  titulo: string;
  conteudo: string;
  obrigatoria?: boolean;
}

export interface DocumentoElaborado {
  id: string;
  modeloId: string;
  titulo: string;
  tipoPeca: string;
  modalidade: string;
  artigoLei: string;
  processoId?: string;
  numeroProcesso: string;
  numeroCapa?: string;
  demandaId?: string;
  dataDocumento: string;
  cidadeDataExtenso: string;
  orgaoRequisitante: string;
  servidorResponsavel: string;
  matriculaServidor: string;
  cargoServidor: string;
  responsavelTecnico?: string;
  matriculaTecnico?: string;
  objeto: string;
  justificativa: string;
  itens: ItemDocumento[];
  secoes: SecaoDocumento[];
  textoLivre?: string;
  status: "RASCUNHO" | "CONCLUIDO" | "ASSINADO";
  downloadUrlOriginal?: string;
  createdAt: string;
  updatedAt: string;
}
