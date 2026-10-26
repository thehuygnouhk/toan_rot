// Chủ đề 1 — Ôn tập và bổ sung (Bài 1–8): số đến 1 000, cộng trừ, tìm thành phần, bảng nhân chia 2–5.
import type { Rng } from '../rng';
import { CONTAINERS, NAMES, THINGS, fmt } from './format';
import { readNumber } from './readNumber';
import type { Draft } from './types';

const digits = (n: number) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10];

/** Số lần nhớ khi cộng a + b (theo từng hàng). */
export function carriesAdd(a: number, b: number): number {
  const da = digits(a);
  const db = digits(b);
  let carry = 0;
  let count = 0;
  for (let i = 0; i < 3; i++) {
    const s = da[i] + db[i] + carry;
    carry = s >= 10 ? 1 : 0;
    count += carry;
  }
  return count;
}

/** Số lần "mượn" khi trừ a − b. */
export function borrowsSub(a: number, b: number): number {
  const da = digits(a);
  const db = digits(b);
  let borrow = 0;
  let count = 0;
  for (let i = 0; i < 3; i++) {
    const d = da[i] - db[i] - borrow;
    borrow = d < 0 ? 1 : 0;
    count += borrow;
  }
  return count;
}

/** Lỗi hay gặp: cộng từng hàng nhưng quên nhớ. */
const addNoCarry = (a: number, b: number) => {
  const da = digits(a);
  const db = digits(b);
  return ((da[2] + db[2]) % 10) * 100 + ((da[1] + db[1]) % 10) * 10 + ((da[0] + db[0]) % 10);
};

/** Lỗi hay gặp: ở mỗi hàng lấy số lớn trừ số bé. */
const subBigMinusSmall = (a: number, b: number) => {
  const da = digits(a);
  const db = digits(b);
  return Math.abs(da[2] - db[2]) * 100 + Math.abs(da[1] - db[1]) * 10 + Math.abs(da[0] - db[0]);
};

/** Cặp số cho phép cộng trong 1 000, có nhớ không quá một lượt. */
export function pickAddition(rng: Rng): [number, number] {
  for (;;) {
    const a = rng.int(100, 899);
    const b = rng.int(rng.chance(0.3) ? 10 : 100, 999 - a);
    if (b >= 10 && a + b <= 999 && carriesAdd(a, b) <= 1) return [a, b];
  }
}

/** Cặp số cho phép trừ trong 1 000, có nhớ không quá một lượt, hiệu dương. */
export function pickSubtraction(rng: Rng): [number, number] {
  for (;;) {
    const a = rng.int(200, 999);
    const b = rng.int(rng.chance(0.3) ? 10 : 100, a - 10);
    if (b >= 10 && borrowsSub(a, b) <= 1) return [a, b];
  }
}

export function soDen1000(rng: Rng): Draft {
  const kind = rng.int(0, 3);
  const h = rng.int(1, 9);
  const t = rng.chance(0.35) ? 0 : rng.int(0, 9);
  const u = rng.int(0, 9);
  const n = h * 100 + t * 10 + u;
  if (kind === 0 || (kind === 3 && (new Set([h, t, u]).size < 3 || t === 0))) {
    return {
      prompt: `Số gồm ${h} trăm, ${t} chục và ${u} đơn vị viết là:`,
      answer: n,
      distractors: [
        { value: String(h * 100 + u * 10 + t), why: 'Đổi chỗ chữ số hàng chục và hàng đơn vị rồi.' },
        { value: String(Number(`${h}${t === 0 ? '' : t}${u}`)), why: 'Hàng chục có 0 chục thì phải viết chữ số 0.' },
        { value: String(u * 100 + t * 10 + h), why: 'Chữ số hàng trăm phải đứng đầu.' },
      ],
      hints: ['Viết lần lượt: chữ số hàng trăm, rồi hàng chục, rồi hàng đơn vị.', `${h} trăm là ${h * 100}, ${t} chục là ${t * 10}.`],
      solution: `${h} trăm, ${t} chục, ${u} đơn vị viết là ${n}.`,
    };
  }
  if (kind === 1) {
    const wrong = new Set<number>();
    const swapTU = h * 100 + u * 10 + t;
    const swapHU = u > 0 ? u * 100 + t * 10 + h : 0;
    for (const w of [swapTU, swapHU, t * 10 + u, (h % 9) * 100 + 100 + t * 10 + u]) {
      if (w > 0 && w <= 999 && w !== n) wrong.add(w);
    }
    const options = [n, ...[...wrong].slice(0, 3)].map(readNumber);
    return {
      prompt: `Số ${n} đọc là:`,
      speak: `Chọn cách đọc đúng của số này`,
      answer: readNumber(n),
      options,
      hints: [`Đọc chữ số hàng trăm trước: "${readNumber(h * 100)}".`, 'Nếu hàng chục là 0 thì đọc "linh".'],
      solution: `${n} đọc là: ${readNumber(n)}.`,
    };
  }
  if (kind === 2) {
    const next = rng.chance(0.5);
    const m = next ? rng.pick([99, 199, 299, 399, 499, 599, 699, 799, 899, n]) : rng.pick([100, 200, 300, 400, 500, 600, 700, 800, 900, n]);
    const ans = next ? m + 1 : m - 1;
    return {
      prompt: `Số liền ${next ? 'sau' : 'trước'} của ${m} là:`,
      answer: ans,
      distractors: [
        { value: String(next ? m - 1 : m + 1), why: next ? 'Đó là số liền trước.' : 'Đó là số liền sau.' },
        { value: String(next ? m + 10 : m - 10), why: 'Số liền sau/liền trước hơn kém nhau 1 đơn vị thôi.' },
      ],
      hints: [`Số liền ${next ? 'sau thì thêm' : 'trước thì bớt'} 1 đơn vị.`],
      solution: `${m} ${next ? '+ 1' : '− 1'} = ${ans}.`,
    };
  }
  const options = [
    `${h} trăm, ${t} chục, ${u} đơn vị`,
    `${h} trăm, ${u} chục, ${t} đơn vị`,
    `${u} trăm, ${t} chục, ${h} đơn vị`,
    `${t} trăm, ${h} chục, ${u} đơn vị`,
  ];
  return {
    prompt: `Số ${n} gồm:`,
    answer: options[0],
    options,
    hints: ['Chữ số đầu tiên (bên trái) là hàng trăm.'],
    solution: `${n} gồm ${options[0]}.`,
  };
}

