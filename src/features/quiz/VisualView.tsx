import type { Visual } from '../../engine/questions';

const INK = '#4a3b5c';
const PINK = '#ff7eb6';
const SOFT = '#ffe9f3';

/** Vẽ hình minh hoạ của câu hỏi bằng SVG. */
export function VisualView({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case 'groups':
      return <Groups {...visual} />;
    case 'fraction':
      return <Fraction {...visual} />;
    case 'segment':
      return <Segment {...visual} />;
    case 'circle':
      return <CircleParts {...visual} />;
    case 'angle':
      return <Angle {...visual} />;
    case 'polygon':
      return <Polygon {...visual} />;
    case 'solid':
      return <Solid {...visual} />;
    case 'clock':
      return <Clock {...visual} />;
    case 'polyline':
      return <Polyline {...visual} />;
  }
}

function Groups({ emoji, groups, perGroup }: { emoji: string; groups: number; perGroup: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label={`${groups} nhóm, mỗi nhóm ${perGroup}`}>
      {Array.from({ length: groups }, (_, g) => (
        <div key={g} className="rounded-2xl border-2 border-dashed border-secondary bg-base-100 px-2 py-1 text-2xl leading-tight max-w-[7.5rem] text-center">
          {emoji.repeat(perGroup)}
        </div>
      ))}
    </div>
  );
}

