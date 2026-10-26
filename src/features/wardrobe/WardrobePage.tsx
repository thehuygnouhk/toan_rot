import { useState } from 'react';
import { Link } from 'react-router';
import type { Slot } from '../../engine/progress/db';
import { buyItem, equipItem, useProfile } from '../../engine/progress/store';
import { Bunny } from '../../ui/Bunny';
import { celebrate } from '../../ui/celebrate';
import { sfx } from '../../ui/sound';
import { ITEMS, SLOT_NAMES, type WardrobeItem } from './items';

const SLOTS = Object.keys(SLOT_NAMES) as Slot[];

export function WardrobePage() {
  const profile = useProfile();
  const [slot, setSlot] = useState<Slot>('dau');
  const [message, setMessage] = useState('');
  const [hop, setHop] = useState(0);
  if (!profile) return null;

  async function tap(item: WardrobeItem) {
    if (!profile) return;
    const owned = profile.owned.includes(item.id);
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
        setMessage(`Đã mua ${item.name}! Thỏ Rốt đẹp quá!`);
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-extrabold text-primary text-center">👗 Tủ đồ của Thỏ Rốt</h1>
      <div className="grid md:grid-cols-[18rem_1fr] gap-4 items-start">
        <div className="sticker p-4 flex flex-col items-center gap-2 md:sticky md:top-24">
          <Bunny key={hop} mood="cheer" equipped={profile.equipped} className="w-56 anim-hop" />
          <p className="font-display text-2xl font-bold">🥕 {profile.carrots} cà rốt</p>
          {message && <p className="text-center font-semibold bg-secondary/40 rounded-2xl px-3 py-2">{message}</p>}
          <Link to="/on-thi" className="btn btn-primary rounded-full">
            🎯 Ôn bài kiếm cà rốt
          </Link>
        </div>
        <div className="sticker p-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="tablist">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={slot === s}
                onClick={() => setSlot(s)}
                className={`btn rounded-full ${slot === s ? 'btn-primary' : 'bg-base-100 border-2 border-base-300'}`}
              >
                {SLOT_NAMES[s]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {ITEMS.filter((i) => i.slot === slot).map((item) => {
              const owned = profile.owned.includes(item.id);
              const wearing = profile.equipped[item.slot] === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => tap(item)}
                  className={`rounded-3xl border-4 p-2 flex flex-col items-center gap-1 bg-base-100 transition-transform active:scale-95 ${
                    wearing ? 'border-primary' : 'border-base-300'
                  }`}
                >
                  <Bunny equipped={{ [item.slot]: item.id }} className="w-28" title={item.name} />
                  <span className="font-display text-lg font-bold leading-tight">{item.name}</span>
                  <span className={`badge badge-lg font-bold ${wearing ? 'badge-primary' : owned ? 'badge-success' : 'badge-accent'}`}>
                    {wearing ? 'Đang mặc' : owned ? 'Đã có' : `🥕 ${item.price}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
