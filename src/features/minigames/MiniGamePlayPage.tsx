import type Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { carrotsFor, starsFor, type AnswerResult } from '../../engine/progress/mastery';
import { addCarrots, finishGame, recordAnswer } from '../../engine/progress/store';
import {
  bakeryRounds,
  isEvenShare,
  MEMORY_TOPICS,
  memoryDeck,
  QUICK_TOPICS,
  quickRound,
  type MemoryTopic,
  type QuickTopic,
} from '../../engine/questions/games';
import { randomSeed } from '../../engine/rng';
import { BongBayScene } from '../../games/bong-bay/BongBayScene';
import { EventBus } from '../../games/EventBus';
import { HungKeoScene } from '../../games/hung-keo/HungKeoScene';
import { LatTheScene } from '../../games/lat-the/LatTheScene';
import { PhaserGame } from '../../games/PhaserGame';
import { EV } from '../../games/protocol';
import { TiemBanhScene } from '../../games/tiem-banh/TiemBanhScene';
import { ReadAloudButton, Stars } from '../../ui/bits';
import { Bunny } from '../../ui/Bunny';
import { celebrate, praise, praiseAfterTry } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { stopSpeaking } from '../../ui/speech';
import { BAKERY_ROUNDS, GAME_BONUS, GAME_BY_ID, MEMORY_PAIRS, QUICK_COUNT, type GameId, type GameInfo } from './catalog';

const SCENES: Record<GameId, { key: string; scene: typeof Phaser.Scene }> = {
  'hung-keo': { key: HungKeoScene.KEY, scene: HungKeoScene },
  'bong-bay': { key: BongBayScene.KEY, scene: BongBayScene },
  'lat-the': { key: LatTheScene.KEY, scene: LatTheScene },
  'tiem-banh': { key: TiemBanhScene.KEY, scene: TiemBanhScene },
};

interface Summary {
  stars: number;
  carrots: number;
  line: string;
}

/** Trang chơi một mini-game (tải riêng cùng Phaser khi bé vào). */
export default function MiniGamePlayPage() {
  const { gameId = '' } = useParams();
  const [params] = useSearchParams();
  const [round, setRound] = useState(0);
  const game = GAME_BY_ID.get(gameId as GameId);
  if (!game) {
    return (
      <p className="text-center text-2xl">
        Không tìm thấy trò chơi. <Link to="/tro-choi" className="link">Về khu trò chơi</Link>
      </p>
    );
  }
  const topic = params.get('chu-de') ?? '';
  return <GameSession key={`${game.id}-${topic}-${round}`} game={game} topic={topic} onAgain={() => setRound((r) => r + 1)} />;
}

/**
 * Một lượt chơi. React giữ đề, chấm điểm và thưởng (skill vong-lap-hoc-va-thuong);
 * scene Phaser chỉ hiển thị và báo bé chọn gì qua EventBus.
 */
