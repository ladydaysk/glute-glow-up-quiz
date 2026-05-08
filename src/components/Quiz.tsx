import { useEffect, useState } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";
import ba1 from "@/assets/transform/before-after-1.webp";
import ba2 from "@/assets/transform/before-after-2.webp";
import ba3 from "@/assets/transform/before-after-3.webp";
import ba4 from "@/assets/transform/before-after-4.webp";

const transformImages = [ba1, ba2, ba3, ba4];

type Step =
  | { kind: "intro" }
  | { kind: "question"; index: number }
  | { kind: "transform" }
  
  | { kind: "name" }
  | { kind: "result" }
  | { kind: "social" }
  | { kind: "offer" };

const questions = [
  {
    q: "Qual é o seu principal objetivo hoje?",
    options: [
      "🍑 Ter glúteo maior e mais redondo",
      "🔥 Definir pernas e corpo",
      "💪 Ganhar massa muscular",
      "😔 Sair do corpo reto",
    ],
  },
  {
    q: "Qual dessas opções mais parece com você?",
    options: [
      "🙄 Muito magra e corpo reto",
      "😐 Leve volume, mas sem definição",
      "😕 Tenho dificuldade em ganhar volume",
    ],
  },
  {
    q: "Você sente que seu glúteo ​NAO  CRESCE mesmo treinando?",
    options: [
      "😩 Não cresce de jeito nenhum",
      "😕 Cresce muito pouco",
      "🤷‍♀️ Nem sei se estou fazendo certo",
    ],
  },
  {
    q: "Em qual lugar você gostaria de começar a evoluir o seu glúteo?",
    options: ["🏡 Em casa", "🏋️ Na academia"],
    note: "Dentro do método você encontra o guia com passo a passo para evoluir seu glúteo em casa ou na academia.",
  },
  {
    q: "Por que você acha que ainda não teve resultado?",
    options: [
      "🧬 Acho que é genética",
      "🏋️ Acho que treino errado",
      "🥗 Acho que não me alimento bem",
      "😕 Não sei",
    ],
    note: "Isso é mais comum do que parece entre nossas alunas. Mas você vai receber tudo que precisa para mudar isso.",
  },
  {
    q: "Se você tivesse o método certo, em quanto tempo gostaria de ver resultado?",
    options: [
      "⚡ O mais rápido possível",
      "📆 Em poucas semanas",
      "💪 No meu ritmo, mas com resultado real",
    ],
  },
];

const totalSteps = questions.length + 3; // intro + Qs + name + result(=offer flow grouped)

const testimonials = [
  { name: "Juliana, 26", text: "Em 8 semanas meu bumbum mudou completamente! Nunca pensei que daria certo pra mim 🥹" },
  { name: "Camila, 31", text: "Sempre fui o tipo 'corpo reto', e hoje minhas calças não fecham mais na cintura 😍" },
  { name: "Rafa, 23", text: "Treinava há anos sem ver resultado. Em 1 mês de método já notei diferença real!" },
  { name: "Letícia, 29", text: "O segredo era ATIVAÇÃO. Mudou tudo. Recomendo demais 💗" },
];

const popupNames = ["Carla", "Ana", "Beatriz", "Mariana", "Júlia", "Sofia", "Larissa", "Patrícia", "Renata"];

