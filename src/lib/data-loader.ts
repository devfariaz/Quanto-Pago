import type { CnaeItem, ReformYearSchedule, SimplesData2026 } from "@/types/tax";

export interface ReformaDataFile {
  lei: string;
  aliquotaReferenciaTotal: number;
  aliquotaReferenciaCbs: number;
  aliquotaReferenciaIbs: number;
  notaContextualSplitPayment: string;
  cronograma: ReformYearSchedule[];
}

let cachedCnaes: CnaeItem[] | null = null;
let cachedSimples: SimplesData2026 | null = null;
let cachedReforma: ReformaDataFile | null = null;

export async function loadCnaes(): Promise<CnaeItem[]> {
  if (cachedCnaes) return cachedCnaes;
  const mod = await import("@/data/cnaes.json");
  cachedCnaes = mod.default as CnaeItem[];
  return cachedCnaes;
}

export async function loadSimplesData(): Promise<SimplesData2026> {
  if (cachedSimples) return cachedSimples;
  const mod = await import("@/data/simples-2026.json");
  cachedSimples = mod.default as SimplesData2026;
  return cachedSimples;
}

export async function loadReformaData(): Promise<ReformaDataFile> {
  if (cachedReforma) return cachedReforma;
  const mod = await import("@/data/reforma-2027-2033.json");
  cachedReforma = mod.default as ReformaDataFile;
  return cachedReforma;
}
