import type {
  B2BCreditAnalysis,
  ReformYearProjection,
  ReformYearSchedule,
  SimplesData2026,
  SimplesHibridoResult,
  SimulationInput,
  SplitPaymentResult,
} from "@/types/tax";
import type { ReformaDataFile } from "@/lib/data-loader";
import { calculateSimplesNacional2026 } from "@/lib/tax/simples";
import { calculateLucroPresumido, calculateLucroReal } from "@/lib/tax/comparator";
import { formatBRL, formatPercent } from "@/lib/format";

export function getScheduleForYear(
  reforma: ReformaDataFile,
  ano: number
): ReformYearSchedule {
  return (
    reforma.cronograma.find((item) => item.ano === ano) ??
    reforma.cronograma[reforma.cronograma.length - 1]
  );
}

/**
 * Simulador de Split Payment (LC 214/2025)
 * Calcula o valor retido automaticamente na liquidação financeira (CBS + IBS)
 * e o impacto direto no fluxo de caixa líquido.
 */
export function calculateSplitPayment(
  input: SimulationInput,
  reforma: ReformaDataFile,
  ano: number,
  valorVenda: number
): SplitPaymentResult {
  const schedule = getScheduleForYear(reforma, ano);
  const fatorReducao = 1 - input.cnae.ibsCbsReduction;

  const aliquotaCbsEfetiva = schedule.cbsAliquotaPadrao * fatorReducao;
  const aliquotaIbsEfetiva = schedule.ibsAliquotaPadrao * fatorReducao;

  // Em 2026, alíquotas teste são compensáveis e não há retenção obrigatória de split payment
  const retencaoCbs = ano === 2026 ? 0 : valorVenda * aliquotaCbsEfetiva;
  const retencaoIbs = ano === 2026 ? 0 : valorVenda * aliquotaIbsEfetiva;
  const retencaoTotal = retencaoCbs + retencaoIbs;
  const liquidoNoCaixa = Math.max(0, valorVenda - retencaoTotal);

  return {
    ano,
    valorVenda,
    aliquotaCbsEfetiva,
    aliquotaIbsEfetiva,
    retencaoCbs,
    retencaoIbs,
    retencaoTotal,
    liquidoNoCaixa,
    percentualRetido: valorVenda > 0 ? retencaoTotal / valorVenda : 0,
    statusSplitPayment: schedule.splitPaymentStatus,
  };
}

/**
 * Simulador do "Simples Híbrido" (a partir de 2027 - LC 214/2025)
 * Compara recolher IBS/CBS dentro do DAS (Simples Regular) vs. fora do DAS (Simples Híbrido),
 * considerando créditos sobre insumos e transferência de crédito para clientes PJ (B2B).
 */
