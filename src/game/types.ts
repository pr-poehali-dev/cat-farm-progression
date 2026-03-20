// ─── Интерфейсы ──────────────────────────────────────────────────────────────

export interface CatType {
  id: string;
  name: string;
  emoji: string;
  income: number;
  color: string;
  description: string;
}

export interface OwnedCat {
  typeId: string;
  count: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  condition: (state: GameState) => boolean;
}

export interface GameState {
  olympics: number;
  totalEarned: number;
  cats: OwnedCat[];
  lastSeen: number;
  rocketUnlocked: boolean;
  moonVisited: boolean;
  achievements: string[];
  playerName: string;
  totalSeconds: number;
}

export type Tab = "farm" | "shop" | "achievements" | "rating" | "settings";

// ─── Константы ───────────────────────────────────────────────────────────────

export const CAT_TYPES: CatType[] = [
  { id: "earth",   name: "Земной",   emoji: "🐱", income: 10,  color: "#8BC34A", description: "10 олимпиков/сек" },
  { id: "fire",    name: "Огненный", emoji: "😾", income: 75,  color: "#FF7043", description: "75 олимпиков/сек" },
  { id: "water",   name: "Водяной",  emoji: "🙀", income: 110, color: "#29B6F6", description: "110 олимпиков/сек" },
  { id: "crystal", name: "Крепной",  emoji: "😸", income: 200, color: "#AB47BC", description: "200 олимпиков/сек" },
  { id: "moon",    name: "Лунный",   emoji: "😻", income: 500, color: "#7986CB", description: "500 олимпиков/сек" },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_cat",   title: "Первый котик",      icon: "🐱", desc: "Заведи первого кота",           condition: (s) => s.cats.reduce((a, c) => a + c.count, 0) >= 1 },
  { id: "fire_cat",    title: "Огненный старт",    icon: "🔥", desc: "Купи огненного кота",           condition: (s) => !!s.cats.find(c => c.typeId === "fire" && c.count > 0) },
  { id: "water_cat",   title: "Морской волк",      icon: "🌊", desc: "Купи водяного кота",            condition: (s) => !!s.cats.find(c => c.typeId === "water" && c.count > 0) },
  { id: "crystal_cat", title: "Сплав стихий",      icon: "💎", desc: "Создай крепного кота",          condition: (s) => !!s.cats.find(c => c.typeId === "crystal" && c.count > 0) },
  { id: "moon_cat",    title: "Лунная экспедиция", icon: "🌕", desc: "Купи лунного кота",             condition: (s) => !!s.cats.find(c => c.typeId === "moon" && c.count > 0) },
  { id: "rich_1k",     title: "Тысячник",          icon: "💰", desc: "Заработай 1,000 олимпиков",     condition: (s) => s.totalEarned >= 1000 },
  { id: "rich_100k",   title: "Стотысячник",       icon: "💎", desc: "Заработай 100,000 олимпиков",   condition: (s) => s.totalEarned >= 100000 },
  { id: "rich_1m",     title: "Миллионер",         icon: "👑", desc: "Заработай 1,000,000 олимпиков", condition: (s) => s.totalEarned >= 1000000 },
  { id: "cats_10",     title: "Маленькая ферма",   icon: "🏠", desc: "Собери 10 котов",               condition: (s) => s.cats.reduce((a, c) => a + c.count, 0) >= 10 },
  { id: "moon_trip",   title: "К звёздам!",        icon: "🚀", desc: "Слетай на Луну",                condition: (s) => s.moonVisited },
];

export const MOCK_LEADERBOARD = [
  { name: "KittyKing",   score: 4850000, cats: 47, emoji: "😻" },
  { name: "CatFarmer",   score: 2100000, cats: 31, emoji: "😸" },
  { name: "MeowMaster",  score: 980000,  cats: 22, emoji: "🐱" },
  { name: "PurrPrince",  score: 450000,  cats: 15, emoji: "😾" },
  { name: "CatLord99",   score: 210000,  cats: 9,  emoji: "🙀" },
];

export const STORAGE_KEY = "manycats_save";

export const defaultState = (): GameState => ({
  olympics: 0,
  totalEarned: 0,
  cats: [{ typeId: "earth", count: 1 }],
  lastSeen: Date.now(),
  rocketUnlocked: false,
  moonVisited: false,
  achievements: [],
  playerName: "Игрок",
  totalSeconds: 0,
});

// ─── Утилиты ─────────────────────────────────────────────────────────────────

export const formatNum = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "М";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "К";
  return Math.floor(n).toString();
};

export const getIncome = (cats: OwnedCat[]): number =>
  cats.reduce((sum, c) => {
    const type = CAT_TYPES.find(t => t.id === c.typeId);
    return sum + (type ? type.income * c.count : 0);
  }, 0);

export const getCatCount = (cats: OwnedCat[], typeId: string): number =>
  cats.find(c => c.typeId === typeId)?.count ?? 0;
