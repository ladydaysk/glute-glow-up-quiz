declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Envia o evento APENAS para o dataLayer do GTM.
 *
 * O disparo no Meta Pixel e feito pelas tags do GTM
 * (container GTM-NCJBZZ4M), nunca aqui — chamar fbq() direto
 * neste arquivo faria cada evento chegar duplicado no Meta.
 *
 * O PageView continua saindo do script base do Pixel em __root.tsx.
 *
 * Cada push leva os parametros de duas formas:
 *  - soltos na raiz  -> para usar em condicoes/variaveis do GTM
 *  - dentro de fbParams -> para a tag Meta Pixel repassar tudo de uma vez
 *    ("Object Properties" > "Load Properties From Variable" = DL - fbParams)
 */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbParams = params ?? {};
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...fbParams, fbParams });
  } catch {
    // noop
  }
}
