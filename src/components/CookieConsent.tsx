"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "quantopago-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      setVisible(true);
    }
  }, []);

  function handleChoice(choice: "accepted" | "essential") {
    window.localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Aviso de cookies e privacidade"
      className="no-print fixed right-4 bottom-4 left-4 z-40 mx-auto max-w-2xl rounded-2xl border border-[#E7E5DC] bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:p-5 dark:border-slate-700 dark:bg-slate-900/95"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Usamos armazenamento local para suas preferências e cookies para exibir anúncios
          relevantes que mantêm o <strong>QuantoPago</strong> gratuito. Seus dados financeiros nunca
          saem do seu navegador. Veja nossa{" "}
          <Link
            href="/privacidade/"
            className="font-semibold text-[#1B4332] underline dark:text-emerald-400"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => handleChoice("essential")}
            className="min-h-[38px] rounded-xl border border-[#D6D3C7] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-[#F3F2EC] dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Apenas essenciais
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="min-h-[38px] rounded-xl bg-[#1B4332] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2D6A4F] dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Aceitar
          </button>
        </div>
      </div>
    </aside>
  );
}
