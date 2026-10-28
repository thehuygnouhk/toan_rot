import type { ReactNode } from 'react';
import type { Slot } from '../../engine/progress/db';
import type { AchievementId } from '../../engine/progress/rewards';

export interface WardrobeItem {
  id: string;
  slot: Slot;
  name: string;
  /** Giá bằng cà rốt. Đồ đặc biệt không bán (giá 0, có `unlock`). */
  price: number;
  /** Màu mặc định; món nào có màu thì bé tự đổi màu được. */
  color?: string;
  /** Đồ đặc biệt: chỉ nhận được khi đạt thành tích này. */
  unlock?: AchievementId;
  /** Hình SVG vẽ trên khung 200×240 của Thỏ Rốt, theo màu bé chọn. */
  art: (color: string) => ReactNode;
}

export const SLOT_NAMES: Record<Slot, string> = {
  dau: 'Trên đầu',
  mat: 'Kính',
  co: 'Cổ',
  than: 'Váy áo',
  chan: 'Giày',
  tay: 'Cầm tay',
  lung: 'Sau lưng',
  nen: 'Phông nền',
};

/** Bảng màu bé chọn để đổi màu đồ. */
export const PALETTE = ['#ff7eb6', '#ffb3d1', '#b388ff', '#cdb4ff', '#7fd6c2', '#9ad0ff', '#ffd84d', '#ffad5a', '#ff6b6b', '#ffffff'];

const LINE = '#4a3b5c';

const bow = (fill: string, x: number, y: number) => (
  <g transform={`translate(${x} ${y}) rotate(15)`} stroke={LINE} strokeWidth={3} strokeLinejoin="round">
    <path d="M0 0 L-22 -13 Q-27 0 -22 13 Z" fill={fill} />
    <path d="M0 0 L22 -13 Q27 0 22 13 Z" fill={fill} />
    <circle r={6} fill={fill} />
  </g>
);

const dress = (fill: string, trim: string, extra?: ReactNode) => (
  <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
    <path d="M76 152 Q100 145 124 152 L148 214 Q100 232 52 214 Z" fill={fill} />
    {extra}
    <path d="M70 176 Q100 184 130 176" fill="none" stroke={trim} strokeWidth={7} />
    <path d="M52 214 Q58 222 66 219 Q74 227 82 222 Q90 230 100 224 Q110 230 118 222 Q126 227 134 219 Q142 222 148 214" fill="none" stroke={trim} strokeWidth={4} />
  </g>
);

const star = (x: number, y: number, r: number, fill: string) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} />;
};

const shoe = (x: number, fill: string, strap: boolean) => (
  <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
    <path d={`M${x - 18} 228 Q${x - 18} 216 ${x} 216 Q${x + 18} 216 ${x + 18} 228 Q${x} 238 ${x - 18} 228 Z`} fill={fill} />
    {strap && <path d={`M${x - 12} 220 L${x + 12} 220`} />}
  </g>
);

