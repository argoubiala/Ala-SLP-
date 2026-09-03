export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  skill: string;
  ageRange: string;
  language: string;
  cardCount: number;
  rating: number;
  ratingCount: number;
  favorites: number;
  isFavorited?: boolean;
  tags: string[];
  creator: Creator;
  thumbnail: string;
  status: "draft" | "private" | "public";
  plays: number;
  createdAt: string;
  previewCards: PreviewCard[];
}

export interface PreviewCard {
  id: string;
  type: "multiple-choice" | "image-choice" | "yes-no" | "text-answer" | "listening";
  prompt: string;
  image?: string;
  options?: string[];
  correctAnswer?: string | number;
  audio?: string;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  location: string;
  followers: number;
  published: number;
  rating: number;
  specialties: string[];
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  age: number;
  grade: string;
  goals: Goal[];
  assignedActivities: string[];
  accuracy: number;
  sessionsThisWeek: number;
  totalSessions: number;
  lastSession: string;
  notes: string;
  progressData: ProgressPoint[];
}

export interface Goal {
  id: string;
  text: string;
  target: number;
  current: number;
  unit: string;
  category: string;
}

export interface ProgressPoint {
  date: string;
  accuracy: number;
  sessions: number;
}

export interface Session {
  id: string;
  studentId: string;
  studentName: string;
  activityTitle: string;
  date: string;
  duration: number;
  accuracy: number;
  cardsCompleted: number;
  totalCards: number;
}

export const creators: Creator[] = [
  {
    id: "c1",
    name: "Dr. Maria Santos",
    avatar: "MS",
    title: "Speech-Language Pathologist",
    bio: "15+ years helping children find their voice. Specializing in articulation and language development. Passionate about making therapy fun and effective.",
    location: "Austin, TX",
    followers: 2840,
    published: 47,
    rating: 4.9,
    specialties: ["Articulation", "Language", "Fluency"],
  },
  {
    id: "c2",
    name: "James Okonkwo",
    avatar: "JO",
    title: "Pediatric SLP",
    bio: "Certified SLP working with school-age children. Love creating visually engaging materials that motivate kids.",
    location: "Chicago, IL",
    followers: 1520,
    published: 32,
    rating: 4.8,
    specialties: ["Phonological", "Social Skills", "AAC"],
  },
  {
    id: "c3",
    name: "Priya Nair",
    avatar: "PN",
    title: "Early Intervention SLP",
    bio: "Bilingual SLP specializing in early intervention. Creating materials in English and Spanish.",
    location: "Miami, FL",
    followers: 3100,
    published: 61,
    rating: 4.9,
    specialties: ["Early Intervention", "Bilingual", "Feeding"],
  },
  {
    id: "c4",
    name: "Alex Chen",
    avatar: "AC",
    title: "School-Based SLP",
    bio: "School SLP creating curriculum-aligned speech therapy materials for K-8 students.",
    location: "Seattle, WA",
    followers: 980,
    published: 19,
    rating: 4.7,
    specialties: ["School-Based", "Articulation", "Language"],
  },
];