export default function Quiz() {
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [popup, setPopup] = useState<string | null>(null);
  const [counter, setCounter] = useState(500);
  useEffect(() => {
    setCounter(487 + Math.floor(Math.random() * 60));

    // Inicializa o Meta Pixel antes de qualquer evento
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    (window as any).fbq("init", "2495276150874187");

    // Dispara PageView (browser pixel + CAPI com dedupe)
    trackMetaEvent("PageView");
  }, []);
  const [testIndex, setTestIndex] = useState(0);

  // Real-time social proof popup
  useEffect(() => {
    const id = setInterval(() => {
      const n = popupNames[Math.floor(Math.random() * popupNames.length)];
      const actions = [
        `${n} acabou de começar o quiz`,
        `${n} acabou de garantir o método`,
        `Mais de ${counter + Math.floor(Math.random() * 10)} mulheres já transformaram o corpo`,
      ];
      setPopup(actions[Math.floor(Math.random() * actions.length)]);
      setTimeout(() => setPopup(null), 4500);
    }, 7000);
    return () => clearInterval(id);
  }, [counter]);

  // Testimonial carousel
  useEffect(() => {
    if (step.kind !== "social") return;
    const id = setInterval(() => setTestIndex((i) => (i + 1) % testimonials.length), 3500);
    return () => clearInterval(id);
  }, [step.kind]);

  const progress = (() => {
    if (step.kind === "intro") return 0;
    if (step.kind === "question") return ((step.index + 1) / totalSteps) * 100;
    if (step.kind === "name") return ((questions.length + 1) / totalSteps) * 100;
    return 100;
  })();

  const answer = (idx: number, opt: string) => {
    const next = [...answers];
    next[idx] = opt;
    setAnswers(next);
    if (idx === 0) {
      setStep({ kind: "transform" });
      return;
    }

    if (questions[idx]?.note) {
      setShowNote(true);
      setTimeout(() => {
        setShowNote(false);
        goToQuestion(idx + 1);
      }, 3000);
      return;
    }
    goToQuestion(idx + 1);
  };

  const goToQuestion = (idx: number) => {
    if (idx >= questions.length) setStep({ kind: "name" });
    else setStep({ kind: "question", index: idx });
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 relative overflow-hidden">
      {/* Progress */}
      {step.kind !== "intro" && (
        <div className="w-full max-w-md mb-6">
          <div className="h-2 rounded-full bg-nude overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-md flex-1 flex flex-col">
        {step.kind === "intro" && <Intro onStart={() => setStep({ kind: "question", index: 0 })} counter={counter} />}

        {step.kind === "question" && (
          <QuestionView
            key={step.index}
            data={questions[step.index]}
            onSelect={(opt) => answer(step.index, opt)}
            current={step.index + 1}
            total={questions.length}
            showNote={showNote}
          />
        )}

        {step.kind === "transform" && (
          <TransformView onNext={() => setStep({ kind: "question", index: 1 })} />
        )}

        {step.kind === "name" && (
          <NameView
            onSubmit={(n) => {
              setName(n);
              setStep({ kind: "result" });
            }}
          />
        )}

        {step.kind === "result" && (
          <ResultView name={name} onNext={() => setStep({ kind: "social" })} />
        )}

        {step.kind === "social" && (
          <SocialView t={testimonials[testIndex]} counter={counter} onNext={() => setStep({ kind: "offer" })} />
        )}

        {step.kind === "offer" && <OfferView name={name} />}
      </div>

      {/* Live popup */}
      {popup && (
        <div className="fixed bottom-5 left-4 sm:left-5 z-50 animate-toast-in">
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3 max-w-xs text-white border-2 border-white/30 ring-2 ring-primary/40"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 12px 40px -8px oklch(0.68 0.18 12 / 0.6), 0 0 0 4px oklch(0.68 0.18 12 / 0.15)",
            }}
          >
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
            <p className="text-sm font-bold drop-shadow-sm">{popup}</p>
          </div>
        </div>
      )}
    </div>
  );
}


function TransformView({ onNext }: { onNext: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % transformImages.length), 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="animate-slide-up flex flex-col">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-foreground leading-snug">
        Mais de <span className="text-primary">500 mulheres</span> já transformaram o corpo com o Método <span className="text-primary">LadyDaysk</span>
      </h2>

      <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-[var(--shadow-card)] bg-card mb-3">
        {transformImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Transformação ${i + 1}`}
            loading="lazy"
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

function Intro({ onStart, counter }: { onStart: () => void; counter: number }) {
  return (
    <div className="flex flex-col items-center text-center pt-10 animate-fade-in">
      <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">QUIZ </span>
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3 text-foreground">
        Descubra por que seu Glúteo <span className="text-primary whitespace-nowrap">NÃO CRESCE</span><br />
        (mesmo treinando)
      </h1>
      <p className="text-muted-foreground mb-8">Leva menos de 1 minuto</p>

      <div className="w-full bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] mb-8">
        <div className="text-6xl mb-3">🍑</div>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          Responda algumas perguntas rápidas e descubra{"\n"}o método ideal para o seu perfil.
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        style={{ background: "var(--gradient-primary)" }}
      >
        COMEÇAR ✨
      </button>

      <p className="text-xs text-muted-foreground mt-4">
        💖 Mais de {counter} mulheres já fizeram esse quiz
      </p>
    </div>
  );
}

function QuestionView({
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

function NameView({ onSubmit }: { onSubmit: (name: string) => void }) {
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

function ResultView({ name, onNext }: { name: string; onNext: () => void }) {
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

function SocialView({
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
        <p className="text-foreground">"{t.text}"</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {testimonials.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full bg-nude overflow-hidden">
            <div className="h-full bg-primary" />
          </div>
        ))}
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

function OfferView({ name }: { name: string }) {
  useEffect(() => {
    trackMetaEvent("ViewContent", { content_name: "Quiz Offer" });
  }, []);
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
