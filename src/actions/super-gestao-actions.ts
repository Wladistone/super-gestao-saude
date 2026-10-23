"use server";

import { dataStore } from "@/lib/data-store";
import { revalidatePath } from "next/cache";
import { PermissaoModulo, ItemPCA } from "@/lib/types";
import {
  enviarEmailBoasVindasCadastro,
  enviarEmailCadastroRejeitado,
  enviarEmailEnquadramentoDemanda,
  enviarEmailDiligenciaDemanda,
  enviarEmailDirecionamentoDemandaSG,
  obterConfiguracaoEmail,
  testarConexaoSmtp,
  salvarConfiguracaoSmtp,
  DadosConfiguracaoSmtp,
} from "@/lib/email-service";

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
  permissoesAcesso?: any;
  modelosDisponibilizadosOriginador?: {
    id: string;
    titulo: string;
    tipoPeca: string;
    artigoLei?: string;
    downloadUrl?: string;
  }[];
  servidorOriginadorEmail?: string;
  servidorOriginadorNome?: string;
}) {
  const res = dataStore.enquadrarDemandaSG(dados);

  let emailDisparado: any = null;

  if (res.success) {
    const demanda = dataStore.demandasPrevias.find((d) => d.id === dados.demandaId);
    const emailDestinatario = (dados.servidorOriginadorEmail || demanda?.responsavelEmail || "comprassaude@arapiraca.al.gov.br").trim();
    const servidorNome = dados.servidorOriginadorNome || demanda?.responsavelNome || "Servidor Demandante";

    try {
      emailDisparado = await enviarEmailEnquadramentoDemanda({
        servidorNome,
        servidorEmail: emailDestinatario,
        numeroDemanda: demanda?.numeroDemanda || dados.demandaId,
        superintendencia: demanda ? `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})` : "SMS Arapiraca",
        objeto: demanda?.objeto || "Aquisição e Contratações de Saúde",
        coordenadoraNome: dados.coordenadoraNome || dados.analistaSG,
        modalidadeNome: dados.modalidadeDefinidaNome,
        artigoLei: dados.artigoLeiBase,
        justificativaEnquadramento: dados.justificativaEnquadramento,
        numeroProcesso: res.processoGerado?.numeroProcesso,
        servidorSGDesignado: dados.servidorSGDestinoNome,
        artefatos: dados.artefatosDisponibilizados || [
          "Documento de Formalização da Demanda (DFD)",
          "Estudo Técnico Preliminar (ETP)",
          "Termo de Referência (TR)",
          "Matriz de Riscos da Contratação",
        ],
      });
    } catch (emailErr) {
      console.error("Falha ao disparar e-mail de enquadramento ao demandante:", emailErr);
    }

    // Mensagem 5: Disparo de e-mail ao servidor da SG designado pela Coordenadora Geral
    if (dados.servidorSGDestinoEmail) {
      try {
        await enviarEmailDirecionamentoDemandaSG({
          servidorNome: dados.servidorSGDestinoNome || "Servidor da SG",
          servidorEmail: dados.servidorSGDestinoEmail,
          numeroDemanda: demanda?.numeroDemanda || dados.demandaId,
          superintendencia: demanda ? `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})` : "SMS Arapiraca",
          objeto: demanda?.objeto || "Aquisição e Contratações de Saúde",
          modalidadeNome: dados.modalidadeDefinidaNome,
          artigoLei: dados.artigoLeiBase,
          numeroProcesso: res.processoGerado?.numeroProcesso,
          servidorOriginadorNome: servidorNome,
          coordenadoraNome: dados.coordenadoraNome || dados.analistaSG,
        });
      } catch (sgErr) {
        console.error("Falha ao disparar e-mail de direcionamento para o servidor SG:", sgErr);
      }
    }
  }

  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");

  return {
    ...res,
    emailDisparado,
  };
}

