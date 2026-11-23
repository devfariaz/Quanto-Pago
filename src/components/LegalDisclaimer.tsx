import React from "react";

interface LegalDisclaimerProps {
  compact?: boolean;
}

export function LegalDisclaimer({ compact = false }: LegalDisclaimerProps) {
  return (
    <aside
      role="note"
      aria-label="Aviso legal"
      className={`rounded-2xl border border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/35 dark:text-amber-100 ${
        compact ? "px-3.5 py-2.5 text-xs" : "px-4 py-3.5 text-xs sm:text-sm"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <p className="leading-relaxed">
          <strong className="font-semibold">Aviso Legal:</strong> Os valores exibidos são{" "}
          <strong>estimativas simuladas</strong> com base nas tabelas vigentes de 2026 (LC
          123/2006) e nos parâmetros da Reforma Tributária (LC 214/2025). Não contemplam
          substituição tributária, regimes monofásicos, benefícios fiscais estaduais/municipais
          ou particularidades contábeis.{" "}
          <strong>Estes resultados não substituem a orientação de um contador habilitado.</strong>
        </p>
      </div>
    </aside>
  );
}
