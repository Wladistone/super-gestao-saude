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
  RegistroEmailEnviado,
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


// =============================================================
// PLATAFORMA LIMPA PARA USO REAL EM PRODUÇÃO
// Servidores, processos, trâmites e cadastros modelos purgados.
// Dados orçamentários e créditos adicionais preservados 100%.
// =============================================================

// Usuário Administrador Oficial para Gestão e Homologação de Novos Servidores
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
];

// Fila de solicitações de cadastro limpa para receber os cadastros reais dos servidores
const INITIAL_SOLICITACOES_CADASTRO: SolicitacaoCadastro[] = [];

// Fornecedores e Contratos oficiais (limpos para início oficial)
const INITIAL_FORNECEDORES: Fornecedor[] = [];
const INITIAL_PCA: ItemPCA[] = [];
const INITIAL_PROCESSOS: ProcessoAdministrativo[] = [];
const INITIAL_ATAS: AtaRegistroPrecos[] = [];
const INITIAL_CONTRATOS: Contrato[] = [];
const INITIAL_ORDENS: OrdemFornecimentoServico[] = [];
const INITIAL_PAGAMENTOS: PagamentoLiquidacao[] = [];
const INITIAL_VEICULOS: Veiculo[] = [];
const INITIAL_MOTORISTAS: Motorista[] = [];
const INITIAL_ESCALAS: EscalaPlantao24x7[] = [];
const INITIAL_ABASTECIMENTOS: Abastecimento[] = [];
const INITIAL_MANUTENCOES: ManutencaoVeiculo[] = [];
const INITIAL_ATIVOS_TI: AtivoTI[] = [];
const INITIAL_LICENCAS: LicencaSoftware[] = [];
const INITIAL_JUDICIAL: DemandaJudicial[] = [];
const INITIAL_DOCUMENTOS_ELABORADOS: DocumentoElaborado[] = [];

// -------------------------------------------------------------
// DADOS ORÇAMENTÁRIOS E CRÉDITOS ADICIONAIS PRESERVADOS 100%
// -------------------------------------------------------------
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

class SuperGestaoDataStore {
  private static instance: SuperGestaoDataStore;

