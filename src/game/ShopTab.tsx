import { getCatCount, formatNum } from "@/game/types";
import type { GameState } from "@/game/types";

interface ShopTabProps {
  state: GameState;
  onBuyCat: (typeId: string, cost: number) => void;
  onMergeCats: () => void;
  onBuyRocket: () => void;
  onBuyMoonEgg: () => void;
}

export default function ShopTab({ state, onBuyCat, onMergeCats, onBuyRocket, onBuyMoonEgg }: ShopTabProps) {
  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      <div className="text-xs text-muted-foreground uppercase tracking-widest px-1 mb-1">Яйца котов</div>

      <ShopItem
        emoji="😾" name="Огненный кот" income={75}
        price={1000} balance={state.olympics}
        count={getCatCount(state.cats, "fire")}
        onBuy={() => onBuyCat("fire", 1000)}
        tag="Огненное яйцо 🥚"
      />
      <ShopItem
        emoji="🙀" name="Водяной кот" income={110}
        price={2500} balance={state.olympics}
        count={getCatCount(state.cats, "water")}
        onBuy={() => onBuyCat("water", 2500)}
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
            <span className="ml-auto text-xs bg-secondary rounded-full px-2 py-0.5 font-semibold">
              ×{getCatCount(state.cats, "crystal")}
            </span>
          )}
        </div>
        <button
          className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
            getCatCount(state.cats, "fire") >= 1 && getCatCount(state.cats, "water") >= 1
              ? "btn-gold" : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
          onClick={onMergeCats}
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
            onClick={onBuyRocket}
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
              onClick={onBuyMoonEgg}
              disabled={state.olympics < 15000}
            >
              15 000 ₒ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ShopItem ─────────────────────────────────────────────────────────────────

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
