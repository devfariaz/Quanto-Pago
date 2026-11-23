"use client";

import React from "react";
import { Check, X, Trophy } from "lucide-react";
import type { RegimeEstimateResult, TaxRegime } from "@/types/tax";
import { formatCurrency, formatPercent } from "@/lib/format";

interface RegimeComparatorProps {
  comparativo: RegimeEstimateResult[];
  melhorRegime: RegimeEstimateResult | null;
  selectedRegime: TaxRegime;
  onSelectRegime: (regime: TaxRegime) => void;
}

const REGIME_PROS_CONS: Record<
  TaxRegime,
  { pros: string[]; cons: string[] }
> = {
  MEI: {
    pros: [
      "Guia fixa mensal muito reduzida",
      "Dispensa contabilidade complexa",
    ],
    cons: [
      "Teto de faturamento de R$ 81 mil/ano",
      "Não permite atividades intelectuais/regulamentadas",
    ],
  },
  SIMPLES_NACIONAL: {
    pros: [
      "Guia única (DAS) simplificada todo dia 20",
      "Fator R pode reduzir alíquota para o Anexo III",
      "Menor burocracia mensal para PMEs",
    ],
    cons: ["Limite de faturamento de R$ 4,8 milhões/ano"],
  },
  LUCRO_PRESUMIDO: {
    pros: [
      "Não depende de folha salarial para Fator R",
      "Vantajoso quando margem de lucro supera 32%",
    ],
    cons: [
      "Guias separadas (PIS, COFINS, ISS, IRPJ, CSLL)",
      "Sem créditos de PIS/COFINS sobre insumos",
    ],
  },
  LUCRO_REAL: {
    pros: [
      "Imposto apenas sobre o lucro líquido real",
      "Aproveitamento de créditos de PIS/COFINS",
    ],
    cons: [
      "Contabilidade mais complexa e rigorosa",
      "Maior custo de compliance mensal",
    ],
  },
};

export function RegimeComparator({
  comparativo,
  melhorRegime,
  selectedRegime,
  onSelectRegime,
}: RegimeComparatorProps) {
  const maxAnual = Math.max(
    ...comparativo.filter((c) => c.elegivel).map((c) => c.valorAnualProjetado),
    1
  );

  return (
    <section
      aria-label="Comparador de Regimes Tributários"
      className="animate-fade-slide space-y-6"
    >
      {/* Header + Best Regime Pill */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
            COMPARATIVO LADO A LADO
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#111827] sm:text-3xl dark:text-slate-50">
            Comparador de Regimes Tributários
          </h2>
        </div>

        {melhorRegime && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-[#1B4332] px-4 py-2.5 text-xs font-semibold text-amber-300 shadow-sm dark:bg-emerald-950 dark:ring-1 dark:ring-emerald-700">
            <Trophy className="h-4 w-4 text-amber-400" strokeWidth={1.75} />
            Regime mais vantajoso: {melhorRegime.nome}
          </div>
        )}
      </div>

      {/* Vertical Bar Chart */}
      <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-serif text-base font-semibold text-[#111827] dark:text-slate-100">
          Imposto anual estimado por regime (R$/ano)
        </h3>
        <div className="mt-6 flex items-end justify-around gap-3 sm:gap-6">
          {comparativo.map((item) => {
            const isBest = melhorRegime?.regime === item.regime;
            const heightPx = item.elegivel
              ? Math.max(24, Math.round((item.valorAnualProjetado / maxAnual) * 150))
              : 24;
            return (
              <div
                key={item.regime}
                className="flex flex-1 flex-col items-center gap-2 text-center"
              >
                <span className="font-mono text-[11px] font-bold text-[#111827] tabular-nums sm:text-xs dark:text-slate-100">
                  {item.elegivel ? formatCurrency(item.valorAnualProjetado) : "Inelegível"}
                </span>
                <div
                  className={`w-full max-w-[92px] rounded-t-xl transition-all duration-500 ${
                    !item.elegivel
                      ? "bg-rose-200/70 dark:bg-rose-950/60"
                      : isBest
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-600"
                  }`}
                  style={{ height: `${heightPx}px` }}
                />
                <span className="text-[11px] font-medium text-slate-600 sm:text-xs dark:text-slate-300">
                  {item.nome}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regime Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {comparativo.map((item) => {
          const isBest = melhorRegime?.regime === item.regime;
          const isSelected = item.regime === selectedRegime;
          const pc = REGIME_PROS_CONS[item.regime];
          const barPct = item.elegivel
            ? Math.max(8, Math.round((item.valorAnualProjetado / maxAnual) * 100))
            : 0;

          return (
            <div
              key={item.regime}
              className={`shadow-card flex flex-col justify-between rounded-[22px] border-2 bg-white p-5 transition-all dark:bg-slate-800 ${
                isBest
                  ? "border-[#1B4332] dark:border-emerald-500"
                  : isSelected
                    ? "border-amber-400"
                    : "border-[#E7E5DC] dark:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  {isBest ? (
                    <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#1B4332] uppercase dark:bg-emerald-950 dark:text-emerald-300">
                      MELHOR ESCOLHA
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-slate-400 uppercase">
                      {item.ehAproximacao ? "ESTIMATIVA" : "TABELA OFICIAL"}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-serif text-xl font-semibold text-[#111827] dark:text-slate-50">
                  {item.nome}
                </h3>

                {item.elegivel ? (
                  <>
                    <p className="mt-2 text-2xl font-bold text-[#1B4332] tabular-nums dark:text-emerald-400">
                      {formatCurrency(item.valorMensal)}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> /mês</span>
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      {formatCurrency(item.valorAnualProjetado)}/ano ·{" "}
                      {formatPercent(item.aliquotaEfetiva)}
                    </p>

                    {/* Annual cost bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F3F2EC] dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full ${
                          isBest ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="mt-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {item.motivoInelegibilidade}
                  </p>
                )}

                {/* Pros & Cons */}
                <ul className="mt-4 space-y-1.5 text-xs">
                  {pc.pros.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      <span>{p}</span>
                    </li>
                  ))}
                  {pc.cons.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400"
                    >
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectRegime(item.regime)}
                className={`mt-5 min-h-[44px] w-full rounded-[12px] px-3 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-[#1B4332] text-white dark:bg-emerald-600"
                    : "bg-[#F3F2EC] text-[#111827] hover:bg-[#E7E5DC] dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                }`}
              >
                {isSelected ? "Regime ativo na simulação" : "Simular neste regime"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
