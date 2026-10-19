// CATÁLOGO OFICIAL DE MODELOS DE ATOS E DOCUMENTOS ADMINISTRATIVOS
// Importado diretamente do SISTEMA LICITAÇÃO (C:\SISTEMA LICITAÇÃO\modelos)
// Total de modelos oficiais disponíveis: 128

export interface ModeloDocumentoProcesso {
  id: string;
  modalidade: string;
  categoriaPrincipal: string;
  subcategoria: string;
  ordem: number;
  titulo: string;
  tipoPeca: string;
  artigoLei: string;
  downloadUrl: string;
  tamanhoBytes: number;
}

export interface ModalidadeLicitacaoItem {
  id: string;
  alias: string;
  grupo: "LEI_14133" | "MROSC_13019" | "OUTROS";
  descricao: string;
  artigoBase: string;
}

export const MODALIDADES_LICITACAO: ModalidadeLicitacaoItem[] = [
  {
    "id": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "alias": "Registro de Preços - Aquisição",
    "grupo": "LEI_14133",
    "descricao": "Sistema de Registro de Preços para futuras e eventuais aquisições de bens e insumos da Saúde.",
    "artigoBase": "Art. 82 a 86 (Lei nº 14.133/2021)"
  },
  {
    "id": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - SERVIÇO",
    "alias": "Registro de Preços - Serviço",
    "grupo": "LEI_14133",
    "descricao": "Sistema de Registro de Preços para prestação de serviços continuados da Saúde.",
    "artigoBase": "Art. 82 a 86 (Lei nº 14.133/2021)"
  },
  {
    "id": "PREGÃO SEM REGISTRO DE PREÇOS",
    "alias": "Pregão sem Registro de Preços",
    "grupo": "LEI_14133",
    "descricao": "Contratação direta com entrega integral ou imediata via Pregão Eletrônico tradicional.",
    "artigoBase": "Art. 34 da Lei nº 14.133/2021"
  },
  {
    "id": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "alias": "Dispensa de Licitação - Aquisição (Art. 75, II)",
    "grupo": "LEI_14133",
    "descricao": "Contratação direta por valor reduzido para aquisição de materiais e insumos.",
    "artigoBase": "Art. 75, inciso II (Lei nº 14.133/2021)"
  },
  {
    "id": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "alias": "Dispensa de Licitação - Serviço (Art. 75, I e II)",
    "grupo": "LEI_14133",
    "descricao": "Contratação direta por valor reduzido para serviços e manutenções da Saúde.",
    "artigoBase": "Art. 75, inciso I e II (Lei nº 14.133/2021)"
  },
  {
    "id": "INEXIGIBILIDADE",
    "alias": "Inexigibilidade de Licitação (Art. 74)",
    "grupo": "LEI_14133",
    "descricao": "Inviabilidade de competição (fornecedor exclusivo, serviços técnicos de notória especialização).",
    "artigoBase": "Art. 74 da Lei nº 14.133/2021"
  },
  {
    "id": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "alias": "Contratação Emergencial - Aquisição",
    "grupo": "LEI_14133",
    "descricao": "Dispensa em razão de emergência ou urgência na saúde pública municipal.",
    "artigoBase": "Art. 75, inciso VIII (Lei nº 14.133/2021)"
  },
  {
    "id": "EMERGENCIAL - EMERGENCIAL DE SERVIÇO",
    "alias": "Contratação Emergencial - Serviço",
    "grupo": "LEI_14133",
    "descricao": "Dispensa em razão de emergência ou urgência em serviços essenciais de saúde.",
    "artigoBase": "Art. 75, inciso VIII (Lei nº 14.133/2021)"
  },
  {
    "id": "ADESÃO DE ATA",
    "alias": "Adesão de Ata (Carona)",
    "grupo": "LEI_14133",
    "descricao": "Aproveitamento de Ata de Registro de Preços gerenciada por outro órgão público.",
    "artigoBase": "Art. 86 da Lei nº 14.133/2021"
  },
  {
    "id": "CONTRATAÇÃO DE ATA",
    "alias": "Contratação de Ata",
    "grupo": "LEI_14133",
    "descricao": "Formalização contratual originada de Ata de Registro de Preços municipal.",
    "artigoBase": "Art. 89 a 95 (Lei nº 14.133/2021)"
  },
  {
    "id": "CONTRATAÇÃO DIRETA",
    "alias": "Contratação Direta Geral",
    "grupo": "LEI_14133",
    "descricao": "Instrução sumária de contratações diretas permitidas pela nova Lei de Licitações.",
    "artigoBase": "Art. 72 da Lei nº 14.133/2021"
  },
  {
    "id": "CREDENCIAMENTO (14.133-2021)",
    "alias": "Credenciamento de Prestadores de Saúde",
    "grupo": "LEI_14133",
    "descricao": "Procedimento auxiliar para credenciamento aberto de clínicas, laboratórios e médicos.",
    "artigoBase": "Art. 79 da Lei nº 14.133/2021"
  },
  {
    "id": "TERMO DE FOMENTO (13.019-2014)",
    "alias": "Termo de Fomento (MROSC - Lei 13.019/2014)",
    "grupo": "MROSC_13019",
    "descricao": "Parceria com Organizações da Sociedade Civil (OSC) proposta pelas entidades.",
    "artigoBase": "Art. 16 da Lei Federal nº 13.019/2014"
  },
  {
    "id": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "alias": "Termo de Colaboração (MROSC - Lei 13.019/2014)",
    "grupo": "MROSC_13019",
    "descricao": "Parceria com OSC para execução de planos propostos pela Secretaria Municipal de Saúde.",
    "artigoBase": "Art. 16 da Lei Federal nº 13.019/2014"
  },
  {
    "id": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "alias": "Chamamento Público (MROSC - Lei 13.019/2014)",
    "grupo": "MROSC_13019",
    "descricao": "Edital público de chamamento para seleção isonômica de OSCs parceiras.",
    "artigoBase": "Art. 24 da Lei Federal nº 13.019/2014"
  },
  {
    "id": "OFÍCIOS E MEMORANDOS",
    "alias": "Ofícios, Pareceres & Memorandos Oficiais",
    "grupo": "LEI_14133",
    "descricao": "Modelos padronizados de ofícios de reserva, empenho, anulação, pareceres de aceitação técnica e comunicações da SMS.",
    "artigoBase": "Atos e Comunicações Oficiais - SMS Arapiraca"
  }
];

