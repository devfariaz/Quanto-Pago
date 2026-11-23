import type {
  MeiResult,
  PfVsPjResult,
  RegimeEstimateResult,
  SimplesData2026,
  SimplesResult,
  SimulationInput,
  TaxBreakdownItem,
} from "@/types/tax";
import { formatBRL, formatPercent } from "@/lib/format";
import { calculateMei2026, calculateSimplesNacional2026 } from "@/lib/tax/simples";

const LIMITE_LUCRO_PRESUMIDO_ANUAL = 78_000_000;
const LIMITE_ADICIONAL_IRPJ_MENSAL = 20_000;

export function calculateLucroPresumido(
  input: SimulationInput,
  data: SimplesData2026
): RegimeEstimateResult {
  const { cnae, rbt12, receitaMes, folhaMes, proLaboreMes, issAliquota } = input;
  const receitaAnualRef = rbt12 > 0 ? rbt12 : receitaMes * 12;
  const elegivel = receitaAnualRef <= LIMITE_LUCRO_PRESUMIDO_ANUAL;

  const baseIrpj = receitaMes * cnae.presumedIrpjRate;
  const irpjBasico = baseIrpj * 0.15;
  const irpjAdicional = Math.max(0, baseIrpj - LIMITE_ADICIONAL_IRPJ_MENSAL) * 0.1;
  const irpjTotal = irpjBasico + irpjAdicional;

  const baseCsll = receitaMes * cnae.presumedCsllRate;
  const csll = baseCsll * 0.09;

  // PIS (0,65%) e COFINS (3,00%) cumulativos
  const pis = receitaMes * 0.0065;
  const cofins = receitaMes * 0.03;

  // ISS (serviços) ou ICMS efetivo estimado (comércio/indústria)
  const tributoConsumoNome =
    cnae.category === "servicos"
      ? `ISS Municipal (${formatPercent(issAliquota)})`
      : `ICMS Efetivo Estimado (${formatPercent(cnae.defaultIcmsEffectiveRate)})`;
  const tributoConsumoValor =
    cnae.category === "servicos"
      ? receitaMes * issAliquota
      : receitaMes * cnae.defaultIcmsEffectiveRate;

  // CPP Patronal (20% sobre folha/pró-labore)
  const baseFolha = Math.max(folhaMes, proLaboreMes);
  const cppPatronal = baseFolha * data.mei.aliquotaCppPatronal;

  const valorMensal = irpjTotal + csll + pis + cofins + tributoConsumoValor + cppPatronal;
  const aliquotaEfetiva = receitaMes > 0 ? valorMensal / receitaMes : 0;

  const breakdown: TaxBreakdownItem[] = [
    {
      nome: "IRPJ (15% + Adicional 10%)",
      valor: irpjTotal,
      percentualReceita: receitaMes > 0 ? irpjTotal / receitaMes : 0,
      observacao: `Presunção de ${formatPercent(cnae.presumedIrpjRate, 0)} sobre a receita`,
    },
    {
      nome: "CSLL (9%)",
      valor: csll,
      percentualReceita: receitaMes > 0 ? csll / receitaMes : 0,
      observacao: `Presunção de ${formatPercent(cnae.presumedCsllRate, 0)} sobre a receita`,
    },
    {
      nome: "PIS (0,65% cumulativo)",
      valor: pis,
      percentualReceita: 0.0065,
    },
    {
      nome: "COFINS (3,00% cumulativo)",
      valor: cofins,
      percentualReceita: 0.03,
    },
    {
      nome: tributoConsumoNome,
      valor: tributoConsumoValor,
      percentualReceita: receitaMes > 0 ? tributoConsumoValor / receitaMes : 0,
    },
  ];

  if (cppPatronal > 0) {
    breakdown.push({
      nome: "CPP Patronal (20% s/ folha/pró-labore)",
      valor: cppPatronal,
      percentualReceita: receitaMes > 0 ? cppPatronal / receitaMes : 0,
      observacao: `Base: ${formatBRL(baseFolha)} (não inclui RAT/Terceiros)`,
    });
  }

  return {
    regime: "LUCRO_PRESUMIDO",
    nome: "Lucro Presumido",
    elegivel,
    motivoInelegibilidade: elegivel
      ? undefined
      : `Receita anual excede o limite de ${formatBRL(LIMITE_LUCRO_PRESUMIDO_ANUAL)}.`,
    valorMensal,
    valorAnualProjetado: valorMensal * 12,
    aliquotaEfetiva,
    ehAproximacao: true,
    breakdown,
    observacoes: [
      "Estimativa aproximada com PIS/COFINS cumulativos (3,65%) e presunção padrão da atividade.",
      "Não considera RAT/FAP, Sistema S (Terceiros) ou regimes especiais estaduais de ICMS/ST.",
    ],
  };
}

