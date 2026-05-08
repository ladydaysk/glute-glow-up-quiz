import { createFileRoute } from "@tanstack/react-router";

const PIXEL_ID = "2495276150874187";
const GRAPH_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

async function sha256(input: string) {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/meta-capi")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.META_CAPI_ACCESS_TOKEN;
        if (!token) return json({ error: "missing_token" }, 500);

        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "invalid_json" }, 400);
        }

        const { event_name, event_id, event_source_url, fbp, fbc, email, custom_data } = body || {};
        if (!event_name || !event_id) {
          return json({ error: "missing_event_name_or_event_id" }, 400);
        }

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          undefined;
        const userAgent = request.headers.get("user-agent") || undefined;

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
              event_id,
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
          const result = await res.json().catch(() => ({}));
          return json(result, res.status);
        } catch (error: any) {
          return json({ error: error?.message || "fetch_failed" }, 500);
        }
      },
    },
  },
});