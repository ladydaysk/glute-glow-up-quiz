declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Todo parametro que algum evento pode mandar. Ver TRACKED_KEYS abaixo. */
type TrackParams = {
  content_name?: string;
  content_category?: string;
  currency?: string;
  value?: number;
};

/**
 * O dataLayer do GTM e um modelo PERSISTENTE: ele funde cada push no estado
 * anterior em vez de substituir. Sem limpar antes, um parametro de um evento
 * vaza para o proximo — o Lead saia carregando o `content_category` da ultima
 * pergunta respondida. Por isso zeramos todas as chaves antes de cada push.
 */
const TRACKED_KEYS = ["content_name", "content_category", "currency", "value"] as const;

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
export function track(event: string, params?: TrackParams) {
  if (typeof window === "undefined") return;
  const fbParams = params ?? {};
  try {
    window.dataLayer = window.dataLayer || [];

    // 1) Limpa o estado anterior. Sem a chave `event`, este push nao dispara tag.
    const reset: Record<string, undefined> = { fbParams: undefined };
    for (const key of TRACKED_KEYS) reset[key] = undefined;
    window.dataLayer.push(reset);

    // 2) Manda o evento ja com os parametros limpos.
    window.dataLayer.push({ event, ...fbParams, fbParams });
  } catch {
    // noop
  }
}