export function calculateLucroReal(
  input: SimulationInput,
  data: SimplesData2026
): RegimeEstimateResult {
  const {
    cnae,
    receitaMes,
    folhaMes,
    proLaboreMes,
    issAliquota,
    margemLucroReal,
    percentualCreditosPisCofins,
  } = input;

  // Lucro líquido tributável estimado
  const lucroTributavel = Math.max(0, receitaMes * margemLucroReal);
  const irpjBasico = lucroTributavel * 0.15;
  const irpjAdicional =
    Math.max(0, lucroTributavel - LIMITE_ADICIONAL_IRPJ_MENSAL) * 0.1;
  const irpjTotal = irpjBasico + irpjAdicional;
  const csll = lucroTributavel * 0.09;

  // PIS (1,65%) e COFINS (7,60%) não-cumulativos com aproveitamento de créditos
  const baseCreditavel = receitaMes * Math.min(1, Math.max(0, percentualCreditosPisCofins));
  const pisLiquido = Math.max(0, receitaMes * 0.0165 - baseCreditavel * 0.0165);
  const cofinsLiquido = Math.max(0, receitaMes * 0.076 - baseCreditavel * 0.076);

  const tributoConsumoNome =
    cnae.category === "servicos"
      ? `ISS Municipal (${formatPercent(issAliquota)})`
      : `ICMS Efetivo Estimado (${formatPercent(cnae.defaultIcmsEffectiveRate)})`;
  const tributoConsumoValor =
    cnae.category === "servicos"
      ? receitaMes * issAliquota
      : receitaMes * cnae.defaultIcmsEffectiveRate;

  const baseFolha = Math.max(folhaMes, proLaboreMes);
  const cppPatronal = baseFolha * data.mei.aliquotaCppPatronal;

  const valorMensal =
    irpjTotal + csll + pisLiquido + cofinsLiquido + tributoConsumoValor + cppPatronal;
  const aliquotaEfetiva = receitaMes > 0 ? valorMensal / receitaMes : 0;

  const breakdown: TaxBreakdownItem[] = [
    {
      nome: "IRPJ (15% + Adic. 10% s/ Lucro)",
      valor: irpjTotal,
      percentualReceita: receitaMes > 0 ? irpjTotal / receitaMes : 0,
      observacao: `Margem de lucro estimada: ${formatPercent(margemLucroReal, 0)}`,
    },
    {
      nome: "CSLL (9% s/ Lucro)",
      valor: csll,
      percentualReceita: receitaMes > 0 ? csll / receitaMes : 0,
    },
    {
      nome: "PIS Não-Cumulativo (1,65% líq.)",
      valor: pisLiquido,
      percentualReceita: receitaMes > 0 ? pisLiquido / receitaMes : 0,
      observacao: `Créditos sobre ${formatPercent(percentualCreditosPisCofins, 0)} da receita`,
    },
    {
      nome: "COFINS Não-Cumulativo (7,60% líq.)",
      valor: cofinsLiquido,
      percentualReceita: receitaMes > 0 ? cofinsLiquido / receitaMes : 0,
    },
    {
      nome: tributoConsumoNome,
      valor: tributoConsumoValor,
      percentualReceita: receitaMes > 0 ? tributoConsumoValor / receitaMes : 0,
    },
  ];

  if (cppPatronal > 0) {
    breakdown.push({
      nome: "CPP Patronal (20% s/ folha/pró-labore)",
      valor: cppPatronal,
      percentualReceita: receitaMes > 0 ? cppPatronal / receitaMes : 0,
    });
  }

  return {
    regime: "LUCRO_REAL",
    nome: "Lucro Real",
    elegivel: true,
    valorMensal,
    valorAnualProjetado: valorMensal * 12,
    aliquotaEfetiva,
    ehAproximacao: true,
    breakdown,
    observacoes: [
      `Estimativa aproximada assumindo margem de lucro de ${formatPercent(margemLucroReal, 0)} e ${formatPercent(percentualCreditosPisCofins, 0)} de despesas com crédito de PIS/COFINS.`,
      "No Lucro Real, o imposto depende da escrituração contábil (LALUR/LACS) e pode ser reduzido em meses de prejuízo.",
    ],
  };
}

