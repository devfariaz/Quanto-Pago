import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const IBGE_SUBCLASSES_URL =
  "https://servicodados.ibge.gov.br/api/v2/cnae/subclasses";

const ROOT = process.cwd();
const CURATED_PATH = resolve(ROOT, "scripts/cnaes-curated.json");
const OUTPUT_PATH = resolve(ROOT, "src/data/cnaes.json");

const ACRONYMS = new Map([
  ["ti", "TI"],
  ["it", "IT"],
  ["tv", "TV"],
  ["cd", "CD"],
  ["dvd", "DVD"],
  ["cds", "CDs"],
  ["dvds", "DVDs"],
  ["glp", "GLP"],
  ["gnv", "GNV"],
  ["p&d", "P&D"],
  ["ong", "ONG"],
  ["ongs", "ONGs"],
  ["mei", "MEI"],
  ["icms", "ICMS"],
  ["iss", "ISS"],
  ["saas", "SaaS"],
  ["erp", "ERP"],
  ["cnc", "CNC"],
  ["led", "LED"],
  ["pvc", "PVC"],
  ["pet", "PET"],
  ["uti", "UTI"],
  ["sus", "SUS"],
]);

function formatCnaeCode(rawId) {
  const digits = String(rawId).replace(/[^\d]/g, "").padStart(7, "0");
  return `${digits.slice(0, 4)}-${digits.slice(4, 5)}/${digits.slice(5, 7)}`;
}

function formatDescription(raw) {
  const lower = raw.trim().toLowerCase();
  if (!lower) return "";
  const formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
  return formatted.replace(/\b([a-z&]{2,5})\b/g, (word) => {
    return ACRONYMS.get(word) ?? word;
  });
}

