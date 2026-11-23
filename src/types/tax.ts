export type AnexoKey = "I" | "II" | "III" | "IV" | "V";

export type TaxRegime =
  | "MEI"
  | "SIMPLES_NACIONAL"
  | "LUCRO_PRESUMIDO"
  | "LUCRO_REAL";

export type ActivityCategory = "comercio" | "industria" | "servicos";

export interface CnaeItem {
  code: string;
  description: string;
  anexo: AnexoKey;
  fatorR: boolean;
  meiAllowed: boolean;
  category: ActivityCategory;
  presumedIrpjRate: number; // 0.08 or 0.32 (or 0.16)
  presumedCsllRate: number; // 0.12 or 0.32
  defaultIssRate: number; // 0.02 to 0.05 (0 for commerce/industry)
  defaultIcmsEffectiveRate: number; // estimated effective ICMS after credits
  ibsCbsReduction: number; // 0, 0.30, 0.60, 1.0 per LC 214/2025
  ibsCbsNote?: string;
}

export interface SimplesBracket {
  faixa: number;
  minRbt12: number;
  maxRbt12: number;
  aliquotaNominal: number;
  parcelaDeduzir: number;
  reparticao: {
    IRPJ: number;
    CSLL: number;
    COFINS: number;
    PIS: number;
    CPP: number;
    ICMS?: number;
    ISS?: number;
    IPI?: number;
  };
}

export interface SimplesAnexoTable {
  nome: string;
  descricao: string;
  cppSeparada: boolean;
  faixas: SimplesBracket[];
}

export interface MeiConfig2026 {
  salarioMinimo: number;
  limiteAnual: number;
  limiteMensalMedio: number;
  inssBase: number;
  icmsFixo: number;
  issFixo: number;
  tetoInss2026: number;
  aliquotaInssProLabore: number;
  aliquotaCppPatronal: number;
}

export interface SimplesData2026 {
  ano: number;
  sublimiteIcmsIss: number;
  limiteSimples: number;
  fatorRMinimo: number;
  mei: MeiConfig2026;
  anexos: Record<AnexoKey, SimplesAnexoTable>;
}

export interface SimulationInput {
  cnae: CnaeItem;
  regimeSelecionado: TaxRegime;
  rbt12: number;
  receitaMes: number;
  folha12m: number;
  folhaMes: number;
  proLaboreMes: number;
  incluirInssProLabore: boolean;
  issAliquota: number; // e.g. 0.02 to 0.05
  margemLucroReal: number; // e.g. 0.15 (15%)
  percentualCreditosPisCofins: number; // e.g. 0.30 (30% of revenue generates credits)
  percentualInsumosIva: number; // % of revenue spent on taxed B2B inputs (for Reforma)
}

export interface SimulationDraft
  extends Omit<SimulationInput, "cnae" | "regimeSelecionado"> {
  cnae: CnaeItem | null;
  regimeSelecionado: TaxRegime | null;
}

export interface TaxBreakdownItem {
  nome: string;
  valor: number;
  percentualReceita: number;
  observacao?: string;
}

export interface CalculationStep {
  titulo: string;
  formula: string;
  resultado: string;
  detalhe?: string;
}

export interface SimplesResult {
  elegivel: boolean;
  motivoInelegibilidade?: string;
  anexoOriginal: AnexoKey;
  anexoAplicado: AnexoKey;
  fatorR?: number;
  fatorRAplicado: boolean;
  rbt12Considerado: number;
  faixa: number;
  aliquotaNominal: number;
  parcelaDeduzir: number;
  aliquotaEfetiva: number;
  valorDas: number;
  cppSeparadaAnexoIV: number;
  inssProLabore: number;
  totalMensal: number;
  aliquotaTotalEfetiva: number;
  alertaSublimite: boolean;
  reparticao: TaxBreakdownItem[];
  memoria: CalculationStep[];
}

export interface MeiResult {
  elegivel: boolean;
  motivoInelegibilidade?: string;
  valorDasFixo: number;
  inss: number;
  icms: number;
  iss: number;
  aliquotaEfetiva: number;
  percentualLimiteUsado: number;
  memoria: CalculationStep[];
}

export interface RegimeEstimateResult {
  regime: TaxRegime;
  nome: string;
  elegivel: boolean;
  motivoInelegibilidade?: string;
  valorMensal: number;
  valorAnualProjetado: number;
  aliquotaEfetiva: number;
  destaque?: string;
  ehAproximacao: boolean;
  breakdown: TaxBreakdownItem[];
  observacoes: string[];
}

export interface PfVsPjResult {
  receitaMensal: number;
  pf: {
    irpf: number;
    inssAutonomo: number;
    issAutonomo: number;
    ivaDualEstimado2027: number;
    totalAtual: number;
    aliquotaAtual: number;
    totalComReforma: number;
    liquidoMensal: number;
  };
  pjSimples: {
    das: number;
    inssProLabore: number;
    cppSeparada: number;
    contabilidadeEstimada: number;
    totalMensal: number;
    aliquotaEfetiva: number;
    liquidoMensal: number;
  };
  mei?: {
    dasFixo: number;
    totalMensal: number;
    aliquotaEfetiva: number;
    liquidoMensal: number;
  };
  economiaMensalPjVsPf: number;
  economiaAnualPjVsPf: number;
  recomendacao: string;
}

export interface ReformYearSchedule {
  ano: number;
  fase: string;
  cbsAliquotaPadrao: number;
  ibsAliquotaPadrao: number;
  fatorPisCofins: number; // 1 = 100% vigente, 0 = extinto
  fatorIcmsIss: number; // 1 = 100% vigente, 0.9 = 90%, ..., 0 = extinto
  splitPaymentStatus: string;
  observacao: string;
}

export interface ReformYearProjection {
  ano: number;
  fase: string;
  simplesRegular: number;
  simplesHibrido: number;
  lucroPresumido: number;
  lucroReal: number;
  aliquotaIvaEfetiva: number;
}

export interface SplitPaymentResult {
  ano: number;
  valorVenda: number;
  aliquotaCbsEfetiva: number;
  aliquotaIbsEfetiva: number;
  retencaoCbs: number;
  retencaoIbs: number;
  retencaoTotal: number;
  liquidoNoCaixa: number;
  percentualRetido: number;
  statusSplitPayment: string;
}

export interface SimplesHibridoResult {
  ano: number;
  simplesRegularTotal: number;
  simplesRegularDas: number;
  simplesHibridoDasSemConsumo: number;
  simplesHibridoIvaDebito: number;
  simplesHibridoIvaCredito: number;
  simplesHibridoIvaLiquido: number;
  simplesHibridoTotal: number;
  diferencaMensal: number; // negative = hibrido cheaper
  creditoTransferidoRegular: number;
  creditoTransferidoHibrido: number;
  recomendacao: string;
}

export interface B2BCreditAnalysis {
  valorOperacao: number;
  ano: number;
  simplesRegular: {
    creditoGerado: number;
    percentualCredito: number;
    custoEfetivoCliente: number;
  };
  simplesHibrido: {
    creditoGerado: number;
    percentualCredito: number;
    custoEfetivoCliente: number;
  };
  regimeRegular: {
    creditoGerado: number;
    percentualCredito: number;
    custoEfetivoCliente: number;
  };
  diferencaCompetitividade: number;
}
