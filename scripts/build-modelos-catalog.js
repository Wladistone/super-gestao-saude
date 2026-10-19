const fs = require('fs');
const path = require('path');

const baseDir = 'c:/SUPER GESTÃO SAÚDE/public/modelos/01 Modelos de Atos Administrativos';

function getArtigoLei(nome) {
  const n = nome.toUpperCase();
  if (n.includes('DFD')) return 'Art. 12, VII (Lei 14.133/2021)';
  if (n.includes('ETP') || n.includes('ESTUDO')) return 'Art. 18 (Lei 14.133/2021)';
  if (n.includes('RISCO')) return 'Art. 18, X e Art. 103 (Lei 14.133/2021)';
  if (/\bTR\b/.test(n) || n.includes('TERMO DE REFER')) return 'Art. 6º, XXIII (Lei 14.133/2021)';
  if (n.includes('PORTARIA') && n.includes('GESTOR')) return 'Art. 117 (Lei 14.133/2021)';
  if (n.includes('PORTARIA') && n.includes('COMISS')) return 'Art. 8º (Lei 14.133/2021)';
  if (n.includes('JUSTIFICATIVA')) return 'Art. 72, VIII (Lei 14.133/2021)';
  if (n.includes('ORDEM DE')) return 'Art. 95 (Lei 14.133/2021)';
  if (n.includes('AUTORIZA')) return 'Art. 72 (Lei 14.133/2021)';
  if (n.includes('DESPACHO')) return 'Regulamento Geral SMS';
  if (n.includes('EMPENHO')) return 'Art. 95 (Lei 14.133/2021) e Lei 4.320/1964';
  if (n.includes('RESERVA')) return 'Art. 72 (Lei 14.133/2021) e LRF';
  if (n.includes('CRÉDITO') || n.includes('CREDITO')) return 'Lei Federal nº 4.320/1964 e LRF';
  if (n.includes('PAGAMENTO')) return 'Art. 141 (Lei 14.133/2021)';
  if (n.includes('TIMBRE')) return 'Padrão Oficial Visual SMS Arapiraca';
  if (n.includes('MEMO')) return 'Comunicação Interna SMS';
  if (n.includes('PLANO DE TRABALHO')) return 'Art. 22 (Lei 13.019/2014)';
  if (n.includes('MINUTA')) return 'Minuta Padronizada AGU/PGM';
  if (/\bOF\b/.test(n) || n.includes('OFÍCIO') || n.includes('OFICIO')) return 'Comunicação Oficial SMS';
  return 'Lei Federal nº 14.133/2021';
}

function getTipoPeca(nome) {
  const n = nome.toUpperCase();
  if (n.includes('DFD')) return 'DFD';
  if (n.includes('ETP')) return 'ETP';
  if (n.includes('RISCO')) return 'Matriz de Riscos';
  if (/\bTR\b/.test(n) || n.includes('TERMO DE REFER')) return 'Termo de Referência (TR)';
  if (n.includes('PORTARIA')) return 'Portaria';
  if (n.includes('JUSTIFICATIVA')) return 'Justificativa Técnica';
  if (n.includes('ORDEM DE')) return 'Ordem de Serviço/Fornecimento';
  if (n.includes('AUTORIZA')) return 'Autorização da Autoridade';
  if (n.includes('PARECER')) return 'Parecer / Análise Técnica';
  if (n.includes('DESPACHO')) return 'Despacho Administrativo';
  if (n.includes('MEMO')) return 'Memorando de Comunicação';
  if (n.includes('TIMBRE')) return 'Timbre Oficial';
  if (n.includes('MINUTA')) return 'Minuta Contratual / Parceria';
  if (n.includes('PLANO DE TRABALHO')) return 'Plano de Trabalho';
  if (/\bOF\b/.test(n) || n.includes('OFÍCIO') || n.includes('OFICIO')) return 'Ofício';
  return 'Documento Oficial';
}

function scanDir(dir, relPath = '') {
  let list = [];
  const entries = fs.readdirSync(dir);
  for (const item of entries) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    const rel = relPath ? relPath + '/' + item : item;
    if (stat.isDirectory()) {
      list = list.concat(scanDir(full, rel));
    } else if (item.endsWith('.docx') || item.endsWith('.doc')) {
      list.push({
        fileName: item,
        relPath: rel.replace(/\\/g, '/'),
        size: stat.size
      });
    }
  }
  return list;
}

