import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/fbq";

/**
 * Roleta de desconto. Aparece uma vez na tela da oferta, alguns segundos
 * depois que a pessoa abre os entregaveis. Ela pode girar ou fechar; se girar,
 * SEMPRE cai no 20% — as outras fatias existem so pra dar emocao ao giro.
 */
export const CUPOM = "LADY20";
export const DESCONTO_PCT = 20;

// Fatias em ordem horaria a partir do topo. A vencedora e fixa.
const FATIAS = ["5%", "10%", "20%", "15%", "30%", "20%", "25%", "20%"];
const FATIA_VENCEDORA = 2; // indice em FATIAS (a primeira "20%")
const CORES = ["#f43f7a", "#ffd6e2", "#e11d5b", "#ffe9f0", "#f43f7a", "#ffd6e2", "#e11d5b", "#ffe9f0"];

type Props = {
  aberta: boolean;
  onFechar: () => void;
  onGanhou: () => void;
};

export default function Roleta({ aberta, onFechar, onGanhou }: Props) {
  const [girando, setGirando] = useState(false);
  const [ganhou, setGanhou] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const girou = useRef(false);

  useEffect(() => {
    if (aberta) track("RoletaVista", { content_name: "Roleta" });
  }, [aberta]);

  if (!aberta) return null;

  const n = FATIAS.length;
  const grau = 360 / n;

  function girar() {
    if (girou.current) return;
    girou.current = true;
    setGirando(true);
    track("RoletaGirou", { content_name: "Roleta" });

    // Ponteiro fica no topo. Pra fatia i parar embaixo dele, o centro dela
    // (i*grau + grau/2) tem que ir pra 0 → rotacao = 360 - centro. Somo
    // voltas inteiras pra parecer sorteio.
    const centro = FATIA_VENCEDORA * grau + grau / 2;
    const voltas = 6;
    setAngulo(voltas * 360 + (360 - centro));

    setTimeout(() => {
      setGirando(false);
      setGanhou(true);
      onGanhou();
      track("RoletaGanhou", { content_name: "Roleta", content_category: CUPOM });
    }, 4200);
  }

  function copiar() {
    navigator.clipboard?.writeText(CUPOM).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const conic = FATIAS.map((_, i) => `${CORES[i]} ${i * grau}deg ${(i + 1) * grau}deg`).join(", ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center animate-pop-in relative">
        {!ganhou && (
          <button
            id="btn-roleta-fechar"
            data-track="roleta_fechar"
            onClick={() => {
              track("RoletaFechou", { content_name: "Roleta" });
              onFechar();
            }}
            disabled={girando}
            aria-label="Fechar"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background text-muted-foreground text-xl leading-none grid place-items-center disabled:opacity-40"
          >
            ×
          </button>
        )}

        {!ganhou ? (
          <>
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
              🎁 Presente surpresa
            </span>
            <h3 className="text-2xl font-extrabold text-foreground leading-tight mt-2">
              Gira a roleta e ganha um desconto agora
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5">Só vale nessa tela. Uma tentativa.</p>

            {/* Roda */}
            <div className="relative mx-auto mt-6 w-[240px] h-[240px]">
              {/* ponteiro */}
              <div
                className="absolute left-1/2 -top-2 -translate-x-1/2 z-10 w-0 h-0"
                style={{
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: "22px solid oklch(0.52 0.26 18)",
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))",
                }}
              />
              <div
                className="w-full h-full rounded-full border-[6px] border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]"
                style={{
                  background: `conic-gradient(${conic})`,
                  transform: `rotate(${angulo}deg)`,
                  transition: girando ? "transform 4.2s cubic-bezier(.17,.67,.12,1)" : "none",
                }}
              >
                {FATIAS.map((f, i) => (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 text-[13px] font-extrabold"
                    style={{
                      color: i % 2 ? "oklch(0.45 0.22 12)" : "#fff",
                      transform: `rotate(${i * grau + grau / 2}deg) translateY(-88px) translateX(-50%)`,
                      transformOrigin: "0 0",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white shadow grid place-items-center text-xl">
                🍑
              </div>
            </div>

            <button
              id="btn-roleta-girar"
              data-track="roleta_girar"
              onClick={girar}
              disabled={girando}
              className="mt-6 w-full py-4 rounded-2xl text-white font-extrabold text-lg animate-cta-pulse disabled:animate-none disabled:opacity-70"
              style={{ background: "var(--gradient-cta)" }}
            >
              {girando ? "GIRANDO…" : "GIRAR A ROLETA 🎡"}
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl">🎉</div>
            <h3 className="text-2xl font-extrabold text-foreground leading-tight mt-2">
              Você ganhou {DESCONTO_PCT}% de desconto!
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              Copie o cupom e cole no campo <strong className="text-foreground">"Cupom de desconto"</strong> na
              tela de pagamento.
            </p>

            <button
              id="btn-roleta-copiar"
              data-track="roleta_copiar"
              onClick={copiar}
              className="mt-5 w-full rounded-2xl border-2 border-dashed border-primary bg-rose/40 py-4 px-4"
            >
              <span className="block text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                seu cupom
              </span>
              <span className="block text-3xl font-extrabold tracking-[0.15em] text-primary mt-1">
                {CUPOM}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                {copiado ? "✓ copiado! agora é só colar no pagamento" : "toque pra copiar"}
              </span>
            </button>

            <button
              id="btn-roleta-usar"
              data-track="roleta_usar"
              onClick={onFechar}
              className="mt-4 w-full py-4 rounded-2xl text-white font-extrabold text-lg animate-cta-pulse"
              style={{ background: "var(--gradient-cta)" }}
            >
              USAR MEU DESCONTO →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