export function compareAllRegimes(
  input: SimulationInput,
  data: SimplesData2026
): {
  mei: MeiResult;
  simples: SimplesResult;
  comparativo: RegimeEstimateResult[];
  melhorRegime: RegimeEstimateResult | null;
} {
  const mei = calculateMei2026(input, data);
  const simples = calculateSimplesNacional2026(input, data);
  const presumido = calculateLucroPresumido(input, data);
  const real = calculateLucroReal(input, data);

  const meiEstimate: RegimeEstimateResult = {
    regime: "MEI",
    nome: "MEI (2026)",
    elegivel: mei.elegivel,
    motivoInelegibilidade: mei.motivoInelegibilidade,
    valorMensal: mei.valorDasFixo,
    valorAnualProjetado: mei.valorDasFixo * 12,
    aliquotaEfetiva: mei.aliquotaEfetiva,
    ehAproximacao: false,
    breakdown: [
      {
        nome: "INSS (5% Salário Mínimo)",
        valor: mei.inss,
        percentualReceita: input.receitaMes > 0 ? mei.inss / input.receitaMes : 0,
      },
      ...(mei.icms > 0
        ? [
            {
              nome: "ICMS Fixo",
              valor: mei.icms,
              percentualReceita: input.receitaMes > 0 ? mei.icms / input.receitaMes : 0,
            },
          ]
        : []),
      ...(mei.iss > 0
        ? [
            {
              nome: "ISS Fixo",
              valor: mei.iss,
              percentualReceita: input.receitaMes > 0 ? mei.iss / input.receitaMes : 0,
            },
          ]
        : []),
    ],
    observacoes: [
      `Limite anual de faturamento: ${formatBRL(data.mei.limiteAnual)} (média ${formatBRL(data.mei.limiteMensalMedio)}/mês).`,
    ],
  };

  const simplesEstimate: RegimeEstimateResult = {
    regime: "SIMPLES_NACIONAL",
    nome: `Simples Nacional (Anexo ${simples.anexoAplicado})`,
    elegivel: simples.elegivel,
    motivoInelegibilidade: simples.motivoInelegibilidade,
    valorMensal: simples.totalMensal,
    valorAnualProjetado: simples.totalMensal * 12,
    aliquotaEfetiva: simples.aliquotaTotalEfetiva,
    ehAproximacao: false,
    breakdown: simples.reparticao,
    observacoes: [
      `Enquadrado na ${simples.faixa}ª faixa do Anexo ${simples.anexoAplicado} (Alíquota efetiva DAS: ${formatPercent(simples.aliquotaEfetiva)}).`,
      ...(simples.cppSeparadaAnexoIV > 0
        ? [`Inclui CPP patronal separada de ${formatBRL(simples.cppSeparadaAnexoIV)} (Anexo IV).`]
        : []),
      ...(simples.inssProLabore > 0
        ? [`Inclui INSS 11% sobre pró-labore (${formatBRL(simples.inssProLabore)}).`]
        : []),
    ],
  };

  const comparativo = [meiEstimate, simplesEstimate, presumido, real];
  const elegiveis = comparativo.filter((r) => r.elegivel);
  const melhorRegime =
    elegiveis.length > 0
      ? elegiveis.reduce((best, curr) =>
          curr.valorMensal < best.valorMensal ? curr : best
        )
      : null;

  if (melhorRegime) {
    melhorRegime.destaque = "Menor carga estimada";
  }

  return { mei, simples, comparativo, melhorRegime };
}

/**
 * Tabela Progressiva IRPF 2026 (incluindo faixa de isenção ampliada até R$ 5.000/mês
 * com redução gradual até R$ 7.350, conforme Lei 15.270/2025 vigente em 2026).
 */
export function calculateIrpfMensal2026(baseCalculo: number): number {
  if (baseCalculo <= 5000) return 0;

  // Cálculo padrão da tabela progressiva
  let irTabela = 0;
  if (baseCalculo <= 2428.8) {
    irTabela = 0;
  } else if (baseCalculo <= 2826.65) {
    irTabela = baseCalculo * 0.075 - 182.16;
  } else if (baseCalculo <= 3751.05) {
    irTabela = baseCalculo * 0.15 - 394.16;
  } else if (baseCalculo <= 4664.68) {
    irTabela = baseCalculo * 0.225 - 675.49;
  } else {
    irTabela = baseCalculo * 0.275 - 908.73;
  }

  // Redutor linear entre R$ 5.000,01 e R$ 7.350,00 (transição da isenção 2026)
  if (baseCalculo <= 7350) {
    const fatorReducao = (7350 - baseCalculo) / (7350 - 5000);
    const reducao = Math.min(irTabela, 312.89 * fatorReducao);
    return Math.max(0, irTabela - reducao);
  }

  return Math.max(0, irTabela);
}

/**
 * Módulo 2: Simulador Autônomo (Pessoa Física vs. PJ - MEI / Simples Nacional)
 */