const files = scanDir(baseDir);
console.log('Total files found:', files.length);

const catalog = files.map((f, index) => {
  const parts = f.relPath.split('/');
  let modalidadeNome = parts[0];
  let subcategoria = '';
  if (parts.length > 2) {
    subcategoria = parts[1];
    modalidadeNome = parts[0] + ' - ' + parts[1];
  }

  const numMatch = f.fileName.match(/^(\d+)/);
  const ordem = numMatch ? parseInt(numMatch[1], 10) : index + 1;
  const titulo = f.fileName.replace(/\.docx?$/i, '').trim();
  const downloadUrl = '/modelos/01 Modelos de Atos Administrativos/' + f.relPath;

  return {
    id: 'mod-' + (index + 1),
    modalidade: modalidadeNome,
    categoriaPrincipal: parts[0],
    subcategoria: subcategoria,
    ordem: ordem,
    titulo: titulo,
    tipoPeca: getTipoPeca(f.fileName),
    artigoLei: getArtigoLei(f.fileName),
    downloadUrl: downloadUrl,
    tamanhoBytes: f.size
  };
});

catalog.sort((a, b) => {
  if (a.modalidade !== b.modalidade) return a.modalidade.localeCompare(b.modalidade, 'pt-BR');
  return a.ordem - b.ordem;
});

