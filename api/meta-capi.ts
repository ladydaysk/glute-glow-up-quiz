// Vercel serverless function – Meta Conversions API
// Receives events from the browser and forwards them with the same event_id
// for deduplication with the Pixel.

const PIXEL_ID = "2495276150874187";
const GRAPH_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

async function sha256(input: string) {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "missing_token" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const {
    event_name,
    event_id,
    event_source_url,
    fbp,
    fbc,
    email,
    custom_data,
  } = body || {};

  if (!event_name || !event_id) {
    return new Response("Missing event_name or event_id", { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  const user_data: Record<string, unknown> = {};
  if (ip) user_data.client_ip_address = ip;
  if (userAgent) user_data.client_user_agent = userAgent;
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;
  if (email) user_data.em = [await sha256(String(email))];

  const payload = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id, // dedupe key
        event_source_url,
        action_source: "website",
        user_data,
        custom_data: custom_data || {},
      },
    ],
  };

  try {
    const res = await fetch(`${GRAPH_URL}?access_token=${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "fetch_failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const config = { runtime: "edge" };