export function calculatePfVsPj(
  input: SimulationInput,
  data: SimplesData2026,
  contabilidadeMensal = 250
): PfVsPjResult {
  const receitaMensal = input.receitaMes;

  // Pessoa Física (Autônomo / RPA / Carnê-Leão)
  const inssAutonomo = Math.min(receitaMensal, data.mei.tetoInss2026) * 0.2;
  const baseIrpf = Math.max(0, receitaMensal - inssAutonomo);
  const irpf = calculateIrpfMensal2026(baseIrpf);
  const issAutonomo =
    input.cnae.category === "servicos" ? receitaMensal * input.issAliquota : 0;

  // Impacto potencial do IVA Dual (LC 214/2025) para autônomo contribuinte habitual (receita > limite)
  const aliquotaIvaPlena = 0.265 * (1 - input.cnae.ibsCbsReduction);
  const ivaDualEstimado2027 =
    receitaMensal * 12 > 81000 ? receitaMensal * (aliquotaIvaPlena * 0.35) : 0;

  const totalAtualPf = irpf + inssAutonomo + issAutonomo;
  const totalComReformaPf = irpf + inssAutonomo + ivaDualEstimado2027;

  // PJ - Simples Nacional (com pró-labore mínimo de 1 SM ou o informado para Fator R)
  const proLaboreSugerido =
    input.proLaboreMes > 0
      ? input.proLaboreMes
      : input.cnae.fatorR
      ? Math.max(data.mei.salarioMinimo, receitaMensal * 0.285)
      : data.mei.salarioMinimo;

  const pjInput: SimulationInput = {
    ...input,
    rbt12: input.rbt12 > 0 ? input.rbt12 : receitaMensal * 12,
    folha12m: input.folha12m > 0 ? input.folha12m : proLaboreSugerido * 12,
    folhaMes: input.folhaMes > 0 ? input.folhaMes : proLaboreSugerido,
    proLaboreMes: proLaboreSugerido,
    incluirInssProLabore: true,
  };

  const simplesPj = calculateSimplesNacional2026(pjInput, data);
  const totalPjMensal = simplesPj.totalMensal + contabilidadeMensal;

  const meiResult = calculateMei2026(pjInput, data);
  const meiOption = meiResult.elegivel
    ? {
        dasFixo: meiResult.valorDasFixo,
        totalMensal: meiResult.valorDasFixo,
        aliquotaEfetiva: meiResult.aliquotaEfetiva,
        liquidoMensal: Math.max(0, receitaMensal - meiResult.valorDasFixo),
      }
    : undefined;

  const melhorPjTotal = meiOption
    ? Math.min(meiOption.totalMensal, totalPjMensal)
    : totalPjMensal;
  const economiaMensalPjVsPf = totalAtualPf - melhorPjTotal;
  const economiaAnualPjVsPf = economiaMensalPjVsPf * 12;

  let recomendacao = "";
  if (meiOption && economiaMensalPjVsPf > 0) {
    recomendacao = `Abrir um MEI é altamente vantajoso: economia estimada de ${formatBRL(economiaMensalPjVsPf)}/mês (${formatBRL(economiaAnualPjVsPf)}/ano) frente à Pessoa Física.`;
  } else if (economiaMensalPjVsPf > 150) {
    recomendacao = `Vale a pena abrir uma ME no Simples Nacional (Anexo ${simplesPj.anexoAplicado}): economia estimada de ${formatBRL(economiaMensalPjVsPf)}/mês (${formatBRL(economiaAnualPjVsPf)}/ano), já considerando contabilidade de ${formatBRL(contabilidadeMensal)}/mês.`;
  } else if (economiaMensalPjVsPf > 0) {
    recomendacao = `Pequena vantagem para PJ (${formatBRL(economiaMensalPjVsPf)}/mês). Avalie o custo de abertura e obrigações acessórias com um contador.`;
  } else {
    recomendacao = `Para este nível de faturamento, atuar como Pessoa Física (com a faixa de isenção 2026 do IRPF) tende a ser mais econômico que abrir ME (diferença de ${formatBRL(Math.abs(economiaMensalPjVsPf))}/mês).`;
  }

  return {
    receitaMensal,
    pf: {
      irpf,
      inssAutonomo,
      issAutonomo,
      ivaDualEstimado2027,
      totalAtual: totalAtualPf,
      aliquotaAtual: receitaMensal > 0 ? totalAtualPf / receitaMensal : 0,
      totalComReforma: totalComReformaPf,
      liquidoMensal: Math.max(0, receitaMensal - totalAtualPf),
    },
    pjSimples: {
      das: simplesPj.valorDas,
      inssProLabore: simplesPj.inssProLabore,
      cppSeparada: simplesPj.cppSeparadaAnexoIV,
      contabilidadeEstimada: contabilidadeMensal,
      totalMensal: totalPjMensal,
      aliquotaEfetiva: receitaMensal > 0 ? totalPjMensal / receitaMensal : 0,
      liquidoMensal: Math.max(0, receitaMensal - totalPjMensal),
    },
    mei: meiOption,
    economiaMensalPjVsPf,
    economiaAnualPjVsPf,
    recomendacao,
  };
}
