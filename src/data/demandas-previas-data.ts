// DADOS E ESTRUTURAS DE TRAMITAÇÃO ENTRE SUPERINTENDÊNCIAS E A SUPERINTENDÊNCIA DE GESTÃO (SG)
// Governança: SAS, SUVIG, SGTES, SURCAA submetem a demanda com itens e quantidades,
// e apenas a SUPERINTENDÊNCIA DE GESTÃO (SG) possui a competência exclusiva de indicar
// e fixar a modalidade licitatória (Lei nº 14.133/2021 e MROSC 13.019/2014).

import { DemandaPreviaProcesso, SuperintendenciaSigla } from "@/lib/types";

export interface EstruturaSuperintendencia {
  sigla: SuperintendenciaSigla;
  nome: string;
  descricao: string;
  corBadge: string;
  coordenacoes: string[];
}

export interface ServidorSMS {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  superintendencia: SuperintendenciaSigla;
  superintendenciaNome: string;
  coordenacao: string;
  avatarIniciais: string;
  papel: string;
  isSG: boolean;
}

export const SERVIDORES_SMS: ServidorSMS[] = [
  {
    id: "usr-coord-geral",
    nome: "Dra. Willianne Soares",
    cargo: "Coordenadora Geral de Gestão",
    email: "will2026@gmail.com",
    superintendencia: "SG",
    superintendenciaNome: "Superintendência de Gestão",
    coordenacao: "Coordenação Geral de Gestão (SG)",
    avatarIniciais: "WS",
    papel: "Competência Exclusiva de Enquadramento Licitatório (Lei 14.133/2021)",
    isSG: true,
  },
];

export const SUPERINTENDENCIAS_SMS: EstruturaSuperintendencia[] = [
  {
    sigla: "SAS",
    nome: "Superintendência de Atenção à Saúde",
    descricao: "Coordena a Atenção Primária (UBSs), Média e Alta Complexidade, Urgências (UPAs) e Assistência Farmacêutica.",
    corBadge: "bg-blue-100 text-blue-800 border-blue-200",
    coordenacoes: [
      "Coordenação de Atenção Primária à Saúde (CAPS)",
      "Coordenação de Média e Alta Complexidade (CMAC)",
      "Coordenação de Assistência Farmacêutica e Insumos (CAF)",
      "Coordenação de Urgência e Emergência (UPAs)",
      "Coordenação de Saúde Mental (CAPS I, II e Infantil)",
      "Coordenação de Saúde Bucal",
    ],
  },
  {
    sigla: "SUVIG",
    nome: "Superintendência de Vigilância em Saúde",
    descricao: "Responsável pelo monitoramento epidemiológico, sanitário, ambiental, zoonoses e saúde do trabalhador.",
    corBadge: "bg-amber-100 text-amber-800 border-amber-200",
    coordenacoes: [
      "Coordenação de Vigilância Epidemiológica (CVE)",
      "Coordenação de Vigilância Sanitária (VISA)",
      "Coordenação de Vigilância Ambiental e Controle de Zoonoses (CVAZ)",
      "Coordenação de Saúde do Trabalhador (CEREST)",
      "Coordenação de Imunização e Rede de Frio",
    ],
  },
  {
    sigla: "SGTES",
    nome: "Superintendência de Gestão do Trabalho e Educação em Saúde",
    descricao: "Gerencia a força de trabalho do SUS, capacitação contínua, estágios, residências e desenvolvimento humano.",
    corBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    coordenacoes: [
      "Coordenação de Educação Permanente em Saúde (ETSUS)",
      "Coordenação de Gestão de Pessoas e Desenvolvimento (CGP)",
      "Coordenação de Residência Médica e Multiprofissional (COREME)",
      "Coordenação de Saúde Ocupacional e Bem-Estar do Servidor",
    ],
  },
  {
    sigla: "SURCAA",
    nome: "Superintendência de Regulação, Controle, Auditoria e Avaliação",
    descricao: "Coordena o complexo regulador de leitos, consultas/exames, TFD e faturamento SIA/SIH-SUS.",
    corBadge: "bg-purple-100 text-purple-800 border-purple-200",
    coordenacoes: [
      "Complexo Regulador Municipal (Regulação de Leitos e Consultas Especializadas)",
      "Coordenação de Tratamento Fora do Domicílio (TFD)",
      "Coordenação de Controle, Avaliação e Auditoria do SUS (CCAA)",
      "Coordenação de Processamento e Faturamento SUS (SIA/SIH)",
    ],
  },
  {
    sigla: "SG",
    nome: "Superintendência de Gestão (Competência Exclusiva de Enquadramento)",
    descricao: "Órgão central de governança, compras, licitações, contratos e finanças com competência exclusiva de enquadramento licitatório.",
    corBadge: "bg-sky-100 text-sky-900 border-sky-300 font-bold",
    coordenacoes: [
      "Departamento de Compras e Licitações (CPL / DCL)",
      "Divisão de Gestão e Planejamento de Contratações",
      "Assessoria Jurídica da Saúde (ASJUR)",
      "Divisão de Contratos e Convênios",
    ],
  },
];

export const INITIAL_DEMANDAS_PREVIAS: DemandaPreviaProcesso[] = [];