export const activities: Activity[] = [
  {
    id: "a1",
    title: "R Sound Story Cards",
    description: "Practice the /r/ sound in initial, medial, and final positions through engaging story-based cards. Perfect for children ages 5-10.",
    category: "Articulation",
    skill: "/r/ Sound",
    ageRange: "5-10",
    language: "English",
    cardCount: 24,
    rating: 4.9,
    ratingCount: 128,
    favorites: 342,
    isFavorited: false,
    tags: ["r-sound", "articulation", "stories", "school-age"],
    creator: creators[0],
    thumbnail: "🦁",
    status: "public",
    plays: 1840,
    createdAt: "2024-09-15",
    previewCards: [
      { id: "pc1", type: "multiple-choice", prompt: "Which word starts with the /r/ sound?", options: ["Apple", "Rabbit", "Sun", "Tree"], correctAnswer: 1 },
      { id: "pc2", type: "image-choice", prompt: "Tap the picture that begins with R", options: ["🌹", "🍎", "🐕", "🌙"], correctAnswer: 0 },
      { id: "pc3", type: "yes-no", prompt: "Does 'rainbow' have the /r/ sound?", correctAnswer: "yes" },
    ],
  },
  {
    id: "a2",
    title: "Following 2-Step Directions",
    description: "Build comprehension skills with fun, illustrated two-step direction cards. Great for language development and classroom carryover.",
    category: "Language",
    skill: "Following Directions",
    ageRange: "4-8",
    language: "English",
    cardCount: 18,
    rating: 4.8,
    ratingCount: 95,
    favorites: 287,
    isFavorited: true,
    tags: ["language", "comprehension", "directions", "preschool"],
    creator: creators[1],
    thumbnail: "🧭",
    status: "public",
    plays: 1230,
    createdAt: "2024-10-02",
    previewCards: [
      { id: "pc1", type: "listening", prompt: "Touch the red circle, then clap your hands!", correctAnswer: "done" },
      { id: "pc2", type: "yes-no", prompt: "Did you follow both directions?", correctAnswer: "yes" },
    ],
  },
  {
    id: "a3",
    title: "Bilingual Vocabulary: Animals",
    description: "English-Spanish animal vocabulary cards for bilingual therapy sessions. Beautiful illustrations with audio support.",
    category: "Vocabulary",
    skill: "Bilingual Vocabulary",
    ageRange: "3-7",
    language: "Bilingual",
    cardCount: 30,
    rating: 4.9,
    ratingCount: 211,
    favorites: 518,
    isFavorited: false,
    tags: ["bilingual", "spanish", "vocabulary", "animals"],
    creator: creators[2],
    thumbnail: "🦜",
    status: "public",
    plays: 3120,
    createdAt: "2024-08-20",
    previewCards: [
      { id: "pc1", type: "multiple-choice", prompt: "¿Cómo se llama este animal? / What is this animal called?", options: ["Dog / Perro", "Cat / Gato", "Bird / Pájaro", "Fish / Pez"], correctAnswer: 2 },
    ],
  },
  {
    id: "a4",
    title: "S Blends Bingo",
    description: "Classic bingo format meets speech therapy! Practice S-blends (sl, sm, sn, sp, st, sw) in a fun interactive format.",
    category: "Articulation",
    skill: "S Blends",
    ageRange: "6-12",
    language: "English",
    cardCount: 36,
    rating: 4.7,
    ratingCount: 74,
    favorites: 198,
    isFavorited: false,
    tags: ["s-blends", "articulation", "bingo", "game"],
    creator: creators[3],
    thumbnail: "⭐",
    status: "public",
    plays: 920,
    createdAt: "2024-11-01",
    previewCards: [
      { id: "pc1", type: "image-choice", prompt: "Which picture shows an S-blend word?", options: ["🐌", "🐕", "🌸", "🌙"], correctAnswer: 0 },
    ],
  },
  {
    id: "a5",
    title: "Pragmatic Language Social Scenarios",
    description: "Real-world social scenarios to practice pragmatic language skills. Perfect for older students working on social communication.",
    category: "Social Skills",
    skill: "Pragmatics",
    ageRange: "8-14",
    language: "English",
    cardCount: 20,
    rating: 4.8,
    ratingCount: 156,
    favorites: 401,
    isFavorited: true,
    tags: ["pragmatics", "social", "scenarios", "older-students"],
    creator: creators[1],
    thumbnail: "💬",
    status: "public",
    plays: 2100,
    createdAt: "2024-07-10",
    previewCards: [
      { id: "pc1", type: "multiple-choice", prompt: "Your friend looks sad. What should you do?", options: ["Ignore them", "Ask if they're okay", "Walk away", "Change the subject"], correctAnswer: 1 },
    ],
  },
  {
    id: "a6",
    title: "Early Words: My Family",
    description: "Early vocabulary cards featuring family members with simple, clear photographs and audio support for emerging communicators.",
    category: "Early Intervention",
    skill: "Early Vocabulary",
    ageRange: "2-5",
    language: "English",
    cardCount: 12,
    rating: 4.9,
    ratingCount: 89,
    favorites: 267,
    isFavorited: false,
    tags: ["early-intervention", "vocabulary", "family", "toddler"],
    creator: creators[2],
    thumbnail: "👨‍👩‍👧",
    status: "public",
    plays: 1450,
    createdAt: "2024-09-28",
    previewCards: [
      { id: "pc1", type: "image-choice", prompt: "Show me MAMA!", options: ["👩", "👨", "👧", "👶"], correctAnswer: 0 },
    ],
  },
  {
    id: "a7",
    title: "WH Questions Adventure",
    description: "Practice who, what, where, when, and why questions through an exciting adventure story. Great for comprehension and language skills.",
    category: "Language",
    skill: "WH Questions",
    ageRange: "5-9",
    language: "English",
    cardCount: 28,
    rating: 4.6,
    ratingCount: 63,
    favorites: 144,
    isFavorited: false,
    tags: ["wh-questions", "comprehension", "adventure", "story"],
    creator: creators[0],
    thumbnail: "🗺️",
    status: "draft",
    plays: 0,
    createdAt: "2024-11-10",
    previewCards: [],
  },
  {
    id: "a8",
    title: "Phonological Awareness Fun",
    description: "Target rhyming, syllables, onset-rime, and phoneme awareness with colorful, engaging cards.",
    category: "Phonological",
    skill: "Phonological Awareness",
    ageRange: "4-7",
    language: "English",
    cardCount: 32,
    rating: 0,
    ratingCount: 0,
    favorites: 0,
    isFavorited: false,
    tags: ["phonological", "awareness", "rhyming", "syllables"],
    creator: creators[3],
    thumbnail: "🎵",
    status: "private",
    plays: 0,
    createdAt: "2024-11-05",
    previewCards: [],
  },
];

