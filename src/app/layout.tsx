import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quantopago.sanctyxstudios.com.br"),
  title: "QuantoPago — Calculadora Tributária Brasileira 2026 & Reforma Tributária",
  description:
    "Descubra em 30 segundos quanto sua empresa paga de imposto no Brasil: Simples Nacional 2026, MEI, Lucro Presumido, Lucro Real, Fator R e Split Payment da Reforma Tributária.",
  keywords: [
    "quantopago",
    "calculadora simples nacional 2026",
    "aliquota efetiva",
    "comparador tributario",
    "fator r simples nacional",
    "reforma tributaria lc 214 2025",
    "split payment",
    "mei vs simples",
    "lucro presumido",
    "lucro real",
  ],
  openGraph: {
    url: "https://quantopago.sanctyxstudios.com.br",
    title: "QuantoPago — Quanto a sua empresa paga de imposto? Descubra em 30s",
    description:
      "Calcule Simples Nacional 2026, compare regimes lado a lado, simule Split Payment e compartilhe seu resultado.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B4332",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8919959286703342";

  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {adsenseClient && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen font-sans antialiased selection:bg-emerald-200/70 selection:text-emerald-950 dark:selection:bg-emerald-800 dark:selection:text-emerald-50">
        {children}
      </body>
    </html>
  );
}
