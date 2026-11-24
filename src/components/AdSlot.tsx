"use client";

import React, { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slot: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

/**
 * Bloco de anúncio responsivo para Google AdSense.
 * Só renderiza e dispara o push quando um `slot` válido estiver configurado,
 * evitando erros no console ou espaços vazios antes da criação dos blocos.
 */
export function AdSlot({
  slot,
  format = "auto",
  className = "",
}: AdSlotProps) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignora erro caso bloqueador de anúncios esteja ativo
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <aside
      aria-label="Publicidade"
      className={`no-print w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-[#E7E5DC]/80 bg-[#F3F2EC]/60 px-3 py-2 text-center dark:border-slate-800 dark:bg-slate-900/50 ${className}`}
    >
      <span className="mb-1 block font-mono text-[10px] tracking-wider text-slate-400 uppercase dark:text-slate-500">
        Publicidade · Ajuda a manter o servidor e o QuantoPago gratuito
      </span>
      <div className="min-h-[90px] w-full">
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
