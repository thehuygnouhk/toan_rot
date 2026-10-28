// Chủ đề 4 — Phép nhân, phép chia trong phạm vi 100 (Bài 25–26): chia số có hai chữ số cho số có một chữ số.
// Mở theo yêu cầu của gia đình (bé học rồi nhưng còn yếu). Thương có hai chữ số, làm theo từng bước: chia – nhân – trừ – hạ.
import { createRng, type Rng } from '../rng';
import { NAMES } from './format';
import type { Draft } from './types';

/** Một bước của phép chia đặt tính. `answer` là số bé cần điền (bước hạ không cần điền). */
export type DivStep =
  | { kind: 'chia'; part: number; answer: number }
  | { kind: 'nhan'; digit: number; answer: number }
  | { kind: 'tru'; from: number; product: number; answer: number }
  | { kind: 'ha'; digit: number; next: number };

export interface LongDivision {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  steps: DivStep[];
}

/** Các bước chia số có hai chữ số cho số có một chữ số, khi chữ số hàng chục không bé hơn số chia (thương có hai chữ số). */
export function longDivision(dividend: number, divisor: number): LongDivision {
  const tens = Math.floor(dividend / 10);
  const units = dividend % 10;
  if (dividend < 10 || dividend > 99 || divisor < 2 || divisor > 9 || tens < divisor) throw new Error(`longDivision: ${dividend} : ${divisor}`);
  const q1 = Math.floor(tens / divisor);
  const r1 = tens - q1 * divisor;
  const next = r1 * 10 + units;
  const q0 = Math.floor(next / divisor);
  const r = next - q0 * divisor;
  return {
    dividend,
    divisor,
    quotient: q1 * 10 + q0,
    remainder: r,
    steps: [
      { kind: 'chia', part: tens, answer: q1 },
      { kind: 'nhan', digit: q1, answer: q1 * divisor },
      { kind: 'tru', from: tens, product: q1 * divisor, answer: r1 },
      { kind: 'ha', digit: units, next },
      { kind: 'chia', part: next, answer: q0 },
      { kind: 'nhan', digit: q0, answer: q0 * divisor },
      { kind: 'tru', from: next, product: q0 * divisor, answer: r },
    ],
  };
}

/**
 * Ba mức như sách: chia hết ở từng lượt (84 : 4), có dư ở lượt chia thứ nhất (72 : 3), chia có dư (87 : 4).
 */
export type DivLevel = 'het-tung-luot' | 'du-luot-dau' | 'co-du';

export function pickDivision(rng: Rng, level: DivLevel): [number, number] {
  for (;;) {
    const divisor = rng.int(2, 9);
    const dividend = rng.int(divisor * 10, 99);
    const tens = Math.floor(dividend / 10);
    const exact = dividend % divisor === 0;
    const firstExact = tens % divisor === 0;
    if (level === 'het-tung-luot' && exact && firstExact) return [dividend, divisor];
    if (level === 'du-luot-dau' && exact && !firstExact) return [dividend, divisor];
    if (level === 'co-du' && !exact) return [dividend, divisor];
  }
}

/** Một lượt chơi: dễ trước, khó sau, không trùng phép chia. */
export function divisionRound(seed: number, levels: DivLevel[] = ['het-tung-luot', 'het-tung-luot', 'du-luot-dau', 'du-luot-dau', 'co-du']): LongDivision[] {
  const rng = createRng(seed);
  const seen = new Set<string>();
  return levels.map((level) => {
    for (;;) {
      const [a, b] = pickDivision(rng, level);
      if (seen.has(`${a}:${b}`)) continue;
      seen.add(`${a}:${b}`);
      return longDivision(a, b);
    }
  });
}

/** Lời của Thỏ Rốt cho mỗi bước (khi còn hướng dẫn chi tiết). */
export function stepPrompt(step: DivStep, divisor: number): string {
  switch (step.kind) {
    case 'chia':
      return `${step.part} chia ${divisor} được mấy?`;
    case 'nhan':
      return `${step.digit} nhân ${divisor} bằng mấy?`;
    case 'tru':
      return `${step.from} trừ ${step.product} bằng mấy?`;
    case 'ha':
      return `Hạ ${step.digit} xuống, được ${step.next}.`;
  }
}

/** Nhắc đúng chỗ khi bé điền sai một bước. */
export function stepHint(step: DivStep, divisor: number, wrong: number): string {
  if (step.kind === 'chia') {
    if (wrong * divisor > step.part) return `${wrong} × ${divisor} = ${wrong * divisor}, lớn hơn ${step.part} rồi. Thử số bé hơn nhé.`;
    return `${wrong + 1} × ${divisor} = ${(wrong + 1) * divisor}, vẫn chưa quá ${step.part}. Thử số lớn hơn nhé.`;
  }
  if (step.kind === 'nhan') return `Nhớ lại bảng nhân ${divisor}: ${step.digit} × ${divisor} = ?`;
  if (step.kind === 'tru') return `Lấy ${step.from} bớt đi ${step.product} nhé.`;
  return '';
}

