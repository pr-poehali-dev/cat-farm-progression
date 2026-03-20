import { CAT_TYPES, ACHIEVEMENTS, formatNum } from "@/game/types";
import type { GameState } from "@/game/types";

interface FarmTabProps {
  state: GameState;
  onCatClick: (e: React.MouseEvent) => void;
}

const CAT_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  earth:   { bg: "rgba(139, 195, 74, 0.15)",  border: "rgba(139, 195, 74, 0.40)",  glow: "#8BC34A" },
  fire:    { bg: "rgba(220, 38, 38, 0.18)",   border: "rgba(220, 38, 38, 0.50)",   glow: "#DC2626" },
  water:   { bg: "rgba(37, 99, 235, 0.18)",   border: "rgba(37, 99, 235, 0.50)",   glow: "#2563EB" },
  crystal: { bg: "rgba(20, 20, 20, 0.60)",    border: "rgba(90, 90, 90, 0.60)",    glow: "#9CA3AF" },
  moon:    { bg: "rgba(121, 134, 203, 0.15)", border: "rgba(121, 134, 203, 0.40)", glow: "#7986CB" },
};

export default function FarmTab({ state, onCatClick }: FarmTabProps) {
  const unlockedAch = state.achievements.length;

  return (
    <div className="animate-fade-in-up relative" style={{ minHeight: "calc(100vh - 120px)" }}>

      {/* Природный фон — на весь экран */}
      <div className="fixed left-0 right-0 top-0 bottom-0 pointer-events-none" style={{ zIndex: 0 }}>

        {/* Небо */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #060e1a 0%, #0d1f3c 40%, #1a3a5c 65%, #2d6a4f 65%, #1b4332 100%)"
        }} />

        {/* Звёзды */}
        {[
          [8,4],[18,2],[30,7],[42,3],[54,5],[66,2],[78,6],[90,4],
          [14,12],[38,9],[62,11],[85,8],[24,16],[50,14],[74,17],
          [6,20],[34,19],[58,22],[82,18],[46,25],[70,23],
        ].map(([x, y], i) => (
          <div key={i} className="absolute rounded-full" style={{
            left: `${x}%`, top: `${y}%`,
            width: i % 4 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5,
            height: i % 4 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5,
            background: "white",
            opacity: 0.5 + (i % 4) * 0.12,
          }} />
        ))}

        {/* Луна */}
        <div className="absolute" style={{ right: "10%", top: "5%", width: 44, height: 44 }}>
          <div className="w-full h-full rounded-full" style={{
            background: "radial-gradient(circle at 35% 35%, #f8f4e0, #d4c47a)",
            boxShadow: "0 0 28px 10px rgba(200,185,120,0.25)"
          }} />
        </div>

        {/* Облака */}
        <div className="absolute" style={{ left: "4%", top: "10%", opacity: 0.15 }}>
          <Cloud scale={1.2} />
        </div>
        <div className="absolute" style={{ left: "50%", top: "6%", opacity: 0.10 }}>
          <Cloud scale={0.8} />
        </div>
        <div className="absolute" style={{ left: "72%", top: "14%", opacity: 0.08 }}>
          <Cloud scale={0.6} />
        </div>

        {/* Деревья — дальний план (мелкие, тёмные) */}
        <div className="absolute left-0 right-0 flex items-end justify-around px-1" style={{ bottom: "30%" }}>
          {[0.45, 0.60, 0.40, 0.70, 0.50, 0.65, 0.42, 0.58, 0.48].map((scale, i) => (
            <Tree key={i} scale={scale} layer="far" />
          ))}
        </div>

        {/* Деревья — средний план */}
        <div className="absolute left-0 right-0 flex items-end justify-around px-2" style={{ bottom: "22%" }}>
          {[0.70, 0.90, 0.75, 0.85, 0.72, 0.88].map((scale, i) => (
            <Tree key={i} scale={scale} layer="mid" />
          ))}
        </div>

        {/* Трава */}
        <div className="absolute left-0 right-0" style={{ bottom: 0, height: "24%" }}>
          <div className="w-full h-full" style={{
            background: "linear-gradient(180deg, #2d6a4f 0%, #1b4332 60%, #0f2d1e 100%)"
          }} />
          {/* Травинки */}
          <div className="absolute top-0 left-0 right-0 flex justify-around px-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{
                width: 2.5 + (i % 2),
                height: 12 + (i % 5) * 5,
                background: i % 3 === 0 ? "#52b788" : "#40916c",
                borderRadius: "2px 2px 0 0",
                transform: `rotate(${(i % 7 - 3) * 7}deg)`,
                transformOrigin: "bottom center",
                opacity: 0.75,
              }} />
            ))}
          </div>
        </div>

        {/* Деревья — передний план (крупные) */}
        <div className="absolute left-0 right-0 flex items-end justify-between px-3" style={{ bottom: "22%" }}>
          <Tree scale={1.3} layer="front" />
          <Tree scale={1.5} layer="front" />
        </div>

      </div>

      {/* Кот-кнопка — поверх пейзажа, по центру верхней части */}
      <div className="relative flex flex-col items-center pt-16 pb-4" style={{ zIndex: 1 }}>
        <button
          className="select-none cursor-pointer active:scale-95 transition-transform duration-100 animate-float"
          style={{ fontSize: 90, lineHeight: 1, filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.7))" }}
          onClick={onCatClick}
        >🐱</button>
        <div className="text-xs mt-4 tracking-wide font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>
          нажми — получи олимпик
        </div>
      </div>

      {/* Карточки котов — поверх пейзажа внизу */}
      <div className="relative px-4 space-y-4 pb-6" style={{ zIndex: 1, marginTop: "auto" }}>

        <div>
          <div className="text-xs uppercase tracking-widest mb-3 px-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            Твои коты
          </div>
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
                    boxShadow: `0 2px 20px ${colors.glow}20`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{type.emoji}</span>
                    <span className="text-xs rounded-full px-2 py-0.5 font-semibold"
                      style={{ background: `${colors.glow}28`, color: colors.glow }}>
                      ×{c.count}
                    </span>
                  </div>
                  <div className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>{type.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: colors.glow, opacity: 0.85 }}>
                    {formatNum(type.income * c.count)}/сек
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Прогресс */}
        <div className="rounded-2xl p-4 space-y-2.5" style={{
          background: "rgba(10,18,30,0.65)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}>
          <div className="flex justify-between text-xs">
            <span style={{ color: "rgba(255,255,255,0.45)" }}>Всего заработано</span>
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{formatNum(state.totalEarned)} ₒ</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "rgba(255,255,255,0.45)" }}>Достижений</span>
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{unlockedAch} / {ACHIEVEMENTS.length}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="progress-bar h-full" style={{ width: `${(unlockedAch / ACHIEVEMENTS.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Дерево ───────────────────────────────────────────────────────────────────

function Tree({ scale, layer }: { scale: number; layer: "far" | "mid" | "front" }) {
  const colors = {
    far:   { crown: "#1b4332", crownLight: "#2d5a3d", trunk: "#12291f" },
    mid:   { crown: "#2d6a4f", crownLight: "#40916c", trunk: "#1b4332" },
    front: { crown: "#40916c", crownLight: "#52b788", trunk: "#2d6a4f" },
  }[layer];

  const trunkH = 20 * scale;
  const crownW = 42 * scale;
  const crownH = 58 * scale;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: crownW, height: crownH,
        borderRadius: "50% 50% 38% 38%",
        background: `radial-gradient(ellipse at 38% 28%, ${colors.crownLight}, ${colors.crown})`,
        marginBottom: -2,
      }} />
      <div style={{
        width: 7 * scale, height: trunkH,
        background: colors.trunk,
        borderRadius: 3,
      }} />
    </div>
  );
}

// ─── Облако ───────────────────────────────────────────────────────────────────

function Cloud({ scale = 1 }: { scale?: number }) {
  const s = scale;
  return (
    <div style={{ position: "relative", width: 90 * s, height: 34 * s }}>
      <div style={{
        position: "absolute", bottom: 0, left: 10 * s,
        width: 70 * s, height: 22 * s, borderRadius: 12 * s,
        background: "white",
      }} />
      <div style={{
        position: "absolute", bottom: 12 * s, left: 18 * s,
        width: 40 * s, height: 30 * s, borderRadius: "50%",
        background: "white",
      }} />
      <div style={{
        position: "absolute", bottom: 10 * s, left: 44 * s,
        width: 32 * s, height: 26 * s, borderRadius: "50%",
        background: "white",
      }} />
    </div>
  );
}
