import { Link } from 'react-router';
import { Stars } from '../../ui/bits';
import { Bunny } from '../../ui/Bunny';

export interface Summary {
  stars: number;
  carrots: number;
  line: string;
}

/** Màn kết thúc chung cho mọi trò chơi: luôn là phần thưởng, không có "thua". */
export function GameSummary({ summary, onAgain }: { summary: Summary; onAgain: () => void }) {
  return (
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
  );
}
