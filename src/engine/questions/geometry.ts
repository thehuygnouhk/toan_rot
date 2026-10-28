// Bài vẽ hình trên lưới ô vuông (Bài 16–20, Bài 7): bé chạm các điểm mắt lưới để vẽ, code chấm và nhắc đúng lỗi.
// Toạ độ theo ô, gốc ở góc trên bên trái, y tăng xuống dưới.
import { createRng, type Rng } from '../rng';
import type { SkillId } from './types';

export const GRID_W = 12;
export const GRID_H = 8;

export interface Pt {
  x: number;
  y: number;
}

export interface LabeledPt extends Pt {
  label: string;
}

export type GeoKind = 'trung-diem' | 'hcn' | 'hinh-vuong' | 'goc-vuong' | 'gap-khuc' | 'ban-kinh' | 'duong-kinh';

export interface GeoTask {
  kind: GeoKind;
  prompt: string;
  /** Nhãn của các điểm bé chạm, theo thứ tự (số điểm cần chạm = labels.length). */
  labels: string[];
  /** Hình cho sẵn. */
  given: { points: LabeledPt[]; segments: [string, string][]; circle?: { center: Pt; r: number } };
  /** Cách nối các điểm bé chạm: khép kín, nối tiếp từ điểm cho sẵn đầu tiên, tia từ điểm cho sẵn đầu tiên, hoặc không nối. */
  connect: 'polygon' | 'polyline' | 'rays' | 'none';
  /** Số đo yêu cầu (ô). */
  a: number;
  b: number;
  skillId: SkillId;
}

export interface CheckResult {
  ok: boolean;
  message: string;
}

const sub = (p: Pt, q: Pt): Pt => ({ x: p.x - q.x, y: p.y - q.y });
const dot = (u: Pt, v: Pt) => u.x * v.x + u.y * v.y;
const len2 = (u: Pt) => dot(u, u);
const same = (p: Pt, q: Pt) => p.x === q.x && p.y === q.y;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
/** Độ dài (ô) để nói với bé: số nguyên thì nói số, không nguyên thì làm tròn một chữ số. */
const say = (d2: number) => (Number.isInteger(Math.sqrt(d2)) ? String(Math.sqrt(d2)) : `khoảng ${Math.sqrt(d2).toFixed(1).replace('.', ',')}`);

export const GEO_KINDS: GeoKind[] = ['trung-diem', 'hcn', 'hinh-vuong', 'goc-vuong', 'gap-khuc', 'ban-kinh', 'duong-kinh'];

export function makeGeoTask(kind: GeoKind, rng: Rng): GeoTask {
  const base = { given: { points: [], segments: [] }, a: 0, b: 0 } as Pick<GeoTask, 'given' | 'a' | 'b'>;
  switch (kind) {
    case 'trung-diem': {
      const [dx, dy] = rng.pick([[8, 0], [10, 0], [6, 0], [0, 6], [6, 4], [8, 4], [4, 6], [8, 6]] as const);
      const flip = rng.chance(0.5) && dy > 0;
      const x0 = rng.int(0, GRID_W - dx);
      const y0 = rng.int(0, GRID_H - dy);
      const A = { label: 'A', x: x0, y: flip ? y0 + dy : y0 };
      const B = { label: 'B', x: x0 + dx, y: flip ? y0 : y0 + dy };
      return {
        ...base,
        kind,
        prompt: 'Chạm vào trung điểm M của đoạn thẳng AB.',
        labels: ['M'],
        given: { points: [A, B], segments: [['A', 'B']] },
        connect: 'none',
        skillId: 'trung-diem',
      };
    }
    case 'hcn': {
      const a = rng.int(4, 7);
      const b = rng.int(2, 4);
      return { ...base, kind, a, b, prompt: `Vẽ hình chữ nhật ABCD có chiều dài ${a} ô, chiều rộng ${b} ô. Chạm lần lượt 4 đỉnh.`, labels: ['A', 'B', 'C', 'D'], connect: 'polygon', skillId: 'hinh-phang' };
    }
    case 'hinh-vuong': {
      const a = rng.int(2, 5);
      return { ...base, kind, a, b: a, prompt: `Vẽ hình vuông MNPQ có cạnh ${a} ô. Chạm lần lượt 4 đỉnh.`, labels: ['M', 'N', 'P', 'Q'], connect: 'polygon', skillId: 'hinh-phang' };
    }
    case 'goc-vuong': {
      const v = rng.pick([{ x: 4, y: 0 }, { x: -4, y: 0 }, { x: 0, y: 3 }, { x: 0, y: -3 }, { x: 3, y: 3 }, { x: -3, y: 3 }, { x: 3, y: -3 }]);
      const O = { label: 'O', x: 6, y: 4 };
      const A = { label: 'A', x: O.x + v.x, y: O.y + v.y };
      return {
        ...base,
        kind,
        prompt: 'Vẽ góc vuông đỉnh O, một cạnh là OA: chạm vào điểm B sao cho góc AOB là góc vuông.',
        labels: ['B'],
        given: { points: [O, A], segments: [['O', 'A']] },
        connect: 'rays',
        skillId: 'goc-vuong',
      };
    }
    case 'gap-khuc': {
      const total = rng.int(8, 13);
      const A = { label: 'A', x: rng.int(1, 3), y: rng.int(5, 7) };
      return {
        ...base,
        kind,
        a: total,
        prompt: `Vẽ đường gấp khúc ABCD gồm 3 đoạn thẳng đi theo đường kẻ ô, dài tất cả ${total} ô.`,
        labels: ['B', 'C', 'D'],
        given: { points: [A], segments: [] },
        connect: 'polyline',
        skillId: 'do-luong',
      };
    }
    case 'ban-kinh':
    case 'duong-kinh': {
      const r = rng.pick([3, 4]);
      const O = { label: 'O', x: 6, y: 4 };
      return {
        ...base,
        kind,
        a: r,
        prompt:
          kind === 'ban-kinh'
            ? `Hình tròn tâm O có bán kính ${r} ô. Vẽ một bán kính OA: chạm vào điểm A.`
            : `Hình tròn tâm O có bán kính ${r} ô. Vẽ một đường kính CD: chạm vào hai điểm C và D.`,
        labels: kind === 'ban-kinh' ? ['A'] : ['C', 'D'],
        given: { points: [O], segments: [], circle: { center: O, r } },
        connect: kind === 'ban-kinh' ? 'rays' : 'polygon',
        skillId: 'hinh-tron',
      };
    }
  }
}

