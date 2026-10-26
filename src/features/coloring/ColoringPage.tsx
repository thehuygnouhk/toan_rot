import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { COLORING_SKILLS, type ColoringSkill } from '../../engine/questions/coloring';
import { toSpeech } from '../../engine/questions/format';
import { addCarrots, recordAnswer, saveArtwork } from '../../engine/progress/store';
import { randomSeed } from '../../engine/rng';
import { ReadAloudButton } from '../../ui/bits';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { makePlan, skillOfProblem } from './plan';
import { COLORS, PICTURE_BY_ID, type Picture } from './pictures';
import { PictureSvg } from './PictureSvg';

export function ColoringPage() {
  const { pictureId = '' } = useParams();
  const [params] = useSearchParams();
  const picture = PICTURE_BY_ID.get(pictureId);
  if (!picture) {
    return (
      <p className="text-center text-2xl">
        Không tìm thấy tranh. <Link to="/to-mau" className="link">Về Xưởng Tô Màu</Link>
      </p>
    );
  }
  if (params.get('tu-do')) return <FreeColoring picture={picture} />;
  const skill = (COLORING_SKILLS.find((s) => s.id === params.get('phep'))?.id ?? 'nhan-6-9') as ColoringSkill;
  return <MathColoring key={`${picture.id}-${skill}`} picture={picture} skill={skill} />;
}

function hintFor(skill: ColoringSkill, problem: string): string {
  const [a, b] = problem.replace(/\u00a0/g, '').split(/ [×:+−] /).map(Number);
  if (skill === 'chia-2-9') return `Nghĩ xem: ${b} × mấy = ${a}?`;
  if (skill === 'cong-tru-nham') return `Nghĩ theo chục: ${a / 10} chục ${problem.includes('+') ? 'cộng' : 'trừ'} ${b / 10} chục.`;
  return `Nhớ bảng nhân ${a}: ${a} × ${b - 1} = ${a * (b - 1)}, thêm ${a} nữa.`;
}

