"use client";

import React, { useMemo, useState } from "react";
import type { CnaeItem } from "@/types/tax";

interface CnaeAutocompleteProps {
  cnaes: CnaeItem[];
  selected: CnaeItem | null;
  onSelect: (cnae: CnaeItem) => void;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CnaeAutocomplete({
  cnaes,
  selected,
  onSelect,
}: CnaeAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const qNorm = normalizeText(query.trim());
    if (!qNorm) return cnaes.slice(0, 12);

    const qDigits = qNorm.replace(/[^\d]/g, "");
    const terms = qNorm.split(/\s+/).filter(Boolean);

    return cnaes
      .filter((item) => {
        if (
          qDigits.length > 0 &&
          item.code.replace(/[^\d]/g, "").includes(qDigits)
        ) {
          return true;
        }
        const haystack = normalizeText(
          `${item.code} ${item.description} ${item.category} anexo ${item.anexo}`
        );
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, 15);
  }, [cnaes, query]);

  return (
    <div className="relative">
      <label
        htmlFor="cnae-search"
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        Atividade Econômica (CNAE)
      </label>

      <div className="relative">
        <input
          id="cnae-search"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="cnae-listbox"
          aria-autocomplete="list"
          placeholder="Buscar por código (ex: 6201) ou descrição (ex: software, comércio)..."
          value={open ? query : selected ? `${selected.code} — ${selected.description}` : ""}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onBlur={() => {
            // Pequeno delay para permitir clique na lista
            setTimeout(() => setOpen(false), 160);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-3.5 pr-9 text-sm font-medium text-slate-900 shadow-2xs transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-emerald-400"
        />
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Badges informativos do CNAE selecionado */}
      {selected && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-md bg-slate-900 px-2 py-0.5 font-semibold text-white dark:bg-emerald-600">
            Anexo {selected.anexo}
          </span>
          {selected.fatorR && (
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/70 dark:text-blue-200 dark:ring-blue-800/70">
              Sujeito ao Fator R (Anexo III ou V)
            </span>
          )}
          {selected.anexo === "IV" && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/70 dark:text-amber-200 dark:ring-amber-800/70">
              CPP 20% fora do DAS
            </span>
          )}
          <span
            className={`rounded-md px-2 py-0.5 font-medium ${
              selected.meiAllowed
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-800/70"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
            }`}
          >
            {selected.meiAllowed ? "Permite MEI" : "Não permite MEI"}
          </span>
          {selected.ibsCbsReduction > 0 && (
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-200 dark:ring-indigo-800/70">
              Redução IVA {Math.round(selected.ibsCbsReduction * 100)}% (LC 214)
            </span>
          )}
        </div>
      )}

      {open && (
        <ul
          id="cnae-listbox"
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
              Nenhum CNAE encontrado para &ldquo;{query}&rdquo;.
            </li>
          ) : (
            filtered.map((item) => {
              const isSelected = selected?.code === item.code;
              return (
                <li
                  key={item.code}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-left transition ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200"
                      : "text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-50">
                      {item.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Anexo {item.anexo}
                      </span>
                      {item.fatorR && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                          Fator R
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
