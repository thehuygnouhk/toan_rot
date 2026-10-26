import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { buildQuiz, SKILLS, type Question, type SkillId } from '../../engine/questions';
import { db } from '../../engine/progress/db';
import { starsFor, weightFor } from '../../engine/progress/mastery';
import { addCarrots, finishStation, useProfile } from '../../engine/progress/store';
import { randomSeed } from '../../engine/rng';
import { Stars } from '../../ui/bits';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { QuizRunner, type QuizResult } from '../quiz/QuizRunner';
import { STATION_BY_ID, stationForSkill, type Station } from './stations';

const BONUS = { practice: 5, exam: 10 };

/** Đổi trạm (ví dụ bấm "ôn thêm") thì làm mới toàn bộ trạng thái. */
export function StationPage() {
  const { stationId = '' } = useParams();
  return <StationView key={stationId} stationId={stationId} />;
}

function StationView({ stationId }: { stationId: string }) {
  const station = STATION_BY_ID.get(stationId);
  const profile = useProfile();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);

  if (!station) {
    return (
      <p className="text-center text-2xl">
        Không tìm thấy trạm này. <Link to="/on-thi" className="link">Về bản đồ ôn thi</Link>
      </p>
    );
  }

  async function start(s: Station) {
    let weights = s.weights;
    if (!weights) {
      const stats = await db.skills.bulkGet(s.skills);
      weights = Object.fromEntries(s.skills.map((id, i) => [id, weightFor(stats[i])]));
    }
    sfx.tap();
    setResults(null);
    setQuestions(buildQuiz(s.skills, s.count, randomSeed(), weights));
  }

  async function finish(r: QuizResult[]) {
    if (!station) return;
    const original = r.slice(0, station.count);
    const stars = starsFor(original.filter((x) => x.result === 'first').length, original.length);
    await finishStation(station.id, stars);
    await addCarrots(BONUS[station.mode]);
    sfx.reward();
    celebrate(true);
    setResults(r);
    setQuestions(null);
  }

  if (questions) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold text-center">
          {station.emoji} {station.title}
        </h1>
        <QuizRunner key={questions[0]?.id} questions={questions} mode={station.mode} onFinish={finish} />
      </div>
    );
  }

  if (results) return <Summary station={station} results={results} onAgain={() => start(station)} />;

  return (
    <div className="sticker p-6 flex flex-col items-center gap-4 text-center max-w-xl mx-auto anim-pop">
      <Bunny mood="happy" equipped={profile?.equipped} className="w-36 anim-float" />
      <p className="text-lg font-bold opacity-70">
        {station.lessons} · {station.count} câu
      </p>
      <h1 className="text-4xl font-extrabold text-primary">
        {station.emoji} {station.title}
      </h1>
      <ul className="text-lg font-semibold">
        {station.mode === 'exam' ? (
          <>
            <li>📝 Giống đề kiểm tra giữa kì: trộn tất cả các bài.</li>
            <li>🙈 Không có gợi ý — con tự làm thật cẩn thận nhé!</li>
          </>
        ) : (
          [...new Set(station.skills)].map((id) => <li key={id}>✨ {SKILLS[id].name}</li>)
        )}
      </ul>
      <button type="button" className="btn btn-primary btn-lg rounded-full px-12 text-2xl" onClick={() => start(station)}>
        Bắt đầu!
      </button>
    </div>
  );
}

function Summary({ station, results, onAgain }: { station: Station; results: QuizResult[]; onAgain: () => void }) {
  const original = results.slice(0, station.count);
  const firstTry = original.filter((r) => r.result === 'first').length;
  const stars = starsFor(firstTry, original.length);
  const bySkill = new Map<SkillId, { ok: number; total: number }>();
  for (const r of original) {
    const e = bySkill.get(r.question.skillId) ?? { ok: 0, total: 0 };
    e.total++;
    if (r.result !== 'wrong') e.ok++;
    bySkill.set(r.question.skillId, e);
  }
  const weak = [...bySkill.entries()].filter(([, e]) => e.ok < e.total).map(([id]) => id);
  return (
    <div className="sticker p-6 flex flex-col items-center gap-4 text-center max-w-2xl mx-auto anim-pop">
      <Bunny mood="cheer" className="w-32" />
      <h1 className="text-4xl font-extrabold text-primary">Hoàn thành!</h1>
      <Stars count={stars} size="text-5xl" />
      <p className="text-2xl font-bold">
        Đúng ngay lần đầu: {firstTry}/{original.length} câu · thưởng thêm 🥕 {BONUS[station.mode]}
      </p>
      <div className="w-full text-left flex flex-col gap-2">
        {[...bySkill.entries()].map(([id, e]) => (
          <div key={id} className="flex items-center justify-between rounded-2xl bg-base-200 px-4 py-2 text-lg font-semibold">
            <span>{SKILLS[id].name}</span>
            <span>
              {e.ok}/{e.total} {e.ok === e.total ? '💚' : '💜'}
            </span>
          </div>
        ))}
      </div>
      {weak.length > 0 && (
        <div className="w-full rounded-3xl bg-secondary/40 p-4 text-left">
          <p className="font-display text-xl font-bold mb-2">Mình ôn thêm chỗ này nhé:</p>
          <div className="flex flex-wrap gap-2">
            {[...new Set(weak.map((id) => stationForSkill(id)).filter((s): s is Station => !!s && s.id !== station.id))].map((s) => (
              <Link key={s.id} to={`/on-thi/${s.id}`} className="btn btn-secondary rounded-full">
                {s.emoji} {s.title}
              </Link>
            ))}
            {weak.some((id) => station.skills.includes(id)) && station.mode === 'practice' && (
              <button type="button" className="btn btn-secondary rounded-full" onClick={onAgain}>
                🔁 Làm lại trạm này
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/on-thi" className="btn btn-primary btn-lg rounded-full">
          🗺️ Bản đồ ôn thi
        </Link>
        <Link to="/to-mau" className="btn btn-accent btn-lg rounded-full">
          🎨 Đi tô màu
        </Link>
        <Link to="/tu-do" className="btn btn-lg rounded-full bg-base-100">
          👗 Tủ đồ
        </Link>
      </div>
    </div>
  );
}
