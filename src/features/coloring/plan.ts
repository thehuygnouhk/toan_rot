import { pickTargets, problemFor, type ColoringSkill } from '../../engine/questions/coloring';
import type { SkillId } from '../../engine/questions';
import { createRng } from '../../engine/rng';
import type { ColorKey, Picture } from './pictures';

export interface ColoringPlan {
  /** Kết quả gắn với từng màu (bảng chú giải). */
  legend: { color: ColorKey; value: number }[];
  /** Phép tính của từng vùng. */
  problems: Record<string, string>;
}

/** Gán số cho mỗi màu rồi sinh phép tính cho từng vùng có kết quả bằng số của màu vùng đó. */
export function makePlan(picture: Picture, skill: ColoringSkill, seed: number): ColoringPlan {
  const rng = createRng(seed);
  const colors = [...new Set(picture.regions.map((r) => r.color))];
  const targets = pickTargets(skill, colors.length, rng);
  const legend = colors.map((color, i) => ({ color, value: targets[i] })).sort((a, b) => a.value - b.value);
  const valueOf = new Map(legend.map((l) => [l.color, l.value]));
  const problems: Record<string, string> = {};
  const used = new Set<string>();
  for (const r of picture.regions) {
    let p = problemFor(skill, valueOf.get(r.color)!, rng);
    // Cố gắng để các vùng có phép tính khác nhau
    for (let i = 0; i < 5 && used.has(p); i++) p = problemFor(skill, valueOf.get(r.color)!, rng);
    used.add(p);
    problems[r.id] = p;
  }
  return { legend, problems };
}

/** Ghi kết quả tô màu vào kỹ năng tương ứng của chương trình. */
export function skillOfProblem(skill: ColoringSkill, problem: string): SkillId {
  if (skill === 'nhan-2-5') return 'bang-nhan-2-5';
  if (skill === 'nhan-6-9') return 'bang-nhan-6-9';
  if (skill === 'chia-2-9') return Number(problem.split(' : ')[1]) <= 5 ? 'bang-chia-2-5' : 'bang-chia-6-9';
  return 'cong-tru-1000';
}
