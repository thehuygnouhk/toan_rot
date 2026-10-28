// Đề cho mini-game: phép tính ngắn (đọc nhanh khi kẹo rơi, bóng bay lên), cặp thẻ ghép đôi, lượt chia bánh.
// Mini-game không tự sinh đề và không tự chấm — chỉ hiển thị dữ liệu từ đây (skill mini-game-phaser).
import { createRng, type Rng } from '../rng';
import { readTime } from './cd01';
import { fmt, toSpeech } from './format';
import type { SkillId } from './types';

export type QuickTopic = 'nhan-2-5' | 'nhan-6-9' | 'chia-2-9' | 'tim-so' | 'nham-tron-chuc';

export const QUICK_TOPICS: { id: QuickTopic; name: string; lessons: string }[] = [
  { id: 'nhan-2-5', name: 'Bảng nhân 2 – 5', lessons: 'Bài 4–6' },
  { id: 'nhan-6-9', name: 'Bảng nhân 6 – 9', lessons: 'Bài 9–12' },
  { id: 'chia-2-9', name: 'Bảng chia 2 – 9', lessons: 'Bài 4–12' },
  { id: 'tim-so', name: 'Tìm số chưa biết', lessons: 'Bài 13' },
  { id: 'nham-tron-chuc', name: 'Cộng, trừ nhẩm tròn chục', lessons: 'Bài 2' },
];

export interface QuickQuestion {
  prompt: string;
  speak: string;
  answer: number;
  /** 4 số khác nhau, có đáp án đúng, đã xáo trộn. */
  choices: number[];
  skillId: SkillId;
}

/** Thêm đáp án nhiễu hợp lệ (khác nhau, không âm, khác đáp án) cho đủ 4 lựa chọn rồi xáo trộn. */
function withChoices(rng: Rng, answer: number, wrong: number[], max: number): number[] {
  const set = new Set<number>([answer]);
  for (const w of [...wrong, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer + 3]) {
    if (set.size >= 4) break;
    if (Number.isInteger(w) && w >= 0 && w <= max) set.add(w);
  }
  return rng.shuffle([...set]);
}

export function quickQuestion(topic: QuickTopic, rng: Rng): QuickQuestion {
  if (topic === 'nhan-2-5' || topic === 'nhan-6-9') {
    const a = rng.pick(topic === 'nhan-2-5' ? [2, 3, 4, 5] : [6, 7, 8, 9]);
    const b = rng.int(2, 10);
    const p = a * b;
    const prompt = `${a} × ${b} = ?`;
    return {
      prompt,
      speak: toSpeech(prompt),
      answer: p,
      choices: withChoices(rng, p, [a * (b + 1), a * (b - 1), a + b], 100),
      skillId: topic === 'nhan-2-5' ? 'bang-nhan-2-5' : 'bang-nhan-6-9',
    };
  }
  if (topic === 'chia-2-9') {
    const d = rng.int(2, 9);
    const q = rng.int(2, 10);
    const prompt = `${d * q} : ${d} = ?`;
    return {
      prompt,
      speak: toSpeech(prompt),
      answer: q,
      choices: withChoices(rng, q, [q + 1, q - 1, d === q ? q + 2 : d], 100),
      skillId: d <= 5 ? 'bang-chia-2-5' : 'bang-chia-6-9',
    };
  }
  if (topic === 'tim-so') {
    const a = rng.int(2, 9);
    const b = rng.int(2, 10);
    const p = a * b;
    const prompt = rng.chance(0.5) ? `? × ${a} = ${p}` : `${p} : ? = ${b}`;
    const answer = prompt.startsWith('?') ? b : a;
    return {
      prompt,
      speak: toSpeech(prompt),
      answer,
      choices: withChoices(rng, answer, [answer + 1, answer - 1, p - (prompt.startsWith('?') ? a : b)], 100),
      skillId: 'tim-thanh-phan-nhan-chia',
    };
  }
  // Cộng, trừ nhẩm các số tròn chục trong phạm vi 1 000
  const add = rng.chance(0.5);
  const a = rng.int(add ? 10 : 30, add ? 80 : 99) * 10;
  const b = add ? rng.int(1, Math.min(9, 100 - a / 10)) * 10 : rng.int(1, Math.min(9, a / 10 - 1)) * 10;
  const answer = add ? a + b : a - b;
  const prompt = `${fmt(a)} ${add ? '+' : '−'} ${fmt(b)} = ?`;
  return {
    prompt,
    speak: toSpeech(prompt),
    answer,
    choices: withChoices(rng, answer, [answer + 10, answer - 10, add ? a - b : a + b, answer + 100], 1000),
    skillId: 'cong-tru-1000',
  };
}

