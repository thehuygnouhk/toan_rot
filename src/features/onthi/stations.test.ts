import { describe, expect, it } from 'vitest';
import { ALL_SKILLS } from '../../engine/questions';
import { STATIONS } from './stations';

describe('lộ trình ôn thi', () => {
  it('mọi kỹ năng đều có trạm luyện tập và có trong đề thi thử', () => {
    const exam = STATIONS.find((s) => s.mode === 'exam')!;
    for (const id of ALL_SKILLS) {
      expect(STATIONS.some((s) => s.mode === 'practice' && s.skills.includes(id)), id).toBe(true);
      expect(exam.skills, id).toContain(id);
    }
  });

  it('mã trạm không trùng nhau', () => {
    expect(new Set(STATIONS.map((s) => s.id)).size).toBe(STATIONS.length);
  });
});
