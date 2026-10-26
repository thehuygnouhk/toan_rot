import type { ReactNode } from 'react';
import type { Slot } from '../../engine/progress/db';

export interface WardrobeItem {
  id: string;
  slot: Slot;
  name: string;
  price: number;
  /** Hình SVG vẽ trên khung 200×240 của Thỏ Rốt. */
  art: ReactNode;
}

export const SLOT_NAMES: Record<Slot, string> = {
  dau: 'Trên đầu',
  mat: 'Kính',
  co: 'Cổ',
  than: 'Váy áo',
  tay: 'Cầm tay',
};

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
    <path d="M70 176 Q100 184 130 176" fill="none" stroke={trim} strokeWidth={7} />
    <path d="M52 214 Q58 222 66 219 Q74 227 82 222 Q90 230 100 224 Q110 230 118 222 Q126 227 134 219 Q142 222 148 214" fill="none" stroke={trim} strokeWidth={4} />
    {extra}
  </g>
);

export const ITEMS: WardrobeItem[] = [
  { id: 'no-hong', slot: 'dau', name: 'Nơ hồng', price: 15, art: bow('#ff7eb6', 124, 60) },
  { id: 'no-tim', slot: 'dau', name: 'Nơ tím', price: 15, art: bow('#b388ff', 124, 60) },
  {
    id: 'vuong-mien',
    slot: 'dau',
    name: 'Vương miện',
    price: 45,
    art: (
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
    art: (
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
    id: 'kinh-tim',
    slot: 'mat',
    name: 'Kính trái tim',
    price: 25,
    art: (
      <g stroke={LINE} strokeWidth={3} fill="#ff7eb6" fillOpacity={0.55}>
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
    art: (
      <g stroke={LINE} strokeWidth={3} fill="#9ad0ff" fillOpacity={0.35}>
        <circle cx={82} cy={100} r={13} />
        <circle cx={118} cy={100} r={13} />
        <path d="M95 99 Q100 95 105 99" fill="none" />
      </g>
    ),
  },
  {
    id: 'vong-ngoc',
    slot: 'co',
    name: 'Vòng ngọc trai',
    price: 30,
    art: (
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
    art: (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round" fill="#cdb4ff">
        <path d="M70 148 Q100 164 130 148 L132 158 Q100 176 68 158 Z" />
        <path d="M112 160 L118 192 L106 190 L104 164 Z" />
      </g>
    ),
  },
  { id: 'vay-hong', slot: 'than', name: 'Váy xoè hồng', price: 35, art: dress('#ffb3d1', '#ffffff') },
  {
    id: 'vay-cham-bi',
    slot: 'than',
    name: 'Váy chấm bi',
    price: 35,
    art: dress(
      '#7fd6c2',
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
    art: dress(
      '#b388ff',
      '#ffd84d',
      <path d="M60 200 Q100 214 140 200" fill="none" stroke="#ffd84d" strokeWidth={4} />,
    ),
  },
  {
    id: 'yem-dau',
    slot: 'than',
    name: 'Yếm dâu tây',
    price: 30,
    art: (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M80 160 L120 160 L124 200 Q124 222 100 224 Q76 222 76 200 Z" fill="#ff8fab" />
        <path d="M82 160 L76 150 M118 160 L124 150" />
        <path d="M100 184 C92 184 90 194 100 204 C110 194 108 184 100 184 Z" fill="#ff4f7b" />
        <path d="M96 183 L100 178 L104 183" fill="#7fd6c2" />
      </g>
    ),
  },
  {
    id: 'dua-phep',
    slot: 'tay',
    name: 'Đũa phép',
    price: 25,
    art: (
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
    art: (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M144 184 Q158 140 168 106" fill="none" strokeWidth={2} />
        <path d="M168 106 C140 86 146 58 166 66 C186 58 194 86 168 106 Z" fill="#ff7eb6" />
      </g>
    ),
  },
  {
    id: 'tui-xach',
    slot: 'tay',
    name: 'Túi xách xinh',
    price: 30,
    art: (
      <g stroke={LINE} strokeWidth={3} strokeLinejoin="round">
        <path d="M142 196 Q152 176 162 196" fill="none" />
        <rect x={136} y={194} width={32} height={24} rx={7} fill="#ffe08a" />
        <circle cx={152} cy={206} r={4} fill="#ff7eb6" />
      </g>
    ),
  },
];

export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
