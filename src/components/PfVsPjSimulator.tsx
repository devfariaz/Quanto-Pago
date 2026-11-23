"use client";

import React, { useMemo, useState } from "react";
import type { SimplesData2026, SimulationInput } from "@/types/tax";
import { calculatePfVsPj } from "@/lib/tax/comparator";
import { formatBRL, formatPercent } from "@/lib/format";

interface PfVsPjSimulatorProps {
  input: SimulationInput;
  simplesData: SimplesData2026;
}

export function PfVsPjSimulator({ input, simplesData }: PfVsPjSimulatorProps) {
  const [contabilidadeMensal, setContabilidadeMensal] = useState(250);

  const result = useMemo(
    () => calculatePfVsPj(input, simplesData, contabilidadeMensal),
    [input, simplesData, contabilidadeMensal]
  );

  const economiaPositiva = result.economiaMensalPjVsPf > 0;

  return (
    <section
      aria-label="Simulador Pessoa Física versus Pessoa Jurídica"
      className="space-y-5"
    >
      <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7E5DC]/80 pb-4 dark:border-slate-700">
          <div>
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/60">
              Módulo 2 • Decisão Autônomo vs. Empresa
            </span>
            <h2 className="mt-2 font-serif text-lg font-bold tracking-tight text-[#111827] sm:text-xl dark:text-slate-50">
              Vale a pena abrir uma empresa? (PF vs. PJ)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Compara tributação como Pessoa Física (IRPF 2026 + INSS 20% + ISS + impacto
              IVA Dual) contra MEI e Simples Nacional para receita mensal de{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {formatBRL(result.receitaMensal)}
              </strong>
              .
            </p>
          </div>

          <div className="w-full sm:w-52">
            <label
              htmlFor="contabilidade-mensal"
              className="block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Contabilidade mensal estimada (PJ)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="contabilidade-mensal"
                type="range"
                min={0}
                max={800}
                step={50}
                value={contabilidadeMensal}
                onChange={(e) => setContabilidadeMensal(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="w-20 text-right font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                {formatBRL(contabilidadeMensal)}
              </span>
            </div>
          </div>
        </div>

        {/* Banner de Veredito */}
        <div
          className={`mt-4 rounded-2xl border p-4 ${
            economiaPositiva
              ? "border-emerald-200 bg-[#ECFDF5] text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100"
              : "border-blue-200 bg-blue-50/70 text-blue-950 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-100"
          }`}
        >
          <p className="text-sm font-semibold">{result.recomendacao}</p>
          {economiaPositiva && (
            <p className="mt-1 text-xs opacity-90">
              Economia projetada em 12 meses:{" "}
              <strong>{formatBRL(result.economiaAnualPjVsPf)}</strong>
            </p>
          )}
        </div>

        {/* Cards Comparativos */}
        <div
          className={`mt-5 grid grid-cols-1 gap-4 ${
            result.mei ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {/* Card Pessoa Física */}
          <article className="rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827] dark:text-slate-50">
                Autônomo (Pessoa Física)
              </h3>
              <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {formatPercent(result.pf.aliquotaAtual)}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#111827] tabular-nums dark:text-slate-50">
              {formatBRL(result.pf.totalAtual)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {" "}
                /mês
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Líquido estimado:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {formatBRL(result.pf.liquidoMensal)}
              </strong>
            </p>

            <dl className="mt-4 space-y-2 border-t border-[#E7E5DC] pt-3 text-xs dark:border-slate-700">
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  IRPF 2026 (Carnê-Leão)
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(result.pf.irpf)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  INSS Autônomo (20% até o teto)
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(result.pf.inssAutonomo)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">ISS Autônomo</dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(result.pf.issAutonomo)}
                </dd>
              </div>
              {result.pf.ivaDualEstimado2027 > 0 && (
                <div className="flex justify-between rounded bg-amber-50 px-2 py-1 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                  <dt>Risco IVA Dual (pós-2027)</dt>
                  <dd className="font-semibold tabular-nums">
                    +{formatBRL(result.pf.ivaDualEstimado2027)}
                  </dd>
                </div>
              )}
            </dl>
          </article>

          {/* Card MEI (se elegível) */}
          {result.mei && (
            <article className="rounded-2xl border border-emerald-300 bg-[#ECFDF5]/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  MEI (2026)
                </h3>
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {formatPercent(result.mei.aliquotaEfetiva)}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-950 tabular-nums dark:text-emerald-100">
                {formatBRL(result.mei.totalMensal)}
                <span className="text-xs font-normal text-emerald-700 dark:text-emerald-300">
                  {" "}
                  /mês
                </span>
              </p>
              <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">
                Líquido estimado:{" "}
                <strong>{formatBRL(result.mei.liquidoMensal)}</strong>
              </p>

              <dl className="mt-4 space-y-2 border-t border-emerald-200 pt-3 text-xs dark:border-emerald-800/60">
                <div className="flex justify-between">
                  <dt className="text-emerald-900 dark:text-emerald-200">
                    DAS Fixo MEI
                  </dt>
                  <dd className="font-semibold text-emerald-950 tabular-nums dark:text-emerald-100">
                    {formatBRL(result.mei.dasFixo)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-emerald-900 dark:text-emerald-200">
                    Contabilidade obrigatória
                  </dt>
                  <dd className="font-semibold text-emerald-950 dark:text-emerald-100">
                    Dispensada (R$ 0)
                  </dd>
                </div>
              </dl>
            </article>
          )}

          {/* Card PJ Simples Nacional */}
          <article className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-800/60 dark:bg-blue-950/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827] dark:text-slate-50">
                ME — Simples Nacional (PJ)
              </h3>
              <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                {formatPercent(result.pjSimples.aliquotaEfetiva)}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#111827] tabular-nums dark:text-slate-50">
              {formatBRL(result.pjSimples.totalMensal)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {" "}
                /mês
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Líquido estimado:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {formatBRL(result.pjSimples.liquidoMensal)}
              </strong>
            </p>

            <dl className="mt-4 space-y-2 border-t border-blue-100 pt-3 text-xs dark:border-blue-900/60">
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  Guia DAS (Simples Nacional)
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(result.pjSimples.das)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  INSS sobre Pró-labore (11%)
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(result.pjSimples.inssProLabore)}
                </dd>
              </div>
              {result.pjSimples.cppSeparada > 0 && (
                <div className="flex justify-between text-amber-800 dark:text-amber-300">
                  <dt>CPP Patronal Anexo IV (20%)</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatBRL(result.pjSimples.cppSeparada)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  Honorários contábeis (est.)
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(result.pjSimples.contabilidadeEstimada)}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
