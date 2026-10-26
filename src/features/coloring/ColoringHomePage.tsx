import { useState } from 'react';
import { Link } from 'react-router';
import { COLORING_SKILLS, type ColoringSkill } from '../../engine/questions/coloring';
import { useArtworks } from '../../engine/progress/store';
import { PICTURE_BY_ID, PICTURES } from './pictures';
import { PictureSvg } from './PictureSvg';

export function ColoringHomePage() {
  const [skill, setSkill] = useState<ColoringSkill>('nhan-6-9');
  const artworks = useArtworks();
  const done = new Set(artworks.map((a) => a.pictureId));
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-primary">🎨 Xưởng Tô Màu</h1>
        <p className="text-lg font-semibold">Giải phép tính để biết vùng đó tô màu gì — bức tranh bí mật sẽ hiện ra!</p>
      </div>

      <section className="sticker p-4">
        <h2 className="text-2xl font-bold mb-3">1. Chọn phép tính</h2>
        <div className="flex flex-wrap gap-2">
          {COLORING_SKILLS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSkill(s.id)}
              className={`btn rounded-full ${skill === s.id ? 'btn-primary' : 'bg-base-100 border-2 border-base-300'}`}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>
      </section>

      <section className="sticker p-4">
        <h2 className="text-2xl font-bold mb-3">2. Chọn tranh</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PICTURES.map((p) => (
            <div key={p.id} className="rounded-3xl bg-base-200 p-3 flex flex-col items-center gap-2">
              <Link to={`/to-mau/${p.id}?phep=${skill}`} className="w-full flex flex-col items-center gap-2" aria-label={`Tô ${p.name}`}>
                <PictureSvg picture={p} fills={{}} className="w-full max-w-48 bg-base-100 rounded-2xl" />
                <span className="font-display text-xl font-bold text-center">
                  {p.emoji} {p.name}
                </span>
              </Link>
              {done.has(p.id) && (
                <Link to={`/to-mau/${p.id}?tu-do=1`} className="btn btn-sm btn-accent rounded-full">
                  🖍️ Tô tự do
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="sticker p-4">
        <h2 className="text-2xl font-bold mb-3">🖼️ Bộ sưu tập của con</h2>
        {artworks.length === 0 ? (
          <p className="text-lg">Chưa có tranh nào. Tô xong một tranh là tranh sẽ được treo ở đây!</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {artworks.map((a) => {
              const p = PICTURE_BY_ID.get(a.pictureId);
              return p ? (
                <figure key={a.id} className="rounded-2xl bg-base-100 border-4 border-warning p-1 anim-pop">
                  <PictureSvg picture={p} fills={a.fills} className="w-full" />
                  <figcaption className="text-xs text-center font-semibold">{new Date(a.completedAt).toLocaleDateString('vi-VN')}</figcaption>
                </figure>
              ) : null;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
