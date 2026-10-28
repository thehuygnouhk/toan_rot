import { useEffect, useState } from 'react';
import { db, type Artwork, type Profile, type Slot, type StationStat } from './db';
import { emptyStat, updateStat, type AnswerResult, type SkillStat } from './mastery';
import { ALL_QUESTS_BONUS, learningDays, startOfDay, type AchievementData, type TodayData } from './rewards';

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
    p.dressedAt = Date.now();
  });
  changed();
}

/** Bé tự chọn màu cho món đồ đã có. */
export async function setItemColor(itemId: string, color: string): Promise<void> {
  await db.profile.where('id').equals('me').modify((p) => {
    p.colors = { ...p.colors, [itemId]: color };
    p.dressedAt = Date.now();
  });
  changed();
}

/** Nhận đồ đặc biệt (miễn phí) khi đã đạt thành tích. */
export async function claimItem(itemId: string): Promise<void> {
  await db.profile.where('id').equals('me').modify((p) => {
    if (!p.owned.includes(itemId)) p.owned = [...p.owned, itemId];
  });
  changed();
}

/** Nhận thưởng một nhiệm vụ trong ngày `day`. Trả về false nếu đã nhận rồi. */
export async function claimQuest(day: string, questId: string, reward: number): Promise<boolean> {
  const ok = await db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get('me');
    if (!p) return false;
    const quests = p.quests?.day === day ? p.quests : { day, claimed: [], bonus: false };
    if (quests.claimed.includes(questId)) return false;
    await db.profile.put({ ...p, carrots: p.carrots + reward, quests: { ...quests, claimed: [...quests.claimed, questId] } });
    return true;
  });
  if (ok) changed();
  return ok;
}

/** Hộp quà khi xong cả 3 nhiệm vụ trong ngày. */
export async function claimQuestBonus(day: string): Promise<boolean> {
  const ok = await db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get('me');
    if (!p || p.quests?.day !== day || p.quests.bonus || p.quests.claimed.length < 3) return false;
    await db.profile.put({ ...p, carrots: p.carrots + ALL_QUESTS_BONUS, quests: { ...p.quests, bonus: true } });
    return true;
  });
  if (ok) changed();
  return ok;
}

/** Chơi xong một mini-game: lưu sao cao nhất, thưởng cà rốt. */
export async function finishGame(gameId: string, stars: number, bonus: number): Promise<void> {
  await db.profile.where('id').equals('me').modify((p) => {
    const prev = p.games?.[gameId];
    p.games = { ...p.games, [gameId]: { best: Math.max(prev?.best ?? 0, stars), plays: (prev?.plays ?? 0) + 1 } };
    p.lastGameAt = Date.now();
    p.carrots += bonus;
  });
  changed();
}

/** Xong một buổi trình diễn trên Sàn diễn. */
export async function finishShow(bonus: number): Promise<void> {
  await db.profile.where('id').equals('me').modify((p) => {
    p.shows = (p.shows ?? 0) + 1;
    p.lastShowAt = Date.now();
    p.carrots += bonus;
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

const readLearningDays = async (): Promise<string[]> => learningDays((await db.answers.orderBy('at').keys()) as number[]);

async function readToday(): Promise<TodayData> {
  const start = startOfDay(Date.now());
  const [answers, stations, artworks, profile] = await Promise.all([
    db.answers.where('at').aboveOrEqual(start).toArray(),
    db.stations.toArray(),
    db.artworks.where('completedAt').aboveOrEqual(start).count(),
    db.profile.get('me'),
  ]);
  return {
    correct: answers.filter((a) => a.result !== 'wrong').length,
    stationsDone: stations.filter((s) => s.lastAt >= start).map((s) => s.stationId),
    artworks,
    dressed: (profile?.dressedAt ?? 0) >= start,
    showed: (profile?.lastShowAt ?? 0) >= start,
    played: (profile?.lastGameAt ?? 0) >= start,
  };
}

const EMPTY_TODAY: TodayData = { correct: 0, stationsDone: [], artworks: 0, dressed: false, showed: false, played: false };

async function readAchievementData(): Promise<AchievementData> {
  const [stations, artworks, profile, days] = await Promise.all([db.stations.toArray(), db.artworks.count(), db.profile.get('me'), readLearningDays()]);
  return {
    practiceStars: stations.filter((s) => s.stationId !== 'de-thi-thu').map((s) => s.bestStars),
    examStars: stations.find((s) => s.stationId === 'de-thi-thu')?.bestStars ?? 0,
    shows: profile?.shows ?? 0,
    artworks,
    days: days.length,
  };
}

const EMPTY_ACHIEVEMENTS: AchievementData = { practiceStars: [], examStars: 0, shows: 0, artworks: 0, days: 0 };

/** Các ngày bé đã học (cho vườn hoa). */
export function useLearningDays() {
  return useDbQuery(readLearningDays, []);
}

export function useToday() {
  return useDbQuery(readToday, EMPTY_TODAY);
}

export function useAchievementData() {
  return useDbQuery(readAchievementData, EMPTY_ACHIEVEMENTS);
}

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
