"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowRight, Landmark, Wallet, AlertCircle } from "lucide-react";
import type { SimplesData2026, SimulationInput } from "@/types/tax";
import { formatCurrency } from "@/lib/format";
import { CurrencyInput } from "@/components/CurrencyInput";
import { TaxReformModule } from "@/components/TaxReformModule";

interface SplitPaymentViewProps {
  input: SimulationInput;
  simplesData: SimplesData2026;
  onChangeInsumos: (percentual: number) => void;
}

export function SplitPaymentView({
  input,
  simplesData,
  onChangeInsumos,
}: SplitPaymentViewProps) {
  const [valorVenda, setValorVenda] = useState<number>(1000);
  const [anoSimulado, setAnoSimulado] = useState<2026 | 2027 | 2033>(2027);

  const aliquotaMap: Record<2026 | 2027 | 2033, number> = {
    2026: 0.01, // 0,1% IBS + 0,9% CBS simbólico
    2027: 0.088 * (1 - input.cnae.ibsCbsReduction), // CBS em vigor
    2033: 0.265 * (1 - input.cnae.ibsCbsReduction), // IVA Dual pleno
  };

  const rate = aliquotaMap[anoSimulado];
  const retido = Math.round(valorVenda * rate * 100) / 100;
  const caixa = Math.max(0, Math.round((valorVenda - retido) * 100) / 100);
  const pctRetido = valorVenda > 0 ? (retido / valorVenda) * 100 : 0;
  const pctCaixa = Math.max(0, 100 - pctRetido);

  return (
    <div className="animate-fade-slide space-y-8 pb-12">
      {/* Header */}
      <div>
        <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
          SIMULADOR INTERATIVO · REFORMA TRIBUTÁRIA (LC 214/2025)
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl dark:text-slate-50">
          Simulador de Split Payment
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          Veja na prática como o pagamento dividido separa automaticamente o que entra no seu caixa
          do imposto retido na fonte no ato do Pix ou cartão.
        </p>
      </div>

      {/* Main Split Flow Card */}
      <section className="shadow-card rounded-[28px] border border-[#E7E5DC] bg-white p-6 sm:p-9 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="w-full max-w-sm">
            <CurrencyInput
              id="split-venda"
              label="Valor da venda no Pix / Cartão"
              badge="Simulação"
              value={valorVenda}
              onChange={setValorVenda}
            />
          </div>

          <div className="flex gap-2 rounded-2xl bg-[#F3F2EC] p-1.5 dark:bg-slate-900">
            {([2026, 2027, 2033] as const).map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setAnoSimulado(yr)}
                className={`min-h-[42px] rounded-xl px-4 py-2 font-mono text-xs font-bold transition ${
                  anoSimulado === yr
                    ? "bg-[#1B4332] text-white shadow-xs dark:bg-emerald-600"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {yr}
                {yr === 2026 ? " (Teste)" : yr === 2027 ? " (CBS)" : " (Pleno)"}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Split Diagram: R$ 1.000 -> [Caixa] + [Retido] */}
        <div className="mt-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-11">
          {/* Venda Total */}
          <div className="rounded-[20px] bg-[#F3F2EC] p-6 lg:col-span-3 dark:bg-slate-900">
            <p className="font-mono text-[11px] font-medium text-slate-500 uppercase dark:text-slate-400">
              VENDA TOTAL
            </p>
            <p className="mt-2 font-serif text-3xl font-bold text-[#111827] tabular-nums dark:text-slate-50">
              {formatCurrency(valorVenda)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pago pelo cliente na hora
            </p>
          </div>

          <div className="flex justify-center lg:col-span-1">
            <ArrowRight className="hidden h-6 w-6 text-[#1B4332] lg:block dark:text-emerald-400" strokeWidth={2} />
            <ArrowDown className="h-6 w-6 text-[#1B4332] lg:hidden dark:text-emerald-400" strokeWidth={2} />
          </div>

          {/* Entra no Caixa */}
          <div className="rounded-[20px] border-2 border-emerald-500/70 bg-[#ECFDF5] p-6 lg:col-span-3 dark:border-emerald-500/50 dark:bg-emerald-950/40">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-emerald-700 uppercase dark:text-emerald-300">
                ✓ CAIXA ({pctCaixa.toFixed(1).replace(".", ",")}%)
              </span>
              <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-[#1B4332] tabular-nums dark:text-emerald-200">
              {formatCurrency(caixa)}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-800/80 dark:text-emerald-300/80">
              Cai líquido na conta da empresa
            </p>
          </div>

          <div className="flex justify-center font-serif text-2xl font-bold text-slate-400 lg:col-span-1">
            +
          </div>

          {/* Retido na Fonte */}
          <div className="rounded-[20px] border-2 border-rose-400/70 bg-[#FFF1F2] p-6 lg:col-span-3 dark:border-rose-500/40 dark:bg-rose-950/30">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-rose-700 uppercase dark:text-rose-300">
                RETIDO ({pctRetido.toFixed(1).replace(".", ",")}%)
              </span>
              <Landmark className="h-5 w-5 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-rose-600 tabular-nums dark:text-rose-300">
              {formatCurrency(retido)}
            </p>
            <p className="mt-1 text-xs font-medium text-rose-800/80 dark:text-rose-200/80">
              Recolhido direto para IBS + CBS
            </p>
          </div>
        </div>

        {/* Visual Split Bar */}
        <div className="mt-6">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-[#F3F2EC] dark:bg-slate-900">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${pctCaixa}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{ width: `${pctRetido}%` }}
            />
          </div>
        </div>
      </section>

      {/* Callout 2026 vs 2027 */}
      <div className="hero-forest-gradient flex flex-col gap-3 rounded-[24px] p-6 text-white sm:flex-row sm:items-center sm:p-7">
        <AlertCircle className="h-7 w-7 shrink-0 text-amber-400" strokeWidth={1.75} />
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-widest text-amber-300 uppercase">
            ATENÇÃO AO CALENDÁRIO DA REFORMA
          </p>
          <p className="mt-1 font-serif text-lg font-semibold text-[#FAFAF7] sm:text-xl">
            Em 2026, alíquotas simbólicas de 0,1% (IBS) e 0,9% (CBS). Em 2027, começa a valer de
            verdade.
          </p>
        </div>
      </div>

      {/* Deep-dive existing TaxReformModule (Simples Híbrido + B2B + 2026-2033) */}
      <TaxReformModule
        input={input}
        simplesData={simplesData}
        onChangeInsumos={onChangeInsumos}
      />
    </div>
  );
}