function GameSession({ game, topic, onAgain }: { game: GameInfo; topic: string; onAgain: () => void }) {
  const [progress, setProgress] = useState({ done: 0, total: game.topics === 'memory' ? MEMORY_PAIRS : game.topics === 'quick' ? QUICK_COUNT : BAKERY_ROUNDS });
  const [speakText, setSpeakText] = useState('');
  const [paused, setPaused] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let alive = true;
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(() => alive && fn(), ms));
    let carrots = 0;
    const give = (result: AnswerResult) => {
      const c = carrotsFor(result);
      carrots += c;
      void addCarrots(c);
    };
    const end = (stars: number, line: string) => {
      void finishGame(game.id, stars, GAME_BONUS);
      sfx.reward();
      celebrate(true);
      EventBus.emit(EV.end);
      setSummary({ stars, carrots: carrots + GAME_BONUS, line });
    };
    const handlers: [string, (payload: never) => void][] = [];
    const on = <T,>(event: string, fn: (payload: T) => void) => {
      EventBus.on(event, fn);
      handlers.push([event, fn as (payload: never) => void]);
    };

    if (game.topics === 'quick') {
      const qTopic = (QUICK_TOPICS.some((t) => t.id === topic) ? topic : QUICK_TOPICS[0].id) as QuickTopic;
      const questions = quickRound(qTopic, QUICK_COUNT, randomSeed());
      let index = 0;
      let wrong = 0;
      let firstTry = 0;
      let busy = false;
      const send = () => {
        const q = questions[index];
        EventBus.emit(EV.question, { prompt: q.prompt, choices: q.choices });
        setSpeakText(q.speak);
        setProgress({ done: index, total: questions.length });
      };
      on(EV.ready, send);
      on<{ value: number }>(EV.answer, ({ value }) => {
        if (busy) return;
        const q = questions[index];
        if (value !== q.answer) {
          wrong++;
          sfx.tryAgain();
          EventBus.emit(EV.feedback, { correct: false, message: game.id === 'hung-keo' ? 'Chưa đúng, hứng viên khác nhé!' : 'Chưa đúng, chọn quả khác nhé!' });
          return;
        }
        busy = true;
        const result: AnswerResult = wrong === 0 ? 'first' : 'hint';
        if (result === 'first') firstTry++;
        void recordAnswer(q.skillId, result, 'practice');
        give(result);
        sfx.correct();
        EventBus.emit(EV.feedback, { correct: true, message: result === 'first' ? praise() : praiseAfterTry() });
        later(1100, () => {
          index++;
          wrong = 0;
          busy = false;
          if (index < questions.length) send();
          else {
            setProgress({ done: questions.length, total: questions.length });
            end(starsFor(firstTry, questions.length), `Đúng ngay lần đầu ${firstTry}/${questions.length} câu`);
          }
        });
      });
    } else if (game.topics === 'memory') {
      const mTopic = (MEMORY_TOPICS.some((t) => t.id === topic) ? topic : MEMORY_TOPICS[0].id) as MemoryTopic;
      const deck = memoryDeck(mTopic, MEMORY_PAIRS, randomSeed());
      const title = mTopic === 'dong-ho' ? 'Ghép đồng hồ với giờ đúng' : mTopic === 'nhan' ? 'Ghép phép nhân với kết quả' : 'Ghép phép chia với kết quả';
      let matched = 0;
      let misses = 0;
      on(EV.ready, () => {
        EventBus.emit(EV.deck, { title, cards: deck.map(({ id, face }) => ({ id, face })) });
        setSpeakText(`${title}. Lật hai thẻ để tìm một cặp.`);
      });
      on<{ a: number; b: number }>(EV.pick, ({ a, b }) => {
        const match = deck[a].pair === deck[b].pair;
        EventBus.emit(EV.pairResult, { a, b, match });
        if (!match) {
          misses++;
          return;
        }
        matched++;
        give('hint');
        sfx.correct();
        setProgress({ done: matched, total: MEMORY_PAIRS });
        if (matched === MEMORY_PAIRS) later(900, () => end(misses <= 6 ? 3 : misses <= 12 ? 2 : 1, `Lật nhầm ${misses} lần`));
      });
    } else {
      const rounds = bakeryRounds(BAKERY_ROUNDS, randomSeed());
      let index = 0;
      let wrong = 0;
      let firstTry = 0;
      let busy = false;
      const send = () => {
        const r = rounds[index];
        EventBus.emit(EV.bakery, { prompt: r.prompt, total: r.total, boxes: r.boxes });
        setSpeakText(r.speak);
        setProgress({ done: index, total: rounds.length });
      };
      on(EV.ready, send);
      on<{ counts: number[] }>(EV.submit, ({ counts }) => {
        if (busy) return;
        const r = rounds[index];
        const per = r.total / r.boxes;
        const placed = counts.reduce((s, c) => s + c, 0);
        if (!isEvenShare(r, counts)) {
          wrong++;
          sfx.tryAgain();
          const hint = wrong >= 2 ? ` Gợi ý: ${r.total} : ${r.boxes} = ?` : '';
          EventBus.emit(EV.feedback, {
            correct: false,
            message: placed < r.total ? `Còn ${r.total - placed} chiếc bánh trên bàn đó!${hint}` : `Các hộp chưa bằng nhau: ${counts.join(' – ')}.${hint}`,
          });
          return;
        }
        busy = true;
        const result: AnswerResult = wrong === 0 ? 'first' : 'hint';
        if (result === 'first') firstTry++;
        void recordAnswer('bang-chia-2-5', result, 'practice');
        give(result);
        sfx.correct();
        EventBus.emit(EV.feedback, { correct: true, message: `Đúng rồi! ${r.total} : ${r.boxes} = ${per}` });
        later(1600, () => {
          index++;
          wrong = 0;
          busy = false;
          if (index < rounds.length) send();
          else {
            setProgress({ done: rounds.length, total: rounds.length });
            end(starsFor(firstTry, rounds.length), `Chia đúng ngay lần đầu ${firstTry}/${rounds.length} lượt`);
          }
        });
      });
    }

    const pending = timers.current;
    return () => {
      alive = false;
      for (const [event, fn] of handlers) EventBus.off(event, fn);
      pending.forEach((t) => window.clearTimeout(t));
      stopSpeaking();
    };
  }, [game, topic]);

  function togglePause() {
    const next = !paused;
    setPaused(next);
    EventBus.emit(EV.pause, next);
  }

  const { key, scene } = SCENES[game.id];
  const unit = game.topics === 'memory' ? 'Cặp' : game.topics === 'quick' ? 'Câu' : 'Lượt';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold flex-1 min-w-0">
          {game.emoji} {game.name}
        </h1>
        <span className="font-display text-xl font-bold whitespace-nowrap">
          {unit} {Math.min(progress.done + (summary ? 0 : game.topics === 'memory' ? 0 : 1), progress.total)}/{progress.total}
        </span>
        {speakText && !summary && <ReadAloudButton text={speakText} />}
        {!summary && (
          <button type="button" className="btn btn-circle btn-lg bg-base-100 border-base-300 text-2xl" onClick={togglePause} aria-label={paused ? 'Chơi tiếp' : 'Tạm dừng'}>
            {paused ? '▶️' : '⏸️'}
          </button>
        )}
      </div>
      <progress className="progress progress-primary h-3" value={progress.done} max={progress.total} />
      <p className="sr-only" aria-live="polite" data-testid="de-bai">
        {speakText}
      </p>
      <div className="relative">
        <PhaserGame sceneKey={key} scene={scene} />
        {paused && (
          <button type="button" onClick={togglePause} className="absolute inset-0 rounded-3xl bg-neutral/40 grid place-items-center font-display text-4xl font-extrabold text-white">
            ⏸️ Đang tạm dừng — chạm để chơi tiếp
          </button>
        )}
      </div>
      {game.id === 'hung-keo' && !summary && <p className="text-center font-semibold opacity-80">👆 Kéo hoặc chạm để di chuyển giỏ của Thỏ Rốt.</p>}
      {game.id === 'tiem-banh' && !summary && <p className="text-center font-semibold opacity-80">👆 Kéo từng chiếc bánh vào hộp, xong thì bấm “Xong ✓”.</p>}
      {summary && (
        <section className="sticker p-5 flex flex-col items-center gap-3 text-center anim-pop">
          <Bunny mood="cheer" className="w-24" />
          <h2 className="text-3xl font-extrabold text-primary">Chơi xong rồi!</h2>
          <Stars count={summary.stars} size="text-5xl" />
          <p className="text-xl font-bold">
            {summary.line} · 🥕 +{summary.carrots}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-primary btn-lg rounded-full" onClick={onAgain}>
              🔁 Chơi lại
            </button>
            <Link to="/tro-choi" className="btn btn-secondary btn-lg rounded-full">
              🎮 Trò khác
            </Link>
            <Link to="/" className="btn btn-lg rounded-full bg-base-100">
              🏠 Về nhà
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
