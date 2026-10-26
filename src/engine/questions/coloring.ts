// Phép tính cho Xưởng Tô Màu: mỗi màu gắn một kết quả, mỗi vùng là một phép tính có đúng kết quả đó.
import type { Rng } from '../rng';
import { fmt } from './format';

export type ColoringSkill = 'nhan-2-5' | 'nhan-6-9' | 'chia-2-9' | 'cong-tru-nham';

export const COLORING_SKILLS: { id: ColoringSkill; name: string; emoji: string; lessons: string }[] = [
  { id: 'nhan-2-5', name: 'Bảng nhân 2 – 5', emoji: '✖️', lessons: 'Bài 4–6' },
  { id: 'nhan-6-9', name: 'Bảng nhân 6 – 9', emoji: '✖️', lessons: 'Bài 9–12' },
  { id: 'chia-2-9', name: 'Bảng chia 2 – 9', emoji: '➗', lessons: 'Bài 4–12' },
  { id: 'cong-tru-nham', name: 'Cộng, trừ nhẩm số tròn chục', emoji: '➕', lessons: 'Bài 2' },
];

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

function products(tables: number[]): Map<number, [number, number][]> {
  const map = new Map<number, [number, number][]>();
  for (const a of tables) for (const b of range(1, 10)) map.set(a * b, [...(map.get(a * b) ?? []), [a, b]]);
  return map;
}
const P25 = products([2, 3, 4, 5]);
const P69 = products([6, 7, 8, 9]);

/** Chọn `count` kết quả khác nhau cho bảng màu. */
export function pickTargets(skill: ColoringSkill, count: number, rng: Rng): number[] {
  let pool: number[];
  if (skill === 'nhan-2-5') pool = [...P25.keys()].filter((n) => n > 5);
  else if (skill === 'nhan-6-9') pool = [...P69.keys()].filter((n) => n > 9);
  else if (skill === 'chia-2-9') pool = range(2, 10);
  else pool = range(10, 90).map((n) => n * 10);
  return rng.shuffle(pool).slice(0, count);
}

/** Một phép tính có kết quả đúng bằng `target`. */
export function problemFor(skill: ColoringSkill, target: number, rng: Rng): string {
  if (skill === 'nhan-2-5' || skill === 'nhan-6-9') {
    const pairs = (skill === 'nhan-2-5' ? P25 : P69).get(target);
    if (!pairs) throw new Error(`Không có phép nhân cho ${target}`);
    const [a, b] = rng.pick(pairs);
    return `${a} × ${b}`;
  }
  if (skill === 'chia-2-9') {
    const d = rng.int(2, 9);
    return `${target * d} : ${d}`;
  }
  if (rng.chance(0.5) && target >= 200) {
    const a = rng.int(1, target / 10 - 1) * 10;
    return `${fmt(a)} + ${fmt(target - a)}`;
  }
  const b = rng.int(1, Math.max(1, (1000 - target) / 10)) * 10;
  return `${fmt(target + b)} − ${fmt(b)}`;
}
