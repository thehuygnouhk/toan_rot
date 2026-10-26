// Logic thuần (không đụng IndexedDB) cho điểm thành thạo, sao và cà rốt — theo skill vong-lap-hoc-va-thuong.

export type AnswerResult = 'first' | 'hint' | 'wrong';

export interface SkillStat {
  skillId: string;
  attempts: number;
  firstTry: number;
  mastery: number;
  lastAt: number;
}

export function emptyStat(skillId: string): SkillStat {
  return { skillId, attempts: 0, firstTry: 0, mastery: 0, lastAt: 0 };
}

/** Đúng lần đầu +10, đúng sau gợi ý +4, sai −3; giữ trong 0–100. */
export function updateStat(prev: SkillStat, result: AnswerResult, now: number): SkillStat {
  const delta = result === 'first' ? 10 : result === 'hint' ? 4 : -3;
  return {
    ...prev,
    attempts: prev.attempts + 1,
    firstTry: prev.firstTry + (result === 'first' ? 1 : 0),
    mastery: Math.max(0, Math.min(100, prev.mastery + delta)),
    lastAt: now,
  };
}

/** Sai rồi tự sửa vẫn được thưởng để khuyến khích kiên trì. */
export function carrotsFor(result: AnswerResult): number {
  return result === 'first' ? 2 : result === 'hint' ? 1 : 0;
}

/** 1–3 sao theo tỉ lệ đúng ngay lần đầu. Luôn có ít nhất 1 sao vì đã hoàn thành. */
export function starsFor(firstTry: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1;
  const rate = firstTry / total;
  return rate >= 0.85 ? 3 : rate >= 0.6 ? 2 : 1;
}

export function accuracy(stat: SkillStat): number {
  return stat.attempts === 0 ? 0 : stat.firstTry / stat.attempts;
}

export type SkillLevel = 'chua-lam' | 'can-on' | 'dang-tien-bo' | 'thanh-thao';

export function levelOf(stat: SkillStat | undefined): SkillLevel {
  if (!stat || stat.attempts === 0) return 'chua-lam';
  if (stat.mastery >= 80 && accuracy(stat) >= 0.8) return 'thanh-thao';
  if (stat.attempts >= 3 && accuracy(stat) < 0.6) return 'can-on';
  return 'dang-tien-bo';
}

/** Kỹ năng càng yếu thì càng hay được hỏi (trọng số 1–4). */
export function weightFor(stat: SkillStat | undefined): number {
  const mastery = stat?.mastery ?? 0;
  return 1 + Math.round((100 - mastery) / 34);
}
