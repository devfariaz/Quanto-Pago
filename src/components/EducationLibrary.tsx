"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Compass,
  Lightbulb,
  Scale,
  SlidersHorizontal,
  Split,
  TrendingUp,
} from "lucide-react";

interface EducationLibraryProps {
  initialTopicId?: string | null;
  onStartCalculator: () => void;
}

interface TopicArticle {
  id: string;
  tag: string;
  title: string;
  summary: string;
  readTime: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  didYouKnow: string;
  body: string[];
  widget?: "fator-r" | "timeline";
}

const ARTICLES: TopicArticle[] = [
  {
    id: "cnae",
    tag: "01 · CNAE",
    title: "O que é CNAE e por que ele muda tudo",
    summary: "Como o código da sua atividade define o anexo do Simples e pode cortar seu imposto pela metade.",
    readTime: "4 min leitura",
    icon: Compass,
    didYouKnow:
      "Empresas de tecnologia, design, marketing e saúde costumam ter CNAEs no Anexo V (15,5%) — mas o Fator R permite tributar no Anexo III (6%).",
    body: [
      "O CNAE (Classificação Nacional de Atividades Econômicas) é o código de 7 dígitos registrado no seu CNPJ que informa à Receita Federal exatamente o que sua empresa faz.",
      "No Simples Nacional, cada CNAE aponta para um dos cinco Anexos (I Comércio, II Indústria, III Serviços, IV Serviços com CPP separada, ou V Serviços intelectuais). Escolher o código errado ou desatualizado pode fazer você pagar quase o dobro de imposto legalmente evitável.",
    ],
  },
  {
    id: "fator-r",
    tag: "02 · FATOR R",
    title: "Fator R explicado sem juridiquês",
    summary: "Arraste o slider interativo abaixo e veja o anexo mudar ao cruzar a marca mágica dos 28%.",
    readTime: "5 min leitura",
    icon: SlidersHorizontal,
    didYouKnow:
      "Apenas ajustar o pró-labore em 2% pode fazer um prestador de serviços economizar mais de R$ 7.000/ano ao cruzar o limiar de 28% do Fator R.",
    body: [
      "O Fator R é simplesmente a divisão entre tudo o que você gastou com folha de pagamento + pró-labore nos últimos 12 meses e o seu faturamento bruto dos últimos 12 meses (RBT12).",
      "Se o resultado for igual ou maior que 28%, atividades do Anexo V (alíquota inicial de 15,5%) passam automaticamente para o Anexo III (alíquota inicial de 6%).",
    ],
    widget: "fator-r",
  },
  {
    id: "regimes",
    tag: "03 · REGIMES",
    title: "Simples, Presumido ou Real: qual escolher?",
    summary: "Comparativo visual por faixa de faturamento, folha salarial e margem de lucro.",
    readTime: "6 min leitura",
    icon: Scale,
    didYouKnow:
      "Nem sempre o Simples Nacional é o mais barato: empresas de serviços sem folha (Fator R < 28%) frequentemente pagam menos no Lucro Presumido.",
    body: [
      "Simples Nacional: reúne até 8 tributos na guia única (DAS) para empresas até R$ 4,8 milhões/ano. Imbatível quando você está nos Anexos I, II ou III.",
      "Lucro Presumido: a Receita presume uma margem fixa de lucro (8% comércio, 32% serviços). Excelente para prestadores com margem alta e folha baixa.",
      "Lucro Real: calcula IRPJ e CSLL sobre o lucro contábil real e dá créditos de PIS/COFINS. Brilha em negócios com margens apertadas ou muitos insumos.",
    ],
  },
  {
    id: "reforma",
    tag: "04 · REFORMA",
    title: "Reforma Tributária para pequenos negócios",
    summary: "Timeline visual completa de 2026 a 2033: IBS, CBS, Simples Híbrido e o que muda a cada ano.",
    readTime: "7 min leitura",
    icon: TrendingUp,
    didYouKnow:
      "O Simples Nacional continua existindo após a Reforma, mas quem vende para outras empresas (B2B) poderá optar pelo Simples Híbrido para transferir crédito integral de IBS/CBS.",
    body: [
      "A LC 214/2025 substitui cinco tributos (PIS, COFINS, IPI, ICMS e ISS) pelo IVA Dual: CBS (federal) e IBS (estadual/municipal), com transição gradual entre 2026 e 2033.",
      "Veja abaixo os marcos anuais para planejar seu caixa com antecedência:",
    ],
    widget: "timeline",
  },
  {
    id: "split",
    tag: "05 · CAIXA",
    title: "Split Payment: o que muda no seu caixa",
    summary: "Entenda na prática o que acontece quando R$ 1.000 entram via Pix ou cartão com retenção automática.",
    readTime: "4 min leitura",
    icon: Split,
    didYouKnow:
      "Com o Split Payment, a parte do imposto nem chega a cair na sua conta — reduzindo o risco de atrasar guias, mas exigindo atenção ao capital de giro.",
    body: [
      "No modelo atual, você recebe 100% da venda hoje e só paga o imposto no dia 20 do mês seguinte. No Split Payment, o meio de pagamento separa o IBS e a CBS automaticamente no instante da liquidação.",
      "Em 2026, o teste é simbólico (0,1% IBS + 0,9% CBS compensáveis). A partir de 2027, o mecanismo passa a operar de fato com a entrada da CBS.",
    ],
  },
  {
    id: "mei-simples",
    tag: "06 · MIGRAÇÃO",
    title: "MEI vs. Simples: quando vale migrar",
    summary: "Teto de R$ 81 mil, regra dos 20% de excesso e como fazer a transição sem multas retroativas.",
    readTime: "5 min leitura",
    icon: BookOpen,
    didYouKnow:
      "Se você ultrapassar o teto do MEI em até 20% (até R$ 97.200), migra só no ano seguinte. Acima de 20%, o desenquadramento retroage a janeiro do mesmo ano!",
    body: [
      "O MEI é a porta de entrada mais barata do Brasil (guia fixa mensal em torno de R$ 81 a R$ 87 em 2026), mas tem limite anual de R$ 81.000 e restrição de CNAEs intelectuais.",
      "Ao se aproximar de R$ 6.750/mês de média, vale simular o Simples Nacional (ME) com antecedência para evitar surpresas no caixa.",
    ],
  },
];

