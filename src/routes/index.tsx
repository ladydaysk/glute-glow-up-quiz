import { createFileRoute } from "@tanstack/react-router";
import Quiz from "@/components/Quiz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quiz: Por que seu glúteo não cresce? | Método Glúteo" },
      {
        name: "description",
        content:
          "Descubra em menos de 1 minuto por que seu glúteo não cresce mesmo treinando — e qual método pode mudar isso.",
      },
      { property: "og:title", content: "Descubra por que seu glúteo não cresce" },
      {
        property: "og:description",
        content: "Quiz rápido e personalizado para mulheres que querem resultado real.",
      },
    ],
  }),
  component: Quiz,
});
