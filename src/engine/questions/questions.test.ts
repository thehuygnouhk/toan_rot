import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, buildQuiz, makeQuestion } from './index';
import { borrowsSub, carriesAdd, readTime } from './cd01';
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

describe('toán có lời văn cộng, trừ', () => {
  it('thêm, nhiều hơn thì cộng; còn lại, ít hơn thì trừ; có nhớ không quá một lượt', () => {
    const kinds = new Set<string>();
    for (const seed of SEEDS) {
      const q = makeQuestion('loi-van-cong-tru', seed);
      const [a, b] = q.prompt.replace(/\u00a0/g, '').match(/\d+/g)!.map(Number);
      const add = /nhiều hơn|nhập thêm/.test(q.prompt);
      kinds.add(q.prompt.match(/nhiều hơn|ít hơn|nhập thêm|đã bán/)![0]);
      expect(Number(q.answer), q.prompt).toBe(add ? a + b : a - b);
      expect(add ? carriesAdd(a, b) : borrowsSub(a, b)).toBeLessThanOrEqual(1);
    }
    expect(kinds.size).toBe(4);
  });
});

describe('so sánh số', () => {
  it('dấu đúng, kể cả khi vế trái viết thành tổng; ít khi hai vế bằng nhau', () => {
    let equal = 0;
    for (const seed of SEEDS) {
      const q = makeQuestion('so-sanh-1000', seed);
      const m = q.prompt.replace(/\u00a0/g, '').match(/^Chọn dấu thích hợp: (.+) ⬜ (\d+)$/);
      if (!m) continue;
      const left = m[1].split(' + ').reduce((sum, x) => sum + Number(x), 0);
      const right = Number(m[2]);
      expect(q.answer, q.prompt).toBe(left > right ? '>' : left < right ? '<' : '=');
      if (q.answer === '=') equal++;
    }
    expect(equal / SEEDS.length).toBeLessThan(0.15);
  });
});

describe('đồng hồ và đo lường (Bài 7)', () => {
  it('đồng hồ: đáp án khớp vị trí kim, kim phút chỉ số 12, 3 hoặc 6', () => {
    for (const seed of SEEDS) {
      const q = makeQuestion('xem-dong-ho', seed);
      if (q.visual?.kind === 'clock') {
        expect([0, 15, 30]).toContain(q.visual.minute);
        expect(q.visual.hour).toBeGreaterThanOrEqual(1);
        expect(q.visual.hour).toBeLessThanOrEqual(12);
        expect(q.answer).toBe(readTime(q.visual.hour, q.visual.minute));
        expect(q.choices).toHaveLength(4);
        continue;
      }
      const toAfternoon = q.prompt.match(/^(\d+) giờ(?: (\d+) phút)? chiều còn gọi là mấy giờ\?$/);
      if (toAfternoon) {
        expect(q.answer).toBe(readTime(Number(toAfternoon[1]) + 12, Number(toAfternoon[2] ?? 0)));
        continue;
      }
      const fromAfternoon = q.prompt.match(/^(\d+) giờ là mấy giờ chiều\?$/)!;
      const h = Number(fromAfternoon[1]);
      expect(h).toBeGreaterThanOrEqual(13);
      expect(h).toBeLessThanOrEqual(18);
      expect(q.answer).toBe(`${h - 12} giờ chiều`);
    }
  });

  it('đổi đơn vị, ki-lô-gam, lít, đường gấp khúc: đáp án đúng', () => {
    const factor: Record<string, number> = { 'dm>cm': 10, 'm>dm': 10, 'm>cm': 100, 'km>m': 1000 };
    for (const seed of SEEDS) {
      const q = makeQuestion('do-luong', seed);
      const conv = q.prompt.match(/^Số thích hợp: (\d+) (\w+) = \? (\w+)$/);
      if (conv) {
        expect(Number(q.answer), q.prompt).toBe(Number(conv[1]) * factor[`${conv[2]}>${conv[3]}`]);
        expect(q.unit).toBe(conv[3]);
        continue;
      }
      if (q.visual?.kind === 'polyline') {
        expect(Number(q.answer), q.prompt).toBe(q.visual.lengths.reduce((sum, x) => sum + x, 0));
        continue;
      }
      const [a, b] = q.prompt.match(/\d+/g)!.map(Number);
      const add = /cả hai|tất cả/.test(q.prompt);
      expect(Number(q.answer), q.prompt).toBe(add ? a + b : a - b);
      expect(Number(q.answer)).toBeGreaterThan(0);
      expect(Number(q.answer)).toBeLessThan(100);
      expect(['kg', 'l']).toContain(q.unit);
    }
  });

  it('khối hình có cả khối trụ, khối cầu', () => {
    const answers = new Set(SEEDS.map((seed) => makeQuestion('khoi-hinh', seed).answer));
    expect(answers).toContain('Khối trụ');
    expect(answers).toContain('Khối cầu');
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

  it('toán có lời văn nhân, chia có cả nhân lẫn chia', () => {
    const division = SEEDS.filter((seed) => /chia đều|xếp vào mỗi/.test(makeQuestion('loi-van-nhan-chia', seed).prompt)).length;
    expect(division / SEEDS.length).toBeGreaterThan(0.3);
    expect(division / SEEDS.length).toBeLessThan(0.7);
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
    expect(toSpeech('Số thích hợp: 3 m = ? cm')).toBe('Số thích hợp: 3 mét bằng mấy xăng-ti-mét');
    expect(toSpeech('Số thích hợp: 2 dm = ? cm')).toBe('Số thích hợp: 2 đề-xi-mét bằng mấy xăng-ti-mét');
    expect(toSpeech('Bao gạo nặng 25 kg, can có 15 l nước.')).toBe('Bao gạo nặng 25 ki-lô-gam, can có 15 lít nước.');
    expect(toSpeech('đoạn thẳng AM dài 5 cm')).toBe('đoạn thẳng AM dài 5 xăng-ti-mét');
    // Chữ "m", "l" đứng đầu từ có dấu không bị đọc thành đơn vị
    expect(toSpeech('Khối lập phương có mấy mặt?')).toBe('Khối lập phương có mấy mặt?');
    expect(toSpeech('Hỏi 3 lọ như thế có 509 lá cờ?')).toBe('Hỏi 3 lọ như thế có 509 lá cờ?');
    expect(toSpeech('Số bé nhất là 503 là:')).toBe('Số bé nhất là 503 là:');
  });

  it('bộ đề không trùng câu và đủ số câu', () => {
    const quiz = buildQuiz(ALL_SKILLS, 30, 7);
    expect(quiz).toHaveLength(30);
    expect(new Set(quiz.map((q) => q.prompt + JSON.stringify(q.visual))).size).toBe(30);
  });
});