const TIMELINE_MILESTONES = [
  {
    year: "2026",
    title: "Ano-teste",
    desc: "Alíquotas simbólicas de 0,1% (IBS) e 0,9% (CBS), compensáveis no PIS/COFINS. Simples mantido.",
    badge: "bg-amber-500 text-[#111827]",
    border: "border-amber-400/70",
  },
  {
    year: "2027",
    title: "CBS entra em vigor",
    desc: "PIS e COFINS são extintos. Split Payment começa a operar de verdade no fluxo de caixa.",
    badge: "bg-[#1B4332] text-white",
    border: "border-[#1B4332]/50",
  },
  {
    year: "2029–2032",
    title: "Transição gradual",
    desc: "ICMS e ISS caem progressivamente (10% a 40%) enquanto o IBS sobe na mesma proporção.",
    badge: "bg-[#2D6A4F] text-white",
    border: "border-emerald-600/50",
  },
  {
    year: "2033",
    title: "Novo sistema 100%",
    desc: "ICMS e ISS totalmente extintos. Novo IVA Dual (IBS + CBS) em vigência plena no Brasil.",
    badge: "bg-emerald-600 text-white",
    border: "border-emerald-500/70",
  },
];

export function EducationLibrary({
  initialTopicId,
  onStartCalculator,
}: EducationLibraryProps) {
  const [activeId, setActiveId] = useState<string | null>(initialTopicId ?? null);
  const [fatorRSlider, setFatorRSlider] = useState<number>(28.5);

  const activeArticle = ARTICLES.find((a) => a.id === activeId) ?? null;

  return (
    <div className="animate-fade-slide space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
            BIBLIOTECA TRIBUTÁRIA EDITORIAL
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl dark:text-slate-50">
            {activeArticle ? activeArticle.title : "Aprenda impostos sem juridiquês"}
          </h1>
          {!activeArticle && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
              Guias rápidos e interativos com exemplos reais para empreendedores, freelancers e
              contadores.
            </p>
          )}
        </div>

        {activeArticle && (
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[14px] border border-[#D6D3C7] bg-white px-4 py-2 text-sm font-semibold text-[#1B4332] transition hover:bg-[#F3F2EC] dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Voltar para todos os guias
          </button>
        )}
      </div>

      {/* ARTICLE DETAIL VIEW */}
      {activeArticle ? (
        <article className="shadow-card mx-auto max-w-3xl space-y-6 rounded-[28px] border border-[#E7E5DC] bg-white p-6 sm:p-10 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E5DC] pb-4 dark:border-slate-700">
            <span className="font-mono text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400">
              {activeArticle.tag}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              {activeArticle.readTime}
            </span>
          </div>

          <div className="space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-200">
            {activeArticle.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* Interactive Fator R Slider Widget */}
          {activeArticle.widget === "fator-r" && (
            <div className="rounded-[22px] border border-[#E7E5DC] bg-[#FAFAF7] p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[#2D6A4F] uppercase dark:text-emerald-400">
                  SLIDER INTERATIVO · FATOR R
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-mono text-xs font-bold tabular-nums ${
                    fatorRSlider >= 28
                      ? "bg-emerald-100 text-[#1B4332] dark:bg-emerald-900 dark:text-emerald-200"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  Folha = {fatorRSlider.toFixed(1).replace(".", ",")}% →{" "}
                  {fatorRSlider >= 28 ? "Anexo III (6,0%)" : "Anexo V (15,5%)"}
                </span>
              </div>

              <input
                type="range"
                min={5}
                max={45}
                step={0.5}
                value={fatorRSlider}
                onChange={(e) => setFatorRSlider(Number(e.target.value))}
                aria-label="Simular percentual do Fator R"
                className="mt-5 h-3 w-full cursor-pointer accent-[#1B4332]"
              />

              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span className="text-rose-600 dark:text-rose-400">Anexo V · 15,5% (&lt; 28%)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">▲ Limiar 28%</span>
                <span className="text-emerald-600 dark:text-emerald-400">Anexo III · 6,0% (≥ 28%) ✓</span>
              </div>
            </div>
          )}

          {/* Reforma Timeline Widget */}
          {activeArticle.widget === "timeline" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TIMELINE_MILESTONES.map((m) => (
                <div
                  key={m.year}
                  className={`rounded-2xl border bg-[#FAFAF7] p-5 dark:bg-slate-900 ${m.border}`}
                >
                  <span className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${m.badge}`}>
                    {m.year}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-semibold text-[#111827] dark:text-slate-50">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Blockquote "Você sabia?" */}
          <div className="rounded-2xl border border-amber-300 bg-[#FFFBEB] p-5 dark:border-amber-700/50 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-800 uppercase dark:text-amber-300">
              <Lightbulb className="h-4 w-4 text-amber-500" strokeWidth={1.75} />
              Você sabia?
            </div>
            <p className="mt-2 text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-200">
              {activeArticle.didYouKnow}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onStartCalculator}
              className="shadow-btn-brand inline-flex min-h-[48px] items-center gap-2 rounded-[14px] bg-[#1B4332] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2D6A4F] dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Simular com meus números agora →
            </button>
          </div>
        </article>
      ) : (
        <>
          {/* HUB GRID (6 MÓDULOS) */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((art) => {
              const Icon = art.icon;
              return (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setActiveId(art.id)}
                  className="shadow-card group flex flex-col justify-between rounded-[22px] border border-[#E7E5DC] bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-[#2D6A4F] dark:text-emerald-400">
                        {art.tag}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        {art.readTime}
                      </span>
                    </div>
                    <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#1B4332] dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <h2 className="mt-4 font-serif text-xl leading-snug font-semibold text-[#111827] dark:text-slate-50">
                      {art.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {art.summary}
                    </p>
                  </div>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4332] transition group-hover:gap-2.5 dark:text-emerald-400">
                    Ler guia interativo →
                  </span>
                </button>
              );
            })}
          </div>

          {/* INLINE SHAREABLE TIMELINE PREVIEW */}
          <section className="shadow-card rounded-[28px] border border-[#E7E5DC] bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
              INFOGRÁFICO · TRANSIÇÃO IBS + CBS
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#111827] sm:text-3xl dark:text-slate-50">
              Timeline da Reforma Tributária (2026–2033)
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TIMELINE_MILESTONES.map((m) => (
                <div
                  key={m.year}
                  className={`rounded-2xl border bg-[#FAFAF7] p-5 dark:bg-slate-900 ${m.border}`}
                >
                  <span className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-bold ${m.badge}`}>
                    {m.year}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-semibold text-[#111827] dark:text-slate-50">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
