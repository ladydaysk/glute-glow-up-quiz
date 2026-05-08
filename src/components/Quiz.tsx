import { lazy, Suspense, useEffect, useState } from "react";
import { track } from "@/lib/fbq";
import { questions, testimonials, type Step } from "./QuizSteps";

const QuestionView = lazy(() => import("./QuizSteps").then((m) => ({ default: m.QuestionView })));
const TransformView = lazy(() => import("./QuizSteps").then((m) => ({ default: m.TransformView })));
const NameView = lazy(() => import("./QuizSteps").then((m) => ({ default: m.NameView })));
const ResultView = lazy(() => import("./QuizSteps").then((m) => ({ default: m.ResultView })));
const SocialView = lazy(() => import("./QuizSteps").then((m) => ({ default: m.SocialView })));
const OfferView = lazy(() => import("./QuizSteps").then((m) => ({ default: m.OfferView })));

const totalSteps = questions.length + 3;
const popupNames = ["Carla", "Ana", "Beatriz", "Mariana", "Júlia", "Sofia", "Larissa", "Patrícia", "Renata"];

export default function Quiz() {
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [popup, setPopup] = useState<string | null>(null);
  const [counter, setCounter] = useState(500);
  const [testIndex, setTestIndex] = useState(0);

  useEffect(() => {
    setCounter(487 + Math.floor(Math.random() * 60));
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("purchase") === "success") {
        track("Purchase", { currency: "BRL", value: 0 });
      }
    }
  }, []);

  // Live popup
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

  // Prefetch next chunk after intro renders so first interaction feels instant
  const prefetchSteps = () => {
    void import("./QuizSteps");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 relative overflow-hidden">
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
        {step.kind === "intro" && (
          <Intro
            onStart={() => setStep({ kind: "question", index: 0 })}
            onHover={prefetchSteps}
            counter={counter}
          />
        )}

        <Suspense fallback={null}>
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
                track("Lead", { content_name: "Quiz Name Submit" });
                setStep({ kind: "result" });
              }}
            />
          )}

          {step.kind === "result" && (
            <ResultView name={name} onNext={() => {
              track("ViewContent", { content_name: "Quiz Result" });
              setStep({ kind: "social" });
            }} />
          )}

          {step.kind === "social" && (
            <SocialView t={testimonials[testIndex]} counter={counter} onNext={() => {
              track("AddToCart", { content_name: "Quiz Offer" });
              setStep({ kind: "offer" });
            }} />
          )}

          {step.kind === "offer" && <OfferView name={name} />}
        </Suspense>
      </div>

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

function Intro({ onStart, onHover, counter }: { onStart: () => void; onHover: () => void; counter: number }) {
  // Prefetch the next chunk shortly after first paint
  useEffect(() => {
    const id = setTimeout(onHover, 1200);
    return () => clearTimeout(id);
  }, [onHover]);

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
        onMouseEnter={onHover}
        onTouchStart={onHover}
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