function Fraction({ shape, parts, shaded }: { shape: 'bar' | 'circle'; parts: number; shaded: number }) {
  if (shape === 'circle') {
    const r = 80;
    const c = 100;
    const pt = (i: number) => {
      const a = (i / parts) * 2 * Math.PI - Math.PI / 2;
      return [c + r * Math.cos(a), c + r * Math.sin(a)];
    };
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
        {Array.from({ length: parts }, (_, i) => {
          const [x1, y1] = pt(i);
          const [x2, y2] = pt(i + 1);
          return (
            <path
              key={i}
              d={`M${c} ${c} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={i < shaded ? PINK : '#fff'}
              stroke={INK}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    );
  }
  const w = 300 / parts;
  return (
    <svg viewBox="0 0 320 90" className="w-full max-w-md mx-auto">
      {Array.from({ length: parts }, (_, i) => (
        <rect key={i} x={10 + i * w} y={15} width={w} height={60} fill={i < shaded ? PINK : '#fff'} stroke={INK} strokeWidth={3} />
      ))}
    </svg>
  );
}

function Segment({ length, points, showRuler }: { length: number; points: { label: string; at: number }[]; showRuler: boolean }) {
  const unit = Math.min(40, 360 / length);
  const x0 = 20;
  const y = 70;
  const width = x0 * 2 + unit * length;
  return (
    <svg viewBox={`0 0 ${width} 110`} className="w-full max-w-xl mx-auto">
      {showRuler &&
        Array.from({ length: length + 1 }, (_, i) => (
          <g key={i}>
            {i < length && <rect x={x0 + i * unit} y={y - unit / 2} width={unit} height={unit} fill={i % 2 ? SOFT : '#fff'} stroke="#ffd6e7" />}
          </g>
        ))}
      <line x1={x0} y1={y} x2={x0 + unit * length} y2={y} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={x0 + p.at * unit} cy={y} r={6} fill={p.label === 'A' || p.label === 'B' ? INK : PINK} stroke={INK} strokeWidth={2} />
          <text x={x0 + p.at * unit} y={y - unit / 2 - 10} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK} fontFamily="Nunito">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function CircleParts({ center, segments }: { center: string; segments: { label: string; from: string; to: string; type: 'radius' | 'diameter' | 'chord' }[] }) {
  const c = 130;
  const r = 90;
  // Góc đặt các điểm cố định để hình dễ nhìn
  const angles: Record<'radius' | 'diameter' | 'chord', number[]> = { radius: [-50], diameter: [200, 20], chord: [100, 160] };
  const pos = new Map<string, [number, number, number]>();
  pos.set(center, [c, c, -90]);
  for (const s of segments) {
    const [a1, a2] = angles[s.type];
    const at = (deg: number): [number, number, number] => [c + r * Math.cos((deg * Math.PI) / 180), c + r * Math.sin((deg * Math.PI) / 180), deg];
    if (s.type === 'radius') pos.set(s.to, at(a1));
    else {
      pos.set(s.from, at(a1));
      pos.set(s.to, at(a2));
    }
  }
  return (
    <svg viewBox="0 0 260 260" className="w-60 h-60 mx-auto">
      <circle cx={c} cy={c} r={r} fill={SOFT} stroke={INK} strokeWidth={4} />
      {segments.map((s) => {
        const [x1, y1] = pos.get(s.from)!;
        const [x2, y2] = pos.get(s.to)!;
        return <line key={s.label} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={3.5} />;
      })}
      {[...pos.entries()].map(([label, [x, y, deg]]) => {
        const isCenter = label === center;
        const lx = isCenter ? x - 14 : c + (r + 18) * Math.cos((deg * Math.PI) / 180);
        const ly = isCenter ? y - 10 : c + (r + 18) * Math.sin((deg * Math.PI) / 180) + 7;
        return (
          <g key={label}>
            <circle cx={x} cy={y} r={5} fill={isCenter ? PINK : INK} />
            <text x={lx} y={ly} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK} fontFamily="Nunito">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Angle({ degrees, rotation }: { degrees: number; rotation: number }) {
  const c = 110;
  const len = 95;
  const ray = (deg: number) => [c + len * Math.cos((deg * Math.PI) / 180), c - len * Math.sin((deg * Math.PI) / 180)];
  const [x1, y1] = ray(rotation);
  const [x2, y2] = ray(rotation + degrees);
  return (
    <svg viewBox="0 0 220 220" className="w-52 h-52 mx-auto">
      <path d={`M${x1} ${y1} L${c} ${c} L${x2} ${y2}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={c} cy={c} r={6} fill={PINK} />
    </svg>
  );
}

const SHAPES: Record<string, { pts: [number, number][]; right: number[] }> = {
  triangle: { pts: [[40, 170], [200, 170], [140, 40]], right: [] },
  'right-triangle': { pts: [[50, 170], [200, 170], [50, 50]], right: [0] },
  quadrilateral: { pts: [[40, 160], [210, 175], [185, 50], [75, 70]], right: [] },
  rectangle: { pts: [[30, 160], [220, 160], [220, 60], [30, 60]], right: [0, 1, 2, 3] },
  square: { pts: [[60, 170], [190, 170], [190, 40], [60, 40]], right: [0, 1, 2, 3] },
};

function Polygon({ shape }: { shape: keyof typeof SHAPES }) {
  const { pts, right } = SHAPES[shape];
  const marks = right.map((i) => {
    const p = pts[i];
    const a = pts[(i + 1) % pts.length];
    const b = pts[(i + pts.length - 1) % pts.length];
    const step = (q: [number, number]) => {
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const d = Math.hypot(dx, dy);
      return [(dx / d) * 16, (dy / d) * 16];
    };
    const [ax, ay] = step(a);
    const [bx, by] = step(b);
    return `M${p[0] + ax} ${p[1] + ay} L${p[0] + ax + bx} ${p[1] + ay + by} L${p[0] + bx} ${p[1] + by}`;
  });
  return (
    <svg viewBox="0 0 250 210" className="w-60 mx-auto">
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={SOFT} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {marks.map((d) => (
        <path key={d} d={d} fill="none" stroke={PINK} strokeWidth={3} />
      ))}
      {pts.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={INK} />
      ))}
    </svg>
  );
}

function Solid({ solid }: { solid: 'cube' | 'box' }) {
  const w = solid === 'cube' ? 100 : 150;
  const h = solid === 'cube' ? 100 : 75;
  const d = solid === 'cube' ? 45 : 40;
  const x = 40;
  const y = 70;
  const front = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
  const top = `${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}`;
  const side = `${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y + h - d} ${x + w},${y + h}`;
  return (
    <svg viewBox={`0 0 ${x * 2 + w + d} ${y + h + 20}`} className="w-60 mx-auto">
      <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
        <polygon points={front} fill="#ffd6e7" fillOpacity={0.6} />
        <polygon points={top} fill="#fff0f7" fillOpacity={0.6} />
        <polygon points={side} fill="#cdb4ff" fillOpacity={0.6} />
      </g>
      {/* cạnh khuất vẽ nét đứt (như SGK) */}
      <g stroke={INK} strokeWidth={2} strokeDasharray="6 6" fill="none">
        <line x1={x + d} y1={y - d} x2={x + d} y2={y + h - d} />
        <line x1={x} y1={y + h} x2={x + d} y2={y + h - d} />
        <line x1={x + d} y1={y + h - d} x2={x + w + d} y2={y + h - d} />
      </g>
    </svg>
  );
}

/** Đồng hồ kim như trong SGK: 12 số, vạch phút, kim ngắn chỉ giờ, kim dài chỉ phút. */
function Clock({ hour, minute }: { hour: number; minute: number }) {
  const c = 120;
  const r = 100;
  const at = (deg: number, len: number) => [c + len * Math.cos(((deg - 90) * Math.PI) / 180), c + len * Math.sin(((deg - 90) * Math.PI) / 180)];
  // Kim dừng trước vòng số để không che số
  const [hx, hy] = at(((hour % 12) + minute / 60) * 30, 42);
  const [mx, my] = at(minute * 6, 62);
  return (
    <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto">
      <circle cx={c} cy={c} r={r + 8} fill="#ffd6e7" />
      <circle cx={c} cy={c} r={r} fill="#fff" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const [x1, y1] = at(i * 6, r - (big ? 12 : 6));
        const [x2, y2] = at(i * 6, r - 2);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={big ? 3 : 1.5} strokeLinecap="round" />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = at((i + 1) * 30, r - 24);
        return (
          <text key={i} x={x} y={y + 8} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK} fontFamily="Nunito">
            {i + 1}
          </text>
        );
      })}
      <line x1={c} y1={c} x2={hx} y2={hy} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={c} y1={c} x2={mx} y2={my} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <circle cx={c} cy={c} r={8} fill={PINK} stroke={INK} strokeWidth={2} />
    </svg>
  );
}

