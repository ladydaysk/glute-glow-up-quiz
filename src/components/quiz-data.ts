export type Step =
  | { kind: "intro" }
  | { kind: "question"; index: number }
  | { kind: "transform" }
  | { kind: "name" }
  | { kind: "result" }
  | { kind: "social" }
  | { kind: "offer" };

export const questions = [
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

export const testimonials = [
  { name: "Juliana, 26", text: "Em 8 semanas meu bumbum mudou completamente! Nunca pensei que daria certo pra mim 🥹" },
  { name: "Camila, 31", text: "Sempre fui o tipo 'corpo reto', e hoje minhas calças não fecham mais na cintura 😍" },
  { name: "Rafa, 23", text: "Treinava há anos sem ver resultado. Em 1 mês de método já notei diferença real!" },
  { name: "Letícia, 29", text: "O segredo era ATIVAÇÃO. Mudou tudo. Recomendo demais 💗" },
];
