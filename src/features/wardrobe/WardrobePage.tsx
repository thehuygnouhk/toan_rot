import { useState } from 'react';
import { Link } from 'react-router';
import type { Slot } from '../../engine/progress/db';
import { ACHIEVEMENTS, achievementProgress } from '../../engine/progress/rewards';
import { buyItem, claimItem, equipItem, setItemColor, useAchievementData, useProfile } from '../../engine/progress/store';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { ITEM_BY_ID, ITEMS, PALETTE, SLOT_NAMES, type WardrobeItem } from './items';

const SLOTS = Object.keys(SLOT_NAMES) as Slot[];

export function WardrobePage() {
  const profile = useProfile();
  const achievements = useAchievementData();
  const [slot, setSlot] = useState<Slot>('than');
  const [message, setMessage] = useState('');
  const [hop, setHop] = useState(0);
  if (!profile) return null;

  const colors = profile.colors ?? {};
  const wornId = profile.equipped[slot];
  const worn = wornId ? ITEM_BY_ID.get(wornId) : undefined;

  async function tap(item: WardrobeItem) {
    if (!profile) return;
    const owned = profile.owned.includes(item.id);
    if (!owned && item.unlock) {
      const progress = achievementProgress(item.unlock, achievements);
      if (!progress.done) {
        sfx.tap();
        setMessage(`🔒 ${ACHIEVEMENTS[item.unlock].text} để nhận ${item.name} nhé! (${progress.value}/${progress.goal})`);
        return;
      }
      await claimItem(item.id);
      await equipItem(item.slot, item.id);
      sfx.reward();
      celebrate(true);
      setMessage(`🎁 Con đã nhận ${item.name}! Đồ đặc biệt chỉ dành cho bạn chăm học.`);
      setHop((h) => h + 1);
      return;
    }
    if (!owned) {
      if (profile.carrots < item.price) {
        sfx.tryAgain();
        setMessage(`Cần thêm ${item.price - profile.carrots} 🥕 nữa. Mình đi ôn bài để kiếm cà rốt nhé!`);
        return;
      }
      if (await buyItem(item.id, item.price)) {
        sfx.reward();
        celebrate();
        await equipItem(item.slot, item.id);
        setMessage(`Đã mua ${item.name}!${item.color ? ' Con thử đổi màu cho đẹp nhé 🎨' : ' Thỏ Rốt đẹp quá!'}`);
        setHop((h) => h + 1);
      }
      return;
    }
    sfx.tap();
    const wearing = profile.equipped[item.slot] === item.id;
    await equipItem(item.slot, wearing ? undefined : item.id);
    setMessage(wearing ? `Đã cởi ${item.name}.` : `Đã mặc ${item.name}.`);
    setHop((h) => h + 1);
  }

  async function paint(color: string) {
    if (!worn?.color) return;
    sfx.fill();
    await setItemColor(worn.id, color);
    setMessage(`${worn.name} đổi màu rồi! Xinh quá!`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-extrabold text-primary text-center">👗 Tủ đồ của Thỏ Rốt</h1>
      <div className="grid lg:grid-cols-[21rem_1fr] gap-4 items-start">
        <div className="sticker p-4 flex flex-col sm:flex-row lg:flex-col items-center gap-4 lg:sticky lg:top-24">
          <Bunny key={hop} mood="cheer" equipped={profile.equipped} colors={colors} background className="w-48 sm:w-52 lg:w-56 shrink-0 anim-hop rounded-3xl" />
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="font-display text-2xl font-bold">🥕 {profile.carrots} cà rốt</p>
            {message && <p className="text-center font-semibold bg-secondary/40 rounded-2xl px-3 py-2">{message}</p>}
            {worn?.color && (
              <div className="w-full">
                <p className="font-display text-lg font-bold mb-2">🎨 Đổi màu {worn.name}</p>
                <div className="grid grid-cols-5 gap-1.5 max-w-xs mx-auto">
                  {PALETTE.map((c) => {
                    const current = (colors[worn.id] ?? worn.color) === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Màu ${c}`}
                        onClick={() => paint(c)}
                        className={`aspect-square rounded-full border-4 shadow transition-transform active:scale-90 ${current ? 'border-primary scale-105' : 'border-white'}`}
                        style={{ background: c }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            <Link to="/on-thi" className="btn btn-primary rounded-full">
              🎯 Ôn bài kiếm cà rốt
            </Link>
          </div>
        </div>
        <div className="sticker p-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="tablist">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={slot === s}
                onClick={() => {
                  setSlot(s);
                  setMessage('');
                }}
                className={`btn rounded-full ${slot === s ? 'btn-primary' : 'bg-base-100 border-2 border-base-300'}`}
              >
                {SLOT_NAMES[s]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ITEMS.filter((i) => i.slot === slot).map((item) => {
              const owned = profile.owned.includes(item.id);
              const wearing = profile.equipped[item.slot] === item.id;
              const progress = item.unlock ? achievementProgress(item.unlock, achievements) : undefined;
              const locked = !owned && progress && !progress.done;
              const claimable = !owned && progress?.done;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => tap(item)}
                  className={`relative rounded-3xl border-4 p-2 flex flex-col items-center gap-1 bg-base-100 transition-transform active:scale-95 ${
                    wearing ? 'border-primary' : claimable ? 'border-warning anim-float' : 'border-base-300'
                  }`}
                >
                  {item.unlock && <span className="absolute top-1 left-1 z-10 badge badge-warning badge-sm font-bold whitespace-nowrap">⭐ Đặc biệt</span>}
                  <Bunny
                    equipped={{ [item.slot]: item.id }}
                    colors={colors}
                    background={item.slot === 'nen'}
                    className={`w-full max-w-28 rounded-2xl ${locked ? 'opacity-50 grayscale-[40%]' : ''}`}
                    title={item.name}
                  />
                  <span className="font-display text-lg font-bold leading-tight text-center">{item.name}</span>
                  <span
                    className={`badge badge-lg font-bold h-auto py-1 ${
                      wearing ? 'badge-primary' : owned ? 'badge-success' : claimable ? 'badge-warning' : locked ? 'badge-ghost' : 'badge-accent'
                    }`}
                  >
                    {wearing ? 'Đang mặc' : owned ? 'Đã có' : claimable ? '🎁 Nhận quà' : locked ? `🔒 ${progress.value}/${progress.goal}` : `🥕 ${item.price}`}
                  </span>
                  {locked && item.unlock && <span className="text-sm font-semibold opacity-80 text-center leading-tight">{ACHIEVEMENTS[item.unlock].text}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
