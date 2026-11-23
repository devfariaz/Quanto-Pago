"use client";

import React, { useState } from "react";
import { Download, Smartphone, Square, X, Check } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { BrandIcon } from "@/components/BrandLogo";

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  regimeName: string;
  aliquotaEfetiva: number;
  valorMensal: number;
  tagLabel: string;
  economiaAnual: number;
  comparadoCom: string;
}

type CardFormat = "stories" | "feed";

export function ShareCardModal({
  open,
  onClose,
  regimeName,
  aliquotaEfetiva,
  valorMensal,
  tagLabel,
  economiaAnual,
  comparadoCom,
}: ShareCardModalProps) {
  const [format, setFormat] = useState<CardFormat>("stories");
  const [downloaded, setDownloaded] = useState(false);

  if (!open) return null;

  function handleDownloadPng() {
    const isStories = format === "stories";
    const width = 1080;
    const height = isStories ? 1920 : 1080;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Forest editorial gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#091B13");
    grad.addColorStop(0.5, "#1B4332");
    grad.addColorStop(1, "#122E22");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle decorative circles
    ctx.save();
    ctx.fillStyle = "rgba(82, 183, 136, 0.10)";
    ctx.beginPath();
    ctx.arc(width - 120, 220, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
    ctx.beginPath();
    ctx.arc(140, height - 220, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const padX = 88;
    const topY = isStories ? 130 : 88;

    // Brand Mark (QuantoPago Q-coin icon)
    ctx.fillStyle = "#F59E0B";
    roundRect(ctx, padX, topY, 56, 56, 16);
    ctx.fill();
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(padX + 26, topY + 26, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#1B4332";
    ctx.beginPath();
    ctx.arc(padX + 26, topY + 26, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(padX + 34, topY + 34);
    ctx.lineTo(padX + 43, topY + 43);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#FAFAF7";
    ctx.font = "600 36px Georgia, serif";
    ctx.fillText("QuantoPago", padX + 74, topY + 40);

    // Year pill
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(ctx, width - padX - 280, topY + 6, 280, 44, 22);
    ctx.fill();
    ctx.fillStyle = "#A7F3D0";
    ctx.font = "500 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText("TABELA OFICIAL 2026", width - padX - 140, topY + 34);

    // Center Stat
    ctx.textAlign = "left";
    const midY = isStories ? 640 : 340;
    ctx.fillStyle = "#FBBF24";
    ctx.font = "600 22px monospace";
    ctx.fillText(`MEU IMPOSTO REAL · ${regimeName.toUpperCase()}`, padX, midY);

    ctx.fillStyle = "#FAFAF7";
    ctx.font = `bold ${isStories ? 210 : 176}px Georgia, serif`;
    ctx.fillText(formatPercent(aliquotaEfetiva), padX, midY + (isStories ? 215 : 182));

    ctx.fillStyle = "#A7F3D0";
    ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${formatCurrency(valorMensal)} / mês`, padX, midY + (isStories ? 295 : 254));

    // Tag pill
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, padX, midY + (isStories ? 340 : 290), width - padX * 2, 64, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(167,243,208,0.28)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "500 22px monospace";
    ctx.fillText(tagLabel, padX + 26, midY + (isStories ? 380 : 330));

    // Savings Trophy Card
    if (economiaAnual > 0) {
      const cardY = midY + (isStories ? 448 : 386);
      const cardH = isStories ? 230 : 190;
      ctx.fillStyle = "#FAFAF7";
      roundRect(ctx, padX, cardY, width - padX * 2, cardH, 32);
      ctx.fill();

      ctx.fillStyle = "#B45309";
      ctx.font = "600 20px monospace";
      ctx.fillText("★  ECONOMIA ANUAL ESTIMADA", padX + 38, cardY + 56);

      ctx.fillStyle = "#1B4332";
      ctx.font = "bold 62px Georgia, serif";
      ctx.fillText(`${formatCurrency(economiaAnual)} / ano`, padX + 38, cardY + 132);

      ctx.fillStyle = "#475569";
      ctx.font = "500 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(`economizados em relação ao ${comparadoCom}`, padX + 38, cardY + (isStories ? 182 : 168));
    }

    // Footer
    const footY = height - (isStories ? 110 : 76);
    ctx.fillStyle = "#A7F3D0";
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("quantopago.sanctyxstudios.com.br", padX, footY);

    ctx.textAlign = "right";
    ctx.fillStyle = "#FBBF24";
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("Descubra o seu em 30s →", width - padX, footY);

    const link = document.createElement("a");
    link.download = `quantopago-${format}-${Math.round(aliquotaEfetiva * 1000)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2600);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartilhar resultado"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="animate-fade-slide relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#E7E5DC] bg-[#FAFAF7] p-6 shadow-2xl sm:p-8 dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-widest text-[#2D6A4F] uppercase dark:text-emerald-400">
              PRONTO PARA POSTAR
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#111827] dark:text-slate-50">
              Compartilhar resultado
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F2EC] text-slate-600 transition hover:bg-[#E7E5DC] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Format Toggle */}
        <div className="mt-5 flex gap-2 rounded-2xl bg-[#F3F2EC] p-1.5 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setFormat("stories")}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition sm:text-sm ${
              format === "stories"
                ? "bg-white text-[#1B4332] shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Smartphone className="h-4 w-4" strokeWidth={1.5} />
            Instagram Stories (1080×1920)
          </button>
          <button
            type="button"
            onClick={() => setFormat("feed")}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition sm:text-sm ${
              format === "feed"
                ? "bg-white text-[#1B4332] shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Square className="h-4 w-4" strokeWidth={1.5} />
            Feed Quadrado (1080×1080)
          </button>
        </div>

        {/* Live Visual Preview */}
        <div className="mt-6 flex justify-center">
          <div
            className={`hero-forest-gradient flex flex-col justify-between overflow-hidden rounded-[24px] p-6 text-white shadow-xl transition-all duration-300 ${
              format === "stories"
                ? "aspect-[9/16] w-full max-w-[300px]"
                : "aspect-square w-full max-w-[380px]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandIcon variant="amber" className="h-7 w-7 shrink-0" />
                <span className="font-serif text-base font-semibold text-[#FAFAF7]">
                  Quanto<span className="text-amber-300">Pago</span>
                </span>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] text-emerald-200">
                TABELA 2026
              </span>
            </div>

            <div className="my-auto space-y-2.5 py-4">
              <p className="font-mono text-[9px] tracking-widest text-amber-300 uppercase">
                MEU IMPOSTO REAL · {regimeName}
              </p>
              <p className="font-serif text-5xl leading-none font-bold tracking-tight text-[#FAFAF7] tabular-nums sm:text-6xl">
                {formatPercent(aliquotaEfetiva)}
              </p>
              <p className="text-lg font-bold text-emerald-200 tabular-nums">
                {formatCurrency(valorMensal)} / mês
              </p>
              <p className="rounded-xl border border-emerald-200/20 bg-white/10 px-3 py-1.5 font-mono text-[10px] text-slate-200">
                {tagLabel}
              </p>

              {economiaAnual > 0 && (
                <div className="mt-3 rounded-2xl bg-[#FAFAF7] p-3.5 text-[#111827]">
                  <p className="font-mono text-[9px] font-semibold text-amber-700 uppercase">
                    ★ ECONOMIA ANUAL ESTIMADA
                  </p>
                  <p className="mt-0.5 font-serif text-xl font-bold text-[#1B4332] tabular-nums">
                    {formatCurrency(economiaAnual)} / ano
                  </p>
                  <p className="text-[10px] text-slate-600">
                    vs. {comparadoCom}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-emerald-200">
                quantopago.sanctyxstudios.com.br
              </span>
              <span className="font-semibold text-amber-300">
                Descubra em 30s →
              </span>
            </div>
          </div>
        </div>

        {/* Download CTA */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] rounded-[14px] border border-[#D6D3C7] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#F3F2EC] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="shadow-btn-brand inline-flex min-h-[48px] items-center gap-2 rounded-[14px] bg-[#1B4332] px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2D6A4F] dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {downloaded ? (
              <>
                <Check className="h-4 w-4 text-amber-300" strokeWidth={2} />
                Imagem PNG baixada!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Baixar PNG ({format === "stories" ? "1080×1920" : "1080×1080"})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
