"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Landmark,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type {
  CnaeItem,
  RegimeEstimateResult,
  SimulationDraft,
  TaxRegime,
} from "@/types/tax";
import { formatCurrency, formatPercent } from "@/lib/format";
import { CnaeAutocomplete } from "@/components/CnaeAutocomplete";
import { CurrencyInput } from "@/components/CurrencyInput";
import { EditorialTooltip } from "@/components/EditorialTooltip";

interface CalculatorWizardProps {
  cnaes: CnaeItem[];
  draft: SimulationDraft;
  selectedEstimate: RegimeEstimateResult | null;
  onChangeDraft: React.Dispatch<React.SetStateAction<SimulationDraft>>;
  onSelectCnae: (cnae: CnaeItem) => void;
  onFinish: () => void;
  onOpenGlossary: (term: string) => void;
}

const REGIME_CARDS: {
  id: TaxRegime;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  {
    id: "MEI",
    label: "MEI",
    short: "Até R$ 81 mil/ano · Guia fixa mensal simplificada",
    icon: Briefcase,
  },
  {
    id: "SIMPLES_NACIONAL",
    label: "Simples Nacional",
    short: "Até R$ 4,8 mi/ano · Guia única (DAS) com Anexos I a V",
    icon: ShieldCheck,
  },
  {
    id: "LUCRO_PRESUMIDO",
    label: "Lucro Presumido",
    short: "Margem presumida por CNAE · Ideal para lucros altos",
    icon: Building2,
  },
  {
    id: "LUCRO_REAL",
    label: "Lucro Real",
    short: "Sobre o lucro líquido contábil · Créditos de PIS/COFINS",
    icon: Landmark,
  },
];

const REGIME_LABELS: Record<TaxRegime, string> = {
  MEI: "MEI",
  SIMPLES_NACIONAL: "Simples Nacional",
  LUCRO_PRESUMIDO: "Lucro Presumido",
  LUCRO_REAL: "Lucro Real",
};

const STEP_META = [
  { num: 1, label: "Tipo de empresa", title: "Qual o regime da sua empresa?" },
  { num: 2, label: "Atividade (CNAE)", title: "Qual é a sua atividade principal?" },
  { num: 3, label: "Faturamento", title: "Quanto sua empresa fatura?" },
  { num: 4, label: "Fator R & Ajustes", title: "Folha de pagamento e detalhes finais" },
];

