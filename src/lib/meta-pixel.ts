// Helpers to fire Meta Pixel events with deduplication via Conversions API.

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
    __metaPixelInitialized?: boolean;
  }
}

const META_PIXEL_ID = "2495276150874187";

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

function ensureMetaPixelLoaded() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (!window.fbq) {
    const fbq = function (...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue.push(args);
      }
    } as any;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }

  if (!window.__metaPixelInitialized) {
    window.fbq("init", META_PIXEL_ID);
    window.__metaPixelInitialized = true;
  }
}

export function trackMetaEvent(
  eventName: "PageView" | "ViewContent",
  customData: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  const eventId = uuid();
  const fbp = getOrCreateFbp();

  // 1) Browser pixel
  try {
    ensureMetaPixelLoaded();
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
        fbp,
        fbc: getCookie("_fbc"),
        custom_data: customData,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}
