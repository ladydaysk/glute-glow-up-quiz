import { createFileRoute } from "@tanstack/react-router";
import PlanilhaForm from "@/components/PlanilhaForm";

export const Route = createFileRoute("/planilha")({
  head: () => ({
    meta: [
      { title: "Planilha de treinos grátis | LadyDaysk" },
      {
        name: "description",
        content:
          "Resgate de graça a planilha de treinos da LadyDaysk e comece hoje com progressão estruturada.",
      },
      { property: "og:title", content: "Resgate a minha planilha de treinos de GRAÇA" },
      {
        property: "og:description",
        content: "Um presente pra você que me acompanha. Preencha e receba na hora.",
      },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <PlanilhaForm />
    </div>
  );
}
