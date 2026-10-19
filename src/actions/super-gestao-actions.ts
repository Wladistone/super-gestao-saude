"use server";

import { dataStore } from "@/lib/data-store";
import { revalidatePath } from "next/cache";
import { PermissaoModulo } from "@/lib/types";

export async function getDashboardDataAction() {
  const store = dataStore;
  const alertas = store.obterAlertasPreventivos();

  // Cálculo de KPIs consolidados
  const totalContratosValor = store.contratos.reduce((acc, c) => acc + c.valorGlobal, 0);
  const totalSaldoDisponivelContratos = store.contratos.reduce((acc, c) => acc + c.saldoFinanceiroAtual, 0);
  const totalOrcamentoGeral = store.dotacoes.reduce((acc, d) => acc + d.orcamentoInicial, 0);
  const totalOrcamentoDisponivel = store.dotacoes.reduce((acc, d) => acc + d.saldoDisponivel, 0);
  const veiculosPlantao = store.veiculos.filter((v) => v.status === "PLANTAO_24_7").length;
  const veiculosEmRota = store.veiculos.filter((v) => v.status === "EM_ROTA").length;
  const demandasUrgentes = store.demandasJudiciais.filter((d) => d.status !== "CUMPRIDA").length;

  return {
    kpis: {
      totalContratosValor,
      totalSaldoDisponivelContratos,
      percentualSaldoContratos: Math.round((totalSaldoDisponivelContratos / totalContratosValor) * 100),
      totalOrcamentoGeral,
      totalOrcamentoDisponivel,
      veiculosPlantao,
      veiculosEmRota,
      veiculosTotal: store.veiculos.length,
      demandasUrgentes,
      processosAtivos: store.processos.filter((p) => p.status !== "ENCERRADO").length,
    },
    alertas,
    processosRecentes: store.processos.slice(0, 5),
    contratosCriticos: alertas.alertasContratos.slice(0, 4),
    demandasFatais: alertas.alertasJudiciais.slice(0, 3),
    escalasHoje: store.escalas,
  };
}

export async function emitirOrdemAction(dados: {
  contratoId: string;
  itens: { itemContratoId: string; quantidade: number }[];
  prazoEntrega?: string;
  observacoes?: string;
}) {
  const res = dataStore.emitirOrdemFornecimento(dados);
  revalidatePath("/contratos");
  revalidatePath("/");
  return res;
}

export async function solicitarPagamentoContratoAction(dados: {
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
}) {
  const res = dataStore.solicitarPagamentoContrato(dados);
  revalidatePath("/contratos");
  revalidatePath("/");
  return res;
}

import { SuperintendenciaSigla, ItemDemandaPrevia } from "@/lib/types";

export async function criarProcessoAction(dados: {
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
}) {
  const res = dataStore.criarProcesso(dados);
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function criarDemandaPreviaAction(dados: {
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
}) {
  const res = dataStore.criarDemandaPrevia(dados);
  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function enquadrarDemandaSGAction(dados: {
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
}) {
  const res = dataStore.enquadrarDemandaSG(dados);
  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function registrarVisualizacaoDirecionamentoSGAction(dados: {
  demandaId: string;
  servidorNome?: string;
}) {
  const res = dataStore.registrarVisualizacaoDirecionamentoSG(dados.demandaId, dados.servidorNome);
  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function solicitarDiligenciaSGAction(dados: {
  demandaId: string;
  analistaSG: string;
  motivoDiligencia: string;
}) {
  const res = dataStore.solicitarDiligenciaSG(dados);
  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function responderDiligenciaAction(dados: {
  demandaId: string;
  usuario: string;
  cargoUsuario?: string;
  respostaTexto: string;
  itensAtualizados?: any[];
}) {
  const res = dataStore.responderDiligenciaDemandante(dados);
  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function adicionarDespachoAction(dados: {
  demandaId: string;
  origem: string;
  destino: string;
  acao: string;
  motivoOuDespacho: string;
  usuario: string;
}) {
  const res = dataStore.adicionarDespachoTramitacao(dados);
  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function adicionarCreditoAction(dados: {
  tipo: "SUPLEMENTAR" | "ESPECIAL" | "EXTRAORDINARIO";
  decretoNumero: string;
  valor: number;
  origem: "ANULACAO" | "EXCESSO_ARRECADACAO" | "SUPERAVIT";
  dotacaoDestinoId: string;
  processoOrigemId?: string;
}) {
  const res = dataStore.adicionarCreditoAdicional(dados);
  revalidatePath("/orcamento");
  revalidatePath("/");
  return res;
}

export async function adicionarCreditoSMSAction(dados: {
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
}) {
  const res = dataStore.adicionarCreditoSMS(dados);
  revalidatePath("/orcamento");
  revalidatePath("/");
  return res;
}

export async function registrarAbastecimentoAction(dados: {
  veiculoId: string;
  motoristaId: string;
  contratoCombustivelId: string;
  quilometragem: number;
  litros: number;
  tipoCombustivel: string;
  cupomFiscal: string;
  postoConveniado: string;
}) {
  const res = dataStore.registrarAbastecimento(dados);
  revalidatePath("/frotas");
  revalidatePath("/contratos");
  revalidatePath("/");
  return res;
}

export async function registrarDemandaJudicialAction(dados: {
  numeroProcessoJudicial: string;
  varaJuizo: string;
  poloAtivo: string;
  tipoDemanda: "MEDICAMENTO" | "PROCEDIMENTO_CIRURGIA" | "LEITO_UTI" | "INSUMO";
  prazoCumprimento: string;
  valorEstimado: number;
  prioridade: string;
  relatoCaso: string;
  contratoId?: string;
}) {
  const res = dataStore.registrarDemandaJudicial(dados);
  revalidatePath("/judicializacao");
  revalidatePath("/");
  return res;
}

export async function busca360Action(termo: string) {
  return dataStore.busca360(termo);
}

export async function adicionarSolicitacaoCadastroAction(dados: {
  email: string;
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  whatsapp?: string;
  matricula: string;
  superintendenciaLotacao: string;
  cargo: string;
  senha?: string;
}) {
  const nova = dataStore.adicionarSolicitacaoCadastro(dados);
  revalidatePath("/cadastro");
  revalidatePath("/login");
  revalidatePath("/");
  return { success: true, solicitacao: nova };
}

export async function autorizarCadastroAction(dados: {
  id: string;
  permissoes: PermissaoModulo[];
  autorizadorNome: string;
  observacoesSG?: string;
}) {
  const res = dataStore.autorizarCadastro(
    dados.id,
    dados.permissoes,
    dados.autorizadorNome,
    dados.observacoesSG
  );
  revalidatePath("/cadastro");
  revalidatePath("/");
  return { success: res };
}

export async function rejeitarCadastroAction(dados: {
  id: string;
  motivoRejeicao: string;
  autorizadorNome: string;
}) {
  const res = dataStore.rejeitarCadastro(
    dados.id,
    dados.motivoRejeicao,
    dados.autorizadorNome
  );
  revalidatePath("/cadastro");
  revalidatePath("/");
  return { success: res };
}

export async function obterSolicitacoesCadastroAction() {
  return dataStore.obterSolicitacoesCadastro();
}

