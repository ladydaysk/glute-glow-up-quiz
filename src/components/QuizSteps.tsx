import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/fbq";
import ba1 from "@/assets/transform/before-after-1.webp";
import ba2 from "@/assets/transform/before-after-2.webp";
import ba3 from "@/assets/transform/before-after-3.webp";
import ba4 from "@/assets/transform/before-after-4.webp";

const transformImages = [ba1, ba2, ba3, ba4];

/**
 * Tira os emojis do texto antes de mandar pro Meta. As opcoes do quiz comecam
 * com emoji ("⚡ O mais rapido possivel") e ele chega no Events Manager como
 * caractere quebrado, sujando o relatorio. O botao continua exibindo o emoji.
 */
function semEmoji(texto: string) {
  return texto.replace(/[\p{Extended_Pictographic}️‍]/gu, "").trim();
}

export function TransformView({ onNext }: { onNext: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % transformImages.length), 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="animate-slide-up flex flex-col">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-foreground leading-snug">
        Mais de <span className="text-primary">500 mulheres</span> já transformaram o corpo com o{" "}
        <br className="sm:hidden" />
        Método da <span className="text-primary">LadyDay</span>
      </h2>

      <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-[var(--shadow-card)] bg-card mb-3">
        {transformImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Transformação ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2 mb-5">
        {transformImages.map((_, i) => (
          <button
            key={i}
            id={`btn-transform-dot-${i}`}
            data-track={`transform_dot_${i}`}
            onClick={() => setIdx(i)}
            aria-label={`Imagem ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === idx ? "w-8 bg-primary" : "w-2 bg-nude"
            }`}
          />
        ))}
      </div>

      <p className="text-center text-2xl font-bold text-foreground mb-5">
        Quando será <span className="text-primary">você? ❤️</span>
      </p>

      <button
        id="btn-transform-continue"
        data-track="transform_continue"
        onClick={onNext}
        className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        style={{ background: "var(--gradient-primary)" }}
      >
        CONTINUAR →
      </button>
    </div>
  );
}