export const students: Student[] = [
  {
    id: "s1",
    name: "Emma Rodriguez",
    avatar: "ER",
    age: 7,
    grade: "2nd Grade",
    goals: [
      { id: "g1", text: "/r/ sound accuracy in words", target: 80, current: 68, unit: "%", category: "Articulation" },
      { id: "g2", text: "Following 2-step directions", target: 90, current: 75, unit: "%", category: "Language" },
    ],
    assignedActivities: ["a1", "a2"],
    accuracy: 72,
    sessionsThisWeek: 2,
    totalSessions: 24,
    lastSession: "2024-11-13",
    notes: "Emma is making great progress with /r/ in word-initial position. Continue working on medial and final positions. Parents report she practices daily at home.",
    progressData: [
      { date: "Oct 1", accuracy: 55, sessions: 2 },
      { date: "Oct 8", accuracy: 58, sessions: 2 },
      { date: "Oct 15", accuracy: 62, sessions: 3 },
      { date: "Oct 22", accuracy: 65, sessions: 2 },
      { date: "Oct 29", accuracy: 68, sessions: 2 },
      { date: "Nov 5", accuracy: 70, sessions: 3 },
      { date: "Nov 12", accuracy: 72, sessions: 2 },
    ],
  },
  {
    id: "s2",
    name: "Liam Park",
    avatar: "LP",
    age: 5,
    grade: "Kindergarten",
    goals: [
      { id: "g3", text: "Expressive vocabulary (50+ words)", target: 50, current: 38, unit: "words", category: "Language" },
      { id: "g4", text: "2-word combinations", target: 80, current: 55, unit: "%", category: "Early Language" },
    ],
    assignedActivities: ["a3", "a6"],
    accuracy: 61,
    sessionsThisWeek: 3,
    totalSessions: 18,
    lastSession: "2024-11-14",
    notes: "Liam is responding well to visual supports. Bilingual exposure at home is beneficial. Focus on functional vocabulary in therapy.",
    progressData: [
      { date: "Oct 1", accuracy: 40, sessions: 3 },
      { date: "Oct 8", accuracy: 44, sessions: 3 },
      { date: "Oct 15", accuracy: 48, sessions: 3 },
      { date: "Oct 22", accuracy: 51, sessions: 3 },
      { date: "Oct 29", accuracy: 55, sessions: 3 },
      { date: "Nov 5", accuracy: 58, sessions: 3 },
      { date: "Nov 12", accuracy: 61, sessions: 3 },
    ],
  },
  {
    id: "s3",
    name: "Sofia Obi",
    avatar: "SO",
    age: 10,
    grade: "4th Grade",
    goals: [
      { id: "g5", text: "Social communication skills", target: 85, current: 78, unit: "%", category: "Pragmatics" },
      { id: "g6", text: "Narrative organization", target: 90, current: 82, unit: "%", category: "Language" },
    ],
    assignedActivities: ["a5"],
    accuracy: 80,
    sessionsThisWeek: 1,
    totalSessions: 31,
    lastSession: "2024-11-12",
    notes: "Sofia has made excellent progress. Consider discussing transitioning to monthly check-ins. Great carryover in classroom settings.",
    progressData: [
      { date: "Oct 1", accuracy: 68, sessions: 1 },
      { date: "Oct 8", accuracy: 71, sessions: 2 },
      { date: "Oct 15", accuracy: 73, sessions: 1 },
      { date: "Oct 22", accuracy: 75, sessions: 2 },
      { date: "Oct 29", accuracy: 77, sessions: 1 },
      { date: "Nov 5", accuracy: 79, sessions: 2 },
      { date: "Nov 12", accuracy: 80, sessions: 1 },
    ],
  },
  {
    id: "s4",
    name: "Noah Kim",
    avatar: "NK",
    age: 6,
    grade: "1st Grade",
    goals: [
      { id: "g7", text: "S/Z articulation accuracy", target: 75, current: 52, unit: "%", category: "Articulation" },
    ],
    assignedActivities: ["a4"],
    accuracy: 52,
    sessionsThisWeek: 2,
    totalSessions: 12,
    lastSession: "2024-11-11",
    notes: "Noah is eager and motivated. Responds well to game-based activities. Continue reinforcing with home practice program.",
    progressData: [
      { date: "Oct 1", accuracy: 35, sessions: 2 },
      { date: "Oct 8", accuracy: 40, sessions: 2 },
      { date: "Oct 15", accuracy: 43, sessions: 2 },
      { date: "Oct 22", accuracy: 46, sessions: 2 },
      { date: "Oct 29", accuracy: 49, sessions: 2 },
      { date: "Nov 5", accuracy: 51, sessions: 2 },
      { date: "Nov 12", accuracy: 52, sessions: 2 },
    ],
  },
  {
    id: "s5",
    name: "Ava Thompson",
    avatar: "AT",
    age: 4,
    grade: "Pre-K",
    goals: [
      { id: "g8", text: "Following 1-step directions", target: 90, current: 85, unit: "%", category: "Language" },
      { id: "g9", text: "Requesting using words", target: 80, current: 70, unit: "%", category: "Early Language" },
    ],
    assignedActivities: ["a6", "a2"],
    accuracy: 77,
    sessionsThisWeek: 3,
    totalSessions: 20,
    lastSession: "2024-11-14",
    notes: "Ava is a delight in sessions. Ready to bump up direction complexity. Parents highly involved.",
    progressData: [
      { date: "Oct 1", accuracy: 60, sessions: 3 },
      { date: "Oct 8", accuracy: 63, sessions: 3 },
      { date: "Oct 15", accuracy: 66, sessions: 3 },
      { date: "Oct 22", accuracy: 70, sessions: 3 },
      { date: "Oct 29", accuracy: 73, sessions: 3 },
      { date: "Nov 5", accuracy: 75, sessions: 3 },
      { date: "Nov 12", accuracy: 77, sessions: 3 },
    ],
  },
];

