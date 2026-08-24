const CRM_URL = "https://miezatcdfldmqmxgpkwr.supabase.co/functions/v1/receive-lead";

/**
 * Intermediario entre o quiz e o CRM.
 *
 * O site e estatico: qualquer coisa no bundle e publica. Se a webhook_key
 * fosse no front, qualquer pessoa poderia despejar leads falsos na pipeline.
 * As credenciais ficam como variavel de ambiente aqui na Vercel e nunca
 * chegam ao navegador.
 */

/** Normaliza para o formato que o CRM espera: 55 + DDD + numero. */
function normalizarTelefone(bruto) {
  const d = String(bruto || "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`; // faltou o pais
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d;
  return null; // fora de qualquer formato brasileiro valido
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const tenantId = process.env.CRM_TENANT_ID;
  const webhookKey = process.env.CRM_WEBHOOK_KEY;
  const pipelineId = process.env.CRM_PIPELINE_ID;

  if (!tenantId || !webhookKey || !pipelineId) {
    console.error("[lead] variaveis de ambiente do CRM ausentes");
    res.status(500).json({ error: "not_configured" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const name = String(body?.name || "")
    .trim()
    .slice(0, 120);
  const phone = normalizarTelefone(body?.phone);

  if (!name || !phone) {
    res.status(400).json({ error: "dados_invalidos" });
    return;
  }

  try {
    const resposta = await fetch(CRM_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenantId,
        webhook_key: webhookKey,
        pipeline_id: pipelineId,
        name,
        phone,
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error("[lead] CRM recusou", resposta.status, detalhe.slice(0, 300));
      res.status(502).json({ error: "crm_recusou" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (erro) {
    console.error("[lead] falha ao chamar o CRM", erro);
    res.status(502).json({ error: "crm_indisponivel" });
  }
}
