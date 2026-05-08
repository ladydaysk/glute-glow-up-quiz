// Helpers to fire Meta Pixel events with deduplication via Conversions API.

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function getOrCreateFbp(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const existing = getCookie("_fbp");
  if (existing) return existing;

  const fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 10_000_000_000)}`;
  document.cookie = `_fbp=${encodeURIComponent(fbp)}; path=/; max-age=7776000; samesite=lax`;
  return fbp;
}

export function trackMetaEvent(
  eventName: "PageView" | "ViewContent",
  customData: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  const eventId = uuid();

  // 1) Browser pixel
  try {
    window.fbq?.("track", eventName, customData, { eventID: eventId });
  } catch {
    /* noop */
  }

  // 2) Server (CAPI) – same eventID for dedupe
  try {
    fetch("/api/meta-capi", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        fbp: getOrCreateFbp(),
        fbc: getCookie("_fbc"),
        custom_data: customData,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}