export function calculateSimplesHibrido(
  input: SimulationInput,
  simplesData: SimplesData2026,
  reforma: ReformaDataFile,
  ano: number
): SimplesHibridoResult {
  const schedule = getScheduleForYear(reforma, ano);
  const simples = calculateSimplesNacional2026(input, simplesData);
  const fatorReducao = 1 - input.cnae.ibsCbsReduction;

  // Parcela de tributos de consumo dentro do DAS (PIS + COFINS + ICMS + ISS)
  const parcelaConsumoNoDas = simples.reparticao
    .filter(
      (item) =>
        item.nome.startsWith("PIS") ||
        item.nome.startsWith("COFINS") ||
        item.nome.startsWith("ICMS") ||
        item.nome.startsWith("ISS")
    )
    .reduce((acc, item) => acc + item.valor, 0);

  // Peso dos tributos substituídos no ano selecionado
  const proporcaoSubstituida =
    (1 - schedule.fatorPisCofins) * 0.45 + (1 - schedule.fatorIcmsIss) * 0.55;

  const simplesRegularDas = simples.valorDas;
  const simplesRegularTotal = simples.totalMensal;

  // No Simples Híbrido, remove-se do DAS a parcela equivalente a PIS/COFINS/ICMS/ISS já migrada ao IVA
  const abatimentoDas = parcelaConsumoNoDas * Math.max(0.35, proporcaoSubstituida);
  const simplesHibridoDasSemConsumo = Math.max(0, simplesRegularDas - abatimentoDas);

  // Débito de IBS + CBS pelo regime regular (com redutor setorial do CNAE)
  const aliquotaIvaEfetiva =
    (schedule.cbsAliquotaPadrao + schedule.ibsAliquotaPadrao) * fatorReducao;
  const simplesHibridoIvaDebito = input.receitaMes * aliquotaIvaEfetiva;

  // Crédito de IBS + CBS sobre insumos tributados (não-cumulatividade plena)
  const baseInsumos = input.receitaMes * Math.min(0.85, Math.max(0, input.percentualInsumosIva));
  const simplesHibridoIvaCredito =
    baseInsumos * (schedule.cbsAliquotaPadrao + schedule.ibsAliquotaPadrao);

  const simplesHibridoIvaLiquido = Math.max(
    0,
    simplesHibridoIvaDebito - simplesHibridoIvaCredito
  );

  const simplesHibridoTotal =
    simplesHibridoDasSemConsumo +
    simplesHibridoIvaLiquido +
    simples.cppSeparadaAnexoIV +
    simples.inssProLabore;

  const diferencaMensal = simplesHibridoTotal - simplesRegularTotal;

  // Crédito transferível ao cliente PJ:
  // No Simples Regular: apenas o efetivamente pago de IBS/CBS dentro do DAS (~parcelaConsumoNoDas)
  // No Simples Híbrido: crédito integral destacado na nota (simplesHibridoIvaDebito)
  const creditoTransferidoRegular = parcelaConsumoNoDas;
  const creditoTransferidoHibrido = simplesHibridoIvaDebito;

  let recomendacao = "";
  if (ano === 2026) {
    recomendacao =
      "Em 2026 o Simples Híbrido ainda não está em vigor (início em 2027). Utilize 2027 a 2033 para planejar a opção.";
  } else if (diferencaMensal <= 0) {
    recomendacao = `O Simples Híbrido tende a ser mais econômico (${formatBRL(Math.abs(diferencaMensal))}/mês a menos) e ainda transfere ${formatBRL(creditoTransferidoHibrido)} em créditos integrais para clientes B2B.`;
  } else if (creditoTransferidoHibrido - creditoTransferidoRegular > diferencaMensal) {
    recomendacao = `Embora o Simples Híbrido custe ${formatBRL(diferencaMensal)}/mês a mais diretamente, ele gera ${formatBRL(creditoTransferidoHibrido - creditoTransferidoRegular)} extras em crédito tributário para clientes PJ — pode ser estratégico em vendas B2B.`;
  } else {
    recomendacao = `Para vendas majoritariamente B2C (consumidor final), manter tudo no DAS (Simples Regular) economiza cerca de ${formatBRL(diferencaMensal)}/mês em ${ano}.`;
  }

  return {
    ano,
    simplesRegularTotal,
    simplesRegularDas,
    simplesHibridoDasSemConsumo,
    simplesHibridoIvaDebito,
    simplesHibridoIvaCredito,
    simplesHibridoIvaLiquido,
    simplesHibridoTotal,
    diferencaMensal,
    creditoTransferidoRegular,
    creditoTransferidoHibrido,
    recomendacao,
  };
}

/**
 * Projeção da Transição da Reforma Tributária (2026–2033)
 */