  public usuarios: Usuario[] = [...INITIAL_USUARIOS];
  public solicitacoesCadastro: SolicitacaoCadastro[] = [...INITIAL_SOLICITACOES_CADASTRO];
  public emailsEnviados: RegistroEmailEnviado[] = [];
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
    analistaSG: string;
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
    permissoesAcesso?: any;
    modelosDisponibilizadosOriginador?: {
      id: string;
      titulo: string;
      tipoPeca: string;
      artigoLei?: string;
      downloadUrl?: string;
    }[];
  }): { success: boolean; message: string; processoGerado?: ProcessoAdministrativo } {
    const demanda = this.demandasPrevias.find((d) => d.id === dados.demandaId);
    if (!demanda) {
      return { success: false, message: "Demanda prévia não localizada." };
    }

    const agora = new Date().toISOString();
    const nomeCoordenadora = dados.coordenadoraNome || dados.analistaSG;
    const servidorSGNome = dados.servidorSGDestinoNome || "Dra. Willianne Soares";
    const servidorSGId = dados.servidorSGDestinoId || "usr-coord-geral";
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
      modelosDisponibilizadosOriginador: dados.modelosDisponibilizadosOriginador,
      direcionamentoSG: {
        servidorSGId,
        servidorSGNome,
        servidorSGCargo: dados.servidorSGDestinoCargo || "Superintendência de Gestão (SG)",
        servidorSGEmail: dados.servidorSGDestinoEmail || "sg@saude.gov.br",
        dataHoraDirecionamento: agora,
        coordenadoraNome: nomeCoordenadora,
        visualizado: false,
      },
      notificacoesOriginador: {
        emailEnviado: true,
        dataHoraEmail: agora,
        destinatarioEmail: emailDemandante,
        mensagemResumo: `Demanda enquadrada em '${dados.modalidadeDefinidaNome}' (${dados.artigoLeiBase}). Modelos liberados para elaboração: ${artefatosLista.join(", ")}.`,
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

    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}-1`,
      data: agora,
      origem: "Coordenação Geral (SG)",
      destino: `${demanda.superintendenciaOrigem} - ${demanda.coordenacaoOrigem} (${demanda.responsavelNome})`,
      acao: "Enquadramento Licitatório & Devolução com Liberação de Artefatos",
      motivoOuDespacho: `Modalidade definida: ${dados.modalidadeDefinidaNome} (${dados.artigoLeiBase}). Artefatos liberados: ${artefatosLista.join(", ")}. Notificação automática enviada via E-mail institucional (${emailDemandante}).${
        processoGerado ? ` Processo autuado: ${processoGerado.numeroProcesso}.` : ""
      }`,
      usuario: nomeCoordenadora,
    });

    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}-2`,
      data: agora,
      origem: "Coordenação Geral (SG)",
      destino: `SG - ${servidorSGNome}`,
      acao: "Direcionamento de Demanda para Servidor da SG",
      motivoOuDespacho: `A Coordenadora Geral direcionou a demanda para ${servidorSGNome} conduzir o processo na SG. Direcionamento registrado às ${new Date(agora).toLocaleTimeString("pt-BR")}.`,
      usuario: nomeCoordenadora,
    });

    return {
      success: true,
      message: `Enquadramento concluído pela Coordenadora Geral! Notificação oficial enviada para o e-mail (${emailDemandante}). Demanda direcionada para ${servidorSGNome} com dia e hora registrados.${
        processoGerado ? ` Processo ${processoGerado.numeroProcesso} autuado.` : ""
      }`,
      processoGerado,
    };
  }

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
      // RESET COMPLETO SOLICITADO: Limpeza total de cadastros testes remanescentes
      const RESET_FLAG = "supergestao_reset_cadastros_20261022_v2";
      if (!localStorage.getItem(RESET_FLAG)) {
        localStorage.setItem(RESET_FLAG, "true");
        localStorage.removeItem("supergestao_solicitacoes_cadastro");
        this.solicitacoesCadastro = [];
        this.usuarios = [...INITIAL_USUARIOS];
        this.salvarSolicitacoesStorage();
        return [];
      }

      const data = localStorage.getItem("supergestao_solicitacoes_cadastro");
      if (data) {
        const parsed = JSON.parse(data) as SolicitacaoCadastro[];
        if (Array.isArray(parsed)) {
          // Purga automática de modelos antigos
          const validas = parsed.filter(
            (item) => !item.id.startsWith("cad-00") && !item.id.startsWith("cad-mock")
          );
          this.solicitacoesCadastro = validas;
          if (validas.length !== parsed.length) {
            this.salvarSolicitacoesStorage();
          }
        }
      } else {
        this.salvarSolicitacoesStorage();
      }
    } catch {
      // fallback gracioso em ambientes com restrição de cookies/storage
    }
    return this.solicitacoesCadastro;
  }

  public zerarSolicitacoesCadastro(): void {
    this.solicitacoesCadastro = [];
    this.usuarios = [...INITIAL_USUARIOS];
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("supergestao_solicitacoes_cadastro");
        localStorage.setItem("supergestao_reset_cadastros_20261022_v2", "true");
        window.dispatchEvent(new CustomEvent("supergestao_cadastro_atualizado"));
      } catch {}
    }
    this.salvarSolicitacoesStorage();
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
    // Garante que o módulo de CADASTRO NUNCA seja liberado para novos servidores
    const permissoesSaneadas = (permissoes || []).map((p) =>
      p.moduloId === "cadastro" ? { ...p, visualizar: false, editar: false } : p
    );

    cad.status = "AUTORIZADO";
    cad.permissoes = permissoesSaneadas;
    cad.autorizadoPor = autorizadorNome;
    cad.dataAutorizacao = new Date().toISOString();
    if (observacoesSG) cad.observacoesSG = observacoesSG;

    // Converte automaticamente para usuário ativo do sistema
    // Servidores da SG recebem perfil SERVIDOR_SG (a Coordenadora Geral Dra. Willianne Soares é a única ADMINISTRADOR)
    // Servidores setoriais recebem perfil SERVIDOR_SETORIAL restrito à sua superintendência
    const isSG = cad.superintendenciaLotacao === "SG" || cad.cargo.toLowerCase().includes("gestão");
    this.adicionarUsuario({
      id: `usr-${cad.id}`,
      nome: cad.nomeCompleto,
      email: cad.email,
      cpf: cad.cpf,
      matricula: cad.matricula,
      cargo: cad.cargo,
      setor: cad.superintendenciaLotacao, // e.g. "SG" ou "SAS"
      perfil: isSG ? "SERVIDOR_SG" : "SERVIDOR_SETORIAL",
      ativo: true,
      whatsapp: cad.whatsapp,
      permissoes: permissoesSaneadas,
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
      const emailAlvo = this.solicitacoesCadastro[idx].email?.toLowerCase();
      this.solicitacoesCadastro.splice(idx, 1);
      this.usuarios = this.usuarios.filter(
        (u) => u.id !== `usr-${id}` && (emailAlvo ? u.email.toLowerCase() !== emailAlvo : true)
      );
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
    // Apenas Dra. Willianne Soares pode ser ADMINISTRADOR oficial
    if (usuario.email.toLowerCase() !== "will2026@gmail.com" && usuario.id !== "usr-coord-geral") {
      if (usuario.perfil === "ADMINISTRADOR") {
        usuario.perfil = usuario.setor === "SG" ? "SERVIDOR_SG" : "SERVIDOR_SETORIAL";
      }
    }
    const existe = this.usuarios.find(
      (u) => u.email.toLowerCase() === usuario.email.toLowerCase()
    );
    if (!existe) {
      this.usuarios.push(usuario);
    } else {
      Object.assign(existe, usuario);
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
      const permissoesSaneadas = (sol.permissoes || []).map((p) =>
        p.moduloId === "cadastro" ? { ...p, visualizar: false, editar: false } : p
      );
      const usuarioAuth: Usuario = {
        id: `usr-${sol.id}`,
        nome: sol.nomeCompleto,
        email: sol.email,
        cpf: sol.cpf,
        matricula: sol.matricula,
        cargo: sol.cargo,
        setor: sol.superintendenciaLotacao, // e.g. "SG" ou "SAS"
        perfil: isSG ? "SERVIDOR_SG" : "SERVIDOR_SETORIAL",
        ativo: true,
        whatsapp: sol.whatsapp,
        permissoes: permissoesSaneadas,
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

  // -------------------------------------------------------------
  // DIRECIONAMENTO E GOVERNANÇA DE DEMANDAS NA SG
  // -------------------------------------------------------------
  public direcionarDemandaSG(dados: {
    demandaId: string;
    coordenadoraNome?: string;
    servidorSGDestinoId: string;
    servidorSGDestinoNome: string;
    servidorSGDestinoCargo?: string;
    servidorSGDestinoEmail?: string;
    observacoes?: string;
    permissoesAcesso?: any;
    artefatosDisponibilizados?: string[];
  }): { success: boolean; message: string; demanda?: DemandaPreviaProcesso } {
    const demanda = this.demandasPrevias.find((d) => d.id === dados.demandaId);
    if (!demanda) {
      return { success: false, message: "Demanda não localizada." };
    }

    const agora = new Date().toISOString();
    const nomeCoordenadora = dados.coordenadoraNome || "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG)";
    const servidorSGNome = dados.servidorSGDestinoNome || "Dra. Willianne Soares";
    const servidorSGEmail = dados.servidorSGDestinoEmail || "will2026@gmail.com";

    if (demanda.status === "AGUARDANDO_ENQUADRAMENTO_SG") {
      demanda.status = "EM_ANALISE_SG";
    }

    if (!demanda.enquadramentoSG) {
      demanda.enquadramentoSG = {
        dataDespacho: agora,
        analistaSG: nomeCoordenadora,
        coordenadoraNome: nomeCoordenadora,
        modalidadeDefinidaId: "A_DEFINIR",
        modalidadeDefinidaNome: "Em Análise pela SG",
        artigoLeiBase: "Lei Federal nº 14.133/2021",
        justificativaEnquadramento: dados.observacoes || "Demanda direcionada pela Coordenadora Geral para instrução técnica e condução na SG.",
      };
    }

    demanda.enquadramentoSG.direcionamentoSG = {
      servidorSGId: dados.servidorSGDestinoId,
      servidorSGNome,
      servidorSGCargo: dados.servidorSGDestinoCargo || "Superintendência de Gestão (SG)",
      servidorSGEmail,
      dataHoraDirecionamento: agora,
      coordenadoraNome: nomeCoordenadora,
      visualizado: false,
    };

    if (dados.permissoesAcesso) {
      demanda.enquadramentoSG.permissoesAcesso = dados.permissoesAcesso;
    }

    demanda.historicoTramitacao.push({
      id: `hist-${Date.now()}`,
      data: agora,
      origem: "Coordenação Geral de Gestão (SG)",
      destino: `SG - ${servidorSGNome}`,
      acao: "Direcionamento Interno de Demanda na SG",
      motivoOuDespacho: dados.observacoes || `Demanda direcionada formalmente para condução e instrução processual por ${servidorSGNome}.`,
      usuario: nomeCoordenadora,
    });

    return {
      success: true,
      message: `Demanda direcionada com sucesso para ${servidorSGNome} (${servidorSGEmail})!`,
      demanda,
    };
  }

  public concluirElaboracaoDocumentosOriginador(dados: {
    demandaId: string;
    servidorNome: string;
    servidorEmail?: string;
    observacoes?: string;
    documentosProntos?: string[];
  }): { success: boolean; message: string; demanda?: DemandaPreviaProcesso } {
    const demanda = this.demandasPrevias.find((d) => d.id === dados.demandaId);
    if (!demanda) {
      return { success: false, message: "Demanda não localizada." };
    }

    const agora = new Date().toISOString();
    const servidorDesignadoNome = demanda.enquadramentoSG?.direcionamentoSG?.servidorSGNome || "Equipe da SG";

    demanda.status = "DOCUMENTOS_PRONTOS_SG";

    if (!demanda.enquadramentoSG) {
      demanda.enquadramentoSG = {
        dataDespacho: agora,
        analistaSG: "Coordenadora Geral da SG",
        modalidadeDefinidaId: "A_DEFINIR",
        modalidadeDefinidaNome: "Em Análise pela SG",
        artigoLeiBase: "Lei nº 14.133/2021",
        justificativaEnquadramento: "Elaboração de documentos concluída pelo originador.",
      };
    }

    demanda.enquadramentoSG.elaboracaoOriginadorConcluida = {
      concluido: true,
      dataHoraConclusao: agora,
      servidorNome: dados.servidorNome,
      observacoes: dados.observacoes,
      documentosProntos: dados.documentosProntos || [],
    };

    demanda.historicoTramitacao.push({
      id: `hist-conc-${Date.now()}`,
      data: agora,
      origem: `${demanda.superintendenciaOrigem} - ${demanda.responsavelNome}`,
      destino: `SG - ${servidorDesignadoNome}`,
      acao: "Devolução da Demanda à SG com Documentos Prontos",
      motivoOuDespacho: dados.observacoes || "O servidor originador concluiu a elaboração técnica de todos os artefatos liberados pela SG.",
      usuario: dados.servidorNome,
    });

    return {
      success: true,
      message: `Documentos concluídos com sucesso e demanda devolvida para a caixa da SG (${servidorDesignadoNome})!`,
      demanda,
    };
  }

  // -------------------------------------------------------------
  // CENTRAL DE AUDITORIA & REGISTRO DE E-MAILS DISPARADOS
  // -------------------------------------------------------------
  public carregarEmailsStorage(): RegistroEmailEnviado[] {
    if (typeof window === "undefined") {
      return this.emailsEnviados;
    }
    try {
      const data = localStorage.getItem("supergestao_emails_enviados");
      if (data) {
        const parsed = JSON.parse(data) as RegistroEmailEnviado[];
        if (Array.isArray(parsed)) {
          this.emailsEnviados = parsed;
        }
      }
    } catch {
      // Ignora erro de storage restrito
    }
    return this.emailsEnviados;
  }

  public salvarEmailsStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "supergestao_emails_enviados",
        JSON.stringify(this.emailsEnviados)
      );
      window.dispatchEvent(new CustomEvent("supergestao_emails_atualizados"));
    } catch {
      // Ignora falha de cota
    }
  }

  public registrarEmailEnviado(registro: RegistroEmailEnviado): void {
    this.carregarEmailsStorage();
    this.emailsEnviados.unshift(registro);
    if (this.emailsEnviados.length > 100) {
      this.emailsEnviados = this.emailsEnviados.slice(0, 100);
    }
    this.salvarEmailsStorage();
  }

  public obterEmailsEnviados(): RegistroEmailEnviado[] {
    return this.carregarEmailsStorage();
  }

  public limparHistoricoEmails(): void {
    this.emailsEnviados = [];
    this.salvarEmailsStorage();
  }

  // -------------------------------------------------------------
  // GESTÃO DO PLANO DE CONTRATAÇÕES ANUAL (PCA) COM PERSISTÊNCIA DUAL
  // -------------------------------------------------------------
  public carregarPcaStorage(): ItemPCA[] {
    if (typeof window === "undefined") {
      return this.pca;
    }
    try {
      const data = localStorage.getItem("supergestao_pca");
      if (data) {
        const parsed = JSON.parse(data) as ItemPCA[];
        if (Array.isArray(parsed)) {
          this.pca = parsed;
        }
      } else {
        this.salvarPcaStorage();
      }
    } catch {
      // fallback gracioso
    }
    return this.pca;
  }

  public salvarPcaStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("supergestao_pca", JSON.stringify(this.pca));
      window.dispatchEvent(new CustomEvent("supergestao_pca_atualizado"));
    } catch {
      // fallback gracioso
    }
  }

  public obterItensPCA(): ItemPCA[] {
    this.carregarPcaStorage();
    return [...this.pca];
  }

  public adicionarItemPCA(dados: Omit<ItemPCA, "id"> & { id?: string }): { success: boolean; message: string; item?: ItemPCA } {
    this.carregarPcaStorage();
    const novoId = dados.id || `pca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Calcula quantidade total se houver itens estimados
    const qtdTotal = dados.itensEstimados && dados.itensEstimados.length > 0
      ? dados.itensEstimados.reduce((acc, it) => acc + (Number(it.quantidadeEstimada) || 0), 0)
      : dados.quantidadeTotal || 0;

    // Calcula valor estimado total se houver itens estimados
    let vlrEstimado = dados.valorEstimado;
    if (dados.itensEstimados && dados.itensEstimados.length > 0) {
      const somaItens = dados.itensEstimados.reduce(
        (acc, it) => acc + (Number(it.valorTotalEstimado) || (Number(it.quantidadeEstimada) * Number(it.valorUnitarioEstimado)) || 0),
        0
      );
      if (somaItens > 0) vlrEstimado = somaItens;
    }

    const item: ItemPCA = {
      id: novoId,
      anoExercicio: dados.anoExercicio || 2025,
      codigoItem: dados.codigoItem || `PCA-2025/${String(this.pca.length + 1).padStart(3, "0")}`,
      numeroDFD: dados.numeroDFD,
      descricao: dados.descricao,
      categoria: dados.categoria,
      unidadeRequisitante: dados.unidadeRequisitante || "SAS",
      grauPrioridade: dados.grauPrioridade || "ALTA",
      quantidadeTotal: qtdTotal,
      valorEstimado: vlrEstimado,
      status: dados.status || "PLANEJADO",
      dataPrevisaoContratacao: dados.dataPrevisaoContratacao || "2025-06",
      itensEstimados: dados.itensEstimados || [],
      origemInsercao: dados.origemInsercao || "MANUAL",
      inseridoPor: dados.inseridoPor,
      inseridoEm: dados.inseridoEm || new Date().toISOString(),
    };

    this.pca.unshift(item);
    this.salvarPcaStorage();
    return {
      success: true,
      message: `Contratação ${item.codigoItem} (${item.numeroDFD || "DFD"}) cadastrada com sucesso!`,
      item,
    };
  }

  public importarItensPCA(itens: ItemPCA[], substituir: boolean = false): { success: boolean; message: string; totalImportado: number } {
    this.carregarPcaStorage();
    if (substituir) {
      this.pca = [...itens];
    } else {
      const existentesMap = new Set(
        this.pca.map((p) => (p.numeroDFD ? p.numeroDFD.toLowerCase().trim() : p.codigoItem.toLowerCase().trim()))
      );
      const novos = itens.filter((it) => {
        const chave = (it.numeroDFD ? it.numeroDFD.toLowerCase().trim() : it.codigoItem.toLowerCase().trim());
        return !existentesMap.has(chave);
      });
      this.pca = [...novos, ...this.pca];
    }
    this.salvarPcaStorage();
    return {
      success: true,
      message: `${itens.length} contratação(ões) do PCA foram consolidadas com sucesso!`,
      totalImportado: itens.length,
    };
  }

  public removerItemPCA(id: string): { success: boolean; message: string } {
    this.carregarPcaStorage();
    const index = this.pca.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, message: "Item do PCA não encontrado." };
    }
    const removido = this.pca.splice(index, 1)[0];
    this.salvarPcaStorage();
    return { success: true, message: `Item ${removido.codigoItem} removido com sucesso.` };
  }

  public limparPCA(): { success: boolean; message: string } {
    this.pca = [];
    this.salvarPcaStorage();
    return { success: true, message: "Base do PCA zerada com sucesso." };
  }
}

export const dataStore = SuperGestaoDataStore.getInstance();
