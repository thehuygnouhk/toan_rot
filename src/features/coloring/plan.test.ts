import { describe, expect, it } from 'vitest';
import { COLORING_SKILLS } from '../../engine/questions/coloring';
import { PICTURES } from './pictures';
import { makePlan } from './plan';

const evaluate = (expr: string) => {
  const m = expr.replace(/\u00a0/g, '').match(/^(\d+) ([×:+−]) (\d+)$/)!;
  const [a, b] = [Number(m[1]), Number(m[3])];
  return { '×': a * b, ':': a / b, '+': a + b, '−': a - b }[m[2] as '×' | ':' | '+' | '−'];
};

describe('kế hoạch tô màu', () => {
  for (const picture of PICTURES) {
    for (const { id: skill } of COLORING_SKILLS) {
      it(`${picture.id} × ${skill}: phép tính mỗi vùng ra đúng số của màu`, () => {
        for (let seed = 1; seed < 60; seed++) {
          const plan = makePlan(picture, skill, seed);
          const valueOf = new Map(plan.legend.map((l) => [l.color, l.value]));
          expect(new Set(plan.legend.map((l) => l.value)).size).toBe(plan.legend.length);
          for (const r of picture.regions) expect(evaluate(plan.problems[r.id])).toBe(valueOf.get(r.color));
        }
      });
    }
  }

  it('id vùng không trùng trong mỗi tranh', () => {
    for (const p of PICTURES) expect(new Set(p.regions.map((r) => r.id)).size).toBe(p.regions.length);
  });
});
