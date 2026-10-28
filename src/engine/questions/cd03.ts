// Chủ đề 3 — Làm quen với hình phẳng, hình khối (Bài 16–22).
import type { Rng } from '../rng';
import type { Draft } from './types';

const POINT_LETTERS = ['M', 'N', 'I', 'K', 'C', 'D', 'E', 'H'];

export function trungDiem(rng: Rng): Draft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const length = rng.pick([4, 6, 8, 10, 12]);
    const mid = length / 2;
    const [mLabel, ...others] = rng.shuffle(POINT_LETTERS);
    const decoyPositions = rng.shuffle([...new Set([1, 2, mid - 1, mid + 1, length - 1])].filter((p) => p > 0 && p < length && p !== mid));
    const decoys = decoyPositions.slice(0, 2).map((at, i) => ({ label: others[i], at }));
    return {
      prompt: 'Trung điểm của đoạn thẳng AB là điểm nào?',
      visual: {
        kind: 'segment',
        length,
        showRuler: true,
        points: [{ label: 'A', at: 0 }, { label: 'B', at: length }, { label: mLabel, at: mid }, ...decoys],
      },
      answer: mLabel,
      options: [mLabel, ...decoys.map((d) => d.label)],
      hints: ['Trung điểm nằm ở giữa và chia đoạn thẳng thành hai phần dài bằng nhau.', `Đoạn AB dài ${length} ô. Trung điểm cách A ${mid} ô.`],
      solution: `${mLabel} cách A ${mid} ô và cách B ${mid} ô, nên ${mLabel} là trung điểm của AB.`,
    };
  }
  if (kind === 1) {
    const half = rng.int(2, 9);
    const fromWhole = rng.chance(0.5);
    const label = rng.pick(['M', 'I', 'O']);
    return fromWhole
      ? {
          prompt: `${label} là trung điểm của đoạn thẳng AB. Đoạn thẳng AB dài ${half * 2} cm. Hỏi đoạn thẳng A${label} dài mấy xăng-ti-mét?`,
          answer: half,
          unit: 'cm',
          input: 'number',
          distractors: [
            { value: String(half * 2), why: `A${label} chỉ là một nửa đoạn AB thôi.` },
            { value: String(half * 4), why: 'Trung điểm chia đôi đoạn thẳng, nên phải lấy chia 2.' },
          ],
          hints: ['Trung điểm chia đoạn thẳng thành 2 phần dài bằng nhau.', `Lấy ${half * 2} : 2.`],
          solution: `A${label} = ${half * 2} : 2 = ${half} (cm).`,
        }
      : {
          prompt: `${label} là trung điểm của đoạn thẳng AB. Đoạn thẳng A${label} dài ${half} cm. Hỏi đoạn thẳng AB dài mấy xăng-ti-mét?`,
          answer: half * 2,
          unit: 'cm',
          input: 'number',
          distractors: [
            { value: String(half), why: `AB gồm cả A${label} và ${label}B.` },
            { value: String(half + 1), why: `AB = A${label} + ${label}B.` },
          ],
          hints: [`${label}B cũng dài ${half} cm.`, `Lấy ${half} × 2.`],
          solution: `AB = ${half} × 2 = ${half * 2} (cm).`,
        };
  }
  const length = rng.pick([6, 8, 10]);
  const isMid = rng.chance(0.5);
  const at = isMid ? length / 2 : rng.pick([length / 2 - 1, length / 2 + 1, 2]);
  return {
    prompt: 'Điểm O nằm giữa hai điểm A và B. O có phải là trung điểm của đoạn thẳng AB không?',
    visual: { kind: 'segment', length, showRuler: true, points: [{ label: 'A', at: 0 }, { label: 'B', at: length }, { label: 'O', at }] },
    answer: isMid ? 'Có' : 'Không',
    options: ['Có', 'Không'],
    hints: ['Đếm số ô từ A đến O và từ O đến B.', 'Trung điểm phải cách đều hai đầu đoạn thẳng.'],
    solution: `AO dài ${at} ô, OB dài ${length - at} ô — ${isMid ? 'bằng nhau, nên O là trung điểm.' : 'không bằng nhau, nên O chỉ là điểm ở giữa, không phải trung điểm.'}`,
  };
}

