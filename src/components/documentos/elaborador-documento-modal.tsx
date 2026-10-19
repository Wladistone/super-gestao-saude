"use client";

import React, { useState, useEffect } from "react";
import { DocumentoElaborado, ItemDocumento, SecaoDocumento } from "@/lib/types";
import { FolhaTimbradaPreview } from "./folha-timbrada-preview";
import {
  gerarArquivoDocxComTimbre,
  downloadBlob,
} from "@/lib/documento-templates-service";
import { dataStore } from "@/lib/data-store";
import {
  X,
  Save,
  Printer,
  Download,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  FileEdit,
  CheckCircle2,
  Layers,
  ArrowRight,
  Shield,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface ElaboradorDocumentoModalProps {
  documentoInicial: DocumentoElaborado;
  isOpen: boolean;
  onClose: () => void;
  onSalvo?: (doc: DocumentoElaborado) => void;
}

export function ElaboradorDocumentoModal({
  documentoInicial,
  isOpen,
  onClose,
  onSalvo,
}: ElaboradorDocumentoModalProps) {
  const [doc, setDoc] = useState<DocumentoElaborado>(documentoInicial);
  const [abaAtiva, setAbaAtiva] = useState<"formulario" | "texto_livre" | "previa">("formulario");
  const [salvando, setSalvando] = useState(false);
  const [gerandoDocx, setGerandoDocx] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Escuta inserções diretas vindas da Tia Licita (janelinha de lado)
  useEffect(() => {
    const handleInserirTextoTiaLicita = (e: any) => {
      const texto = e.detail?.texto;
      if (!texto) return;

      const num = doc.secoes.length + 1;
      const nova: SecaoDocumento = {
        id: `sec-${Date.now()}`,
        titulo: `${num}. Cláusula / Disposição Técnica (Tia Licita IA)`,
        conteudo: texto,
      };
      setDoc((prev) => ({
        ...prev,
        secoes: [...prev.secoes, nova],
        updatedAt: new Date().toISOString(),
      }));
      setMensagemSucesso("Texto gerado pela Tia Licita inserido com sucesso em nova cláusula!");
      setTimeout(() => setMensagemSucesso(null), 3500);
    };

    window.addEventListener("inserir-texto-tia-licita" as any, handleInserirTextoTiaLicita);
    return () => window.removeEventListener("inserir-texto-tia-licita" as any, handleInserirTextoTiaLicita);
  }, [doc.secoes.length]);

  if (!isOpen) return null;

  // Atualizadores de campos principais
  const handleAtualizarCampo = (campo: keyof DocumentoElaborado, valor: any) => {
    setDoc((prev) => ({
      ...prev,
      [campo]: valor,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Atualizadores de seções
  const handleAtualizarSecao = (id: string, novoConteudo: string) => {
    setDoc((prev) => ({
      ...prev,
      secoes: prev.secoes.map((s) =>
        s.id === id ? { ...s, conteudo: novoConteudo } : s
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAdicionarSecao = () => {
    const num = doc.secoes.length + 1;
    const nova: SecaoDocumento = {
      id: `sec-${Date.now()}`,
      titulo: `${num}. Nova Cláusula / Disposição Técnica`,
      conteudo: "Descreva aqui as especificações ou diretrizes adicionais pertinentes.",
    };
    setDoc((prev) => ({
      ...prev,
      secoes: [...prev.secoes, nova],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRemoverSecao = (id: string) => {
    setDoc((prev) => ({
      ...prev,
      secoes: prev.secoes.filter((s) => s.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Manipuladores de itens
  const handleAtualizarItem = (
    index: number,
    campo: keyof ItemDocumento,
    valor: any
  ) => {
    setDoc((prev) => {
      const novosItens = [...prev.itens];
      const itemAtual = { ...novosItens[index], [campo]: valor };
      if (campo === "quantidade" || campo === "valorUnitario") {
        const qtd = campo === "quantidade" ? Number(valor) : itemAtual.quantidade;
        const vUnit = campo === "valorUnitario" ? Number(valor) : itemAtual.valorUnitario || 0;
        itemAtual.valorTotal = qtd * vUnit;
      }
      novosItens[index] = itemAtual;
      return { ...prev, itens: novosItens, updatedAt: new Date().toISOString() };
    });
  };

  const handleAdicionarItem = () => {
    const novoItem: ItemDocumento = {
      item: doc.itens.length + 1,
      descricao: "Novo item / insumo da saúde",
      unidade: "UNID",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    };
    setDoc((prev) => ({
      ...prev,
      itens: [...prev.itens, novoItem],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRemoverItem = (index: number) => {
    setDoc((prev) => {
      const novos = prev.itens
        .filter((_, idx) => idx !== index)
        .map((it, idx) => ({ ...it, item: idx + 1 }));
      return { ...prev, itens: novos, updatedAt: new Date().toISOString() };
    });
  };

  // Ação de Salvar na plataforma
  const handleSalvar = () => {
    setSalvando(true);
    try {
      const docAtualizado: DocumentoElaborado = {
        ...doc,
        status: "CONCLUIDO",
        updatedAt: new Date().toISOString(),
      };
      dataStore.salvarDocumentoElaborado(docAtualizado);
      setDoc(docAtualizado);
      setMensagemSucesso("Documento oficial salvo com sucesso! O gabarito original do modelo permanece 100% limpo e preservado no catálogo.");
      setTimeout(() => setMensagemSucesso(null), 5000);
      if (onSalvo) onSalvo(docAtualizado);
    } catch (e) {
      console.error(e);
    } finally {
      setSalvando(false);
    }
  };

  // Ação de Imprimir / PDF com isolamento total em iframe (garante impressão exclusiva com timbre e rodapé fixos em todas as páginas)
  const handleImprimir = () => {
    const elemento = document.getElementById("folha-timbrada-oficial");
    if (!elemento) {
      window.print();
      return;
    }

    // Remove qualquer iframe temporário anterior
    const iframeAntigo = document.getElementById("iframe-impressao-isolada");
    if (iframeAntigo) {
      iframeAntigo.remove();
    }

    // Cria iframe invisível dedicado exclusivamente à impressão da folha timbrada
    const iframe = document.createElement("iframe");
    iframe.id = "iframe-impressao-isolada";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const docIframe = iframe.contentWindow?.document || iframe.contentDocument;
    if (!docIframe) {
      window.print();
      return;
    }

    // Clona o nó da folha timbrada oficial
    const clone = elemento.cloneNode(true) as HTMLElement;

    // Remove elementos que não devem aparecer na impressão física (como o selo de assinatura eletrônica)
    clone.querySelectorAll(".print\\:hidden, [data-print-hidden='true']").forEach((el) => el.remove());

    // Extrai o cabeçalho oficial (timbre) e o rodapé institucional para repetição fixa em todas as páginas
    const headerElement = clone.querySelector("header");
    const footerElement = clone.querySelector("footer");

    let headerHtml = "";
    let footerHtml = "";

    if (headerElement) {
      headerElement.style.margin = "0";
      headerElement.style.marginBottom = "0";
      headerElement.style.padding = "0";
      headerHtml = headerElement.outerHTML;
      headerElement.remove();
    }

    if (footerElement) {
      footerElement.style.margin = "0";
      footerElement.style.marginTop = "0";
      footerElement.style.paddingTop = "8px";
      footerHtml = footerElement.outerHTML;
      footerElement.remove();
    }

    // Reseta formatação do corpo para encaixe contínuo perfeito em A4
    clone.style.width = "100%";
    clone.style.maxWidth = "100%";
    clone.style.minHeight = "auto";
    clone.style.margin = "0";
    clone.style.padding = "0";
    clone.style.border = "none";
    clone.style.boxShadow = "none";
    clone.style.borderRadius = "0";
    clone.style.background = "#ffffff";
    clone.style.display = "block";

    // Extrai todos os estilos (Tailwind, Google Fonts, etc.)
    const estilos = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((el) => el.outerHTML)
      .join("\n");

    const baseUrl = window.location.origin;

    docIframe.open();
    docIframe.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <base href="${baseUrl}/" />
          <title>${doc.titulo} - ${doc.numeroProcesso}</title>
          ${estilos}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 15mm 15mm;
            }

            *, *::before, *::after {
              box-sizing: border-box;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Calibri', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              visibility: visible !important;
            }

            body * {
              visibility: visible !important;
            }

            /* TIMBRE FIXO NO TOPO DE TODAS AS PÁGINAS */
            .timbre-fixo-topo {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              background-color: #ffffff !important;
              z-index: 9999 !important;
              margin: 0 !important;
              padding: 0 !important;
              visibility: visible !important;
            }

            /* RODAPÉ FIXO NA PARTE INFERIOR DE TODAS AS PÁGINAS */
            .rodape-fixo-base {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              background-color: #ffffff !important;
              z-index: 9999 !important;
              margin: 0 !important;
              padding: 0 !important;
              visibility: visible !important;
            }

            /* TABELA DE ESTRUTURA PARA REPETIÇÃO PERFEITA */
            .tabela-impressao-paginada {
              width: 100% !important;
              border-collapse: collapse !important;
              border-spacing: 0 !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: transparent !important;
              visibility: visible !important;
            }

            .tabela-impressao-paginada thead {
              display: table-header-group !important;
            }

            .tabela-impressao-paginada thead td {
              height: 98px !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
            }

            .tabela-impressao-paginada tfoot {
              display: table-footer-group !important;
            }

            .tabela-impressao-paginada tfoot td {
              height: 65px !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
            }

            .tabela-impressao-paginada tbody td {
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              vertical-align: top !important;
            }

            #folha-timbrada-oficial {
              position: static !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              background: #ffffff !important;
              display: block !important;
              visibility: visible !important;
            }

            /* Quebras de página controladas */
            p, section, .secao-documento {
              orphans: 3;
              widows: 3;
            }

            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .bloco-assinatura {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .print\\:hidden, [data-print-hidden="true"] {
              display: none !important;
              visibility: hidden !important;
            }
          </style>
        </head>
        <body>
          <!-- TIMBRE OFICIAL REPETIDO NO TOPO DE TODAS AS PÁGINAS -->
          <div class="timbre-fixo-topo">
            ${headerHtml}
          </div>

          <!-- RODAPÉ INSTITUCIONAL REPETIDO NA BASE DE TODAS AS PÁGINAS -->
          <div class="rodape-fixo-base">
            ${footerHtml}
          </div>

          <!-- TABELA DE CORPO QUE RESERVA O ESPAÇO EXATO DO CABEÇALHO E RODAPÉ -->
          <table class="tabela-impressao-paginada">
            <thead>
              <tr>
                <td>
                  <div style="height: 98px; width: 100%;"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="width: 100%; max-width: 100%; margin: 0; padding: 0;">
                    ${clone.outerHTML}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <div style="height: 65px; width: 100%;"></div>
                </td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);
    docIframe.close();

    // Dispara a impressão garantindo que todas as imagens estejam decodificadas
    const dispararImpressao = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    };

    const imagens = Array.from(docIframe.images);
    if (imagens.length === 0) {
      setTimeout(dispararImpressao, 250);
    } else {
      let prontas = 0;
      const total = imagens.length;
      let disparado = false;

      const aoCarregar = () => {
        prontas++;
        if (prontas >= total && !disparado) {
          disparado = true;
          setTimeout(dispararImpressao, 200);
        }
      };

      imagens.forEach((img) => {
        if (img.complete) {
          aoCarregar();
        } else {
          img.addEventListener("load", aoCarregar);
          img.addEventListener("error", aoCarregar);
        }
      });

      // Timeout de segurança para nunca travar a impressão
      setTimeout(() => {
        if (!disparado) {
          disparado = true;
          dispararImpressao();
        }
      }, 750);
    }
  };

  // Ação de Download .docx preservando o timbre
  const handleBaixarDocx = async () => {
    setGerandoDocx(true);
    try {
      const blob = await gerarArquivoDocxComTimbre(doc);
      const nomeLimpo = doc.titulo.replace(/[/\\?%*:|"<>]/g, "-");
      downloadBlob(blob, `${nomeLimpo} - ${doc.numeroProcesso}.docx`);
      setMensagemSucesso("Arquivo .docx gerado com o timbre oficial de Arapiraca preservado!");
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (e) {
      console.error("Erro ao gerar docx:", e);
      alert("Ocorreu um erro ao gerar o arquivo Word timbrado.");
    } finally {
      setGerandoDocx(false);
    }
  };

  // Copiar texto para a área de transferência
  const handleCopiarTexto = () => {
    const linhas: string[] = [
      `SECRETARIA MUNICIPAL DE SAÚDE`,
      ``,
      doc.titulo.toUpperCase(),
      doc.artigoLei ? `Fundamentação: ${doc.artigoLei}` : "",
      ``,
    ];

    if (doc.textoLivre) {
      linhas.push(doc.textoLivre);
    } else {
      doc.secoes.forEach((s) => {
        linhas.push(`${s.titulo}\n${s.conteudo}\n`);
      });
      if (doc.itens.length > 0) {
        linhas.push(`ITENS DA DEMANDA:`);
        doc.itens.forEach((it) => {
          linhas.push(
            `Item ${it.item}: ${it.descricao} - Qtd: ${it.quantidade} ${it.unidade} - Total: R$ ${it.valorTotal?.toFixed(2) || "0.00"}`
          );
        });
        linhas.push(``);
      }
    }

    linhas.push(doc.cidadeDataExtenso);
    linhas.push(`${doc.servidorResponsavel} - Matrícula ${doc.matriculaServidor}`);
    linhas.push(doc.cargoServidor);

    navigator.clipboard.writeText(linhas.join("\n"));
    setMensagemSucesso("Conteúdo do documento copiado para a área de transferência!");
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  // Assistente de IA para aprimorar fundamentação jurídica
  const handleMelhorarJustificativa = () => {
    const textoAprimorado = `A presente contratação fundamenta-se nas disposições imperativas da Lei Federal nº 14.133/2021 (Nova Lei de Licitações e Contratos Administrativos) e no Art. 196 da Constituição Federal de 1988, que consagra a saúde como direito de todos e dever inalienável do Estado.\n\nNo âmbito municipal, atende rigorosamente aos parâmetros do Decreto Municipal nº 2.898/2024 e às diretrizes da Superintendência de Gestão da Secretaria Municipal de Saúde de Arapiraca. O objeto delineado é essencial para resguardar a integridade, conforto e dignidade dos usuários do Sistema Único de Saúde (SUS), garantindo a continuidade e salubridade dos serviços de saúde pública.`;
    handleAtualizarCampo("justificativa", textoAprimorado);
    // Também atualiza na seção correspondente se existir
    const secaoJust = doc.secoes.find((s) =>
      s.titulo.toLowerCase().includes("justificativa")
    );
    if (secaoJust) {
      handleAtualizarSecao(secaoJust.id, textoAprimorado);
    }
    setMensagemSucesso("Justificativa jurídica aprimorada com sucesso!");
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const isDFD =
    doc.tipoPeca === "DFD" ||
    doc.titulo.toUpperCase().includes("DFD") ||
    Boolean(doc.modeloId && doc.modeloId.toUpperCase().includes("DFD"));

  return (
    <div id="modal-backdrop-elaborador" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:block">
      <div id="modal-elaborador-content" className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:h-auto print:border-none print:shadow-none print:bg-white print:rounded-none print:p-0 print:m-0 print:overflow-visible">
        {/* ---------------- CABEÇALHO DO MODAL (OCULTO NA IMPRESSÃO) ---------------- */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/30 text-sky-300 border border-sky-400/30">
                  {doc.tipoPeca}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {doc.numeroProcesso}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-md sm:max-w-xl">
                {doc.titulo}
              </h2>
            </div>
          </div>

          {/* Abas e Controles de Visualização */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setAbaAtiva("formulario")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  abaAtiva === "formulario"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Formulário</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva("texto_livre")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  abaAtiva === "texto_livre"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Texto Completo</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva("previa")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  abaAtiva === "previa"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Folha Timbrada</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-2"
              title="Fechar editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---------------- BARRA DE AÇÕES E STATUS (OCULTO NA IMPRESSÃO) ---------------- */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            {mensagemSucesso ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {mensagemSucesso}
              </span>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700">Timbre Oficial Preservado:</span>
                <span>Prefeitura de Arapiraca &bull; SMS</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Copiar */}
            <button
              type="button"
              onClick={handleCopiarTexto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              title="Copiar texto formal"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copiar Texto</span>
            </button>

            {/* Botão Imprimir / Salvar PDF */}
            <button
              type="button"
              onClick={handleImprimir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
              title="Imprimir ou Salvar em PDF com folha timbrada oficial"
            >
              <Printer className="h-3.5 w-3.5 text-sky-700" />
              <span>Imprimir / PDF</span>
            </button>

            {/* Botão Baixar .docx Timbrado */}
            <button
              type="button"
              onClick={handleBaixarDocx}
              disabled={gerandoDocx}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-sky-850 bg-sky-50 hover:bg-sky-100 border border-sky-300 transition-colors shadow-2xs disabled:opacity-50"
              title="Baixar em arquivo Word (.docx) com cabeçalho timbrado oficial"
            >
              <Download className="h-3.5 w-3.5 text-sky-700" />
              <span>{gerandoDocx ? "Gerando Word..." : "Baixar .docx Timbrado"}</span>
            </button>

            {/* Botão Salvar na Plataforma */}
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{salvando ? "Salvando..." : "Salvar no Processo"}</span>
            </button>
          </div>
        </div>

        {/* ---------------- CORPO PRINCIPAL COM PAINÉIS LADO A LADO OU ABA ---------------- */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* PAINEL ESQUERDO: EDITOR E FORMULÁRIO */}
          {(abaAtiva === "formulario" || abaAtiva === "texto_livre") && (
            <div id="painel-formulario-editor" className="flex-1 overflow-y-auto p-5 space-y-5 bg-white border-r border-slate-200 print:hidden">
              {/* BANNER DE GARANTIA: MODELO ORIGINAL PRESERVADO */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-2xs">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900 flex items-center gap-2">
                    <span>Gabarito Oficial Protegido & Preservado</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-200/60 text-emerald-800 text-[10px] font-mono uppercase">
                      Cópia Independente
                    </span>
                  </div>
                  <div className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed">
                    Você está editando uma <strong>nova cópia de trabalho</strong>. O modelo original em branco permanece intacto e inalterado na biblioteca, para que você e outros servidores possam utilizá-lo livremente no futuro.
                  </div>
                </div>
              </div>

              {/* BLOCO 1: DADOS INSTITUCIONAIS DO PROCESSO */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-sky-700" />
                    Identificação do Processo & Autoridade
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {doc.dataDocumento}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nº do Processo Administrativo *
                    </label>
                    <input
                      type="text"
                      value={doc.numeroProcesso}
                      onChange={(e) => handleAtualizarCampo("numeroProcesso", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nº da Capa de Autuação
                    </label>
                    <input
                      type="text"
                      value={doc.numeroCapa || ""}
                      onChange={(e) => handleAtualizarCampo("numeroCapa", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Data por Extenso Oficial
                    </label>
                    <input
                      type="text"
                      value={doc.cidadeDataExtenso}
                      onChange={(e) => handleAtualizarCampo("cidadeDataExtenso", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Órgão / Superintendência Requisitante
                    </label>
                    <input
                      type="text"
                      value={doc.orgaoRequisitante}
                      onChange={(e) => handleAtualizarCampo("orgaoRequisitante", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Servidor Responsável & Matrícula
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nome do Servidor"
                        value={doc.servidorResponsavel}
                        onChange={(e) => handleAtualizarCampo("servidorResponsavel", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Matrícula"
                        value={doc.matriculaServidor}
                        onChange={(e) => handleAtualizarCampo("matriculaServidor", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ABA DE TEXTO LIVRE */}
              {abaAtiva === "texto_livre" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">
                        Redação Contínua da Peça Oficial
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Você pode redigir ou colar o teor completo da minuta. A folha timbrada será atualizada instantaneamente.
                      </p>
                    </div>
                  </div>

                  <textarea
                    rows={20}
                    value={
                      doc.textoLivre !== undefined
                        ? doc.textoLivre
                        : doc.secoes.map((s) => `${s.titulo}\n${s.conteudo}\n`).join("\n")
                    }
                    onChange={(e) => handleAtualizarCampo("textoLivre", e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-300 font-sans text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
                    placeholder="Digite aqui o texto oficial do documento..."
                  />
                </div>
              ) : (
                /* ABA DE FORMULÁRIO ESTRUTURADO */
                <div className="space-y-5">
                  {/* SEÇÕES DO DOCUMENTO */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Cláusulas e Seções Oficiais
                      </h3>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(
                                new CustomEvent("abrir-tia-licita", {
                                  detail: {
                                    prompt: `Tia Licita, por favor elabore uma justificativa técnica e jurídica exemplar para o documento "${doc.titulo}" (Processo: ${doc.numeroProcesso}) da Secretaria Municipal de Saúde de Arapiraca, embasada na Lei Federal nº 14.133/2021 e no Decreto Municipal nº 2.898/2024.`,
                                    context: {
                                      modulo: "Elaboração de Documentos",
                                      documentoTitulo: doc.titulo,
                                      tipoPeca: doc.tipoPeca,
                                      numeroProcesso: doc.numeroProcesso,
                                      objeto: doc.itens.map((i) => i.descricao).join(", "),
                                    },
                                  },
                                })
                              );
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10.5px] font-bold transition-colors shadow-2xs"
                          title="Chamar a Tia Licita (Groq IA) para redigir fundamentação ou cláusulas"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                          <span>Tia Licita IA (Lei 14.133)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAdicionarSecao}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold transition-colors"
                        >
                          <Plus className="h-3 w-3 text-sky-700" />
                          <span>Adicionar Cláusula</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {doc.secoes.map((secao) => (
                        <div
                          key={secao.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={secao.titulo}
                              onChange={(e) => {
                                const novoTitulo = e.target.value;
                                setDoc((prev) => ({
                                  ...prev,
                                  secoes: prev.secoes.map((s) =>
                                    s.id === secao.id ? { ...s, titulo: novoTitulo } : s
                                  ),
                                }));
                              }}
                              className="font-bold text-xs text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none flex-1 py-0.5"
                            />
                            {!secao.obrigatoria && (
                              <button
                                type="button"
                                onClick={() => handleRemoverSecao(secao.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                                title="Remover esta cláusula"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <textarea
                            rows={3}
                            value={secao.conteudo}
                            onChange={(e) => handleAtualizarSecao(secao.id, e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TABELA DE ITENS DA DEMANDA */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Especificação dos Itens & Quantitativos
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Os itens listados são inseridos na tabela timbrada oficial do documento.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdicionarItem}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Adicionar Item</span>
                      </button>
                    </div>

                    {isDFD && (
                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-bold text-amber-900">Regra da Lei nº 14.133/2021 & SMS:</span> No <strong>DFD (Documento de Formalização de Demanda)</strong> indicam-se apenas a especificação e as quantidades dos itens. A pesquisa de preços e valoração orçamentária ocorrem exclusivamente no <strong>ETP (Estudo Técnico Preliminar)</strong> e no Termo de Referência.
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {doc.itens.map((it, idx) => (
                        <div
                          key={it.item}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs"
                        >
                          <span className="h-6 w-6 rounded bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {it.item}
                          </span>

                          <input
                            type="text"
                            placeholder="Descrição do item"
                            value={it.descricao}
                            onChange={(e) => handleAtualizarItem(idx, "descricao", e.target.value)}
                            className="flex-1 min-w-[150px] px-2 py-1 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                          />

                          <input
                            type="text"
                            placeholder="Unid"
                            value={it.unidade}
                            onChange={(e) => handleAtualizarItem(idx, "unidade", e.target.value)}
                            className="w-16 px-2 py-1 rounded border border-slate-300 text-xs text-center focus:ring-1 focus:ring-sky-500 focus:outline-none"
                          />

                          <input
                            type="number"
                            placeholder="Qtd"
                            value={it.quantidade}
                            onChange={(e) => handleAtualizarItem(idx, "quantidade", Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded border border-slate-300 text-xs text-center focus:ring-1 focus:ring-sky-500 focus:outline-none"
                          />

                          {!isDFD && (
                            <input
                              type="number"
                              placeholder="V. Unit"
                              value={it.valorUnitario || ""}
                              onChange={(e) => handleAtualizarItem(idx, "valorUnitario", Number(e.target.value))}
                              className="w-24 px-2 py-1 rounded border border-slate-300 text-xs text-right font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoverItem(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                            title="Remover item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAINEL DIREITO: VISUALIZAÇÃO EM FOLHA TIMBRADA AO VIVO */}
          <div
            id="painel-preview-timbrado"
            className={`flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center print:p-0 print:bg-white print:overflow-visible print:block print:w-full ${
              abaAtiva === "previa" ? "block w-full" : "hidden md:flex"
            }`}
          >
            <div className="w-full max-w-3xl">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-600 print:hidden">
                <span className="font-bold flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-sky-700" />
                  Pré-visualização Oficial A4 (Folha Timbrada Arapiraca/AL)
                </span>
                <span className="text-[11px] text-slate-500">
                  Pronto para assinatura e autuação no processo
                </span>
              </div>

              {/* Renderização da Folha Timbrada Oficial com Brasão Preservado */}
              <FolhaTimbradaPreview documento={doc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