function MathColoring({ picture, skill }: { picture: Picture; skill: ColoringSkill }) {
  const [plan] = useState(() => makePlan(picture, skill, randomSeed()));
  const [fills, setFills] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const total = picture.regions.length;
  const filled = Object.keys(fills).length;
  const colorOf = new Map(picture.regions.map((r) => [r.id, r.color]));
  const valueOf = new Map(plan.legend.map((l) => [l.color, l.value]));

  function open(id: string) {
    if (fills[id] || complete) return;
    sfx.tap();
    setActive(id);
    setWrong([]);
    setMessage('');
  }

  function choose(value: number) {
    if (!active) return;
    const problem = plan.problems[active];
    const correct = valueOf.get(colorOf.get(active)!) === value;
    if (!correct) {
      sfx.tryAgain();
      const tries = [...wrong, value];
      setWrong(tries);
      setMessage(tries.length >= 2 ? `💡 ${hintFor(skill, problem)}` : 'Chưa đúng rồi, tính lại nhé!');
      return;
    }
    sfx.fill();
    const result = wrong.length === 0 ? 'first' : 'hint';
    void recordAnswer(skillOfProblem(skill, problem), result, 'practice');
    if (result === 'first') void addCarrots(1);
    const next = { ...fills, [active]: COLORS[colorOf.get(active)!].hex };
    setFills(next);
    setActive(null);
    if (Object.keys(next).length === total) {
      setComplete(true);
      void saveArtwork(picture.id, next);
      void addCarrots(10);
      sfx.reward();
      celebrate(true);
    }
  }

  const skillName = COLORING_SKILLS.find((s) => s.id === skill)?.name;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-primary">
          {picture.emoji} {complete ? picture.name : 'Tranh bí mật'}
        </h1>
        <p className="font-semibold">
          {skillName} · Đã tô {filled}/{total} vùng
        </p>
      </div>
      <div className="grid md:grid-cols-[1fr_16rem] gap-4 items-start">
        <div className={`sticker p-2 ${complete ? 'anim-pop' : ''}`}>
          <PictureSvg picture={picture} fills={fills} onRegion={open} selected={active} className="w-full max-h-[70vh] touch-manipulation" />
        </div>
        <aside className="sticker p-4 flex flex-col gap-3">
          <h2 className="text-xl font-bold">Bảng màu bí mật</h2>
          <ul className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {plan.legend.map((l) => (
              <li key={l.color} className="flex items-center gap-3 rounded-2xl bg-base-200 px-3 py-2">
                <span className="w-10 h-10 rounded-full border-4 border-white shadow" style={{ background: COLORS[l.color].hex }} />
                <span className="font-display text-2xl font-extrabold">{l.value}</span>
              </li>
            ))}
          </ul>
          {!complete && <p className="text-base font-semibold">👆 Chạm vào một vùng trắng để xem phép tính.</p>}
        </aside>
      </div>

      {complete && (
        <section className="sticker p-5 flex flex-col items-center gap-3 text-center anim-pop">
          <Bunny mood="cheer" className="w-24" />
          <p className="font-display text-3xl font-extrabold text-primary">Con đã tô xong "{picture.name}"! 🥕 +10</p>
          <p className="text-lg">Tranh đã được treo vào bộ sưu tập.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/to-mau" className="btn btn-primary btn-lg rounded-full">
              🎨 Tô tranh khác
            </Link>
            <Link to={`/to-mau/${picture.id}?tu-do=1`} className="btn btn-accent btn-lg rounded-full">
              🖍️ Tô tự do tranh này
            </Link>
          </div>
        </section>
      )}

      {active && (
        <div className="fixed inset-0 z-30 bg-neutral/40 grid place-items-center p-4" onClick={() => setActive(null)}>
          <div className="sticker p-5 w-full max-w-md flex flex-col items-center gap-4 anim-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <p className="font-display text-5xl font-extrabold">{plan.problems[active]} = ?</p>
              <ReadAloudButton text={toSpeech(`${plan.problems[active]} = ?`)} />
            </div>
            <p className="text-lg font-semibold">Kết quả là màu nào?</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              {plan.legend.map((l) => {
                const off = wrong.includes(l.value);
                return (
                  <button
                    key={l.color}
                    type="button"
                    disabled={off}
                    onClick={() => choose(l.value)}
                    className={`btn h-20 rounded-3xl border-4 text-3xl font-display font-extrabold justify-start gap-3 ${off ? 'opacity-40 anim-wiggle' : 'bg-base-100 border-base-300'}`}
                  >
                    <span className="w-10 h-10 rounded-full border-4 border-white shadow" style={{ background: COLORS[l.color].hex }} />
                    {l.value}
                  </button>
                );
              })}
            </div>
            {message && <p className="text-lg font-bold bg-secondary/40 rounded-2xl px-4 py-2">{message}</p>}
            <button type="button" className="btn btn-ghost" onClick={() => setActive(null)}>
              Để sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const FREE_COLORS = ['#ff8fb8', '#ff4f7b', '#b79cff', '#7b5cff', '#ffd84d', '#ffad5a', '#7fd6c2', '#5ab0ff', '#a7e07a', '#ffffff', '#c8a27a', '#4a3b5c'];

function FreeColoring({ picture }: { picture: Picture }) {
  const [color, setColor] = useState(FREE_COLORS[0]);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-extrabold text-primary text-center">🖍️ Tô tự do: {picture.name}</h1>
      <div className="grid md:grid-cols-[1fr_16rem] gap-4 items-start">
        <div className="sticker p-2">
          <PictureSvg
            picture={picture}
            fills={fills}
            onRegion={(id) => {
              sfx.fill();
              setSaved(false);
              setFills((f) => ({ ...f, [id]: color }));
            }}
            className="w-full max-h-[70vh] touch-manipulation"
          />
        </div>
        <aside className="sticker p-4 flex flex-col gap-3">
          <h2 className="text-xl font-bold">Chọn màu</h2>
          <div className="grid grid-cols-4 gap-2">
            {FREE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Màu ${c}`}
                onClick={() => setColor(c)}
                className={`w-14 h-14 rounded-full border-4 shadow ${color === c ? 'border-primary scale-110' : 'border-white'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary rounded-full"
            disabled={saved || Object.keys(fills).length === 0}
            onClick={() => {
              void saveArtwork(picture.id, fills);
              setSaved(true);
              sfx.reward();
              celebrate();
            }}
          >
            {saved ? '✅ Đã lưu' : '💾 Lưu vào bộ sưu tập'}
          </button>
          <Link to="/to-mau" className="btn rounded-full bg-base-100">
            ← Xưởng Tô Màu
          </Link>
        </aside>
      </div>
    </div>
  );
}
