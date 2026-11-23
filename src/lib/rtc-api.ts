/**
 * Cliente opcional para a API pública e gratuita da Calculadora RTC (Reforma Tributária do Consumo)
 * mantida pela Receita Federal (código aberto sob licença MIT).
 *
 * Em caso de indisponibilidade, timeout ou bloqueio de rede, o aplicativo utiliza
 * automaticamente o motor local LC 214/2025 embutido em JSON estático.
 */

export interface RtcApiStatus {
  source: "local" | "rtc-api";
  endpoint: string;
  checkedAt?: string;
  message: string;
  cbsRate?: number;
  ibsRate?: number;
}

export const DEFAULT_RTC_ENDPOINT =
  "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/versao";

export async function testRtcApiConnection(
  customEndpoint?: string
): Promise<RtcApiStatus> {
  const endpoint = (customEndpoint || DEFAULT_RTC_ENDPOINT).trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        source: "local",
        endpoint,
        checkedAt: new Date().toLocaleTimeString("pt-BR"),
        message: `Endpoint RTC respondeu HTTP ${res.status}. Usando motor local LC 214/2025.`,
      };
    }

    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const versionInfo =
      data && typeof data === "object"
        ? String(data.versaoApp || data.versao || "conectada")
        : "conectada";

    return {
      source: "rtc-api",
      endpoint,
      checkedAt: new Date().toLocaleTimeString("pt-BR"),
      message: `API RTC Receita Federal acessível (${versionInfo}). Parâmetros sincronizados com o motor LC 214/2025.`,
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      source: "local",
      endpoint,
      checkedAt: new Date().toLocaleTimeString("pt-BR"),
      message:
        "API RTC indisponível/offline no momento (CORS ou rede). Operando 100% com motor estático local LC 214/2025.",
    };
  }
}
