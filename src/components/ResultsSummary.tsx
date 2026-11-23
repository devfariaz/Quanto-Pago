"use client";

import React, { useEffect, useState } from "react";
import {
  FileDown,
  RotateCcw,
  Share2,
  Trophy,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import type {
  MeiResult,
  RegimeEstimateResult,
  SimplesResult,
  SimulationInput,
} from "@/types/tax";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ShareCardModal } from "@/components/ShareCardModal";

interface ResultsSummaryProps {
  input: SimulationInput;
  mei: MeiResult;
  simples: SimplesResult;
  selectedEstimate: RegimeEstimateResult;
  comparativo?: RegimeEstimateResult[];
  melhorRegime?: RegimeEstimateResult | null;
  onExportPdf: () => void;
  onSimulateAnother?: () => void;
}

const DONUT_COLORS = [
  "#1B4332",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#0EA5E9",
  "#E11D48",
  "#8B5CF6",
  "#14B8A6",
];

function useCountUp(target: number, durationMs = 550) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(from + (target - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return val;
}

export function ResultsSummary({
  input,
  mei,
  simples,
  selectedEstimate,
  comparativo = [],
  melhorRegime,
  onExportPdf,
  onSimulateAnother,
}: ResultsSummaryProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const animatedRate = useCountUp(
    selectedEstimate.elegivel ? selectedEstimate.aliquotaEfetiva : 0
  );
  const animatedValue = useCountUp(
    selectedEstimate.elegivel ? selectedEstimate.valorMensal : 0
  );

  const isBestRegime =
    Boolean(melhorRegime) &&
    selectedEstimate.elegivel &&
    melhorRegime?.regime === selectedEstimate.regime;

  useEffect(() => {
    if (!isBestRegime) return;
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 1800);
    return () => clearTimeout(t);
  }, [isBestRegime, selectedEstimate.valorMensal]);

  // Calculate annual savings vs next cheapest or Presumido
  const eligible = comparativo
    .filter((c) => c.elegivel)
    .sort((a, b) => a.valorMensal - b.valorMensal);
  const runnerUp =
    eligible.find((c) => c.regime !== (melhorRegime?.regime ?? selectedEstimate.regime)) ??
    eligible[1];
  const economiaAnual =
    melhorRegime && runnerUp && runnerUp.valorAnualProjetado > melhorRegime.valorAnualProjetado
      ? runnerUp.valorAnualProjetado - melhorRegime.valorAnualProjetado
      : 0;

  const tagLabel =
    input.regimeSelecionado === "SIMPLES_NACIONAL" && simples.elegivel
      ? `Anexo ${simples.anexoAplicado} · Faixa ${simples.faixa}${
          simples.fatorRAplicado ? ` · Fator R ${formatPercent(simples.fatorR ?? 0)}` : ""
        }`
      : `CNAE ${input.cnae.code} · ${selectedEstimate.nome}`;

  // Donut Chart geometry
  const breakdown = selectedEstimate.breakdown.filter((b) => b.valor > 0);
  const totalBreakdown = breakdown.reduce((acc, b) => acc + b.valor, 0);
  const r = 64;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;

  // Mini comparador (Simples, Presumido, Real)
  const miniList = comparativo.filter(
    (c) => c.regime !== "MEI" || (c.regime === "MEI" && c.elegivel)
  );
  const maxMini = Math.max(...miniList.map((m) => m.valorMensal), 1);

  const cadaCemReaisImposto = (selectedEstimate.aliquotaEfetiva * 100).toFixed(2).replace(".", ",");
  const cadaCemReaisLivre = (100 - selectedEstimate.aliquotaEfetiva * 100)
    .toFixed(2)
    .replace(".", ",");

  return (
    <>
      <section aria-label="Resumo do cálculo tributário" className="animate-fade-slide space-y-6">
        {/* 1. HERO DE RESULTADO INSTAGRAMÁVEL */}
        <div className="hero-forest-gradient relative overflow-hidden rounded-[28px] p-6 text-white shadow-xl sm:p-9">
          {/* Subtle confetti dots when best regime */}
          {showConfetti && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              {[10, 22, 35, 48, 62, 75, 88].map((left, i) => (
                <span
                  key={left}
                  className="absolute top-3 h-2.5 w-2.5 animate-bounce rounded-full"
                  style={{
                    left: `${left}%`,
                    backgroundColor: i % 2 === 0 ? "#F59E0B" : "#52B788",
                    animationDelay: `${i * 90}ms`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-3.5 py-1 font-mono text-xs font-medium text-emerald-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" strokeWidth={1.75} />
                {tagLabel}
              </div>

              <p className="font-mono text-[11px] font-medium tracking-widest text-slate-300 uppercase">
                SUA ALÍQUOTA EFETIVA · {selectedEstimate.nome.toUpperCase()}
              </p>

              {selectedEstimate.elegivel ? (
                <>
                  <p className="font-serif text-6xl leading-[0.95] font-bold tracking-[-0.03em] text-[#FAFAF7] tabular-nums sm:text-[80px]">
                    {formatPercent(animatedRate)}
                  </p>
                  <p className="text-lg font-semibold text-amber-300 tabular-nums sm:text-2xl">
                    {formatCurrency(animatedValue)} / mês{" "}
                    <span className="text-sm font-normal text-emerald-100/90 sm:text-base">
                      · sobre {formatCurrency(input.receitaMes)} faturados
                    </span>
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-rose-400/40 bg-rose-950/50 p-4 text-sm text-rose-100">
                  <strong>Regime inelegível:</strong> {selectedEstimate.motivoInelegibilidade}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:min-w-[290px]">
              <button
                type="button"
                disabled={!selectedEstimate.elegivel}
                onClick={() => setShareOpen(true)}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] bg-[#F59E0B] px-6 py-3.5 text-sm font-bold text-[#111827] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#D97706] disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" strokeWidth={2} />
                Compartilhar resultado (Stories / Feed)
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onExportPdf}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[12px] border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <FileDown className="h-4 w-4" strokeWidth={1.5} />
                  Exportar PDF
                </button>
                {onSimulateAnother && (
                  <button
                    type="button"
                    onClick={onSimulateAnother}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[12px] bg-white/5 px-4 py-2.5 text-xs font-medium text-emerald-200 transition hover:bg-white/15"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Outro cenário
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sublimite Alert */}
          {simples.alertaSublimite && input.regimeSelecionado === "SIMPLES_NACIONAL" && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-400/40 bg-amber-950/40 px-4 py-3 text-xs text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" strokeWidth={1.75} />
              <span>
                <strong>Alerta de Sublimite (R$ 3,6 milhões):</strong> Acima deste patamar, ICMS e
                ISS passam a ser recolhidos fora do DAS no regime normal.
              </span>
            </div>
          )}
        </div>

        {/* 2. GRID CENTRAL: DONUT DO DAS + MINI COMPARADOR */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* DONUT CHART CARD */}
          <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-serif text-xl font-semibold text-[#111827] dark:text-slate-50">
              Composição do seu imposto
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Para onde vai cada real dos {formatCurrency(selectedEstimate.valorMensal)} mensais:
            </p>

            {breakdown.length > 0 ? (
              <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative h-44 w-44 shrink-0">
                  <svg viewBox="0 0 168 168" className="h-44 w-44 -rotate-90">
                    {breakdown.map((item, idx) => {
                      const pct = totalBreakdown > 0 ? item.valor / totalBreakdown : 0;
                      const dash = Math.max(0, pct * circ - 2.5);
                      const offset = -cumulative * circ;
                      cumulative += pct;
                      const isHovered = hoveredSlice === idx;
                      return (
                        <circle
                          key={item.nome}
                          cx="84"
                          cy="84"
                          r={r}
                          fill="none"
                          stroke={DONUT_COLORS[idx % DONUT_COLORS.length]}
                          strokeWidth={isHovered ? 24 : 20}
                          strokeDasharray={`${dash} ${circ}`}
                          strokeDashoffset={offset}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredSlice(idx)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-[10px] text-slate-500 uppercase dark:text-slate-400">
                      {hoveredSlice !== null ? breakdown[hoveredSlice].nome : "Total/mês"}
                    </span>
                    <span className="font-serif text-lg font-bold text-[#111827] tabular-nums dark:text-slate-50">
                      {hoveredSlice !== null
                        ? formatCurrency(breakdown[hoveredSlice].valor)
                        : formatCurrency(selectedEstimate.valorMensal)}
                    </span>
                  </div>
                </div>

                {/* Tabular Legend */}
                <ul className="w-full space-y-2 text-xs">
                  {breakdown.map((item, idx) => {
                    const share = totalBreakdown > 0 ? item.valor / totalBreakdown : 0;
                    const active = hoveredSlice === idx;
                    return (
                      <li
                        key={item.nome}
                        onMouseEnter={() => setHoveredSlice(idx)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 transition ${
                          active
                            ? "bg-[#F3F2EC] dark:bg-slate-700"
                            : "hover:bg-[#FAFAF7] dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                          />
                          <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                            {item.nome}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 tabular-nums">
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {formatPercent(share, 1)}
                          </span>
                          <span className="font-bold text-[#111827] dark:text-slate-50">
                            {formatCurrency(item.valor)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                Preencha uma receita maior que zero para visualizar a divisão do imposto.
              </p>
            )}
          </div>

          {/* MINI COMPARADOR + SELO TROFÉU */}
          <div className="shadow-card flex flex-col justify-between rounded-[24px] border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#111827] dark:text-slate-50">
                Comparador rápido de regimes
              </h2>

              {economiaAnual > 0 && melhorRegime && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-300 bg-[#FEF3C7] px-4 py-3 text-xs font-bold text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <Trophy className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
                  <span>
                    Você economiza{" "}
                    <strong className="tabular-nums">{formatCurrency(economiaAnual)}/ano</strong> no{" "}
                    {melhorRegime.nome}!
                  </span>
                </div>
              )}

              <div className="mt-5 space-y-4">
                {miniList.map((item) => {
                  const isBest = melhorRegime?.regime === item.regime;
                  const widthPct = item.elegivel
                    ? Math.max(8, Math.round((item.valorMensal / maxMini) * 100))
                    : 100;
                  return (
                    <div key={item.regime} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold ${
                            isBest
                              ? "text-[#1B4332] dark:text-emerald-400"
                              : "text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {isBest ? `✓ ${item.nome}` : item.nome}
                        </span>
                        <span
                          className={`font-bold tabular-nums ${
                            isBest
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {item.elegivel
                            ? `${formatCurrency(item.valorMensal)}/mês · ${formatPercent(item.aliquotaEfetiva)}`
                            : "Inelegível"}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-[#F3F2EC] dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            !item.elegivel
                              ? "bg-rose-300/60"
                              : isBest
                                ? "bg-emerald-500"
                                : "bg-slate-400 dark:bg-slate-500"
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {input.regimeSelecionado === "MEI" && mei.elegivel && (
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Uso do limite anual MEI (R$ 81.000):{" "}
                <strong className="tabular-nums">{formatPercent(mei.percentualLimiteUsado)}</strong>
              </p>
            )}
          </div>
        </div>

        {/* 3. O QUE ISSO SIGNIFICA NA PRÁTICA? */}
        {selectedEstimate.elegivel && (
          <div className="rounded-[22px] border border-emerald-200/70 bg-[#ECFDF5] p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <h3 className="font-serif text-lg font-semibold text-[#1B4332] dark:text-emerald-300">
              O que isso significa na prática?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              De cada <strong>R$ 100,00</strong> que entram na conta da sua empresa,{" "}
              <strong className="text-[#1B4332] tabular-nums dark:text-emerald-300">
                R$ {cadaCemReaisImposto}
              </strong>{" "}
              vão para tributos e{" "}
              <strong className="text-emerald-700 tabular-nums dark:text-emerald-400">
                R$ {cadaCemReaisLivre}
              </strong>{" "}
              ficam livres para o seu negócio.
              {simples.fatorRAplicado && input.regimeSelecionado === "SIMPLES_NACIONAL"
                ? " Como seu Fator R passou de 28%, você saiu do Anexo V e reduziu drasticamente a alíquota efetiva!"
                : ""}
            </p>
          </div>
        )}
      </section>

      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        regimeName={selectedEstimate.nome}
        aliquotaEfetiva={selectedEstimate.aliquotaEfetiva}
        valorMensal={selectedEstimate.valorMensal}
        tagLabel={tagLabel}
        economiaAnual={economiaAnual}
        comparadoCom={runnerUp?.nome ?? "Lucro Presumido"}
      />
    </>
  );
}
