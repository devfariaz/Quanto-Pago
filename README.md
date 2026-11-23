# QuantoPago — Calculadora Tributária Brasileira 2026 & Reforma Tributária

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Static_Export_(SSG)-1B4332?style=flat)](https://quantopago.sanctyxstudios.com.br)

> Descubra em 30 segundos quanto sua empresa paga de imposto no Brasil — compare **MEI**, **Simples Nacional 2026**, **Lucro Presumido**, **Lucro Real** e simule os impactos da **Reforma Tributária (LC 214/2025)**.

🌐 **Acesse online:** [quantopago.sanctyxstudios.com.br](https://quantopago.sanctyxstudios.com.br)

---

## Sobre o Projeto

O **QuantoPago** é uma aplicação web **100% estática (SSG)** desenvolvida com **Next.js (App Router, `output: 'export'`)**, **TypeScript** e **Tailwind CSS**.

Todos os cálculos são executados diretamente no navegador do usuário, sem backend dedicado e sem persistência de dados financeiros em servidor — garantindo privacidade total, carregamento ultrarrápido e hospedagem simples em qualquer servidor estático ou VPS (Nginx, Caddy, Apache, etc.).

---

## Funcionalidades

### Cálculo & Comparador Tributário (2026)
- **Fluxo Guiado (Wizard) com Autocomplete de CNAE:** Busca de CNAEs carregada sob demanda (`dynamic import`), seleção de regime (`MEI`, `Simples Nacional`, `Lucro Presumido`, `Lucro Real`), RBT12, receita mensal e folha de pagamento.
- **Motor do Simples Nacional 2026:** Tabelas completas dos **5 Anexos (I a V)** com 6 faixas, fórmula oficial da alíquota efetiva, repartição por tributo, alerta de sublimite estadual/municipal (R$ 3,6M) e regras do **MEI 2026**.
- **Fator R & Anexo IV:** Barra visual interativa do gatilho de 28% do Fator R (migração Anexo V → Anexo III), detecção automática de CNAEs do Anexo IV com **CPP Patronal (20%)** separada do DAS e cálculo opcional de **INSS sobre Pró-labore (11%)** com teto 2026.
- **Comparador de Regimes Lado a Lado:** Gráfico comparativo entre MEI, Simples Nacional, Lucro Presumido e Lucro Real, destacando a economia anual estimada.
- **Memória de Cálculo Auditável:** Passo a passo transparente das fórmulas aplicadas.

### Simulador Autônomo (PF vs. PJ)
- Compara a tributação de **Pessoa Física** (IRPF 2026 + INSS 20% + ISS + impacto do IVA Dual) contra **MEI** e **Simples Nacional**, respondendo na prática se vale a pena abrir empresa.

### Reforma Tributária (LC 214/2025)
- **Simulador de Split Payment:** Estimativa de retenção automática de CBS + IBS na liquidação financeira e impacto no caixa líquido (com contextualização de 2026 e início em 2027).
- **Simples Híbrido (2027+):** Comparativo entre permanecer integralmente no DAS ou recolher IBS/CBS por fora (regime regular) aproveitando créditos sobre insumos.
- **Projeção da Transição (2026–2033):** Gráfico SVG nativo e tabela ano a ano da evolução da carga tributária em todos os regimes.
- **Crédito Tributário B2B:** Mostra quanto crédito de IBS/CBS um cliente PJ consegue aproveitar comprando do Simples Regular vs. Simples Híbrido.
- **Integração Opcional com a API RTC (Receita Federal):** Validação client-side contra o endpoint público da Calculadora RTC com fallback automático para o motor local em JSON.

### Relatórios, Compartilhamento & Educação
- **Relatório em PDF Vetorial:** Laudo tributário estimativo formatado para impressão (`window.print()` + `@media print`, sem dependências pesadas).
- **Card Compartilhável em PNG:** Geração nativa via Canvas em formatos **Stories (1080×1920)** e **Feed (1080×1080)** com o resumo da carga tributária e economia anual.
- **Biblioteca Educacional & Glossário Visual:** Artigos curtos, tooltips editoriais e explicações visuais sobre CNAE, Fator R, Split Payment e Reforma Tributária.
- **Páginas Institucionais & LGPD:** Páginas de Sobre (`/sobre`), Privacidade (`/privacidade`), Termos (`/termos`) e banner de consentimento de cookies.

---

## Stack Tecnológica

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router + Static Export)
- **UI & Linguagem:** [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Tipografia:** Fraunces, Inter e JetBrains Mono (`next/font/google`)

---

## Estrutura do Projeto

```text
.
├── public/                     # Arquivos estáticos (robots.txt, ads.txt)
├── scripts/
│   └── verify-tax.mjs          # Script de validação das fórmulas tributárias
├── src/
│   ├── app/                    # Rotas Next.js (/, /sobre, /privacidade, /termos)
│   ├── components/             # Wizard, comparador, Reforma Tributária, PDF, Share Card e educação
│   ├── data/
│   │   ├── cnaes.json          # Base de CNAEs e anexos do Simples
│   │   ├── simples-2026.json   # Tabelas dos Anexos I–V, MEI e parâmetros 2026
│   │   └── reforma-2027-2033.json # Cronograma e alíquotas da transição LC 214/2025
│   ├── lib/
│   │   ├── tax/
│   │   │   ├── simples.ts      # Motor do Simples Nacional, MEI e Fator R
│   │   │   ├── comparator.ts   # Lucro Presumido, Lucro Real e PF vs. PJ
│   │   │   └── reforma.ts      # Split Payment, Simples Híbrido e transição 2026–2033
│   │   ├── data-loader.ts      # Carregamento dinâmico dos datasets
│   │   ├── format.ts           # Formatação de moeda e percentuais (pt-BR)
│   │   └── rtc-api.ts          # Conector opcional para a API RTC da Receita Federal
│   └── types/
│       └── tax.ts              # Tipagens TypeScript do domínio tributário
└── next.config.ts              # Configuração de exportação estática (output: "export")
```

---

## Como Rodar Localmente

### Pré-requisitos
- **Node.js 20+** (recomendado LTS)
- **npm**

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/calculadoraImpostos.git
cd calculadoraImpostos

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o ambiente de desenvolvimento com Turbopack |
| `npm run test:tax` | Executa `scripts/verify-tax.mjs` para validar as fórmulas de 2026 e LC 214/2025 |
| `npm run build` | Gera o build estático puro na pasta `out/` |
| `npm run lint` | Executa a verificação de lint do Next.js |

---

## Variáveis de Ambiente (Opcional)

Nenhuma variável de ambiente ou banco de dados é obrigatório para rodar ou publicar o projeto.

| Variável | Obrigatória | Descrição |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Não | ID do publisher do Google AdSense (ex.: `ca-pub-...`), caso deseje exibir anúncios nos slots configurados |

---

## Build e Deploy (VPS / Servidor Estático)

O projeto gera um site **100% estático** na pasta `out/` (`output: "export"`):

```bash
npm install
npm run build
```

Basta publicar o conteúdo da pasta `out/` no seu servidor web (**Nginx**, **Caddy**, **Apache** ou qualquer hospedagem estática) apontando o `root` para o diretório gerado. Nenhum processo Node.js precisa ficar rodando em produção.

---

## Aviso Legal

Os cálculos apresentados pelo **QuantoPago** têm caráter **estimativo e educacional**, baseados nas tabelas vigentes de 2026 e nas regras promulgadas da **Lei Complementar nº 214/2025**. Eles não substituem a análise, o planejamento tributário ou a escrituração realizados por um(a) contador(a) habilitado(a) (CRC).
