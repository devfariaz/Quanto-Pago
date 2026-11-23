"use client";

import React, { useEffect } from "react";

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
 * Componente pronto para Google AdSense sem impacto de layout (CLS).
 * Só renderiza quando NEXT_PUBLIC_ADSENSE_CLIENT (ex: ca-pub-XXXXXXXX) estiver definido.
 */
export function AdSlot({ slot, format = "auto", className = "" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignora erro caso bloqueador de anúncios esteja ativo
    }
  }, [client]);

  if (!client) return null;

  return (
    <div
      aria-label="Publicidade"
      className={`no-print overflow-hidden rounded-2xl border border-[#E7E5DC]/70 bg-[#F3F2EC]/50 p-2 text-center dark:border-slate-800 dark:bg-slate-900/40 ${className}`}
    >
      <span className="mb-1 block font-mono text-[10px] tracking-wider text-slate-400 uppercase">
        Publicidade
      </span>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
