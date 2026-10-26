import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { STARTING_CARROTS, addCarrots, buyItem, createProfile, equipItem, finishStation, recordAnswer, resetAll } from './store';

beforeEach(async () => {
  await resetAll();
  await createProfile('Mai');
});

describe('lưu tiến độ', () => {
  it('cộng cà rốt và mua đồ', async () => {
    await addCarrots(10);
    expect((await db.profile.get('me'))!.carrots).toBe(STARTING_CARROTS + 10);
    expect(await buyItem('no-hong', 25)).toBe(true);
    expect(await buyItem('no-hong', 25)).toBe(false);
    expect(await buyItem('vuong-mien', 999)).toBe(false);
    const p = (await db.profile.get('me'))!;
    expect(p.carrots).toBe(STARTING_CARROTS + 10 - 25);
    expect(p.owned).toEqual(['no-hong']);
  });

  it('không cho cà rốt âm', async () => {
    await addCarrots(-1000);
    expect((await db.profile.get('me'))!.carrots).toBe(0);
  });

  it('mặc / cởi đồ', async () => {
    await equipItem('dau', 'no-hong');
    expect((await db.profile.get('me'))!.equipped.dau).toBe('no-hong');
    await equipItem('dau', undefined);
    expect((await db.profile.get('me'))!.equipped.dau).toBeUndefined();
  });

  it('ghi câu trả lời và giữ số sao cao nhất', async () => {
    await recordAnswer('bang-nhan-6-9', 'first', 'practice');
    await recordAnswer('bang-nhan-6-9', 'wrong', 'exam');
    const s = (await db.skills.get('bang-nhan-6-9'))!;
    expect(s.attempts).toBe(2);
    expect(s.firstTry).toBe(1);
    expect(await db.answers.count()).toBe(2);
    await finishStation('bang-6-9', 3);
    await finishStation('bang-6-9', 1);
    expect((await db.stations.get('bang-6-9'))!.bestStars).toBe(3);
  });
});
