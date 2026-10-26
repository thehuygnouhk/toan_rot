import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Profile, type Slot } from './db';
import { emptyStat, updateStat, type AnswerResult } from './mastery';

export const STARTING_CARROTS = 20;

export async function createProfile(name: string): Promise<Profile> {
  const profile: Profile = { id: 'me', name: name.trim() || 'Bé', carrots: STARTING_CARROTS, owned: [], equipped: {}, createdAt: Date.now() };
  await db.profile.put(profile);
  return profile;
}

export async function addCarrots(n: number): Promise<void> {
  if (n === 0) return;
  await db.profile.where('id').equals('me').modify((p) => {
    p.carrots = Math.max(0, p.carrots + n);
  });
}

export async function recordAnswer(skillId: string, result: AnswerResult, mode: 'practice' | 'exam'): Promise<void> {
  const now = Date.now();
  await db.transaction('rw', db.skills, db.answers, async () => {
    const prev = (await db.skills.get(skillId)) ?? emptyStat(skillId);
    await db.skills.put(updateStat(prev, result, now));
    await db.answers.add({ skillId, result, mode, at: now });
  });
}

export async function finishStation(stationId: string, stars: number): Promise<void> {
  const prev = await db.stations.get(stationId);
  await db.stations.put({
    stationId,
    bestStars: Math.max(prev?.bestStars ?? 0, stars),
    plays: (prev?.plays ?? 0) + 1,
    lastAt: Date.now(),
  });
}

/** Mua đồ bằng cà rốt. Trả về false nếu chưa đủ cà rốt hoặc đã có. */
export async function buyItem(itemId: string, price: number): Promise<boolean> {
  return db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get('me');
    if (!p || p.owned.includes(itemId) || p.carrots < price) return false;
    await db.profile.put({ ...p, carrots: p.carrots - price, owned: [...p.owned, itemId] });
    return true;
  });
}

export async function equipItem(slot: Slot, itemId: string | undefined): Promise<void> {
  await db.profile.where('id').equals('me').modify((p) => {
    if (itemId) p.equipped[slot] = itemId;
    else delete p.equipped[slot];
  });
}

export async function saveArtwork(pictureId: string, fills: Record<string, string>): Promise<void> {
  await db.artworks.add({ pictureId, fills, completedAt: Date.now() });
}

export async function resetAll(): Promise<void> {
  await Promise.all([db.profile.clear(), db.skills.clear(), db.stations.clear(), db.artworks.clear(), db.answers.clear()]);
}

/** null = đang tải; undefined = chưa có hồ sơ. */
export function useProfile(): Profile | undefined | null {
  return useLiveQuery(async () => (await db.profile.get('me')) ?? undefined, [], null);
}

export function useSkillStats() {
  return useLiveQuery(() => db.skills.toArray(), [], []);
}

export function useStationStats() {
  return useLiveQuery(() => db.stations.toArray(), [], []);
}

export function useArtworks() {
  return useLiveQuery(() => db.artworks.orderBy('completedAt').reverse().toArray(), [], []);
}
