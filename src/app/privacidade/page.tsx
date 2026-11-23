import type { Metadata } from "next";
import Link from "next/link";
import { BrandIcon } from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Política de Privacidade (LGPD) — QuantoPago",
  description:
    "Saiba como o QuantoPago trata dados, cookies e anúncios conforme a LGPD (Lei 13.709/2018).",
};

export default function PrivacidadePage() {
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
            TRANSPARÊNCIA & LGPD
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Última atualização: Novembro de 2026 · Domínio: quantopago.sanctyxstudios.com.br
          </p>
        </div>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">1. Processamento 100% Local</h2>
          <p className="text-slate-600 dark:text-slate-300">
            O <strong>QuantoPago</strong> é uma aplicação estática. Todos os valores informados
            nas simulações (CNAE, faturamento, RBT12, folha de pagamento e pró-labore) são
            processados <strong>exclusivamente no navegador do usuário</strong>. Não coletamos,
            armazenamos ou transmitimos seus dados financeiros para bancos de dados próprios.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">
            2. Cookies, Armazenamento Local e Google AdSense
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Utilizamos o armazenamento local do navegador (<code>localStorage</code>) apenas para
            lembrar sua preferência de tema (claro/escuro) e sua escolha de consentimento de
            cookies.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            Este site pode exibir anúncios fornecidos por parceiros terceiros, incluindo o{" "}
            <strong>Google AdSense</strong>. O Google e seus parceiros podem utilizar cookies
            (como o cookie DoubleClick) para veicular anúncios com base em visitas anteriores a este
            ou a outros sites na internet.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            Você pode desativar a publicidade personalizada a qualquer momento acessando as{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1B4332] underline dark:text-emerald-400"
            >
              Configurações de Anúncios do Google
            </a>{" "}
            ou recusando cookies não essenciais no aviso exibido neste site.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#E7E5DC] bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-serif text-xl font-semibold">
            3. Seus Direitos (LGPD — Lei nº 13.709/2018)
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito à informação,
            revogação de consentimento de cookies e esclarecimentos sobre qualquer tratamento de
            dados. Para solicitações ou dúvidas, consulte nossa página{" "}
            <Link
              href="/sobre/"
              className="font-semibold text-[#1B4332] underline dark:text-emerald-400"
            >
              Sobre & Contato
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
