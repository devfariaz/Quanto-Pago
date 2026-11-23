"use client";

import React, { useEffect, useRef, useState } from "react";
import { HelpCircle, ArrowUpRight } from "lucide-react";

interface EditorialTooltipProps {
  title: string;
  content: string;
  glossaryTerm?: string;
  onOpenGlossary?: (term: string) => void;
}

export function EditorialTooltip({
  title,
  content,
  glossaryTerm,
  onOpenGlossary,
}: EditorialTooltipProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={`Explicação: ${title}`}
        aria-expanded={open}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-emerald-50 hover:text-[#1B4332] dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-amber-400"
      >
        <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {open && (
        <span
          role="tooltip"
          className="animate-fade-slide absolute bottom-full left-1/2 z-40 mb-2 w-72 -translate-x-1/2 rounded-2xl border border-slate-700 bg-[#0F172A] p-4 text-left text-xs text-slate-200 shadow-xl"
        >
          <span className="block font-semibold text-amber-400">? {title}</span>
          <span className="mt-1.5 block leading-relaxed text-slate-200">
            {content}
          </span>
          {glossaryTerm && onOpenGlossary && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenGlossary(glossaryTerm);
              }}
              className="mt-2.5 inline-flex items-center gap-1 font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              Ver no Glossário
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </span>
      )}
    </span>
  );
}
