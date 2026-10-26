// Chủ đề 2 — Bảng nhân, bảng chia (Bài 9–15): bảng 6–9, tìm thành phần, một phần mấy.
import type { Rng } from '../rng';
import { CONTAINERS, NAMES, THINGS } from './format';
import { divisionFact, multiplicationFact } from './cd01';
import type { Draft } from './types';

const TABLES_2_9 = [2, 3, 4, 5, 6, 7, 8, 9];

export function timThanhPhanNhanChia(rng: Rng): Draft {
  const a = rng.pick(TABLES_2_9);
  const b = rng.int(2, 10);
  const p = a * b;
  const kind = rng.int(0, 2);
  const input = rng.chance(0.5) ? 'number' : 'choice';
  if (kind === 0) {
    return {
      prompt: `Tìm số thích hợp: ? × ${a} = ${p}`,
      answer: b,
      input,
      distractors: [
        { value: String(p * a), why: 'Muốn tìm thừa số thì lấy tích CHIA thừa số kia.' },
        { value: String(p - a), why: 'Muốn tìm thừa số thì lấy tích chia (không trừ) thừa số kia.' },
        { value: String(b + 1), why: `Kiểm tra: ${b + 1} × ${a} = ${(b + 1) * a}.` },
      ],
      hints: ['Ô trống là một thừa số.', 'Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số kia.'],
      solution: `? = ${p} : ${a} = ${b}.`,
    };
  }
  if (kind === 1) {
    return {
      prompt: `Tìm số thích hợp: ? : ${a} = ${b}`,
      answer: p,
      input,
      distractors: [
        { value: String(a + b), why: 'Muốn tìm số bị chia thì lấy thương NHÂN với số chia.' },
        { value: String(a * (b + 1)), why: `Kiểm tra: ${a * (b + 1)} : ${a} = ${b + 1}.` },
        { value: String(a * (b - 1)), why: `Kiểm tra: ${a * (b - 1)} : ${a} = ${b - 1}.` },
      ],
      hints: ['Ô trống là số bị chia.', 'Muốn tìm số bị chia, ta lấy thương nhân với số chia.'],
      solution: `? = ${b} × ${a} = ${p}.`,
    };
  }
  return {
    prompt: `Tìm số thích hợp: ${p} : ? = ${b}`,
    answer: a,
    input,
    distractors: [
      { value: String(p * b), why: 'Muốn tìm số chia thì lấy số bị chia CHIA cho thương.' },
      { value: String(p - b), why: 'Muốn tìm số chia thì lấy số bị chia chia (không trừ) cho thương.' },
      { value: String(a + 1), why: `Kiểm tra: ${p} : ${a + 1} có bằng ${b} không?` },
    ],
    hints: ['Ô trống là số chia.', 'Muốn tìm số chia, ta lấy số bị chia chia cho thương.'],
    solution: `? = ${p} : ${b} = ${a}.`,
  };
}

export function motPhanMayHinh(rng: Rng): Draft {
  const parts = rng.int(2, 9);
  const shape = parts <= 6 && rng.chance(0.5) ? 'circle' : 'bar';
  const near = [2, 3, 4, 5, 6, 7, 8, 9]
    .filter((n) => n !== parts)
    .sort((x, y) => Math.abs(x - parts) - Math.abs(y - parts));
  return {
    prompt: 'Đã tô màu một phần mấy của hình?',
    visual: { kind: 'fraction', shape, parts, shaded: 1 },
    answer: `1/${parts}`,
    options: [`1/${parts}`, ...near.slice(0, 3).map((n) => `1/${n}`)],
    hints: ['Đếm xem hình được chia thành mấy phần bằng nhau.', `Hình được chia thành ${parts} phần bằng nhau, tô màu 1 phần.`],
    solution: `Hình chia thành ${parts} phần bằng nhau, tô màu 1 phần: đã tô màu 1/${parts} hình.`,
  };
}

export function motPhanMaySo(rng: Rng): Draft {
  const n = rng.pick(TABLES_2_9);
  const k = rng.int(2, rng.chance(0.7) ? 5 : 9);
  const m = n * k;
  const [thing, unit, emoji, bare] = rng.pick(THINGS);
  const name = rng.pick(NAMES);
  return {
    prompt: `${name} có ${m} ${thing}. ${name} tặng bạn 1/${n} số ${bare} đó. Hỏi ${name} đã tặng bạn mấy ${thing}?`,
    answer: k,
    unit,
    input: 'number',
    distractors: [
      { value: String(m - n), why: `Muốn tìm 1/${n} của ${m} thì lấy ${m} chia cho ${n}.` },
      { value: String(n), why: `1/${n} nghĩa là chia thành ${n} phần bằng nhau rồi lấy 1 phần.` },
      { value: String(k + 1), why: 'Thử lại bằng phép nhân nhé.' },
    ],
    hints: [`Chia ${m} ${thing} thành ${n} phần bằng nhau.`, `Lấy ${m} : ${n}.`],
    hintVisual: { kind: 'groups', emoji, groups: n, perGroup: k },
    solution: `1/${n} của ${m} là: ${m} : ${n} = ${k} (${unit}).`,
  };
}

/** Toán có lời văn trộn nhân và chia trong bảng 2–9. */
export function loiVanNhanChia(rng: Rng): Draft {
  if (rng.chance(0.5)) {
    const d = multiplicationFact(rng, TABLES_2_9);
    if (d.unit) return d;
  } else {
    const d = divisionFact(rng, TABLES_2_9);
    if (d.unit) return d;
  }
  const [thing, unit] = rng.pick(THINGS);
  const box = rng.pick(CONTAINERS);
  const a = rng.pick(TABLES_2_9);
  const b = rng.int(2, 9);
  return {
    prompt: `Mỗi ${box} có ${a} ${thing}. Hỏi ${b} ${box} có bao nhiêu ${thing}?`,
    answer: a * b,
    unit,
    input: 'number',
    distractors: [{ value: String(a + b), why: 'Có các nhóm bằng nhau thì dùng phép nhân.' }],
    hints: [`Lấy ${a} × ${b}.`],
    solution: `${a} × ${b} = ${a * b} (${unit}).`,
  };
}
