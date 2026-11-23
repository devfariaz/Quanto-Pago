"use client";

import React from "react";
import type {
  RegimeEstimateResult,
  SimplesResult,
  SimulationInput,
} from "@/types/tax";
import { formatBRL, formatPercent } from "@/lib/format";

interface PrintReportProps {
  input: SimulationInput;
  simples: SimplesResult;
  comparativo: RegimeEstimateResult[];
  selectedEstimate: RegimeEstimateResult;
}

export function PrintReport({
  input,
  simples,
  comparativo,
  selectedEstimate,
}: PrintReportProps) {
  const generatedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="print-only space-y-5 text-slate-900">
      <header className="border-b-2 border-slate-900 pb-3">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold">
            Laudo Tributário Estimativo — QuantoPago (2026)
          </h1>
          <span className="text-xs text-slate-500">Emitido em {generatedAt}</span>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Simulação comparativa baseada na LC 123/2006 (Simples Nacional 2026) e LC
          214/2025 (Reforma Tributária do Consumo).
        </p>
      </header>

      <section className="print-break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          1. Parâmetros da Simulação
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-slate-300 p-3 text-xs">
          <div>
            <strong>CNAE:</strong> {input.cnae.code} — {input.cnae.description}
          </div>
          <div>
            <strong>Regime Principal:</strong> {selectedEstimate.nome}
          </div>
          <div>
            <strong>RBT12 Informado:</strong> {formatBRL(input.rbt12)}
          </div>
          <div>
            <strong>Receita Mensal:</strong> {formatBRL(input.receitaMes)}
          </div>
          <div>
            <strong>Folha 12 meses:</strong> {formatBRL(input.folha12m)}
          </div>
          <div>
            <strong>Pró-labore Mensal:</strong> {formatBRL(input.proLaboreMes)}
          </div>
        </div>
      </section>

      <section className="print-break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          2. Quadro Comparativo de Regimes
        </h2>
        <table className="mt-2 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-400 bg-slate-100 text-left">
              <th className="p-2">Regime</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Alíquota Efetiva</th>
              <th className="p-2 text-right">Mensal</th>
              <th className="p-2 text-right">Anual Projetado</th>
            </tr>
          </thead>
          <tbody>
            {comparativo.map((row) => (
              <tr key={row.regime} className="border-b border-slate-200">
                <td className="p-2 font-semibold">{row.nome}</td>
                <td className="p-2">{row.elegivel ? "Elegível" : "Inelegível"}</td>
                <td className="p-2 text-right">
                  {row.elegivel ? formatPercent(row.aliquotaEfetiva) : "—"}
                </td>
                <td className="p-2 text-right font-semibold">
                  {row.elegivel ? formatBRL(row.valorMensal) : "—"}
                </td>
                <td className="p-2 text-right">
                  {row.elegivel ? formatBRL(row.valorAnualProjetado) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          3. Memória de Cálculo — Simples Nacional 2026
        </h2>
        <ol className="mt-2 space-y-1.5 text-xs">
          {simples.memoria.map((step, i) => (
            <li key={i} className="rounded border border-slate-200 p-2">
              <div className="flex justify-between font-semibold">
                <span>{step.titulo}</span>
                <span>{step.resultado}</span>
              </div>
              <p className="font-mono text-[10px] text-slate-600">{step.formula}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-6 border-t border-slate-300 pt-3 text-[10px] text-slate-600">
        <strong>Aviso Legal:</strong> Este documento possui caráter exclusivamente
        informativo e estimativo, não substituindo o planejamento tributário formal
        elaborado por contador devidamente registrado no CRC.
      </footer>
    </div>
  );
}
