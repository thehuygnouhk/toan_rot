import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, buildQuiz, makeQuestion } from './index';
import { borrowsSub, carriesAdd } from './cd01';
import { readNumber } from './readNumber';
import { fmt, toSpeech } from './format';

const SEEDS = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

describe('mọi kỹ năng', () => {
  for (const skillId of ALL_SKILLS) {
    it(`${skillId}: đáp án đúng có trong lựa chọn, lựa chọn không trùng, đủ gợi ý`, () => {
      for (const seed of SEEDS) {
        const q = makeQuestion(skillId, seed);
        const values = q.choices.map((c) => c.value);
        expect(new Set(values).size, q.prompt).toBe(values.length);
        expect(values.filter((v) => v === q.answer), q.prompt).toHaveLength(1);
        expect(values.length, q.prompt).toBeGreaterThanOrEqual(2);
        expect(q.hints.length).toBeGreaterThan(0);
        expect(q.solution.length).toBeGreaterThan(0);
        expect(q.speak, q.prompt).not.toMatch(/×|(^|[\s,])\?([\s,]|$)/);
        if (/^\d+$/.test(q.answer)) {
          expect(values.length, q.prompt).toBe(4);
          for (const v of values) expect(Number(v), q.prompt).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it(`${skillId}: mọi số trong đề nằm trong phạm vi 1 000 (đề giữa kì 1)`, () => {
      for (const seed of SEEDS) {
        const q = makeQuestion(skillId, seed);
        const nums = q.prompt.replace(/\u00a0/g, '').match(/\d+/g)?.map(Number) ?? [];
        for (const n of nums) expect(n, q.prompt).toBeLessThanOrEqual(1000);
        if (/^\d+$/.test(q.answer)) expect(Number(q.answer)).toBeLessThanOrEqual(1000);
      }
    });

    it(`${skillId}: cùng seed cho cùng câu hỏi`, () => {
      expect(makeQuestion(skillId, 42)).toEqual(makeQuestion(skillId, 42));
    });
  }
});

describe('cộng, trừ trong 1 000', () => {
  it('có nhớ không quá một lượt, kết quả đúng', () => {
    for (const seed of SEEDS) {
      const q = makeQuestion('cong-tru-1000', seed);
      const m = q.prompt.replace(/\u00a0/g, '').match(/(\d+) ([+−]) (\d+)/);
      if (!m) continue;
      const a = Number(m[1]);
      const b = Number(m[3]);
      if (m[2] === '+') {
        expect(carriesAdd(a, b)).toBeLessThanOrEqual(1);
        expect(Number(q.answer)).toBe(a + b);
      } else {
        expect(borrowsSub(a, b)).toBeLessThanOrEqual(1);
        expect(Number(q.answer)).toBe(a - b);
      }
    }
  });
});

describe('bảng nhân, bảng chia', () => {
  it('phép chia luôn chia hết và đúng bảng', () => {
    for (const skillId of ['bang-chia-2-5', 'bang-chia-6-9'] as const) {
      for (const seed of SEEDS) {
        const q = makeQuestion(skillId, seed);
        const m = q.prompt.match(/^(\d+) : (\d+) = \?$/);
        if (!m) continue;
        const [n, d] = [Number(m[1]), Number(m[2])];
        expect(n % d).toBe(0);
        expect(Number(q.answer)).toBe(n / d);
        expect(Number(q.answer)).toBeLessThanOrEqual(10);
      }
    }
  });

  it('bảng nhân 6–9 chỉ dùng thừa số 6, 7, 8, 9 ở vị trí bảng', () => {
    for (const seed of SEEDS) {
      const q = makeQuestion('bang-nhan-6-9', seed);
      const m = q.prompt.match(/^(\d+) × (\d+) = \?$/);
      if (!m) continue;
      expect([6, 7, 8, 9]).toContain(Number(m[1]));
      expect(Number(q.answer)).toBe(Number(m[1]) * Number(m[2]));
    }
  });
});

describe('hình học', () => {
  it('trung điểm: các điểm không chồng lên nhau', () => {
    for (const seed of SEEDS) {
      const q = makeQuestion('trung-diem', seed);
      if (q.visual?.kind !== 'segment') continue;
      const positions = q.visual.points.map((p) => p.at);
      expect(new Set(positions).size).toBe(positions.length);
    }
  });

  it('một phần mấy: hình có đúng số phần trong đáp án', () => {
    for (const seed of SEEDS) {
      const q = makeQuestion('mot-phan-may-hinh', seed);
      if (q.visual?.kind !== 'fraction') throw new Error('thiếu hình');
      expect(q.answer).toBe(`1/${q.visual.parts}`);
    }
  });
});

describe('tiện ích', () => {
  it('đọc số theo SGK', () => {
    expect(readNumber(405)).toBe('Bốn trăm linh năm');
    expect(readNumber(521)).toBe('Năm trăm hai mươi mốt');
    expect(readNumber(115)).toBe('Một trăm mười lăm');
    expect(readNumber(924)).toBe('Chín trăm hai mươi tư');
    expect(readNumber(800)).toBe('Tám trăm');
    expect(readNumber(14)).toBe('Mười bốn');
  });

  it('viết số có dấu cách nghìn và đọc phép tính thành chữ', () => {
    expect(fmt(1000)).toBe('1\u00a0000');
    expect(toSpeech('7 × 8 = ?')).toBe('7 nhân 8 bằng mấy');
    expect(toSpeech('48 : 6 = ?')).toBe('48 chia 6 bằng mấy');
    expect(toSpeech('? − 125 = 300')).toBe('mấy trừ 125 bằng 300');
    expect(toSpeech('Hỏi có bao nhiêu chiếc nơ?')).toBe('Hỏi có bao nhiêu chiếc nơ?');
    expect(toSpeech('Đếm thêm 4: 4, 8, ?, 16')).toBe('Đếm thêm 4: 4, 8, mấy, 16');
  });

  it('bộ đề không trùng câu và đủ số câu', () => {
    const quiz = buildQuiz(ALL_SKILLS, 30, 7);
    expect(quiz).toHaveLength(30);
    expect(new Set(quiz.map((q) => q.prompt + JSON.stringify(q.visual))).size).toBe(30);
  });
});
