import { useRef, useState, type PointerEvent } from 'react';
import { carrotsFor, starsFor, type AnswerResult } from '../../engine/progress/mastery';
import { addCarrots, finishGame, recordAnswer } from '../../engine/progress/store';
import { checkGeo, geoRound, GRID_H, GRID_W, sampleSolution, type GeoTask, type Pt } from '../../engine/questions/geometry';
import { randomSeed } from '../../engine/rng';
import { ReadAloudButton } from '../../ui/bits';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { GAME_BONUS } from './catalog';
import { GameSummary, type Summary } from './GameSummary';

const CELL = 50;
const PAD = 30;
const INK = '#4a3b5c';
const PINK = '#f0569a';
const X = (x: number) => PAD + x * CELL;
const Y = (y: number) => PAD + y * CELL;

type Phase = 'draw' | 'correct' | 'skipped';

/**
 * Bảng vẽ hình học (Bài 7, 16–20): bé chạm các mắt lưới để vẽ hình chữ nhật, hình vuông, góc vuông,
 * trung điểm, đường gấp khúc, bán kính, đường kính. Sai thì nhắc đúng lỗi; sai 2 lần thì hiện cách vẽ mẫu (nét đứt).
 */
export function BangVe({ onAgain }: { onAgain: () => void }) {
  const [tasks] = useState(() => geoRound(randomSeed()));
  const [t, setT] = useState(0);
  const [points, setPoints] = useState<Pt[]>([]);
  const [wrong, setWrong] = useState(0);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<Phase>('draw');
  const [firstTry, setFirstTry] = useState(0);
  const [carrots, setCarrots] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const task = tasks[t];
  const need = task.labels.length;

  function tap(e: PointerEvent<SVGSVGElement>) {
    if (phase !== 'draw' || points.length >= need || !svg.current) return;
    const m = svg.current.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const gx = Math.round((p.x - PAD) / CELL);
    const gy = Math.round((p.y - PAD) / CELL);
    // Chỉ nhận khi chạm đủ gần một mắt lưới
    if (gx < 0 || gx > GRID_W || gy < 0 || gy > GRID_H || Math.hypot(p.x - X(gx), p.y - Y(gy)) > CELL * 0.45) return;
    sfx.tap();
    setPoints([...points, { x: gx, y: gy }]);
    setMessage('');
  }

  function check() {
    const result = checkGeo(task, points);
    if (result.ok) {
      const r: AnswerResult = wrong === 0 ? 'first' : 'hint';
      void recordAnswer(task.skillId, r, 'practice');
      const c = carrotsFor(r);
      void addCarrots(c);
      setCarrots((x) => x + c);
      if (r === 'first') setFirstTry((x) => x + 1);
      sfx.correct();
      celebrate();
      setPhase('correct');
      setMessage(result.message);
      return;
    }
    sfx.tryAgain();
    setWrong(wrong + 1);
    setMessage(wrong + 1 >= 2 ? `${result.message} Con nhìn nét đứt màu tím rồi vẽ lại nhé!` : result.message);
  }

  function skip() {
    void recordAnswer(task.skillId, 'wrong', 'practice');
    setPhase('skipped');
    setPoints(sampleSolution(task));
    setMessage('Đây là một cách vẽ đúng. Lần sau con thử lại nhé!');
  }

  function next() {
    if (t + 1 >= tasks.length) {
      const stars = starsFor(firstTry, tasks.length);
      void finishGame('bang-ve', stars, GAME_BONUS);
      sfx.reward();
      celebrate(true);
      setSummary({ stars, carrots: carrots + GAME_BONUS, line: `Vẽ đúng ngay lần đầu ${firstTry}/${tasks.length} bài` });
      return;
    }
    setT(t + 1);
    setPoints([]);
    setWrong(0);
    setMessage('');
    setPhase('draw');
  }

  if (summary) return <GameSummary summary={summary} onAgain={onAgain} />;

  const ghost = wrong >= 2 && phase === 'draw' ? sampleSolution(task) : [];
  const ok = phase !== 'draw';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold flex-1 min-w-0">📐 Bảng vẽ hình học</h1>
        <span className="font-display text-xl font-bold whitespace-nowrap">
          Bài {t + 1}/{tasks.length}
        </span>
      </div>
      <progress className="progress progress-primary h-3" value={t + (ok ? 1 : 0)} max={tasks.length} />
      <div className="flex items-start gap-3">
        <Bunny mood={ok ? 'cheer' : message ? 'think' : 'happy'} className="w-14 shrink-0" />
        <p className="flex-1 rounded-3xl bg-base-100 border-4 border-secondary px-4 py-3 font-display text-xl sm:text-2xl font-bold" data-testid="de-ve">
          {task.prompt}
        </p>
        <ReadAloudButton text={task.prompt} className="shrink-0" />
      </div>
      <div className="sticker p-2">
        <svg
          ref={svg}
          viewBox={`0 0 ${GRID_W * CELL + PAD * 2} ${GRID_H * CELL + PAD * 2}`}
          className="w-full max-h-[max(16rem,calc(100dvh-27rem))] touch-none select-none cursor-crosshair"
          onPointerDown={tap}
          data-testid="bang-ve"
          role="img"
          aria-label="Lưới ô vuông để vẽ"
        >
          <Grid />
          <Drawing task={task} points={points} ghost={ghost} done={ok} />
        </svg>
      </div>
      {message && (
        <p className={`rounded-2xl px-4 py-2 text-lg font-bold ${ok ? 'bg-success/40' : 'bg-secondary/40'}`} data-testid="loi-nhan">
          {ok ? '🎉' : '💡'} {message}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {phase === 'draw' ? (
          <>
            <button type="button" className="btn btn-lg rounded-full bg-base-100 border-2 border-base-300" disabled={points.length === 0} onClick={() => setPoints(points.slice(0, -1))}>
              ↩️ Xoá điểm
            </button>
            <button type="button" className="btn btn-lg rounded-full bg-base-100 border-2 border-base-300" disabled={points.length === 0} onClick={() => setPoints([])}>
              🧽 Vẽ lại
            </button>
            <button type="button" className="btn btn-primary btn-lg rounded-full px-8" disabled={points.length < need} onClick={check}>
              Xong ✓ ({points.length}/{need} điểm)
            </button>
            {wrong >= 3 && (
              <button type="button" className="btn btn-ghost btn-lg rounded-full" onClick={skip}>
                Xem cách vẽ ➜
              </button>
            )}
          </>
        ) : (
          <button type="button" className="btn btn-primary btn-lg rounded-full px-10 text-2xl" onClick={next}>
            {t + 1 >= tasks.length ? 'Xem kết quả 🌟' : 'Bài tiếp theo ➜'}
          </button>
        )}
      </div>
    </div>
  );
}

function Grid() {
  return (
    <g>
      <rect x={PAD} y={PAD} width={GRID_W * CELL} height={GRID_H * CELL} fill="#ffffff" rx={6} />
      <g stroke="#a9cdf5" strokeWidth={1.5}>
        {Array.from({ length: GRID_W + 1 }, (_, i) => (
          <line key={`v${i}`} x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(GRID_H)} />
        ))}
        {Array.from({ length: GRID_H + 1 }, (_, j) => (
          <line key={`h${j}`} x1={X(0)} y1={Y(j)} x2={X(GRID_W)} y2={Y(j)} />
        ))}
      </g>
      {/* Mắt lưới để bé biết chỗ chạm */}
      <g fill="#cfe3fa">
        {Array.from({ length: (GRID_W + 1) * (GRID_H + 1) }, (_, k) => (
          <circle key={k} cx={X(k % (GRID_W + 1))} cy={Y(Math.floor(k / (GRID_W + 1)))} r={3} />
        ))}
      </g>
    </g>
  );
}

