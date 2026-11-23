"use client";

import React, { useState } from "react";
import type { CalculationStep } from "@/types/tax";

interface CalculationMemoryProps {
  title: string;
  steps: CalculationStep[];
}

export function CalculationMemory({ title, steps }: CalculationMemoryProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      aria-label="Memória de cálculo"
      className="print-break-inside-avoid shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#111827] dark:text-slate-50">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Passo a passo auditável da fórmula aplicada (transparência tributária).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="no-print rounded-xl border border-[#E7E5DC] px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-[#F3F2EC] hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          {expanded ? "Recolher" : "Expandir"}
        </button>
      </div>

      {expanded && (
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <li
              key={index}
              className="rounded-2xl border border-[#E7E5DC]/80 bg-[#FAFAF7] p-4 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {step.titulo}
                </span>
                <span className="rounded-lg bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-xs font-bold text-[#1B4332] dark:bg-emerald-950 dark:text-emerald-300">
                  {step.resultado}
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[11px] break-words text-slate-600 dark:text-slate-300">
                {step.formula}
              </p>
              {step.detalhe && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {step.detalhe}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
