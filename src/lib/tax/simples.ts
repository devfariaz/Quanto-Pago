import type {
  AnexoKey,
  CalculationStep,
  MeiResult,
  SimplesBracket,
  SimplesData2026,
  SimplesResult,
  SimulationInput,
  TaxBreakdownItem,
} from "@/types/tax";
import { formatBRL, formatPercent } from "@/lib/format";

export function findSimplesBracket(
  faixas: SimplesBracket[],
  rbt12: number
): SimplesBracket {
  for (const faixa of faixas) {
    if (rbt12 <= faixa.maxRbt12) {
      return faixa;
    }
  }
  return faixas[faixas.length - 1];
}

export function calculateMei2026(
  input: SimulationInput,
  data: SimplesData2026
): MeiResult {
  const { cnae, rbt12, receitaMes } = input;
  const receitaAnualRef = rbt12 > 0 ? rbt12 : receitaMes * 12;
  const percentualLimiteUsado = receitaAnualRef / data.mei.limiteAnual;

  const icms = cnae.category === "comercio" || cnae.category === "industria" ? data.mei.icmsFixo : 0;
  const iss = cnae.category === "servicos" ? data.mei.issFixo : 0;
  const inss = data.mei.inssBase;
  const valorDasFixo = inss + icms + iss;

  let elegivel = true;
  let motivoInelegibilidade: string | undefined;

  if (!cnae.meiAllowed) {
    elegivel = false;
    motivoInelegibilidade = `O CNAE ${cnae.code} não é permitido no MEI (atividade intelectual/regulamentada ou vedada).`;
  } else if (receitaAnualRef > data.mei.limiteAnual) {
    elegivel = false;
    motivoInelegibilidade = `Receita anual (${formatBRL(receitaAnualRef)}) ultrapassa o limite do MEI (${formatBRL(data.mei.limiteAnual)}/ano).`;
  }

  const aliquotaEfetiva = receitaMes > 0 ? valorDasFixo / receitaMes : 0;

  const memoria: CalculationStep[] = [
    {
      titulo: "1. Verificação de Elegibilidade do MEI (2026)",
      formula: `Limite anual MEI: ${formatBRL(data.mei.limiteAnual)} | Receita ref.: ${formatBRL(receitaAnualRef)}`,
      resultado: elegivel ? "Elegível ao MEI" : "Não elegível",
      detalhe: motivoInelegibilidade,
    },
    {
      titulo: "2. Composição do DAS Fixo Mensal (Salário Mínimo 2026)",
      formula: `INSS (5% de ${formatBRL(data.mei.salarioMinimo)}) ${icms > 0 ? `+ ICMS (${formatBRL(icms)})` : ""} ${iss > 0 ? `+ ISS (${formatBRL(iss)})` : ""}`,
      resultado: formatBRL(valorDasFixo),
      detalhe: "Valor fixo mensal independentemente do faturamento dentro do limite anual.",
    },
    {
      titulo: "3. Carga Tributária Efetiva no Mês",
      formula: `${formatBRL(valorDasFixo)} ÷ ${formatBRL(receitaMes)}`,
      resultado: formatPercent(aliquotaEfetiva),
    },
  ];

  return {
    elegivel,
    motivoInelegibilidade,
    valorDasFixo,
    inss,
    icms,
    iss,
    aliquotaEfetiva,
    percentualLimiteUsado,
    memoria,
  };
}