export function calculateTransitionProjection(
  input: SimulationInput,
  simplesData: SimplesData2026,
  reforma: ReformaDataFile
): ReformYearProjection[] {
  const simplesBase = calculateSimplesNacional2026(input, simplesData);
  const presumidoBase = calculateLucroPresumido(input, simplesData);
  const realBase = calculateLucroReal(input, simplesData);

  const fatorReducao = 1 - input.cnae.ibsCbsReduction;
  const baseInsumos = input.receitaMes * Math.min(0.85, Math.max(0, input.percentualInsumosIva));

  // Parcelas fixas (renda + folha) no Presumido e Real
  const getBaseSemConsumo = (breakdown: { nome: string; valor: number }[]) =>
    breakdown
      .filter(
        (b) =>
          !b.nome.startsWith("PIS") &&
          !b.nome.startsWith("COFINS") &&
          !b.nome.startsWith("ISS") &&
          !b.nome.startsWith("ICMS")
      )
      .reduce((acc, b) => acc + b.valor, 0);

  const getPisCofins = (breakdown: { nome: string; valor: number }[]) =>
    breakdown
      .filter((b) => b.nome.startsWith("PIS") || b.nome.startsWith("COFINS"))
      .reduce((acc, b) => acc + b.valor, 0);

  const getIcmsIss = (breakdown: { nome: string; valor: number }[]) =>
    breakdown
      .filter((b) => b.nome.startsWith("ISS") || b.nome.startsWith("ICMS"))
      .reduce((acc, b) => acc + b.valor, 0);

  const presRenda = getBaseSemConsumo(presumidoBase.breakdown);
  const presPisCofins = getPisCofins(presumidoBase.breakdown);
  const presIcmsIss = getIcmsIss(presumidoBase.breakdown);

  const realRenda = getBaseSemConsumo(realBase.breakdown);
  const realPisCofins = getPisCofins(realBase.breakdown);
  const realIcmsIss = getIcmsIss(realBase.breakdown);

  return reforma.cronograma.map((schedule) => {
    const aliquotaIvaEfetiva =
      (schedule.cbsAliquotaPadrao + schedule.ibsAliquotaPadrao) * fatorReducao;

    // Em 2026 alíquota teste é compensável (efeito líquido ~0)
    const ivaDebito = schedule.ano === 2026 ? 0 : input.receitaMes * aliquotaIvaEfetiva;
    const ivaCredito =
      schedule.ano === 2026
        ? 0
        : baseInsumos * (schedule.cbsAliquotaPadrao + schedule.ibsAliquotaPadrao);
    const ivaLiquido = Math.max(0, ivaDebito - ivaCredito);

    const hibrido = calculateSimplesHibrido(input, simplesData, reforma, schedule.ano);

    const lucroPresumido =
      presRenda +
      presPisCofins * schedule.fatorPisCofins +
      presIcmsIss * schedule.fatorIcmsIss +
      ivaLiquido;

    const lucroReal =
      realRenda +
      realPisCofins * schedule.fatorPisCofins +
      realIcmsIss * schedule.fatorIcmsIss +
      ivaLiquido;

    return {
      ano: schedule.ano,
      fase: schedule.fase,
      simplesRegular: simplesBase.totalMensal,
      simplesHibrido: schedule.ano === 2026 ? simplesBase.totalMensal : hibrido.simplesHibridoTotal,
      lucroPresumido,
      lucroReal,
      aliquotaIvaEfetiva,
    };
  });
}

/**
 * Análise de Crédito Tributário para Clientes PJ (Operações B2B)
 */
export function calculateB2BCreditAnalysis(
  input: SimulationInput,
  simplesData: SimplesData2026,
  reforma: ReformaDataFile,
  ano: number,
  valorOperacao: number
): B2BCreditAnalysis {
  const schedule = getScheduleForYear(reforma, ano);
  const simples = calculateSimplesNacional2026(input, simplesData);
  const fatorReducao = 1 - input.cnae.ibsCbsReduction;

  // Percentual de consumo dentro do DAS (PIS+COFINS+ICMS+ISS)
  const pctConsumoNoDas = simples.reparticao
    .filter(
      (i) =>
        i.nome.startsWith("PIS") ||
        i.nome.startsWith("COFINS") ||
        i.nome.startsWith("ICMS") ||
        i.nome.startsWith("ISS")
    )
    .reduce((acc, i) => acc + i.percentualReceita, 0);

  const aliquotaIvaEfetiva =
    (schedule.cbsAliquotaPadrao + schedule.ibsAliquotaPadrao) * fatorReducao;

  const creditoRegular = valorOperacao * pctConsumoNoDas;
  const creditoPleno = valorOperacao * aliquotaIvaEfetiva;

  return {
    valorOperacao,
    ano,
    simplesRegular: {
      creditoGerado: creditoRegular,
      percentualCredito: pctConsumoNoDas,
      custoEfetivoCliente: Math.max(0, valorOperacao - creditoRegular),
    },
    simplesHibrido: {
      creditoGerado: creditoPleno,
      percentualCredito: aliquotaIvaEfetiva,
      custoEfetivoCliente: Math.max(0, valorOperacao - creditoPleno),
    },
    regimeRegular: {
      creditoGerado: creditoPleno,
      percentualCredito: aliquotaIvaEfetiva,
      custoEfetivoCliente: Math.max(0, valorOperacao - creditoPleno),
    },
    diferencaCompetitividade: Math.max(0, creditoPleno - creditoRegular),
  };
}

export function formatIvaSummary(aliquota: number, valor: number): string {
  return `${formatPercent(aliquota)} (${formatBRL(valor)})`;
}
