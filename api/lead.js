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

/**
 * Aviso no WhatsApp da Dayane via CallMeBot. Roda depois que o CRM aceitou o
 * lead e nunca segura a resposta: se o bot cair, o lead ja esta salvo e a
 * pessoa segue o funil normalmente. Timeout curto porque a Vercel encerra a
 * funcao junto com a resposta.
 */
async function avisarWhatsApp({ name, phone, instagram, origem }) {
  const destino = (process.env.CALLMEBOT_PHONE || "").trim();
  const apikey = (process.env.CALLMEBOT_APIKEY || "").trim();
  if (!destino || !apikey) return; // sem configurar, simplesmente nao avisa

  const ddd = phone.slice(2, 4);
  const numero = phone.slice(4);
  const bonito = `(${ddd}) ${numero.slice(0, numero.length - 4)}-${numero.slice(-4)}`;

  const linhas = [
    `🔔 Novo lead — ${origem}`,
    `👤 ${name}`,
    `📱 ${bonito}`,
    ...(instagram ? [`📸 ${instagram}`] : []),
    `💬 wa.me/${phone}`,
  ];

  const url =
    "https://api.callmebot.com/whatsapp.php?phone=" +
    encodeURIComponent(destino) +
    "&apikey=" +
    encodeURIComponent(apikey) +
    "&text=" +
    encodeURIComponent(linhas.join("\n"));

  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) console.error("[lead] callmebot respondeu", r.status);
  } catch (erro) {
    console.error("[lead] callmebot falhou", erro?.message || erro);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  // trim obrigatorio: colar o valor no painel da Vercel costuma levar junto
  // um espaco ou quebra de linha, e o CRM devolve 500 ao comparar um UUID
  // com lixo no fim. Foi exatamente o que aconteceu na primeira configuracao.
  const tenantId = (process.env.CRM_TENANT_ID || "").trim();
  const webhookKey = (process.env.CRM_WEBHOOK_KEY || "").trim();
  const pipelineId = (process.env.CRM_PIPELINE_ID || "").trim();

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

  const instagram = String(body?.instagram || "")
    .trim()
    .slice(0, 100);
  // Identifica de qual formulario o lead veio (quiz, planilha gratuita...).
  const origem = String(body?.origem || "")
    .trim()
    .slice(0, 100);
  // Honeypot: campo escondido que so robo preenche. O CRM finge sucesso e
  // nao grava nada — mesmo comportamento dos formularios da Shark.
  const hp = String(body?._hp || "").trim();

  const customFields = {};
  if (instagram) customFields.instagram = instagram;

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
        _hp: hp,
        ...(origem ? { source_campaign: origem } : {}),
        ...(Object.keys(customFields).length ? { custom_fields: customFields } : {}),
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error("[lead] CRM recusou", resposta.status, detalhe.slice(0, 300));
      // Repassa o motivo do CRM ("webhook_key inválido", "pipeline nao
      // encontrado"...) para dar pra saber qual variavel corrigir. Nao expoe
      // nenhuma credencial, so a mensagem de validacao do proprio CRM.
      res.status(502).json({
        error: "crm_recusou",
        crm_status: resposta.status,
        crm_message: detalhe.slice(0, 200),
      });
      return;
    }

    // Robo pego pelo honeypot: o CRM fingiu sucesso e nao gravou; aqui
    // tambem nao avisa, senao o WhatsApp vira lixeira de spam.
    if (!hp) {
      await avisarWhatsApp({ name, phone, instagram, origem: origem || "Quiz" });
    }

    res.status(200).json({ ok: true });
  } catch (erro) {
    console.error("[lead] falha ao chamar o CRM", erro);
    res.status(502).json({ error: "crm_indisponivel" });
  }
}
