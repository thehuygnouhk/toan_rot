import { describe, expect, it } from 'vitest';
import { carrotsFor, emptyStat, levelOf, starsFor, updateStat, weightFor } from './mastery';

describe('điểm thành thạo', () => {
  it('cộng trừ điểm đúng quy tắc và không vượt 0–100', () => {
    let s = emptyStat('bang-nhan-6-9');
    s = updateStat(s, 'wrong', 1);
    expect(s.mastery).toBe(0);
    for (let i = 0; i < 15; i++) s = updateStat(s, 'first', i);
    expect(s.mastery).toBe(100);
    s = updateStat(s, 'hint', 99);
    expect(s.mastery).toBe(100);
    expect(s.attempts).toBe(17);
    expect(s.firstTry).toBe(15);
  });

  it('phân loại kỹ năng', () => {
    expect(levelOf(undefined)).toBe('chua-lam');
    let weak = emptyStat('x');
    for (let i = 0; i < 4; i++) weak = updateStat(weak, 'wrong', i);
    expect(levelOf(weak)).toBe('can-on');
    let strong = emptyStat('y');
    for (let i = 0; i < 9; i++) strong = updateStat(strong, 'first', i);
    expect(levelOf(strong)).toBe('thanh-thao');
  });

  it('sao, cà rốt và trọng số', () => {
    expect(starsFor(8, 8)).toBe(3);
    expect(starsFor(5, 8)).toBe(2);
    expect(starsFor(1, 8)).toBe(1);
    expect(carrotsFor('first')).toBeGreaterThan(carrotsFor('hint'));
    expect(carrotsFor('wrong')).toBe(0);
    expect(weightFor(undefined)).toBe(4);
    expect(weightFor({ ...emptyStat('z'), mastery: 100 })).toBe(1);
  });
});