export function QuestionView({
  data,
  onSelect,
  current,
  total,
  showNote,
}: {
  data: { q: string; options: string[]; note?: string };
  onSelect: (opt: string) => void;
  current: number;
  total: number;
  showNote: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  // `picked` so vale depois do re-render; cliques no mesmo instante ainda leriam
  // null e mandariam o evento de novo. O ref muda na hora e corta isso.
  const answered = useRef(false);
  return (
    <div className="animate-slide-up">
      <p className="text-sm text-primary font-semibold mb-2">
        Pergunta {current} de {total}
      </p>
      <h2 className="text-2xl font-bold mb-6 text-foreground leading-snug">{data.q}</h2>

      <div className="space-y-3">
        {data.options.map((opt, i) => {
          const active = picked === opt;
          return (
            <button
              key={opt}
              id={`btn-quiz-q${current}-option-${i}`}
              data-track={`quiz_answer_q${current}`}
              disabled={picked !== null}
              onClick={() => {
                // Perguntas com "note" ficam 3s na tela depois do clique; sem essa
                // trava o usuario clica de novo e o evento sai duplicado.
                if (answered.current) return;
                answered.current = true;
                setPicked(opt);
                // Um evento por pergunta (AnswerQuestionQ1, Q2...) para o funil
                // aparecer inteiro na Visao geral do Events Manager, sem drill-down.
                // No GTM um unico acionador com regex `AnswerQuestionQ.*` cobre todos,
                // e a tag usa a variavel {{Event}} como nome do evento.
                // A resposta vai em content_category, nao em `value`: no Meta
                // `value` e valor monetario e alimenta otimizacao/ROAS.
                track(`AnswerQuestionQ${current}`, {
                  content_name: `Q${current}`,
                  content_category: semEmoji(opt),
                });
                setTimeout(() => onSelect(opt), 250);
              }}
              className={`w-full text-left p-5 rounded-2xl bg-card border-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-default ${
                active
                  ? "border-primary shadow-[var(--shadow-soft)]"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <span className="text-base font-medium text-foreground">{opt}</span>
            </button>
          );
        })}
      </div>

      {showNote && data.note && (
        <div className="mt-6 p-5 rounded-2xl bg-rose/40 border border-primary/20 animate-pop-in">
          <p className="text-sm text-foreground">💗 {data.note}</p>
        </div>
      )}
    </div>
  );
}

export function NameView({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [v, setV] = useState("");
  const submitted = useRef(false);
  return (
    <div className="animate-slide-up flex flex-col pt-4">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Antes de mostrar seu resultado…</h2>
      <p className="text-muted-foreground mb-6">Como podemos te chamar?</p>

      <input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Digite seu nome"
        className="w-full p-5 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none text-lg mb-4 transition-colors"
      />

      <button
        id="btn-name-submit"
        data-track="quiz_name_submit"
        disabled={!v.trim()}
        onClick={() => {
          if (submitted.current) return;
          submitted.current = true;
          onSubmit(v.trim().split(" ")[0]);
        }}
        className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--gradient-primary)" }}
      >
        VER MEU RESULTADO →
      </button>
    </div>
  );
}

export function ResultView({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="animate-fade-in pt-2">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">💥</div>
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
          Seu resultado
        </span>
      </div>

      <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] mb-6">
        <h2 className="text-2xl font-bold text-foreground leading-snug mb-4">
          {name}, seu resultado mostrou que o seu problema{" "}
          <span className="text-primary">NÃO é genética</span> — e sim a falta de um método
          específico.
        </h2>

        <p className="text-muted-foreground mb-4">A maioria das mulheres com o seu perfil:</p>
        <ul className="space-y-3 mb-4">
          {[
            "Não ativa o glúteo corretamente",
            "Treina sem progressão",
            "Não vê resultado mesmo se esforçando",
            "Personais tradicionais não te entendem",
            "Todo treino é voltado pra quem quer emagrecer; ninguém ensina ganho de volume pra magrinhas",
          ].map((t) => (
            <li key={t} className="flex gap-3 items-start">
              <span className="text-destructive font-bold">❌</span>
              <span className="text-foreground">{t}</span>
            </li>
          ))}
        </ul>

        <div className="p-4 rounded-2xl bg-rose/40 border border-primary/20">
          <p className="text-foreground font-medium">
            💗 A boa notícia: com o método certo, é totalmente possível ver mudanças reais em poucas
            semanas.
          </p>
        </div>
      </div>

      <button
        id="btn-result-continue"
        data-track="result_continue"
        onClick={onNext}
        className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        style={{ background: "var(--gradient-primary)" }}
      >
        CONTINUAR →
      </button>
    </div>
  );
}

export function SocialView({
  t,
  counter,
  onNext,
}: {
  t: { name: string; text: string };
  counter: number;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in pt-2">
      <h2 className="text-2xl font-bold text-center mb-2">Veja quem já transformou o corpo</h2>
      <p className="text-center text-muted-foreground mb-6">
        Mais de <span className="text-primary font-bold">{counter} mulheres</span> já transformaram
        seus corpos com esse método.
      </p>

      <div
        key={t.name}
        className="bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] mb-4 animate-pop-in"
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            {t.name[0]}
          </div>
          <div>
            <p className="font-semibold text-foreground">{t.name}</p>
            <p className="text-xs text-muted-foreground">⭐⭐⭐⭐⭐ Aluna verificada</p>
          </div>
        </div>
        <p className="text-foreground">{t.text}</p>
      </div>

      <button
        id="btn-social-continue"
        data-track="social_continue"
        onClick={onNext}
        className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        style={{ background: "var(--gradient-primary)" }}
      >
        VER COMO FUNCIONA →
      </button>
    </div>
  );
}

const CHECKOUT_URL = "https://pay.kiwify.com.br/gM257BR";

/** Oferta principal. Os itens somam R$ 197 — o mesmo "valor antigo" do checkout. */
const METODO = [
  {
    emoji: "🏋️",
    titulo: "Treino na Academia",
    texto:
      "Do iniciante ao avançado, com progressão de carga semana a semana. Você entra e já tem seu Plano de Ação do Dia 1.",
    valor: "R$ 97",
  },
  {
    emoji: "🍽️",
    titulo: "Alimentação para ganho de massa",
    texto:
      "Cardápio, planilha de alimentação e planner de dieta — o combustível calibrado pra crescer.",
    valor: "R$ 47",
  },
  {
    emoji: "🍑",
    titulo: "Ativação de Glúteo",
    texto: "O que faz o glúteo realmente trabalhar. Sem isso a perna cresce no lugar do bumbum.",
    valor: "R$ 27",
  },
  {
    emoji: "📋",
    titulo: "Planilha de treino",
    texto: "Onde você registra carga e evolução — o que transforma treino em resultado.",
    valor: "R$ 17",
  },
  {
    emoji: "🤸",
    titulo: "Mobilidade e aquecimento",
    texto: "Prepara o corpo, previne lesão e melhora cada execução.",
    valor: "R$ 9",
  },
];

/** Bonus — somam R$ 155, quase 3x o preco de hoje. */
const BONUS = [
  {
    emoji: "🔥",
    titulo: "Projeto Tanajura",
    texto: "O treino gravado focado em volume de glúteo — o queridinho das alunas.",
    valor: "R$ 57",
    destaque: true,
  },
  {
    emoji: "🏠",
    titulo: "Treino em casa",
    texto: "Todos os níveis com só uma mini band.",
    valor: "R$ 37",
  },
  {
    emoji: "🥗",
    titulo: "+500 receitas fit e Seca Barriga",
    texto: "Pra manter constância e reduzir inchaço.",
    valor: "R$ 27",
  },
  {
    emoji: "🧠",
    titulo: "Planilha Mentalidade",
    texto: "A disciplina que faz você não parar na segunda semana.",
    valor: "R$ 17",
  },
  {
    emoji: "💬",
    titulo: "Grupo VIP no WhatsApp",
    texto: "Suporte direto e dicas diárias. Vagas limitadas.",
    valor: "R$ 17",
  },
];

const VALOR_METODO = "R$ 197";
const VALOR_BONUS = "R$ 155";
/** R$ 352 (197 + 155) menos os R$ 57,90 de hoje. */
const ECONOMIA = "R$ 294";
const DESCONTO = "84%";

export function OfferView({ name: _name }: { name: string }) {
  const [opened, setOpened] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  // O checkout abre em outra aba e esta pagina continua viva: sem essa trava
  // cada clique repetido no botao mandaria outro InitiateCheckout.
  const checkoutTracked = useRef(false);
  const offerTracked = useRef(false);

  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(() => {
      // "start" e nao "center": o bloco de oferta e longo, centralizar cortaria o topo.
      ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, [opened]);

  return (
    <div className="animate-fade-in pt-6 flex flex-col items-center text-center">
      <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
        SEU PLANO ESTÁ PRONTO
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-8">
        Veja agora o método feito para o <span className="text-primary">seu perfil</span>
      </h2>

      {!opened ? (
        <button
          id="btn-ver-plano"
          data-track="ver_plano"
          onClick={() => {
            if (offerTracked.current) return;
            offerTracked.current = true;
            track("ViewContent", { content_name: "Oferta" });
            setOpened(true);
          }}
          className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform ring-2 ring-primary/30"
          style={{ background: "var(--gradient-primary)" }}
        >
          VER MEU PLANO PERSONALIZADO →
        </button>
      ) : (
        <div ref={ctaRef} className="w-full animate-pop-in">
          {/* Por que funciona */}
          <div className="rounded-2xl bg-rose/40 border border-primary/20 p-5 mb-6 text-left">
            <p className="text-lg font-bold text-foreground mb-2">Você nunca foi o problema.</p>
            <p className="text-foreground leading-relaxed">
              Tudo que te ensinaram foi feito pra <span className="font-bold">secar</span>. E secar
              é o oposto de <span className="text-primary font-bold">crescer</span> — por isso você
              se esforçava e o espelho não mudava.
            </p>
          </div>

          {/* OFERTA PRINCIPAL — anel grosso separa do resto da tela */}
          <div className="rounded-3xl overflow-hidden mb-[18px] text-left shadow-[var(--shadow-soft)] ring-[3px] ring-[oklch(0.6_0.25_12/0.6)]">
            <div className="px-5 py-[22px] text-white" style={{ background: "var(--gradient-cta)" }}>
              <span className="inline-block text-[10px] uppercase tracking-[0.16em] font-bold rounded-full px-[11px] py-[5px] mb-3 bg-white/25">
                ⭐ Método completo
              </span>
              <h3 className="text-[28px] font-extrabold leading-[1.1] tracking-tight">
                Método LadyDaysk
              </h3>
              <p className="text-sm opacity-95 mt-1.5">
                Treino completo, alimentação e glúteo — o sistema inteiro.
              </p>
              <div className="flex items-baseline justify-between mt-4 pt-3.5 border-t border-white/30">
                <span className="text-[13px] opacity-90">valor do método</span>
                <span className="text-[22px] font-extrabold line-through">{VALOR_METODO}</span>
              </div>
            </div>

            <div className="bg-card px-5 pt-1.5 pb-5">
              <div className="flex items-center gap-2 pt-4 pb-1 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                <span>{METODO.length} entregáveis</span>
                <span className="flex-1 h-px bg-border" />
              </div>

              <ul>
                {METODO.map((item) => (
                  <li
                    key={item.titulo}
                    className="flex gap-3 py-[15px] border-b border-border last:border-b-0"
                  >
                    <span className="shrink-0 h-[30px] w-[30px] rounded-[10px] grid place-items-center text-[15px] bg-rose/55">
                      {item.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2.5 items-baseline justify-between">
                        <p className="font-bold text-[15px] text-foreground leading-snug">
                          {item.titulo}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground line-through tabular-nums">
                          {item.valor}
                        </span>
                      </div>
                      <p className="text-[13.5px] text-muted-foreground leading-snug mt-0.5">
                        {item.texto}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BONUS — fundo rosa e borda tracejada pra destacar do resto */}
          <div
            className="rounded-3xl p-5 mb-[18px] text-left border-2 border-dashed border-primary/45"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--rose) 45%, transparent), color-mix(in oklab, var(--nude) 60%, transparent))",
            }}
          >
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-primary">
                🎁 Bônus
              </p>
              <p className="text-[19px] font-extrabold text-foreground mt-1.5">
                + {BONUS.length} bônus liberados
              </p>
              <span className="inline-block mt-2.5 mb-4 bg-primary text-white text-[11.5px] font-extrabold uppercase tracking-[0.06em] px-3.5 py-[7px] rounded-full">
                ⏳ Só para quem entrar hoje
              </span>
            </div>

            <ul className="space-y-[9px]">
              {BONUS.map((item) => (
                <li
                  key={item.titulo}
                  className={`bg-card rounded-2xl px-3.5 py-3 flex gap-[11px] ${
                    item.destaque ? "border-2 border-primary shadow-[var(--shadow-soft)]" : ""
                  }`}
                >
                  <span className="shrink-0 h-[30px] w-[30px] rounded-[10px] grid place-items-center text-[15px] bg-rose/55">
                    {item.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    {item.destaque && (
                      <span
                        className="inline-block text-[10px] uppercase tracking-[0.14em] font-extrabold text-white rounded-full px-2.5 py-1 mb-[7px]"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        ⭐ Destaque
                      </span>
                    )}
                    <div className="flex gap-2.5 items-baseline justify-between">
                      <p className="font-bold text-[15px] text-foreground leading-snug">
                        {item.titulo}
                      </p>
                      <span className="shrink-0 text-[10.5px] font-extrabold tracking-[0.08em] text-primary">
                        GRÁTIS
                      </span>
                    </div>
                    <p className="text-[13.5px] text-muted-foreground leading-snug mt-0.5">
                      {item.texto}{" "}
                      <span className="line-through tabular-nums">{item.valor}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-[15px] bg-card rounded-2xl p-3.5 text-center">
              <p className="text-sm text-foreground">
                Só em bônus você leva{" "}
                <span className="text-primary text-xl font-extrabold">{VALOR_BONUS}</span>
              </p>
            </div>
          </div>

          {/* ECONOMIA */}
          <div
            className="rounded-3xl px-5 py-6 mb-4 text-white text-center ring-[3px] ring-[oklch(0.6_0.25_12/0.6)] shadow-[var(--shadow-soft)]"
            style={{ background: "var(--gradient-cta)" }}
          >
            <div className="flex justify-between text-sm py-[5px]">
              <span>Método</span>
              <s className="opacity-85 tabular-nums">{VALOR_METODO}</s>
            </div>
            <div className="flex justify-between text-sm py-[5px]">
              <span>Bônus de hoje</span>
              <s className="opacity-85 tabular-nums">{VALOR_BONUS}</s>
            </div>
            <div className="h-px bg-white/35 mt-3 mb-4" />
            <p className="text-[13px] uppercase tracking-[0.2em] font-extrabold">Você economiza</p>
            <p className="text-[52px] font-extrabold leading-[1] tracking-tight mt-1.5 tabular-nums">
              {ECONOMIA}
            </p>
            <span className="inline-block bg-white text-[13px] font-extrabold px-4 py-2 rounded-full mt-3.5 tracking-[0.04em] text-[oklch(0.52_0.26_18)]">
              🔥 {DESCONTO} de desconto hoje
            </span>
          </div>

          {/* Preco */}
          <div className="rounded-3xl bg-card border-2 border-primary p-5 mb-3.5 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
              Seu acesso hoje
            </p>
            <p className="text-[38px] font-extrabold leading-[1.05] tracking-tight mt-2 text-foreground">
              7x <span className="text-xl">de</span> R$ 9,47
            </p>
            <p className="text-[13.5px] text-muted-foreground mt-2">
              ou R$ 57,90 à vista · acesso vitalício
            </p>
          </div>

          <a
            id="btn-checkout"
            data-track="initiate_checkout"
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (checkoutTracked.current) return;
              checkoutTracked.current = true;
              // Valor a vista do produto. Precisa bater com o checkout da Kiwify:
              // e ele que alimenta ROAS e otimizacao por valor no Meta.
              track("InitiateCheckout", {
                content_name: "Oferta CTA",
                currency: "BRL",
                value: 57.9,
              });
            }}
            className="block w-full py-6 px-4 rounded-2xl text-white font-extrabold text-xl text-center leading-tight animate-cta-pulse hover:scale-[1.03] active:scale-[0.98] transition-transform"
            style={{
              background: "var(--gradient-cta)",
              // Base do anel: os keyframes so pintam box-shadow enquanto a
              // animacao roda. Animacao tem prioridade sobre style inline,
              // entao ela sobrescreve isto quando esta ativa.
              boxShadow:
                "0 0 0 4px oklch(0.6 0.25 12 / 0.32), 0 10px 30px -12px oklch(0.6 0.25 12 / 0.5)",
            }}
          >
            QUERO MEU BUMBUM MAIOR AGORA →
          </a>

          {/* Acesso — tira a duvida de "quando recebo" e "onde assisto" */}
          <div className="mt-4 rounded-2xl bg-card border border-border p-4">
            <div className="flex gap-3 items-start">
              <span className="shrink-0 text-lg leading-6">⚡</span>
              <p className="text-sm text-foreground leading-snug">
                <span className="font-bold">Acesso imediato após a compra.</span> Você recebe o
                login na hora, direto no seu e-mail.
              </p>
            </div>
            <div className="flex gap-3 items-start mt-3 pt-3 border-t border-border">
              <span className="shrink-0 text-lg leading-6">📱</span>
              <p className="text-sm text-foreground leading-snug">
                <span className="font-bold">Assista de onde quiser:</span> celular, computador ou
                tablet — quantas vezes precisar.
              </p>
            </div>
          </div>

          {/* Garantia */}
          <div className="mt-5 rounded-2xl border border-primary/20 bg-card p-5 text-left">
            <p className="font-semibold text-foreground mb-1">
              🔒 Garantia incondicional de 14 dias
            </p>
            <p className="text-sm text-muted-foreground leading-snug">
              Se achar que o método não é pra você, é só pedir o reembolso — sem precisar explicar
              nada. 100% do seu dinheiro de volta.
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            💖 +500 mulheres já transformaram o corpo com esse método
          </p>
        </div>
      )}
    </div>
  );
}
