import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, type AchievementId } from '../../engine/progress/rewards';
import { ITEMS, SLOT_NAMES } from './items';

describe('tủ đồ', () => {
  it('mã đồ không trùng, ngăn nào cũng có ít nhất 2 món', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const slot of Object.keys(SLOT_NAMES)) expect(ITEMS.filter((i) => i.slot === slot).length, slot).toBeGreaterThanOrEqual(2);
  });

  it('đồ đặc biệt không bán, đồ thường có giá; mỗi thành tích mở đúng một món', () => {
    for (const item of ITEMS) {
      if (item.unlock) expect(item.price, item.id).toBe(0);
      else expect(item.price, item.id).toBeGreaterThan(0);
    }
    const unlocks = ITEMS.flatMap((i) => (i.unlock ? [i.unlock] : []));
    expect(new Set(unlocks)).toEqual(new Set(Object.keys(ACHIEVEMENTS) as AchievementId[]));
    expect(unlocks.length).toBe(Object.keys(ACHIEVEMENTS).length);
  });
});
