/**
 * Aviso no WhatsApp da Dayane via CallMeBot, disparado direto do navegador —
 * mesmo esquema do funil da Shark. Nao depende de variavel de ambiente na
 * Vercel, que foi o que falhou na primeira tentativa (server-side).
 *
 * A apikey do CallMeBot fica publica no bundle. O pior que alguem faz com ela
 * e mandar mensagem pro WhatsApp da Dayane — nada de CRM, nada de dado.
 * Se virar problema, ela manda "Stop" pro bot e gera outra.
 */
const CALLMEBOT_RECIPIENTS = [{ phone: "556193995513", apikey: "7036108" }];

type Lead = {
  name: string;
  phone: string; // so digitos, com ou sem 55
  instagram?: string;
  origem: string;
};

function formatarBonito(digitos: string) {
  const d = digitos.startsWith("55") && digitos.length >= 12 ? digitos.slice(2) : digitos;
  if (d.length < 10) return digitos;
  const ddd = d.slice(0, 2);
  const num = d.slice(2);
  return `(${ddd}) ${num.slice(0, num.length - 4)}-${num.slice(-4)}`;
}

export function avisarWhatsApp({ name, phone, instagram, origem }: Lead) {
  if (typeof window === "undefined") return;

  const digitos = phone.replace(/\D/g, "");
  const completo = digitos.startsWith("55") && digitos.length >= 12 ? digitos : `55${digitos}`;

  const linhas = [
    `🔔 Novo lead — ${origem}`,
    `👤 ${name.trim()}`,
    `📱 ${formatarBonito(digitos)}`,
    ...(instagram ? [`📸 ${instagram}`] : []),
    `💬 wa.me/${completo}`,
  ];
  const texto = linhas.join("\n");

  for (const r of CALLMEBOT_RECIPIENTS) {
    const url =
      "https://api.callmebot.com/whatsapp.php?phone=" +
      encodeURIComponent(r.phone) +
      "&text=" +
      encodeURIComponent(texto) +
      "&apikey=" +
      encodeURIComponent(r.apikey);
    try {
      // no-cors: o CallMeBot nao manda cabecalho CORS, mas a requisicao chega
      // do mesmo jeito; so nao da pra ler a resposta. keepalive segura o envio
      // quando a pessoa troca de tela logo em seguida.
      void fetch(url, { mode: "no-cors", keepalive: true }).catch(() => {});
    } catch {
      // nunca segura o funil por causa do aviso
    }
  }
}
