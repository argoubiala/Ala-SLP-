import type { BuiltinDeck, CategoryInfo, CategoryKey } from "../lib/types";

export const categoryInfo: Record<CategoryKey, CategoryInfo> = {
  articulation: { emoji: "🗣️", name: "Articulation", desc: "Speech sound practice", color: "#7C5CFC" },
  phonology: { emoji: "🔤", name: "Phonological Awareness", desc: "Sounds, syllables & rhyming", color: "#14B8A6" },
  language: { emoji: "📚", name: "Language", desc: "Vocabulary, concepts & sentences", color: "#F59E0B" },
  literacy: { emoji: "📖", name: "Literacy", desc: "Reading, letters & spelling", color: "#8E5CF7" },
  cognitive: { emoji: "🧠", name: "Cognitive", desc: "Memory, attention & thinking", color: "#22C55E" },
  aac: { emoji: "🧩", name: "AAC", desc: "Functional communication practice", color: "#F43F5E" },
};

const rawBuiltins: Record<CategoryKey, { title: string; description: string; cards: BuiltinDeck["cards"] }[]> = {
  articulation: [
    {
      title: "/SH/ Initial Position",
      description: "Identify the /sh/ sound at the beginning of words.",
      cards: [
        { question: "What sound does \u201Cshoe\u201D start with?", answers: ["/s/", "/sh/", "/f/"], correct: 1 },
        { question: "What sound does \u201Cshark\u201D start with?", answers: ["/k/", "/sh/", "/s/"], correct: 1 },
        { question: "What sound does \u201Csheep\u201D start with?", answers: ["/sh/", "/t/", "/p/"], correct: 0 },
        { question: "What sound does \u201Cship\u201D start with?", answers: ["/s/", "/ch/", "/sh/"], correct: 2 },
        { question: "What sound does \u201Cshampoo\u201D start with?", answers: ["/m/", "/sh/", "/s/"], correct: 1 },
      ],
    },
    {
      title: "/K/ Initial Position",
      description: "Practice identifying the /k/ sound.",
      cards: [
        { question: "What sound does \u201Ccat\u201D start with?", answers: ["/t/", "/k/", "/g/"], correct: 1 },
        { question: "What sound does \u201Ckite\u201D start with?", answers: ["/k/", "/s/", "/t/"], correct: 0 },
        { question: "What sound does \u201Ccar\u201D start with?", answers: ["/p/", "/g/", "/k/"], correct: 2 },
      ],
    },
  ],
  phonology: [
    {
      title: "Initial Sounds",
      description: "Choose the first sound you hear.",
      cards: [
        { question: "What is the first sound in \u201Capple\u201D?", answers: ["/a/", "/p/", "/l/"], correct: 0 },
        { question: "What is the first sound in \u201Cfish\u201D?", answers: ["/f/", "/sh/", "/s/"], correct: 0 },
        { question: "What is the first sound in \u201Cdog\u201D?", answers: ["/b/", "/d/", "/g/"], correct: 1 },
      ],
    },
  ],
  language: [
    {
      title: "Categories",
      description: "Choose the item that belongs with the group.",
      cards: [
        { question: "Which one is a fruit?", answers: ["Apple", "Chair", "Shoe"], correct: 0 },
        { question: "Which one is an animal?", answers: ["Dog", "Table", "Banana"], correct: 0 },
        { question: "Which one is a vehicle?", answers: ["Car", "Apple", "Cat"], correct: 0 },
      ],
    },
  ],
  literacy: [
    {
      title: "Letter Sounds",
      description: "Match the letter to its sound.",
      cards: [
        { question: "What sound does the letter A make here?", answers: ["/m/", "/a/", "/s/"], correct: 1 },
        { question: "What sound does the letter M make?", answers: ["/m/", "/t/", "/k/"], correct: 0 },
        { question: "What sound does the letter S make?", answers: ["/p/", "/s/", "/b/"], correct: 1 },
      ],
    },
  ],
  cognitive: [
    {
      title: "Memory & Attention",
      description: "Choose the item that matches the prompt.",
      cards: [
        { question: "Which color is shown? (Red)", answers: ["Blue", "Red", "Green"], correct: 1 },
        { question: "What shape is shown? (Star)", answers: ["Circle", "Star", "Square"], correct: 1 },
        { question: "What fruit is shown? (Banana)", answers: ["Banana", "Apple", "Pear"], correct: 0 },
      ],
    },
  ],
  aac: [
    {
      title: "Everyday Requests",
      description: "Practice recognizing useful communication choices.",
      cards: [
        { question: "Which symbol means \u201Cdrink\u201D?", answers: ["\uD83D\uDCA7 Drink", "\uD83C\uDF4E Eat", "\uD83D\uDECF\uFE0F Sleep"], correct: 0 },
        { question: "Which symbol means \u201Ceat\u201D?", answers: ["\uD83D\uDCA7 Drink", "\uD83C\uDF4E Eat", "\uD83D\uDEBD Toilet"], correct: 1 },
        { question: "Which symbol means \u201Ctoilet\u201D?", answers: ["\uD83D\uDEBD Toilet", "\uD83D\uDECF\uFE0F Sleep", "\uD83C\uDFAE Play"], correct: 0 },
      ],
    },
  ],
};

export const builtinDecks: BuiltinDeck[] = Object.entries(rawBuiltins).flatMap(([category, decks]) =>
  decks.map((d, i) => ({
    id: `builtin:${category}:${i}`,
    category: category as CategoryKey,
    title: d.title,
    description: d.description,
    cards: d.cards,
    builtin: true as const,
  }))
);

export function getBuiltinDecksForCategory(category: CategoryKey): BuiltinDeck[] {
  return builtinDecks.filter(d => d.category === category);
}

export function getBuiltinDeckById(id: string): BuiltinDeck | undefined {
  return builtinDecks.find(d => d.id === id);
}