/** Lời giải thích một bước (khi bé cần xem đáp án). */
export function stepExplain(step: DivStep, divisor: number): string {
  switch (step.kind) {
    case 'chia':
      return `${step.part} chia ${divisor} được ${step.answer}, vì ${step.answer} × ${divisor} = ${step.answer * divisor}${step.answer * divisor < step.part ? ` (còn thừa ${step.part - step.answer * divisor})` : ''}.`;
    case 'nhan':
      return `${step.digit} nhân ${divisor} bằng ${step.answer}.`;
    case 'tru':
      return `${step.from} trừ ${step.product} bằng ${step.answer}.`;
    case 'ha':
      return `Hạ ${step.digit} xuống, được ${step.next}.`;
  }
}

const STORIES: ((d: LongDivision) => [string, string])[] = [
  (d) => [`Chia đều ${d.dividend} chiếc bánh vào ${d.divisor} hộp.`, `Mỗi hộp có ${d.quotient} chiếc bánh`],
  (d) => [`Đính đều ${d.dividend} chiếc cúc áo lên ${d.divisor} chiếc áo.`, `Mỗi chiếc áo có ${d.quotient} chiếc cúc`],
  (d) => [`Cắm đều ${d.dividend} bông hoa vào ${d.divisor} lọ.`, `Mỗi lọ có ${d.quotient} bông hoa`],
  (d) => [`Chia đều ${d.dividend} chiếc nơ cho ${d.divisor} bạn.`, `Mỗi bạn được ${d.quotient} chiếc nơ`],
];

/** Đơn hàng dễ thương cho một phép chia và câu kết luận. */
export function divisionStory(d: LongDivision, rng: Rng): { order: string; result: string } {
  const [order, result] = rng.pick(STORIES)(d);
  return { order, result: d.remainder ? `${result}, còn thừa ${d.remainder}` : result };
}

/** Câu hỏi trắc nghiệm / nhập số cho trạm luyện tập (Bài 26). */
export function chiaHaiChuSo(rng: Rng): Draft {
  const level = rng.pick(['het-tung-luot', 'du-luot-dau', 'du-luot-dau', 'co-du'] as const);
  const d = longDivision(...pickDivision(rng, level));
  const tensStep = d.steps[0] as Extract<DivStep, { kind: 'chia' }>;
  const ha = d.steps[3] as Extract<DivStep, { kind: 'ha' }>;
  const second = d.steps[4] as Extract<DivStep, { kind: 'chia' }>;
  const hints = [
    `Chia từ hàng chục: ${tensStep.part} chia ${d.divisor} được ${tensStep.answer}.`,
    `Hạ ${ha.digit} xuống được ${ha.next}; ${ha.next} chia ${d.divisor} được ${second.answer}.`,
  ];
  if (d.remainder === 0) {
    const story = rng.chance(0.5);
    const name = rng.pick(NAMES);
    return {
      prompt: story ? `${name} có ${d.dividend} chiếc nơ, chia đều vào ${d.divisor} hộp. Hỏi mỗi hộp có mấy chiếc nơ?` : `Đặt tính rồi tính: ${d.dividend} : ${d.divisor} = ?`,
      answer: d.quotient,
      unit: story ? 'chiếc' : undefined,
      input: 'number',
      distractors: [
        { value: String(tensStep.answer * 10 + Math.floor(ha.digit / d.divisor)), why: 'Nhớ hạ cả phần dư của lượt chia đầu xuống cùng chữ số hàng đơn vị nhé.' },
        { value: String(d.quotient + 1), why: 'Thử lại bằng phép nhân nhé.' },
        { value: String(tensStep.answer), why: 'Còn một lượt chia nữa với chữ số hàng đơn vị.' },
      ],
      hints,
      solution: `${d.dividend} : ${d.divisor} = ${d.quotient}.`,
    };
  }
  return {
    prompt: `Đặt tính rồi tính: ${d.dividend} : ${d.divisor} được thương là mấy (còn dư ${d.remainder})?`,
    speak: `${d.dividend} chia ${d.divisor} được thương là mấy, còn dư ${d.remainder}?`,
    answer: d.quotient,
    input: 'number',
    distractors: [
      { value: String(d.quotient + 1), why: `${d.quotient + 1} × ${d.divisor} = ${(d.quotient + 1) * d.divisor}, lớn hơn ${d.dividend} rồi.` },
      { value: String(tensStep.answer), why: 'Còn một lượt chia nữa với chữ số hàng đơn vị.' },
    ],
    hints,
    solution: `${d.dividend} : ${d.divisor} = ${d.quotient} (dư ${d.remainder}).`,
  };
}
