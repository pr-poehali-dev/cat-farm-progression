import { CAT_TYPES, ACHIEVEMENTS, formatNum } from "@/game/types";
import type { GameState } from "@/game/types";

interface FarmTabProps {
  state: GameState;
  onCatClick: (e: React.MouseEvent) => void;
}

const CAT_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  earth:   { bg: "rgba(139, 195, 74, 0.12)",  border: "rgba(139, 195, 74, 0.35)",  glow: "#8BC34A" },
  fire:    { bg: "rgba(220, 38, 38, 0.14)",   border: "rgba(220, 38, 38, 0.45)",   glow: "#DC2626" },
  water:   { bg: "rgba(37, 99, 235, 0.14)",   border: "rgba(37, 99, 235, 0.45)",   glow: "#2563EB" },
  crystal: { bg: "rgba(20, 20, 20, 0.50)",    border: "rgba(90, 90, 90, 0.55)",    glow: "#9CA3AF" },
  moon:    { bg: "rgba(121, 134, 203, 0.12)", border: "rgba(121, 134, 203, 0.35)", glow: "#7986CB" },
};

export default function FarmTab({ state, onCatClick }: FarmTabProps) {
  const unlockedAch = state.achievements.length;

  return (
    <div className="animate-fade-in-up">

      {/* Природный фон — герой */}
      <div className="relative overflow-hidden" style={{ height: 260 }}>

        {/* Небо */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #0d1b2e 0%, #1a3a5c 45%, #2d6a4f 45%, #40916c 100%)"
        }} />

        {/* Звёзды */}
        {[
          [12,8],[28,5],[45,12],[60,4],[75,9],[88,6],
          [20,18],[55,15],[82,20],[38,3],[67,14],
        ].map(([x, y], i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left: `${x}%`, top: `${y}%`,
              width: i % 3 === 0 ? 2 : 1.5,
              height: i % 3 === 0 ? 2 : 1.5,
              background: "white",
              opacity: 0.6 + (i % 3) * 0.15,
            }}
          />
        ))}

        {/* Луна */}
        <div className="absolute" style={{ right: "12%", top: "8%", width: 32, height: 32 }}>
          <div className="w-full h-full rounded-full" style={{
            background: "radial-gradient(circle at 35% 35%, #f5f0d8, #c8b97a)",
            boxShadow: "0 0 18px 6px rgba(200,185,120,0.3)"
          }} />
        </div>

        {/* Облака */}
        <div className="absolute" style={{ left: "5%", top: "14%", opacity: 0.18 }}>
          <Cloud />
        </div>
        <div className="absolute" style={{ left: "55%", top: "8%", opacity: 0.13, transform: "scale(0.7)" }}>
          <Cloud />
        </div>

        {/* Деревья — задний план */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-2" style={{ bottom: 48 }}>
          {[0.6, 0.85, 0.55, 0.9, 0.65, 0.8, 0.5].map((scale, i) => (
            <Tree key={i} scale={scale} dark />
          ))}
        </div>

        {/* Трава — полоса */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 52 }}>
          <div className="w-full h-full" style={{
            background: "linear-gradient(180deg, #2d6a4f 0%, #1b4332 100%)"
          }} />
          {/* Травинки */}
          <div className="absolute top-0 left-0 right-0 flex justify-around px-1">
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i} style={{
                width: 3,
                height: 10 + (i % 4) * 4,
                background: "#52b788",
                borderRadius: "2px 2px 0 0",
                transform: `rotate(${(i % 5 - 2) * 8}deg)`,
                transformOrigin: "bottom center",
                opacity: 0.8,
              }} />
            ))}
          </div>
        </div>

        {/* Деревья — передний план */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4" style={{ bottom: 44 }}>
          <Tree scale={1} dark={false} />
          <Tree scale={1.1} dark={false} />
        </div>

        {/* Кот-кнопка поверх пейзажа */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: 20 }}>
          <button
            className="select-none cursor-pointer active:scale-95 transition-transform duration-100 animate-float"
            style={{ fontSize: 72, lineHeight: 1, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}
            onClick={onCatClick}
          >🐱</button>
          <div className="text-xs mt-3 tracking-wide font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
            нажми — получи олимпик
          </div>
        </div>
      </div>

      {/* Карточки котов */}
      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3 px-1">Твои коты</div>
          <div className="grid grid-cols-2 gap-3">
            {state.cats.filter(c => c.count > 0).map(c => {
              const type = CAT_TYPES.find(t => t.id === c.typeId)!;
              const colors = CAT_COLORS[c.typeId] ?? CAT_COLORS.earth;
              return (
                <div
                  key={c.typeId}
                  className="cat-card rounded-2xl p-4 transition-all"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    boxShadow: `0 2px 16px ${colors.glow}18`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{type.emoji}</span>
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-semibold"
                      style={{ background: `${colors.glow}22`, color: colors.glow }}
                    >×{c.count}</span>
                  </div>
                  <div className="font-semibold text-sm">{type.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: colors.glow, opacity: 0.8 }}>
                    {formatNum(type.income * c.count)}/сек
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Прогресс */}
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
    </div>
  );
}

// ─── Дерево ───────────────────────────────────────────────────────────────────

function Tree({ scale, dark }: { scale: number; dark: boolean }) {
  const trunkH = 18 * scale;
  const crownW = 38 * scale;
  const crownH = 52 * scale;
  const color = dark ? "#1b4332" : "#2d6a4f";
  const colorLight = dark ? "#2d6a4f" : "#40916c";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: crownW,
        height: crownH,
        borderRadius: "50% 50% 40% 40%",
        background: `radial-gradient(ellipse at 40% 30%, ${colorLight}, ${color})`,
        marginBottom: -2,
      }} />
      <div style={{
        width: 7 * scale,
        height: trunkH,
        background: dark ? "#1a3a2a" : "#245032",
        borderRadius: 3,
      }} />
    </div>
  );
}

// ─── Облако ───────────────────────────────────────────────────────────────────

function Cloud() {
  return (
    <div style={{ position: "relative", width: 80, height: 30 }}>
      <div style={{
        position: "absolute", bottom: 0, left: 10,
        width: 60, height: 20, borderRadius: 10,
        background: "white",
      }} />
      <div style={{
        position: "absolute", bottom: 10, left: 20,
        width: 36, height: 26, borderRadius: "50%",
        background: "white",
      }} />
      <div style={{
        position: "absolute", bottom: 8, left: 40,
        width: 28, height: 22, borderRadius: "50%",
        background: "white",
      }} />
    </div>
  );
}