/** Đường gấp khúc lên xuống xen kẽ, đỉnh đặt tên A, B, C…, mỗi đoạn ghi độ dài. */
function Polyline({ lengths, unit }: { lengths: number[]; unit: string }) {
  const total = lengths.reduce((s, x) => s + x, 0);
  const pts: [number, number][] = [[0, 0]];
  lengths.forEach((len, i) => {
    const d = 100 + (len / total) * 220;
    const deg = i % 2 === 0 ? -35 : 30;
    const [x, y] = pts[i];
    pts.push([x + d * Math.cos((deg * Math.PI) / 180), y + d * Math.sin((deg * Math.PI) / 180)]);
  });
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 40;
  const [minX, minY] = [Math.min(...xs) - pad, Math.min(...ys) - pad];
  const [w, h] = [Math.max(...xs) - minX + pad, Math.max(...ys) - minY + pad];
  return (
    <svg viewBox={`${minX} ${minY} ${w} ${h}`} className="w-full max-w-xl mx-auto">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      {lengths.map((len, i) => {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        // Ghi độ dài phía trên đoạn thẳng, lệch theo pháp tuyến để chữ không đè lên nét
        const d = Math.hypot(x2 - x1, y2 - y1);
        let [nx, ny] = [(y2 - y1) / d, -(x2 - x1) / d];
        if (ny > 0) [nx, ny] = [-nx, -ny];
        return (
          <text key={i} x={(x1 + x2) / 2 + nx * 24} y={(y1 + y2) / 2 + ny * 24 + 7} textAnchor="middle" fontSize={20} fontWeight={800} fill={PINK} fontFamily="Nunito">
            {len} {unit}
          </text>
        );
      })}
      {pts.map(([x, y], i) => {
        const peak = i > 0 && i < pts.length - 1 && y < pts[i - 1][1];
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill={INK} />
            <text x={x} y={peak ? y - 14 : y + 28} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK} fontFamily="Nunito">
              {String.fromCharCode(65 + i)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
