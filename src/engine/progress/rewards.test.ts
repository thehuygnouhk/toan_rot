import { describe, expect, it } from 'vitest';
import { achievementProgress, dayKey, learningDays, questProgress, questsFor, startOfDay, type TodayData } from './rewards';

const EMPTY: TodayData = { correct: 0, stationsDone: [], artworks: 0, dressed: false, showed: false, played: false };

describe('ngày học và vườn hoa', () => {
  it('dayKey theo giờ máy, startOfDay về 0 giờ', () => {
    const t = new Date(2026, 9, 28, 21, 15).getTime();
    expect(dayKey(t)).toBe('2026-10-28');
    expect(dayKey(startOfDay(t))).toBe('2026-10-28');
    expect(new Date(startOfDay(t)).getHours()).toBe(0);
  });

  it('mỗi ngày học tính một lần, nghỉ ngày không làm mất hoa', () => {
    const days = learningDays([
      new Date(2026, 9, 26, 8).getTime(),
      new Date(2026, 9, 26, 20).getTime(),
      new Date(2026, 9, 28, 9).getTime(),
    ]);
    expect(days).toEqual(['2026-10-26', '2026-10-28']);
  });
});

describe('nhiệm vụ hằng ngày', () => {
  it('mỗi ngày 3 nhiệm vụ khác nhau, có 1 nhiệm vụ sáng tạo, cố định trong ngày', () => {
    for (let d = 1; d <= 60; d++) {
      const day = dayKey(new Date(2026, 9, d).getTime());
      const quests = questsFor(day);
      expect(quests).toHaveLength(3);
      expect(new Set(quests.map((q) => q.id)).size).toBe(3);
      expect(['to-tranh', 'thay-do', 'san-dien', 'tro-choi']).toContain(quests[2].id);
      expect(questsFor(day)).toEqual(quests);
    }
  });

  it('trò chơi có mặt trong vòng nhiệm vụ sáng tạo', () => {
    const ids = new Set(Array.from({ length: 120 }, (_, d) => questsFor(dayKey(new Date(2026, 9, d + 1).getTime()))[2].id));
    expect(ids).toEqual(new Set(['to-tranh', 'thay-do', 'san-dien', 'tro-choi']));
  });

  it('các ngày khác nhau có nhiệm vụ khác nhau', () => {
    const sets = new Set(Array.from({ length: 30 }, (_, d) => questsFor(dayKey(new Date(2026, 10, d + 1).getTime())).map((q) => q.id).join()));
    expect(sets.size).toBeGreaterThan(3);
  });

  it('tiến độ không vượt mục tiêu', () => {
    for (let d = 1; d <= 20; d++) {
      for (const q of questsFor(dayKey(new Date(2026, 9, d).getTime()))) {
        expect(questProgress(q, EMPTY)).toBe(0);
        const full: TodayData = { correct: 40, stationsDone: ['so-cong-tru', 'thu-thach-hinh-ve', 'bang-2-5'], artworks: 2, dressed: true, showed: true, played: true };
        expect(questProgress(q, full)).toBe(q.goal);
      }
    }
  });
});

describe('đồ đặc biệt', () => {
  const data = { practiceStars: [3, 3, 2, 1], examStars: 2, shows: 0, artworks: 3, days: 5 };
  it('tính tiến độ thành tích', () => {
    expect(achievementProgress('stars-3', data)).toEqual({ value: 2, goal: 3, done: false });
    expect(achievementProgress('exam-3', data).done).toBe(false);
    expect(achievementProgress('show-1', data).done).toBe(false);
    expect(achievementProgress('art-3', data).done).toBe(true);
    expect(achievementProgress('days-3', data)).toEqual({ value: 3, goal: 3, done: true });
  });
});