export function soSanh1000(rng: Rng): Draft {
  if (rng.chance(0.6)) {
    const a = rng.int(100, 999);
    const style = rng.int(0, 2);
    let b = a;
    if (style === 0) {
      const da = digits(a);
      b = da[2] * 100 + da[0] * 10 + da[1];
    } else if (style === 1) b = a + rng.pick([-10, -1, 1, 10, 100, -100]);
    if (b < 100 || b > 999) b = a;
    const sign = a > b ? '>' : a < b ? '<' : '=';
    return {
      prompt: `Chọn dấu thích hợp: ${fmt(a)} ⬜ ${fmt(b)}`,
      speak: `So sánh ${a} và ${b}. Chọn dấu thích hợp.`,
      answer: sign,
      options: ['>', '<', '='],
      hints: ['So sánh chữ số hàng trăm trước, bằng nhau thì so sánh hàng chục, rồi hàng đơn vị.'],
      solution: `${fmt(a)} ${sign} ${fmt(b)}.`,
    };
  }
  const biggest = rng.chance(0.5);
  const base = rng.int(1, 8) * 100;
  const set = new Set<number>();
  while (set.size < 4) set.add(base + rng.int(0, 199));
  const nums = [...set];
  const ans = biggest ? Math.max(...nums) : Math.min(...nums);
  return {
    prompt: `Số ${biggest ? 'lớn nhất' : 'bé nhất'} trong các số ${nums.map(fmt).join(', ')} là:`,
    answer: ans,
    options: nums.map(String),
    hints: ['So sánh hàng trăm trước, rồi đến hàng chục, rồi hàng đơn vị.'],
    solution: `Số ${biggest ? 'lớn nhất' : 'bé nhất'} là ${ans}.`,
  };
}