export const MODELOS_DOCUMENTOS_LICITACAO: ModeloDocumentoProcesso[] = [
  {
    "id": "mod-1",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 - DFD - ADESÃO DE ATA",
    "tipoPeca": "DFD",
    "artigoLei": "Art. 12, VII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/01 - DFD - ADESÃO DE ATA.docx",
    "tamanhoBytes": 134038
  },
  {
    "id": "mod-2",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 - COTAÇÃO - ADESÃO DE ATA",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Lei Federal nº 14.133/2021",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/02 - COTAÇÃO - ADESÃO DE ATA.docx",
    "tamanhoBytes": 132399
  },
  {
    "id": "mod-3",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 - MATRIZ DE RISCO - ADESÃO DE ATA",
    "tipoPeca": "Matriz de Riscos",
    "artigoLei": "Art. 18, X e Art. 103 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/03 - MATRIZ DE RISCO - ADESÃO DE ATA.docx",
    "tamanhoBytes": 132850
  },
  {
    "id": "mod-4",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 - ETP  - ADESÃO DE ATA",
    "tipoPeca": "ETP",
    "artigoLei": "Art. 18 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/04 - ETP  - ADESÃO DE ATA.docx",
    "tamanhoBytes": 137463
  },
  {
    "id": "mod-5",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 5,
    "titulo": "05 - MEMO - ADESÃO DE ATA",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/05 - MEMO - ADESÃO DE ATA.docx",
    "tamanhoBytes": 131380
  },
  {
    "id": "mod-6",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 6,
    "titulo": "06 - DESPACHO DA SECRETÁRIA - ADESÃO DE ATA",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/06 - DESPACHO DA SECRETÁRIA - ADESÃO DE ATA.docx",
    "tamanhoBytes": 130277
  },
  {
    "id": "mod-7",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 7,
    "titulo": "07 - PORTARIA DO GESTOR - ADESÃO DE ATA",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/07 - PORTARIA DO GESTOR - ADESÃO DE ATA.docx",
    "tamanhoBytes": 131371
  },
  {
    "id": "mod-8",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 8,
    "titulo": "08 - OF AUTORIZAÇÃO PARA O PREFEITO - ADESÃO DE ATA",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/08 - OF AUTORIZAÇÃO PARA O PREFEITO - ADESÃO DE ATA.docx",
    "tamanhoBytes": 132670
  },
  {
    "id": "mod-9",
    "modalidade": "ADESÃO DE ATA",
    "categoriaPrincipal": "ADESÃO DE ATA",
    "subcategoria": "",
    "ordem": 9,
    "titulo": "09 - AUTORIZAÇÃO PREFEITO - ADESÃO DE ATA",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/ADESÃO DE ATA/09 - AUTORIZAÇÃO PREFEITO - ADESÃO DE ATA.docx",
    "tamanhoBytes": 130530
  },
  {
    "id": "mod-10",
    "modalidade": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "categoriaPrincipal": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 - OF AUTORIZAÇÃO DO PREFEITO - CHAMAMENTO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CHAMAMENTO PÚBLICO (13.019-2014)/01 - OF AUTORIZAÇÃO DO PREFEITO - CHAMAMENTO.docx",
    "tamanhoBytes": 131060
  },
  {
    "id": "mod-11",
    "modalidade": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "categoriaPrincipal": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 - AUTORIZAÇÃO - CHAMAMENTO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CHAMAMENTO PÚBLICO (13.019-2014)/02 - AUTORIZAÇÃO - CHAMAMENTO.docx",
    "tamanhoBytes": 130602
  },
  {
    "id": "mod-12",
    "modalidade": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "categoriaPrincipal": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 - Portaria de Criação da Comissão - CHAMAMENTO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 8º (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CHAMAMENTO PÚBLICO (13.019-2014)/03 - Portaria de Criação da Comissão - CHAMAMENTO.docx",
    "tamanhoBytes": 318601
  },
  {
    "id": "mod-13",
    "modalidade": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "categoriaPrincipal": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 - Minuta de chamamento - CHAMAMENTO",
    "tipoPeca": "Minuta Contratual / Parceria",
    "artigoLei": "Minuta Padronizada AGU/PGM",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CHAMAMENTO PÚBLICO (13.019-2014)/04 - Minuta de chamamento - CHAMAMENTO.docx",
    "tamanhoBytes": 136359
  },
  {
    "id": "mod-14",
    "modalidade": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "categoriaPrincipal": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "subcategoria": "",
    "ordem": 5,
    "titulo": "05 - OF ANALISE E PARECER - CHAMAMENTO",
    "tipoPeca": "Parecer / Análise Técnica",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CHAMAMENTO PÚBLICO (13.019-2014)/05 - OF ANALISE E PARECER - CHAMAMENTO.docx",
    "tamanhoBytes": 130833
  },
  {
    "id": "mod-15",
    "modalidade": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "categoriaPrincipal": "CHAMAMENTO PÚBLICO (13.019-2014)",
    "subcategoria": "",
    "ordem": 6,
    "titulo": "06 - EXTRATO DE HOMOLOGAÇÃO DO PREFEITO - CHAMAMENTO",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Lei Federal nº 14.133/2021",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CHAMAMENTO PÚBLICO (13.019-2014)/06 - EXTRATO DE HOMOLOGAÇÃO DO PREFEITO - CHAMAMENTO.docx",
    "tamanhoBytes": 318932
  },
  {
    "id": "mod-16",
    "modalidade": "CONTRATAÇÃO DE ATA",
    "categoriaPrincipal": "CONTRATAÇÃO DE ATA",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 OFÍCIO DISPONIBLIDADE DE RECURSO - CONTRATAÇÃO DE ATA",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DE ATA/01 OFÍCIO DISPONIBLIDADE DE RECURSO - CONTRATAÇÃO DE ATA.docx",
    "tamanhoBytes": 130250
  },
  {
    "id": "mod-17",
    "modalidade": "CONTRATAÇÃO DE ATA",
    "categoriaPrincipal": "CONTRATAÇÃO DE ATA",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 OFÍCIO AUTORIZAÇÃO - CONTRATAÇÃO DE ATA",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DE ATA/02 OFÍCIO AUTORIZAÇÃO - CONTRATAÇÃO DE ATA.docx",
    "tamanhoBytes": 134470
  },
  {
    "id": "mod-18",
    "modalidade": "CONTRATAÇÃO DE ATA",
    "categoriaPrincipal": "CONTRATAÇÃO DE ATA",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 AUTORIZAÇÃO DO PREFEITO - CONTRATAÇÃO DE ATA",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DE ATA/03 AUTORIZAÇÃO DO PREFEITO - CONTRATAÇÃO DE ATA.docx",
    "tamanhoBytes": 130768
  },
  {
    "id": "mod-19",
    "modalidade": "CONTRATAÇÃO DE ATA",
    "categoriaPrincipal": "CONTRATAÇÃO DE ATA",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 PORTARIA DO GESTOR - CONTRATAÇÃO DE ATA",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DE ATA/04 PORTARIA DO GESTOR - CONTRATAÇÃO DE ATA.docx",
    "tamanhoBytes": 131378
  },
  {
    "id": "mod-20",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 - SOLICITAÇÃO DA REQUERENTE - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Lei Federal nº 14.133/2021",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/01 - SOLICITAÇÃO DA REQUERENTE - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 9935
  },
  {
    "id": "mod-21",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 - DESPACHO PARA O NÚCLEO DE JUDICIALIZAÇÃO - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/02 - DESPACHO PARA O NÚCLEO DE JUDICIALIZAÇÃO - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 130375
  },
  {
    "id": "mod-22",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 - MEMO NÚCLEO DE JUDIC. - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/03 - MEMO NÚCLEO DE JUDIC. - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 126934
  },
  {
    "id": "mod-23",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 - PARECER SOCIAL - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Parecer / Análise Técnica",
    "artigoLei": "Lei Federal nº 14.133/2021",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/04 - PARECER SOCIAL - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 131371
  },
  {
    "id": "mod-24",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 5,
    "titulo": "05 - OFICIO DE AUTORIZAÇÃO - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/05 - OFICIO DE AUTORIZAÇÃO - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 131033
  },
  {
    "id": "mod-25",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 6,
    "titulo": "06 - AUTORIZAÇÃO DO PREFEITO - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/06 - AUTORIZAÇÃO DO PREFEITO - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 130334
  },
  {
    "id": "mod-26",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 7,
    "titulo": "07 - SOLICITAÇÃO DE RESERVA ORÇAMENTÁRIA - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Art. 72 (Lei 14.133/2021) e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/07 - SOLICITAÇÃO DE RESERVA ORÇAMENTÁRIA - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 130810
  },
  {
    "id": "mod-27",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 8,
    "titulo": "08 - SOLICITAÇÃO DE EMPENHO - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Art. 95 (Lei 14.133/2021) e Lei 4.320/1964",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/08 - SOLICITAÇÃO DE EMPENHO - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 318614
  },
  {
    "id": "mod-28",
    "modalidade": "CONTRATAÇÃO DIRETA",
    "categoriaPrincipal": "CONTRATAÇÃO DIRETA",
    "subcategoria": "",
    "ordem": 9,
    "titulo": "09 - SOLICITAÇÃO DE PARECER JURÍDICO - CONTRATAÇÃO DIRETA",
    "tipoPeca": "Parecer / Análise Técnica",
    "artigoLei": "Lei Federal nº 14.133/2021",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/CONTRATAÇÃO DIRETA/09 - SOLICITAÇÃO DE PARECER JURÍDICO - CONTRATAÇÃO DIRETA.docx",
    "tamanhoBytes": 130855
  },
  {
    "id": "mod-29",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 1,
    "titulo": "01 - DFD - DISPENSA AQUISIÇÃO",
    "tipoPeca": "DFD",
    "artigoLei": "Art. 12, VII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/01 - DFD - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 132372
  },
  {
    "id": "mod-30",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 2,
    "titulo": "02 - MEMO - DISPENSA AQUISIÇÃO",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/02 - MEMO - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 131142
  },
  {
    "id": "mod-31",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 3,
    "titulo": "03 - DESPACHO SECRETÁRIA - DISPENSA AQUISIÇÃO",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/03 - DESPACHO SECRETÁRIA - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 130465
  },
  {
    "id": "mod-32",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 4,
    "titulo": "04 - DESPACHO AUSÊNCIA DE ETP - DISPENSA AQUISIÇÃO",
    "tipoPeca": "ETP",
    "artigoLei": "Art. 18 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/04 - DESPACHO AUSÊNCIA DE ETP - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 130044
  },
  {
    "id": "mod-33",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 5,
    "titulo": "05 - TR - DISPENSA AQUISIÇÃO",
    "tipoPeca": "Termo de Referência (TR)",
    "artigoLei": "Art. 6º, XXIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/05 - TR - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 140334
  },
  {
    "id": "mod-34",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 6,
    "titulo": "06 - PORTARIA DO GESTOR - DISPENSA AQUISIÇÃO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/06 - PORTARIA DO GESTOR - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 130474
  },
  {
    "id": "mod-35",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 7,
    "titulo": "07 - OF AUTORIZAÇÃO DO PREFEITO - DISPENSA AQUISIÇÃO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/07 - OF AUTORIZAÇÃO DO PREFEITO - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 131081
  },
  {
    "id": "mod-36",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 8,
    "titulo": "08 - AUTORIZAÇÃO - DISPENSA AQUISIÇÃO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/08 - AUTORIZAÇÃO - DISPENSA AQUISIÇÃO.docx",
    "tamanhoBytes": 130022
  },
  {
    "id": "mod-37",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 9,
    "titulo": "09 - ORDEM DE FORNECIMENTO - DISPENSA AQUISIÇÃO_",
    "tipoPeca": "Ordem de Serviço/Fornecimento",
    "artigoLei": "Art. 95 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/09 - ORDEM DE FORNECIMENTO - DISPENSA AQUISIÇÃO_.docx",
    "tamanhoBytes": 132462
  },
  {
    "id": "mod-38",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE AQUISIÇÃO",
    "ordem": 10,
    "titulo": "10 - SOLICITAÇÃO DE PAGAMENTO - DISPENSA AQUISIÇÃO_",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Art. 141 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE AQUISIÇÃO/10 - SOLICITAÇÃO DE PAGAMENTO - DISPENSA AQUISIÇÃO_.docx",
    "tamanhoBytes": 42327
  },
  {
    "id": "mod-39",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 1,
    "titulo": "01 - DFD - DISPENSA SERVIÇO",
    "tipoPeca": "DFD",
    "artigoLei": "Art. 12, VII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/01 - DFD - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 132834
  },
  {
    "id": "mod-40",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 2,
    "titulo": "02- MEMO - DISPENSA SERVIÇO",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/02- MEMO - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 131004
  },
  {
    "id": "mod-41",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 3,
    "titulo": "03 - DESPACHO SECRETÁRIA - DISPENSA SERVIÇO",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/03 - DESPACHO SECRETÁRIA - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 130740
  },
  {
    "id": "mod-42",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 4,
    "titulo": "04 - DESPACHO AUSÊNCIA DE ETP - DISPENSA SERVIÇO",
    "tipoPeca": "ETP",
    "artigoLei": "Art. 18 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/04 - DESPACHO AUSÊNCIA DE ETP - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 130045
  },
  {
    "id": "mod-43",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 5,
    "titulo": "05 - TR - DISPENSA SERVIÇO",
    "tipoPeca": "Termo de Referência (TR)",
    "artigoLei": "Art. 6º, XXIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/05 - TR - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 141936
  },
  {
    "id": "mod-44",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 6,
    "titulo": "06 - PORTARIA DO GESTOR - DISPENSA SERVIÇO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/06 - PORTARIA DO GESTOR - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 130628
  },
  {
    "id": "mod-45",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 7,
    "titulo": "07 - OF AUTORIZAÇÃO DO PREFEITO - DISPENSA SERVIÇO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/07 - OF AUTORIZAÇÃO DO PREFEITO - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 130970
  },
  {
    "id": "mod-46",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 8,
    "titulo": "08 - AUTORIZAÇÃO - DISPENSA SERVIÇO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/08 - AUTORIZAÇÃO - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 130233
  },
  {
    "id": "mod-47",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 9,
    "titulo": "09 - ORDEM DE SERVIÇO - DISPENSA SERVIÇO",
    "tipoPeca": "Ordem de Serviço/Fornecimento",
    "artigoLei": "Art. 95 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/09 - ORDEM DE SERVIÇO - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 133613
  },
  {
    "id": "mod-48",
    "modalidade": "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    "categoriaPrincipal": "DISPENSA DE LICITAÇÃO",
    "subcategoria": "DISPENSA DE SERVIÇO",
    "ordem": 10,
    "titulo": "10 - SOLICITAÇÃO DE PAGAMENTO - DISPENSA SERVIÇO",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Art. 141 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/DISPENSA DE LICITAÇÃO/DISPENSA DE SERVIÇO/10 - SOLICITAÇÃO DE PAGAMENTO - DISPENSA SERVIÇO.docx",
    "tamanhoBytes": 42035
  },
  {
    "id": "mod-49",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 1,
    "titulo": "01 - DFD - EMERGENCIAL DE AQUISIÇÃO",
    "tipoPeca": "DFD",
    "artigoLei": "Art. 12, VII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/01 - DFD - EMERGENCIAL DE AQUISIÇÃO.docx",
    "tamanhoBytes": 133120
  },
  {
    "id": "mod-50",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 2,
    "titulo": "02 - MEMO - EMERGENCIAL DE AQUISIÇÃO",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/02 - MEMO - EMERGENCIAL DE AQUISIÇÃO.docx",
    "tamanhoBytes": 131916
  },
  {
    "id": "mod-51",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 3,
    "titulo": "03 - DESPACHO SECRETARIA - EMERGENCIAL DE AQUISIÇÃO",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/03 - DESPACHO SECRETARIA - EMERGENCIAL DE AQUISIÇÃO.docx",
    "tamanhoBytes": 130496
  },
  {
    "id": "mod-52",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 4,
    "titulo": "04 - DESPACHO AUSÊNCIA DE ETP - EMERGENCIAL DE AQUISIÇÃO",
    "tipoPeca": "ETP",
    "artigoLei": "Art. 18 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/04 - DESPACHO AUSÊNCIA DE ETP - EMERGENCIAL DE AQUISIÇÃO.docx",
    "tamanhoBytes": 130375
  },
  {
    "id": "mod-53",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 5,
    "titulo": "05 - TR - EMERGENCIAL DE AQUISIÇÃO",
    "tipoPeca": "Termo de Referência (TR)",
    "artigoLei": "Art. 6º, XXIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/05 - TR - EMERGENCIAL DE AQUISIÇÃO.docx",
    "tamanhoBytes": 142877
  },
  {
    "id": "mod-54",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 6,
    "titulo": "06 - INDICAÇÃO DE GESTOR",
    "tipoPeca": "Documento Oficial",
    "artigoLei": "Lei Federal nº 14.133/2021",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/06 - INDICAÇÃO DE GESTOR.docx",
    "tamanhoBytes": 130969
  },
  {
    "id": "mod-55",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 7,
    "titulo": "07 - OFÍCIO SMS_GAB_GP - EMERGENCIAL DE AQUISIÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/07 - OFÍCIO SMS_GAB_GP - EMERGENCIAL DE AQUISIÇÃO.docx",
    "tamanhoBytes": 131415
  },
  {
    "id": "mod-56",
    "modalidade": "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    "categoriaPrincipal": "EMERGENCIAL",
    "subcategoria": "EMERGENCIAL DE AQUISIÇÃO",
    "ordem": 8,
    "titulo": "08 - AUTORIZAÇÃO PREFEITO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/EMERGENCIAL/EMERGENCIAL DE AQUISIÇÃO/08 - AUTORIZAÇÃO PREFEITO.docx",
    "tamanhoBytes": 130502
  },
  {
    "id": "mod-57",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 - DFD - INEXIGIBILIDADE",
    "tipoPeca": "DFD",
    "artigoLei": "Art. 12, VII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/01 - DFD - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 448812
  },
  {
    "id": "mod-58",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 - ETP - INEXIGIBILIDADE",
    "tipoPeca": "ETP",
    "artigoLei": "Art. 18 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/02 - ETP - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 139478
  },
  {
    "id": "mod-59",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 - MEMO - INEXIGIBILIDADE",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/03 - MEMO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 131019
  },
  {
    "id": "mod-60",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 - DESPACHO SECRETÁRIA - INEXIGIBILIDADE",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/04 - DESPACHO SECRETÁRIA - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 130726
  },
  {
    "id": "mod-61",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 5,
    "titulo": "05 - JUSTIFICATIVA DA CONTRAT. DIRETA INEXIG. DE LICITAÇÃO - INEXIGIBILIDADE",
    "tipoPeca": "Justificativa Técnica",
    "artigoLei": "Art. 72, VIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/05 - JUSTIFICATIVA DA CONTRAT. DIRETA INEXIG. DE LICITAÇÃO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 131384
  },
  {
    "id": "mod-62",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 6,
    "titulo": "06 - TR  - INEXIGIBILIDADE",
    "tipoPeca": "Termo de Referência (TR)",
    "artigoLei": "Art. 6º, XXIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/06 - TR  - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 142411
  },
  {
    "id": "mod-63",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 7,
    "titulo": "07 - PORTARIA DE INDICAÇÃO DE GESTOR DE CONTRATO - INEXIGIBILIDADE",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/07 - PORTARIA DE INDICAÇÃO DE GESTOR DE CONTRATO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 132458
  },
  {
    "id": "mod-64",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 8,
    "titulo": "08- OF  AUTORIZAÇÃO DO PREFEITO - INEXIGIBILIDADE",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/08- OF  AUTORIZAÇÃO DO PREFEITO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 131871
  },
  {
    "id": "mod-65",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 9,
    "titulo": "09 - AUTORIZAÇÃO PREFEITO - INEXIGIBILIDADE",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/09 - AUTORIZAÇÃO PREFEITO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 130638
  },
  {
    "id": "mod-66",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 10,
    "titulo": "10 -ORDEM DE SERVIÇO - INEXIGIBILIDADE",
    "tipoPeca": "Ordem de Serviço/Fornecimento",
    "artigoLei": "Art. 95 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/10 -ORDEM DE SERVIÇO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 131851
  },
  {
    "id": "mod-67",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 11,
    "titulo": "11 - PARECER DE ACEITAÇÃO - INEXIGIBILIDADE",
    "tipoPeca": "Parecer / Análise Técnica",
    "artigoLei": "Lei Federal nº 14.133/2021",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/11 - PARECER DE ACEITAÇÃO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 130846
  },
  {
    "id": "mod-68",
    "modalidade": "INEXIGIBILIDADE",
    "categoriaPrincipal": "INEXIGIBILIDADE",
    "subcategoria": "",
    "ordem": 12,
    "titulo": "12 - OF SOLICITAÇÃO DE PAGAMENTO - INEXIGIBILIDADE",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 141 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/INEXIGIBILIDADE/12 - OF SOLICITAÇÃO DE PAGAMENTO - INEXIGIBILIDADE.docx",
    "tamanhoBytes": 139464
  },
  {
    "id": "mod-69",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 69,
    "titulo": "MEMO INFORMATIVO",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/MEMO INFORMATIVO.docx",
    "tamanhoBytes": 6591099
  },
  {
    "id": "mod-70",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 70,
    "titulo": "MEMO RESPOSTA",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/MEMO RESPOSTA.docx",
    "tamanhoBytes": 6138163
  },
  {
    "id": "mod-71",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 71,
    "titulo": "OFÍCIO ANULAÇÃO DE EMPENHO",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 95 (Lei 14.133/2021) e Lei 4.320/1964",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO ANULAÇÃO DE EMPENHO.docx",
    "tamanhoBytes": 5733369
  },
  {
    "id": "mod-72",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 72,
    "titulo": "OFÍCIO ANULAÇÃO DE RESERVA",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 72 (Lei 14.133/2021) e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO ANULAÇÃO DE RESERVA.docx",
    "tamanhoBytes": 6590210
  },
  {
    "id": "mod-73",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 73,
    "titulo": "OFÍCIO COMPLEMENTO DE EMPENHO",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 95 (Lei 14.133/2021) e Lei 4.320/1964",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO COMPLEMENTO DE EMPENHO.docx",
    "tamanhoBytes": 5733129
  },
  {
    "id": "mod-74",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 74,
    "titulo": "OFÍCIO COMPLEMENTO DE RESERVA",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 72 (Lei 14.133/2021) e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO COMPLEMENTO DE RESERVA.docx",
    "tamanhoBytes": 6590484
  },
  {
    "id": "mod-75",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 75,
    "titulo": "OFÍCIO CRÉDITO ADICIONAL POR ANULAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Lei Federal nº 4.320/1964 e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO CRÉDITO ADICIONAL POR ANULAÇÃO.docx",
    "tamanhoBytes": 6590501
  },
  {
    "id": "mod-76",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 76,
    "titulo": "OFÍCIO CRÉDITO ADICIONAL POR TRANSPOSIÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Lei Federal nº 4.320/1964 e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO CRÉDITO ADICIONAL POR TRANSPOSIÇÃO.docx",
    "tamanhoBytes": 6590501
  },
  {
    "id": "mod-77",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 77,
    "titulo": "OFÍCIO SOLICITAÇÃO DE EMPENHO",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 95 (Lei 14.133/2021) e Lei 4.320/1964",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO SOLICITAÇÃO DE EMPENHO.docx",
    "tamanhoBytes": 8509400
  },
  {
    "id": "mod-78",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 78,
    "titulo": "OFÍCIO SOLICITAÇÃO DE PAGAMENTO",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 141 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO SOLICITAÇÃO DE PAGAMENTO.docx",
    "tamanhoBytes": 6590322
  },
  {
    "id": "mod-79",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 79,
    "titulo": "OFÍCIO SOLICITAÇÃO DE RESERVA",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 72 (Lei 14.133/2021) e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/OFÍCIO SOLICITAÇÃO DE RESERVA.docx",
    "tamanhoBytes": 6589983
  },
  {
    "id": "mod-128",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 80,
    "titulo": "PARECER DE ACEITAÇÃO",
    "tipoPeca": "Parecer de Aceitação",
    "artigoLei": "Art. 140 (Lei nº 14.133/2021) - Recebimento e Aceite Definitivo",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/PARECER DE ACEITAÇÃO.docx",
    "tamanhoBytes": 133286
  },
  {
    "id": "mod-80",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 81,
    "titulo": "TIMBRE SAÚDE",
    "tipoPeca": "Timbre Oficial",
    "artigoLei": "Padrão Oficial Visual SMS Arapiraca",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/TIMBRE SAÚDE.docx",
    "tamanhoBytes": 226592
  },
  {
    "id": "mod-81",
    "modalidade": "OFÍCIOS E MEMORANDOS",
    "categoriaPrincipal": "OFÍCIOS E MEMORANDOS",
    "subcategoria": "",
    "ordem": 82,
    "titulo": "TIMBRE SG",
    "tipoPeca": "Timbre Oficial",
    "artigoLei": "Padrão Oficial Visual SMS Arapiraca",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/OFÍCIOS E MEMORANDOS/TIMBRE SG.docx",
    "tamanhoBytes": 207262
  },
  {
    "id": "mod-82",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 - DFD - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "DFD",
    "artigoLei": "Art. 12, VII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/01 - DFD - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 133577
  },
  {
    "id": "mod-83",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 - Análise de Risco - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "Matriz de Riscos",
    "artigoLei": "Art. 18, X e Art. 103 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/02 - Análise de Risco - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 132426
  },
  {
    "id": "mod-84",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 - ETP - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "ETP",
    "artigoLei": "Art. 18 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/03 - ETP - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 330158
  },
  {
    "id": "mod-85",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 - MEMO - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/04 - MEMO - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 131749
  },
  {
    "id": "mod-86",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 5,
    "titulo": "05 - DESPACHO SECRETÁRIA - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/05 - DESPACHO SECRETÁRIA - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 130620
  },
  {
    "id": "mod-87",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 6,
    "titulo": "06 - TR - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "Termo de Referência (TR)",
    "artigoLei": "Art. 6º, XXIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/06 - TR - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 336101
  },
  {
    "id": "mod-88",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 7,
    "titulo": "07 - PORTARIA GESTOR - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/07 - PORTARIA GESTOR - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 131141
  },
  {
    "id": "mod-89",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 8,
    "titulo": "08 - OF AUTORIZAÇÃO DO PREFEITO - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/08 - OF AUTORIZAÇÃO DO PREFEITO - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 319242
  },
  {
    "id": "mod-90",
    "modalidade": "PREGÃO SEM REGISTRO DE PREÇOS",
    "categoriaPrincipal": "PREGÃO SEM REGISTRO DE PREÇOS",
    "subcategoria": "",
    "ordem": 9,
    "titulo": "09 - AUTORIZAÇÃO - PREGÃO SEM REGISTRO DE PREÇO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/PREGÃO SEM REGISTRO DE PREÇOS/09 - AUTORIZAÇÃO - PREGÃO SEM REGISTRO DE PREÇO.docx",
    "tamanhoBytes": 130708
  },
  {
    "id": "mod-91",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 1,
    "titulo": "01 - DFD - RP AQUISIÇÃO",
    "tipoPeca": "DFD",
    "artigoLei": "Art. 12, VII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/01 - DFD - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 133155
  },
  {
    "id": "mod-92",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 2,
    "titulo": "02 - ANÁLISE DE RISCOS - RP AQUISIÇÃO",
    "tipoPeca": "Matriz de Riscos",
    "artigoLei": "Art. 18, X e Art. 103 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/02 - ANÁLISE DE RISCOS - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 131867
  },
  {
    "id": "mod-93",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 3,
    "titulo": "03 - ETP - RP AQUISIÇÃO",
    "tipoPeca": "ETP",
    "artigoLei": "Art. 18 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/03 - ETP - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 137050
  },
  {
    "id": "mod-94",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 4,
    "titulo": "04 - MEMO - RP AQUISIÇÃO",
    "tipoPeca": "Memorando de Comunicação",
    "artigoLei": "Comunicação Interna SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/04 - MEMO - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 131418
  },
  {
    "id": "mod-95",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 5,
    "titulo": "05 - DESPACHO SECRETÁRIA - RP AQUISIÇÃO",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/05 - DESPACHO SECRETÁRIA - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 130408
  },
  {
    "id": "mod-96",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 6,
    "titulo": "06 - JUSTIFICATIVA IRP se só for itens para a SAÚDE - RP AQUISIÇÃO",
    "tipoPeca": "Justificativa Técnica",
    "artigoLei": "Art. 72, VIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/06 - JUSTIFICATIVA IRP se só for itens para a SAÚDE - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 130190
  },
  {
    "id": "mod-97",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 7,
    "titulo": "07 - TR  - RP AQUISIÇÃO",
    "tipoPeca": "Termo de Referência (TR)",
    "artigoLei": "Art. 6º, XXIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/07 - TR  - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 143403
  },
  {
    "id": "mod-98",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 8,
    "titulo": "08 - OF AUTORIZAÇÃO DO PREFEITO - RP AQUISIÇÃO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/08 - OF AUTORIZAÇÃO DO PREFEITO - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 130943
  },
  {
    "id": "mod-99",
    "modalidade": "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    "categoriaPrincipal": "REGISTRO DE PREÇOS",
    "subcategoria": "REGISTRO DE PREÇOS - AQUISIÇÃO",
    "ordem": 9,
    "titulo": "09 - AUTORIZAÇÃO - RP AQUISIÇÃO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/REGISTRO DE PREÇOS/REGISTRO DE PREÇOS - AQUISIÇÃO/09 - AUTORIZAÇÃO - RP AQUISIÇÃO.docx",
    "tamanhoBytes": 130600
  },
  {
    "id": "mod-100",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 - OF AUTORIZAÇÃO DO PREFEITO INICIAL -  TERMO DE COLABORAÇÃO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/01 - OF AUTORIZAÇÃO DO PREFEITO INICIAL -  TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 131409
  },
  {
    "id": "mod-101",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 - AUTORIZAÇÃO PREFEITO - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/02 - AUTORIZAÇÃO PREFEITO - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 130808
  },
  {
    "id": "mod-102",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 - OF. SMS.EXTER Nº  CONVOCAÇÃO - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/03 - OF. SMS.EXTER Nº  CONVOCAÇÃO - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 321265
  },
  {
    "id": "mod-103",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 - OF SOLICITAÇÃO DE RESERVA ORÇAMENTÁRIA - TERMO DE COLABORAÇÃO_",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 72 (Lei 14.133/2021) e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/04 - OF SOLICITAÇÃO DE RESERVA ORÇAMENTÁRIA - TERMO DE COLABORAÇÃO_.docx",
    "tamanhoBytes": 130962
  },
  {
    "id": "mod-104",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 5,
    "titulo": "05 - MINUTA - TERMO DE COLABORAÇÃO_",
    "tipoPeca": "Minuta Contratual / Parceria",
    "artigoLei": "Minuta Padronizada AGU/PGM",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/05 - MINUTA - TERMO DE COLABORAÇÃO_.docx",
    "tamanhoBytes": 144375
  },
  {
    "id": "mod-105",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 6,
    "titulo": "06 - OF ANALISE E PARECER - TERMO DE COLABORAÇÃO_",
    "tipoPeca": "Parecer / Análise Técnica",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/06 - OF ANALISE E PARECER - TERMO DE COLABORAÇÃO_.docx",
    "tamanhoBytes": 131549
  },
  {
    "id": "mod-106",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 7,
    "titulo": "07 - OF AUTORIZAÇÃO DO PREFEITO FINAL- TERMO DE COLABORAÇÃO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/07 - OF AUTORIZAÇÃO DO PREFEITO FINAL- TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 131469
  },
  {
    "id": "mod-107",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 8,
    "titulo": "08 - AUTORIZAÇÃO DO PREFEITO FINAL- TERMO DE COLABORAÇÃO_",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/08 - AUTORIZAÇÃO DO PREFEITO FINAL- TERMO DE COLABORAÇÃO_.docx",
    "tamanhoBytes": 130952
  },
  {
    "id": "mod-108",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 9,
    "titulo": "09 - Portaria  Indicação do Gestor - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/09 - Portaria  Indicação do Gestor - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 130638
  },
  {
    "id": "mod-109",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 10,
    "titulo": "10 - Portaria   Criação da Comissão - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 8º (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/10 - Portaria   Criação da Comissão - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 318677
  },
  {
    "id": "mod-110",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 11,
    "titulo": "11 - OF SOLICITAÇÃO DE EMPENHO - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 95 (Lei 14.133/2021) e Lei 4.320/1964",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/11 - OF SOLICITAÇÃO DE EMPENHO - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 131442
  },
  {
    "id": "mod-111",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 12,
    "titulo": "12 - JUSTIFICATIVA PREFEITO - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Justificativa Técnica",
    "artigoLei": "Art. 72, VIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/12 - JUSTIFICATIVA PREFEITO - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 130735
  },
  {
    "id": "mod-112",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 112,
    "titulo": "ANEXO I  AO OF 03- PLANO DE TRABALHO - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Plano de Trabalho",
    "artigoLei": "Art. 22 (Lei 13.019/2014)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/ANEXO I  AO OF 03- PLANO DE TRABALHO - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 1087056
  },
  {
    "id": "mod-113",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 113,
    "titulo": "ANEXO II AO OF 03 - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/ANEXO II AO OF 03 - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 318662
  },
  {
    "id": "mod-114",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 114,
    "titulo": "ANEXO III AO OF 03 - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/ANEXO III AO OF 03 - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 316809
  },
  {
    "id": "mod-115",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 115,
    "titulo": "ANEXO IV AO OF 03 - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/ANEXO IV AO OF 03 - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 316745
  },
  {
    "id": "mod-116",
    "modalidade": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE COLABORAÇÃO (13.019-2014)",
    "subcategoria": "",
    "ordem": 116,
    "titulo": "ANEXO V AO OF 03 - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE COLABORAÇÃO (13.019-2014)/ANEXO V AO OF 03 - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 316994
  },
  {
    "id": "mod-117",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 1,
    "titulo": "01 - DECLARAÇÃO DE RECEBIMENTO DO PLANO DE TRABALHO - TERMO DE FOMENTO",
    "tipoPeca": "Plano de Trabalho",
    "artigoLei": "Art. 22 (Lei 13.019/2014)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/01 - DECLARAÇÃO DE RECEBIMENTO DO PLANO DE TRABALHO - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 130589
  },
  {
    "id": "mod-118",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 2,
    "titulo": "02 - DESPACHO SECRETÁRIA - TERMO DE FOMENTO",
    "tipoPeca": "Despacho Administrativo",
    "artigoLei": "Regulamento Geral SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/02 - DESPACHO SECRETÁRIA - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 130676
  },
  {
    "id": "mod-119",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 3,
    "titulo": "03 -OF SOLICITAÇÃO  AO PREFEITO - TERMO DE FOMENTO",
    "tipoPeca": "Ofício",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/03 -OF SOLICITAÇÃO  AO PREFEITO - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 131259
  },
  {
    "id": "mod-120",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 4,
    "titulo": "04 - AUTORIZAÇÃO PARA PROSSEGUIMENTO - TERMO DE FOMENTO",
    "tipoPeca": "Autorização da Autoridade",
    "artigoLei": "Art. 72 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/04 - AUTORIZAÇÃO PARA PROSSEGUIMENTO - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 50583
  },
  {
    "id": "mod-121",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 5,
    "titulo": "05 - PORTARIA DO GESTOR - TERMO DE FOMENTO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 117 (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/05 - PORTARIA DO GESTOR - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 130625
  },
  {
    "id": "mod-122",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 6,
    "titulo": "06 - PORTARIA CRIAÇÃO COMISSÃO - TERMO DE FOMENTO",
    "tipoPeca": "Portaria",
    "artigoLei": "Art. 8º (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/06 - PORTARIA CRIAÇÃO COMISSÃO - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 318647
  },
  {
    "id": "mod-123",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 7,
    "titulo": "07 - MINUTA - TERMO DE FOMENTO",
    "tipoPeca": "Minuta Contratual / Parceria",
    "artigoLei": "Minuta Padronizada AGU/PGM",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/07 - MINUTA - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 56082
  },
  {
    "id": "mod-124",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 8,
    "titulo": "08- OF ANALISE E PARECER - TERMO DE FOMENTO",
    "tipoPeca": "Parecer / Análise Técnica",
    "artigoLei": "Comunicação Oficial SMS",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/08- OF ANALISE E PARECER - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 131335
  },
  {
    "id": "mod-125",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 9,
    "titulo": "09 - OF SOLICITAÇÃO DE RESERVA ORÇAMENTÁRIA - TERMO DE FOMENTO",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 72 (Lei 14.133/2021) e LRF",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/09 - OF SOLICITAÇÃO DE RESERVA ORÇAMENTÁRIA - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 131287
  },
  {
    "id": "mod-126",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 10,
    "titulo": "10 - OF SOLICITAÇÃO DE EMPENHO - TERMO DE COLABORAÇÃO",
    "tipoPeca": "Ofício",
    "artigoLei": "Art. 95 (Lei 14.133/2021) e Lei 4.320/1964",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/10 - OF SOLICITAÇÃO DE EMPENHO - TERMO DE COLABORAÇÃO.docx",
    "tamanhoBytes": 131154
  },
  {
    "id": "mod-127",
    "modalidade": "TERMO DE FOMENTO (13.019-2014)",
    "categoriaPrincipal": "TERMO DE FOMENTO (13.019-2014)",
    "subcategoria": "",
    "ordem": 11,
    "titulo": "11 - JUSTIFICATIVA DE INEXIGIBILIDADE - TERMO DE FOMENTO",
    "tipoPeca": "Justificativa Técnica",
    "artigoLei": "Art. 72, VIII (Lei 14.133/2021)",
    "downloadUrl": "/modelos/01 Modelos de Atos Administrativos/TERMO DE FOMENTO (13.019-2014)/11 - JUSTIFICATIVA DE INEXIGIBILIDADE - TERMO DE FOMENTO.docx",
    "tamanhoBytes": 131133
  }
];

export const MODELOS_LICITACAO_CATALOG: ModeloDocumentoProcesso[] = MODELOS_DOCUMENTOS_LICITACAO;

// Funções Utilitárias para consulta do Catálogo Oficial
export function obterModelosPorModalidade(modalidadeIdOuNome?: string): ModeloDocumentoProcesso[] {
  if (!modalidadeIdOuNome) return MODELOS_LICITACAO_CATALOG;
  const termoNorm = modalidadeIdOuNome.toLowerCase().trim();
  const exato = MODELOS_LICITACAO_CATALOG.filter(
    (m: ModeloDocumentoProcesso) => m.modalidade.toLowerCase() === termoNorm || m.categoriaPrincipal.toLowerCase() === termoNorm
  );
  if (exato.length > 0) return exato.sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);
  const porAlias = MODALIDADES_LICITACAO.find(
    (m: ModalidadeLicitacaoItem) => m.alias.toLowerCase() === termoNorm || m.id.toLowerCase() === termoNorm
  );
  if (porAlias) {
    const filtrados = MODELOS_LICITACAO_CATALOG.filter(
      (m: ModeloDocumentoProcesso) => m.modalidade.toLowerCase() === porAlias.id.toLowerCase() ||
             m.categoriaPrincipal.toLowerCase().includes(porAlias.alias.toLowerCase())
    );
    if (filtrados.length > 0) return filtrados.sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);
  }
  return MODELOS_LICITACAO_CATALOG.filter(
    (m: ModeloDocumentoProcesso) => m.modalidade.toLowerCase().includes(termoNorm) ||
           termoNorm.includes(m.modalidade.toLowerCase()) ||
           m.categoriaPrincipal.toLowerCase().includes(termoNorm)
  ).sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);
}

export function obterModalidadeInfo(modalidadeIdOuNome?: string): ModalidadeLicitacaoItem | undefined {
  if (!modalidadeIdOuNome) return undefined;
  const termoNorm = modalidadeIdOuNome.toLowerCase().trim();
  return MODALIDADES_LICITACAO.find(
    (m: ModalidadeLicitacaoItem) => m.id.toLowerCase() === termoNorm ||
           m.alias.toLowerCase() === termoNorm ||
           termoNorm.includes(m.alias.toLowerCase()) ||
           m.id.toLowerCase().includes(termoNorm)
  );
}

export function pesquisarModelos(termo: string, modalidade?: string): ModeloDocumentoProcesso[] {
  let base = modalidade ? obterModelosPorModalidade(modalidade) : MODELOS_LICITACAO_CATALOG;
  if (!termo.trim()) return base;
  const t = termo.toLowerCase().trim();
  return base.filter(
    (m: ModeloDocumentoProcesso) => m.titulo.toLowerCase().includes(t) ||
           m.tipoPeca.toLowerCase().includes(t) ||
           m.artigoLei.toLowerCase().includes(t) ||
           m.modalidade.toLowerCase().includes(t)
  ).sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);
}
