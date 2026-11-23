export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8919959286703342";

/**
 * IDs dos blocos de anúncio (Display) configurados no painel do Google AdSense.
 */
export const AD_SLOTS = {
  home: process.env.NEXT_PUBLIC_AD_SLOT_HOME || "1237048599",
  resultado: process.env.NEXT_PUBLIC_AD_SLOT_RESULT || "5375730460",
  biblioteca: process.env.NEXT_PUBLIC_AD_SLOT_LIBRARY || "5533397159",
  glossario: process.env.NEXT_PUBLIC_AD_SLOT_GLOSSARY || "9753959172",
} as const;
