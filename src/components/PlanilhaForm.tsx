import { useRef, useState } from "react";
import { track } from "@/lib/fbq";
import { formatarTelefone } from "@/lib/crm";
import { avisarWhatsApp } from "@/lib/whatsapp";
import {
  instagramInvalido,
  nomeInvalido,
  normalizarInstagram,
  telefoneInvalido,
} from "@/lib/validacao";

/**
 * A planilha e servida pelo proprio site (public/downloads), nao pelo Drive:
 * sem link que expira, sem depender de permissao de compartilhamento.
 * `downloads/` esta fora da rewrite do vercel.json — se sair de la, o arquivo
 * passa a devolver o HTML do site em vez do PDF.
 */
const LINK_PLANILHA = "/downloads/planilha-de-treino-ladydaysk.pdf";
// Upsell na tela de "pronto": landing do metodo. utm pra separar no Meta/GTM.
const LINK_METODO = "https://www.ladydaysk.online/?utm_source=planilha&utm_medium=upsell";

type Erros = { nome?: string; telefone?: string; instagram?: string };

export default function PlanilhaForm() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const enviado = useRef(false);

  function validar(): Erros {
    const e: Erros = {};
    if (nomeInvalido(nome)) e.nome = "Preencha seu nome e sobrenome de verdade.";
    if (telefoneInvalido(telefone.replace(/\D/g, "")))
      e.telefone = "Preencha um WhatsApp válido com DDD.";
    if (instagramInvalido(instagram)) e.instagram = "Preencha seu @ do Instagram.";
    return e;
  }

  async function enviar() {
    if (enviado.current || enviando) return;

    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    enviado.current = true;
    setEnviando(true);

    // De proposito NAO abre o PDF sozinho: no navegador interno do Instagram
    // (de onde vem o trafego) nao existe "outra aba" nem download em segundo
    // plano — abrir automatico joga a pessoa pro PDF antes de ela ver a
    // oferta. A tela seguinte entrega os dois botoes e ela escolhe.
    track("Lead", { content_name: "Planilha Gratuita" });

    if (!hp) {
      avisarWhatsApp({
        name: nome,
        phone: telefone,
        instagram: normalizarInstagram(instagram),
        origem: "Planilha Gratuita",
      });
    }

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: nome.trim(),
          phone: telefone.replace(/\D/g, ""),
          instagram: normalizarInstagram(instagram),
          origem: "Planilha Gratuita",
          _hp: hp,
        }),
      });
    } catch {
      // A pessoa preencheu e merece a planilha. Se o CRM falhar, o lead se
      // perde — segurar a entrega por causa disso seria pior.
    }

    setEnviando(false);
    setPronto(true);
  }

  if (pronto) {
    return (
      <div className="w-full max-w-md mx-auto animate-pop-in text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-3xl font-bold text-foreground leading-tight mb-2">
          Prontinho, {nome.trim().split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground leading-snug mb-5">
          Sua planilha de treinos está liberada:
        </p>
        <a
          id="btn-baixar-planilha"
          data-track="baixar_planilha"
          href={LINK_PLANILHA}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("ViewContent", { content_name: "Planilha Baixada" })}
          className="block w-full py-5 px-4 rounded-2xl text-white font-extrabold text-lg text-center leading-tight hover:scale-[1.02] active:scale-[0.98] transition-transform"
          style={{ background: "var(--gradient-cta)", boxShadow: "var(--shadow-soft)" }}
        >
          📄 BAIXAR MINHA PLANILHA
        </a>

        {/* Upsell: agora e o destaque da tela, porque a planilha ja foi
            entregue sem a pessoa precisar clicar em nada. */}
        <div
          className="mt-8 rounded-3xl p-6 text-left text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.55 0.26 12) 0%, oklch(0.62 0.24 350) 100%)",
            boxShadow: "0 20px 50px -20px oklch(0.55 0.26 12 / 0.7)",
          }}
        >
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] font-bold bg-white/20 rounded-full px-3 py-1">
            A planilha é só o começo
          </span>
          <h2 className="text-2xl font-extrabold leading-tight mt-3 mb-2">
            Magra e não consegue crescer o glúteo?
          </h2>
          <p className="text-white/90 leading-snug mb-5">
            A planilha te dá o treino. O <strong>Método Ladydaysk</strong> te dá o plano
            completo… treino, alimentação, constância e tudo que você precisa para ter
            resultados de verdade e parar de desistir no meio do caminho 💪🍑
          </p>
          <a
            id="btn-upsell-metodo"
            data-track="upsell_metodo"
            href={LINK_METODO}
            onClick={() => track("UpsellMetodoClick", { content_name: "Planilha → Método" })}
            className="block w-full py-5 px-4 rounded-2xl bg-white text-primary font-extrabold text-lg text-center leading-tight animate-cta-pulse hover:scale-[1.03] active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 0 0 4px rgba(255,255,255,.3), 0 12px 30px -10px rgba(0,0,0,.4)" }}
          >
            QUERO O PLANO COMPLETO PRA CRESCER →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
          Presente pra você
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mt-3 mb-3 text-foreground">
          Resgate a minha planilha de treinos{" "}
          <span className="text-primary whitespace-nowrap">de GRAÇA</span>
        </h1>
        <p className="text-muted-foreground leading-snug">
          Esse é um presente meu pra você que me acompanha 💗
        </p>
      </div>

      <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-card)]">
        <label htmlFor="campo-nome" className="block font-semibold text-foreground mb-2">
          Nome completo
        </label>
        <input
          id="campo-nome"
          value={nome}
          onChange={(ev) => setNome(ev.target.value)}
          placeholder="Seu nome e sobrenome"
          autoComplete="name"
          className="w-full p-4 rounded-2xl bg-background border-2 border-border focus:border-primary outline-none text-lg transition-colors"
        />
        {erros.nome && <p className="text-sm text-destructive mt-2">{erros.nome}</p>}

        <label htmlFor="campo-telefone" className="block font-semibold text-foreground mt-5 mb-2">
          WhatsApp
        </label>
        <input
          id="campo-telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={telefone}
          onChange={(ev) => setTelefone(formatarTelefone(ev.target.value))}
          placeholder="(11) 99999-9999"
          className="w-full p-4 rounded-2xl bg-background border-2 border-border focus:border-primary outline-none text-lg transition-colors"
        />
        {erros.telefone && <p className="text-sm text-destructive mt-2">{erros.telefone}</p>}

        <label htmlFor="campo-instagram" className="block font-semibold text-foreground mt-5 mb-2">
          Instagram
        </label>
        <input
          id="campo-instagram"
          value={instagram}
          onChange={(ev) => setInstagram(ev.target.value)}
          placeholder="@seuusuario"
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full p-4 rounded-2xl bg-background border-2 border-border focus:border-primary outline-none text-lg transition-colors"
        />
        {erros.instagram && <p className="text-sm text-destructive mt-2">{erros.instagram}</p>}

        {/* Honeypot: invisivel pra pessoa, irresistivel pra robo. */}
        <input
          type="text"
          name="empresa"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={hp}
          onChange={(ev) => setHp(ev.target.value)}
          className="absolute left-[-9999px] w-px h-px opacity-0"
        />

        <button
          id="btn-resgatar-planilha"
          data-track="resgatar_planilha"
          onClick={enviar}
          disabled={enviando}
          className="w-full mt-7 py-5 rounded-2xl text-white font-extrabold text-lg text-center shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-cta)" }}
        >
          {enviando ? "LIBERANDO…" : "RESGATAR MINHA PLANILHA →"}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4 leading-snug">
          Seus dados são usados só para te enviar a planilha e novidades do método. Nada de spam.
        </p>
      </div>
    </div>
  );
}
