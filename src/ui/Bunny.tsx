import type { Slot } from '../engine/progress/db';
import { ITEM_BY_ID } from '../features/wardrobe/items';

export type Mood = 'happy' | 'think' | 'cheer';

const LINE = '#4a3b5c';

/** Thỏ Rốt — linh vật của trang. Có thể mặc đồ mua ở tủ đồ. */
export function Bunny({
  mood = 'happy',
  equipped = {},
  className,
  title = 'Thỏ Rốt',
}: {
  mood?: Mood;
  equipped?: Partial<Record<Slot, string>>;
  className?: string;
  title?: string;
}) {
  const art = (slot: Slot) => (equipped[slot] ? ITEM_BY_ID.get(equipped[slot])?.art : null);
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={title}>
      <g stroke={LINE} strokeWidth={4} strokeLinejoin="round">
        {/* tai */}
        <g transform="rotate(-12 74 52)">
          <ellipse cx={74} cy={52} rx={18} ry={44} fill="#fff" />
          <ellipse cx={74} cy={56} rx={8} ry={30} fill="#ffc2dc" stroke="none" />
        </g>
        <g transform="rotate(12 126 52)">
          <ellipse cx={126} cy={52} rx={18} ry={44} fill="#fff" />
          <ellipse cx={126} cy={56} rx={8} ry={30} fill="#ffc2dc" stroke="none" />
        </g>
        {/* đuôi, thân, chân */}
        <circle cx={142} cy={206} r={11} fill="#fff" />
        <ellipse cx={100} cy={192} rx={42} ry={38} fill="#fff" />
        <ellipse cx={80} cy={226} rx={16} ry={9} fill="#fff" />
        <ellipse cx={120} cy={226} rx={16} ry={9} fill="#fff" />
      </g>
      {art('than')}
      <g stroke={LINE} strokeWidth={4}>
        {/* tay */}
        <ellipse cx={62} cy={182} rx={10} ry={17} fill="#fff" transform="rotate(20 62 182)" />
        <ellipse cx={138} cy={182} rx={10} ry={17} fill="#fff" transform="rotate(-20 138 182)" />
        {/* đầu */}
        <circle cx={100} cy={104} r={52} fill="#fff" />
      </g>
      {/* má hồng */}
      <ellipse cx={70} cy={120} rx={10} ry={6} fill="#ffb3d1" opacity={0.85} />
      <ellipse cx={130} cy={120} rx={10} ry={6} fill="#ffb3d1" opacity={0.85} />
      {/* mắt */}
      {mood === 'cheer' ? (
        <g stroke={LINE} strokeWidth={4} fill="none" strokeLinecap="round">
          <path d="M74 103 Q82 92 90 103" />
          <path d="M110 103 Q118 92 126 103" />
        </g>
      ) : (
        <g fill={LINE}>
          <circle cx={82} cy={mood === 'think' ? 97 : 100} r={7} />
          <circle cx={118} cy={mood === 'think' ? 97 : 100} r={7} />
          <circle cx={84.5} cy={mood === 'think' ? 94 : 97} r={2.5} fill="#fff" />
          <circle cx={120.5} cy={mood === 'think' ? 94 : 97} r={2.5} fill="#fff" />
        </g>
      )}
      {/* mũi, miệng */}
      <ellipse cx={100} cy={115} rx={6} ry={4.5} fill="#ff7eb6" />
      {mood === 'cheer' ? (
        <path d="M89 123 Q100 140 111 123 Z" fill="#ff8fab" stroke={LINE} strokeWidth={3} strokeLinejoin="round" />
      ) : mood === 'think' ? (
        <circle cx={100} cy={128} r={4} fill="none" stroke={LINE} strokeWidth={3} />
      ) : (
        <path d="M90 123 Q95 129 100 123 Q105 129 110 123" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
      )}
      {art('mat')}
      {art('co')}
      {art('dau')}
      {art('tay')}
    </svg>
  );
}