export function calculateSimplesNacional2026(
  input: SimulationInput,
  data: SimplesData2026
): SimplesResult {
  const {
    cnae,
    rbt12,
    receitaMes,
    folha12m,
    folhaMes,
    proLaboreMes,
    incluirInssProLabore,
  } = input;

  // Se empresa nova (RBT12 = 0), projeta-se proporcionalmente receitaMes * 12 (LC 123/2006)
  const rbt12Considerado = rbt12 > 0 ? rbt12 : receitaMes * 12;
  const elegivel = rbt12Considerado <= data.limiteSimples;
  const motivoInelegibilidade = elegivel
    ? undefined
    : `RBT12 (${formatBRL(rbt12Considerado)}) ultrapassa o teto de ${formatBRL(data.limiteSimples)} do Simples Nacional.`;

  // Regra do Fator R (Anexos III e V para CNAEs sujeitos ao Fator R)
  let anexoAplicado: AnexoKey = cnae.anexo;
  let fatorR: number | undefined;
  let fatorRAplicado = false;

  if (cnae.fatorR) {
    fatorRAplicado = true;
    fatorR = rbt12Considerado > 0 ? folha12m / rbt12Considerado : 0;
    anexoAplicado = fatorR >= data.fatorRMinimo ? "III" : "V";
  }

  const anexoTable = data.anexos[anexoAplicado];
  const bracket = findSimplesBracket(anexoTable.faixas, rbt12Considerado);

  // Fórmula oficial: Alíquota Efetiva = ((RBT12 * Alíquota Nominal) - Parcela a Deduzir) / RBT12
  const aliquotaEfetiva =
    rbt12Considerado > 0
      ? Math.max(
          0,
          (rbt12Considerado * bracket.aliquotaNominal - bracket.parcelaDeduzir) /
            rbt12Considerado
        )
      : bracket.aliquotaNominal;

  const valorDas = receitaMes * aliquotaEfetiva;

  // Módulo 2: Anexo IV com CPP Patronal separada (20% sobre folha mensal + pró-labore)
  const baseFolhaCpp = Math.max(folhaMes, proLaboreMes);
  const cppSeparadaAnexoIV = anexoTable.cppSeparada
    ? baseFolhaCpp * data.mei.aliquotaCppPatronal
    : 0;

  // Módulo 2: INSS sobre Pró-labore (11% limitado ao teto do INSS 2026)
  const baseProLaboreTeto = Math.min(proLaboreMes, data.mei.tetoInss2026);
  const inssProLabore = incluirInssProLabore
    ? baseProLaboreTeto * data.mei.aliquotaInssProLabore
    : 0;

  const totalMensal = valorDas + cppSeparadaAnexoIV + inssProLabore;
  const aliquotaTotalEfetiva = receitaMes > 0 ? totalMensal / receitaMes : 0;
  const alertaSublimite = rbt12Considerado > data.sublimiteIcmsIss;

  // Repartição dos tributos dentro do DAS
  const reparticao: TaxBreakdownItem[] = Object.entries(bracket.reparticao)
    .filter(([, pct]) => pct > 0)
    .map(([tributo, pct]) => ({
      nome: `${tributo} (no DAS)`,
      valor: valorDas * pct,
      percentualReceita: aliquotaEfetiva * pct,
      observacao: `${formatPercent(pct)} da guia DAS`,
    }));

  if (cppSeparadaAnexoIV > 0) {
    reparticao.push({
      nome: "CPP Patronal (Fora do DAS — Anexo IV)",
      valor: cppSeparadaAnexoIV,
      percentualReceita: receitaMes > 0 ? cppSeparadaAnexoIV / receitaMes : 0,
      observacao: `20% sobre folha/pró-labore (${formatBRL(baseFolhaCpp)})`,
    });
  }

  if (inssProLabore > 0) {
    reparticao.push({
      nome: "INSS Pró-labore (Retido — 11%)",
      valor: inssProLabore,
      percentualReceita: receitaMes > 0 ? inssProLabore / receitaMes : 0,
      observacao: `11% sobre ${formatBRL(baseProLaboreTeto)} (teto ${formatBRL(data.mei.tetoInss2026)})`,
    });
  }

  const memoria: CalculationStep[] = [
    {
      titulo: "1. Enquadramento de CNAE e Anexo",
      formula: `CNAE ${cnae.code} (${cnae.description})`,
      resultado: `Anexo ${anexoAplicado} — ${anexoTable.nome}`,
      detalhe: fatorRAplicado
        ? `Fator R = ${formatBRL(folha12m)} ÷ ${formatBRL(rbt12Considerado)} = ${formatPercent(fatorR ?? 0)}. Como é ${(fatorR ?? 0) >= 0.28 ? "≥ 28%, aplica-se o Anexo III (mais vantajoso)" : "< 28%, aplica-se o Anexo V"}.`
        : "Atividade não sujeita ao Fator R; enquadramento direto pelo CNAE.",
    },
    {
      titulo: "2. Identificação da Faixa pelo RBT12",
      formula: `RBT12 considerado: ${formatBRL(rbt12Considerado)}${rbt12 === 0 ? " (proporcionalizado: Receita do mês × 12)" : ""}`,
      resultado: `${bracket.faixa}ª Faixa (Alíquota Nominal: ${formatPercent(bracket.aliquotaNominal)} | Parcela a Deduzir: ${formatBRL(bracket.parcelaDeduzir)})`,
      detalhe: alertaSublimite
        ? `Atenção: RBT12 acima do sublimite de ${formatBRL(data.sublimiteIcmsIss)} — ICMS/ISS devem ser recolhidos fora do DAS.`
        : undefined,
    },
    {
      titulo: "3. Cálculo da Alíquota Efetiva",
      formula: `[(${formatBRL(rbt12Considerado)} × ${formatPercent(bracket.aliquotaNominal)}) − ${formatBRL(bracket.parcelaDeduzir)}] ÷ ${formatBRL(rbt12Considerado)}`,
      resultado: formatPercent(aliquotaEfetiva),
    },
    {
      titulo: "4. Valor do DAS no Mês",
      formula: `${formatBRL(receitaMes)} × ${formatPercent(aliquotaEfetiva)}`,
      resultado: formatBRL(valorDas),
    },
  ];

  if (anexoTable.cppSeparada) {
    memoria.push({
      titulo: "5. CPP Patronal Separada (Obrigatória no Anexo IV)",
      formula: `${formatBRL(baseFolhaCpp)} × 20,00%`,
      resultado: formatBRL(cppSeparadaAnexoIV),
      detalhe: "No Anexo IV a CPP não integra o DAS e é recolhida via DARF previdenciário (DCTFWeb).",
    });
  }

  if (incluirInssProLabore && proLaboreMes > 0) {
    memoria.push({
      titulo: `${memoria.length + 1}. INSS sobre Pró-labore (11%)`,
      formula: `${formatBRL(baseProLaboreTeto)} × 11,00%`,
      resultado: formatBRL(inssProLabore),
      detalhe: `Recolhido separadamente do DAS (limitado ao teto do INSS 2026 de ${formatBRL(data.mei.tetoInss2026)}).`,
    });
  }

  return {
    elegivel,
    motivoInelegibilidade,
    anexoOriginal: cnae.anexo,
    anexoAplicado,
    fatorR,
    fatorRAplicado,
    rbt12Considerado,
    faixa: bracket.faixa,
    aliquotaNominal: bracket.aliquotaNominal,
    parcelaDeduzir: bracket.parcelaDeduzir,
    aliquotaEfetiva,
    valorDas,
    cppSeparadaAnexoIV,
    inssProLabore,
    totalMensal,
    aliquotaTotalEfetiva,
    alertaSublimite,
    reparticao,
    memoria,
  };
}