/** Một lượt vẽ: 6 bài khác dạng, theo thứ tự ngẫu nhiên. */
export function geoRound(seed: number, count = 6): GeoTask[] {
  const rng = createRng(seed);
  return rng
    .shuffle(GEO_KINDS)
    .slice(0, count)
    .map((k) => makeGeoTask(k, rng));
}

const point = (task: GeoTask, label: string) => task.given.points.find((p) => p.label === label)!;

/** Kiểm tra hình 4 đỉnh (theo thứ tự chạm) có là hình chữ nhật cạnh a, b không. */
function checkQuad(task: GeoTask, pts: Pt[], square: boolean): CheckResult {
  if (new Set(pts.map((p) => `${p.x},${p.y}`)).size < 4) return { ok: false, message: 'Bốn đỉnh phải là bốn điểm khác nhau nhé.' };
  const v = [sub(pts[1], pts[0]), sub(pts[2], pts[1]), sub(pts[3], pts[2]), sub(pts[0], pts[3])];
  const right = dot(v[0], v[1]) === 0 && dot(v[1], v[2]) === 0 && dot(v[2], v[3]) === 0 && dot(v[3], v[0]) === 0;
  if (!right) return { ok: false, message: `Bốn góc của ${square ? 'hình vuông' : 'hình chữ nhật'} đều là góc vuông. Chạm lần lượt các đỉnh đi vòng quanh hình nhé.` };
  const [s1, s2] = [len2(v[0]), len2(v[1])];
  const want = [task.a * task.a, task.b * task.b];
  if (square) {
    if (s1 !== s2) return { ok: false, message: `Hình vuông có bốn cạnh dài bằng nhau. Hình của con có cạnh ${say(s1)} ô và ${say(s2)} ô.` };
    if (s1 !== want[0]) return { ok: false, message: `Mỗi cạnh của con dài ${say(s1)} ô, cần dài ${task.a} ô.` };
    return { ok: true, message: `Đúng rồi! Hình vuông cạnh ${task.a} ô.` };
  }
  const got = [Math.max(s1, s2), Math.min(s1, s2)];
  if (got[0] !== want[0] || got[1] !== want[1]) {
    return { ok: false, message: `Hình của con dài ${say(got[0])} ô, rộng ${say(got[1])} ô. Cần dài ${task.a} ô, rộng ${task.b} ô.` };
  }
  return { ok: true, message: `Đúng rồi! Hình chữ nhật dài ${task.a} ô, rộng ${task.b} ô.` };
}

