"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { SimplesData2026, SimulationInput } from "@/types/tax";
import { loadReformaData, type ReformaDataFile } from "@/lib/data-loader";
import {
  calculateB2BCreditAnalysis,
  calculateSimplesHibrido,
  calculateSplitPayment,
  calculateTransitionProjection,
} from "@/lib/tax/reforma";
import {
  DEFAULT_RTC_ENDPOINT,
  testRtcApiConnection,
  type RtcApiStatus,
} from "@/lib/rtc-api";
import { formatBRL, formatPercent } from "@/lib/format";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";

interface TaxReformModuleProps {
  input: SimulationInput;
  simplesData: SimplesData2026;
  onChangeInsumos: (pct: number) => void;
}

export function TaxReformModule({
  input,
  simplesData,
  onChangeInsumos,
}: TaxReformModuleProps) {
  const [reformaData, setReformaData] = useState<ReformaDataFile | null>(null);
  const [anoSimulacao, setAnoSimulacao] = useState<number>(2027);
  const [valorVendaSplit, setValorVendaSplit] = useState<number>(10000);
  const [rtcStatus, setRtcStatus] = useState<RtcApiStatus>({
    source: "local",
    endpoint: DEFAULT_RTC_ENDPOINT,
    message: "Motor estático local LC 214/2025 ativo (zero latência).",
  });
  const [checkingRtc, setCheckingRtc] = useState(false);

  // Carregamento sob demanda do JSON da Reforma (code-splitting)
  useEffect(() => {
    let active = true;
    loadReformaData().then((data) => {
      if (active) setReformaData(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const splitResult = useMemo(() => {
    if (!reformaData) return null;
    return calculateSplitPayment(input, reformaData, anoSimulacao, valorVendaSplit);
  }, [input, reformaData, anoSimulacao, valorVendaSplit]);

  const hibridoResult = useMemo(() => {
    if (!reformaData) return null;
    return calculateSimplesHibrido(input, simplesData, reformaData, anoSimulacao);
  }, [input, simplesData, reformaData, anoSimulacao]);

  const projection = useMemo(() => {
    if (!reformaData) return [];
    return calculateTransitionProjection(input, simplesData, reformaData);
  }, [input, simplesData, reformaData]);

  const b2bCredit = useMemo(() => {
    if (!reformaData) return null;
    return calculateB2BCreditAnalysis(
      input,
      simplesData,
      reformaData,
      anoSimulacao,
      valorVendaSplit
    );
  }, [input, simplesData, reformaData, anoSimulacao, valorVendaSplit]);

  async function handleTestRtc() {
    setCheckingRtc(true);
    const status = await testRtcApiConnection(DEFAULT_RTC_ENDPOINT);
    setRtcStatus(status);
    setCheckingRtc(false);
  }

  if (!reformaData || !splitResult || !hibridoResult || !b2bCredit) {
    return (
      <div className="rounded-[24px] border border-[#E7E5DC] bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Carregando tabelas da Reforma Tributária (LC 214/2025)...
      </div>
    );
  }

  // Cálculo do gráfico SVG leve (2026–2033)
  const maxProj = Math.max(
    1,
    ...projection.flatMap((p) => [
      p.simplesRegular,
      p.simplesHibrido,
      p.lucroPresumido,
      p.lucroReal,
    ])
  );
  const svgWidth = 640;
  const svgHeight = 220;
  const padX = 48;
  const padY = 24;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const buildPolyline = (getter: (p: (typeof projection)[number]) => number) =>
    projection
      .map((p, idx) => {
        const x = padX + (idx / Math.max(1, projection.length - 1)) * chartW;
        const y = padY + chartH - (getter(p) / maxProj) * chartH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <section
      aria-label="Módulo Reforma Tributária LC 214/2025"
      className="space-y-6"
    >
      {/* Cabeçalho e controles globais da Reforma */}
      <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:ring-indigo-800/70">
              Módulo 3 • Reforma Tributária do Consumo (LC 214/2025)
            </span>
            <h2 className="mt-2 font-serif text-lg font-bold tracking-tight text-[#111827] sm:text-xl dark:text-slate-50">
              IVA Dual (CBS + IBS), Split Payment, Simples Híbrido e Crédito B2B
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              CNAE {input.cnae.code}:{" "}
              {input.cnae.ibsCbsReduction > 0
                ? `Redução setorial estimada de ${Math.round(input.cnae.ibsCbsReduction * 100)}% na alíquota de IBS/CBS.`
                : "Alíquota padrão de referência (~26,5% plena em 2033: 8,8% CBS + 17,7% IBS)."}
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <button
              type="button"
              onClick={handleTestRtc}
              disabled={checkingRtc}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-700/70 dark:bg-indigo-950/60 dark:text-indigo-200 dark:hover:bg-indigo-900/70"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  rtcStatus.source === "rtc-api" ? "bg-emerald-500" : "bg-indigo-500"
                }`}
              />
              {checkingRtc ? "Consultando API RTC..." : "Validar API RTC (Receita Federal)"}
            </button>
            <span className="max-w-xs text-[11px] text-slate-500 sm:text-right dark:text-slate-400">
              {rtcStatus.message}
            </span>
          </div>
        </div>

        {/* Controles do Ano de Simulação e Insumos */}
        <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-[#E7E5DC]/80 bg-[#FAFAF7] p-4 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900/60">
          <div>
            <label
              htmlFor="reform-year"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Ano de Referência da Transição</span>
              <span className="rounded bg-[#1B4332] px-2 py-0.5 font-mono text-white dark:bg-emerald-600">
                {anoSimulacao}
              </span>
            </label>
            <input
              id="reform-year"
              type="range"
              min={2026}
              max={2033}
              step={1}
              value={anoSimulacao}
              onChange={(e) => setAnoSimulacao(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600 dark:accent-emerald-400"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
              <span>2026</span>
              <span>2027</span>
              <span>2029</span>
              <span>2031</span>
              <span>2033</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="insumos-iva"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Insumos Tributados (para Crédito IVA)</span>
              <span className="font-mono text-indigo-700 dark:text-indigo-300">
                {Math.round(input.percentualInsumosIva * 100)}% da receita
              </span>
            </label>
            <input
              id="insumos-iva"
              type="range"
              min={0}
              max={0.75}
              step={0.05}
              value={input.percentualInsumosIva}
              onChange={(e) => onChangeInsumos(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600 dark:accent-emerald-400"
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Percentual do faturamento gasto com fornecedores PJ que geram crédito de
              IBS/CBS.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Simulador de Split Payment */}
      <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#111827] dark:text-slate-50">
              1. Simulador de Split Payment (Impacto no Fluxo de Caixa)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Simula quanto de uma venda é retido automaticamente na liquidação financeira
              para pagar CBS e IBS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="valor-venda-split"
              className="text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Valor da venda:
            </label>
            <select
              id="valor-venda-split"
              value={valorVendaSplit}
              onChange={(e) => setValorVendaSplit(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value={1000}>R$ 1.000,00</option>
              <option value={5000}>R$ 5.000,00</option>
              <option value={10000}>R$ 10.000,00</option>
              <option value={50000}>R$ 50.000,00</option>
              <option value={100000}>R$ 100.000,00</option>
            </select>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-2.5 text-xs text-indigo-950 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-100">
          <strong>Nota Contextual ({anoSimulacao}):</strong>{" "}
          {reformaData.notaContextualSplitPayment}{" "}
          <span className="font-semibold">Status em {anoSimulacao}:</span>{" "}
          {splitResult.statusSplitPayment}.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Valor Bruto da Venda
            </span>
            <p className="mt-1 text-xl font-bold text-[#111827] tabular-nums dark:text-slate-50">
              {formatBRL(splitResult.valorVenda)}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Pago pelo cliente
            </span>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-800/60 dark:bg-rose-950/35">
            <span className="text-xs text-rose-800 dark:text-rose-200">
              Retenção Automática (Split Payment)
            </span>
            <p className="mt-1 text-xl font-bold text-rose-900 tabular-nums dark:text-rose-300">
              − {formatBRL(splitResult.retencaoTotal)}
            </p>
            <span className="text-[11px] text-rose-700 dark:text-rose-300/90">
              CBS ({formatPercent(splitResult.aliquotaCbsEfetiva)}) + IBS (
              {formatPercent(splitResult.aliquotaIbsEfetiva)})
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/35">
            <span className="text-xs text-emerald-800 dark:text-emerald-200">
              Valor Líquido que Entra no Caixa
            </span>
            <p className="mt-1 text-xl font-bold text-emerald-900 tabular-nums dark:text-emerald-200">
              {formatBRL(splitResult.liquidoNoCaixa)}
            </p>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300/90">
              {formatPercent(1 - splitResult.percentualRetido)} da venda disponível na conta
            </span>
          </div>
        </div>
      </div>

      {/* 2. Simulador do Simples Híbrido (2027+) */}
      <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-serif text-base font-bold text-[#111827] dark:text-slate-50">
          2. Simulador do &ldquo;Simples Híbrido&rdquo; ({anoSimulacao})
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          A partir de 2027, empresas do Simples podem optar por recolher IBS e CBS fora do
          DAS (regime regular não-cumulativo) para aproveitar créditos e transferir crédito
          integral a clientes PJ.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Opção A — Simples Regular (Tudo no DAS)
            </span>
            <p className="mt-2 text-2xl font-bold text-[#111827] tabular-nums dark:text-slate-50">
              {formatBRL(hibridoResult.simplesRegularTotal)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {" "}
                /mês
              </span>
            </p>
            <dl className="mt-3 space-y-1.5 border-t border-[#E7E5DC] pt-3 text-xs dark:border-slate-700">
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">DAS Integral</dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(hibridoResult.simplesRegularDas)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  Crédito transferível a clientes PJ
                </dt>
                <dd className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">
                  {formatBRL(hibridoResult.creditoTransferidoRegular)} (limitado ao DAS)
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-800/60 dark:bg-indigo-950/35">
            <span className="text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:text-indigo-300">
              Opção B — Simples Híbrido (IBS/CBS fora do DAS)
            </span>
            <p className="mt-2 text-2xl font-bold text-indigo-950 tabular-nums dark:text-indigo-100">
              {formatBRL(hibridoResult.simplesHibridoTotal)}
              <span className="text-xs font-normal text-indigo-700 dark:text-indigo-300">
                {" "}
                /mês
              </span>
            </p>
            <dl className="mt-3 space-y-1.5 border-t border-indigo-100 pt-3 text-xs dark:border-indigo-800/60">
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  DAS Reduzido (sem consumo migrado)
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(hibridoResult.simplesHibridoDasSemConsumo)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-slate-300">
                  IVA Líquido (Débito − Crédito insumos)
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatBRL(hibridoResult.simplesHibridoIvaLiquido)}
                </dd>
              </div>
              <div className="flex justify-between text-emerald-800 dark:text-emerald-300">
                <dt className="font-medium">Crédito transferível a clientes PJ</dt>
                <dd className="font-bold tabular-nums">
                  {formatBRL(hibridoResult.creditoTransferidoHibrido)} (crédito cheio!)
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-3.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
          <strong className="font-semibold">Análise Estratégica:</strong>{" "}
          {hibridoResult.recomendacao}
        </div>
      </div>

      {/* 3. Projeção da Transição (2026–2033) */}
      <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-serif text-base font-bold text-[#111827] dark:text-slate-50">
          3. Projeção da Transição da Reforma Tributária (2026–2033)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Evolução estimada da carga tributária mensal por regime durante o cronograma da
          LC 214/2025.
        </p>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Simples Regular
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Simples Híbrido
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Lucro Presumido
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Lucro Real
          </span>
        </div>

        {/* Gráfico SVG Nativo Leve */}
        <div className="mt-3 overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="h-56 w-full min-w-[460px]"
            role="img"
            aria-label="Gráfico de evolução da carga tributária de 2026 a 2033"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const y = padY + chartH - frac * chartH;
              return (
                <g key={frac}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={svgWidth - padX}
                    y2={y}
                    className="stroke-slate-200 dark:stroke-slate-700"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padX - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-400 text-[9px] dark:fill-slate-400"
                  >
                    {Math.round((maxProj * frac) / 1000)}k
                  </text>
                </g>
              );
            })}

            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              points={buildPolyline((p) => p.simplesRegular)}
            />
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              points={buildPolyline((p) => p.simplesHibrido)}
            />
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              points={buildPolyline((p) => p.lucroPresumido)}
            />
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              points={buildPolyline((p) => p.lucroReal)}
            />

            {projection.map((p, idx) => {
              const x = padX + (idx / Math.max(1, projection.length - 1)) * chartW;
              return (
                <text
                  key={p.ano}
                  x={x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className={`text-[10px] ${
                    p.ano === anoSimulacao
                      ? "fill-indigo-600 font-bold dark:fill-amber-400"
                      : "fill-slate-500 dark:fill-slate-400"
                  }`}
                >
                  {p.ano}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Tabela Ano a Ano */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7E5DC] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-2 font-semibold">Ano</th>
                <th className="py-2 px-2 font-semibold">IVA Efet.</th>
                <th className="py-2 px-2 text-right font-semibold">Simples Reg.</th>
                <th className="py-2 px-2 text-right font-semibold">Simples Híb.</th>
                <th className="py-2 px-2 text-right font-semibold">Presumido</th>
                <th className="py-2 pl-2 text-right font-semibold">Lucro Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums dark:divide-slate-700/70">
              {projection.map((row) => (
                <tr
                  key={row.ano}
                  className={
                    row.ano === anoSimulacao
                      ? "bg-indigo-50/60 font-semibold dark:bg-indigo-950/50"
                      : ""
                  }
                >
                  <td className="py-2 pr-2 font-mono text-slate-900 dark:text-slate-100">
                    {row.ano}
                  </td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                    {formatPercent(row.aliquotaIvaEfetiva)}
                  </td>
                  <td className="py-2 px-2 text-right text-emerald-700 dark:text-emerald-400">
                    {formatBRL(row.simplesRegular)}
                  </td>
                  <td className="py-2 px-2 text-right text-indigo-700 dark:text-indigo-300">
                    {formatBRL(row.simplesHibrido)}
                  </td>
                  <td className="py-2 px-2 text-right text-amber-700 dark:text-amber-300">
                    {formatBRL(row.lucroPresumido)}
                  </td>
                  <td className="py-2 pl-2 text-right text-slate-800 dark:text-slate-200">
                    {formatBRL(row.lucroReal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Análise de Crédito Tributário para Clientes PJ (B2B) */}
      <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-serif text-base font-bold text-[#111827] dark:text-slate-50">
          4. Análise de Crédito Tributário para Clientes PJ (Operações B2B —{" "}
          {anoSimulacao})
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Para uma venda B2B de{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            {formatBRL(b2bCredit.valorOperacao)}
          </strong>
          , compare o crédito de IBS/CBS que seu cliente PJ consegue apropriar e o custo
          efetivo final da compra para ele.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Comprando do Simples Regular
            </span>
            <p className="mt-2 text-lg font-bold text-[#111827] tabular-nums dark:text-slate-50">
              Crédito: {formatBRL(b2bCredit.simplesRegular.creditoGerado)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ({formatPercent(b2bCredit.simplesRegular.percentualCredito)} sobre a nota)
            </p>
            <p className="mt-2 border-t border-[#E7E5DC] pt-2 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300">
              Custo líquido p/ cliente:{" "}
              <strong className="text-slate-900 dark:text-white">
                {formatBRL(b2bCredit.simplesRegular.custoEfetivoCliente)}
              </strong>
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-800/60 dark:bg-indigo-950/35">
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
              Comprando do Simples Híbrido
            </span>
            <p className="mt-2 text-lg font-bold text-indigo-950 tabular-nums dark:text-indigo-100">
              Crédito: {formatBRL(b2bCredit.simplesHibrido.creditoGerado)}
            </p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
              ({formatPercent(b2bCredit.simplesHibrido.percentualCredito)} — crédito cheio)
            </p>
            <p className="mt-2 border-t border-indigo-100 pt-2 text-xs text-indigo-950 dark:border-indigo-800/60 dark:text-indigo-200">
              Custo líquido p/ cliente:{" "}
              <strong className="text-indigo-950 dark:text-white">
                {formatBRL(b2bCredit.simplesHibrido.custoEfetivoCliente)}
              </strong>
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/35">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              Gap de Competitividade B2B
            </span>
            <p className="mt-2 text-lg font-bold text-emerald-950 tabular-nums dark:text-emerald-100">
              {formatBRL(b2bCredit.diferencaCompetitividade)}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
              Diferença de crédito que um concorrente no Regime Regular ou Simples Híbrido
              entrega a mais ao seu cliente PJ nesta operação.
            </p>
          </div>
        </div>
      </div>

      <LegalDisclaimer compact />
    </section>
  );
}
