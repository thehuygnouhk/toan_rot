import { Link } from 'react-router';
import { useStationStats } from '../../engine/progress/store';
import { Stars } from '../../ui/bits';
import { STATIONS } from './stations';

/** Bản đồ ôn thi giữa kì 1: các trạm nối nhau như một con đường. */
export function ReviewMapPage() {
  const stats = useStationStats();
  const stars = new Map(stats.map((s) => [s.stationId, s.bestStars]));
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-primary">Ôn thi giữa kì 1</h1>
        <p className="text-lg font-semibold opacity-80">Toán 3 · Kết nối tri thức · Bài 1 → Bài 22</p>
      </div>
      <ol className="relative flex flex-col gap-4 before:absolute before:left-9 before:top-6 before:bottom-6 before:border-l-4 before:border-dashed before:border-secondary md:before:left-11">
        {STATIONS.map((s, i) => {
          const exam = s.mode === 'exam';
          return (
            <li key={s.id} className="relative">
              <Link
                to={`/on-thi/${s.id}`}
                className={`sticker flex items-center gap-4 p-3 md:p-4 hover:scale-[1.01] transition-transform ${exam ? 'bg-warning/60' : ''}`}
              >
                <span className={`relative z-10 grid place-items-center shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full text-3xl md:text-4xl border-4 border-white shadow ${exam ? 'bg-accent' : 'bg-base-300'}`}>
                  {s.emoji}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold opacity-70">
                    {exam ? 'Thử sức' : `Trạm ${i + 1}`} · {s.lessons} · {s.count} câu
                  </span>
                  <span className="block font-display text-2xl font-bold leading-tight">{s.title}</span>
                </span>
                <Stars count={stars.get(s.id) ?? 0} size="text-2xl" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
