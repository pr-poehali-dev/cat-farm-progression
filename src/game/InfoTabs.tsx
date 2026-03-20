import { useState } from "react";
import { ACHIEVEMENTS, MOCK_LEADERBOARD, formatNum, getIncome } from "@/game/types";
import type { GameState } from "@/game/types";

// ─── AchievementsTab ─────────────────────────────────────────────────────────

interface AchievementsTabProps {
  state: GameState;
}

export function AchievementsTab({ state }: AchievementsTabProps) {
  const unlockedAch = state.achievements.length;
  return (
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
  );
}

// ─── RatingTab ───────────────────────────────────────────────────────────────

interface RatingTabProps {
  state: GameState;
}

export function RatingTab({ state }: RatingTabProps) {
  const totalCats = state.cats.reduce((a, c) => a + c.count, 0);
  const playerEntry = { name: state.playerName, score: Math.floor(state.totalEarned), cats: totalCats, emoji: "😺" };
  const leaderboard = [...MOCK_LEADERBOARD, playerEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
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
  );
}

// ─── SettingsTab ─────────────────────────────────────────────────────────────

interface SettingsTabProps {
  state: GameState;
  onRename: (name: string) => void;
  onReset: () => void;
}

export function SettingsTab({ state, onRename, onReset }: SettingsTabProps) {
  const [nameEdit, setNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState(state.playerName);

  const income = getIncome(state.cats);
  const totalCats = state.cats.reduce((a, c) => a + c.count, 0);
  const unlockedAch = state.achievements.length;

  return (
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
              onRename(nameInput.trim() || state.playerName);
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
          onClick={onReset}
        >
          Сбросить прогресс
        </button>
      </div>

      <div className="text-center text-xs text-muted-foreground py-2">
        Many Cats v1.0 · Скоро: новые планеты и измерения 🚀
      </div>
    </div>
  );
}

// ─── StatRow ─────────────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
