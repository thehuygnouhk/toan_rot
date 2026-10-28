import { useState } from 'react';
import { Link } from 'react-router';
import { ALL_QUESTS_BONUS, dayKey, flowerFor, QUEST_REWARD, questProgress, questsFor } from '../../engine/progress/rewards';
import { claimQuest, claimQuestBonus, createProfile, STARTING_CARROTS, useLearningDays, useProfile, useToday } from '../../engine/progress/store';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { speak } from '../../ui/speech';

const TILES = [
  { to: '/tro-choi', emoji: '🎮', title: 'Trò chơi', sub: 'Hứng kẹo, bóng bay, lật thẻ…', color: 'bg-success text-success-content' },
  { to: '/san-dien', emoji: '✨', title: 'Sàn diễn thời trang', sub: 'Giải toán để trình diễn', color: 'bg-secondary text-secondary-content' },
  { to: '/tu-do', emoji: '👗', title: 'Tủ đồ Thỏ Rốt', sub: 'Mua váy, đổi màu, nhận quà', color: 'bg-accent text-accent-content' },
  { to: '/to-mau', emoji: '🎨', title: 'Xưởng Tô Màu', sub: 'Giải toán để tô tranh', color: 'bg-info text-info-content' },
];

export function HomePage() {
  const profile = useProfile();
  const days = useLearningDays();
  const [today] = useState(() => dayKey(Date.now()));
  if (profile === null) return null;
  if (!profile) return <Welcome />;
  const learnedToday = days.includes(today);
  const shown = days.slice(-12);
  return (
    <div className="flex flex-col gap-5">
      <section className="sticker p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <Bunny mood="happy" equipped={profile.equipped} colors={profile.colors} background className="w-28 md:w-36 rounded-3xl anim-float shrink-0" />
        <div className="flex flex-col gap-2">
          <p className="font-display text-3xl md:text-4xl font-extrabold">Chào {profile.name}! 👋</p>
          <p className="text-lg md:text-xl font-semibold">Làm nhiệm vụ hôm nay để nhận cà rốt, mua đồ xinh cho Thỏ Rốt nhé!</p>
          <div className="rounded-2xl bg-base-200 px-3 py-2" aria-label={`Vườn hoa: ${days.length} ngày học`}>
            <p className="font-bold">🌷 Vườn hoa chăm học: {days.length} bông</p>
            <p className="text-2xl tracking-wider">
              {days.length > shown.length && <span className="text-base font-bold">+{days.length - shown.length} </span>}
              {shown.map((d, i) => (
                <span key={d} title={d}>
                  {flowerFor(days.length - shown.length + i)}
                </span>
              ))}
              {!learnedToday && <span title="Hôm nay">🌱</span>}
            </p>
            {!learnedToday && <p className="text-sm font-semibold opacity-80">Hôm nay làm bài là nụ 🌱 nở thành hoa!</p>}
          </div>
        </div>
      </section>

      <DailyQuests day={today} />

      <Link
        to="/on-thi"
        onClick={() => sfx.tap()}
        className="rounded-[2rem] border-4 border-white shadow-lg p-4 md:p-5 flex items-center justify-center gap-4 bg-primary text-primary-content transition-transform hover:scale-[1.01] active:scale-95"
      >
        <span className="text-5xl md:text-6xl">🎯</span>
        <span className="flex flex-col text-left">
          <span className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">Ôn thi giữa kì 1</span>
          <span className="text-base sm:text-lg font-semibold opacity-90">Bài 1 → Bài 22 · trạm ôn và đề thi thử</span>
        </span>
      </Link>

      <div className="grid grid-cols-2 gap-4">
        {TILES.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            onClick={() => sfx.tap()}
            className={`rounded-[2rem] border-4 border-white shadow-lg p-3 sm:p-4 md:p-6 flex flex-col items-center text-center gap-1 transition-transform hover:scale-[1.02] active:scale-95 ${t.color}`}
          >
            <span className="text-4xl sm:text-5xl md:text-6xl">{t.emoji}</span>
            <span className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">{t.title}</span>
            <span className="text-sm sm:text-base md:text-lg font-semibold opacity-90">{t.sub}</span>
          </Link>
        ))}
      </div>

      <Link to="/tien-do" className="btn btn-lg rounded-full self-center bg-base-100 border-2 border-base-300">
        📊 Bảng tiến độ (dành cho bố mẹ)
      </Link>
    </div>
  );
}

/** 3 nhiệm vụ mỗi ngày (1 làm bài, 1 hoàn thành trạm, 1 sáng tạo); xong cả 3 được mở hộp quà. */
function DailyQuests({ day }: { day: string }) {
  const profile = useProfile();
  const today = useToday();
  const quests = questsFor(day);
  const claimed = profile?.quests?.day === day ? profile.quests.claimed : [];
  const bonusTaken = profile?.quests?.day === day && profile.quests.bonus;
  const allClaimed = quests.every((q) => claimed.includes(q.id));

  async function claim(id: string) {
    if (await claimQuest(day, id, QUEST_REWARD)) {
      sfx.reward();
      celebrate();
    }
  }

  async function openGift() {
    if (await claimQuestBonus(day)) {
      sfx.reward();
      celebrate(true);
      speak(`Giỏi quá! Con đã xong cả ba nhiệm vụ. Thỏ Rốt tặng con ${ALL_QUESTS_BONUS} củ cà rốt!`);
    }
  }

  return (
    <section className="sticker p-4 flex flex-col gap-3">
      <h2 className="font-display text-2xl font-extrabold">📋 Nhiệm vụ hôm nay</h2>
      <ul className="flex flex-col gap-2">
        {quests.map((q) => {
          const value = questProgress(q, today);
          const done = value >= q.goal;
          const taken = claimed.includes(q.id);
          return (
            <li key={q.id} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${taken ? 'bg-success/30' : 'bg-base-200'}`}>
              <span className="text-3xl">{q.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-lg leading-tight">{q.text}</span>
                <progress className="progress progress-primary h-3 w-full" value={value} max={q.goal} aria-label={`${value} trên ${q.goal}`} />
              </span>
              {taken ? (
                <span className="badge badge-success badge-lg font-bold h-auto py-2">✔ Đã nhận</span>
              ) : done ? (
                <button type="button" className="btn btn-warning rounded-full min-h-14 anim-float" onClick={() => claim(q.id)}>
                  Nhận 🥕 {QUEST_REWARD}
                </button>
              ) : (
                <Link to={q.to} className="btn btn-primary btn-outline rounded-full min-h-14">
                  {value}/{q.goal} · Làm
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {allClaimed &&
        (bonusTaken ? (
          <p className="text-center font-bold text-lg">🎉 Hôm nay con đã xong hết nhiệm vụ. Mai mình gặp lại nhé!</p>
        ) : (
          <button type="button" className="btn btn-accent btn-lg rounded-full self-center anim-float" onClick={openGift}>
            🎁 Mở hộp quà · 🥕 {ALL_QUESTS_BONUS}
          </button>
        ))}
    </section>
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
