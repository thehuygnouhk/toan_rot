import { useState } from 'react';
import { Link } from 'react-router';
import { ALL_SKILLS, SKILLS } from '../../engine/questions';
import { accuracy, levelOf, type SkillLevel } from '../../engine/progress/mastery';
import { resetAll, useSkillStats, useStationStats } from '../../engine/progress/store';
import { Stars } from '../../ui/bits';
import { STATIONS } from '../onthi/stations';

const LEVEL: Record<SkillLevel, { text: string; cls: string }> = {
  'chua-lam': { text: 'Chưa làm', cls: 'badge-ghost' },
  'can-on': { text: 'Cần ôn thêm', cls: 'badge-secondary' },
  'dang-tien-bo': { text: 'Đang luyện', cls: 'badge-warning' },
  'thanh-thao': { text: 'Thành thạo', cls: 'badge-success' },
};

const TOPICS = [
  { id: 'CD01', name: 'Chủ đề 1. Ôn tập và bổ sung' },
  { id: 'CD02', name: 'Chủ đề 2. Bảng nhân, bảng chia' },
  { id: 'CD03', name: 'Chủ đề 3. Làm quen với hình phẳng, hình khối' },
  { id: 'CD04', name: 'Chủ đề 4. Phép nhân, phép chia trong phạm vi 100 (học thêm)' },
] as const;

/** Trang cho bố mẹ: kỹ năng nào đã vững, kỹ năng nào cần ôn trước kì thi. */
export function ProgressPage() {
  const stats = useSkillStats();
  const stations = useStationStats();
  const byId = new Map(stats.map((s) => [s.skillId, s]));
  const stars = new Map(stations.map((s) => [s.stationId, s.bestStars]));
  const weak = ALL_SKILLS.filter((id) => levelOf(byId.get(id)) === 'can-on');
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-extrabold text-primary text-center">📊 Bảng tiến độ</h1>
      <p className="text-center font-semibold">Dành cho bố mẹ · Toán 3 Kết nối tri thức · ôn thi giữa học kì 1</p>

      {weak.length > 0 && (
        <section className="sticker p-4 bg-secondary/30">
          <h2 className="text-2xl font-bold mb-2">Nên ôn thêm trước khi thi</h2>
          <ul className="list-disc pl-6 text-lg font-semibold">
            {weak.map((id) => (
              <li key={id}>
                {SKILLS[id].name} <span className="opacity-70">({SKILLS[id].lessons})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {TOPICS.map((t) => (
        <section key={t.id} className="sticker p-4">
          <h2 className="text-2xl font-bold mb-3">{t.name}</h2>
          <div className="flex flex-col gap-2">
            {ALL_SKILLS.filter((id) => SKILLS[id].topicId === t.id).map((id) => {
              const s = byId.get(id);
              const level = LEVEL[levelOf(s)];
              return (
                <div key={id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_10rem_8rem_auto] items-center gap-2 rounded-2xl bg-base-200 px-3 py-2">
                  <span className="font-semibold">
                    {SKILLS[id].name} <span className="text-sm opacity-60">{SKILLS[id].lessons}</span>
                  </span>
                  <progress className="progress progress-primary h-3 hidden md:block" value={s?.mastery ?? 0} max={100} />
                  <span className="text-sm hidden md:block">{s ? `Đúng ngay ${Math.round(accuracy(s) * 100)}% / ${s.attempts} câu` : '—'}</span>
                  <span className={`badge ${level.cls} font-bold`}>{level.text}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="sticker p-4">
        <h2 className="text-2xl font-bold mb-3">Các trạm ôn thi</h2>
        <div className="grid md:grid-cols-2 gap-2">
          {STATIONS.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl bg-base-200 px-3 py-2">
              <span className="font-semibold">
                {s.emoji} {s.title}
              </span>
              <Stars count={stars.get(s.id) ?? 0} size="text-xl" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-2">
        <Link to="/xem-truoc" className="btn btn-secondary rounded-full">
          👀 Xem trước câu hỏi của từng dạng bài
        </Link>
        {confirmReset ? (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-secondary/40 p-3">
            <span className="font-semibold">Xoá toàn bộ tiến độ, cà rốt và tranh của bé trên máy này?</span>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                void resetAll();
                setConfirmReset(false);
              }}
            >
              Xoá hẳn
            </button>
            <button type="button" className="btn btn-sm bg-base-100" onClick={() => setConfirmReset(false)}>
              Thôi
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(true)}>
            Xoá dữ liệu và bắt đầu lại
          </button>
        )}
      </section>
    </div>
  );
}