export function congTru1000(rng: Rng): Draft {
  const add = rng.chance(0.5);
  const story = rng.chance(0.3);
  const [a, b] = add ? pickAddition(rng) : pickSubtraction(rng);
  const ans = add ? a + b : a - b;
  const distractors = add
    ? [
        { value: String(addNoCarry(a, b)), why: 'Con quên nhớ 1 sang hàng bên trái rồi.' },
        { value: String(ans + 10), why: 'Nhớ thừa 1 chục rồi.' },
        { value: String(a - b), why: 'Đây là phép cộng mà.' },
      ]
    : [
        { value: String(subBigMinusSmall(a, b)), why: 'Không lấy số bé trừ số lớn ngược lại được — phải mượn 1 ở hàng bên trái.' },
        { value: String(ans - 10), why: 'Trừ thừa 1 chục rồi.' },
        { value: String(a + b), why: 'Đây là phép trừ mà.' },
      ];
  const hints = [
    'Đặt tính thẳng hàng: đơn vị thẳng đơn vị, chục thẳng chục, trăm thẳng trăm.',
    add ? 'Cộng từ phải sang trái. Hàng nào được 10 trở lên thì viết chữ số hàng đơn vị và nhớ 1 sang hàng bên trái.' : 'Trừ từ phải sang trái. Hàng nào không trừ được thì mượn 1 ở hàng bên trái (và nhớ trả lại).',
  ];
  if (story) {
    const [thing, unit] = rng.pick(THINGS);
    const name = rng.pick(NAMES);
    return {
      prompt: add
        ? `Tiệm của ${name} có ${fmt(a)} ${thing}, nhập thêm ${fmt(b)} ${thing}. Tiệm có tất cả bao nhiêu ${thing}?`
        : `Tiệm của ${name} có ${fmt(a)} ${thing}, đã bán ${fmt(b)} ${thing}. Tiệm còn lại bao nhiêu ${thing}?`,
      answer: ans,
      unit,
      input: 'number',
      distractors,
      hints: [add ? '"Tất cả" thì làm phép cộng.' : '"Còn lại" thì làm phép trừ.', ...hints],
      solution: `${fmt(a)} ${add ? '+' : '−'} ${fmt(b)} = ${fmt(ans)} (${unit}).`,
    };
  }
  return {
    prompt: `Tính: ${fmt(a)} ${add ? '+' : '−'} ${fmt(b)} = ?`,
    answer: ans,
    input: rng.chance(0.5) ? 'number' : 'choice',
    distractors,
    hints,
    solution: `${fmt(a)} ${add ? '+' : '−'} ${fmt(b)} = ${fmt(ans)}.`,
  };
}

export function timThanhPhanCongTru(rng: Rng): Draft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const [x, b] = pickAddition(rng);
    const c = x + b;
    return {
      prompt: `Tìm số thích hợp: ? + ${fmt(b)} = ${fmt(c)}`,
      answer: x,
      input: rng.chance(0.5) ? 'number' : 'choice',
      distractors: [{ value: String(c + b), why: 'Muốn tìm số hạng thì lấy tổng TRỪ số hạng kia, không cộng.' }],
      hints: ['Ô trống là một số hạng.', 'Muốn tìm số hạng chưa biết, ta lấy tổng trừ đi số hạng kia.'],
      solution: `? = ${fmt(c)} − ${fmt(b)} = ${fmt(x)}.`,
    };
  }
  if (kind === 1) {
    const [a, x] = pickSubtraction(rng);
    const c = a - x;
    return {
      prompt: `Tìm số thích hợp: ${fmt(a)} − ? = ${fmt(c)}`,
      answer: x,
      input: rng.chance(0.5) ? 'number' : 'choice',
      distractors: [{ value: String(a + c), why: 'Muốn tìm số trừ thì lấy số bị trừ TRỪ hiệu.' }],
      hints: ['Ô trống là số trừ.', 'Muốn tìm số trừ, ta lấy số bị trừ trừ đi hiệu.'],
      solution: `? = ${fmt(a)} − ${fmt(c)} = ${fmt(x)}.`,
    };
  }
  const [c, b] = pickAddition(rng);
  const x = c + b;
  return {
    prompt: `Tìm số thích hợp: ? − ${fmt(b)} = ${fmt(c)}`,
    answer: x,
    input: rng.chance(0.5) ? 'number' : 'choice',
    distractors: [{ value: String(Math.abs(c - b)), why: 'Muốn tìm số bị trừ thì lấy hiệu CỘNG số trừ.' }],
    hints: ['Ô trống là số bị trừ.', 'Muốn tìm số bị trừ, ta lấy hiệu cộng với số trừ.'],
    solution: `? = ${fmt(c)} + ${fmt(b)} = ${fmt(x)}.`,
  };
}

