import { useState } from 'react';
import { Link } from 'react-router';
import { createProfile, STARTING_CARROTS, useProfile } from '../../engine/progress/store';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { speak } from '../../ui/speech';

const TILES = [
  { to: '/on-thi', emoji: '🎯', title: 'Ôn thi giữa kì 1', sub: 'Bài 1 → Bài 22', color: 'bg-primary text-primary-content' },
  { to: '/to-mau', emoji: '🎨', title: 'Xưởng Tô Màu', sub: 'Giải toán để tô tranh', color: 'bg-secondary text-secondary-content' },
  { to: '/tu-do', emoji: '👗', title: 'Tủ đồ Thỏ Rốt', sub: 'Mua váy, nơ, vương miện', color: 'bg-accent text-accent-content' },
  { to: '/tien-do', emoji: '📊', title: 'Bảng tiến độ', sub: 'Dành cho bố mẹ', color: 'bg-success text-success-content' },
];

export function HomePage() {
  const profile = useProfile();
  if (profile === null) return null;
  if (!profile) return <Welcome />;
  return (
    <div className="flex flex-col gap-5">
      <section className="sticker p-4 md:p-6 flex items-center gap-4">
        <Bunny mood="happy" equipped={profile.equipped} className="w-28 md:w-36 anim-float shrink-0" />
        <div>
          <p className="font-display text-3xl md:text-4xl font-extrabold">Chào {profile.name}! 👋</p>
          <p className="text-lg md:text-xl font-semibold">Hôm nay mình ôn thi giữa kì cùng Thỏ Rốt nhé. Làm đúng sẽ được cà rốt để mua đồ xinh!</p>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-4">
        {TILES.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            onClick={() => sfx.tap()}
            className={`rounded-[2rem] border-4 border-white shadow-lg p-4 md:p-6 flex flex-col items-center text-center gap-1 transition-transform hover:scale-[1.02] active:scale-95 ${t.color}`}
          >
            <span className="text-5xl md:text-6xl">{t.emoji}</span>
            <span className="font-display text-2xl md:text-3xl font-extrabold leading-tight">{t.title}</span>
            <span className="text-base md:text-lg font-semibold opacity-90">{t.sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Welcome() {
  const [name, setName] = useState('');
  return (
    <div className="sticker p-6 flex flex-col items-center gap-4 text-center max-w-xl mx-auto anim-pop">
      <Bunny mood="cheer" className="w-40 anim-float" />
      <h1 className="text-4xl font-extrabold text-primary">Xin chào! Mình là Thỏ Rốt!</h1>
      <p className="text-xl font-semibold">Mình sẽ cùng con ôn Toán lớp 3. Con tên là gì?</p>
      <form
        className="flex flex-col items-center gap-3 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          void createProfile(name).then((p) => {
            sfx.reward();
            celebrate(true);
            speak(`Chào ${p.name}! Thỏ Rốt tặng con ${STARTING_CARROTS} củ cà rốt.`);
          });
        }}
      >
        <input
          className="input input-lg w-full max-w-xs text-center text-2xl font-bold rounded-full border-4 border-base-300"
          placeholder="Tên của con"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          aria-label="Tên của con"
        />
        <button type="submit" className="btn btn-primary btn-lg rounded-full px-12 text-2xl">
          Bắt đầu 🥕
        </button>
      </form>
      <p className="text-sm opacity-70">Mọi thứ chỉ lưu trên máy này, không gửi đi đâu cả.</p>
    </div>
  );
}
