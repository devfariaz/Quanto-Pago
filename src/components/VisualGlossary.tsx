"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface VisualGlossaryProps {
  initialQuery?: string;
}

const GLOSSARY_TERMS = [
  {
    term: "Alíquota Efetiva",
    letter: "A",
    definition:
      "Percentual real que você paga sobre o faturamento após descontar a parcela a deduzir da tabela do Simples.",
    example: "Ex.: Nominal 11,2% → Efetiva 8,4%",
  },
  {
    term: "CBS",
    letter: "C",
    definition:
      "Contribuição sobre Bens e Serviços: tributo federal do novo IVA Dual que substitui PIS e COFINS a partir de 2027.",
    example: "Ex.: Alíquota-teste 0,9% em 2026",
  },
  {
    term: "CNAE",
    letter: "C",
    definition:
      "Código numérico de 7 dígitos que identifica a atividade da sua empresa e define em qual Anexo ela é tributada.",
    example: "Ex.: 6201-5/01 (Dev de Software)",
  },
  {
    term: "CPP",
    letter: "C",
    definition:
      "Contribuição Patronal Previdenciária (INSS da empresa). Já está embutida no DAS, exceto no Anexo IV.",
    example: "Ex.: 20% sobre a folha no Anexo IV",
  },
  {
    term: "DAS",
    letter: "D",
    definition:
      "Documento de Arrecadação do Simples Nacional: guia única mensal com vencimento todo dia 20 que reúne até 8 tributos.",
    example: "Ex.: IRPJ + CSLL + PIS + COFINS + CPP + ISS/ICMS",
  },
  {
    term: "Fator R",
    letter: "F",
    definition:
      "Relação entre sua folha de salários + pró-labore (12m) e o RBT12. Se for ≥ 28%, reduz o imposto do Anexo V para o Anexo III.",
    example: "Ex.: Folha 28,5% → cai de 15,5% para 6%",
  },
  {
    term: "IBS",
    letter: "I",
    definition:
      "Imposto sobre Bens e Serviços: tributo estadual e municipal que substituirá gradualmente o ICMS e o ISS até 2033.",
    example: "Ex.: Alíquota-teste 0,1% em 2026",
  },
  {
    term: "MEI",
    letter: "M",
    definition:
      "Microempreendedor Individual: categoria simplificada com guia mensal fixa e limite de faturamento de R$ 81.000/ano.",
    example: "Ex.: DAS fixo ~R$ 82/mês em 2026",
  },
  {
    term: "Pró-labore",
    letter: "P",
    definition:
      "Remuneração mensal oficial dos sócios administradores. Incide 11% de INSS (até o teto) e entra no cálculo do Fator R.",
    example: "Ex.: R$ 3.500/mês → INSS R$ 385,00",
  },
  {
    term: "RBT12",
    letter: "R",
    definition:
      "Receita Bruta Total acumulada nos últimos 12 meses. Define a faixa de alíquota da sua empresa no Simples Nacional.",
    example: "Ex.: R$ 180.000,00 = Faixa 1/2",
  },
  {
    term: "Simples Híbrido",
    letter: "S",
    definition:
      "Opção criada pela LC 214/2025 que permite recolher IBS e CBS fora do DAS para transferir crédito integral a clientes B2B.",
    example: "Ex.: Útil para quem vende para grandes empresas",
  },
  {
    term: "Split Payment",
    letter: "S",
    definition:
      "Mecanismo da Reforma Tributária que retém IBS e CBS automaticamente no momento do pagamento via Pix ou cartão.",
    example: "Ex.: R$ 1.000 → R$ 970 caixa + R$ 30 retido",
  },
];

export function VisualGlossary({ initialQuery = "" }: VisualGlossaryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedLetter, setSelectedLetter] = useState<string>("TODOS");

  const letters = useMemo(() => {
    const set = Array.from(new Set(GLOSSARY_TERMS.map((t) => t.letter))).sort();
    return ["TODOS", ...set];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((item) => {
      const matchesLetter =
        selectedLetter === "TODOS" || item.letter === selectedLetter;
      const matchesQuery =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q);
      return matchesLetter && matchesQuery;
    });
  }, [query, selectedLetter]);

  return (
    <div className="animate-fade-slide space-y-7 pb-12">
      <div>
        <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
          TRADUTOR DE CONTABILÊS
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl dark:text-slate-50">
          Glossário Tributário Visual
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
          Definições em uma frase com exemplos práticos para consultar sempre que pintar uma sigla
          nova.
        </p>
      </div>

      {/* Search + Alphabet Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedLetter("TODOS");
            }}
            placeholder="Buscar termo: CNAE, Fator R, RBT12, IBS, CBS, DAS, Split Payment..."
            aria-label="Buscar termo no glossário"
            className="min-h-[52px] w-full rounded-[16px] border border-[#D6D3C7] bg-white pr-4 pl-12 text-sm text-[#111827] shadow-2xs transition focus:border-[#1B4332] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {letters.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setSelectedLetter(l)}
              className={`min-h-[36px] min-w-[36px] rounded-xl px-3 py-1 font-mono text-xs font-semibold transition ${
                selectedLetter === l
                  ? "bg-[#1B4332] text-white dark:bg-emerald-600"
                  : "bg-[#F3F2EC] text-slate-600 hover:bg-[#E7E5DC] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.term}
              className="shadow-card flex flex-col justify-between rounded-[20px] border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
            >
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#1B4332] dark:text-emerald-400">
                  {item.term}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.definition}
                </p>
              </div>
              <div className="mt-4 rounded-xl bg-[#F3F2EC] px-3 py-2 font-mono text-xs font-medium text-[#111827] dark:bg-slate-900 dark:text-emerald-300">
                {item.example}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[#D6D3C7] bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="font-serif text-lg font-semibold text-[#111827] dark:text-slate-100">
            Nenhum termo encontrado para &ldquo;{query}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedLetter("TODOS");
            }}
            className="mt-3 text-sm font-semibold text-[#1B4332] hover:underline dark:text-emerald-400"
          >
            Limpar busca
          </button>
        </div>
      )}
    </div>
  );
}
