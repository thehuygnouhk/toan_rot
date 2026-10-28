// Logic thuần cho nhiệm vụ hằng ngày, vườn hoa chăm học và đồ đặc biệt (skill vong-lap-hoc-va-thuong).
// Không đụng IndexedDB để test được.

/** Ngày theo giờ trên máy của bé, dạng "2026-10-28". */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Các ngày (không trùng, tăng dần) bé đã học. Mỗi ngày nở một bông hoa; nghỉ một ngày không làm héo vườn. */
export function learningDays(times: number[]): string[] {
  return [...new Set(times.map(dayKey))].sort();
}

const FLOWERS = ['🌷', '🌸', '🌼', '🌻', '🌹', '🪻', '💐'];
export const flowerFor = (i: number) => FLOWERS[i % FLOWERS.length];

/** Những gì bé đã làm trong hôm nay — đủ để tính tiến độ nhiệm vụ. */
export interface TodayData {
  correct: number;
  stationsDone: string[];
  artworks: number;
  dressed: boolean;
  showed: boolean;
}

export type QuestId = 'dung-10' | 'dung-15' | 'xong-tram' | 'xong-2-tram' | 'thu-thach' | 'to-tranh' | 'thay-do' | 'san-dien';

export interface Quest {
  id: QuestId;
  emoji: string;
  text: string;
  goal: number;
  /** Trang để bé bấm vào làm ngay. */
  to: string;
}

const QUESTS: Record<QuestId, Quest> = {
  'dung-10': { id: 'dung-10', emoji: '✅', text: 'Trả lời đúng 10 câu', goal: 10, to: '/on-thi' },
  'dung-15': { id: 'dung-15', emoji: '✅', text: 'Trả lời đúng 15 câu', goal: 15, to: '/on-thi' },
  'xong-tram': { id: 'xong-tram', emoji: '🗺️', text: 'Hoàn thành 1 trạm ôn thi', goal: 1, to: '/on-thi' },
  'xong-2-tram': { id: 'xong-2-tram', emoji: '🗺️', text: 'Hoàn thành 2 trạm ôn thi khác nhau', goal: 2, to: '/on-thi' },
  'thu-thach': { id: 'thu-thach', emoji: '🧩', text: 'Hoàn thành trạm "Thử thách hình vẽ"', goal: 1, to: '/on-thi/thu-thach-hinh-ve' },
  'to-tranh': { id: 'to-tranh', emoji: '🎨', text: 'Tô xong 1 bức tranh', goal: 1, to: '/to-mau' },
  'thay-do': { id: 'thay-do', emoji: '👗', text: 'Thay đồ hoặc đổi màu váy cho Thỏ Rốt', goal: 1, to: '/tu-do' },
  'san-dien': { id: 'san-dien', emoji: '✨', text: 'Trình diễn 1 lần trên Sàn diễn', goal: 1, to: '/san-dien' },
};

export const QUEST_REWARD = 5;
export const ALL_QUESTS_BONUS = 10;

function hash(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** 3 nhiệm vụ của một ngày: 1 làm bài, 1 hoàn thành trạm, 1 sáng tạo. Cố định trong cả ngày. */
export function questsFor(day: string): Quest[] {
  const h = hash(day);
  const learn: QuestId[] = ['dung-10', 'dung-15'];
  const station: QuestId[] = ['xong-tram', 'xong-2-tram', 'thu-thach'];
  const creative: QuestId[] = ['to-tranh', 'thay-do', 'san-dien'];
  return [learn[h % 2], station[Math.floor(h / 2) % 3], creative[Math.floor(h / 6) % 3]].map((id) => QUESTS[id]);
}

export function questProgress(quest: Quest, today: TodayData): number {
  const value = {
    'dung-10': today.correct,
    'dung-15': today.correct,
    'xong-tram': today.stationsDone.length,
    'xong-2-tram': today.stationsDone.length,
    'thu-thach': today.stationsDone.includes('thu-thach-hinh-ve') ? 1 : 0,
    'to-tranh': today.artworks,
    'thay-do': today.dressed ? 1 : 0,
    'san-dien': today.showed ? 1 : 0,
  }[quest.id];
  return Math.min(quest.goal, value);
}

/** Thành tích để mở khoá đồ đặc biệt — chỉ có được bằng học, không mua được. */
export type AchievementId = 'stars-3' | 'exam-3' | 'show-1' | 'art-3' | 'days-3';

export interface AchievementData {
  /** Số sao cao nhất của từng trạm luyện tập. */
  practiceStars: number[];
  examStars: number;
  shows: number;
  artworks: number;
  days: number;
}

export const ACHIEVEMENTS: Record<AchievementId, { text: string; goal: number; value: (d: AchievementData) => number }> = {
  'stars-3': { text: 'Đạt 3 sao ở 3 trạm ôn', goal: 3, value: (d) => d.practiceStars.filter((s) => s >= 3).length },
  'exam-3': { text: 'Đạt 3 sao ở Đề thi thử', goal: 3, value: (d) => d.examStars },
  'show-1': { text: 'Trình diễn 1 lần trên Sàn diễn', goal: 1, value: (d) => d.shows },
  'art-3': { text: 'Tô xong 3 bức tranh', goal: 3, value: (d) => d.artworks },
  'days-3': { text: 'Học 3 ngày khác nhau', goal: 3, value: (d) => d.days },
};

export function achievementProgress(id: AchievementId, data: AchievementData): { value: number; goal: number; done: boolean } {
  const { goal, value } = ACHIEVEMENTS[id];
  const v = Math.min(goal, value(data));
  return { value: v, goal, done: v >= goal };
}
