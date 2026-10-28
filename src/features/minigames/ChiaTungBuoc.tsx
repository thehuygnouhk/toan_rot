import { useState, type CSSProperties, type ReactNode } from 'react';
import { divisionRound, divisionStory, stepExplain, stepHint, stepPrompt, type DivStep, type LongDivision } from '../../engine/questions/cd04';
import { carrotsFor, starsFor, type AnswerResult } from '../../engine/progress/mastery';
import { addCarrots, finishGame, recordAnswer } from '../../engine/progress/store';
import { createRng, randomSeed } from '../../engine/rng';
import { NumberPad, ReadAloudButton } from '../../ui/bits';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { GAME_BONUS } from './catalog';
import { GameSummary, type Summary } from './GameSummary';

const ROUND = 5;
/** Ba bài đầu Thỏ Rốt hỏi từng phép tính; hai bài sau chỉ nhắc tên bước để bé tự làm. */
const GUIDED = 3;
const STEP_NAME: Record<DivStep['kind'], string> = { chia: 'Chia', nhan: 'Nhân', tru: 'Trừ', ha: 'Hạ' };
const SELF_PROMPT: Record<DivStep['kind'], string> = {
  chia: 'Bước CHIA: lấy số được tô sáng chia cho số chia, viết vào thương.',
  nhan: 'Bước NHÂN: nhân chữ số vừa viết ở thương với số chia.',
  tru: 'Bước TRỪ: lấy số ở trên trừ đi số vừa viết.',
  ha: 'Bước HẠ: hạ chữ số hàng đơn vị xuống.',
};

/**
 * Chia từng bước (Bài 26): đặt tính dọc như sách, bé điền từng bước chia – nhân – trừ – hạ.
 * Sai thì Thỏ Rốt nhắc đúng chỗ; sai 2 lần ở một bước thì xem cách làm rồi làm tiếp. Không có thua cuộc.
 */