export const sessions: Session[] = [
  { id: "se1", studentId: "s1", studentName: "Emma Rodriguez", activityTitle: "R Sound Story Cards", date: "Nov 13", duration: 20, accuracy: 74, cardsCompleted: 22, totalCards: 24 },
  { id: "se2", studentId: "s2", studentName: "Liam Park", activityTitle: "Bilingual Vocabulary: Animals", date: "Nov 14", duration: 15, accuracy: 63, cardsCompleted: 18, totalCards: 30 },
  { id: "se3", studentId: "s3", studentName: "Sofia Obi", activityTitle: "Pragmatic Language Social Scenarios", date: "Nov 12", duration: 25, accuracy: 82, cardsCompleted: 20, totalCards: 20 },
  { id: "se4", studentId: "s4", studentName: "Noah Kim", activityTitle: "S Blends Bingo", date: "Nov 11", duration: 18, accuracy: 54, cardsCompleted: 28, totalCards: 36 },
  { id: "se5", studentId: "s5", studentName: "Ava Thompson", activityTitle: "Early Words: My Family", date: "Nov 14", duration: 12, accuracy: 79, cardsCompleted: 10, totalCards: 12 },
  { id: "se6", studentId: "s1", studentName: "Emma Rodriguez", activityTitle: "R Sound Story Cards", date: "Nov 11", duration: 22, accuracy: 70, cardsCompleted: 24, totalCards: 24 },
];

export const weeklyProgress = [
  { day: "Mon", sessions: 3, accuracy: 72 },
  { day: "Tue", sessions: 4, accuracy: 75 },
  { day: "Wed", sessions: 2, accuracy: 68 },
  { day: "Thu", sessions: 5, accuracy: 80 },
  { day: "Fri", sessions: 3, accuracy: 77 },
  { day: "Sat", sessions: 1, accuracy: 82 },
  { day: "Sun", sessions: 0, accuracy: 0 },
];

export const categoryColors: Record<string, string> = {
  "Articulation": "#7C5CFC",
  "Language": "#14B8A6",
  "Vocabulary": "#F59E0B",
  "Social Skills": "#F43F5E",
  "Early Intervention": "#22C55E",
  "Phonological": "#3B82F6",
  "Fluency": "#8B5CF6",
  "Bilingual": "#EC4899",
};

export const categories = ["All", "Articulation", "Language", "Vocabulary", "Social Skills", "Early Intervention", "Phonological", "Fluency"];
export const ageRanges = ["All Ages", "2-4", "4-7", "5-10", "6-12", "8-14"];
export const languages = ["All Languages", "English", "Spanish", "Bilingual", "French"];
