"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Menu,
  Moon,
  Sun,
  X,
  ArrowRight,
  Calculator,
  Sparkles,
} from "lucide-react";
import type {
  CnaeItem,
  SimplesData2026,
  SimulationDraft,
  SimulationInput,
} from "@/types/tax";
import { loadCnaes, loadSimplesData } from "@/lib/data-loader";
import { compareAllRegimes } from "@/lib/tax/comparator";
import { HomeLanding } from "@/components/HomeLanding";
import { BrandIcon } from "@/components/BrandLogo";
import { CookieConsent } from "@/components/CookieConsent";
import { AD_SLOTS } from "@/lib/adsense";

function SectionLoader() {
  return (
    <div className="space-y-5 py-4">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-[#E7E5DC] dark:bg-slate-800" />
      <div className="h-56 w-full animate-pulse rounded-[24px] bg-[#E7E5DC]/80 dark:bg-slate-800" />
    </div>
  );
}

// Code-splitting: só carrega cada tela quando o usuário navega até ela
const CalculatorWizard = dynamic(
  () => import("@/components/CalculatorWizard").then((m) => m.CalculatorWizard),
  { loading: SectionLoader }
);
const ResultsSummary = dynamic(
  () => import("@/components/ResultsSummary").then((m) => m.ResultsSummary),
  { loading: SectionLoader }
);
const CalculationMemory = dynamic(
  () => import("@/components/CalculationMemory").then((m) => m.CalculationMemory),
  { loading: SectionLoader }
);
const RegimeComparator = dynamic(
  () => import("@/components/RegimeComparator").then((m) => m.RegimeComparator),
  { loading: SectionLoader }
);
const PfVsPjSimulator = dynamic(
  () => import("@/components/PfVsPjSimulator").then((m) => m.PfVsPjSimulator),
  { loading: SectionLoader }
);
const EducationLibrary = dynamic(
  () => import("@/components/EducationLibrary").then((m) => m.EducationLibrary),
  { loading: SectionLoader }
);
const SplitPaymentView = dynamic(
  () => import("@/components/SplitPaymentView").then((m) => m.SplitPaymentView),
  { loading: SectionLoader }
);
const VisualGlossary = dynamic(
  () => import("@/components/VisualGlossary").then((m) => m.VisualGlossary),
  { loading: SectionLoader }
);
const PrintReport = dynamic(
  () => import("@/components/PrintReport").then((m) => m.PrintReport),
  { ssr: false }
);
const LegalDisclaimer = dynamic(
  () => import("@/components/LegalDisclaimer").then((m) => m.LegalDisclaimer)
);
const AdSlot = dynamic(
  () => import("@/components/AdSlot").then((m) => m.AdSlot)
);

type ActiveView =
  | "home"
  | "wizard"
  | "resultado"
  | "comparador"
  | "biblioteca"
  | "split-payment"
  | "glossario";

const NAV_ITEMS: { id: ActiveView; label: string }[] = [
  { id: "home", label: "Início" },
  { id: "wizard", label: "Calculadora" },
  { id: "resultado", label: "Resultado" },
  { id: "comparador", label: "Comparador" },
  { id: "biblioteca", label: "Biblioteca" },
  { id: "split-payment", label: "Split Payment" },
  { id: "glossario", label: "Glossário" },
];

const INITIAL_DRAFT: SimulationDraft = {
  cnae: null,
  regimeSelecionado: null,
  rbt12: 0,
  receitaMes: 0,
  folha12m: 0,
  folhaMes: 0,
  proLaboreMes: 0,
  incluirInssProLabore: false,
  issAliquota: 0.03,
  margemLucroReal: 0.18,
  percentualCreditosPisCofins: 0.3,
  percentualInsumosIva: 0.25,
};

export function TaxCalculatorApp() {
  const [cnaes, setCnaes] = useState<CnaeItem[]>([]);
  const [simplesData, setSimplesData] = useState<SimplesData2026 | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [educationTopic, setEducationTopic] = useState<string | null>(null);
  const [glossaryQuery, setGlossaryQuery] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [draft, setDraft] = useState<SimulationDraft>(INITIAL_DRAFT);

  // Sync Dark Mode with <html class="dark"> (segue o tema do sistema se não houver escolha manual)
  useEffect(() => {
    const saved =
      window.localStorage.getItem("quantopago-theme") ||
      window.localStorage.getItem("aliquota-theme");
    const prefersDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("quantopago-theme", next ? "dark" : "light");
      return next;
    });
  }

  // Carregamento sob demanda dos JSONs estáticos em segundo plano (sem bloquear a Home)
  useEffect(() => {
    let active = true;
    Promise.all([loadCnaes(), loadSimplesData()]).then(([cnaeList, simples]) => {
      if (!active) return;
      setCnaes(cnaeList);
      setSimplesData(simples);
    });
    return () => {
      active = false;
    };
  }, []);

  // Só gera SimulationInput válido quando o usuário escolheu regime, CNAE e receita > 0
  const simulationInput: SimulationInput | null = useMemo(() => {
    if (!draft.cnae || !draft.regimeSelecionado || draft.receitaMes <= 0) {
      return null;
    }
    return {
      ...draft,
      cnae: draft.cnae,
      regimeSelecionado: draft.regimeSelecionado,
    };
  }, [draft]);

  const computed = useMemo(() => {
    if (!simulationInput || !simplesData) return null;
    return compareAllRegimes(simulationInput, simplesData);
  }, [simulationInput, simplesData]);

  // Fallback seguro apenas para a tela independente de Split Payment caso o usuário ainda não tenha simulado
  const splitPaymentInput: SimulationInput | null = useMemo(() => {
    if (simulationInput) return simulationInput;
    const fallbackCnae =
      draft.cnae ?? cnaes.find((c) => c.code.startsWith("6201")) ?? cnaes[0];
    if (!fallbackCnae) return null;
    return {
      ...draft,
      cnae: fallbackCnae,
      regimeSelecionado: draft.regimeSelecionado ?? "SIMPLES_NACIONAL",
      receitaMes: draft.receitaMes > 0 ? draft.receitaMes : 10000,
      rbt12: draft.rbt12 > 0 ? draft.rbt12 : 120000,
    };
  }, [simulationInput, draft, cnaes]);

  function handleSelectCnae(cnae: CnaeItem) {
    setDraft((prev) => ({
      ...prev,
      cnae,
      issAliquota: cnae.defaultIssRate > 0 ? cnae.defaultIssRate : prev.issAliquota,
    }));
  }

  function handleLoadExample() {
    const exampleCnae =
      cnaes.find((c) => c.code.startsWith("6201")) ?? cnaes[0];
    if (!exampleCnae) return;
    setDraft({
      cnae: exampleCnae,
      regimeSelecionado: "SIMPLES_NACIONAL",
      rbt12: 180000,
      receitaMes: 15000,
      folha12m: 51300,
      folhaMes: 4275,
      proLaboreMes: 0,
      incluirInssProLabore: false,
      issAliquota: exampleCnae.defaultIssRate || 0.03,
      margemLucroReal: 0.18,
      percentualCreditosPisCofins: 0.3,
      percentualInsumosIva: 0.25,
    });
  }

  function navigateTo(view: ActiveView) {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpenGlossary(term: string) {
    setGlossaryQuery(term);
    navigateTo("glossario");
  }

  function handleOpenEducationTopic(topicId: string) {
    setEducationTopic(topicId);
    navigateTo("biblioteca");
  }

  function handleExportPdf() {
    window.print();
  }

  const selectedEstimate =
    computed && simulationInput
      ? computed.comparativo.find(
          (r) => r.regime === simulationInput.regimeSelecionado
        ) ?? computed.comparativo[1]
      : null;

  const emptySimulationCard = (screenTitle: string) => (
    <section className="animate-fade-slide shadow-card mx-auto max-w-2xl rounded-[28px] border border-[#E7E5DC] bg-white p-8 text-center sm:p-10 dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#1B4332] dark:bg-emerald-950 dark:text-emerald-300">
        <Calculator className="h-7 w-7" strokeWidth={1.6} />
      </div>
      <h1 className="mt-5 font-serif text-2xl font-semibold text-[#111827] sm:text-3xl dark:text-slate-50">
        Preencha seus dados para ver o {screenTitle}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Não exibimos valores fictícios para evitar números incorretos. Informe o regime, o CNAE e a
        receita mensal na calculadora — leva menos de 30 segundos.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigateTo("wizard")}
          className="shadow-btn-brand inline-flex min-h-[48px] items-center gap-2 rounded-[14px] bg-[#1B4332] px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2D6A4F] dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Ir para a Calculadora
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={handleLoadExample}
          disabled={cnaes.length === 0}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-[14px] border border-[#D6D3C7] bg-[#FAFAF7] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#F3F2EC] disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Sparkles className="h-4 w-4 text-amber-500" strokeWidth={1.75} />
          Carregar exemplo ilustrativo
        </button>
      </div>
    </section>
  );

  return (
    <>
      <div className="no-print flex min-h-screen flex-col bg-[#FAFAF7] text-[#111827] transition-colors dark:bg-[#0F172A] dark:text-slate-50">
        {/* STICKY EDITORIAL NAVBAR */}
        <header className="sticky top-0 z-30 border-b border-[#E7E5DC]/90 bg-[#FAFAF7]/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A]/90">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-3.5 md:px-8">
            {/* Brand Logo */}
            <button
              type="button"
              onClick={() => navigateTo("home")}
              className="flex min-h-[44px] items-center gap-2.5 text-left"
            >
              <BrandIcon className="h-9 w-9 shrink-0 shadow-xs" />
              <span className="font-serif text-xl font-semibold tracking-tight text-[#111827] dark:text-slate-50">
                Quanto<span className="text-[#1B4332] dark:text-emerald-400">Pago</span>
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav
              aria-label="Navegação principal"
              className="hidden items-center gap-1 lg:flex"
            >
              {NAV_ITEMS.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`min-h-[40px] rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-[#ECFDF5] text-[#1B4332] dark:bg-emerald-950/70 dark:text-emerald-300"
                        : "text-slate-600 hover:bg-[#F3F2EC] hover:text-[#111827] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Dark Mode + Primary CTA + Mobile Hamburger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E7E5DC] bg-white text-slate-700 transition hover:bg-[#F3F2EC] dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Moon className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>

              <button
                type="button"
                onClick={() => navigateTo("wizard")}
                className="hidden min-h-[44px] items-center gap-1.5 rounded-[12px] bg-[#1B4332] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2D6A4F] sm:inline-flex dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Calcular agora
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Abrir menu"
                aria-expanded={mobileMenuOpen}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E7E5DC] bg-white text-[#1B4332] lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" strokeWidth={1.75} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <nav
              aria-label="Menu mobile"
              className="animate-fade-slide border-t border-[#E7E5DC] bg-[#FAFAF7] px-5 py-4 lg:hidden dark:border-slate-800 dark:bg-[#0F172A]"
            >
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`min-h-[44px] rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                        active
                          ? "bg-[#1B4332] text-white dark:bg-emerald-600"
                          : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          )}
        </header>

        {/* MAIN CONTAINER (max-w-[1200px], base 8px) */}
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 md:px-8 lg:py-10">
          {activeView === "home" && (
            <HomeLanding
              onStartCalculator={() => navigateTo("wizard")}
              onOpenSplitPayment={() => navigateTo("split-payment")}
              onOpenEducationTopic={handleOpenEducationTopic}
            />
          )}

          {activeView === "wizard" &&
            (cnaes.length > 0 ? (
              <CalculatorWizard
                cnaes={cnaes}
                draft={draft}
                selectedEstimate={selectedEstimate}
                onChangeDraft={setDraft}
                onSelectCnae={handleSelectCnae}
                onFinish={() => navigateTo("resultado")}
                onOpenGlossary={handleOpenGlossary}
              />
            ) : (
              <SectionLoader />
            ))}

          {activeView === "resultado" &&
            (simulationInput && computed && selectedEstimate ? (
              <div className="space-y-8">
                <ResultsSummary
                  input={simulationInput}
                  mei={computed.mei}
                  simples={computed.simples}
                  selectedEstimate={selectedEstimate}
                  comparativo={computed.comparativo}
                  melhorRegime={computed.melhorRegime}
                  onExportPdf={handleExportPdf}
                  onSimulateAnother={() => navigateTo("wizard")}
                />

                {/* BANNER NO RESULTADO (entre o resumo e a memória de cálculo) */}
                <AdSlot slot={AD_SLOTS.resultado} format="auto" />

                <CalculationMemory
                  title={
                    simulationInput.regimeSelecionado === "MEI"
                      ? "Memória de Cálculo — MEI (2026)"
                      : "Memória de Cálculo — Simples Nacional (2026)"
                  }
                  steps={
                    simulationInput.regimeSelecionado === "MEI"
                      ? computed.mei.memoria
                      : computed.simples.memoria
                  }
                />

                <LegalDisclaimer />
              </div>
            ) : (
              emptySimulationCard("resultado")
            ))}

          {activeView === "comparador" &&
            (simulationInput && computed && simplesData ? (
              <div className="space-y-10">
                <RegimeComparator
                  comparativo={computed.comparativo}
                  melhorRegime={computed.melhorRegime}
                  selectedRegime={simulationInput.regimeSelecionado}
                  onSelectRegime={(regime) => {
                    setDraft((prev) => ({ ...prev, regimeSelecionado: regime }));
                    navigateTo("resultado");
                  }}
                />

                <PfVsPjSimulator input={simulationInput} simplesData={simplesData} />
                <LegalDisclaimer />
              </div>
            ) : (
              emptySimulationCard("comparador")
            ))}

          {activeView === "biblioteca" && (
            <EducationLibrary
              initialTopicId={educationTopic}
              onStartCalculator={() => navigateTo("wizard")}
            />
          )}

          {activeView === "split-payment" &&
            (splitPaymentInput && simplesData ? (
              <SplitPaymentView
                input={splitPaymentInput}
                simplesData={simplesData}
                onChangeInsumos={(percentualInsumosIva) =>
                  setDraft((prev) => ({ ...prev, percentualInsumosIva }))
                }
              />
            ) : (
              <SectionLoader />
            ))}

          {activeView === "glossario" && (
            <VisualGlossary initialQuery={glossaryQuery} />
          )}
        </main>

        {/* FOOTER MINIMALISTA */}
        <footer className="mt-auto border-t border-[#E7E5DC] bg-[#FAFAF7] py-7 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 px-5 text-xs text-slate-500 sm:flex-row sm:items-center md:px-8 dark:text-slate-400">
            <p>
              <strong className="font-serif text-sm text-[#1B4332] dark:text-emerald-400">
                QuantoPago
              </strong>{" "}
              © 2026 · Ferramenta 100% gratuita, mantida por anúncios para custear o servidor e
              manter as tabelas (LC 123/2006 e LC 214/2025) atualizadas. Consulte seu contador.
            </p>
            <div className="flex flex-wrap items-center gap-4 font-medium text-[#1B4332] dark:text-emerald-400">
              <button
                type="button"
                onClick={() => navigateTo("glossario")}
                className="hover:underline"
              >
                Glossário
              </button>
              <button
                type="button"
                onClick={() => navigateTo("biblioteca")}
                className="hover:underline"
              >
                Biblioteca
              </button>
              <Link href="/sobre/" className="hover:underline">
                Sobre & Contato
              </Link>
              <Link href="/privacidade/" className="hover:underline">
                Privacidade (LGPD)
              </Link>
              <Link href="/termos/" className="hover:underline">
                Termos de Uso
              </Link>
            </div>
          </div>
        </footer>
      </div>

      <CookieConsent />

      {/* Versão dedicada para impressão / Exportação em PDF */}
      {simulationInput && computed && selectedEstimate && (
        <PrintReport
          input={simulationInput}
          simples={computed.simples}
          comparativo={computed.comparativo}
          selectedEstimate={selectedEstimate}
        />
      )}
    </>
  );
}