export function ChiaTungBuoc({ onAgain }: { onAgain: () => void }) {
  const [round] = useState(() => {
    const seed = randomSeed();
    const rng = createRng(seed + 1);
    return divisionRound(seed).map((d) => ({ d, story: divisionStory(d, rng) }));
  });
  const [p, setP] = useState(0);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [wrong, setWrong] = useState(0);
  const [slipped, setSlipped] = useState(false);
  const [message, setMessage] = useState('');
  const [firstTry, setFirstTry] = useState(0);
  const [carrots, setCarrots] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);

  const { d, story } = round[p];
  const current: DivStep | undefined = d.steps[step];
  const guided = p < GUIDED;
  const bubble = current ? (guided ? stepPrompt(current, d.divisor) : SELF_PROMPT[current.kind]) : '';

  function finishProblem(hadSlip: boolean) {
    const result: AnswerResult = hadSlip ? 'hint' : 'first';
    void recordAnswer('chia-2-chu-so', result, 'practice');
    const c = carrotsFor(result);
    void addCarrots(c);
    setCarrots((x) => x + c);
    if (!hadSlip) setFirstTry((x) => x + 1);
    sfx.reward();
    celebrate();
  }

  function advance(hadSlip: boolean) {
    if (step === d.steps.length - 1) finishProblem(hadSlip);
    setStep((s) => s + 1);
    setTyped('');
    setWrong(0);
  }

  function submit(value: number) {
    if (!current || current.kind === 'ha') return;
    if (value === current.answer) {
      sfx.correct();
      setMessage('');
      advance(slipped);
      return;
    }
    sfx.tryAgain();
    setSlipped(true);
    if (wrong + 1 >= 2) {
      setMessage(`${stepExplain(current, d.divisor)} Mình làm tiếp nhé!`);
      advance(true);
      return;
    }
    setWrong(wrong + 1);
    setTyped('');
    setMessage(stepHint(current, d.divisor, value));
  }

  function bringDown() {
    if (current?.kind !== 'ha') return;
    sfx.tap();
    setMessage('');
    advance(slipped);
  }

  function next() {
    if (p + 1 >= ROUND) {
      const stars = starsFor(firstTry, ROUND);
      void finishGame('chia-tung-buoc', stars, GAME_BONUS);
      sfx.reward();
      celebrate(true);
      setSummary({ stars, carrots: carrots + GAME_BONUS, line: `Làm đúng hết các bước ngay lần đầu ${firstTry}/${ROUND} bài` });
      return;
    }
    setP(p + 1);
    setStep(0);
    setTyped('');
    setWrong(0);
    setSlipped(false);
    setMessage('');
  }

  if (summary) return <GameSummary summary={summary} onAgain={onAgain} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold flex-1 min-w-0">➗ Chia từng bước</h1>
        <span className="font-display text-xl font-bold whitespace-nowrap">
          Bài {p + 1}/{ROUND}
        </span>
      </div>
      <progress className="progress progress-primary h-3" value={p + (current ? 0 : 1)} max={ROUND} />
      <p className="sticker px-4 py-2 text-lg sm:text-xl font-bold" data-testid="don-hang">
        📦 {story.order} Đặt tính rồi tính: {d.dividend} : {d.divisor}
      </p>
      <div className="grid md:grid-cols-[22rem_1fr] gap-4 items-start">
        <div className="sticker p-4 flex flex-col items-center gap-3">
          <Board d={d} step={step} typed={typed} onBringDown={bringDown} />
          <StepRibbon steps={d.steps} step={step} />
        </div>
        <div className="flex flex-col gap-3">
          {current ? (
            <>
              <div className="flex items-start gap-3">
                <Bunny mood={message ? 'think' : 'happy'} className="w-16 shrink-0" />
                <p className="flex-1 rounded-3xl bg-base-100 border-4 border-secondary px-4 py-3 font-display text-xl sm:text-2xl font-bold" data-testid="loi-thoai">
                  {bubble}
                </p>
                <ReadAloudButton text={bubble} className="shrink-0" />
              </div>
              {message && <p className="rounded-2xl bg-secondary/40 px-4 py-2 text-lg font-bold">💡 {message}</p>}
              {current.kind === 'ha' ? (
                <button type="button" className="btn btn-primary btn-lg rounded-full self-center text-2xl px-10 anim-float" onClick={bringDown}>
                  ⬇️ Hạ {current.digit} xuống
                </button>
              ) : (
                <NumberPad value={typed} onChange={setTyped} onSubmit={() => submit(Number(typed))} />
              )}
            </>
          ) : (
            <Result d={d} story={story.result} message={message} onNext={next} last={p + 1 >= ROUND} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Kết quả một bài: phép chia, câu trả lời của đơn hàng và hình các phần chia. */
function Result({ d, story, message, onNext, last }: { d: LongDivision; story: string; message: string; onNext: () => void; last: boolean }) {
  return (
    <section className="sticker p-4 flex flex-col items-center gap-3 text-center anim-pop">
      {message && <p className="rounded-2xl bg-secondary/40 px-4 py-2 text-lg font-bold">💡 {message}</p>}
      <p className="font-display text-3xl font-extrabold text-primary" data-testid="ket-qua">
        {d.dividend} : {d.divisor} = {d.quotient}
        {d.remainder ? ` (dư ${d.remainder})` : ''}
      </p>
      <p className="text-xl font-bold">🎉 {story}!</p>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: d.divisor }, (_, i) => (
          <span key={i} className="badge badge-lg badge-accent font-bold h-auto py-1">
            🎁 {d.quotient}
          </span>
        ))}
        {d.remainder > 0 && <span className="badge badge-lg badge-ghost font-bold h-auto py-1">thừa {d.remainder}</span>}
      </div>
      <p className="text-base opacity-80">
        Thử lại: {d.quotient} × {d.divisor}
        {d.remainder ? ` + ${d.remainder}` : ''} = {d.dividend}
      </p>
      <button type="button" className="btn btn-primary btn-lg rounded-full px-10 text-2xl" onClick={onNext}>
        {last ? 'Xem kết quả 🌟' : 'Đơn tiếp theo ➜'}
      </button>
    </section>
  );
}

/** Dải các bước Chia → Nhân → Trừ → Hạ → Chia → Nhân → Trừ, bước đang làm được tô đậm. */
function StepRibbon({ steps, step }: { steps: DivStep[]; step: number }) {
  return (
    <ol className="flex flex-wrap justify-center gap-1" aria-label="Các bước">
      {steps.map((s, i) => (
        <li
          key={i}
          className={`rounded-full px-2.5 py-1 text-sm font-bold ${i === step ? 'bg-primary text-primary-content scale-110' : i < step ? 'bg-success/50' : 'bg-base-200 opacity-70'}`}
        >
          {i < step ? '✓ ' : ''}
          {STEP_NAME[s.kind]}
        </li>
      ))}
    </ol>
  );
}

