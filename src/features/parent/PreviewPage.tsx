import { useState } from 'react';
import { ALL_SKILLS, makeQuestion, SKILLS } from '../../engine/questions';
import { randomSeed } from '../../engine/rng';
import { AnswerText, ReadAloudButton } from '../../ui/bits';
import { VisualView } from '../quiz/VisualView';

/** Cho bố mẹ duyệt nhanh câu hỏi của từng dạng bài (kèm đáp án) — xem đề có đúng chương trình không. */
export function PreviewPage() {
  const [seed, setSeed] = useState(1);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-extrabold text-primary text-center">👀 Xem trước câu hỏi</h1>
      <p className="text-center font-semibold">Dành cho bố mẹ: mỗi dạng bài hiện 2 câu mẫu, có đáp án và lời giải.</p>
      <button type="button" className="btn btn-secondary self-center rounded-full" onClick={() => setSeed(randomSeed())}>
        🔄 Đổi câu khác
      </button>
      {ALL_SKILLS.map((id, i) => (
        <section key={id} className="sticker p-4 flex flex-col gap-3">
          <h2 className="text-2xl font-bold">
            {SKILLS[id].name} <span className="text-base opacity-60">({SKILLS[id].lessons})</span>
          </h2>
          {[0, 1].map((k) => {
            const q = makeQuestion(id, seed * 1000 + i * 10 + k);
            return (
              <div key={k} className="rounded-2xl bg-base-200 p-3 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <p className="font-display text-xl font-bold flex-1">{q.prompt}</p>
                  <ReadAloudButton text={q.speak} />
                </div>
                {q.visual && <VisualView visual={q.visual} />}
                <p className="flex flex-wrap gap-2">
                  {q.choices.map((c) => (
                    <span key={c.value} className={`badge badge-lg h-auto py-1 ${c.value === q.answer ? 'badge-success font-bold' : 'badge-ghost'}`}>
                      <AnswerText value={c.value} />
                    </span>
                  ))}
                  <span className="badge badge-lg badge-outline">{q.input === 'number' ? 'nhập số' : 'trắc nghiệm'}</span>
                </p>
                <p className="text-base">✏️ {q.solution}</p>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
