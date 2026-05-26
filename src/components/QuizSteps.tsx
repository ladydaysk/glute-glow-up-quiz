import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/fbq";
import ba1 from "@/assets/transform/before-after-1.webp";
import ba2 from "@/assets/transform/before-after-2.webp";
import ba3 from "@/assets/transform/before-after-3.webp";
import ba4 from "@/assets/transform/before-after-4.webp";

const transformImages = [ba1, ba2, ba3, ba4];

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
  return (
    <div className="animate-slide-up">
      <p className="text-sm text-primary font-semibold mb-2">Pergunta {current} de {total}</p>
      <h2 className="text-2xl font-bold mb-6 text-foreground leading-snug">{data.q}</h2>

      <div className="space-y-3">
        {data.options.map((opt) => {
          const active = picked === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                setPicked(opt);
                setTimeout(() => onSelect(opt), 250);
              }}
              className={`w-full text-left p-5 rounded-2xl bg-card border-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                active ? "border-primary shadow-[var(--shadow-soft)]" : "border-border hover:border-primary/40"
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
        disabled={!v.trim()}
        onClick={() => onSubmit(v.trim().split(" ")[0])}
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
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Seu resultado</span>
      </div>

      <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] mb-6">
        <h2 className="text-2xl font-bold text-foreground leading-snug mb-4">
          {name}, seu resultado mostrou que o seu problema <span className="text-primary">NÃO é genética</span> — e sim a falta de um método específico.
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
            💗 A boa notícia: com o método certo, é totalmente possível ver mudanças reais em poucas semanas.
          </p>
        </div>
      </div>

      <button
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
        Mais de <span className="text-primary font-bold">{counter} mulheres</span> já transformaram seus corpos com esse método.
      </p>

      <div key={t.name} className="bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] mb-4 animate-pop-in">
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

export function OfferView({ name: _name }: { name: string }) {
  const [opened, setOpened] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(() => {
      videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => clearTimeout(t);
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    timerRef.current = setTimeout(() => {
      setShowCta(true);
    }, 180000); // 3 minutos
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [opened]);

  if (!opened) {
    return (
      <div className="animate-fade-in pt-6 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
          SEU PLANO ESTÁ PRONTO
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-8">
          Veja agora o método feito para o <span className="text-primary">seu perfil</span>
        </h2>
        <button
          onClick={() => {
            track("ViewContent", { content_name: "VSL Open" });
            setOpened(true);
          }}
          className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform ring-2 ring-primary/30"
          style={{ background: "var(--gradient-primary)" }}
        >
          VER MEU PLANO PERSONALIZADO →
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-2 flex flex-col items-center">
      <div
        ref={videoRef}
        className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto overflow-hidden rounded-3xl bg-black shadow-[0_20px_60px_-15px_oklch(0.68_0.18_12/0.45)] ring-1 ring-primary/20"
        style={{ aspectRatio: "9 / 16" }}
      >
        <iframe
          src="https://fast.wistia.net/embed/iframe/fq9blvv7ui?seo=false&videoFoam=true&autoPlay=true&silentAutoPlay=false"
          title="Meu plano"
          loading="eager"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs">
        Assista até o final para liberar seu acesso 💗
      </p>

      {showCta && <div className="h-28" aria-hidden />}

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 transition-all duration-500 ${
          showCta
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(to top, var(--background) 55%, transparent)",
        }}
      >
        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("InitiateCheckout", { content_name: "VSL CTA" })}
          className="block w-full max-w-md mx-auto py-5 rounded-2xl text-white font-bold text-lg text-center shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform animate-pop-in ring-2 ring-primary/40"
          style={{ background: "var(--gradient-primary)" }}
        >
          QUERO COMEÇAR AGORA →
        </a>
      </div>
    </div>
  );
}
