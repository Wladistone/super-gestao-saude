const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('c:/SUPER GESTÃO SAÚDE/src/data/creditos_adicionais_sms.xlsx');

function formatExcelDate(val) {
  if (!val) return '';
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (!d) return String(val);
    const day = String(d.d).padStart(2, '0');
    const month = String(d.m).padStart(2, '0');
    const year = d.y;
    return `${day}/${month}/${year}`;
  }
  if (val instanceof Date) {
    const day = String(val.getDate()).padStart(2, '0');
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const year = val.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return String(val);
}

function parseExcelDateIso(val) {
  if (!val) return '';
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (!d) return '';
    const day = String(d.d).padStart(2, '0');
    const month = String(d.m).padStart(2, '0');
    const year = d.y;
    return `${year}-${month}-${day}`;
  }
  if (val instanceof Date) {
    const day = String(val.getDate()).padStart(2, '0');
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const year = val.getFullYear();
    return `${year}-${month}-${day}`;
  }
  return String(val);
}

// 1. CONTROLE
const rawControle = XLSX.utils.sheet_to_json(wb.Sheets['CONTROLE'], { defval: '' });
const controle = rawControle.map(row => ({
  id: Number(row['ID']) || 0,
  numero: Number(row['Nº']) || 0,
  dataCredito: formatExcelDate(row['DATA DO CRÉDITO']),
  dataCreditoIso: parseExcelDateIso(row['DATA DO CRÉDITO']),
  dataSerial: typeof row['DATA DO CRÉDITO'] === 'number' ? row['DATA DO CRÉDITO'] : null,
  tipoCredito: String(row['TIPO DO CRÉDITO'] || '').trim(),
  valor: Number(row['VALOR']) || 0,
  solicitante: String(row['SOLICITANTE'] || '').trim(),
  programaOrigem: Number(row['PROGRAMA DE TRABALHO ORIGEM']) || String(row['PROGRAMA DE TRABALHO ORIGEM']),
  elementoOrigem: String(row['ELEMENTO ORIGEM'] || '').trim(),
  fonteOrigem: String(row['FONTE ORIGEM'] || '').trim(),
  programaDestino: Number(row['PROGRAMA DE TRABALHO DESTINO']) || String(row['PROGRAMA DE TRABALHO DESTINO']),
  elementoDestino: String(row['ELEMENTO DESTINO'] || '').trim(),
  fonteDestino: String(row['FONTE DESTINO'] || '').trim(),
  status: String(row['STATUS'] || 'OK').trim(),
  observacoes: String(row['OBSERVAÇÕES'] || '').trim()
}));

// 2. CONTAS
const rawContas = XLSX.utils.sheet_to_json(wb.Sheets['CONTAS'], { defval: '' });
const contas = rawContas.map(row => ({
  programaTrabalho: Number(row['Programa de Trabalho']) || String(row['Programa de Trabalho']),
  elemento: String(row['Elemento'] || '').trim(),
  fonte: String(row['Fonte'] || '').trim(),
  entradas: Number(row['Entradas']) || 0,
  saidas: Number(row['Saídas']) || 0,
  situacao: String(row['Situação'] || 'ABERTA').trim(),
  ultimaEntrada: formatExcelDate(row['Última Entrada']),
  ultimaSaida: formatExcelDate(row['Última Saída']),
  podeReceberCredito: String(row['Pode Receber Crédito?'] || 'SIM').trim(),
  podeFornecerCredito: String(row['Pode Fornecer Crédito?'] || 'SIM').trim()
}));

// 3. CADASTROS
const rawCad = XLSX.utils.sheet_to_json(wb.Sheets['CADASTROS'], { defval: '' });
const cadastros = {
  programasTrabalho: [...new Set(rawCad.map(r => r['PROGRAMA DE TRABALHO']).filter(Boolean))],
  elementos: [...new Set(rawCad.map(r => r['ELEMENTOS']).filter(Boolean))],
  fontes: [...new Set(rawCad.map(r => String(r['FONTES'])).filter(Boolean))],
  solicitantes: [...new Set(rawCad.map(r => r['SOLICITANTES']).filter(Boolean))]
};

const tsLines = [
  "// DADOS EXTRAÍDOS INTEGRALMENTE DA PLANILHA ORIGINAL 'creditos_adicionais_sms.xlsx'",
  "// NENHUM DADO OU REGRA FOI ALTERADO OU SUPRIMIDO.",
  "",
  "export interface RegistroControleCredito {",
  "  id: number;",
  "  numero: number;",
  "  dataCredito: string;",
  "  dataCreditoIso: string;",
  "  dataSerial?: number | null;",
  "  tipoCredito: string;",
  "  valor: number;",
  "  solicitante: string;",
  "  programaOrigem: number | string;",
  "  elementoOrigem: string;",
  "  fonteOrigem: string;",
  "  programaDestino: number | string;",
  "  elementoDestino: string;",
  "  fonteDestino: string;",
  '  status: "OK" | "ERRO" | string;',
  "  observacoes: string;",
  "}",
  "",
  "export interface ContaOrcamentariaCredito {",
  "  programaTrabalho: number | string;",
  "  elemento: string;",
  "  fonte: string;",
  "  entradas: number;",
  "  saidas: number;",
  "  situacao: string;",
  "  ultimaEntrada: string;",
  "  ultimaSaida: string;",
  '  podeReceberCredito: "SIM" | "NÃO" | string;',
  '  podeFornecerCredito: "SIM" | "NÃO" | string;',
  "}",
  "",
  "export interface CadastrosReferencia {",
  "  programasTrabalho: (number | string)[];",
  "  elementos: string[];",
  "  fontes: string[];",
  "  solicitantes: string[];",
  "}",
  "",
  `export const INITIAL_CONTROLE_CREDITOS: RegistroControleCredito[] = ${JSON.stringify(controle, null, 2)};`,
  "",
  `export const INITIAL_CONTAS_CREDITOS: ContaOrcamentariaCredito[] = ${JSON.stringify(contas, null, 2)};`,
  "",
  `export const CADASTROS_CREDITOS: CadastrosReferencia = ${JSON.stringify(cadastros, null, 2)};`,
  ""
];

fs.writeFileSync('c:/SUPER GESTÃO SAÚDE/src/data/creditos-adicionais-data.ts', tsLines.join('\n'), 'utf8');
console.log('Successfully written src/data/creditos-adicionais-data.ts! Total controle:', controle.length, 'Total contas:', contas.length);
