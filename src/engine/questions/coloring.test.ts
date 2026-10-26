import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import { COLORING_SKILLS, pickTargets, problemFor } from './coloring';

function evaluate(expr: string): number {
  const m = expr.replace(/\u00a0/g, '').match(/^(\d+) ([×:+−]) (\d+)$/);
  if (!m) throw new Error(expr);
  const [a, b] = [Number(m[1]), Number(m[3])];
  return { '×': a * b, ':': a / b, '+': a + b, '−': a - b }[m[2] as '×' | ':' | '+' | '−'];
}

describe('phép tính tô màu', () => {
  for (const { id } of COLORING_SKILLS) {
    it(`${id}: mỗi phép tính ra đúng kết quả của màu, trong phạm vi 1 000`, () => {
      for (let seed = 1; seed < 300; seed++) {
        const rng = createRng(seed);
        const targets = pickTargets(id, 5, rng);
        expect(new Set(targets).size).toBe(5);
        for (const t of targets) {
          for (let i = 0; i < 4; i++) {
            const expr = problemFor(id, t, rng);
            expect(evaluate(expr), expr).toBe(t);
            for (const n of expr.replace(/\u00a0/g, '').match(/\d+/g)!.map(Number)) expect(n).toBeLessThanOrEqual(1000);
          }
        }
      }
    });
  }
});
