import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import { divisionRound, longDivision, pickDivision, stepHint, type DivLevel, type DivStep } from './cd04';

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 11);

describe('chia số có hai chữ số cho số có một chữ số (Bài 26)', () => {
  it('các bước chia – nhân – trừ – hạ đúng, thương có hai chữ số, số dư bé hơn số chia', () => {
    for (let divisor = 2; divisor <= 9; divisor++) {
      for (let dividend = divisor * 10; dividend <= 99; dividend++) {
        const d = longDivision(dividend, divisor);
        expect(d.quotient * divisor + d.remainder).toBe(dividend);
        expect(d.quotient).toBeGreaterThanOrEqual(10);
        expect(d.remainder).toBeLessThan(divisor);
        expect(d.steps.map((s) => s.kind)).toEqual(['chia', 'nhan', 'tru', 'ha', 'chia', 'nhan', 'tru']);
        const [c1, n1, t1, h, c2, n2, t2] = d.steps as [
          Extract<DivStep, { kind: 'chia' }>,
          Extract<DivStep, { kind: 'nhan' }>,
          Extract<DivStep, { kind: 'tru' }>,
          Extract<DivStep, { kind: 'ha' }>,
          Extract<DivStep, { kind: 'chia' }>,
          Extract<DivStep, { kind: 'nhan' }>,
          Extract<DivStep, { kind: 'tru' }>,
        ];
        expect(c1.part).toBe(Math.floor(dividend / 10));
        expect(n1.answer).toBe(c1.answer * divisor);
        expect(t1.answer).toBe(c1.part - n1.answer);
        expect(t1.answer).toBeLessThan(divisor);
        expect(h.digit).toBe(dividend % 10);
        expect(h.next).toBe(t1.answer * 10 + h.digit);
        expect(n2.answer).toBe(c2.answer * divisor);
        expect(t2.answer).toBe(d.remainder);
        expect(c1.answer * 10 + c2.answer).toBe(d.quotient);
        // Chỉ dùng bảng nhân trong phạm vi đã học
        expect(c1.answer).toBeLessThanOrEqual(9);
        expect(c2.answer).toBeLessThanOrEqual(9);
      }
    }
  });

  it('chọn đúng mức: chia hết từng lượt / dư ở lượt đầu / có dư', () => {
    const rng = createRng(5);
    for (let i = 0; i < 300; i++) {
      for (const level of ['het-tung-luot', 'du-luot-dau', 'co-du'] as DivLevel[]) {
        const d = longDivision(...pickDivision(rng, level));
        const firstRest = (d.steps[2] as Extract<DivStep, { kind: 'tru' }>).answer;
        if (level === 'het-tung-luot') expect([firstRest, d.remainder]).toEqual([0, 0]);
        if (level === 'du-luot-dau') {
          expect(firstRest).toBeGreaterThan(0);
          expect(d.remainder).toBe(0);
        }
        if (level === 'co-du') expect(d.remainder).toBeGreaterThan(0);
      }
    }
  });

  it('một lượt chơi gồm 5 phép chia khác nhau, dễ trước khó sau', () => {
    for (const seed of SEEDS) {
      const round = divisionRound(seed);
      expect(round).toHaveLength(5);
      expect(new Set(round.map((d) => `${d.dividend}:${d.divisor}`)).size).toBe(5);
      expect(round[4].remainder).toBeGreaterThan(0);
      expect(round[0].remainder).toBe(0);
    }
  });

  it('nhắc đúng chỗ khi chia sai', () => {
    const d = longDivision(72, 3);
    const c1 = d.steps[0];
    expect(stepHint(c1, 3, 3)).toContain('lớn hơn 7');
    expect(stepHint(c1, 3, 1)).toContain('Thử số lớn hơn');
  });
});