export const ITEMS: WardrobeItem[] = [
  // Trên đầu
  { id: 'no-hong', slot: 'dau', name: 'Nơ xinh', price: 15, color: '#ff7eb6', art: (c) => bow(c, 124, 60) },
  { id: 'no-tim', slot: 'dau', name: 'Nơ tím', price: 15, color: '#b388ff', art: (c) => bow(c, 124, 60) },
  {
    id: 'mu-noi',
    slot: 'dau',
    name: 'Mũ nồi',
    price: 30,
    color: '#ff8fab',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <ellipse cx={108} cy={60} rx={44} ry={15} fill={c} transform="rotate(-8 108 60)" />
        <path d="M104 46 Q106 38 112 40" fill="none" />
      </g>
    ),
  },
  {
    id: 'vuong-mien',
    slot: 'dau',
    name: 'Vương miện',
    price: 45,
    art: () => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M74 66 L78 38 L90 54 L100 32 L110 54 L122 38 L126 66 Z" fill="#ffd84d" />
        <circle cx={100} cy={52} r={4} fill="#ff7eb6" />
        <circle cx={84} cy={58} r={3} fill="#7fd6c2" />
        <circle cx={116} cy={58} r={3} fill="#7fd6c2" />
      </g>
    ),
  },
  {
    id: 'vong-hoa',
    slot: 'dau',
    name: 'Vòng hoa',
    price: 30,
    art: () => (
      <g stroke={LINE} strokeWidth={2}>
        {[
          [62, 78, '#ff7eb6'],
          [78, 62, '#ffe08a'],
          [100, 56, '#cdb4ff'],
          [122, 62, '#7fd6c2'],
          [138, 78, '#ff7eb6'],
        ].map(([x, y, c]) => (
          <g key={`${x}`} transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-7} rx={5} ry={7} fill={c as string} transform={`rotate(${a})`} />
            ))}
            <circle r={4} fill="#ffd84d" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'vuong-mien-vang',
    slot: 'dau',
    name: 'Vương miện nhà vô địch',
    price: 0,
    unlock: 'exam-3',
    art: () => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M68 68 L72 30 L86 50 L100 22 L114 50 L128 30 L132 68 Z" fill="#ffd84d" />
        <path d="M70 60 L130 60" stroke="#ffad5a" strokeWidth={5} />
        <circle cx={100} cy={44} r={6} fill="#ff4f7b" />
        <circle cx={80} cy={52} r={4} fill="#9ad0ff" />
        <circle cx={120} cy={52} r={4} fill="#9ad0ff" />
        {star(100, 14, 8, '#fff6b3')}
      </g>
    ),
  },
  // Kính
  {
    id: 'kinh-tim',
    slot: 'mat',
    name: 'Kính trái tim',
    price: 25,
    color: '#ff7eb6',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} fill={c} fillOpacity={0.55}>
        <path d="M82 112 C66 100 68 86 82 92 C96 86 98 100 82 112 Z" />
        <path d="M118 112 C102 100 104 86 118 92 C132 86 134 100 118 112 Z" />
        <path d="M94 96 Q100 92 106 96" fill="none" />
      </g>
    ),
  },
  {
    id: 'kinh-tron',
    slot: 'mat',
    name: 'Kính tròn',
    price: 20,
    color: '#9ad0ff',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} fill={c} fillOpacity={0.35}>
        <circle cx={82} cy={100} r={13} />
        <circle cx={118} cy={100} r={13} />
        <path d="M95 99 Q100 95 105 99" fill="none" />
      </g>
    ),
  },
  // Cổ
  {
    id: 'vong-ngoc',
    slot: 'co',
    name: 'Vòng ngọc trai',
    price: 30,
    art: () => (
      <g stroke={LINE} strokeWidth={1.5} fill="#fffaf0">
        {[76, 84, 92, 100, 108, 116, 124].map((x, i) => (
          <circle key={x} cx={x} cy={152 + [0, 4, 6.5, 7.5, 6.5, 4, 0][i]} r={4.5} />
        ))}
      </g>
    ),
  },
  {
    id: 'khan-quang',
    slot: 'co',
    name: 'Khăn quàng',
    price: 25,
    color: '#cdb4ff',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round" fill={c}>
        <path d="M70 148 Q100 164 130 148 L132 158 Q100 176 68 158 Z" />
        <path d="M112 160 L118 192 L106 190 L104 164 Z" />
      </g>
    ),
  },
  // Váy áo
  { id: 'vay-hong', slot: 'than', name: 'Váy xoè', price: 35, color: '#ffb3d1', art: (c) => dress(c, '#ffffff') },
  {
    id: 'vay-cham-bi',
    slot: 'than',
    name: 'Váy chấm bi',
    price: 35,
    color: '#7fd6c2',
    art: (c) =>
      dress(
        c,
        '#ffffff',
        <g fill="#ffffff" stroke="none">
          {[
            [80, 196],
            [100, 204],
            [120, 196],
            [90, 214],
            [112, 216],
            [70, 210],
            [130, 210],
            [100, 186],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={4} />
          ))}
        </g>,
      ),
  },
  {
    id: 'vay-cong-chua',
    slot: 'than',
    name: 'Váy công chúa',
    price: 60,
    color: '#b388ff',
    art: (c) => dress(c, '#ffd84d', <path d="M60 200 Q100 214 140 200" fill="none" stroke="#ffd84d" strokeWidth={4} />),
  },
  {
    id: 'vay-cau-vong',
    slot: 'than',
    name: 'Váy cầu vồng',
    price: 50,
    art: () =>
      dress(
        '#ffffff',
        '#ff7eb6',
        <g fill="none" strokeWidth={8} strokeLinecap="round">
          <path d="M70 168 Q100 174 130 168" stroke="#ff6b6b" />
          <path d="M66 180 Q100 188 134 180" stroke="#ffad5a" />
          <path d="M62 192 Q100 200 138 192" stroke="#ffd84d" />
          <path d="M58 203 Q100 212 142 203" stroke="#7fd6c2" />
          <path d="M55 212 Q100 222 145 212" stroke="#9ad0ff" />
        </g>,
      ),
  },
  {
    id: 'yem-dau',
    slot: 'than',
    name: 'Yếm dâu tây',
    price: 30,
    art: () => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M80 160 L120 160 L124 200 Q124 222 100 224 Q76 222 76 200 Z" fill="#ff8fab" />
        <path d="M82 160 L76 150 M118 160 L124 150" />
        <path d="M100 184 C92 184 90 194 100 204 C110 194 108 184 100 184 Z" fill="#ff4f7b" />
        <path d="M96 183 L100 178 L104 183" fill="#7fd6c2" />
      </g>
    ),
  },
  {
    id: 'vay-ngoi-sao',
    slot: 'than',
    name: 'Váy ngôi sao',
    price: 0,
    unlock: 'stars-3',
    art: () =>
      dress(
        '#9ad0ff',
        '#ffd84d',
        <g stroke="none">
          {star(80, 196, 7, '#ffd84d')}
          {star(118, 204, 8, '#fff6b3')}
          {star(98, 214, 6, '#ffd84d')}
          {star(102, 188, 5, '#ffffff')}
          {star(132, 214, 5, '#ffffff')}
          {star(66, 212, 5, '#fff6b3')}
        </g>,
      ),
  },
  {
    id: 'vay-da-hoi',
    slot: 'than',
    name: 'Váy dạ hội',
    price: 0,
    unlock: 'show-1',
    art: () => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M76 150 Q100 143 124 150 L156 232 Q100 246 44 232 Z" fill="#ff8fb8" />
        <path d="M66 182 Q100 192 134 182" fill="none" stroke="#ffd84d" strokeWidth={6} />
        <g stroke="none">
          {star(84, 210, 5, '#fff6b3')}
          {star(116, 220, 6, '#ffffff')}
          {star(100, 200, 4, '#ffffff')}
          {star(132, 206, 4, '#fff6b3')}
          {star(70, 226, 4, '#ffffff')}
        </g>
      </g>
    ),
  },
  // Giày
  { id: 'giay-bup-be', slot: 'chan', name: 'Giày búp bê', price: 20, color: '#ff7eb6', art: (c) => <>{shoe(80, c, true)}{shoe(120, c, true)}</> },
  {
    id: 'ung-mua',
    slot: 'chan',
    name: 'Ủng đi mưa',
    price: 25,
    color: '#ffd84d',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round" fill={c}>
        <path d="M66 208 L94 208 L96 232 Q80 238 64 232 Z" />
        <path d="M106 208 L134 208 L136 232 Q120 238 104 232 Z" />
        <path d="M66 214 L94 214 M106 214 L134 214" stroke="#ffffff" strokeWidth={3} />
      </g>
    ),
  },
  // Cầm tay
  {
    id: 'dua-phep',
    slot: 'tay',
    name: 'Đũa phép',
    price: 25,
    art: () => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M144 186 L166 146" />
        <path d="M168 128 L172 140 L184 141 L175 149 L178 161 L168 154 L158 161 L161 149 L152 141 L164 140 Z" fill="#ffd84d" />
      </g>
    ),
  },
  {
    id: 'bong-bay',
    slot: 'tay',
    name: 'Bóng bay trái tim',
    price: 20,
    color: '#ff7eb6',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M144 184 Q158 140 168 106" fill="none" strokeWidth={2} />
        <path d="M168 106 C140 86 146 58 166 66 C186 58 194 86 168 106 Z" fill={c} />
      </g>
    ),
  },
  {
    id: 'tui-xach',
    slot: 'tay',
    name: 'Túi xách xinh',
    price: 30,
    color: '#ffe08a',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M142 196 Q152 176 162 196" fill="none" />
        <rect x={136} y={194} width={32} height={24} rx={7} fill={c} />
        <circle cx={152} cy={206} r={4} fill="#ff7eb6" />
      </g>
    ),
  },
  {
    id: 'o-hoa',
    slot: 'tay',
    name: 'Ô hoa',
    price: 30,
    color: '#cdb4ff',
    art: (c) => (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M146 190 L164 96" fill="none" />
        <path d="M126 100 Q164 52 202 100 Q192 92 183 100 Q173 92 164 100 Q155 92 145 100 Q136 92 126 100 Z" fill={c} />
        <circle cx={150} cy={86} r={4} fill="#ffffff" stroke="none" />
        <circle cx={172} cy={80} r={4} fill="#ffffff" stroke="none" />
      </g>
    ),
  },
  // Sau lưng
  {
    id: 'ao-choang',
    slot: 'lung',
    name: 'Áo choàng',
    price: 40,
    color: '#b388ff',
    art: (c) => <path d="M64 146 Q100 136 136 146 L162 230 Q100 244 38 230 Z" fill={c} stroke={LINE} strokeWidth={3} strokeLinejoin="round" />,
  },
  {
    id: 'canh-tien',
    slot: 'lung',
    name: 'Cánh tiên',
    price: 0,
    unlock: 'art-3',
    art: () => (
      <g stroke={LINE} strokeWidth={3} fill="#cdb4ff" fillOpacity={0.75} strokeLinejoin="round">
        <path d="M86 170 C40 120 10 150 30 178 C40 194 70 190 86 176 Z" />
        <path d="M114 170 C160 120 190 150 170 178 C160 194 130 190 114 176 Z" />
        <path d="M86 182 C56 196 40 222 62 224 C78 226 88 206 88 188 Z" fill="#ffc2dc" />
        <path d="M114 182 C144 196 160 222 138 224 C122 226 112 206 112 188 Z" fill="#ffc2dc" />
      </g>
    ),
  },
  // Phông nền
  {
    id: 'nen-vuon-hoa',
    slot: 'nen',
    name: 'Vườn hoa',
    price: 30,
    art: () => (
      <g>
        <rect width={200} height={240} rx={24} fill="#e0f4ff" />
        <path d="M0 176 Q100 158 200 176 L200 216 Q200 240 176 240 L24 240 Q0 240 0 216 Z" fill="#c8f0c0" />
        <circle cx={168} cy={34} r={16} fill="#ffe08a" />
        {[
          [22, 196, '#ff7eb6'],
          [44, 216, '#ffd84d'],
          [160, 206, '#b388ff'],
          [182, 224, '#ff7eb6'],
          [30, 228, '#cdb4ff'],
        ].map(([x, y, c]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x as number} cy={y as number} r={6} fill={c as string} />
            <circle cx={x as number} cy={y as number} r={2.5} fill="#fff" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'nen-bau-troi',
    slot: 'nen',
    name: 'Bầu trời sao',
    price: 40,
    art: () => (
      <g>
        <rect width={200} height={240} rx={24} fill="#c9b8ff" />
        <circle cx={160} cy={40} r={18} fill="#fff6b3" />
        <circle cx={168} cy={34} r={16} fill="#c9b8ff" />
        {[
          [30, 30, 6],
          [60, 60, 4],
          [24, 110, 5],
          [178, 110, 4],
          [40, 180, 4],
          [176, 190, 6],
        ].map(([x, y, r]) => (
          <g key={`${x}-${y}`}>{star(x, y, r, '#ffffff')}</g>
        ))}
      </g>
    ),
  },
  {
    id: 'nen-san-khau',
    slot: 'nen',
    name: 'Sân khấu',
    price: 0,
    unlock: 'days-3',
    art: () => (
      <g>
        <rect width={200} height={240} rx={24} fill="#fff0f7" />
        <ellipse cx={100} cy={226} rx={80} ry={16} fill="#ffe08a" />
        <path d="M0 24 Q0 0 24 0 L52 0 Q40 120 58 240 L24 240 Q0 240 0 216 Z" fill="#ff7eb6" />
        <path d="M200 24 Q200 0 176 0 L148 0 Q160 120 142 240 L176 240 Q200 240 200 216 Z" fill="#ff7eb6" />
        <path d="M0 0 L200 0 L200 18 Q100 34 0 18 Z" fill="#f0569a" />
      </g>
    ),
  },
];

export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
