import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

import {
  ACHIEVEMENTS, STORAGE_KEY, defaultState,
  formatNum, getIncome, getCatCount,
} from "@/game/types";
import type { GameState, Tab } from "@/game/types";

import FarmTab from "@/game/FarmTab";
import ShopTab from "@/game/ShopTab";
import { AchievementsTab, RatingTab, SettingsTab } from "@/game/InfoTabs";

// ─── Константы навигации ─────────────────────────────────────────────────────

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "farm",         icon: "Home",        label: "Ферма" },
  { id: "shop",         icon: "ShoppingBag", label: "Магазин" },
  { id: "achievements", icon: "Trophy",      label: "Успехи" },
  { id: "rating",       icon: "BarChart2",   label: "Рейтинг" },
  { id: "settings",     icon: "Settings",    label: "Настройки" },
];

// ─── Главный компонент ───────────────────────────────────────────────────────

export default function Index() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as GameState;
    } catch { /* ignore */ }
    return defaultState();
  });

  const [tab, setTab] = useState<Tab>("farm");
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showOffline, setShowOffline] = useState<number | null>(null);
  const coinIdRef = useRef(0);

  // Офлайн-доход при загрузке
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

  // Тик дохода
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

  // Проверка достижений
  useEffect(() => {
    setState(prev => {
      const newAch = ACHIEVEMENTS
        .filter(a => !prev.achievements.includes(a.id) && a.condition(prev))
        .map(a => a.id);
      if (newAch.length === 0) return prev;
      return { ...prev, achievements: [...prev.achievements, ...newAch] };
    });
  }, [state.olympics, state.cats, state.moonVisited, state.totalEarned]);

  // Сохранение
  useEffect(() => {
    const save = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(save);
  }, [state]);

  // Клик по коту
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

  // Действия магазина
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

  // Настройки
  const handleRename = (name: string) => {
    setState(prev => ({ ...prev, playerName: name }));
  };

  const handleReset = () => {
    if (window.confirm("Сбросить весь прогресс?")) {
      localStorage.removeItem(STORAGE_KEY);
      setState(defaultState());
      setTab("farm");
    }
  };

  const income = getIncome(state.cats);
  const totalCats = state.cats.reduce((a, c) => a + c.count, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">

      {/* Coin pop эффекты */}
      {coins.map(c => (
        <div key={c.id} className="coin-pop" style={{ left: c.x - 10, top: c.y - 20 }}>+1</div>
      ))}

      {/* Офлайн модал */}
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
      <div className={tab === "farm" ? "flex-1" : "flex-1 overflow-y-auto pb-24"}>
        {tab === "farm" && (
          <FarmTab state={state} onCatClick={spawnCoin} />
        )}
        {tab === "shop" && (
          <ShopTab
            state={state}
            onBuyCat={buyCat}
            onMergeCats={mergeCats}
            onBuyRocket={buyRocket}
            onBuyMoonEgg={buyMoonEgg}
          />
        )}
        {tab === "achievements" && (
          <AchievementsTab state={state} />
        )}
        {tab === "rating" && (
          <RatingTab state={state} />
        )}
        {tab === "settings" && (
          <SettingsTab state={state} onRename={handleRename} onReset={handleReset} />
        )}
      </div>

      {/* Нижняя навигация */}
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