/** Hình cho sẵn, nét bé vẽ và (khi cần) nét đứt gợi ý. */
function Drawing({ task, points, ghost, done }: { task: GeoTask; points: Pt[]; ghost: Pt[]; done: boolean }) {
  const given = task.given.points;
  const at = (label: string) => given.find((p) => p.label === label)!;
  const path = (pts: Pt[], close: boolean) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${X(p.x)} ${Y(p.y)}`).join(' ') + (close ? ' Z' : '');
  const lines = (pts: Pt[], full: boolean) => {
    if (pts.length === 0) return null;
    if (task.connect === 'polygon') return <path d={path(pts, full && pts.length > 2)} />;
    if (task.connect === 'polyline') return <path d={path([given[0], ...pts], false)} />;
    if (task.connect === 'rays') return pts.map((p, i) => <path key={i} d={path([given[0], p], false)} />);
    return null;
  };
  const circle = task.given.circle;
  return (
    <g>
      {circle && <circle cx={X(circle.center.x)} cy={Y(circle.center.y)} r={circle.r * CELL} fill="#fff0f7" fillOpacity={0.6} stroke={INK} strokeWidth={3} />}
      <g stroke={INK} strokeWidth={4} strokeLinecap="round">
        {task.given.segments.map(([a, b]) => (
          <line key={a + b} x1={X(at(a).x)} y1={Y(at(a).y)} x2={X(at(b).x)} y2={Y(at(b).y)} />
        ))}
      </g>
      {ghost.length > 0 && (
        <g fill="none" stroke="#9b6bff" strokeWidth={4} strokeDasharray="10 8" strokeLinejoin="round">
          {lines(ghost, true)}
          {ghost.map((p, i) => (
            <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={9} />
          ))}
        </g>
      )}
      <g fill="none" stroke={done ? '#22a06b' : PINK} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
        {lines(points, points.length === task.labels.length)}
      </g>
      {given.map((p) => (
        <g key={p.label} data-label={p.label} data-gx={p.x} data-gy={p.y} className="given-point">
          <circle cx={X(p.x)} cy={Y(p.y)} r={7} fill={INK} />
          <text x={X(p.x) + 10} y={Y(p.y) - 10} fontSize={24} fontWeight={800} fill={INK} fontFamily="Nunito">
            {p.label}
          </text>
        </g>
      ))}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={9} fill={done ? '#22a06b' : PINK} stroke="#fff" strokeWidth={3} />
          <text x={X(p.x) + 11} y={Y(p.y) - 11} fontSize={24} fontWeight={800} fill={done ? '#22a06b' : '#b5179e'} fontFamily="Nunito" stroke="#fff" strokeWidth={5} paintOrder="stroke">
            {task.labels[i]}
          </text>
        </g>
      ))}
    </g>
  );
}
