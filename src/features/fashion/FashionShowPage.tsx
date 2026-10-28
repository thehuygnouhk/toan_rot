import { useState } from 'react';
import { Link } from 'react-router';
import type { Profile } from '../../engine/progress/db';
import { db } from '../../engine/progress/db';
import { weightFor, type AnswerResult } from '../../engine/progress/mastery';
import { finishShow, useProfile } from '../../engine/progress/store';
import { buildQuiz, type Question } from '../../engine/questions';
import { randomSeed } from '../../engine/rng';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { speak } from '../../ui/speech';
import { STATIONS } from '../onthi/stations';
import { QuizRunner } from '../quiz/QuizRunner';

const STEPS = 8;
const SHOW_BONUS = 15;
/** Câu hỏi trộn từ mọi trạm luyện tập, dạng bài bé còn yếu được hỏi nhiều hơn. */
const SHOW_SKILLS = [...new Set(STATIONS.filter((s) => s.mode === 'practice').flatMap((s) => s.skills))];

/** Sân khấu là phông nền mặc định của buổi diễn nếu bé chưa chọn phông nền. */
const stageLook = (p: Profile) => ({ ...p.equipped, nen: p.equipped.nen ?? 'nen-san-khau' });

/** Sàn diễn thời trang (skill phong-thoi-trang): mỗi câu xong, Thỏ Rốt bước thêm một bước; cuối buổi chụp poster. */
export function FashionShowPage() {
  const profile = useProfile();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [steps, setSteps] = useState<AnswerResult[]>([]);
  const [poster, setPoster] = useState<{ flashes: number; firstShow: boolean } | null>(null);
  if (!profile) return null;

  async function start() {
    const stats = await db.skills.bulkGet(SHOW_SKILLS);
    const weights = Object.fromEntries(SHOW_SKILLS.map((id, i) => [id, weightFor(stats[i])]));
    sfx.tap();
    setSteps([]);
    setPoster(null);
    setQuestions(buildQuiz(SHOW_SKILLS, STEPS, randomSeed(), weights));
  }

  async function finish() {
    if (!profile) return;
    const flashes = steps.filter((r) => r === 'first').length;
    await finishShow(SHOW_BONUS);
    sfx.reward();
    celebrate(true);
    speak(`Tuyệt vời! ${profile.name} và Thỏ Rốt đã trình diễn xong!`);
    setPoster({ flashes, firstShow: !profile.shows });
    setQuestions(null);
  }

  if (questions) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold text-center">✨ Sàn diễn thời trang</h1>
        <Runway profile={profile} steps={steps} />
        <QuizRunner
          key={questions[0]?.id}
          questions={questions}
          mode="practice"
          requeue={false}
          onSettle={(r) => setSteps((s) => [...s, r])}
          onFinish={finish}
        />
      </div>
    );
  }

  if (poster) {
    return (
      <div className="sticker p-5 flex flex-col items-center gap-4 text-center max-w-xl mx-auto anim-pop">
        <div className="w-full max-w-xs rounded-[2rem] overflow-hidden border-8 border-warning shadow-xl bg-warning">
          <p className="font-display text-2xl font-extrabold text-warning-content py-1">🌟 Người mẫu nhí 🌟</p>
          <Bunny mood="cheer" equipped={stageLook(profile)} colors={profile.colors} background className="w-full block rounded-2xl" />
          <p className="font-display text-xl font-extrabold text-warning-content py-1">{profile.name} & Thỏ Rốt</p>
        </div>
        <p className="text-2xl font-bold">
          📸 × {poster.flashes} ánh đèn flash · thưởng 🥕 {SHOW_BONUS}
        </p>
        {poster.firstShow && <p className="text-xl font-bold bg-warning/50 rounded-2xl px-4 py-2">🎁 Con vừa mở khoá Váy dạ hội! Vào Tủ đồ để nhận nhé.</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary btn-lg rounded-full" onClick={start}>
            ✨ Diễn lần nữa
          </button>
          <Link to="/tu-do" className="btn btn-accent btn-lg rounded-full">
            👗 Tủ đồ
          </Link>
          <Link to="/" className="btn btn-lg rounded-full bg-base-100">
            🏠 Về nhà
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sticker p-6 flex flex-col items-center gap-4 text-center max-w-2xl mx-auto anim-pop">
      <h1 className="text-4xl font-extrabold text-primary">✨ Sàn diễn thời trang</h1>
      <Bunny mood="happy" equipped={stageLook(profile)} colors={profile.colors} background className="w-48 rounded-3xl anim-float" />
      <ul className="text-lg font-semibold text-left flex flex-col gap-1">
        <li>👠 Có {STEPS} câu hỏi, trộn các bài đã học.</li>
        <li>💃 Xong mỗi câu, Thỏ Rốt bước thêm một bước trên sàn diễn.</li>
        <li>📸 Đúng ngay lần đầu: được một ánh đèn flash!</li>
        <li>
          🥕 Diễn xong được thưởng {SHOW_BONUS} cà rốt{profile.shows ? '.' : ', và mở khoá Váy dạ hội!'}
        </li>
      </ul>
      <button type="button" className="btn btn-primary btn-lg rounded-full px-12 text-2xl" onClick={start}>
        Bắt đầu trình diễn
      </button>
      <Link to="/tu-do" className="btn rounded-full bg-base-100">
        👗 Chọn đồ thật xinh trước
      </Link>
    </div>
  );
}

/** Sàn diễn: Thỏ Rốt bước dần sang phải; mỗi bước đã đi có đèn flash (đúng ngay) hoặc lấp lánh. */
function Runway({ profile, steps }: { profile: Profile; steps: AnswerResult[] }) {
  const at = steps.length;
  return (
    <div className="sticker p-2 overflow-hidden" aria-label={`Đã đi ${at} trên ${STEPS} bước`}>
      <div className="relative h-32 rounded-3xl bg-linear-to-b from-secondary/50 to-base-200">
        <span className="absolute top-1 left-3 text-xl">💡</span>
        <span className="absolute top-1 right-3 text-xl">💡</span>
        <div className="absolute inset-x-3 bottom-3 h-7 rounded-full bg-primary/30 border-2 border-white" />
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`absolute bottom-3 text-xl -translate-x-1/2 ${i < at ? 'anim-pop' : 'opacity-40'}`}
            style={{ left: `calc(${((i + 1) / STEPS) * 84}% + 2.25rem)` }}
          >
            {i < at ? (steps[i] === 'first' ? '📸' : '✨') : '•'}
          </span>
        ))}
        <div className="absolute bottom-7 transition-[left] duration-700 ease-out" style={{ left: `calc(${(at / STEPS) * 84}% + 0.25rem)` }}>
          <Bunny mood={at > 0 && steps[at - 1] === 'first' ? 'cheer' : 'happy'} equipped={profile.equipped} colors={profile.colors} className="w-16" />
        </div>
      </div>
    </div>
  );
}
