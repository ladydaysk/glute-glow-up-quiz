import { useEffect, useState } from "react";
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

export function OfferView({ name }: { name: string }) {
  const items = [
    "Treinos passo a passo (academia e casa)",
    "Método focado em ativação de glúteo",
    "Progressão inteligente para crescimento",
    "Estratégias que funcionam para corpo magro",
  ];
  return (
    <div className="animate-fade-in pt-2">
      <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold block text-center mb-3">
        Método exclusivo
      </span>
      <h2 className="text-3xl font-bold text-center mb-3 leading-tight">
        Você não precisa <span className="line-through text-muted-foreground">treinar mais</span>… precisa treinar do <span className="text-primary">jeito certo</span>.
      </h2>
      <p className="text-center text-muted-foreground mb-6">
        {name}, criamos um plano completo para mulheres com o seu perfil.
      </p>

      <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] mb-6">
        <p className="font-semibold text-foreground mb-4">O que você recebe:</p>
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it} className="flex gap-3 items-start">
              <span
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-sm shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                ✓
              </span>
              <span className="text-foreground pt-0.5">{it}</span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href="https://pay.kiwify.com.br/gM257BR"
        onClick={() => track("InitiateCheckout", { content_name: "Kiwify Checkout", currency: "BRL" })}
        className="block w-full py-6 rounded-2xl text-white font-bold text-xl shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform mb-3 text-center"
        style={{ background: "var(--gradient-primary)" }}
      >
        QUERO COMEÇAR AGORA 🔥
      </a>
      <p className="text-center text-sm text-muted-foreground">
        Comece hoje e veja as primeiras mudanças nas próximas semanas.
      </p>
    </div>
  );
}
