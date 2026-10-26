// Tranh tô màu dạng SVG theo vùng (skill to-mau-va-ve): mỗi vùng là một path khép kín có id riêng.

export type ColorKey = 'hong' | 'tim' | 'vang' | 'xanh' | 'cam';

export const COLORS: Record<ColorKey, { hex: string; name: string }> = {
  hong: { hex: '#ff8fb8', name: 'hồng' },
  tim: { hex: '#b79cff', name: 'tím' },
  vang: { hex: '#ffd84d', name: 'vàng' },
  xanh: { hex: '#7fd6c2', name: 'xanh bạc hà' },
  cam: { hex: '#ffad5a', name: 'cam' },
};

export interface Region {
  id: string;
  d: string;
  color: ColorKey;
}

export interface Picture {
  id: string;
  name: string;
  emoji: string;
  regions: Region[];
  /** Nét trang trí vẽ đè lên trên (không tô). */
  decor: string[];
}

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + s} C${cx - 1.6 * s} ${cy} ${cx - 1.2 * s} ${cy - 1.3 * s} ${cx} ${cy - 0.5 * s} C${cx + 1.2 * s} ${cy - 1.3 * s} ${cx + 1.6 * s} ${cy} ${cx} ${cy + s} Z`;
const flame = (cx: number, bottom: number) => `M${cx} ${bottom} Q${cx - 11} ${bottom - 13} ${cx} ${bottom - 28} Q${cx + 11} ${bottom - 13} ${cx} ${bottom} Z`;

/** Lớp kem chảy trên đỉnh một tầng bánh (từ x đến x + w, đỉnh y). */
function drip(x: number, y: number, w: number, depth: number, bumps: number) {
  const step = w / bumps;
  let d = `M${x} ${y + 10} Q${x} ${y} ${x + 10} ${y} H${x + w - 10} Q${x + w} ${y} ${x + w} ${y + 10} V${y + depth - 6}`;
  for (let i = bumps; i > 0; i--) {
    const x1 = x + i * step;
    const x0 = x1 - step;
    d += ` Q${x1 - step / 2} ${y + depth + 10} ${x0} ${y + depth - 6}`;
  }
  return `${d} Z`;
}

export const PICTURES: Picture[] = [
  {
    id: 'banh-kem',
    name: 'Bánh kem sinh nhật',
    emoji: '🎂',
    regions: [
      { id: 'dia', d: ellipse(150, 266, 125, 18), color: 'xanh' },
      { id: 'tang-duoi', d: rrect(52, 186, 196, 80, 14), color: 'hong' },
      { id: 'kem-duoi', d: drip(52, 186, 196, 24, 7), color: 'vang' },
      { id: 'tang-tren', d: rrect(88, 124, 124, 64, 12), color: 'tim' },
      { id: 'kem-tren', d: drip(88, 124, 124, 20, 5), color: 'hong' },
      { id: 'tim-banh', d: heart(150, 160, 13), color: 'cam' },
      { id: 'keo-1', d: circle(92, 240, 12), color: 'vang' },
      { id: 'keo-2', d: circle(150, 244, 12), color: 'xanh' },
      { id: 'keo-3', d: circle(208, 240, 12), color: 'vang' },
      { id: 'nen-1', d: rrect(110, 84, 16, 40, 5), color: 'xanh' },
      { id: 'nen-2', d: rrect(142, 76, 16, 48, 5), color: 'tim' },
      { id: 'nen-3', d: rrect(174, 84, 16, 40, 5), color: 'xanh' },
      { id: 'lua-1', d: flame(118, 80), color: 'cam' },
      { id: 'lua-2', d: flame(150, 72), color: 'cam' },
      { id: 'lua-3', d: flame(182, 80), color: 'cam' },
    ],
    decor: ['M118 52 v-6 M150 44 v-6 M182 52 v-6'],
  },
  {
    id: 'vay-cong-chua',
    name: 'Váy công chúa',
    emoji: '👗',
    regions: [
      { id: 'moc', d: 'M140 34 Q140 14 152 14 Q164 14 162 26 L156 34 Z', color: 'vang' },
      { id: 'tay-trai', d: ellipse(104, 70, 22, 18), color: 'hong' },
      { id: 'tay-phai', d: ellipse(196, 70, 22, 18), color: 'hong' },
      { id: 'than-ao', d: 'M118 52 L182 52 L190 134 L110 134 Z', color: 'tim' },
      { id: 'co-ao', d: 'M128 52 Q150 78 172 52 Z', color: 'vang' },
      { id: 'hat-1', d: circle(150, 98, 8), color: 'cam' },
      { id: 'hat-2', d: circle(150, 118, 7), color: 'xanh' },
      { id: 'vay-1', d: 'M108 140 L192 140 L218 200 Q150 216 82 200 Z', color: 'xanh' },
      { id: 'vay-2', d: 'M84 196 Q150 212 216 196 L240 246 Q150 266 60 246 Z', color: 'hong' },
      { id: 'vay-3', d: 'M60 242 Q150 262 240 242 L250 266 Q234 280 217 269 Q200 282 183 270 Q167 283 150 271 Q133 283 117 270 Q100 282 83 269 Q66 280 50 266 Z', color: 'tim' },
      { id: 'dai', d: rrect(104, 128, 92, 18, 7), color: 'vang' },
      { id: 'no-trai', d: 'M150 137 L120 122 Q112 137 120 152 Z', color: 'hong' },
      { id: 'no-phai', d: 'M150 137 L180 122 Q188 137 180 152 Z', color: 'hong' },
      { id: 'no-giua', d: circle(150, 137, 8), color: 'cam' },
    ],
    decor: ['M152 34 L96 52 M152 34 L204 52'],
  },
  {
    id: 'kem-oc-que',
    name: 'Kem ốc quế',
    emoji: '🍦',
    regions: [
      { id: 'oc-que', d: 'M104 178 L196 178 L150 290 Z', color: 'cam' },
      { id: 'kem-duoi', d: circle(150, 150, 52), color: 'hong' },
      { id: 'que-banh', d: 'M196 112 L236 70 L246 80 L206 122 Z', color: 'cam' },
      { id: 'kem-giua', d: circle(150, 100, 44), color: 'xanh' },
      { id: 'kem-tren', d: circle(150, 60, 34), color: 'tim' },
      { id: 'vien-oc', d: rrect(96, 168, 108, 22, 9), color: 'vang' },
      { id: 'anh-dao', d: circle(150, 22, 13), color: 'hong' },
      { id: 'tim-1', d: heart(124, 150, 10), color: 'vang' },
      { id: 'tim-2', d: heart(176, 150, 10), color: 'vang' },
      { id: 'tim-3', d: heart(150, 100, 10), color: 'hong' },
    ],
    decor: ['M120 202 L172 214 M126 222 L166 232 M134 244 L160 250 M150 9 Q158 0 168 4', 'M131 200 L150 278 M169 200 L150 278'],
  },
];

export const PICTURE_BY_ID = new Map(PICTURES.map((p) => [p.id, p]));
