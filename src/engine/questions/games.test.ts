import { describe, expect, it } from 'vitest';
import { readTime } from './cd01';
import { bakeryRounds, isEvenShare, memoryDeck, QUICK_TOPICS, quickRound, type MemoryTopic } from './games';

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 3);

/** Tính giá trị phép tính ngắn trong đề, "?" là số cần tìm. */
function solve(prompt: string): number {
  const clean = prompt.replace(/\u00a0/g, '').replace(' = ?', '');
  let m = clean.match(/^(\d+) × (\d+)$/);
  if (m) return Number(m[1]) * Number(m[2]);
  m = clean.match(/^(\d+) : (\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  m = clean.match(/^(\d+) ([+−]) (\d+)$/);
  if (m) return m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
  m = clean.match(/^\? × (\d+) = (\d+)$/);
  if (m) return Number(m[2]) / Number(m[1]);
  m = clean.match(/^(\d+) : \? = (\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  throw new Error(`không hiểu đề: ${prompt}`);
}

describe('đề phép tính ngắn cho mini-game', () => {
  for (const { id } of QUICK_TOPICS) {
    it(`${id}: đáp án đúng, 4 lựa chọn khác nhau, không âm, trong phạm vi 1 000, không trùng đề`, () => {
      for (const seed of SEEDS) {
        const round = quickRound(id, 8, seed);
        expect(round).toHaveLength(8);
        expect(new Set(round.map((q) => q.prompt)).size).toBe(8);
        for (const q of round) {
          expect(q.answer, q.prompt).toBe(solve(q.prompt));
          expect(Number.isInteger(q.answer)).toBe(true);
          expect(new Set(q.choices).size, q.prompt).toBe(4);
          expect(q.choices).toContain(q.answer);
          for (const c of q.choices) {
            expect(c).toBeGreaterThanOrEqual(0);
            expect(c).toBeLessThanOrEqual(1000);
          }
          expect(q.speak).not.toMatch(/×|\?/);
        }
      }
    });
  }
});

describe('thẻ ghép đôi', () => {
  for (const topic of ['nhan', 'chia', 'dong-ho'] as MemoryTopic[]) {
    it(`${topic}: mỗi cặp ghép đúng một cách duy nhất`, () => {
      for (const seed of SEEDS) {
        const deck = memoryDeck(topic, 6, seed);
        expect(deck).toHaveLength(12);
        expect(new Set(deck.map((c) => c.id)).size).toBe(12);
        for (let pair = 0; pair < 6; pair++) {
          const isLeft = (c: (typeof deck)[number]) => 'clock' in c.face || /[×:]/.test(c.face.text);
          const twins = deck.filter((c) => c.pair === pair);
          const a = twins.find(isLeft)!;
          const b = twins.find((c) => !isLeft(c))!;
          const right = 'text' in b.face ? b.face.text : '';
          if ('clock' in a.face) expect(right).toBe(readTime(a.face.clock.hour, a.face.clock.minute));
          else expect(String(solve(a.face.text))).toBe(right);
        }
        const answers = deck.filter((c) => 'text' in c.face && /^\d+$|giờ/.test(c.face.text)).map((c) => ('text' in c.face ? c.face.text : ''));
        expect(new Set(answers).size).toBe(answers.length);
      }
    });
  }
});

describe('tiệm bánh chia đều', () => {
  it('số bánh chia hết cho số hộp, các lượt không trùng', () => {
    for (const seed of SEEDS) {
      const rounds = bakeryRounds(4, seed);
      expect(new Set(rounds.map((r) => r.prompt)).size).toBe(4);
      for (const r of rounds) {
        expect(r.total % r.boxes).toBe(0);
        expect(r.total).toBeLessThanOrEqual(20);
      }
    }
  });

  it('chấm: hết bánh và các hộp bằng nhau', () => {
    const r = { total: 12, boxes: 3, prompt: '', speak: '' };
    expect(isEvenShare(r, [4, 4, 4])).toBe(true);
    expect(isEvenShare(r, [4, 4, 3])).toBe(false);
    expect(isEvenShare(r, [5, 4, 3])).toBe(false);
    expect(isEvenShare(r, [3, 3, 3])).toBe(false);
  });
});