export function CalculatorWizard({
  cnaes,
  draft,
  selectedEstimate,
  onChangeDraft,
  onSelectCnae,
  onFinish,
  onOpenGlossary,
}: CalculatorWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isMei = draft.regimeSelecionado === "MEI";
  const isSimples = draft.regimeSelecionado === "SIMPLES_NACIONAL";
  const rbt12Ref = draft.rbt12 > 0 ? draft.rbt12 : draft.receitaMes * 12;
  const fatorRAtual = rbt12Ref > 0 ? draft.folha12m / rbt12Ref : 0;
  const showFatorR =
    !isMei &&
    Boolean(
      draft.cnae &&
        (draft.cnae.fatorR ||
          draft.cnae.anexo === "III" ||
          draft.cnae.anexo === "V")
    );
  const isAnexoIV = isSimples && draft.cnae?.anexo === "IV";

  const step1Valid = Boolean(draft.regimeSelecionado);
  const step2Valid = Boolean(draft.cnae);
  const step3Valid = draft.receitaMes > 0;
  const readyForResult = step1Valid && step2Valid && step3Valid;

  const canGoNext =
    (step === 1 && step1Valid) ||
    (step === 2 && step2Valid) ||
    (step === 3 && step3Valid);

  function canJumpToStep(target: number): boolean {
    if (target <= step) return true;
    if (target === 2) return step1Valid;
    if (target === 3) return step1Valid && step2Valid;
    if (target === 4) return readyForResult;
    return false;
  }

  const currentMeta = STEP_META[step - 1];

  // Segmented circular SVG arcs (4 segments)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const segmentLength = circumference / 4 - 6;

  return (
    <div className="animate-fade-slide pb-24 lg:pb-12">
      {/* Top Progress Header with Segmented Circle */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
              {[0, 1, 2, 3].map((idx) => {
                const isDone = idx + 1 < step;
                const isActive = idx + 1 === step;
                const offset = -idx * (circumference / 4);
                return (
                  <circle
                    key={idx}
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke={
                      isActive ? "#F59E0B" : isDone ? "#1B4332" : "#E7E5DC"
                    }
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={offset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <span className="absolute font-mono text-xs font-bold text-[#1B4332] dark:text-emerald-300">
              {step}/4
            </span>
          </div>

          <div>
            <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
              PASSO {step} DE 4 · {currentMeta.label}
            </p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl dark:text-slate-50">
              {currentMeta.title}
            </h1>
          </div>
        </div>

        {/* Clickable Step Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STEP_META.map((s) => {
            const active = s.num === step;
            const completed = s.num < step;
            const unlocked = canJumpToStep(s.num);
            return (
              <button
                key={s.num}
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && setStep(s.num)}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                  active
                    ? "bg-[#1B4332] text-white dark:bg-emerald-600"
                    : completed
                      ? "bg-[#ECFDF5] text-[#1B4332] hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
                      : "bg-[#F3F2EC] text-slate-600 hover:bg-[#E7E5DC] dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {completed && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
                <span>
                  {s.num}. {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Wizard Steps (Left) + Live Summary Panel (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="shadow-card rounded-[24px] border border-[#E7E5DC] bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
            {/* STEP 1: TIPO DE EMPRESA */}
            {step === 1 && (
              <div className="animate-fade-slide space-y-5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Escolha o regime atual ou o que deseja simular. Depois você também verá o
                  comparativo automático entre todos eles.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {REGIME_CARDS.map((card) => {
                    const Icon = card.icon;
                    const active = draft.regimeSelecionado === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() =>
                          onChangeDraft((prev) => ({
                            ...prev,
                            regimeSelecionado: card.id,
                          }))
                        }
                        className={`flex min-h-[112px] flex-col justify-between rounded-[20px] border-2 p-5 text-left transition-all duration-200 ${
                          active
                            ? "border-[#1B4332] bg-[#ECFDF5]/70 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/40"
                            : "border-[#E7E5DC] bg-[#FAFAF7] hover:border-[#1B4332]/40 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-500"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              active
                                ? "bg-[#1B4332] text-amber-400"
                                : "bg-white text-[#1B4332] dark:bg-slate-800 dark:text-emerald-400"
                            }`}
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                          {active && (
                            <span className="rounded-full bg-[#1B4332] px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-emerald-600">
                              Selecionado
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <span className="block font-serif text-lg font-semibold text-[#111827] dark:text-slate-50">
                            {card.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {card.short}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: CNAE */}
            {step === 2 && (
              <div className="animate-fade-slide relative z-30 space-y-5">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span>Busque pelo código ou nome da sua atividade</span>
                  <EditorialTooltip
                    title="O que é CNAE?"
                    content="Classificação Nacional de Atividades Econômicas. É o código do seu CNPJ que define o Anexo do Simples Nacional e a possibilidade de usar o Fator R."
                    glossaryTerm="CNAE"
                    onOpenGlossary={onOpenGlossary}
                  />
                </div>

                <CnaeAutocomplete
                  cnaes={cnaes}
                  selected={draft.cnae}
                  onSelect={onSelectCnae}
                />

                {draft.cnae ? (
                  <div className="rounded-2xl border border-emerald-200/80 bg-[#ECFDF5] p-4 dark:border-emerald-800/50 dark:bg-emerald-950/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[#1B4332] dark:text-emerald-300">
                        CNAE {draft.cnae.code} · Anexo {draft.cnae.anexo}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#1B4332] capitalize dark:bg-slate-800 dark:text-emerald-300">
                        {draft.cnae.category}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {draft.cnae.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {draft.cnae.fatorR
                        ? "✓ Atividade sujeita ao Fator R: se folha + pró-labore ≥ 28%, migra do Anexo V para o Anexo III."
                        : draft.cnae.meiAllowed
                          ? "✓ Atividade permitida no MEI (respeitando teto anual de R$ 81.000)."
                          : "Atividade não permitida no MEI — enquadramento a partir do Simples Nacional."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D6D3C7] bg-[#FAFAF7] p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                    Clique no campo acima e escolha a atividade da sua empresa para continuar.
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: RECEITA */}
            {step === 3 && (
              <div className="animate-fade-slide space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span>Informe seu faturamento bruto acumulado e do mês atual</span>
                  <EditorialTooltip
                    title="O que é RBT12?"
                    content="Receita Bruta Total dos últimos 12 meses. É usada pela Receita Federal para enquadrar sua empresa na faixa correta do Simples Nacional."
                    glossaryTerm="RBT12"
                    onOpenGlossary={onOpenGlossary}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <CurrencyInput
                    id="wizard-receita-mes"
                    label="Receita Bruta do Mês"
                    badge="Obrigatório"
                    value={draft.receitaMes}
                    onChange={(receitaMes) =>
                      onChangeDraft((prev) => ({ ...prev, receitaMes }))
                    }
                    helperText="Valor total faturado em notas fiscais no mês simulado."
                  />
                  <CurrencyInput
                    id="wizard-rbt12"
                    label="Receita Bruta 12 meses (RBT12)"
                    badge="Faixa"
                    value={draft.rbt12}
                    onChange={(rbt12) =>
                      onChangeDraft((prev) => ({ ...prev, rbt12 }))
                    }
                    helperText="Deixe R$ 0,00 se abriu a empresa agora (proporcionalizado por mês × 12)."
                  />
                </div>

                {/* Quick Presets (alteram APENAS faturamento, nunca fabricam folha) */}
                <div className="space-y-2">
                  <span className="block font-mono text-[11px] font-medium text-slate-500 uppercase dark:text-slate-400">
                    Atalhos rápidos de faturamento mensal
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "R$ 6 mil/mês (MEI)", mes: 6000, ano: 72000 },
                      { label: "R$ 10 mil/mês", mes: 10000, ano: 120000 },
                      { label: "R$ 15 mil/mês", mes: 15000, ano: 180000 },
                      { label: "R$ 30 mil/mês", mes: 30000, ano: 360000 },
                      { label: "R$ 60 mil/mês", mes: 60000, ano: 720000 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          onChangeDraft((prev) => ({
                            ...prev,
                            receitaMes: preset.mes,
                            rbt12: preset.ano,
                          }))
                        }
                        className="min-h-[38px] rounded-xl border border-[#E7E5DC] bg-[#FAFAF7] px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-[#1B4332] hover:text-[#1B4332] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FATOR R & PREMISSAS */}
            {step === 4 && (
              <div className="animate-fade-slide space-y-5">
                {isMei ? (
                  <div className="rounded-2xl border border-emerald-200/80 bg-[#ECFDF5] p-5 text-sm text-slate-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-slate-200">
                    <p className="font-serif text-base font-semibold text-[#1B4332] dark:text-emerald-300">
                      Tudo pronto para o cálculo do MEI!
                    </p>
                    <p className="mt-1 text-xs leading-relaxed">
                      No MEI o DAS é um valor fixo mensal (INSS + ICMS/ISS), sem necessidade de
                      informar Fator R ou pró-labore. Clique abaixo para ver o resultado completo e
                      comparar com outros regimes.
                    </p>
                  </div>
                ) : (
                  <>
                    {showFatorR && draft.cnae && (
                      <div className="rounded-2xl border border-amber-300/80 bg-[#FFFBEB] p-5 dark:border-amber-700/50 dark:bg-amber-950/20">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif text-base font-semibold text-amber-950 dark:text-amber-200">
                              Folha de Salários + Pró-labore (12 meses)
                            </span>
                            <EditorialTooltip
                              title="O que é Fator R?"
                              content="Se sua folha de pagamento + pró-labore nos últimos 12 meses for igual ou superior a 28% do RBT12, você sai do Anexo V (15,5%) e vai para o Anexo III (6%)."
                              glossaryTerm="Fator R"
                              onOpenGlossary={onOpenGlossary}
                            />
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${
                              fatorRAtual >= 0.28
                                ? "bg-emerald-100 text-[#1B4332] dark:bg-emerald-900 dark:text-emerald-200"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {formatPercent(fatorRAtual)}
                          </span>
                        </div>

                        <CurrencyInput
                          id="wizard-folha-12m"
                          label="Total da folha + pró-labore em 12 meses"
                          badge="Fator R"
                          value={draft.folha12m}
                          onChange={(folha12m) =>
                            onChangeDraft((prev) => ({
                              ...prev,
                              folha12m,
                              folhaMes: Math.round((folha12m / 12) * 100) / 100,
                            }))
                          }
                        />

                        {draft.cnae.fatorR && rbt12Ref > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const target12m = Math.ceil(rbt12Ref * 0.285);
                              onChangeDraft((prev) => ({
                                ...prev,
                                folha12m: target12m,
                                folhaMes: Math.round((target12m / 12) * 100) / 100,
                              }));
                            }}
                            className="mt-2.5 text-xs font-semibold text-[#1B4332] underline decoration-emerald-600/50 underline-offset-2 hover:text-[#2D6A4F] dark:text-emerald-300 dark:hover:text-emerald-200"
                          >
                            Simular com folha de 28,5% ({formatCurrency(Math.ceil(rbt12Ref * 0.285))}
                            /ano) para enquadrar no Anexo III
                          </button>
                        )}

                        {/* Visual 28% threshold bar */}
                        {draft.cnae.fatorR && (
                          <div className="mt-4">
                            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/80 ring-1 ring-amber-200 dark:bg-slate-900 dark:ring-slate-700">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  fatorRAtual >= 0.28 ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, (fatorRAtual / 0.4) * 100)}%`,
                                }}
                              />
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-amber-600"
                                style={{ left: "70%" }}
                                title="Limiar de 28%"
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-600 dark:text-slate-400">
                                Limiar: <strong>28%</strong>
                              </span>
                              <span
                                className={
                                  fatorRAtual >= 0.28
                                    ? "font-semibold text-emerald-700 dark:text-emerald-400"
                                    : "font-semibold text-rose-600 dark:text-rose-400"
                                }
                              >
                                {fatorRAtual >= 0.28
                                  ? "✓ Enquadrado no Anexo III (mais econômico)"
                                  : "Abaixo de 28% → Anexo V (alíquota maior)"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Anexo IV: Folha Mensal para CPP Patronal (20%) */}
                    {isAnexoIV && (
                      <div className="rounded-2xl border border-amber-300/80 bg-[#FFFBEB] p-5 dark:border-amber-700/50 dark:bg-amber-950/20">
                        <p className="mb-3 font-serif text-base font-semibold text-amber-950 dark:text-amber-200">
                          Folha Mensal + Pró-labore (Anexo IV — CPP 20% Separada)
                        </p>
                        <CurrencyInput
                          id="wizard-folha-anexo4"
                          label="Total mensal de folha + pró-labore"
                          badge="CPP 20%"
                          value={draft.folhaMes}
                          onChange={(folhaMes) =>
                            onChangeDraft((prev) => ({
                              ...prev,
                              folhaMes,
                              folha12m: Math.round(folhaMes * 12 * 100) / 100,
                            }))
                          }
                          helperText="No Anexo IV, a CPP Patronal de 20% é recolhida fora do DAS."
                        />
                      </div>
                    )}

                    {!showFatorR && !isAnexoIV && draft.cnae && (
                      <div className="rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                        Para o CNAE <strong>{draft.cnae.code}</strong> (Anexo {draft.cnae.anexo}), o
                        Fator R não é obrigatório. Você já pode ver o resultado ou ajustar o
                        pró-labore abaixo.
                      </div>
                    )}

                    {/* Pró-labore Toggle (desmarcado por padrão) */}
                    <div className="rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-4 dark:border-slate-700 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="wiz-inss-prolabore"
                          className="text-sm font-semibold text-[#111827] dark:text-slate-100"
                        >
                          Incluir INSS sobre Pró-labore (11%)
                        </label>
                        <input
                          id="wiz-inss-prolabore"
                          type="checkbox"
                          checked={draft.incluirInssProLabore}
                          onChange={(e) =>
                            onChangeDraft((prev) => ({
                              ...prev,
                              incluirInssProLabore: e.target.checked,
                            }))
                          }
                          className="h-5 w-5 rounded border-slate-300 accent-[#1B4332]"
                        />
                      </div>
                      {draft.incluirInssProLabore && (
                        <div className="mt-3">
                          <CurrencyInput
                            id="wiz-prolabore"
                            label="Pró-labore mensal dos sócios"
                            value={draft.proLaboreMes}
                            onChange={(proLaboreMes) =>
                              onChangeDraft((prev) => ({ ...prev, proLaboreMes }))
                            }
                            helperText="Limitado ao teto INSS 2026 (R$ 8.475,55)."
                          />
                        </div>
                      )}
                    </div>

                    {/* Advanced Toggle */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowAdvanced((v) => !v)}
                        className="inline-flex min-h-[44px] items-center gap-2 text-xs font-semibold text-[#1B4332] hover:underline dark:text-emerald-400"
                      >
                        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
                        {showAdvanced
                          ? "Ocultar premissas de ISS e Lucro Real"
                          : "Ajustar premissas de ISS, Lucro Presumido e Lucro Real"}
                      </button>
                      {showAdvanced && (
                        <div className="mt-3 grid grid-cols-1 gap-4 rounded-2xl border border-[#E7E5DC] bg-[#FAFAF7] p-4 text-xs sm:grid-cols-3 dark:border-slate-700 dark:bg-slate-900/60">
                          <div>
                            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                              <label htmlFor="wiz-iss">ISS Municipal</label>
                              <span className="font-mono">
                                {formatPercent(draft.issAliquota)}
                              </span>
                            </div>
                            <input
                              id="wiz-iss"
                              type="range"
                              min={0.02}
                              max={0.05}
                              step={0.005}
                              value={draft.issAliquota}
                              onChange={(e) =>
                                onChangeDraft((prev) => ({
                                  ...prev,
                                  issAliquota: Number(e.target.value),
                                }))
                              }
                              className="mt-2 w-full accent-[#1B4332]"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                              <label htmlFor="wiz-margem">Margem Lucro Real</label>
                              <span className="font-mono">
                                {Math.round(draft.margemLucroReal * 100)}%
                              </span>
                            </div>
                            <input
                              id="wiz-margem"
                              type="range"
                              min={0.02}
                              max={0.5}
                              step={0.01}
                              value={draft.margemLucroReal}
                              onChange={(e) =>
                                onChangeDraft((prev) => ({
                                  ...prev,
                                  margemLucroReal: Number(e.target.value),
                                }))
                              }
                              className="mt-2 w-full accent-[#1B4332]"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                              <label htmlFor="wiz-cred">Créditos PIS/COFINS</label>
                              <span className="font-mono">
                                {Math.round(draft.percentualCreditosPisCofins * 100)}%
                              </span>
                            </div>
                            <input
                              id="wiz-cred"
                              type="range"
                              min={0}
                              max={0.75}
                              step={0.05}
                              value={draft.percentualCreditosPisCofins}
                              onChange={(e) =>
                                onChangeDraft((prev) => ({
                                  ...prev,
                                  percentualCreditosPisCofins: Number(e.target.value),
                                }))
                              }
                              className="mt-2 w-full accent-[#1B4332]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Navigation Footer inside Card */}
            <div className="relative z-10 mt-8 flex items-center justify-between border-t border-[#E7E5DC] pt-6 dark:border-slate-700">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-[14px] border border-[#D6D3C7] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#F3F2EC] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Anterior
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  className="shadow-btn-brand inline-flex min-h-[48px] items-center gap-2 rounded-[14px] bg-[#1B4332] px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Próximo passo
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!readyForResult}
                  onClick={onFinish}
                  className="shadow-btn-brand inline-flex min-h-[50px] items-center gap-2 rounded-[14px] bg-[#F59E0B] px-7 py-3 text-sm font-bold text-[#111827] transition hover:-translate-y-0.5 hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                  Ver meu resultado agora
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LIVE SUMMARY PANEL (Desktop Sticky Sidebar) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="hero-forest-gradient sticky top-24 rounded-[24px] p-6 text-white shadow-xl">
            <p className="font-mono text-[11px] font-medium tracking-widest text-emerald-200 uppercase">
              RESUMO EM TEMPO REAL
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#FAFAF7]">
              {selectedEstimate
                ? selectedEstimate.nome
                : draft.regimeSelecionado
                  ? REGIME_LABELS[draft.regimeSelecionado]
                  : "Nova simulação"}
            </h2>

            <dl className="mt-5 divide-y divide-white/10 text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-emerald-200">Regime</dt>
                <dd className="font-medium text-white">
                  {draft.regimeSelecionado
                    ? REGIME_LABELS[draft.regimeSelecionado]
                    : "Aguardando..."}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-emerald-200">CNAE</dt>
                <dd className="font-mono font-medium text-white">
                  {draft.cnae ? draft.cnae.code : "Aguardando..."}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-emerald-200">Receita do mês</dt>
                <dd className="font-semibold text-white tabular-nums">
                  {draft.receitaMes > 0 ? formatCurrency(draft.receitaMes) : "Aguardando..."}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-emerald-200">RBT12</dt>
                <dd className="font-semibold text-white tabular-nums">
                  {draft.rbt12 > 0
                    ? formatCurrency(draft.rbt12)
                    : draft.receitaMes > 0
                      ? `${formatCurrency(draft.receitaMes * 12)} (proj.)`
                      : "—"}
                </dd>
              </div>
              {showFatorR && readyForResult && (
                <div className="flex justify-between py-2.5">
                  <dt className="text-emerald-200">Fator R</dt>
                  <dd className="font-mono font-semibold text-amber-300 tabular-nums">
                    {formatPercent(fatorRAtual)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <span className="block font-mono text-[10px] tracking-wider text-emerald-200 uppercase">
                PRÉVIA ESTIMADA
              </span>
              {selectedEstimate ? (
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="font-serif text-3xl font-bold text-[#FAFAF7] tabular-nums">
                    {selectedEstimate.elegivel
                      ? formatPercent(selectedEstimate.aliquotaEfetiva)
                      : "Inelegível"}
                  </span>
                  <span className="text-sm font-semibold text-amber-300 tabular-nums">
                    {selectedEstimate.elegivel
                      ? `${formatCurrency(selectedEstimate.valorMensal)}/mês`
                      : "—"}
                  </span>
                </div>
              ) : (
                <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/90">
                  Preencha o regime, o CNAE e a receita mensal (passos 1 a 3) para calcular a
                  prévia.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!readyForResult}
              onClick={onFinish}
              className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#F59E0B] px-4 py-2.5 text-sm font-bold text-[#111827] transition hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Ir direto para o Resultado
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </aside>
      </div>

      {/* MOBILE STICKY BOTTOM SUMMARY BAR */}
      <div className="fixed right-0 bottom-0 left-0 z-20 border-t border-emerald-900/30 bg-[#1B4332] px-4 py-3 text-white shadow-2xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div>
            <span className="block font-mono text-[10px] tracking-wider text-emerald-200 uppercase">
              {selectedEstimate ? `PRÉVIA · ${selectedEstimate.nome}` : `PASSO ${step} DE 4`}
            </span>
            <span className="font-serif text-base font-bold text-[#FAFAF7] tabular-nums sm:text-lg">
              {selectedEstimate
                ? selectedEstimate.elegivel
                  ? `${formatPercent(selectedEstimate.aliquotaEfetiva)} · ${formatCurrency(selectedEstimate.valorMensal)}/mês`
                  : "Regime inelegível"
                : "Complete os passos 1 a 3"}
            </span>
          </div>
          <button
            type="button"
            disabled={!readyForResult}
            onClick={onFinish}
            className="min-h-[44px] rounded-xl bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#111827] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Ver resultado →
          </button>
        </div>
      </div>
    </div>
  );
}
