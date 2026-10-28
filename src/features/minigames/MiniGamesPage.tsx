import { useState } from 'react';
import { Link } from 'react-router';
import { MEMORY_TOPICS, QUICK_TOPICS } from '../../engine/questions/games';
import { useProfile } from '../../engine/progress/store';
import { Stars } from '../../ui/bits';
import { sfx } from '../../ui/sound';
import { GAMES, type GameInfo } from './catalog';

/** Khu trò chơi: chọn trò và chủ đề. Mỗi lượt 1–3 phút, không có thua cuộc. */
export function MiniGamesPage() {
  const profile = useProfile();
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-primary">🎮 Trò chơi</h1>
        <p className="text-lg font-semibold opacity-80">Chơi mà học: mỗi lượt vài phút, chơi xong được cà rốt!</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} best={profile?.games?.[g.id]?.best ?? 0} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game, best }: { game: GameInfo; best: number }) {
  const topics = game.topics === 'quick' ? QUICK_TOPICS : game.topics === 'memory' ? MEMORY_TOPICS : [];
  const [topic, setTopic] = useState<string>(topics[0]?.id ?? '');
  return (
    <section className={`sticker p-4 flex flex-col gap-3 ${game.color}`}>
      <div className="flex items-center gap-3">
        <span className="text-6xl">{game.emoji}</span>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-extrabold leading-tight">{game.name}</h2>
          <p className="font-semibold opacity-80">{game.desc}</p>
        </div>
        <Stars count={best} size="text-xl" />
      </div>
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chọn chủ đề">
          {topics.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={topic === t.id}
              onClick={() => setTopic(t.id)}
              className={`btn btn-sm h-auto min-h-11 py-1 rounded-full ${topic === t.id ? 'btn-primary' : 'bg-base-100 border-2 border-base-300'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
      <Link to={`/tro-choi/${game.id}${topic ? `?chu-de=${topic}` : ''}`} onClick={() => sfx.tap()} className="btn btn-primary btn-lg rounded-full self-center px-10 text-2xl">
        Chơi ▶
      </Link>
    </section>
  );
}
