"use client";

import React from "react";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format";

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  helperText?: string;
  badge?: string;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  helperText,
  badge,
}: CurrencyInputProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            {badge}
          </span>
        )}
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-medium text-slate-400 dark:text-slate-400"
        >
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatCurrencyInput(value)}
          onChange={(e) => onChange(parseCurrencyInput(e.target.value))}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 tabular-nums shadow-2xs transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400"
        />
      </div>
      {helperText && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