export function hinhTron(rng: Rng): Draft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const center = rng.pick(['O', 'I']);
    const [r1, d1, d2, c1, c2] = rng.shuffle(['A', 'B', 'C', 'D', 'E', 'M', 'N', 'P']);
    const radius = `${center}${r1}`;
    const diameter = `${d1}${d2}`;
    const chord = `${c1}${c2}`;
    const ask = rng.pick(['radius', 'diameter', 'center'] as const);
    const visual = {
      kind: 'circle' as const,
      center,
      segments: [
        { label: radius, from: center, to: r1, type: 'radius' as const },
        { label: diameter, from: d1, to: d2, type: 'diameter' as const },
        { label: chord, from: c1, to: c2, type: 'chord' as const },
      ],
    };
    if (ask === 'center') {
      return {
        prompt: 'Tâm của hình tròn là điểm nào?',
        visual,
        answer: center,
        options: [center, r1, d1, c1],
        hints: ['Tâm là điểm nằm chính giữa hình tròn.'],
        solution: `Tâm của hình tròn là điểm ${center}.`,
      };
    }
    return {
      prompt: `Đoạn thẳng nào là ${ask === 'radius' ? 'bán kính' : 'đường kính'} của hình tròn tâm ${center}?`,
      visual,
      answer: ask === 'radius' ? radius : diameter,
      options: [radius, diameter, chord],
      hints: [
        ask === 'radius' ? 'Bán kính nối tâm với một điểm trên đường tròn.' : 'Đường kính đi qua tâm và nối hai điểm trên đường tròn.',
      ],
      solution:
        ask === 'radius'
          ? `${radius} nối tâm ${center} với điểm ${r1} trên đường tròn, nên ${radius} là bán kính.`
          : `${diameter} đi qua tâm ${center}, nên ${diameter} là đường kính.`,
    };
  }
  const r = rng.int(2, 9);
  if (kind === 1) {
    return {
      prompt: `Hình tròn tâm O có bán kính ${r} cm. Hỏi đường kính của hình tròn dài mấy xăng-ti-mét?`,
      answer: r * 2,
      unit: 'cm',
      input: 'number',
      distractors: [
        { value: String(r), why: 'Đường kính dài gấp đôi bán kính.' },
        { value: String(r + 2), why: 'Đường kính = bán kính × 2.' },
      ],
      hints: ['Độ dài đường kính gấp 2 lần độ dài bán kính.'],
      solution: `Đường kính = ${r} × 2 = ${r * 2} (cm).`,
    };
  }
  return {
    prompt: `Hình tròn tâm O có đường kính ${r * 2} cm. Hỏi bán kính của hình tròn dài mấy xăng-ti-mét?`,
    answer: r,
    unit: 'cm',
    input: 'number',
    distractors: [
      { value: String(r * 4), why: 'Bán kính chỉ bằng một nửa đường kính.' },
      { value: String(r * 2), why: 'Đó là đường kính rồi.' },
    ],
    hints: ['Bán kính dài bằng một nửa đường kính.'],
    solution: `Bán kính = ${r * 2} : 2 = ${r} (cm).`,
  };
}

export function gocVuong(rng: Rng): Draft {
  if (rng.chance(0.65)) {
    const right = rng.chance(0.5);
    const degrees = right ? 90 : rng.pick([45, 60, 70, 110, 120, 135]);
    return {
      prompt: 'Góc dưới đây là góc vuông hay góc không vuông?',
      visual: { kind: 'angle', degrees, rotation: rng.pick([0, 15, 30, 45, 60, 90, 180, 270]) },
      answer: right ? 'Góc vuông' : 'Góc không vuông',
      options: ['Góc vuông', 'Góc không vuông'],
      hints: ['Dùng ê ke: đặt góc vuông của ê ke trùng đỉnh, một cạnh ê ke trùng một cạnh của góc.', 'Nếu cạnh còn lại cũng trùng cạnh ê ke thì đó là góc vuông.'],
      solution: right ? 'Hai cạnh trùng với hai cạnh ê ke nên đây là góc vuông.' : 'Cạnh còn lại không trùng cạnh ê ke nên đây là góc không vuông.',
    };
  }
  const shape = rng.pick(['rectangle', 'square', 'right-triangle', 'triangle'] as const);
  const count = { rectangle: 4, square: 4, 'right-triangle': 1, triangle: 0 }[shape];
  const name = { rectangle: 'hình chữ nhật', square: 'hình vuông', 'right-triangle': 'hình tam giác', triangle: 'hình tam giác' }[shape];
  return {
    prompt: `${name.charAt(0).toUpperCase() + name.slice(1)} dưới đây có mấy góc vuông?`,
    visual: { kind: 'polygon', shape },
    answer: String(count),
    options: ['0', '1', '2', '4'],
    hints: ['Kiểm tra từng góc bằng ê ke.', shape === 'rectangle' || shape === 'square' ? 'Hình chữ nhật và hình vuông đều có 4 góc vuông.' : 'Đếm các góc có kí hiệu vuông.'],
    solution: `${name.charAt(0).toUpperCase() + name.slice(1)} này ${count === 0 ? 'không có góc vuông nào' : `có ${count} góc vuông`}.`,
  };
}

