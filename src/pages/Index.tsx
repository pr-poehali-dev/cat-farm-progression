import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Типы ────────────────────────────────────────────────────────────────────

interface CatType {
  id: string;
  name: string;
  emoji: string;
  income: number;
  color: string;
  description: string;
}

interface OwnedCat {
  typeId: string;
  count: number;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  condition: (state: GameState) => boolean;
}

interface GameState {
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

// ─── Константы ───────────────────────────────────────────────────────────────

const CAT_TYPES: CatType[] = [
  { id: "earth",   name: "Земной",   emoji: "🐱", income: 10,  color: "#8BC34A", description: "10 олимпиков/сек" },
  { id: "fire",    name: "Огненный", emoji: "😾", income: 75,  color: "#FF7043", description: "75 олимпиков/сек" },
  { id: "water",   name: "Водяной",  emoji: "🙀", income: 110, color: "#29B6F6", description: "110 олимпиков/сек" },
  { id: "crystal", name: "Крепной",  emoji: "😸", income: 200, color: "#AB47BC", description: "200 олимпиков/сек" },
  { id: "moon",    name: "Лунный",   emoji: "😻", income: 500, color: "#7986CB", description: "500 олимпиков/сек" },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_cat",   title: "Первый котик",      icon: "🐱", desc: "Заведи первого кота",          condition: (s) => s.cats.reduce((a, c) => a + c.count, 0) >= 1 },
  { id: "fire_cat",    title: "Огненный старт",    icon: "🔥", desc: "Купи огненного кота",          condition: (s) => !!s.cats.find(c => c.typeId === "fire" && c.count > 0) },
  { id: "water_cat",   title: "Морской волк",      icon: "🌊", desc: "Купи водяного кота",           condition: (s) => !!s.cats.find(c => c.typeId === "water" && c.count > 0) },
  { id: "crystal_cat", title: "Сплав стихий",      icon: "💎", desc: "Создай крепного кота",         condition: (s) => !!s.cats.find(c => c.typeId === "crystal" && c.count > 0) },
  { id: "moon_cat",    title: "Лунная экспедиция", icon: "🌕", desc: "Купи лунного кота",            condition: (s) => !!s.cats.find(c => c.typeId === "moon" && c.count > 0) },
  { id: "rich_1k",     title: "Тысячник",          icon: "💰", desc: "Заработай 1,000 олимпиков",    condition: (s) => s.totalEarned >= 1000 },
  { id: "rich_100k",   title: "Стотысячник",       icon: "💎", desc: "Заработай 100,000 олимпиков",  condition: (s) => s.totalEarned >= 100000 },
  { id: "rich_1m",     title: "Миллионер",         icon: "👑", desc: "Заработай 1,000,000 олимпиков",condition: (s) => s.totalEarned >= 1000000 },
  { id: "cats_10",     title: "Маленькая ферма",   icon: "🏠", desc: "Собери 10 котов",              condition: (s) => s.cats.reduce((a, c) => a + c.count, 0) >= 10 },
  { id: "moon_trip",   title: "К звёздам!",        icon: "🚀", desc: "Слетай на Луну",               condition: (s) => s.moonVisited },
];

const MOCK_LEADERBOARD = [
  { name: "KittyKing",   score: 4850000, cats: 47, emoji: "😻" },
  { name: "CatFarmer",   score: 2100000, cats: 31, emoji: "😸" },
  { name: "MeowMaster",  score: 980000,  cats: 22, emoji: "🐱" },
  { name: "PurrPrince",  score: 450000,  cats: 15, emoji: "😾" },
  { name: "CatLord99",   score: 210000,  cats: 9,  emoji: "🙀" },
];

const STORAGE_KEY = "manycats_save";

const defaultState = (): GameState => ({
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

const formatNum = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "М";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "К";
  return Math.floor(n).toString();
};

const getIncome = (cats: OwnedCat[]): number =>
  cats.reduce((sum, c) => {
    const type = CAT_TYPES.find(t => t.id === c.typeId);
    return sum + (type ? type.income * c.count : 0);
  }, 0);

const getCatCount = (cats: OwnedCat[], typeId: string): number =>
  cats.find(c => c.typeId === typeId)?.count ?? 0;

// ─── Главный компонент ───────────────────────────────────────────────────────

type Tab = "farm" | "shop" | "achievements" | "rating" | "settings";

export default function Index() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as GameState;
    } catch {}
    return defaultState();
  });

  const [tab, setTab] = useState<Tab>("farm");
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showOffline, setShowOffline] = useState<number | null>(null);
  const [nameEdit, setNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState(state.playerName);
  const coinIdRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as GameState;
      const elapsed = Math.floor((Date.now() - parsed.lastSeen) / 1000);
      if (elapsed > 5) {
        const income = getIncome(parsed.cats);
        const offline = Math.floor(elapsed * income);
        if (offline > 0) {
          setShowOffline(offline);
          setState(prev => ({
            ...prev,
            olympics: prev.olympics + offline,
            totalEarned: prev.totalEarned + offline,
            lastSeen: Date.now(),
          }));
        }
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const income = getIncome(prev.cats);
        const gained = income / 10;
        return {
          ...prev,
          olympics: prev.olympics + gained,
          totalEarned: prev.totalEarned + gained,
          lastSeen: Date.now(),
          totalSeconds: prev.totalSeconds + 0.1,
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setState(prev => {
      const newAch = ACHIEVEMENTS
        .filter(a => !prev.achievements.includes(a.id) && a.condition(prev))
        .map(a => a.id);
      if (newAch.length === 0) return prev;
      return { ...prev, achievements: [...prev.achievements, ...newAch] };
    });
  }, [state.olympics, state.cats, state.moonVisited, state.totalEarned]);

  useEffect(() => {
    const save = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(save);
  }, [state]);

  const spawnCoin = useCallback((e: React.MouseEvent) => {
    const id = coinIdRef.current++;
    const x = e.clientX;
    const y = e.clientY;
    setCoins(prev => [...prev, { id, x, y }]);
    setTimeout(() => setCoins(prev => prev.filter(c => c.id !== id)), 800);
    setState(prev => ({
      ...prev,
      olympics: prev.olympics + 1,
      totalEarned: prev.totalEarned + 1,
    }));
  }, []);

  const buyCat = (typeId: string, cost: number) => {
    if (state.olympics < cost) return;
    setState(prev => {
      const cats = [...prev.cats];
      const existing = cats.find(c => c.typeId === typeId);
      if (existing) existing.count++;
      else cats.push({ typeId, count: 1 });
      return { ...prev, olympics: prev.olympics - cost, cats };
    });
  };

  const mergeCats = () => {
    const fire = getCatCount(state.cats, "fire");
    const water = getCatCount(state.cats, "water");
    if (fire < 1 || water < 1) return;
    setState(prev => {
      const cats = prev.cats
        .map(c => {
          if (c.typeId === "fire") return { ...c, count: c.count - 1 };
          if (c.typeId === "water") return { ...c, count: c.count - 1 };
          return c;
        })
        .filter(c => c.count > 0);
      const crystal = cats.find(c => c.typeId === "crystal");
      if (crystal) crystal.count++;
      else cats.push({ typeId: "crystal", count: 1 });
      return { ...prev, cats };
    });
  };

  const buyRocket = () => {
    if (state.olympics < 10000) return;
    setState(prev => ({ ...prev, olympics: prev.olympics - 10000, rocketUnlocked: true }));
  };

  const buyMoonEgg = () => {
    if (!state.rocketUnlocked || state.olympics < 15000) return;
    setState(prev => {
      const cats = [...prev.cats];
      const moon = cats.find(c => c.typeId === "moon");
      if (moon) moon.count++;
      else cats.push({ typeId: "moon", count: 1 });
      return { ...prev, olympics: prev.olympics - 15000, cats, moonVisited: true };
    });
  };

  const income = getIncome(state.cats);
  const totalCats = state.cats.reduce((a, c) => a + c.count, 0);
  const unlockedAch = state.achievements.length;

  const playerEntry = { name: state.playerName, score: Math.floor(state.totalEarned), cats: totalCats, emoji: "😺" };
  const leaderboard = [...MOCK_LEADERBOARD, playerEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "farm",         icon: "Home",       label: "Ферма" },
    { id: "shop",         icon: "ShoppingBag",label: "Магазин" },
    { id: "achievements", icon: "Trophy",     label: "Успехи" },
    { id: "rating",       icon: "BarChart2",  label: "Рейтинг" },
    { id: "settings",     icon: "Settings",   label: "Настройки" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">

      {coins.map(c => (
        <div key={c.id} className="coin-pop" style={{ left: c.x - 10, top: c.y - 20 }}>+1</div>
      ))}

      {showOffline !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowOffline(null)}>
          <div className="bg-card border border-border rounded-2xl p-8 text-center animate-scale-in mx-4 max-w-sm w-full">
            <div className="text-5xl mb-4">😴</div>
            <div className="text-muted-foreground text-sm mb-2">Пока тебя не было</div>
            <div className="gold-text text-3xl font-black mb-1">+{formatNum(showOffline)}</div>
            <div className="text-muted-foreground text-sm mb-6">олимпиков заработали твои коты</div>
            <button className="btn-gold rounded-xl px-8 py-3 text-sm w-full" onClick={() => setShowOffline(null)}>
              Забрать
            </button>
          </div>
        </div>
      )}

      {/* Шапка */}
      <div className="glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Many Cats</div>
          <div className="gold-text text-xl font-black leading-none mt-0.5">⚡ {formatNum(state.olympics)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{formatNum(income)}<span className="text-xs text-muted-foreground font-normal">/сек</span></div>
          <div className="text-xs text-muted-foreground">{totalCats} котов</div>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ФЕРМА */}
        {tab === "farm" && (
          <div className="p-4 space-y-4 animate-fade-in-up">
            <div className="flex flex-col items-center py-8">
              <button
                className="text-8xl animate-float select-none cursor-pointer active:scale-95 transition-transform duration-100 animate-pulse-gold rounded-full p-2"
                onClick={spawnCoin}
              >🐱</button>
              <div className="text-muted-foreground text-xs mt-4 tracking-wide">нажми — получи олимпик</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3 px-1">Твои коты</div>
              <div className="grid grid-cols-2 gap-3">
                {state.cats.filter(c => c.count > 0).map(c => {
                  const type = CAT_TYPES.find(t => t.id === c.typeId)!;
                  return (
                    <div key={c.typeId} className="cat-card bg-card border border-border rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{type.emoji}</span>
                        <span className="text-xs bg-secondary rounded-full px-2 py-0.5 font-semibold">×{c.count}</span>
                      </div>
                      <div className="font-semibold text-sm">{type.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatNum(type.income * c.count)}/сек
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Всего заработано</span>
                <span className="font-semibold">{formatNum(state.totalEarned)} ₒ</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Достижений</span>
                <span className="font-semibold">{unlockedAch} / {ACHIEVEMENTS.length}</span>
              </div>
              <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="progress-bar h-full" style={{ width: `${(unlockedAch / ACHIEVEMENTS.length) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* МАГАЗИН */}
        {tab === "shop" && (
          <div className="p-4 space-y-4 animate-fade-in-up">
            <div className="text-xs text-muted-foreground uppercase tracking-widest px-1 mb-1">Яйца котов</div>

            <ShopItem
              emoji="😾" name="Огненный кот" income={75}
              price={1000} balance={state.olympics}
              count={getCatCount(state.cats, "fire")}
              onBuy={() => buyCat("fire", 1000)}
              tag="Огненное яйцо 🥚"
            />
            <ShopItem
              emoji="🙀" name="Водяной кот" income={110}
              price={2500} balance={state.olympics}
              count={getCatCount(state.cats, "water")}
              onBuy={() => buyCat("water", 2500)}
              tag="Водяное яйцо 🥚"
            />

            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Слияние стихий</div>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-4xl">😸</span>
                <div>
                  <div className="font-semibold text-sm">Крепной кот</div>
                  <div className="text-xs text-muted-foreground mt-0.5">200 олимпиков/сек</div>
                  <div className="text-xs mt-1 opacity-70">требует: 😾 огненный + 🙀 водяной</div>
                </div>
                {getCatCount(state.cats, "crystal") > 0 && (
                  <span className="ml-auto text-xs bg-secondary rounded-full px-2 py-0.5 font-semibold">×{getCatCount(state.cats, "crystal")}</span>
                )}
              </div>
              <button
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  getCatCount(state.cats, "fire") >= 1 && getCatCount(state.cats, "water") >= 1
                    ? "btn-gold" : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
                onClick={mergeCats}
                disabled={getCatCount(state.cats, "fire") < 1 || getCatCount(state.cats, "water") < 1}
              >
                {getCatCount(state.cats, "fire") >= 1 && getCatCount(state.cats, "water") >= 1
                  ? "Объединить" : "Нужен огненный + водяной"}
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Космос 🌌</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Полёт на Луну</div>
                  <div className="text-xs text-muted-foreground">Открывает лунный магазин</div>
                </div>
                <button
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                    state.rocketUnlocked ? "bg-secondary text-muted-foreground"
                    : state.olympics >= 10000 ? "btn-gold" : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                  onClick={buyRocket}
                  disabled={state.rocketUnlocked || state.olympics < 10000}
                >
                  {state.rocketUnlocked ? "Куплено ✓" : "10 000 ₒ"}
                </button>
              </div>
              {state.rocketUnlocked && (
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <span className="text-3xl">😻</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Лунный кот</div>
                    <div className="text-xs text-muted-foreground">500 олимпиков/сек</div>
                  </div>
                  <button
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                      state.olympics >= 15000 ? "btn-gold" : "bg-secondary text-muted-foreground cursor-not-allowed"
                    }`}
                    onClick={buyMoonEgg}
                    disabled={state.olympics < 15000}
                  >
                    15 000 ₒ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ДОСТИЖЕНИЯ */}
        {tab === "achievements" && (
          <div className="p-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Достижения</div>
              <div className="text-xs text-muted-foreground">{unlockedAch}/{ACHIEVEMENTS.length}</div>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-5">
              <div className="progress-bar h-full" style={{ width: `${(unlockedAch / ACHIEVEMENTS.length) * 100}%` }} />
            </div>
            <div className="space-y-2">
              {ACHIEVEMENTS.map(a => {
                const done = state.achievements.includes(a.id);
                return (
                  <div key={a.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    done ? "bg-card border-border" : "bg-muted border-transparent opacity-40"
                  }`}>
                    <span className="text-2xl">{a.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                    </div>
                    {done && <span className="text-green-400 text-sm">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* РЕЙТИНГ */}
        {tab === "rating" && (
          <div className="p-4 animate-fade-in-up">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4 px-1">Таблица лидеров</div>
            <div className="space-y-2">
              {leaderboard.map((p, i) => {
                const isMe = p.name === state.playerName;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    isMe ? "border-yellow-500/40 bg-yellow-500/5" : "bg-card border-border"
                  }`}>
                    <span className="text-base w-6 text-center">{medals[i] ?? `${i + 1}`}</span>
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${isMe ? "text-yellow-400" : ""}`}>
                        {p.name} {isMe && <span className="text-xs text-muted-foreground font-normal">(ты)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.cats} котов</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-bold text-sm ${isMe ? "text-yellow-400" : ""}`}>{formatNum(p.score)}</div>
                      <div className="text-xs text-muted-foreground">ₒ</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-xl text-xs text-muted-foreground text-center">
              Рейтинг обновляется по мере игры
            </div>
          </div>
        )}

        {/* НАСТРОЙКИ */}
        {tab === "settings" && (
          <div className="p-4 space-y-4 animate-fade-in-up">
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Имя игрока</div>
              {nameEdit ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none border border-border focus:border-yellow-500/50 text-foreground"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={20}
                    autoFocus
                  />
                  <button className="btn-gold rounded-xl px-4 py-2 text-sm" onClick={() => {
                    setState(prev => ({ ...prev, playerName: nameInput.trim() || prev.playerName }));
                    setNameEdit(false);
                  }}>Ок</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{state.playerName}</span>
                  <button className="btn-ghost rounded-xl px-3 py-1.5 text-xs" onClick={() => setNameEdit(true)}>
                    Изменить
                  </button>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Статистика</div>
              <StatRow label="Всего заработано" value={`${formatNum(state.totalEarned)} ₒ`} />
              <StatRow label="Доход в секунду" value={`${formatNum(income)} ₒ/сек`} />
              <StatRow label="Котов всего" value={`${totalCats}`} />
              <StatRow label="Достижений" value={`${unlockedAch}/${ACHIEVEMENTS.length}`} />
            </div>

            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Управление</div>
              <button
                className="w-full bg-destructive/20 text-destructive hover:bg-destructive/30 rounded-xl py-2.5 text-sm font-semibold transition-all"
                onClick={() => {
                  if (window.confirm("Сбросить весь прогресс?")) {
                    localStorage.removeItem(STORAGE_KEY);
                    setState(defaultState());
                    setTab("farm");
                  }
                }}
              >
                Сбросить прогресс
              </button>
            </div>

            <div className="text-center text-xs text-muted-foreground py-2">
              Many Cats v1.0 · Скоро: новые планеты и измерения 🚀
            </div>
          </div>
        )}
      </div>

      {/* Навигация */}
      <div className="glass fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-border px-2 py-2 z-40">
        <div className="flex justify-around">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                tab === t.id ? "text-yellow-400" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} size={20} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Суб-компоненты ───────────────────────────────────────────────────────────

function ShopItem({ emoji, name, income, price, balance, count, onBuy, tag }: {
  emoji: string; name: string; income: number; price: number; balance: number;
  count: number; onBuy: () => void; tag: string;
}) {
  const canBuy = balance >= price;
  return (
    <div className="cat-card bg-card border border-border rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{emoji}</span>
          <div>
            <div className="font-semibold text-sm">{name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{income} олимпиков/сек</div>
            <div className="text-xs mt-1 opacity-60">{tag}</div>
          </div>
        </div>
        {count > 0 && (
          <span className="text-xs bg-secondary rounded-full px-2 py-0.5 font-semibold">×{count}</span>
        )}
      </div>
      <button
        className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
          canBuy ? "btn-gold" : "bg-secondary text-muted-foreground cursor-not-allowed"
        }`}
        onClick={onBuy}
        disabled={!canBuy}
      >
        {canBuy ? `Купить — ${formatNum(price)} ₒ` : `Нужно ${formatNum(price)} ₒ`}
      </button>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