const modalidades = [
  {
    id: "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - AQUISIÇÃO",
    alias: "Registro de Preços - Aquisição",
    grupo: "LEI_14133",
    descricao: "Sistema de Registro de Preços para futuras e eventuais aquisições de bens e insumos da Saúde.",
    artigoBase: "Art. 82 a 86 (Lei nº 14.133/2021)"
  },
  {
    id: "REGISTRO DE PREÇOS - REGISTRO DE PREÇOS - SERVIÇO",
    alias: "Registro de Preços - Serviço",
    grupo: "LEI_14133",
    descricao: "Sistema de Registro de Preços para prestação de serviços continuados da Saúde.",
    artigoBase: "Art. 82 a 86 (Lei nº 14.133/2021)"
  },
  {
    id: "PREGÃO SEM REGISTRO DE PREÇOS",
    alias: "Pregão sem Registro de Preços",
    grupo: "LEI_14133",
    descricao: "Contratação direta com entrega integral ou imediata via Pregão Eletrônico tradicional.",
    artigoBase: "Art. 34 da Lei nº 14.133/2021"
  },
  {
    id: "DISPENSA DE LICITAÇÃO - DISPENSA DE AQUISIÇÃO",
    alias: "Dispensa de Licitação - Aquisição (Art. 75, II)",
    grupo: "LEI_14133",
    descricao: "Contratação direta por valor reduzido para aquisição de materiais e insumos.",
    artigoBase: "Art. 75, inciso II (Lei nº 14.133/2021)"
  },
  {
    id: "DISPENSA DE LICITAÇÃO - DISPENSA DE SERVIÇO",
    alias: "Dispensa de Licitação - Serviço (Art. 75, I e II)",
    grupo: "LEI_14133",
    descricao: "Contratação direta por valor reduzido para serviços e manutenções da Saúde.",
    artigoBase: "Art. 75, inciso I e II (Lei nº 14.133/2021)"
  },
  {
    id: "INEXIGIBILIDADE",
    alias: "Inexigibilidade de Licitação (Art. 74)",
    grupo: "LEI_14133",
    descricao: "Inviabilidade de competição (fornecedor exclusivo, serviços técnicos de notória especialização).",
    artigoBase: "Art. 74 da Lei nº 14.133/2021"
  },
  {
    id: "EMERGENCIAL - EMERGENCIAL DE AQUISIÇÃO",
    alias: "Contratação Emergencial - Aquisição",
    grupo: "LEI_14133",
    descricao: "Dispensa em razão de emergência ou urgência na saúde pública municipal.",
    artigoBase: "Art. 75, inciso VIII (Lei nº 14.133/2021)"
  },
  {
    id: "EMERGENCIAL - EMERGENCIAL DE SERVIÇO",
    alias: "Contratação Emergencial - Serviço",
    grupo: "LEI_14133",
    descricao: "Dispensa em razão de emergência ou urgência em serviços essenciais de saúde.",
    artigoBase: "Art. 75, inciso VIII (Lei nº 14.133/2021)"
  },
  {
    id: "ADESÃO DE ATA",
    alias: "Adesão de Ata (Carona)",
    grupo: "LEI_14133",
    descricao: "Aproveitamento de Ata de Registro de Preços gerenciada por outro órgão público.",
    artigoBase: "Art. 86 da Lei nº 14.133/2021"
  },
  {
    id: "CONTRATAÇÃO DE ATA",
    alias: "Contratação de Ata",
    grupo: "LEI_14133",
    descricao: "Formalização contratual originada de Ata de Registro de Preços municipal.",
    artigoBase: "Art. 89 a 95 (Lei nº 14.133/2021)"
  },
  {
    id: "CONTRATAÇÃO DIRETA",
    alias: "Contratação Direta Geral",
    grupo: "LEI_14133",
    descricao: "Instrução sumária de contratações diretas permitidas pela nova Lei de Licitações.",
    artigoBase: "Art. 72 da Lei nº 14.133/2021"
  },
  {
    id: "CREDENCIAMENTO (14.133-2021)",
    alias: "Credenciamento de Prestadores de Saúde",
    grupo: "LEI_14133",
    descricao: "Procedimento auxiliar para credenciamento aberto de clínicas, laboratórios e médicos.",
    artigoBase: "Art. 79 da Lei nº 14.133/2021"
  },
  {
    id: "TERMO DE FOMENTO (13.019-2014)",
    alias: "Termo de Fomento (MROSC - Lei 13.019/2014)",
    grupo: "MROSC_13019",
    descricao: "Parceria com Organizações da Sociedade Civil (OSC) proposta pelas entidades.",
    artigoBase: "Art. 16 da Lei Federal nº 13.019/2014"
  },
  {
    id: "TERMO DE COLABORAÇÃO (13.019-2014)",
    alias: "Termo de Colaboração (MROSC - Lei 13.019/2014)",
    grupo: "MROSC_13019",
    descricao: "Parceria com OSC para execução de planos propostos pela Secretaria Municipal de Saúde.",
    artigoBase: "Art. 16 da Lei Federal nº 13.019/2014"
  },
  {
    id: "CHAMAMENTO PÚBLICO (13.019-2014)",
    alias: "Chamamento Público (MROSC - Lei 13.019/2014)",
    grupo: "MROSC_13019",
    descricao: "Edital público de chamamento para seleção isonômica de OSCs parceiras.",
    artigoBase: "Art. 24 da Lei Federal nº 13.019/2014"
  },
  {
    id: "OFÍCIOS E MEMORANDOS",
    alias: "Ofícios & Memorandos Oficiais",
    grupo: "LEI_14133",
    descricao: "Modelos padronizados de ofícios de reserva, empenho, anulação, créditos e comunicações da SMS.",
    artigoBase: "Atos e Comunicações Oficiais - SMS Arapiraca"
  }
];

