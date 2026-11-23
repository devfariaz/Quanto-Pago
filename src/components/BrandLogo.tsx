import React from "react";

interface BrandIconProps {
  className?: string;
  variant?: "forest" | "amber";
}

/**
 * Ícone editorial do QuantoPago:
 * Um "Q" geométrico minimalista em forma de moeda/anel cujo traço diagonal
 * representa o pagamento líquido / economia com ponto âmbar.
 */
export function BrandIcon({
  className = "h-9 w-9",
  variant = "forest",
}: BrandIconProps) {
  const isAmber = variant === "amber";
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="qp-forest-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0D281D" />
          <stop offset="60%" stopColor="#1B4332" />
          <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>
      </defs>
      <rect
        width="40"
        height="40"
        rx="11"
        fill={isAmber ? "#F59E0B" : "url(#qp-forest-grad)"}
      />
      {/* Anel geométrico do Q */}
      <circle
        cx="19"
        cy="19"
        r="9.5"
        stroke={isAmber ? "#111827" : "#FAFAF7"}
        strokeWidth="3.2"
      />
      {/* Ponto central de percentual / moeda */}
      <circle
        cx="19"
        cy="19"
        r="2.4"
        fill={isAmber ? "#1B4332" : "#F59E0B"}
      />
      {/* Cauda do Q estilizada como barra de cálculo */}
      <path
        d="M24.5 24.5L31 31"
        stroke={isAmber ? "#111827" : "#F59E0B"}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