/** Phép nhân trong bảng (table × k) dạng tính, đếm thêm hoặc toán có lời văn. */
export function multiplicationFact(rng: Rng, tables: number[]): Draft {
  const a = rng.pick(tables);
  const b = rng.int(1, 10);
  const p = a * b;
  const distractors = [
    { value: String(a * (b + 1)), why: 'Đó là kết quả của bước sau trong bảng nhân.' },
    { value: String(a * Math.max(1, b - 1)), why: 'Đó là kết quả của bước trước trong bảng nhân.' },
    { value: String(a + b), why: 'Đây là phép nhân, không phải phép cộng.' },
  ];
  const kind = rng.int(0, 2);
  if (kind === 1) {
    const [thing, unit, emoji] = rng.pick(THINGS);
    const box = rng.pick(CONTAINERS);
    const bb = Math.max(2, b);
    return {
      prompt: `Mỗi ${box} có ${a} ${thing}. Hỏi ${bb} ${box} như thế có tất cả bao nhiêu ${thing}?`,
      answer: a * bb,
      unit,
      input: 'number',
      distractors: [
        { value: String(a + bb), why: `Có ${bb} nhóm bằng nhau, mỗi nhóm ${a} — mình dùng phép nhân nhé!` },
        { value: String(a * (bb + 1)), why: 'Đếm lại số nhóm nhé.' },
      ],
      hints: [`Có ${bb} ${box}, mỗi ${box} ${a} ${thing}: lấy ${a} × ${bb}.`],
      hintVisual: { kind: 'groups', emoji, groups: bb, perGroup: a },
      solution: `${a} × ${bb} = ${a * bb} (${unit}).`,
    };
  }
  if (kind === 2 && b <= 6) {
    const seq = [1, 2, 3, 4, 5].map((i) => a * (b + i - 1));
    const hole = rng.int(1, 3);
    const shown = seq.map((v, i) => (i === hole ? '?' : String(v))).join(', ');
    return {
      prompt: `Đếm thêm ${a}: ${shown}`,
      speak: `Đếm thêm ${a}. Số còn thiếu là số mấy?`,
      answer: seq[hole],
      distractors: [
        { value: String(seq[hole] + 1), why: `Mỗi lần đếm thêm ${a}, không phải thêm 1.` },
        { value: String(seq[hole] + a), why: 'Số này còn ở sau nữa.' },
      ],
      hints: [`Mỗi số sau hơn số trước ${a} đơn vị.`],
      solution: `${seq[hole - 1]} + ${a} = ${seq[hole]}.`,
    };
  }
  return {
    prompt: `${a} × ${b} = ?`,
    answer: p,
    input: rng.chance(0.4) ? 'number' : 'choice',
    distractors,
    hints: [`Nhớ lại bảng nhân ${a}.`, b > 1 ? `${a} × ${b - 1} = ${a * (b - 1)}, thêm ${a} nữa là…` : `Số nào nhân với 1 cũng bằng chính nó.`],
    hintVisual: { kind: 'groups', emoji: '🍓', groups: b, perGroup: a },
    solution: `${a} × ${b} = ${p}.`,
  };
}

/** Phép chia trong bảng dạng tính hoặc toán có lời văn (chia đều / chia theo nhóm). */
export function divisionFact(rng: Rng, tables: number[]): Draft {
  const d = rng.pick(tables);
  const q = rng.int(1, 10);
  const n = d * q;
  const kind = rng.int(0, 2);
  if (kind > 0 && q >= 2) {
    const [thing, unit, emoji] = rng.pick(THINGS);
    const box = rng.pick(CONTAINERS);
    const evenShare = kind === 1;
    return {
      prompt: evenShare
        ? `Có ${n} ${thing} chia đều vào ${d} ${box}. Hỏi mỗi ${box} có mấy ${thing}?`
        : `Có ${n} ${thing}, xếp vào mỗi ${box} ${d} ${thing}. Hỏi xếp được mấy ${box}?`,
      answer: q,
      unit: evenShare ? unit : box,
      input: 'number',
      distractors: [
        { value: String(n - d), why: 'Chia đều thì dùng phép chia, không dùng phép trừ.' },
        { value: String(n + d), why: 'Chia ra thì số phải nhỏ đi chứ.' },
        { value: String(q + 1), why: 'Kiểm tra lại bằng phép nhân nhé.' },
      ],
      hints: [`Lấy ${n} : ${d}.`, `Nhớ bảng chia ${d}: ${d} × mấy = ${n}?`],
      hintVisual: { kind: 'groups', emoji, groups: evenShare ? d : q, perGroup: evenShare ? q : d },
      solution: `${n} : ${d} = ${q} (${evenShare ? unit : box}).`,
    };
  }
  return {
    prompt: `${n} : ${d} = ?`,
    answer: q,
    input: rng.chance(0.4) ? 'number' : 'choice',
    distractors: [
      { value: String(q + 1), why: `Kiểm tra: ${d} × ${q + 1} = ${d * (q + 1)}, không phải ${n}.` },
      { value: String(Math.max(0, q - 1) || q + 2), why: 'Thử lại bằng phép nhân nhé.' },
      { value: String(n - d), why: 'Đây là phép chia, không phải phép trừ.' },
    ],
    hints: [`Nhớ bảng nhân ${d}: ${d} × mấy = ${n}?`],
    hintVisual: { kind: 'groups', emoji: '🍬', groups: q, perGroup: d },
    solution: `Vì ${d} × ${q} = ${n} nên ${n} : ${d} = ${q}.`,
  };
}
