import { useState } from 'react';
import { makeQuestion, type Question } from '../../engine/questions';
import { carrotsFor, type AnswerResult } from '../../engine/progress/mastery';
import { addCarrots, recordAnswer, useProfile } from '../../engine/progress/store';
import { randomSeed } from '../../engine/rng';
import { AnswerText, NumberPad, ReadAloudButton } from '../../ui/bits';
import { Bunny, type Mood } from '../../ui/Bunny';
import { celebrate, encourage, praise, praiseAfterTry } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { stopSpeaking } from '../../ui/speech';
import { VisualView } from './VisualView';

export interface QuizResult {
  question: Question;
  result: AnswerResult;
}

type Phase = 'answer' | 'correct' | 'reveal';

const MAX_TRIES = 3;
const MAX_REQUEUE = 2;

/**
 * Màn làm bài dùng chung: gợi ý 3 bậc, không phạt, thưởng cà rốt (skill vong-lap-hoc-va-thuong).
 * `requeue`: câu sai được hỏi lại một câu cùng dạng ở cuối bài. `onSettle`: báo mỗi khi xong một câu.
 */
export function QuizRunner({
  questions,
  mode,
  onFinish,
  requeue = true,
  onSettle,
}: {
  questions: Question[];
  mode: 'practice' | 'exam';
  onFinish: (results: QuizResult[]) => void;
  requeue?: boolean;
  onSettle?: (result: AnswerResult) => void;
}) {
  const profile = useProfile();
  const [queue, setQueue] = useState(questions);
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [phase, setPhase] = useState<Phase>('answer');
  const [disabled, setDisabled] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [message, setMessage] = useState('');
  const [shake, setShake] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [requeued, setRequeued] = useState(0);
  const [streak, setStreak] = useState(0);

  const q = queue[index];
  const exam = mode === 'exam';
  const mood: Mood = phase === 'correct' ? 'cheer' : wrong > 0 || phase === 'reveal' ? 'think' : 'happy';

  function settle(result: AnswerResult) {
    void recordAnswer(q.skillId, result, mode);
    void addCarrots(carrotsFor(result));
    setResults((r) => [...r, { question: q, result }]);
    onSettle?.(result);
  }

  function reveal() {
    settle('wrong');
    setPhase('reveal');
    setStreak(0);
    if (!exam && requeue && requeued < MAX_REQUEUE) {
      // Hỏi lại một câu cùng dạng ở cuối bài để bé luyện thêm
      setQueue((qs) => [...qs, makeQuestion(q.skillId, randomSeed())]);
      setRequeued((n) => n + 1);
    }
  }

  function answer(value: string) {
    if (phase !== 'answer') return;
    if (value === q.answer) {
      const result: AnswerResult = wrong === 0 && hintLevel === 0 ? 'first' : 'hint';
      settle(result);
      sfx.correct();
      setPhase('correct');
      setMessage(result === 'first' ? praise() : praiseAfterTry());
      const s = result === 'first' ? streak + 1 : 0;
      setStreak(s);
      if (s > 0 && s % 3 === 0) celebrate();
      return;
    }
    sfx.tryAgain();
    setShake((n) => n + 1);
    if (exam) {
      setMessage('Chưa đúng rồi. Mình xem đáp án nhé!');
      reveal();
      return;
    }
    const tries = wrong + 1;
    const nextDisabled = [...disabled, value];
    setWrong(tries);
    setDisabled(nextDisabled);
    setHintLevel((h) => Math.max(h, Math.min(tries, q.hints.length)));
    setTyped('');
    const why = q.choices.find((c) => c.value === value)?.why;
    const remaining = q.input === 'choice' ? q.choices.filter((c) => !nextDisabled.includes(c.value)).length : Infinity;
    if (tries >= MAX_TRIES || remaining <= 1) {
      setMessage('Không sao cả! Mình cùng xem cách làm nhé.');
      reveal();
    } else {
      setMessage(why ? `${why} Thử lại nhé!` : encourage());
    }
  }

  function next() {
    stopSpeaking();
    if (index + 1 >= queue.length) {
      onFinish(results);
      return;
    }
    setIndex(index + 1);
    setWrong(0);
    setHintLevel(0);
    setPhase('answer');
    setDisabled([]);
    setTyped('');
    setMessage('');
  }

  const shownHints = q.hints.slice(0, hintLevel);
  const showHintVisual = q.hintVisual && (hintLevel >= Math.min(2, q.hints.length) || phase === 'reveal');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <progress className="progress progress-primary h-4 flex-1" value={index + (phase === 'answer' ? 0 : 1)} max={queue.length} />
        <span className="font-display text-xl font-bold whitespace-nowrap">
          Câu {index + 1}/{queue.length}
        </span>
      </div>

      <section className="sticker p-4 md:p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Bunny mood={mood} equipped={profile?.equipped} colors={profile?.colors} className={`w-14 sm:w-20 md:w-24 shrink-0 ${phase === 'correct' ? 'anim-hop' : ''}`} />
          <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold leading-snug flex-1 min-w-0 pt-2">{q.prompt}</p>
          <ReadAloudButton text={q.speak} className="shrink-0" />
        </div>
        {q.visual && (
          <div className="rounded-3xl bg-base-200/60 p-3">
            <VisualView visual={q.visual} />
          </div>
        )}
        {shownHints.length > 0 && phase === 'answer' && (
          <ul className="rounded-3xl bg-warning/40 p-3 text-lg font-semibold flex flex-col gap-1">
            {shownHints.map((h) => (
              <li key={h}>💡 {h}</li>
            ))}
          </ul>
        )}
        {showHintVisual && q.hintVisual && (
          <div className="rounded-3xl bg-base-200/60 p-3">
            <VisualView visual={q.hintVisual} />
          </div>
        )}
      </section>

      {phase === 'answer' ? (
        <section className="flex flex-col gap-3">
          {q.input === 'number' ? (
            <>
              <div key={shake} className={`mx-auto flex items-center gap-2 ${shake ? 'anim-wiggle' : ''}`}>
                <span className="min-w-32 h-16 px-4 rounded-2xl border-4 border-primary bg-base-100 font-display text-4xl font-extrabold flex items-center justify-center">
                  {typed || '?'}
                </span>
                {q.unit && <span className="text-2xl font-bold">{q.unit}</span>}
              </div>
              <NumberPad value={typed} onChange={setTyped} onSubmit={() => answer(String(Number(typed)))} />
            </>
          ) : (
            <div className={`grid gap-3 ${q.choices.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {q.choices.map((c, _i, all) => {
                const long = all.some((x) => x.value.length > 10);
                const off = disabled.includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    disabled={off}
                    onClick={() => answer(c.value)}
                    className={`btn h-auto min-h-20 py-3 rounded-3xl border-4 font-display font-extrabold ${long ? 'text-xl md:text-2xl' : 'text-3xl'} ${
                      off ? 'bg-error/40 border-error text-error-content anim-wiggle' : 'bg-base-100 border-base-300 hover:border-primary'
                    }`}
                  >
                    <AnswerText value={c.value} />
                    {q.unit && /^\d+$/.test(c.value) ? <span className="text-xl font-bold"> {q.unit}</span> : null}
                  </button>
                );
              })}
            </div>
          )}
          {message && <p className="text-center text-xl font-bold text-secondary-content bg-secondary/40 rounded-2xl p-3">{message}</p>}
          {!exam && hintLevel < q.hints.length && (
            <button type="button" className="btn btn-warning self-center rounded-full px-6 text-xl" onClick={() => setHintLevel((h) => h + 1)}>
              💡 Gợi ý
            </button>
          )}
        </section>
      ) : (
        <section className="sticker p-4 flex flex-col items-center gap-3 anim-pop">
          {phase === 'correct' ? (
            <p className="font-display text-3xl font-extrabold text-primary">🎉 {message}</p>
          ) : (
            <>
              <p className="text-xl font-bold">{message}</p>
              <p className="font-display text-2xl font-extrabold">
                Đáp án đúng: <AnswerText value={q.answer} /> {q.unit && /^\d+$/.test(q.answer) ? q.unit : ''}
              </p>
            </>
          )}
          <p className="text-lg bg-base-200 rounded-2xl px-4 py-2">✏️ {q.solution}</p>
          <button type="button" className="btn btn-primary btn-lg rounded-full px-10 text-2xl" onClick={next}>
            {index + 1 >= queue.length ? 'Xem kết quả 🌟' : 'Tiếp tục ➜'}
          </button>
        </section>
      )}
    </div>
  );
}
