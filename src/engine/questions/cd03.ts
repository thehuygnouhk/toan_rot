// Chủ đề 3 — Làm quen với hình phẳng, hình khối (Bài 16–22).
import type { Rng } from '../rng';
import type { CountShape, Draft, GridPoint, Visual } from './types';

const POINT_LETTERS = ['M', 'N', 'I', 'K', 'C', 'D', 'E', 'H'];

export function trungDiem(rng: Rng): Draft {
  if (rng.chance(0.35)) return trungDiemTamGiac(rng);
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

/** Tam giác vẽ trên lưới ô vuông, các điểm đánh dấu trên cạnh (như vở bài tập): nhận ra trung điểm của từng cạnh. */
function trungDiemTamGiac(rng: Rng): Draft {
  const pts: Record<'A' | 'B' | 'C', GridPoint> = {
    A: { label: 'A', x: 0, y: rng.pick([4, 6]) },
    B: { label: 'B', x: rng.pick([4, 6, 8]), y: 0 },
    C: { label: 'C', x: 12, y: rng.pick([4, 6]) },
  };
  const sides = [['A', 'B'], ['B', 'C'], ['A', 'C']] as const;
  const [ask, other] = rng.shuffle([0, 1, 2]);
  const [midLabel, otherLabel, decoyLabel] = rng.shuffle(['M', 'N', 'P', 'Q']);
  const at = (side: readonly ['A' | 'B' | 'C', 'A' | 'B' | 'C'], t: number) => {
    const [p, q] = [pts[side[0]], pts[side[1]]];
    return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
  };
  const marks: GridPoint[] = [
    { label: midLabel, ...at(sides[ask], 0.5) },
    { label: otherLabel, ...at(sides[other], 0.5) },
    { label: decoyLabel, ...at(sides[ask], rng.pick([1 / 3, 2 / 3, 1 / 4, 3 / 4])) },
  ];
  const visual: Visual = { kind: 'grid-figure', width: 12, height: 6, vertices: [pts.A, pts.B, pts.C], marks };
  const name = (i: number) => sides[i].join('');
  const halfCells = (i: number) => Math.abs(pts[sides[i][1]].x - pts[sides[i][0]].x) / 2;
  if (rng.chance(0.6)) {
    return {
      prompt: `Trung điểm của cạnh ${name(ask)} là điểm nào?`,
      visual,
      answer: midLabel,
      options: [midLabel, otherLabel, decoyLabel],
      distractors: [
        { value: otherLabel, why: `${otherLabel} không nằm trên cạnh ${name(ask)}.` },
        { value: decoyLabel, why: `${decoyLabel} nằm trên cạnh ${name(ask)} nhưng không chia cạnh thành hai phần bằng nhau.` },
      ],
      hints: [`Trung điểm phải nằm trên cạnh ${name(ask)}.`, 'Trung điểm chia cạnh thành hai phần dài bằng nhau: đếm số ô theo chiều ngang ở hai bên.'],
      solution: `${midLabel} nằm trên cạnh ${name(ask)}. Theo chiều ngang, ${midLabel} cách ${sides[ask][0]} ${halfCells(ask)} ô và cách ${sides[ask][1]} ${halfCells(ask)} ô, nên ${midLabel} là trung điểm của ${name(ask)}.`,
    };
  }
  return {
    prompt: `Điểm ${otherLabel} là trung điểm của cạnh nào?`,
    visual,
    answer: name(other),
    options: ['AB', 'BC', 'AC'],
    hints: [`Xem điểm ${otherLabel} nằm trên cạnh nào.`],
    solution: `${otherLabel} nằm trên cạnh ${name(other)} và chia cạnh đó thành hai phần bằng nhau.`,
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
    // Có lúc không vẽ bán kính riêng: bán kính là nửa đường kính (O nối với một đầu đường kính)
    const drawnRadius = rng.chance(0.5);
    const radiusAnswer = drawnRadius ? radius : `${center}${d1}`;
    const visual: Visual = {
      kind: 'circle',
      center,
      segments: [
        ...(drawnRadius ? [{ label: radius, from: center, to: r1, type: 'radius' as const }] : []),
        { label: diameter, from: d1, to: d2, type: 'diameter' },
        { label: chord, from: c1, to: c2, type: 'chord' },
      ],
    };
    if (ask === 'center') {
      return {
        prompt: 'Tâm của hình tròn là điểm nào?',
        visual,
        answer: center,
        options: [center, drawnRadius ? r1 : d2, d1, c1],
        hints: ['Tâm là điểm nằm chính giữa hình tròn.'],
        solution: `Tâm của hình tròn là điểm ${center}.`,
      };
    }
    return {
      prompt: `Đoạn thẳng nào là ${ask === 'radius' ? 'bán kính' : 'đường kính'} của hình tròn tâm ${center}?`,
      visual,
      answer: ask === 'radius' ? radiusAnswer : diameter,
      options: [radiusAnswer, diameter, chord],
      distractors: [
        { value: chord, why: `${chord} không đi qua tâm ${center}.` },
        ...(ask === 'radius' ? [{ value: diameter, why: `${diameter} đi qua tâm và nối hai điểm trên đường tròn: đó là đường kính.` }] : []),
        ...(ask === 'diameter' ? [{ value: radiusAnswer, why: `${radiusAnswer} chỉ nối tâm với một điểm trên đường tròn: đó là bán kính.` }] : []),
      ],
      hints: [
        ask === 'radius' ? 'Bán kính nối tâm với một điểm trên đường tròn.' : 'Đường kính đi qua tâm và nối hai điểm trên đường tròn.',
        ...(ask === 'radius' && !drawnRadius ? [`Bán kính dài bằng một nửa đường kính ${diameter}.`] : []),
      ],
      solution:
        ask === 'radius'
          ? `${radiusAnswer} nối tâm ${center} với điểm ${radiusAnswer[1]} trên đường tròn, nên ${radiusAnswer} là bán kính.`
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

const COUNT_WORD: Record<number, string> = { 2: 'Hai', 3: 'Ba', 4: 'Bốn' };

/** Bài toán hình tròn có hình vẽ (Bài 17, 22): chú kiến bò qua các hình tròn, hình tròn xếp vừa khít trong hình chữ nhật. */
export function hinhTronUngDung(rng: Rng): Draft {
  return rng.chance(0.5) ? kienBo(rng) : hinhTronTrongHcn(rng);
}

/** Đếm số bán kính trên đường đi rồi nhân: đoạn nối hai tâm dài bằng 2 bán kính. */
function kienBo(rng: Rng): Draft {
  const count = rng.int(2, 4);
  const r = rng.int(2, 9);
  const centers = ['M', 'N', 'P', 'Q'].slice(0, count);
  const [first, last] = [centers[0], centers[count - 1]];
  if (rng.chance(0.65)) {
    const k = 2 * count;
    return {
      prompt: `Chú kiến bò từ A đến B theo đường màu xanh lá cây như hình vẽ. Bán kính của mỗi hình tròn là ${r} cm. Hỏi chú kiến phải bò bao xa?`,
      visual: { kind: 'circle-chain', count, radius: r, route: 'full' },
      answer: r * k,
      unit: 'cm',
      input: 'number',
      distractors: [
        { value: String(r * (count + 1)), why: `Đoạn nối hai tâm (như ${first}${centers[1]}) dài bằng đường kính, tức là 2 bán kính.` },
        { value: String(r * (k - 1)), why: `Con quên đoạn A${first} hoặc đoạn ${last}B rồi.` },
        { value: String(r * (k - 2)), why: `Còn đoạn A${first} và đoạn ${last}B nữa.` },
      ],
      hints: [
        `A${first} là một bán kính. Đoạn nối hai tâm ${first}${centers[1]} dài bằng 2 bán kính.`,
        `Đếm xem đường màu xanh gồm mấy bán kính: có ${k} bán kính.`,
      ],
      solution: `Đường màu xanh gồm ${k} bán kính: ${r} × ${k} = ${r * k} (cm).`,
    };
  }
  const k = 2 * (count - 1);
  return {
    prompt: `Chú kiến bò từ tâm ${first} đến tâm ${last} theo đường màu xanh lá cây như hình vẽ. Bán kính của mỗi hình tròn là ${r} cm. Hỏi chú kiến phải bò bao xa?`,
    visual: { kind: 'circle-chain', count, radius: r, route: 'centers' },
    answer: r * k,
    unit: 'cm',
    input: 'number',
    distractors: [
      { value: String(r * (count - 1)), why: 'Đoạn nối tâm hai hình tròn sát nhau dài bằng đường kính, tức là 2 bán kính.' },
      { value: String(r * 2 * count), why: `Chú kiến chỉ bò từ tâm ${first} đến tâm ${last} thôi.` },
      { value: String(r * (k + 1)), why: 'Đếm lại số bán kính trên đường màu xanh nhé.' },
    ],
    hints: ['Đoạn nối tâm hai hình tròn sát nhau dài bằng đường kính, tức là 2 bán kính.', `Đường màu xanh gồm ${k} bán kính.`],
    solution: `Đường màu xanh gồm ${k} bán kính: ${r} × ${k} = ${r * k} (cm).`,
  };
}

/** Hình tròn bằng nhau xếp vừa khít trong hình chữ nhật: chiều dài = số hình × đường kính, chiều rộng = đường kính. */
function hinhTronTrongHcn(rng: Rng): Draft {
  const count = rng.int(2, 4);
  const theme = rng.pick(['cuc-ao', 'banh-quy'] as const);
  const r = theme === 'cuc-ao' ? rng.int(1, 3) : rng.int(2, 5);
  const d = 2 * r;
  const length = d * count;
  const [obj, box] = theme === 'cuc-ao' ? ['chiếc cúc áo', 'miếng vải'] : ['chiếc bánh quy', 'hộp bánh'];
  const intro =
    theme === 'cuc-ao'
      ? `${COUNT_WORD[count]} chiếc cúc áo tròn như nhau được đính vừa khít trên miếng vải hình chữ nhật như hình bên.`
      : `${COUNT_WORD[count]} chiếc bánh quy tròn như nhau được xếp vừa khít trong hộp bánh hình chữ nhật như hình bên.`;
  const kind = rng.int(0, 3);
  if (kind <= 1) {
    const askRadius = kind === 0;
    return {
      prompt: `${intro} Chiều dài ${box} là ${length} cm. Vậy ${askRadius ? 'bán kính' : 'đường kính'} của mỗi ${obj} là mấy xăng-ti-mét?`,
      visual: { kind: 'circles-in-rect', count, theme, given: 'length', value: length },
      answer: askRadius ? r : d,
      unit: 'cm',
      input: 'number',
      distractors: askRadius
        ? [
            { value: String(d), why: 'Đó là đường kính. Bán kính dài bằng một nửa đường kính.' },
            { value: String(length / 2), why: `Chiều dài ${box} bằng ${count} đường kính xếp liền nhau.` },
            { value: String(length), why: `Đó là chiều dài ${box} rồi.` },
          ]
        : [
            { value: String(r), why: 'Đó là bán kính. Đường kính dài bằng 2 bán kính.' },
            { value: String(length / 2), why: `Chiều dài ${box} bằng ${count} đường kính xếp liền nhau.` },
            { value: String(length), why: `Đó là chiều dài ${box} rồi.` },
          ],
      hints: [
        `Chiều dài ${box} bằng ${count} đường kính xếp liền nhau.`,
        `Đường kính: ${length} : ${count} = ${d} (cm).`,
        ...(askRadius ? [`Bán kính bằng một nửa đường kính: ${d} : 2.`] : []),
      ],
      solution: askRadius
        ? `Đường kính: ${length} : ${count} = ${d} (cm). Bán kính: ${d} : 2 = ${r} (cm).`
        : `Đường kính: ${length} : ${count} = ${d} (cm).`,
    };
  }
  const askLength = kind === 2;
  return {
    prompt: `${intro} Bán kính của mỗi ${obj} là ${r} cm. Hỏi ${askLength ? 'chiều dài' : 'chiều rộng'} của ${box} là mấy xăng-ti-mét?`,
    visual: { kind: 'circles-in-rect', count, theme, given: 'radius', value: r },
    answer: askLength ? length : d,
    unit: 'cm',
    input: 'number',
    distractors: askLength
      ? [
          { value: String(r * count), why: 'Mỗi hình tròn chiếm một đường kính (2 bán kính) theo chiều dài.' },
          { value: String(d), why: 'Đó mới là đường kính của một hình tròn.' },
          { value: String(length + d), why: 'Đếm lại số hình tròn nhé.' },
        ]
      : [
          { value: String(r), why: 'Chiều rộng bằng đường kính, tức là 2 bán kính.' },
          { value: String(length), why: 'Đó là chiều dài rồi.' },
        ],
    hints: askLength
      ? [`Đường kính: ${r} × 2 = ${d} (cm).`, `Chiều dài bằng ${count} đường kính: ${d} × ${count}.`]
      : [`Chiều rộng ${box} bằng đường kính của một ${obj}.`, `Đường kính: ${r} × 2.`],
    solution: askLength
      ? `Đường kính: ${r} × 2 = ${d} (cm). Chiều dài: ${d} × ${count} = ${length} (cm).`
      : `Chiều rộng bằng đường kính: ${r} × 2 = ${d} (cm).`,
  };
}

const COUNT_FACTS: Record<CountShape, { ask: string; answer: number; small: number; solution: string }> = {
  'fan-2': { ask: 'hình tam giác', answer: 3, small: 2, solution: '2 hình tam giác nhỏ và 1 hình tam giác to ghép từ cả hai: 2 + 1 = 3.' },
  'fan-3': { ask: 'hình tam giác', answer: 6, small: 3, solution: '3 hình nhỏ, 2 hình ghép từ 2 hình nhỏ cạnh nhau, 1 hình to ghép từ cả 3: 3 + 2 + 1 = 6.' },
  'strips-2': { ask: 'hình chữ nhật', answer: 3, small: 2, solution: '2 hình chữ nhật nhỏ và 1 hình chữ nhật to: 2 + 1 = 3.' },
  'strips-3': { ask: 'hình chữ nhật', answer: 6, small: 3, solution: '3 hình nhỏ, 2 hình ghép từ 2 hình nhỏ cạnh nhau, 1 hình to: 3 + 2 + 1 = 6.' },
  'grid-2x2': { ask: 'hình vuông', answer: 5, small: 4, solution: '4 hình vuông nhỏ và 1 hình vuông to: 4 + 1 = 5.' },
  'square-x': { ask: 'hình tam giác', answer: 8, small: 4, solution: '4 hình tam giác nhỏ, và 4 hình tam giác là nửa hình vuông (cắt theo một đường chéo): 4 + 4 = 8.' },
};

/** Đếm hình trong hình ghép (Bài 19, 22): đếm hình nhỏ rồi đếm hình ghép. */
export function demHinh(rng: Rng): Draft {
  const shape = rng.pick(Object.keys(COUNT_FACTS) as CountShape[]);
  const fact = COUNT_FACTS[shape];
  return {
    prompt: `Hình bên có tất cả bao nhiêu ${fact.ask}?`,
    visual: { kind: 'count-shapes', shape },
    answer: fact.answer,
    distractors: [
      { value: String(fact.small), why: `Con mới đếm các ${fact.ask} nhỏ thôi. Còn ${fact.ask} ghép từ nhiều hình nhỏ nữa!` },
      { value: String(fact.answer - 1), why: `Còn sót một ${fact.ask}. Đếm lại cả hình to nhé.` },
      { value: String(fact.answer + 1), why: 'Hình nào đã đếm rồi thì không đếm lại.' },
      { value: String(fact.answer + 2), why: 'Hình nào đã đếm rồi thì không đếm lại.' },
    ],
    hints: [`Đếm các ${fact.ask} nhỏ trước.`, `Rồi đếm các ${fact.ask} ghép từ 2 hình nhỏ, từ 3 hình nhỏ…`],
    solution: fact.solution,
  };
}

/** Khối hộp chữ nhật ghép từ khối lập phương nhỏ (Bài 21, vở bài tập): đếm khối, đếm khối được sơn 3 mặt, 2 mặt. */
export function khoiGhep(rng: Rng): Draft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const [a, b, c] = [rng.int(2, 4), rng.int(2, 3), rng.int(1, 2)];
    const layer = a * b;
    const total = layer * c;
    return {
      prompt: 'Người ta ghép các khối lập phương nhỏ thành khối hộp chữ nhật như hình bên. Hỏi có tất cả bao nhiêu khối lập phương nhỏ?',
      visual: { kind: 'cube-stack', a, b, c },
      answer: total,
      distractors: [
        { value: String(a * c + a * b + b * c), why: 'Con mới đếm các ô nhìn thấy. Có khối bị che khuất ở bên trong và phía sau nữa.' },
        ...(c > 1 ? [{ value: String(layer), why: `Đó mới là một tầng. Khối hộp có ${c} tầng.` }] : []),
        { value: String(a + b + c), why: `Mỗi hàng ${a} khối, có ${b} hàng — mình dùng phép nhân nhé.` },
      ],
      hints: [
        c === 1 ? `Có ${b} hàng, mỗi hàng ${a} khối.` : `Có ${c} tầng. Mỗi tầng có ${b} hàng, mỗi hàng ${a} khối.`,
        `Mỗi tầng: ${a} × ${b} = ${layer} khối.`,
      ],
      solution: c === 1 ? `${a} × ${b} = ${total} (khối).` : `Mỗi tầng: ${a} × ${b} = ${layer} (khối). Hai tầng: ${layer} + ${layer} = ${total} (khối).`,
    };
  }
  const [a, b] = kind === 1 ? [rng.int(2, 4), rng.int(2, 3)] : rng.pick([[3, 2], [4, 2], [3, 3], [4, 3]] as const);
  const total = a * b * 2;
  const intro = `Ghép ${total} khối lập phương nhỏ để được khối hộp chữ nhật như hình bên. Người ta sơn màu vào tất cả các mặt của khối hộp chữ nhật đó.`;
  const visual: Visual = { kind: 'cube-stack', a, b, c: 2 };
  if (kind === 1) {
    return {
      prompt: `${intro} Hỏi có mấy khối lập phương nhỏ được sơn màu 3 mặt?`,
      visual,
      answer: 8,
      distractors: [
        { value: '4', why: 'Đếm cả các khối ở đỉnh phía sau và phía dưới nữa nhé.' },
        { value: '6', why: 'Khối hộp có 6 mặt, nhưng câu hỏi là số khối nhỏ nằm ở các đỉnh.' },
        { value: '12', why: '12 là số cạnh của khối hộp chữ nhật.' },
      ],
      hints: ['Khối nhỏ được sơn 3 mặt nằm ở các đỉnh của khối hộp chữ nhật.', 'Khối hộp chữ nhật có mấy đỉnh?'],
      solution: 'Mỗi đỉnh của khối hộp có đúng 1 khối nhỏ được sơn 3 mặt. Khối hộp chữ nhật có 8 đỉnh, nên có 8 khối.',
    };
  }
  // Khối sơn 2 mặt nằm trên cạnh, không ở đỉnh: mỗi cạnh dài n khối có n − 2 khối như vậy
  const answer = 4 * (a - 2) + 4 * (b - 2);
  const parts =
    a === b
      ? [`8 cạnh dài ${a} khối, mỗi cạnh có ${a - 2} khối: 8 × ${a - 2} = ${answer}.`]
      : [
          `4 cạnh dài ${a} khối, mỗi cạnh có ${a - 2} khối: 4 × ${a - 2} = ${4 * (a - 2)}.`,
          ...(b > 2 ? [`4 cạnh dài ${b} khối, mỗi cạnh có ${b - 2} khối: 4 × ${b - 2} = ${4 * (b - 2)}.`] : []),
        ];
  parts.push('Các cạnh dài 2 khối không có khối nào như vậy.');
  return {
    prompt: `${intro} Hỏi có mấy khối lập phương nhỏ được sơn màu 2 mặt?`,
    visual,
    answer,
    distractors: [
      { value: '8', why: '8 khối ở các đỉnh được sơn 3 mặt, không phải 2 mặt.' },
      { value: String(total - 8), why: 'Khối được sơn 2 mặt nằm trên cạnh nhưng không ở đỉnh. Xem lại từng cạnh nhé.' },
      { value: String(answer + 4), why: 'Đếm lại: không tính các khối ở đỉnh.' },
    ],
    hints: ['Khối được sơn 2 mặt nằm trên các cạnh của khối hộp nhưng không ở đỉnh.', `Một cạnh dài ${a} khối có ${a} − 2 = ${a - 2} khối như vậy (bỏ 2 khối ở hai đầu).`],
    solution: `${parts.join(' ')} Tất cả: ${answer} khối.`,
  };
}
