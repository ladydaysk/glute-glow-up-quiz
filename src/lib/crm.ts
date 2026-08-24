/**
 * Manda o lead pro CRM atraves de /api/lead (a chave fica no servidor).
 *
 * Nunca lanca e nunca segura o funil: se o CRM cair, a pessoa continua
 * vendo o resultado do quiz normalmente.
 */
export function enviarLead(name: string, phone: string) {
  if (typeof window === "undefined") return;

  const digitos = phone.replace(/\D/g, "");
  // 10 ou 11 digitos = DDD + numero; 12 ou 13 = ja veio com o 55.
  if (!name.trim() || digitos.length < 10 || digitos.length > 13) return;

  try {
    void fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: digitos }),
      // a pessoa avanca de tela na mesma hora; keepalive evita que o
      // navegador cancele a requisicao no meio.
      keepalive: true,
    }).catch(() => {
      // noop
    });
  } catch {
    // noop
  }
}

/** Mascara visual: (11) 99999-9999. So formata, nao valida. */
export function formatarTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
