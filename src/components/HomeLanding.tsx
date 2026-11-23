"use client";

import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  SlidersHorizontal,
  Scale,
  Search,
  Calculator,
  Sparkles,
  Split,
} from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/adsense";

interface HomeLandingProps {
  onStartCalculator: () => void;
  onOpenSplitPayment: () => void;
  onOpenEducationTopic: (topicId: string) => void;
}

export function HomeLanding({
  onStartCalculator,
  onOpenSplitPayment,
  onOpenEducationTopic,
}: HomeLandingProps) {
  const educationalCards = [
    {
      id: "cnae",
      num: "01",
      icon: Compass,
      title: "O que é CNAE?",
      desc: "O código da sua atividade define em qual anexo do Simples você se encaixa — e pode dobrar ou cortar seu imposto.",
    },
    {
      id: "fator-r",
      num: "02",
      icon: SlidersHorizontal,
      title: "O que é Fator R?",
      desc: "Se sua folha + pró-labore chegar a 28% do faturamento, você cai do Anexo V (15,5%) para o Anexo III (6%).",
    },
    {
      id: "regimes",
      num: "03",
      icon: Scale,
      title: "Simples, Presumido ou Real?",
      desc: "Compare os três regimes com números reais e descubra exatamente quando vale migrar de categoria.",
    },
  ];

  const steps = [
    {
      step: "PASSO 1",
      icon: Search,
      title: "Escolha o CNAE",
      desc: "Busque por código ou profissão com autocomplete inteligente e enquadramento automático.",
    },
    {
      step: "PASSO 2",
      icon: Calculator,
      title: "Informe a receita",
      desc: "Digite o RBT12 e o faturamento do mês em campos grandes com números tabulares.",
    },
    {
      step: "PASSO 3",
      icon: Sparkles,
      title: "Veja o resultado",
      desc: "Receba sua alíquota efetiva, gráfico do DAS, comparador e card pronto para postar.",
    },
  ];

  return (
    <div className="animate-fade-slide space-y-16 pb-12">
      {/* HERO EDITORIAL */}
      <section className="grid grid-cols-1 items-center gap-10 pt-4 lg:grid-cols-12 lg:gap-12 lg:pt-8">
        <div className="space-y-6 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-[#ECFDF5] px-3.5 py-1.5 text-xs font-semibold text-[#1B4332] dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            Baseado nas tabelas oficiais de 2026 · LC 123/2006 e LC 214/2025
          </div>

          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#111827] sm:text-5xl lg:text-[54px] dark:text-slate-50">
            Quanto a sua empresa paga de imposto?{" "}
            <span className="text-[#1B4332] italic dark:text-emerald-400">
              Descubra em 30 segundos.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            Calcule Simples Nacional, MEI, Lucro Presumido e Lucro Real a partir do seu CNAE,
            compare regimes lado a lado e entenda a Reforma Tributária sem juridiquês.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              type="button"
              onClick={onStartCalculator}
              className="shadow-btn-brand inline-flex min-h-[52px] items-center gap-2.5 rounded-[14px] bg-[#1B4332] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2D6A4F] active:translate-y-0 sm:text-base dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Calcular agora
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={onOpenSplitPayment}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-[14px] border border-[#D6D3C7] bg-white px-5 py-3.5 text-sm font-semibold text-[#1B4332] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1B4332]/40 hover:bg-[#F3F2EC] sm:text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Split className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
              Simular Split Payment
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong className="font-semibold text-[#1B4332] dark:text-emerald-400">
              Ferramenta 100% gratuita e sem cadastro
            </strong>{" "}
            · Exibimos anúncios discretos para ajudar a manter o servidor e as tabelas sempre atualizadas.
          </p>
        </div>

        {/* Abstract Editorial Hero Visual Card */}
        <div className="lg:col-span-5">
          <div className="hero-forest-gradient relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl sm:p-8">
            {/* Abstract Geometric SVG Illustration */}
            <svg
              aria-hidden="true"
              viewBox="0 0 420 145"
              fill="none"
              className="mb-6 h-32 w-full sm:h-36"
            >
              <circle cx="72" cy="72" r="56" fill="#2D6A4F" fillOpacity="0.72" />
              <circle cx="132" cy="48" r="32" fill="#F59E0B" fillOpacity="0.92" />
              <circle
                cx="72"
                cy="72"
                r="68"
                stroke="#A7F3D0"
                strokeOpacity="0.25"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
              <rect
                x="198"
                y="18"
                width="208"
                height="108"
                rx="18"
                stroke="#52B788"
                strokeOpacity="0.38"
                strokeWidth="1.5"
              />
              <path
                d="M214 102 C242 42, 286 88, 326 38 S378 68, 396 28"
                stroke="#A7F3D0"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="326" cy="38" r="5" fill="#FBBF24" />
              <circle cx="396" cy="28" r="5" fill="#FBBF24" />
            </svg>

            <p className="font-mono text-[11px] font-medium tracking-wider text-emerald-200 uppercase">
              SIMULAÇÃO INSTANTÂNEA · DEV SOFTWARE (CNAE 6201-5/01)
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-serif text-4xl font-bold tracking-tight text-[#FAFAF7] tabular-nums sm:text-5xl">
                8,4%
              </span>
              <span className="text-base font-medium text-emerald-100 tabular-nums">
                R$ 840,00 / mês
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-amber-300 ring-1 ring-white/15">
              <span>★</span>
              Economia estimada de R$ 6.480/ano com Fator R ≥ 28%
            </div>
          </div>
        </div>
      </section>

      {/* BANNER HORIZONTAL DISCRETO (HOME) */}
      <AdSlot slot={AD_SLOTS.home} format="auto" />

      {/* 3 BLOCOS EDUCATIVOS */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
              EDUCAÇÃO FISCAL SEM BUROCRACIA
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl dark:text-slate-50">
              Entenda os conceitos sem dor de cabeça
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {educationalCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.id}
                className="shadow-card group flex flex-col justify-between rounded-[22px] border border-[#E7E5DC]/80 bg-white p-6 transition-all duration-200 hover:-translate-y-1 dark:border-slate-700/80 dark:bg-slate-800"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-[#ECFDF5] px-2.5 py-1 font-mono text-xs font-medium text-[#1B4332] dark:bg-emerald-950 dark:text-emerald-300">
                      {card.num}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAF7] text-[#1B4332] dark:bg-slate-700/70 dark:text-emerald-300">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-[#111827] dark:text-slate-50">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {card.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenEducationTopic(card.id)}
                  className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#1B4332] transition group-hover:gap-2.5 dark:text-emerald-400"
                >
                  Saiba mais
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* COMO FUNCIONA — 3 PASSOS */}
      <section className="rounded-[28px] border border-[#E7E5DC] bg-[#F3F2EC] p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-widest text-amber-700 uppercase dark:text-amber-400">
              RÁPIDO E DIRETO AO PONTO
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl dark:text-slate-50">
              Como funciona
            </h2>
          </div>
          <button
            type="button"
            onClick={onStartCalculator}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#1B4332] hover:underline dark:text-emerald-400"
          >
            Começar simulação agora
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="shadow-card rounded-[20px] bg-white p-6 dark:border dark:border-slate-700/70 dark:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-amber-600 dark:text-amber-400">
                    {s.step}
                  </span>
                  <Icon className="h-5 w-5 text-[#1B4332] dark:text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="mt-3 font-serif text-lg font-semibold text-[#111827] dark:text-slate-50">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
