import * as XLSX from "xlsx";
import { ItemPCA, ItemEstimadoPCA, StatusPCA } from "./types";

// Normaliza nomes de colunas removendo acentos, pontuações e convertendo para minúsculas
function normalizarChave(chave: string): string {
  return (chave || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Converte valores monetários ou numéricos vindos de strings para number
function converterParaNumero(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim();
  // Remove "R$", espaços, pontos de milhar
  str = str.replace(/R\$\s*/gi, "").trim();
  // Se contiver vírgula como decimal (ex: 1.250,50 ou 250,50)
  if (str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export interface ResultadoParsePca {
  success: boolean;
  itens: ItemPCA[];
  totalContratacoes: number;
  totalItensEstimados: number;
  valorGlobal: number;
  mensagem: string;
}

/**
 * Faz a leitura automática e inteligente de arquivo Excel (.xlsx, .xls) ou CSV
 * Mapeando automaticamente colunas de DFD, código, categoria, objeto, itens, quantidades e valores.
 */
export async function parsearArquivoPCA(file: File, usuarioNome?: string): Promise<ResultadoParsePca> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Procura aba com nome PCA ou pega a primeira
        const sheetName =
          workbook.SheetNames.find((s) => s.toLowerCase().includes("pca")) ||
          workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          resolve({
            success: false,
            itens: [],
            totalContratacoes: 0,
            totalItensEstimados: 0,
            valorGlobal: 0,
            mensagem: "Nenhuma planilha ou dados válidos encontrados no arquivo.",
          });
          return;
        }

        // Converte a planilha para JSON de objetos brutos
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        if (!rows || rows.length === 0) {
          resolve({
            success: false,
            itens: [],
            totalContratacoes: 0,
            totalItensEstimados: 0,
            valorGlobal: 0,
            mensagem: "A planilha está vazia ou os cabeçalhos não foram reconhecidos.",
          });
          return;
        }

        // Mapa de agrupamento por DFD ou Código PCA
        const mapaAgrupamento = new Map<string, {
          numeroDFD: string;
          codigoItem: string;
          descricao: string;
          categoria: string;
          unidadeRequisitante: string;
          grauPrioridade: "ALTA" | "MEDIA" | "BAIXA";
          dataPrevisaoContratacao: string;
          status: StatusPCA;
          valorEstimadoDireto: number;
          itensEstimados: ItemEstimadoPCA[];
        }>();

        rows.forEach((row, index) => {
          // Normaliza todas as chaves da linha
          const normRow: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            normRow[normalizarChave(k)] = row[k];
          });

          // Detecta campos com sinônimos flexíveis
          const numeroDFD =
            normRow["dfd"] ||
            normRow["numero_dfd"] ||
            normRow["n_dfd"] ||
            normRow["no_dfd"] ||
            normRow["documento_formalizacao"] ||
            normRow["doc_formalizacao"] ||
            normRow["processo_dfd"] ||
            `DFD-${String(index + 1).padStart(3, "0")}`;

          const codigoItem =
            normRow["codigo"] ||
            normRow["codigo_pca"] ||
            normRow["cod_pca"] ||
            normRow["codigo_item"] ||
            normRow["item_pca"] ||
            normRow["id_pca"] ||
            `PCA-${String(mapaAgrupamento.size + 1).padStart(3, "0")}`;

          const categoria =
            normRow["categoria"] ||
            normRow["classe"] ||
            normRow["grupo"] ||
            normRow["tipo"] ||
            normRow["segmento"] ||
            "Medicamentos & Farmácia";

          const objeto =
            normRow["objeto"] ||
            normRow["objeto_contratacao"] ||
            normRow["descricao_objeto"] ||
            normRow["descricao"] ||
            normRow["especificacao_objeto"] ||
            normRow["denominacao"] ||
            normRow["contratacao"] ||
            "Contratação de Insumos da Saúde";

          const unidadeRequisitante =
            normRow["unidade"] ||
            normRow["unidade_requisitante"] ||
            normRow["setor"] ||
            normRow["superintendencia"] ||
            normRow["secretaria"] ||
            normRow["demandante"] ||
            "SAS";

          let grauPrioridade: "ALTA" | "MEDIA" | "BAIXA" = "ALTA";
          const prioStr = String(normRow["prioridade"] || normRow["grau_prioridade"] || "").toUpperCase();
          if (prioStr.includes("MED")) grauPrioridade = "MEDIA";
          else if (prioStr.includes("BAIX")) grauPrioridade = "BAIXA";

          const dataPrevisao =
            normRow["previsao"] ||
            normRow["data_previsao"] ||
            normRow["mes_previsao"] ||
            normRow["previsao_contratacao"] ||
            "";

          // Campos do item estimado da linha
          const descricaoItem =
            normRow["item_descricao"] ||
            normRow["descricao_item"] ||
            normRow["especificacao"] ||
            normRow["especificacao_item"] ||
            normRow["produto"] ||
            normRow["servico"] ||
            normRow["nome_item"] ||
            objeto;

          const unidadeMedida =
            normRow["unidade_medida"] ||
            normRow["unidade_fornecimento"] ||
            normRow["und"] ||
            normRow["un"] ||
            normRow["medida"] ||
            "Unidade";

          const quantidadeEstimada = converterParaNumero(
            normRow["quantidade"] ||
            normRow["quantidade_estimada"] ||
            normRow["qtd"] ||
            normRow["qtd_estimada"] ||
            normRow["quant"] ||
            1
          );

          const valorUnitarioEstimado = converterParaNumero(
            normRow["valor_unitario"] ||
            normRow["valor_unit"] ||
            normRow["vlr_unitario"] ||
            normRow["preco_unitario"] ||
            normRow["unitario"]
          );

          let valorTotalLinha = converterParaNumero(
            normRow["valor_total"] ||
            normRow["valor_total_estimado"] ||
            normRow["vlr_total"] ||
            normRow["preco_total"] ||
            normRow["valor_estimado"] ||
            normRow["total"]
          );

          if (valorTotalLinha === 0 && quantidadeEstimada > 0 && valorUnitarioEstimado > 0) {
            valorTotalLinha = quantidadeEstimada * valorUnitarioEstimado;
          }

          // Agrupa pela chave DFD ou pelo Código
          const chaveAgrupamento = String(numeroDFD || codigoItem).trim().toUpperCase();

          if (!mapaAgrupamento.has(chaveAgrupamento)) {
            mapaAgrupamento.set(chaveAgrupamento, {
              numeroDFD: String(numeroDFD).trim(),
              codigoItem: String(codigoItem).trim(),
              descricao: String(objeto).trim(),
              categoria: String(categoria).trim(),
              unidadeRequisitante: String(unidadeRequisitante).trim(),
              grauPrioridade,
              dataPrevisaoContratacao: String(dataPrevisao).trim(),
              status: "PLANEJADO",
              valorEstimadoDireto: valorTotalLinha,
              itensEstimados: [],
            });
          }

          const agrupado = mapaAgrupamento.get(chaveAgrupamento)!;
          agrupado.itensEstimados.push({
            id: `item-pca-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
            numeroItem: agrupado.itensEstimados.length + 1,
            descricao: String(descricaoItem).trim(),
            unidadeMedida: String(unidadeMedida).trim(),
            quantidadeEstimada: quantidadeEstimada > 0 ? quantidadeEstimada : 1,
            valorUnitarioEstimado: valorUnitarioEstimado > 0 ? valorUnitarioEstimado : (valorTotalLinha / (quantidadeEstimada || 1)),
            valorTotalEstimado: valorTotalLinha > 0 ? valorTotalLinha : (quantidadeEstimada * valorUnitarioEstimado),
          });
        });

        // Consolida o array final de ItemPCA
        const itensConsolidados: ItemPCA[] = [];
        let totalItensEstimadosContador = 0;
        let valorGlobalTotal = 0;

        mapaAgrupamento.forEach((grupo, idxChave) => {
          const somaValoresItens = grupo.itensEstimados.reduce(
            (acc, it) => acc + (it.valorTotalEstimado || 0),
            0
          );
          const valorFinal = somaValoresItens > 0 ? somaValoresItens : grupo.valorEstimadoDireto;
          const qtdTotal = grupo.itensEstimados.reduce(
            (acc, it) => acc + (it.quantidadeEstimada || 0),
            0
          );

          totalItensEstimadosContador += grupo.itensEstimados.length;
          valorGlobalTotal += valorFinal;

          itensConsolidados.push({
            id: `pca-${Date.now()}-${itensConsolidados.length}-${Math.random().toString(36).substring(2, 6)}`,
            anoExercicio: new Date().getFullYear(),
            codigoItem: grupo.codigoItem,
            numeroDFD: grupo.numeroDFD,
            descricao: grupo.descricao,
            categoria: grupo.categoria,
            unidadeRequisitante: grupo.unidadeRequisitante,
            grauPrioridade: grupo.grauPrioridade,
            quantidadeTotal: qtdTotal,
            valorEstimado: valorFinal,
            status: "PLANEJADO",
            dataPrevisaoContratacao: grupo.dataPrevisaoContratacao,
            itensEstimados: grupo.itensEstimados,
            origemInsercao: "ARQUIVO_IMPORTADO",
            inseridoPor: usuarioNome || "Coordenação Geral de Gestão (SG)",
            inseridoEm: new Date().toISOString(),
          });
        });

        resolve({
          success: true,
          itens: itensConsolidados,
          totalContratacoes: itensConsolidados.length,
          totalItensEstimados: totalItensEstimadosContador,
          valorGlobal: valorGlobalTotal,
          mensagem: `${itensConsolidados.length} contratações e ${totalItensEstimadosContador} itens estimados identificados na planilha com sucesso!`,
        });
      } catch (err: any) {
        resolve({
          success: false,
          itens: [],
          totalContratacoes: 0,
          totalItensEstimados: 0,
          valorGlobal: 0,
          mensagem: `Falha ao processar arquivo: ${err?.message || "Estrutura não suportada"}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        itens: [],
        totalContratacoes: 0,
        totalItensEstimados: 0,
        valorGlobal: 0,
        mensagem: "Erro ao ler os bytes do arquivo selecionado.",
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Gera e realiza o download direto no navegador do Modelo Oficial de Planilha PCA (.xlsx)
 * contendo exemplos reais do setor público de saúde para orientar a coordenadora.
 */
export function baixarPlanilhaModeloPCA(): void {
  const dadosExemplo = [
    {
      "Nº DFD": "DFD 014 - SAS",
      "Código PCA": "PCA-001",
      "Categoria": "Medicamentos & Farmácia",
      "Objeto da Contratação": "Registro de Preços para fornecimento contínuo de medicamentos de Atenção Básica",
      "Unidade Requisitante": "SAS",
      "Item Nº": 1,
      "Descrição do Item": "Dipirona Monoidratada 500mg/ml gotas 10ml",
      "Unidade de Medida": "Frasco",
      "Quantidade Estimada": 35000,
      "Valor Unitário Estimado (R$)": 3.85,
      "Valor Total Estimado (R$)": 134750.0,
      "Previsão de Contratação": "1º Semestre",
      "Grau de Prioridade": "ALTA",
    },
    {
      "Nº DFD": "DFD 014 - SAS",
      "Código PCA": "PCA-001",
      "Categoria": "Medicamentos & Farmácia",
      "Objeto da Contratação": "Registro de Preços para fornecimento contínuo de medicamentos de Atenção Básica",
      "Unidade Requisitante": "SAS",
      "Item Nº": 2,
      "Descrição do Item": "Amoxicilina 500mg cápsulas",
      "Unidade de Medida": "Caixa c/ 30",
      "Quantidade Estimada": 12000,
      "Valor Unitário Estimado (R$)": 18.5,
      "Valor Total Estimado (R$)": 222000.0,
      "Previsão de Contratação": "1º Semestre",
      "Grau de Prioridade": "ALTA",
    },
    {
      "Nº DFD": "DFD 022 - CAF",
      "Código PCA": "PCA-002",
      "Categoria": "Material Médico-Hospitalar",
      "Objeto da Contratação": "Aquisição parcelada de insumos descartáveis e materiais penso para UPAs e UBSs",
      "Unidade Requisitante": "SAS",
      "Item Nº": 1,
      "Descrição do Item": "Seringa Descartável 10ml com Agulha 25x7",
      "Unidade de Medida": "Caixa c/ 100",
      "Quantidade Estimada": 8500,
      "Valor Unitário Estimado (R$)": 42.0,
      "Valor Total Estimado (R$)": 357000.0,
      "Previsão de Contratação": "2º Semestre",
      "Grau de Prioridade": "ALTA",
    },
    {
      "Nº DFD": "DFD 031 - SG",
      "Código PCA": "PCA-003",
      "Categoria": "Locação de Veículos & Transporte",
      "Objeto da Contratação": "Locação de veículos tipo van adaptada e ambulâncias de suporte básico com motorista",
      "Unidade Requisitante": "SG",
      "Item Nº": 1,
      "Descrição do Item": "Ambulância Tipo B - Suporte Básico - Diária/Mês 24x7",
      "Unidade de Medida": "Mês",
      "Quantidade Estimada": 12,
      "Valor Unitário Estimado (R$)": 14500.0,
      "Valor Total Estimado (R$)": 174000.0,
      "Previsão de Contratação": "2º Semestre",
      "Grau de Prioridade": "ALTA",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(dadosExemplo);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PCA_Saude");

  // Ajusta larguras de coluna
  ws["!cols"] = [
    { wch: 22 }, // Nº DFD
    { wch: 15 }, // Código PCA
    { wch: 28 }, // Categoria
    { wch: 50 }, // Objeto da Contratação
    { wch: 20 }, // Unidade Requisitante
    { wch: 10 }, // Item Nº
    { wch: 45 }, // Descrição do Item
    { wch: 18 }, // Unidade de Medida
    { wch: 22 }, // Quantidade Estimada
    { wch: 25 }, // Valor Unitário Estimado (R$)
    { wch: 25 }, // Valor Total Estimado (R$)
    { wch: 22 }, // Previsão de Contratação
    { wch: 18 }, // Grau de Prioridade
  ];

  XLSX.writeFile(wb, "Modelo_Oficial_PCA_Saude.xlsx");
}

/**
 * Exporta os itens atuais do PCA em planilha Excel completa com abas de Consolidação e Detalhamento de Itens
 */
export function exportarPcaCompletoExcel(itens: ItemPCA[]): void {
  // Aba 1: Contratações / DFDs Consolidados
  const dadosConsolidados = itens.map((it) => ({
    "Nº DFD": it.numeroDFD || "-",
    "Código PCA": it.codigoItem,
    "Categoria": it.categoria,
    "Objeto da Contratação": it.descricao,
    "Unidade Demandante": it.unidadeRequisitante || "SAS",
    "Grau de Prioridade": it.grauPrioridade || "ALTA",
    "Qtd. Itens Estimados": it.itensEstimados ? it.itensEstimados.length : 1,
    "Qtd. Total Unidades": it.quantidadeTotal || 0,
    "Valor Total Estimado (R$)": it.valorEstimado,
    "Previsão": it.dataPrevisaoContratacao,
    "Status": it.status,
    "Origem": it.origemInsercao === "ARQUIVO_IMPORTADO" ? "Planilha Importada" : "Cadastro Manual",
    "Cadastrado Por": it.inseridoPor || "Gestão SG",
  }));

  // Aba 2: Detalhamento Item a Item
  const dadosDetalhados: any[] = [];
  itens.forEach((it) => {
    if (it.itensEstimados && it.itensEstimados.length > 0) {
      it.itensEstimados.forEach((sub) => {
        dadosDetalhados.push({
          "Nº DFD": it.numeroDFD || "-",
          "Código PCA": it.codigoItem,
          "Objeto Principal": it.descricao,
          "Item Nº": sub.numeroItem,
          "Especificação do Item": sub.descricao,
          "Unidade": sub.unidadeMedida || "Unidade",
          "Quantidade Estimada": sub.quantidadeEstimada,
          "Valor Unitário (R$)": sub.valorUnitarioEstimado,
          "Valor Total (R$)": sub.valorTotalEstimado,
        });
      });
    } else {
      dadosDetalhados.push({
        "Nº DFD": it.numeroDFD || "-",
        "Código PCA": it.codigoItem,
        "Objeto Principal": it.descricao,
        "Item Nº": 1,
        "Especificação do Item": it.descricao,
        "Unidade": "Global",
        "Quantidade Estimada": it.quantidadeTotal || 1,
        "Valor Unitário (R$)": it.valorEstimado,
        "Valor Total (R$)": it.valorEstimado,
      });
    }
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(dadosConsolidados);
  const ws2 = XLSX.utils.json_to_sheet(dadosDetalhados);

  XLSX.utils.book_append_sheet(wb, ws1, "Contratacoes_PCA");
  XLSX.utils.book_append_sheet(wb, ws2, "Itens_Detalhados");

  XLSX.writeFile(wb, `PCA_Saude_Oficial_${new Date().getFullYear()}.xlsx`);
}
