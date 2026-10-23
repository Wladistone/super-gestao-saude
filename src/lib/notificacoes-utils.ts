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

export function extrairPrimeiroNome(nomeCompleto?: string): string {
  if (!nomeCompleto) return "Servidor";
  let limpo = nomeCompleto.trim().replace(/^([Dd]r\.|[Dd]ra\.|[Ee]nf\.|[Pp]rof\.|[Ss]r\.|[Ss]ra\.)\s+/i, "");
  limpo = limpo.replace(/\s*\([^)]*\)$/, "").trim();
  const partes = limpo.split(/\s+/);
  return partes[0] || "Servidor";
}

export function gerarEmailDemanda(dados: DadosNotificacaoDemanda): { assunto: string; corpo: string } {
  const primeiroNome = extrairPrimeiroNome(dados.servidorNome);
  const assunto = `[SuperGestão Saúde] Demanda ${dados.numeroDemanda} Enquadrada - Olá, ${primeiroNome}`;
  const artefatosLista = dados.artefatos && dados.artefatos.length > 0
    ? dados.artefatos.map((a) => `- ${a}`).join("\n")
    : "- DFD (Documento de Formalização da Demanda)\n- ETP (Estudo Técnico Preliminar)\n- TR (Termo de Referência)\n- Matriz de Riscos";

  const corpo =
    `Olá, ${primeiroNome}. Sua demanda já foi enquadrada com sucesso! Os documentos necessários para a abertura do processo já estão disponíveis na plataforma. Vamos ao trabalho!\n\n` +
    `DADOS DO ENQUADRAMENTO:\n` +
    `--------------------------------------------------\n` +
    `Demanda: ${dados.numeroDemanda}\n` +
    `Superintendência: ${dados.superintendencia}\n` +
    `Modalidade Licitatória: ${dados.modalidadeNome}\n` +
    `Base Legal: ${dados.artigoLei}\n` +
    `${dados.numeroProcesso ? `Processo Administrativo Gerado: ${dados.numeroProcesso}\n` : ""}` +
    `Objeto: ${dados.objeto}\n\n` +
    `DOCUMENTOS DISPONIBILIZADOS:\n` +
    `${artefatosLista}\n\n` +
    `Link de Acesso: http://localhost:3000/tramitacao\n\n` +
    `Atenciosamente,\n` +
    `Coordenação Geral de Gestão (SG)\n` +
    `Superintendência de Gestão • Secretaria Municipal de Saúde`;

  return { assunto, corpo };
}

export function gerarLinkEmail(dados: DadosNotificacaoDemanda): string {
  const email = dados.servidorEmail || "hellywladi87@gmail.com";
  const { assunto, corpo } = gerarEmailDemanda(dados);
  return `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}
