/**
 * Utilitários oficiais de formatação e disparo de notificações automáticas via E-mail
 * para a plataforma SuperGestão Saúde.
 */

export interface DadosNotificacaoDemanda {
  servidorNome: string;
  servidorEmail?: string;
  numeroDemanda: string;
  superintendencia: string;
  objeto: string;
  coordenadoraNome?: string;
  modalidadeNome: string;
  artigoLei: string;
  numeroProcesso?: string;
  artefatos: string[];
}

export function gerarEmailDemanda(dados: DadosNotificacaoDemanda): { assunto: string; corpo: string } {
  const coord = dados.coordenadoraNome || "Dra. Willianne Soares (Coordenadora Geral de Gestão / SG)";
  const assunto = `[SuperGestão Saúde] Enquadramento Licitatório da Demanda ${dados.numeroDemanda} - ${dados.superintendencia}`;
  const artefatosLista = dados.artefatos && dados.artefatos.length > 0
    ? dados.artefatos.map((a) => `- ${a}`).join("\n")
    : "- DFD (Documento de Formalização da Demanda)\n- ETP (Estudo Técnico Preliminar)\n- TR (Termo de Referência)\n- Matriz de Riscos";

  const corpo =
    `Prezado(a) ${dados.servidorNome},\n\n` +
    `Informamos que a sua demanda de contratação ${dados.numeroDemanda} (Superintendência: ${dados.superintendencia}) ` +
    `foi devidamente analisada e ENQUADRADA pela Coordenadora Geral de Gestão (${coord}).\n\n` +
    `DADOS DO ENQUADRAMENTO:\n` +
    `--------------------------------------------------\n` +
    `Modalidade Licitatória: ${dados.modalidadeNome}\n` +
    `Base Legal: ${dados.artigoLei}\n` +
    `${dados.numeroProcesso ? `Processo Administrativo Gerado: ${dados.numeroProcesso}\n` : ""}` +
    `Objeto: ${dados.objeto}\n\n` +
    `ARTEFATOS LIBERADOS PARA ELABORAÇÃO:\n` +
    `${artefatosLista}\n\n` +
    `As minutas e modelos da modalidade definida já estão disponíveis no seu painel de Tramitação na plataforma ` +
    `SuperGestão Saúde para que você possa redigir os termos técnicos e submeter à SG.\n\n` +
    `Link de Acesso: http://localhost:3000/tramitacao\n\n` +
    `Atenciosamente,\n` +
    `Superintendência de Gestão (SG)\n` +
    `Secretaria Municipal de Saúde`;

  return { assunto, corpo };
}

export function gerarLinkEmail(dados: DadosNotificacaoDemanda): string {
  const email = dados.servidorEmail || "hellywladi87@gmail.com";
  const { assunto, corpo } = gerarEmailDemanda(dados);
  return `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}
