import { CAT_TYPES, ACHIEVEMENTS, formatNum } from "@/game/types";
import type { GameState } from "@/game/types";

interface FarmTabProps {
  state: GameState;
  onCatClick: (e: React.MouseEvent) => void;
}

// Позиции котов на траве (% от ширины, % от высоты травяной зоны)
const CAT_POSITIONS = [
  { x: 50, y: 38, scale: 1.15, delay: "0s" },
  { x: 22, y: 62, scale: 0.90, delay: "0.4s" },
  { x: 76, y: 58, scale: 0.95, delay: "0.8s" },
  { x: 12, y: 42, scale: 0.80, delay: "1.2s" },
  { x: 86, y: 70, scale: 0.75, delay: "0.6s" },
  { x: 38, y: 72, scale: 0.85, delay: "1.0s" },
  { x: 64, y: 44, scale: 0.88, delay: "0.3s" },
  { x: 56, y: 76, scale: 0.78, delay: "1.5s" },
];

export default function FarmTab({ state, onCatClick }: FarmTabProps) {
  const unlockedAch = state.achievements.length;

  // Все конкретные коты в виде плоского списка (каждый экземпляр отдельно, макс 8)
  const allCats: { typeId: string; emoji: string; name: string; }[] = [];
  state.cats.filter(c => c.count > 0).forEach(c => {
    const type = CAT_TYPES.find(t => t.id === c.typeId)!;
    for (let i = 0; i < c.count && allCats.length < 8; i++) {
      allCats.push({ typeId: c.typeId, emoji: type.emoji, name: type.name });
    }
  });

  return (
    <div className="animate-fade-in-up relative mx-0 my-0 px-[50px] py-[5px] bg-neutral-600 rounded-2xl" style={{ minHeight: "calc(100vh - 120px)" }}>

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

        {/* Деревья — дальний план */}
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
        <div className="absolute left-0 right-0" style={{ bottom: 0, height: "35%" }}>
          <div className="w-full h-full" style={{
            background: "linear-gradient(180deg, #2d6a4f 0%, #1b4332 60%, #0f2d1e 100%)"
          }} />
          {/* Травинки */}
          <div className="absolute top-0 left-0 right-0 flex justify-around px-1">
            {Array.from({ length: 32 }).map((_, i) => (
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

        {/* Деревья — передний план */}
        <div className="absolute left-0 right-0 flex items-end justify-between px-3" style={{ bottom: "33%" }}>
          <Tree scale={1.3} layer="front" />
          <Tree scale={1.5} layer="front" />
        </div>

      </div>

      {/* Коты на траве */}
      <div className="fixed left-0 right-0 pointer-events-none" style={{
        bottom: 80,
        height: "35%",
        zIndex: 2,
        maxWidth: 448,
        margin: "0 auto",
      }}>
        {allCats.map((cat, i) => {
          const pos = CAT_POSITIONS[i % CAT_POSITIONS.length];
          return (
            <div
              key={`${cat.typeId}-${i}`}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) scale(${pos.scale})`,
                animationDelay: pos.delay,
                fontSize: 36,
                lineHeight: 1,
                filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.6))",
                animation: `float ${2.5 + i * 0.3}s ease-in-out ${pos.delay} infinite`,
              }}
            >
              {cat.emoji}
            </div>
          );
        })}
      </div>

      {/* Кнопка-кот по центру (главный кот для клика) */}
      <div className="relative flex flex-col items-center pt-14 pb-4" style={{ zIndex: 3 }}>
        <button
          className="select-none cursor-pointer active:scale-95 transition-transform duration-100 animate-float pointer-events-auto"
          style={{ fontSize: 88, lineHeight: 1, filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.7))" }}
          onClick={onCatClick}
        >🐱</button>
        <div className="text-xs mt-3 tracking-wide font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>
          нажми — получи олимпик
        </div>
      </div>

      {/* Прогресс внизу */}
      <div className="relative px-4 pb-4" style={{ zIndex: 3, marginTop: 8 }}>
        <div className="rounded-2xl p-4 space-y-2" style={{
          background: "rgba(6,14,26,0.70)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(14px)",
        }}>
          <div className="flex justify-between text-xs">
            <span style={{ color: "rgba(255,255,255,0.40)" }}>Всего заработано</span>
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{formatNum(state.totalEarned)} ₒ</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "rgba(255,255,255,0.40)" }}>Достижений</span>
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{unlockedAch} / {ACHIEVEMENTS.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
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