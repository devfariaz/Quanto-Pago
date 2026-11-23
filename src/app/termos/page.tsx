import type { Metadata } from "next";
import Link from "next/link";
import { BrandIcon } from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Termos de Uso — QuantoPago",
  description:
    "Termos de uso e isenção de responsabilidade tributária da calculadora QuantoPago.",
};

export default function TermosPage() {
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
            CONDIÇÕES DE USO
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Termos de Uso</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Última atualização: Novembro de 2026 · Domínio: quantopago.sanctyxstudios.com.br
          </p>
        </div>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">1. Finalidade Educativa e Estimativa</h2>
          <p className="text-slate-600 dark:text-slate-300">
            O <strong>QuantoPago</strong> disponibiliza calculadoras, simuladores e conteúdos
            educativos baseados nas tabelas vigentes do Simples Nacional (LC 123/2006) e nos
            parâmetros da Reforma Tributária do Consumo (LC 214/2025). Os resultados possuem caráter{" "}
            <strong>exclusivamente informativo e estimativo</strong>.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">
            2. Isenção de Responsabilidade Contábil
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            As simulações não contemplam particularidades como substituição tributária (ICMS-ST),
            produtos monofásicos, retenções municipais/federais específicas, regimes especiais ou
            benefícios fiscais estaduais.{" "}
            <strong>
              Os valores apresentados não substituem a orientação de um contador devidamente
              habilitado no CRC.
            </strong>
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">3. Links Externos e Parceiros</h2>
          <p className="text-slate-600 dark:text-slate-300">
            O site pode exibir anúncios ou links de indicação para serviços financeiros e contábeis
            de terceiros. Não nos responsabilizamos pelas políticas, preços ou serviços contratados
            em sites externos.
          </p>
        </section>
      </main>
    </div>
  );
}
