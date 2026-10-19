"use client";

import React from "react";
import { DocumentoElaborado } from "@/lib/types";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface FolhaTimbradaProps {
  documento: DocumentoElaborado;
  className?: string;
}

export function FolhaTimbradaPreview({ documento, className = "" }: FolhaTimbradaProps) {
  const isDFD =
    documento.tipoPeca === "DFD" ||
    documento.titulo.toUpperCase().includes("DFD") ||
    Boolean(documento.modeloId && documento.modeloId.toUpperCase().includes("DFD"));

  const valorTotalGeral = documento.itens.reduce(
    (acc, it) => acc + (it.valorTotal || (it.valorUnitario || 0) * it.quantidade),
    0
  );

  return (
    <div
      id="folha-timbrada-oficial"
      className={`bg-white text-slate-900 shadow-xl border border-slate-200/80 rounded-xl mx-auto flex flex-col justify-between transition-all print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0 ${className}`}
      style={{
        width: "100%",
        maxWidth: "850px",
        minHeight: "1130px", // Proporção aproximada de uma folha A4
        padding: "48px 56px",
        fontFamily: "'Calibri', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ---------------- CABEÇALHO OFICIAL COM TIMBRE PRESERVADO (ARAPIRACA - SMS) ---------------- */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4 pb-3" style={{ fontFamily: "Arial, sans-serif" }}>
          {/* Brasão / Logomarca Oficial de Arapiraca */}
          <div className="flex items-center">
            <img
              src="/timbre/brasao-oficial.png"
              alt="Arapiraca - Uma Cidade Para Todos"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Secretaria Municipal de Saúde */}
          <div className="text-right">
            <h1 className="text-base sm:text-lg font-bold uppercase text-black tracking-tight leading-tight">
              SECRETARIA MUNICIPAL DE SAÚDE
            </h1>
          </div>
        </div>

        {/* Faixa Dourada Institucional Contínua Oficial (#FBBA00) */}
        <div
          className="w-full"
          style={{ height: "6px", backgroundColor: "#FBBA00" }}
        />
      </header>

      {/* ---------------- IDENTIFICAÇÃO DO ATO ADMINISTRATIVO ---------------- */}
      <div className="text-center my-6 space-y-1">
        <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
          {documento.titulo}
        </h2>
        {documento.artigoLei && (
          <p className="text-[11px] font-semibold text-sky-850 tracking-normal">
            Fundamentação: {documento.artigoLei}
          </p>
        )}
        <div className="w-16 h-0.5 bg-slate-300 mx-auto mt-2" />
      </div>

      {/* ---------------- CORPO DO DOCUMENTO ---------------- */}
      <div className="flex-1 space-y-5 text-justify text-[12px] leading-relaxed text-slate-800">
        {/* Caso o servidor esteja editando em Texto Livre */}
        {documento.textoLivre && documento.textoLivre.trim().length > 0 ? (
          <div className="whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed space-y-2">
            {documento.textoLivre}
          </div>
        ) : (
          /* Modo Estruturado por Seções */
          <div className="space-y-4">
            {documento.secoes.map((secao) => (
              <section key={secao.id} className="space-y-1.5">
                <h3 className="font-bold text-[12.5px] text-slate-900 uppercase tracking-tight">
                  {secao.titulo}
                </h3>
                <p className="text-[12px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {secao.conteudo}
                </p>

                {/* Se a seção for de Itens / Objeto e houver itens cadastrados */}
                {(secao.titulo.toLowerCase().includes("objeto") ||
                  secao.titulo.toLowerCase().includes("item") ||
                  secao.titulo.toLowerCase().includes("quantitativo")) &&
                  documento.itens.length > 0 && (
                    <div className="mt-3 pt-2">
                      <div className="overflow-x-auto rounded border border-slate-300">
                        <table className="w-full text-[11px] text-left border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                            <tr>
                              <th className="py-1.5 px-2 text-center w-10">Item</th>
                              <th className="py-1.5 px-2">Descrição do Objeto / Insumo</th>
                              <th className="py-1.5 px-2 text-center w-14">Unid</th>
                              <th className="py-1.5 px-2 text-center w-14">Qtd</th>
                              {!isDFD && <th className="py-1.5 px-2 text-right w-24">V. Unitário</th>}
                              {!isDFD && <th className="py-1.5 px-2 text-right w-24">V. Total</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {documento.itens.map((it) => (
                              <tr key={it.item} className="hover:bg-slate-50/50">
                                <td className="py-1 px-2 text-center font-mono font-semibold text-slate-600">
                                  {it.item.toString().padStart(2, "0")}
                                </td>
                                <td className="py-1 px-2 font-medium text-slate-800">
                                  {it.descricao}
                                </td>
                                <td className="py-1 px-2 text-center text-slate-600">
                                  {it.unidade}
                                </td>
                                <td className="py-1 px-2 text-center font-semibold text-slate-900">
                                  {it.quantidade}
                                </td>
                                {!isDFD && (
                                  <td className="py-1 px-2 text-right font-mono text-slate-700">
                                    {it.valorUnitario
                                      ? it.valorUnitario.toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })
                                      : "-"}
                                  </td>
                                )}
                                {!isDFD && (
                                  <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">
                                    {(it.valorTotal || (it.valorUnitario || 0) * it.quantidade) > 0
                                      ? (
                                          it.valorTotal ||
                                          (it.valorUnitario || 0) * it.quantidade
                                        ).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })
                                      : "-"}
                                  </td>
                                )}
                              </tr>
                            ))}
                            {!isDFD && valorTotalGeral > 0 && (
                              <tr className="bg-sky-50/80 font-bold border-t-2 border-sky-300">
                                <td colSpan={4} className="py-1.5 px-2 text-right text-slate-800">
                                  VALOR TOTAL ESTIMADO:
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono text-sky-900 text-xs">
                                  {valorTotalGeral.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </section>
            ))}
          </div>
        )}

        {/* ---------------- LOCAL, DATA E ASSINATURA OFICIAL ---------------- */}
        <div className="pt-8 space-y-6 bloco-assinatura" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <p className="text-center text-[12px] text-slate-800">
            {documento.cidadeDataExtenso}
          </p>

          <div className="max-w-md mx-auto text-center space-y-1">
            <div className="w-64 h-px bg-slate-400 mx-auto mb-1.5" />
            <p className="font-bold text-[12.5px] text-slate-900 uppercase">
              {documento.servidorResponsavel}
            </p>
            <p className="text-[11px] text-slate-600">
              {documento.cargoServidor} &bull; Matrícula nº {documento.matriculaServidor}
            </p>
            <p className="text-[10px] text-slate-500">
              {documento.orgaoRequisitante}
            </p>

            {/* Selo de Assinatura Eletrônica Governamental - Oculto na Impressão conforme solicitado */}
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[9.5px] font-semibold print:hidden">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Assinatura Eletrônica Autenticada pelo Sistema SuperGestão Saúde</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- RODAPÉ INSTITUCIONAL TIMBRADO ---------------- */}
      <footer className="mt-10 pt-4 border-t border-slate-300 text-center text-[9.5px] text-slate-500 space-y-1">
        <p className="font-bold uppercase tracking-wider text-slate-700">
          Centro Administrativo Antônio Rocha
        </p>
        <p>
          Rua Samaritana, nº 1.185 – Bairro Santa Edwiges – CEP 57.311-180 – Arapiraca/AL &bull; CNPJ nº 21.013.754/0001-56
        </p>
        <div className="flex items-center justify-between pt-1 text-[8.5px] text-slate-400">
          <span>Sistema Integrado SuperGestão Saúde &bull; Lei Federal nº 14.133/2021</span>
          <span>Secretaria Municipal de Saúde de Arapiraca</span>
        </div>
      </footer>
    </div>
  );
}