const tsLines = [
  "// CATÁLOGO OFICIAL DE MODELOS DE ATOS E DOCUMENTOS ADMINISTRATIVOS",
  "// Importado diretamente do SISTEMA LICITAÇÃO (C:\\SISTEMA LICITAÇÃO\\modelos)",
  `// Total de modelos oficiais disponíveis: ${catalog.length}`,
  "",
  "export interface ModeloDocumentoProcesso {",
  "  id: string;",
  "  modalidade: string;",
  "  categoriaPrincipal: string;",
  "  subcategoria: string;",
  "  ordem: number;",
  "  titulo: string;",
  "  tipoPeca: string;",
  "  artigoLei: string;",
  "  downloadUrl: string;",
  "  tamanhoBytes: number;",
  "}",
  "",
  "export interface ModalidadeLicitacaoItem {",
  "  id: string;",
  "  alias: string;",
  '  grupo: "LEI_14133" | "MROSC_13019" | "OUTROS";',
  "  descricao: string;",
  "  artigoBase: string;",
  "}",
  "",
  `export const MODALIDADES_LICITACAO: ModalidadeLicitacaoItem[] = ${JSON.stringify(modalidades, null, 2)};`,
  "",
  `export const MODELOS_DOCUMENTOS_LICITACAO: ModeloDocumentoProcesso[] = ${JSON.stringify(catalog, null, 2)};`,
  "",
  "export const MODELOS_LICITACAO_CATALOG: ModeloDocumentoProcesso[] = MODELOS_DOCUMENTOS_LICITACAO;",
  "",
  "// Funções Utilitárias para consulta do Catálogo Oficial",
  "export function obterModelosPorModalidade(modalidadeIdOuNome?: string): ModeloDocumentoProcesso[] {",
  "  if (!modalidadeIdOuNome) return MODELOS_LICITACAO_CATALOG;",
  "  const termoNorm = modalidadeIdOuNome.toLowerCase().trim();",
  "  const exato = MODELOS_LICITACAO_CATALOG.filter(",
  "    (m: ModeloDocumentoProcesso) => m.modalidade.toLowerCase() === termoNorm || m.categoriaPrincipal.toLowerCase() === termoNorm",
  "  );",
  "  if (exato.length > 0) return exato.sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);",
  "  const porAlias = MODALIDADES_LICITACAO.find(",
  "    (m: ModalidadeLicitacaoItem) => m.alias.toLowerCase() === termoNorm || m.id.toLowerCase() === termoNorm",
  "  );",
  "  if (porAlias) {",
  "    const filtrados = MODELOS_LICITACAO_CATALOG.filter(",
  "      (m: ModeloDocumentoProcesso) => m.modalidade.toLowerCase() === porAlias.id.toLowerCase() ||",
  "             m.categoriaPrincipal.toLowerCase().includes(porAlias.alias.toLowerCase())",
  "    );",
  "    if (filtrados.length > 0) return filtrados.sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);",
  "  }",
  "  return MODELOS_LICITACAO_CATALOG.filter(",
  "    (m: ModeloDocumentoProcesso) => m.modalidade.toLowerCase().includes(termoNorm) ||",
  "           termoNorm.includes(m.modalidade.toLowerCase()) ||",
  "           m.categoriaPrincipal.toLowerCase().includes(termoNorm)",
  "  ).sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);",
  "}",
  "",
  "export function obterModalidadeInfo(modalidadeIdOuNome?: string): ModalidadeLicitacaoItem | undefined {",
  "  if (!modalidadeIdOuNome) return undefined;",
  "  const termoNorm = modalidadeIdOuNome.toLowerCase().trim();",
  "  return MODALIDADES_LICITACAO.find(",
  "    (m: ModalidadeLicitacaoItem) => m.id.toLowerCase() === termoNorm ||",
  "           m.alias.toLowerCase() === termoNorm ||",
  "           termoNorm.includes(m.alias.toLowerCase()) ||",
  "           m.id.toLowerCase().includes(termoNorm)",
  "  );",
  "}",
  "",
  "export function pesquisarModelos(termo: string, modalidade?: string): ModeloDocumentoProcesso[] {",
  "  let base = modalidade ? obterModelosPorModalidade(modalidade) : MODELOS_LICITACAO_CATALOG;",
  "  if (!termo.trim()) return base;",
  "  const t = termo.toLowerCase().trim();",
  "  return base.filter(",
  "    (m: ModeloDocumentoProcesso) => m.titulo.toLowerCase().includes(t) ||",
  "           m.tipoPeca.toLowerCase().includes(t) ||",
  "           m.artigoLei.toLowerCase().includes(t) ||",
  "           m.modalidade.toLowerCase().includes(t)",
  "  ).sort((a: ModeloDocumentoProcesso, b: ModeloDocumentoProcesso) => a.ordem - b.ordem);",
  "}",
  ""
];

fs.writeFileSync('c:/SUPER GESTÃO SAÚDE/src/data/modelos-licitacao-catalog.ts', tsLines.join('\n'), 'utf8');
console.log('Successfully written src/data/modelos-licitacao-catalog.ts with', catalog.length, 'models!');