/** Một lượt chơi gồm `count` câu không trùng nhau. */
export function quickRound(topic: QuickTopic, count: number, seed: number): QuickQuestion[] {
  const rng = createRng(seed);
  const out: QuickQuestion[] = [];
  const seen = new Set<string>();
  for (let tries = 0; out.length < count && tries < count * 30; tries++) {
    const q = quickQuestion(topic, rng);
    if (seen.has(q.prompt)) continue;
    seen.add(q.prompt);
    out.push(q);
  }
  return out;
}

/** Mặt thẻ: chữ, hoặc hình đồng hồ. */
export type CardFace = { text: string } | { clock: { hour: number; minute: number } };

export interface MemoryCard {
  id: number;
  face: CardFace;
  /** Hai thẻ cùng pair là một cặp. Phaser không biết trường này — chỉ trang React dùng để chấm. */
  pair: number;
}

export type MemoryTopic = 'nhan' | 'chia' | 'dong-ho';

export const MEMORY_TOPICS: { id: MemoryTopic; name: string; lessons: string }[] = [
  { id: 'nhan', name: 'Phép nhân ↔ kết quả', lessons: 'Bài 4–12' },
  { id: 'chia', name: 'Phép chia ↔ kết quả', lessons: 'Bài 4–12' },
  { id: 'dong-ho', name: 'Đồng hồ ↔ giờ', lessons: 'Bài 7' },
];

export const MEMORY_SKILL: Record<MemoryTopic, SkillId> = { nhan: 'bang-nhan-6-9', chia: 'bang-chia-6-9', 'dong-ho': 'xem-dong-ho' };

/** `pairs` cặp thẻ đã xáo trộn; kết quả các cặp khác nhau để không có hai cách ghép đúng. */
export function memoryDeck(topic: MemoryTopic, pairs: number, seed: number): MemoryCard[] {
  const rng = createRng(seed);
  const faces: [CardFace, CardFace][] = [];
  const used = new Set<string>();
  while (faces.length < pairs) {
    let left: CardFace;
    let right: string;
    if (topic === 'dong-ho') {
      const hour = rng.int(1, 12);
      const minute = rng.pick([0, 15, 30]);
      left = { clock: { hour, minute } };
      right = readTime(hour, minute);
    } else {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      left = { text: topic === 'nhan' ? `${a} × ${b}` : `${a * b} : ${a}` };
      right = String(topic === 'nhan' ? a * b : b);
    }
    if (used.has(right)) continue;
    used.add(right);
    faces.push([left, { text: right }]);
  }
  const cards = faces.flatMap(([l, r], pair) => [
    { face: l, pair },
    { face: r, pair },
  ]);
  return rng.shuffle(cards).map((c, id) => ({ ...c, id }));
}

export interface BakeryRound {
  total: number;
  boxes: number;
  prompt: string;
  speak: string;
}

/** Chia đều bánh vào hộp (Bài 4–12, 14): mỗi hộp total : boxes chiếc. */
export function bakeryRounds(count: number, seed: number): BakeryRound[] {
  const rng = createRng(seed);
  const out: BakeryRound[] = [];
  const seen = new Set<string>();
  while (out.length < count) {
    const boxes = rng.int(2, 4);
    const per = rng.int(2, boxes === 4 ? 4 : 5);
    const key = `${boxes}-${per}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const total = boxes * per;
    const prompt = `Chia đều ${total} chiếc bánh vào ${boxes} hộp.`;
    out.push({ total, boxes, prompt, speak: `${prompt} Kéo bánh vào hộp, rồi bấm Xong.` });
  }
  return out;
}

/** Đúng khi đã xếp hết bánh và các hộp có số bánh bằng nhau. */
export function isEvenShare(round: BakeryRound, counts: number[]): boolean {
  return counts.length === round.boxes && counts.reduce((s, c) => s + c, 0) === round.total && counts.every((c) => c === counts[0]);
}
