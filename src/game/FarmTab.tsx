import { CAT_TYPES, ACHIEVEMENTS, formatNum } from "@/game/types";
import type { GameState } from "@/game/types";

interface FarmTabProps {
  state: GameState;
  onCatClick: (e: React.MouseEvent) => void;
}

export default function FarmTab({ state, onCatClick }: FarmTabProps) {
  const unlockedAch = state.achievements.length;
  const totalCats = state.cats.reduce((a, c) => a + c.count, 0);

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      <div className="flex flex-col items-center py-8">
        <button
          className="text-8xl animate-float select-none cursor-pointer active:scale-95 transition-transform duration-100 animate-pulse-gold rounded-full p-2"
          onClick={onCatClick}
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
  );
}
