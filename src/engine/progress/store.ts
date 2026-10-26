import { useEffect, useState } from 'react';
import { db, type Artwork, type Profile, type Slot, type StationStat } from './db';
import { emptyStat, updateStat, type AnswerResult, type SkillStat } from './mastery';

export const STARTING_CARROTS = 20;

// Báo cho các màn hình đang mở đọc lại dữ liệu sau mỗi lần ghi.
// (Không dùng liveQuery của Dexie vì nó không chạy với kho tạm trong bộ nhớ khi trình duyệt chặn IndexedDB.)
const listeners = new Set<() => void>();
function changed() {
  listeners.forEach((l) => l());
}

export async function createProfile(name: string): Promise<Profile> {
  const profile: Profile = { id: 'me', name: name.trim() || 'Bé', carrots: STARTING_CARROTS, owned: [], equipped: {}, createdAt: Date.now() };
  await db.profile.put(profile);
  changed();
  return profile;
}

export async function addCarrots(n: number): Promise<void> {
  if (n === 0) return;
  await db.profile.where('id').equals('me').modify((p) => {
    p.carrots = Math.max(0, p.carrots + n);
  });
  changed();
}

export async function recordAnswer(skillId: string, result: AnswerResult, mode: 'practice' | 'exam'): Promise<void> {
  const now = Date.now();
  await db.transaction('rw', db.skills, db.answers, async () => {
    const prev = (await db.skills.get(skillId)) ?? emptyStat(skillId);
    await db.skills.put(updateStat(prev, result, now));
    await db.answers.add({ skillId, result, mode, at: now });
  });
  changed();
}

export async function finishStation(stationId: string, stars: number): Promise<void> {
  const prev = await db.stations.get(stationId);
  await db.stations.put({
    stationId,
    bestStars: Math.max(prev?.bestStars ?? 0, stars),
    plays: (prev?.plays ?? 0) + 1,
    lastAt: Date.now(),
  });
  changed();
}

/** Mua đồ bằng cà rốt. Trả về false nếu chưa đủ cà rốt hoặc đã có. */
export async function buyItem(itemId: string, price: number): Promise<boolean> {
  const ok = await db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get('me');
    if (!p || p.owned.includes(itemId) || p.carrots < price) return false;
    await db.profile.put({ ...p, carrots: p.carrots - price, owned: [...p.owned, itemId] });
    return true;
  });
  if (ok) changed();
  return ok;
}

export async function equipItem(slot: Slot, itemId: string | undefined): Promise<void> {
  await db.profile.where('id').equals('me').modify((p) => {
    if (itemId) p.equipped[slot] = itemId;
    else delete p.equipped[slot];
  });
  changed();
}

export async function saveArtwork(pictureId: string, fills: Record<string, string>): Promise<void> {
  await db.artworks.add({ pictureId, fills, completedAt: Date.now() });
  changed();
}

export async function resetAll(): Promise<void> {
  await Promise.all([db.profile.clear(), db.skills.clear(), db.stations.clear(), db.artworks.clear(), db.answers.clear()]);
  changed();
}

/** Đọc dữ liệu và tự đọc lại sau mỗi lần ghi. `query` phải là hàm cố định (khai báo ngoài component). */
function useDbQuery<T>(query: () => Promise<T>, initial: T): T {
  const [state, setState] = useState(initial);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  useEffect(() => {
    let alive = true;
    void query().then((v) => {
      if (alive) setState(v);
    });
    return () => {
      alive = false;
    };
  }, [query, tick]);
  return state;
}

const readProfile = async (): Promise<Profile | undefined> => (await db.profile.get('me')) ?? undefined;
const readSkills = (): Promise<SkillStat[]> => db.skills.toArray();
const readStations = (): Promise<StationStat[]> => db.stations.toArray();
const readArtworks = (): Promise<Artwork[]> => db.artworks.orderBy('completedAt').reverse().toArray();

/** null = đang tải; undefined = chưa có hồ sơ. */
export function useProfile(): Profile | undefined | null {
  return useDbQuery<Profile | undefined | null>(readProfile, null);
}

export function useSkillStats() {
  return useDbQuery(readSkills, []);
}

export function useStationStats() {
  return useDbQuery(readStations, []);
}

export function useArtworks() {
  return useDbQuery(readArtworks, []);
}