export async function direcionarDemandaSGAction(dados: {
  demandaId: string;
  coordenadoraNome?: string;
  servidorSGDestinoId: string;
  servidorSGDestinoNome: string;
  servidorSGDestinoCargo?: string;
  servidorSGDestinoEmail?: string;
  observacoes?: string;
  permissoesAcesso?: any;
  artefatosDisponibilizados?: string[];
}) {
  const res = dataStore.direcionarDemandaSG(dados);

  let emailDisparado: any = null;

  if (res.success && dados.servidorSGDestinoEmail) {
    const demanda = dataStore.demandasPrevias.find((d) => d.id === dados.demandaId);
    try {
      emailDisparado = await enviarEmailDirecionamentoDemandaSG({
        servidorNome: dados.servidorSGDestinoNome,
        servidorEmail: dados.servidorSGDestinoEmail,
        numeroDemanda: demanda?.numeroDemanda || dados.demandaId,
        superintendencia: demanda ? `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})` : "SMS Arapiraca",
        objeto: demanda?.objeto || "Aquisição e Contratações de Saúde",
        modalidadeNome: demanda?.enquadramentoSG?.modalidadeDefinidaNome || "Em Análise pela SG",
        artigoLei: demanda?.enquadramentoSG?.artigoLeiBase || "Lei Federal nº 14.133/2021",
        numeroProcesso: demanda?.enquadramentoSG?.numeroProcessoGerado,
        servidorOriginadorNome: demanda?.responsavelNome || "Servidor Demandante",
        coordenadoraNome: dados.coordenadoraNome || "Dra. Willianne Soares (Coordenadora Geral de Gestão)",
      });
    } catch (err) {
      console.error("Falha ao disparar e-mail de direcionamento para o servidor SG:", err);
    }
  }

  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");

  return {
    ...res,
    emailDisparado,
  };
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

export async function concluirElaboracaoDocumentosOriginadorAction(dados: {
  demandaId: string;
  servidorNome: string;
  servidorEmail?: string;
  observacoes?: string;
  documentosProntos?: string[];
}) {
  const res = dataStore.concluirElaboracaoDocumentosOriginador(dados);

  if (res.success && res.demanda && res.demanda.enquadramentoSG?.direcionamentoSG?.servidorSGEmail) {
    const demanda = res.demanda;
    const enq = demanda.enquadramentoSG;
    const dirSG = enq?.direcionamentoSG;
    if (dirSG && dirSG.servidorSGEmail) {
      try {
        await enviarEmailDirecionamentoDemandaSG({
          servidorNome: dirSG.servidorSGNome || "Servidor da SG",
          servidorEmail: dirSG.servidorSGEmail,
          numeroDemanda: demanda.numeroDemanda,
          superintendencia: `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})`,
          objeto: demanda.objeto,
          modalidadeNome: enq?.modalidadeDefinidaNome || "Definida pela SG",
          artigoLei: enq?.artigoLeiBase || "Lei Federal nº 14.133/2021",
          numeroProcesso: enq?.numeroProcessoGerado,
          servidorOriginadorNome: dados.servidorNome,
          coordenadoraNome: `Unidade Técnica ${demanda.superintendenciaOrigem} (Elaboração Concluída)`,
        });
      } catch (e) {
        console.error("Erro ao notificar servidor SG sobre conclusão dos documentos:", e);
      }
    }
  }

  revalidatePath("/tramitacao");
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function solicitarDiligenciaSGAction(dados: {
  demandaId: string;
  analistaSG: string;
  motivoDiligencia: string;
  servidorOriginadorEmail?: string;
  servidorOriginadorNome?: string;
}) {
  const res = dataStore.solicitarDiligenciaSG(dados);

  if (res.success) {
    const demanda = dataStore.demandasPrevias.find((d) => d.id === dados.demandaId);
    const emailDestinatario = (dados.servidorOriginadorEmail || demanda?.responsavelEmail || "comprassaude@arapiraca.al.gov.br").trim();
    const servidorNome = dados.servidorOriginadorNome || demanda?.responsavelNome || "Servidor Demandante";

    try {
      await enviarEmailDiligenciaDemanda({
        servidorNome,
        servidorEmail: emailDestinatario,
        numeroDemanda: demanda?.numeroDemanda || dados.demandaId,
        superintendencia: demanda ? `${demanda.superintendenciaNome} (${demanda.superintendenciaOrigem})` : "SMS Arapiraca",
        objeto: demanda?.objeto || "Aquisição e Contratações de Saúde",
        motivoDiligencia: dados.motivoDiligencia,
        analistaNome: dados.analistaSG,
      });
    } catch (err) {
      console.error("Falha ao disparar e-mail de diligência:", err);
    }
  }

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
  email?: string;
  nomeCompleto?: string;
  matricula?: string;
  superintendenciaLotacao?: string;
  cargo?: string;
}) {
  // 1. Tenta achar por ID
  let solicitacao = dataStore.solicitacoesCadastro.find((c) => c.id === dados.id);

  // 2. Se não achou por ID, tenta por e-mail
  if (!solicitacao && dados.email) {
    const e = dados.email.trim().toLowerCase();
    solicitacao = dataStore.solicitacoesCadastro.find((c) => c.email.trim().toLowerCase() === e);
  }

  // 3. Se ainda assim não existe na memória do servidor, registra
  if (!solicitacao && dados.email && dados.nomeCompleto) {
    solicitacao = dataStore.adicionarSolicitacaoCadastro({
      email: dados.email,
      nomeCompleto: dados.nomeCompleto,
      dataNascimento: "1990-01-01",
      cpf: "000.000.000-00",
      matricula: dados.matricula || "SG-001",
      superintendenciaLotacao: dados.superintendenciaLotacao || "SAS",
      cargo: dados.cargo || "Servidor",
    });
  }

  const idAlvo = solicitacao ? solicitacao.id : dados.id;

  const res = dataStore.autorizarCadastro(
    idAlvo,
    dados.permissoes,
    dados.autorizadorNome,
    dados.observacoesSG
  );

  let emailDisparado: any = null;

  const emailDestino = (solicitacao?.email || dados.email || "").trim();
  const nomeDestino = solicitacao?.nomeCompleto || dados.nomeCompleto || "Servidor";
  const matriculaDestino = solicitacao?.matricula || dados.matricula || "SG-001";
  const superDestino = solicitacao?.superintendenciaLotacao || dados.superintendenciaLotacao || "SAS";
  const cargoDestino = solicitacao?.cargo || dados.cargo || "Servidor";

  if (emailDestino) {
    try {
      console.log(`[SuperGestão] Disparando e-mail de boas-vindas para: ${emailDestino}...`);
      emailDisparado = await enviarEmailBoasVindasCadastro({
        nomeCompleto: nomeDestino,
        email: emailDestino,
        matricula: matriculaDestino,
        superintendencia: superDestino,
        cargo: cargoDestino,
        autorizadorNome: dados.autorizadorNome,
        observacoesSG: dados.observacoesSG,
        permissoes: dados.permissoes,
      });
      console.log(`[SuperGestão] E-mail enviado para ${emailDestino}. Status: ${emailDisparado?.success}, ID: ${emailDisparado?.messageId}`);

      if (solicitacao) {
        solicitacao.notificacaoEmail = {
          enviado: emailDisparado.success,
          dataHora: emailDisparado.timestamp,
          destinatario: emailDestino,
          assunto: emailDisparado.assunto,
          modo: emailDisparado.modo,
          mensagemId: emailDisparado.messageId,
        };
        dataStore.salvarSolicitacoesStorage();
      }
    } catch (emailErr) {
      console.error("Falha ao disparar e-mail de boas-vindas do cadastro:", emailErr);
    }
  }

  revalidatePath("/cadastro");
  revalidatePath("/");

  return {
    success: res,
    emailDisparado,
  };
}

export async function reenviarEmailBoasVindasAction(dados: {
  id?: string;
  email: string;
  nomeCompleto?: string;
  matricula?: string;
  superintendencia?: string;
  cargo?: string;
  autorizadorNome?: string;
  observacoesSG?: string;
  permissoes?: PermissaoModulo[];
}) {
  let solicitacao = dados.id ? dataStore.solicitacoesCadastro.find((c) => c.id === dados.id) : undefined;
  if (!solicitacao && dados.email) {
    const e = dados.email.trim().toLowerCase();
    solicitacao = dataStore.solicitacoesCadastro.find((c) => c.email.trim().toLowerCase() === e);
  }

  const emailDestino = (solicitacao?.email || dados.email).trim();
  const nomeDestino = solicitacao?.nomeCompleto || dados.nomeCompleto || "Servidor";
  const matriculaDestino = solicitacao?.matricula || dados.matricula || "SG-001";
  const superDestino = solicitacao?.superintendenciaLotacao || dados.superintendencia || "SAS";
  const cargoDestino = solicitacao?.cargo || dados.cargo || "Servidor";
  const autorizador = dados.autorizadorNome || solicitacao?.autorizadoPor || "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG)";
  const permissoes = dados.permissoes || solicitacao?.permissoes || [];

  const resEmail = await enviarEmailBoasVindasCadastro({
    nomeCompleto: nomeDestino,
    email: emailDestino,
    matricula: matriculaDestino,
    superintendencia: superDestino,
    cargo: cargoDestino,
    autorizadorNome: autorizador,
    observacoesSG: dados.observacoesSG || solicitacao?.observacoesSG,
    permissoes,
  });

  if (solicitacao) {
    solicitacao.notificacaoEmail = {
      enviado: resEmail.success,
      dataHora: resEmail.timestamp,
      destinatario: emailDestino,
      assunto: resEmail.assunto,
      modo: resEmail.modo,
      mensagemId: resEmail.messageId,
    };
    dataStore.salvarSolicitacoesStorage();
  }

  revalidatePath("/cadastro");
  revalidatePath("/");

  return resEmail;
}

export async function rejeitarCadastroAction(dados: {
  id: string;
  motivoRejeicao: string;
  autorizadorNome: string;
  email?: string;
  nomeCompleto?: string;
  matricula?: string;
  superintendenciaLotacao?: string;
  cargo?: string;
}) {
  let solicitacao = dataStore.solicitacoesCadastro.find((c) => c.id === dados.id);
  if (!solicitacao && dados.email) {
    const e = dados.email.trim().toLowerCase();
    solicitacao = dataStore.solicitacoesCadastro.find((c) => c.email.trim().toLowerCase() === e);
  }

  const res = dataStore.rejeitarCadastro(
    dados.id,
    dados.motivoRejeicao,
    dados.autorizadorNome
  );

  const emailDestino = (solicitacao?.email || dados.email || "").trim();
  const nomeDestino = solicitacao?.nomeCompleto || dados.nomeCompleto || "Servidor";

  if (emailDestino) {
    try {
      await enviarEmailCadastroRejeitado({
        nomeCompleto: nomeDestino,
        email: emailDestino,
        motivoRejeicao: dados.motivoRejeicao,
        matricula: solicitacao?.matricula || dados.matricula,
        superintendencia: solicitacao?.superintendenciaLotacao || dados.superintendenciaLotacao,
        cargo: solicitacao?.cargo || dados.cargo,
        autorizadorNome: dados.autorizadorNome,
      });
    } catch (err) {
      console.error("Falha ao disparar e-mail de rejeição de cadastro:", err);
    }
  }

  revalidatePath("/cadastro");
  revalidatePath("/");
  return { success: res };
}

export async function obterSolicitacoesCadastroAction() {
  return dataStore.obterSolicitacoesCadastro();
}

export async function obterEmailsEnviadosAction() {
  return dataStore.obterEmailsEnviados();
}

export async function obterStatusConfiguracaoEmailAction() {
  return obterConfiguracaoEmail();
}

export async function testarConexaoSmtpAction(dados: DadosConfiguracaoSmtp) {
  return testarConexaoSmtp(dados);
}

export async function salvarConfiguracaoSmtpAction(dados: DadosConfiguracaoSmtp) {
  const res = await salvarConfiguracaoSmtp(dados);
  revalidatePath("/");
  return res;
}

export async function zerarCadastrosAction() {
  dataStore.zerarSolicitacoesCadastro();
  revalidatePath("/cadastro");
  revalidatePath("/solicitacoes");
  revalidatePath("/");
  return { success: true };
}

export async function excluirCadastroAction(id: string) {
  const res = dataStore.excluirSolicitacaoCadastro(id);
  revalidatePath("/cadastro");
  revalidatePath("/solicitacoes");
  revalidatePath("/");
  return { success: res };
}

export async function adicionarItemPcaAction(dados: Omit<ItemPCA, "id"> & { id?: string }) {
  const res = dataStore.adicionarItemPCA(dados);
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function importarPcaAction(itens: ItemPCA[], substituir: boolean = false) {
  const res = dataStore.importarItensPCA(itens, substituir);
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function removerItemPcaAction(id: string) {
  const res = dataStore.removerItemPCA(id);
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}

export async function limparPcaAction() {
  const res = dataStore.limparPCA();
  revalidatePath("/processos");
  revalidatePath("/");
  return res;
}