const SHAPE_NAMES = {
  triangle: 'Hình tam giác',
  'right-triangle': 'Hình tam giác',
  quadrilateral: 'Hình tứ giác',
  rectangle: 'Hình chữ nhật',
  square: 'Hình vuông',
} as const;

export function hinhPhang(rng: Rng): Draft {
  const shape = rng.pick(['triangle', 'right-triangle', 'quadrilateral', 'rectangle', 'square'] as const);
  const sides = shape === 'triangle' || shape === 'right-triangle' ? 3 : 4;
  const kind = rng.int(0, 2);
  if (kind === 0) {
    // Hình chữ nhật, hình vuông cũng là tứ giác — nên khi hỏi tên thì không đưa "tứ giác" vào lựa chọn cho hai hình này.
    const options =
      shape === 'rectangle' || shape === 'square'
        ? ['Hình tam giác', 'Hình chữ nhật', 'Hình vuông', 'Hình tròn']
        : ['Hình tam giác', 'Hình tứ giác', 'Hình tròn', 'Hình vuông'];
    return {
      prompt: 'Hình dưới đây là hình gì?',
      visual: { kind: 'polygon', shape },
      answer: SHAPE_NAMES[shape],
      options,
      hints: [
        `Đếm số cạnh: hình này có ${sides} cạnh.`,
        shape === 'square' ? 'Bốn cạnh dài bằng nhau và bốn góc vuông.' : shape === 'rectangle' ? 'Bốn góc vuông, hai cạnh dài bằng nhau, hai cạnh ngắn bằng nhau.' : sides === 3 ? 'Hình có 3 cạnh là hình tam giác.' : 'Hình có 4 cạnh là hình tứ giác.',
      ],
      solution: `Đây là ${SHAPE_NAMES[shape].toLowerCase()}.`,
    };
  }
  const ask = kind === 1 ? 'cạnh' : 'đỉnh';
  return {
    prompt: `${SHAPE_NAMES[shape]} dưới đây có mấy ${ask}?`,
    visual: { kind: 'polygon', shape },
    answer: String(sides),
    options: ['2', '3', '4', '5'],
    hints: [`Đếm từng ${ask} và chạm vào nó khi đếm.`],
    solution: `${SHAPE_NAMES[shape]} có ${sides} ${ask}.`,
  };
}

export function khoiHinh(rng: Rng): Draft {
  const solid = rng.pick(['cube', 'box'] as const);
  const name = solid === 'cube' ? 'Khối lập phương' : 'Khối hộp chữ nhật';
  const kind = rng.int(0, 2);
  if (kind === 0) {
    return {
      prompt: 'Đây là khối gì?',
      visual: { kind: 'solid', solid },
      answer: name,
      options: ['Khối lập phương', 'Khối hộp chữ nhật', 'Khối cầu', 'Khối trụ'],
      hints: [solid === 'cube' ? 'Tất cả các mặt đều là hình vuông bằng nhau.' : 'Các mặt là hình chữ nhật (có thể có hai mặt hình vuông).'],
      solution: `Đây là ${name.toLowerCase()}.`,
    };
  }
  if (kind === 1) {
    const [part, count] = rng.pick([
      ['mặt', 6],
      ['cạnh', 12],
      ['đỉnh', 8],
    ] as const);
    return {
      prompt: `${name} có mấy ${part}?`,
      visual: { kind: 'solid', solid },
      answer: String(count),
      options: ['4', '6', '8', '12'],
      hints: [`Khối lập phương và khối hộp chữ nhật đều có 6 mặt, 12 cạnh, 8 đỉnh.`],
      solution: `${name} có ${count} ${part}.`,
    };
  }
  const [thing, answer] = rng.pick([
    ['Con xúc xắc 🎲', 'Khối lập phương'],
    ['Viên gạch 🧱', 'Khối hộp chữ nhật'],
    ['Hộp sữa 🧃', 'Khối hộp chữ nhật'],
    ['Viên đá lạnh 🧊', 'Khối lập phương'],
    ['Quả bóng ⚽', 'Khối cầu'],
    ['Lon sữa 🥫', 'Khối trụ'],
  ] as const);
  return {
    prompt: `${thing} có dạng khối gì?`,
    answer,
    options: ['Khối lập phương', 'Khối hộp chữ nhật', 'Khối cầu', 'Khối trụ'],
    hints: ['Tròn đều như quả bóng là khối cầu; tròn như ống, hai đáy là hình tròn là khối trụ.', 'Các mặt đều là hình vuông là khối lập phương; có mặt hình chữ nhật là khối hộp chữ nhật.'],
    solution: `${thing.split(' ').slice(0, -1).join(' ')} có dạng ${answer.toLowerCase()}.`,
  };
}