/** Chấm bài vẽ. `pts` là các điểm bé chạm (đúng số lượng labels). */
export function checkGeo(task: GeoTask, pts: Pt[]): CheckResult {
  switch (task.kind) {
    case 'trung-diem': {
      const [A, B] = [point(task, 'A'), point(task, 'B')];
      const M = pts[0];
      const ab = sub(B, A);
      const am = sub(M, A);
      const onLine = ab.x * am.y - ab.y * am.x === 0 && dot(am, ab) >= 0 && len2(am) <= len2(ab);
      if (!onLine) return { ok: false, message: 'Trung điểm phải nằm trên đoạn thẳng AB.' };
      if (len2(am) * 4 !== len2(ab)) return { ok: false, message: `M nằm trên AB nhưng chưa ở giữa: M gần ${len2(am) * 4 < len2(ab) ? 'A' : 'B'} hơn. Đếm số ô ở hai bên nhé.` };
      return { ok: true, message: 'Đúng rồi! M chia AB thành hai phần dài bằng nhau.' };
    }
    case 'hcn':
      return checkQuad(task, pts, false);
    case 'hinh-vuong':
      return checkQuad(task, pts, true);
    case 'goc-vuong': {
      const [O, A] = [point(task, 'O'), point(task, 'A')];
      const B = pts[0];
      if (same(B, O)) return { ok: false, message: 'B phải khác điểm O nhé.' };
      if (dot(sub(A, O), sub(B, O)) !== 0) return { ok: false, message: 'Góc AOB chưa phải góc vuông. Đặt ê ke: một cạnh theo OA, cạnh kia là OB.' };
      return { ok: true, message: 'Đúng rồi! Góc AOB là góc vuông.' };
    }
    case 'gap-khuc': {
      const all = [point(task, 'A'), ...pts];
      const segs = [sub(all[1], all[0]), sub(all[2], all[1]), sub(all[3], all[2])];
      if (segs.some((s) => (s.x !== 0 && s.y !== 0) || (s.x === 0 && s.y === 0))) return { ok: false, message: 'Mỗi đoạn thẳng phải đi theo đường kẻ ô (nằm ngang hoặc thẳng đứng).' };
      if (segs.some((s, i) => i > 0 && (s.x === 0) === (segs[i - 1].x === 0))) return { ok: false, message: 'Hai đoạn liền nhau phải gấp khúc (một đoạn ngang, một đoạn dọc).' };
      const total = segs.reduce((t, s) => t + Math.abs(s.x) + Math.abs(s.y), 0);
      if (total !== task.a) return { ok: false, message: `Đường gấp khúc của con dài ${total} ô, cần dài ${task.a} ô.` };
      return { ok: true, message: `Đúng rồi! ${segs.map((s) => Math.abs(s.x) + Math.abs(s.y)).join(' + ')} = ${task.a} (ô).` };
    }
    case 'ban-kinh':
    case 'duong-kinh': {
      const { center: O, r } = task.given.circle!;
      const off = pts.find((p) => len2(sub(p, O)) !== r * r);
      if (off) return { ok: false, message: `Điểm phải nằm trên đường tròn, tức là cách tâm O đúng ${r} ô.` };
      if (task.kind === 'ban-kinh') return { ok: true, message: `Đúng rồi! OA là bán kính, dài ${r} ô.` };
      const [C, D] = pts;
      if (C.x + D.x !== 2 * O.x || C.y + D.y !== 2 * O.y) return { ok: false, message: 'Đường kính phải đi qua tâm O. Chọn hai điểm đối diện nhau qua tâm nhé.' };
      return { ok: true, message: `Đúng rồi! CD đi qua tâm O, dài ${2 * r} ô.` };
    }
  }
}

/** Một cách vẽ đúng — để test và để chỉ cho bé xem khi cần. */
export function sampleSolution(task: GeoTask): Pt[] {
  switch (task.kind) {
    case 'trung-diem': {
      const [A, B] = [point(task, 'A'), point(task, 'B')];
      return [{ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }];
    }
    case 'hcn':
    case 'hinh-vuong': {
      const x = Math.floor((GRID_W - task.a) / 2);
      const y = Math.floor((GRID_H - task.b) / 2);
      return [
        { x, y },
        { x: x + task.a, y },
        { x: x + task.a, y: y + task.b },
        { x, y: y + task.b },
      ];
    }
    case 'goc-vuong': {
      // Hướng vuông góc với OA, rút gọn về bước nhỏ nhất trên lưới rồi đi 2–3 bước
      const [O, A] = [point(task, 'O'), point(task, 'A')];
      const v = sub(A, O);
      const g = gcd(Math.abs(v.x), Math.abs(v.y));
      const step = { x: -v.y / g, y: v.x / g };
      for (const m of [3, 2, 1, -3, -2, -1]) {
        const B = { x: O.x + step.x * m, y: O.y + step.y * m };
        if (B.x >= 0 && B.x <= GRID_W && B.y >= 0 && B.y <= GRID_H) return [B];
      }
      throw new Error('không tìm được điểm B');
    }
    case 'gap-khuc': {
      const A = point(task, 'A');
      // Đi lên càng nhiều càng tốt để phần nằm ngang không vượt ra ngoài lưới
      const up = Math.min(A.y, task.a - 2);
      const right1 = Math.ceil((task.a - up) / 2);
      const right2 = task.a - up - right1;
      const B = { x: A.x + right1, y: A.y };
      const C = { x: B.x, y: B.y - up };
      return [B, C, { x: C.x + right2, y: C.y }];
    }
    case 'ban-kinh': {
      const { center: O, r } = task.given.circle!;
      return [{ x: O.x + r, y: O.y }];
    }
    case 'duong-kinh': {
      const { center: O, r } = task.given.circle!;
      return [
        { x: O.x, y: O.y - r },
        { x: O.x, y: O.y + r },
      ];
    }
  }
}
