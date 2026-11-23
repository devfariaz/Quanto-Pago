import type { Metadata } from "next";
import Link from "next/link";
import { BrandIcon } from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Sobre & Contato — QuantoPago",
  description:
    "Conheça a missão, a metodologia de cálculo e os canais de contato do QuantoPago.",
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111827] dark:bg-[#0F172A] dark:text-slate-100">
      <header className="border-b border-[#E7E5DC] bg-[#FAFAF7]/90 dark:border-slate-800 dark:bg-[#0F172A]/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandIcon className="h-8 w-8" />
            <span className="font-serif text-lg font-semibold">
              Quanto<span className="text-[#1B4332] dark:text-emerald-400">Pago</span>
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#D6D3C7] px-3.5 py-2 text-xs font-semibold text-[#1B4332] transition hover:bg-[#F3F2EC] dark:border-slate-700 dark:text-emerald-300 dark:hover:bg-slate-800"
          >
            ← Voltar para a calculadora
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-5 py-10 text-sm leading-relaxed">
        <div>
          <p className="font-mono text-xs font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
            SOBRE O PROJETO
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
            Sobre o QuantoPago
          </h1>
        </div>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">Nossa Missão</h2>
          <p className="text-slate-600 dark:text-slate-300">
            O <strong>QuantoPago</strong> é uma ferramenta <strong>100% gratuita e sem
            cadastro</strong>, criada para traduzir a legislação tributária brasileira em números
            claros, visuais e auditáveis. Empreendedores, autônomos, freelancers e contadores podem
            simular em segundos a carga tributária no Simples Nacional (Anexos I a V e Fator R), MEI,
            Lucro Presumido, Lucro Real e os impactos da Reforma Tributária (LC 214/2025). Os
            anúncios exibidos no site servem para custear o servidor e manter as tabelas fiscais
            sempre atualizadas.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">Fontes e Metodologia</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Simples Nacional & MEI:</strong> Lei Complementar nº 123/2006 (tabelas
              progressivas com alíquota efetiva, parcela a deduzir, Fator R e CPP separada do Anexo
              IV).
            </li>
            <li>
              <strong>Reforma Tributária do Consumo:</strong> Lei Complementar nº 214/2025
              (cronograma 2026–2033 de CBS/IBS, Split Payment, Simples Híbrido e créditos B2B).
            </li>
            <li>
              <strong>Transparência:</strong> Cada cálculo exibe sua memória passo a passo para
              conferência junto ao seu contador.
            </li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">Contato & Parcerias</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Projeto desenvolvido e mantido por <strong>Sanctyx Studios</strong>. Para sugestões de
            CNAEs, correções tributárias, suporte ou parcerias comerciais/publicidade, entre em
            contato pelo e-mail:{" "}
            <a
              href="mailto:contato@sanctyxstudios.com.br"
              className="font-semibold text-[#1B4332] underline dark:text-emerald-400"
            >
              contato@sanctyxstudios.com.br
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
