import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const simples = JSON.parse(readFileSync(resolve(root, "src/data/simples-2026.json"), "utf8"));
const cnaes = JSON.parse(readFileSync(resolve(root, "src/data/cnaes.json"), "utf8"));
const reforma = JSON.parse(readFileSync(resolve(root, "src/data/reforma-2027-2033.json"), "utf8"));

// 1. Verificar estrutura dos 5 Anexos e 6 faixas (LC 123/2006 - 2026)
const anexosKeys = ["I", "II", "III", "IV", "V"];
for (const key of anexosKeys) {
  const anexo = simples.anexos[key];
  assert.ok(anexo, `Anexo ${key} ausente`);
  assert.equal(anexo.faixas.length, 6, `Anexo ${key} deve ter 6 faixas`);

  // Verificar soma da repartição = 100% (1.0) em cada faixa
  for (const faixa of anexo.faixas) {
    const soma = Object.values(faixa.reparticao).reduce((a, b) => a + b, 0);
    assert.ok(
      Math.abs(soma - 1) < 0.001,
      `Anexo ${key} Faixa ${faixa.faixa}: soma de repartição = ${soma} (esperado 1.0)`
    );
  }
}

// 2. Verificar fórmula oficial da Alíquota Efetiva: ((RBT12 * Aliq) - PD) / RBT12
function aliqEfetiva(anexoKey, rbt12) {
  const faixa = simples.anexos[anexoKey].faixas.find((f) => rbt12 <= f.maxRbt12);
  return (rbt12 * faixa.aliquotaNominal - faixa.parcelaDeduzir) / rbt12;
}

// Anexo I 1ª faixa (R$ 150k) = 4,00%
assert.ok(Math.abs(aliqEfetiva("I", 150000) - 0.04) < 1e-6);
// Anexo III 2ª faixa (R$ 360k) = (360k * 11,2% - 9.360) / 360k = 8,60%
assert.ok(Math.abs(aliqEfetiva("III", 360000) - 0.086) < 1e-6);
// Anexo IV 1ª faixa (R$ 180k) = 4,50% e cppSeparada = true
assert.equal(simples.anexos.IV.cppSeparada, true);
assert.ok(Math.abs(aliqEfetiva("IV", 180000) - 0.045) < 1e-6);
// Anexo V 2ª faixa (R$ 360k) = (360k * 18% - 4.500) / 360k = 16,75%
assert.ok(Math.abs(aliqEfetiva("V", 360000) - 0.1675) < 1e-6);

// 3. Verificar MEI 2026
assert.equal(simples.mei.limiteAnual, 81000);
assert.ok(Math.abs(simples.mei.inssBase - simples.mei.salarioMinimo * 0.05) < 0.01);

// 4. Verificar catálogo de CNAEs
assert.ok(cnaes.length >= 35, `Esperado >= 35 CNAEs, encontrado ${cnaes.length}`);
for (const cnae of cnaes) {
  assert.ok(anexosKeys.includes(cnae.anexo), `CNAE ${cnae.code} com anexo inválido`);
}

// 5. Verificar cronograma da Reforma Tributária (2026-2033)
assert.equal(reforma.cronograma.length, 8);
assert.equal(reforma.cronograma[0].ano, 2026);
assert.equal(reforma.cronograma[7].ano, 2033);
assert.equal(reforma.cronograma[7].fatorPisCofins, 0);
assert.equal(reforma.cronograma[7].fatorIcmsIss, 0);

console.log(
  `✅ Verificação concluída: 5 Anexos (30 faixas), ${cnaes.length} CNAEs e cronograma 2026–2033 validados!`
);