/** Phép chia đặt tính dọc như SGK: số bị chia bên trái, số chia bên phải, thương dưới số chia. */
function Board({ d, step, typed, onBringDown }: { d: LongDivision; step: number; typed: string; onBringDown: () => void }) {
  const [q1, p1, r1, ha, q0, p2, rem] = d.steps as [
    Extract<DivStep, { kind: 'chia' }>,
    Extract<DivStep, { kind: 'nhan' }>,
    Extract<DivStep, { kind: 'tru' }>,
    Extract<DivStep, { kind: 'ha' }>,
    Extract<DivStep, { kind: 'chia' }>,
    Extract<DivStep, { kind: 'nhan' }>,
    Extract<DivStep, { kind: 'tru' }>,
  ];
  const tens = Math.floor(d.dividend / 10);
  const units = d.dividend % 10;
  const done = (i: number) => step > i;
  // Ô đang cần điền hiện số bé đang gõ; ô đã xong hiện đáp án
  const val = (i: number, answer: number) => (done(i) ? String(answer) : step === i ? typed || '?' : '');
  /** Chữ số theo cột, căn phải (cột hàng chục, hàng đơn vị). */
  const split = (text: string, cols: [number, number]): [number, string][] =>
    text.length >= 2 ? [[cols[0], text.slice(-2, -1)], [cols[1], text.slice(-1)]] : [[cols[1], text]];

  const cell = (row: number, col: number, content: ReactNode, opts: { hot?: boolean; target?: boolean; line?: boolean; span?: number; key?: string } = {}) => {
    const style: CSSProperties = { gridRow: row, gridColumn: opts.span ? `${col} / span ${opts.span}` : col };
    return (
      <div
        key={opts.key ?? `${row}-${col}`}
        style={style}
        className={`h-14 grid place-items-center rounded-lg font-display text-4xl font-extrabold ${opts.hot ? 'bg-warning/60' : ''} ${
          opts.target ? 'outline-4 outline-dashed outline-primary text-primary anim-pop' : ''
        } ${opts.line ? 'border-b-4 border-base-content rounded-none' : ''}`}
      >
        {content}
      </div>
    );
  };

  const items: ReactNode[] = [];
  // Hàng 1: số bị chia | số chia
  items.push(cell(1, 2, tens, { hot: step === 0 || step === 2 }));
  items.push(
    <button
      key="units"
      type="button"
      style={{ gridRow: 1, gridColumn: 3 }}
      onClick={onBringDown}
      disabled={step !== 3}
      className={`h-14 grid place-items-center rounded-lg font-display text-4xl font-extrabold ${step === 3 ? 'bg-warning/60 anim-float cursor-pointer' : ''}`}
      aria-label={`Chữ số ${units}`}
    >
      {units}
    </button>,
  );
  items.push(cell(1, 5, d.divisor, { hot: [0, 1, 4, 5].includes(step), line: true, span: 2 }));
  items.push(<div key="sep" style={{ gridRow: '1 / span 2', gridColumn: 4 }} className="w-1 justify-self-center bg-base-content rounded-full" />);
  // Hàng 2: tích thứ nhất | thương
  items.push(cell(2, 5, val(0, q1.answer), { target: step === 0, hot: step === 1 }));
  items.push(cell(2, 6, val(4, q0.answer), { target: step === 4, hot: step === 5 }));
  if (done(1)) items.push(cell(2, 1, '−'));
  items.push(cell(2, 2, val(1, p1.answer), { target: step === 1, hot: step === 2, line: done(1) }));
  // Hàng 3: số dư lượt đầu và chữ số hạ xuống
  items.push(cell(3, 2, val(2, r1.answer), { target: step === 2, hot: step === 4 || step === 6 }));
  items.push(cell(3, 3, done(3) ? String(ha.digit) : '', { target: step === 3, hot: step === 4 || step === 6 }));
  // Hàng 4: tích thứ hai (có thể hai chữ số)
  if (done(5)) items.push(cell(4, 1, '−'));
  const p2Text = val(5, p2.answer);
  for (const [col, ch] of split(p2Text, [2, 3])) items.push(cell(4, col, ch, { target: step === 5, line: done(5), key: `p2-${col}` }));
  if (done(5) && p2Text.length < 2) items.push(cell(4, 2, '', { line: true, key: 'p2-pad' }));
  // Hàng 5: số dư cuối cùng
  items.push(cell(5, 3, val(6, rem.answer), { target: step === 6 }));

  return (
    <div
      className="grid gap-x-1 gap-y-1"
      style={{ gridTemplateColumns: '2rem 3.25rem 3.25rem 1rem 3.25rem 3.25rem', gridTemplateRows: 'repeat(5, 3.5rem)' }}
      aria-label={`Đặt tính ${d.dividend} chia ${d.divisor}`}
      data-testid="bang-chia"
    >
      {items}
    </div>
  );
}