function classifyCnae(item) {
  const id = String(item.id).padStart(7, "0");
  const secao = item.classe?.grupo?.divisao?.secao?.id ?? "";
  const divisao = Number(item.classe?.grupo?.divisao?.id ?? id.slice(0, 2));
  const grupo = id.slice(0, 3);
  const classe = id.slice(0, 4);

  // Defaults
  let category = "servicos";
  let anexo = "III";
  let fatorR = false;
  let meiAllowed = false;
  let presumedIrpjRate = 0.32;
  let presumedCsllRate = 0.32;
  let defaultIssRate = 0.05;
  let defaultIcmsEffectiveRate = 0;
  let ibsCbsReduction = 0;

  switch (secao) {
    case "A": {
      // Agricultura, Pecuária, Produção Florestal, Pesca e Aquicultura
      const isSupportService =
        classe === "0161" ||
        classe === "0162" ||
        classe === "0163" ||
        classe === "0230";
      if (isSupportService) {
        category = "servicos";
        anexo = "III";
        presumedIrpjRate = 0.32;
        presumedCsllRate = 0.32;
        defaultIssRate = 0.03;
      } else {
        category = "comercio";
        anexo = "I";
        presumedIrpjRate = 0.08;
        presumedCsllRate = 0.12;
        defaultIssRate = 0;
        defaultIcmsEffectiveRate = 0.04;
      }
      ibsCbsReduction = 0.6;
      break;
    }

    case "B": {
      // Indústrias Extrativas
      if (divisao === 9) {
        category = "servicos";
        anexo = "III";
        presumedIrpjRate = 0.32;
        presumedCsllRate = 0.32;
        defaultIssRate = 0.03;
      } else {
        category = "industria";
        anexo = "II";
        presumedIrpjRate = 0.08;
        presumedCsllRate = 0.12;
        defaultIssRate = 0;
        defaultIcmsEffectiveRate = 0.07;
      }
      break;
    }

    case "C": {
      // Indústrias de Transformação
      if (divisao === 33) {
        // Manutenção, reparação e instalação de máquinas e equipamentos
        category = "servicos";
        anexo = "III";
        presumedIrpjRate = 0.32;
        presumedCsllRate = 0.32;
        defaultIssRate = 0.03;
        meiAllowed = true;
      } else {
        category = "industria";
        anexo = "II";
        presumedIrpjRate = 0.08;
        presumedCsllRate = 0.12;
        defaultIssRate = 0;
        defaultIcmsEffectiveRate = 0.07;
        // Alimentos essenciais e medicamentos/fármacos (LC 214/2025)
        if (
          (divisao === 10 && ["101", "102", "103", "104", "105", "106"].includes(grupo)) ||
          divisao === 21
        ) {
          ibsCbsReduction = 0.6;
        }
      }
      break;
    }

    case "D": {
      // Eletricidade e Gás
      category = "servicos";
      anexo = "III";
      presumedIrpjRate = 0.08;
      presumedCsllRate = 0.12;
      defaultIssRate = 0;
      defaultIcmsEffectiveRate = 0.12;
      break;
    }

    case "E": {
      // Água, Esgoto, Gestão de Resíduos e Descontaminação
      category = "servicos";
      anexo = "III";
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;
      break;
    }

    case "F": {
      // Construção
      category = "servicos";
      anexo = "IV";
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.03;
      if (grupo === "432" || grupo === "433") {
        meiAllowed = true;
      }
      break;
    }

    case "G": {
      // Comércio; Reparação de Veículos Automotores e Motocicletas
      const isVehicleRepair = classe === "4520" || classe === "4543";
      if (isVehicleRepair) {
        category = "servicos";
        anexo = "III";
        presumedIrpjRate = 0.32;
        presumedCsllRate = 0.32;
        defaultIssRate = 0.03;
        defaultIcmsEffectiveRate = 0;
        meiAllowed = true;
      } else {
        category = "comercio";
        anexo = "I";
        const isFuel = grupo === "473" || classe === "4681";
        presumedIrpjRate = isFuel ? 0.016 : 0.08;
        presumedCsllRate = 0.12;
        defaultIssRate = 0;
        defaultIcmsEffectiveRate = 0.06;
        meiAllowed = divisao === 47 && grupo !== "473" && classe !== "4789";
      }
      break;
    }

    case "H": {
      // Transporte, Armazenagem e Correio
      category = "servicos";
      anexo = "III";
      const isCargo =
        classe === "4930" ||
        grupo === "501" ||
        grupo === "502" ||
        grupo === "512";
      const isPassenger =
        grupo === "492" ||
        grupo === "509" ||
        grupo === "511";

      if (isCargo) {
        presumedIrpjRate = 0.08;
        presumedCsllRate = 0.12;
        defaultIssRate = 0;
        defaultIcmsEffectiveRate = 0.07;
      } else if (isPassenger) {
        presumedIrpjRate = 0.16;
        presumedCsllRate = 0.12;
        defaultIssRate = 0.03;
      } else {
        presumedIrpjRate = 0.32;
        presumedCsllRate = 0.32;
        defaultIssRate = 0.05;
      }

      if (["4912", "4921", "4922", "4924"].includes(classe)) {
        ibsCbsReduction = 0.6;
      }
      if (classe === "4924" || classe === "4930" || divisao === 53) {
        meiAllowed = true;
      }
      break;
    }

    case "I": {
      // Alojamento e Alimentação
      if (divisao === 56) {
        // Restaurantes, bares, lanchonetes, buffets (circulação de mercadoria)
        category = "comercio";
        anexo = "I";
        presumedIrpjRate = 0.08;
        presumedCsllRate = 0.12;
        defaultIssRate = 0;
        defaultIcmsEffectiveRate = 0.04;
        meiAllowed = true;
      } else {
        category = "servicos";
        anexo = "III";
        presumedIrpjRate = 0.32;
        presumedCsllRate = 0.32;
        defaultIssRate = 0.05;
        meiAllowed = classe === "5590";
      }
      break;
    }

    case "J": {
      // Informação e Comunicação
      category = "servicos";
      const isFatorRTi =
        ["6201", "6202", "6203", "6204", "6391"].includes(classe);
      anexo = isFatorRTi ? "V" : "III";
      fatorR = isFatorRTi;
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = divisao === 62 || divisao === 63 ? 0.02 : 0.05;
      meiAllowed = divisao === 59 && grupo === "591" ? false : classe === "6209";
      break;
    }

    case "K": {
      // Atividades Financeiras, de Seguros e Serviços Relacionados
      category = "servicos";
      anexo = "V";
      fatorR = false;
      meiAllowed = false;
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;
      break;
    }

    case "L": {
      // Atividades Imobiliárias
      category = "servicos";
      anexo = "V";
      fatorR = true;
      meiAllowed = false;
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;
      break;
    }

    case "M": {
      // Atividades Profissionais, Científicas e Técnicas
      category = "servicos";
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;
      meiAllowed = false;

      if (classe === "6911") {
        anexo = "IV";
        fatorR = false;
        ibsCbsReduction = 0.3;
      } else if (classe === "6920") {
        anexo = "III";
        fatorR = false;
        ibsCbsReduction = 0.3;
      } else if (divisao === 74 && classe === "7420") {
        // Fotografia
        anexo = "III";
        fatorR = false;
        meiAllowed = true;
      } else {
        anexo = "V";
        fatorR = true;
        if ([69, 71, 75].includes(divisao) || classe === "7020") {
          ibsCbsReduction = 0.3;
        }
      }
      break;
    }

    case "N": {
      // Atividades Administrativas e Serviços Complementares
      category = "servicos";
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;

      if (divisao === 80 || grupo === "812") {
        // Vigilância, segurança e limpeza
        anexo = "IV";
        fatorR = false;
      } else if (classe === "7810") {
        anexo = "V";
        fatorR = true;
      } else {
        anexo = "III";
        fatorR = false;
        meiAllowed = divisao === 82 || grupo === "813";
      }
      break;
    }

    case "O": {
      // Administração Pública, Defesa e Seguridade Social
      category = "servicos";
      anexo = "III";
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;
      break;
    }

    case "P": {
      // Educação
      category = "servicos";
      anexo = "III";
      fatorR = false;
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.02;
      ibsCbsReduction = 0.6;
      meiAllowed = classe === "8593" || classe === "8599";
      break;
    }

    case "Q": {
      // Saúde Humana e Serviços Sociais
      category = "servicos";
      anexo = divisao === 86 ? "V" : "III";
      fatorR = divisao === 86;
      meiAllowed = false;
      const isHospital = classe === "8610";
      presumedIrpjRate = isHospital ? 0.08 : 0.32;
      presumedCsllRate = isHospital ? 0.12 : 0.32;
      defaultIssRate = 0.02;
      ibsCbsReduction = 0.6;
      break;
    }

    case "R": {
      // Artes, Cultura, Esporte e Recreação
      category = "servicos";
      anexo = "III";
      fatorR = false;
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;
      ibsCbsReduction = 0.6;
      meiAllowed = divisao === 90 || divisao === 93;
      break;
    }

    case "S": {
      // Outras Atividades de Serviços
      category = "servicos";
      anexo = "III";
      fatorR = false;
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.03;
      meiAllowed = divisao === 95 || divisao === 96;
      break;
    }

    default: {
      // T (Serviços Domésticos), U (Organismos Internacionais)
      category = "servicos";
      anexo = "III";
      presumedIrpjRate = 0.32;
      presumedCsllRate = 0.32;
      defaultIssRate = 0.05;
      break;
    }
  }

  return {
    code: formatCnaeCode(id),
    description: formatDescription(item.descricao),
    anexo,
    fatorR,
    meiAllowed,
    category,
    presumedIrpjRate,
    presumedCsllRate,
    defaultIssRate,
    defaultIcmsEffectiveRate,
    ibsCbsReduction,
  };
}

async function main() {
  const curatedRaw = JSON.parse(readFileSync(CURATED_PATH, "utf8"));
  const curatedMap = new Map(curatedRaw.map((item) => [item.code, item]));

  console.log(`Buscando subclasses CNAE na API do IBGE...`);
  const response = await fetch(IBGE_SUBCLASSES_URL, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Falha ao consultar API do IBGE: HTTP ${response.status}`);
  }
  const subclasses = await response.json();

  const mergedMap = new Map();
  for (const sub of subclasses) {
    const generated = classifyCnae(sub);
    if (!mergedMap.has(generated.code)) {
      mergedMap.set(generated.code, curatedMap.get(generated.code) ?? generated);
    }
  }

  // Garantir que todos os curados estejam presentes mesmo se algum código mudar no IBGE
  for (const [code, curated] of curatedMap.entries()) {
    if (!mergedMap.has(code)) {
      mergedMap.set(code, curated);
    }
  }

  const result = Array.from(mergedMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(
    `✅ Gerado ${result.length} CNAEs em src/data/cnaes.json (${curatedMap.size} curados preservados).`
  );
}

main().catch((err) => {
  console.error("Erro ao gerar CNAEs:", err);
  process.exit(1);
});
