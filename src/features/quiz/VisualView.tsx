import type { ReactNode } from 'react';
import type { Visual } from '../../engine/questions';
import type { CountShape, GridPoint } from '../../engine/questions/types';

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
    case 'circle-chain':
      return <CircleChain {...visual} />;
    case 'circles-in-rect':
      return <CirclesInRect {...visual} />;
    case 'grid-figure':
      return <GridFigure {...visual} />;
    case 'cube-stack':
      return <CubeStack {...visual} />;
    case 'count-shapes':
      return <CountShapes shape={visual.shape} />;
    case 'items':
      return <Items {...visual} />;
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
  const angles: Record<'radius' | 'diameter' | 'chord', number[]> = { radius: [-50], diameter: [200, 20], chord: [-115, 125] };
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

const GREEN = '#22a06b';

/** Nhãn chữ có nền trắng mờ để đọc rõ khi nằm trên hình. */
function Tag({ x, y, children, color = INK }: { x: number; y: number; children: string; color?: string }) {
  const w = children.length * 10 + 10;
  return (
    <g>
      <rect x={x - w / 2} y={y - 15} width={w} height={22} rx={8} fill="#fff" opacity={0.9} />
      <text x={x} y={y + 2} textAnchor="middle" fontSize={18} fontWeight={800} fill={color} fontFamily="Nunito">
        {children}
      </text>
    </g>
  );
}

const FLOWER_COLORS = ['#7fd6c2', '#ffad5a', '#ff7eb6', '#b388ff'];

/** Các hình tròn có bông hoa bên trong đặt sát nhau; đường xanh là đường chú kiến bò. */
function CircleChain({ count, radius, route }: { count: number; radius: number; route: 'full' | 'centers' }) {
  const R = 50;
  const y = 110;
  const cx = (i: number) => 60 + i * 2 * R;
  const centers = ['M', 'N', 'P', 'Q'];
  const path = [
    ...(route === 'full' ? [[cx(0), y - R]] : []),
    ...Array.from({ length: count }, (_, i) => [cx(i), y]),
    ...(route === 'full' ? [[cx(count - 1), y - R]] : []),
  ];
  return (
    <svg viewBox={`0 0 ${count * 2 * R + 20} 190`} className="w-full mx-auto" style={{ maxWidth: count * 140 }}>
      {Array.from({ length: count }, (_, i) => (
        <g key={i}>
          <circle cx={cx(i)} cy={y} r={R} fill="#fff" stroke={INK} strokeWidth={3} />
          {Array.from({ length: 8 }, (_, k) => (
            <ellipse key={k} cx={cx(i)} cy={y - 24} rx={9} ry={18} fill={FLOWER_COLORS[i % 4]} opacity={0.75} transform={`rotate(${k * 45} ${cx(i)} ${y})`} />
          ))}
          <circle cx={cx(i)} cy={y} r={11} fill="#ffe08a" />
        </g>
      ))}
      {route === 'centers' && <line x1={cx(0)} y1={y} x2={cx(0)} y2={y - R} stroke={INK} strokeWidth={2.5} strokeDasharray="5 4" />}
      <polyline points={path.map((p) => p.join(',')).join(' ')} fill="none" stroke={GREEN} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      {path.map(([x, py], i) => (
        <circle key={i} cx={x} cy={py} r={5} fill="#e5484d" />
      ))}
      <Tag x={cx(0) - 30} y={y - R / 2 + 4}>{`${radius} cm`}</Tag>
      {route === 'full' && (
        <>
          <text x={cx(0)} y={y - R - 10} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK} fontFamily="Nunito">A</text>
          <text x={cx(count - 1)} y={y - R - 10} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK} fontFamily="Nunito">B</text>
        </>
      )}
      {Array.from({ length: count }, (_, i) => (
        <Tag key={i} x={cx(i)} y={y + 30}>{centers[i]}</Tag>
      ))}
      <text x={route === 'full' ? cx(0) + 4 : cx(0) + 14} y={route === 'full' ? y - R - 22 : y - 12} fontSize={26}>
        🐜
      </text>
    </svg>
  );
}

/** Hình tròn bằng nhau xếp vừa khít trong hình chữ nhật: cúc áo trên miếng vải hoặc bánh quy trong hộp. */
function CirclesInRect({ count, theme, given, value }: { count: number; theme: 'cuc-ao' | 'banh-quy'; given: 'length' | 'radius'; value: number }) {
  const D = 80;
  const x0 = 20;
  const y0 = 46;
  const W = count * D;
  const button = theme === 'cuc-ao';
  return (
    <svg viewBox={`0 0 ${W + 40} ${D + 66}`} className="w-full mx-auto" style={{ maxWidth: count * 120 + 60 }}>
      <rect x={x0} y={y0} width={W} height={D} rx={6} fill={button ? '#ffd6e7' : '#f3d29b'} stroke={button ? INK : '#9a6b3c'} strokeWidth={3} />
      {button && <rect x={x0 + 5} y={y0 + 5} width={W - 10} height={D - 10} rx={4} fill="none" stroke="#f0569a" strokeWidth={2} strokeDasharray="6 5" />}
      {Array.from({ length: count }, (_, i) => {
        const cx = x0 + D / 2 + i * D;
        const cy = y0 + D / 2;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={D / 2} fill={button ? '#cdb4ff' : '#e0a458'} stroke={INK} strokeWidth={2.5} />
            {button
              ? [
                  [-9, -9],
                  [9, -9],
                  [-9, 9],
                  [9, 9],
                ].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={cx + dx} cy={cy + dy} r={5} fill="#fff" stroke={INK} strokeWidth={1.5} />)
              : [
                  [-14, -10],
                  [12, -16],
                  [-4, 6],
                  [16, 10],
                  [-18, 16],
                ].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={cx + dx} cy={cy + dy} r={4} fill="#6b3d1f" />)}
          </g>
        );
      })}
      {given === 'length' ? (
        <g>
          <g stroke={INK} strokeWidth={2}>
            <line x1={x0} y1={22} x2={x0 + W} y2={22} />
            <line x1={x0} y1={14} x2={x0} y2={30} />
            <line x1={x0 + W} y1={14} x2={x0 + W} y2={30} />
          </g>
          <Tag x={x0 + W / 2} y={22}>{`${value} cm`}</Tag>
        </g>
      ) : (
        <g>
          <line x1={x0 + D / 2} y1={y0 + D / 2} x2={x0 + D} y2={y0 + D / 2} stroke={INK} strokeWidth={3} />
          <circle cx={x0 + D / 2} cy={y0 + D / 2} r={4} fill={INK} />
          <Tag x={x0 + D * 0.75} y={y0 + D / 2 - 14}>{`${value} cm`}</Tag>
        </g>
      )}
    </svg>
  );
}

/** Hình trên lưới ô vuông (như vở bài tập): đỉnh nối thành hình khép kín, các điểm đánh dấu trên cạnh. */
function GridFigure({ width, height, vertices, marks }: { width: number; height: number; vertices: GridPoint[]; marks: GridPoint[] }) {
  const s = 40;
  const pad = 30;
  const X = (x: number) => pad + x * s;
  const Y = (y: number) => pad + y * s;
  const cx = vertices.reduce((t, p) => t + p.x, 0) / vertices.length;
  const cy = vertices.reduce((t, p) => t + p.y, 0) / vertices.length;
  // Nhãn đặt ra phía ngoài hình, theo hướng từ tâm hình tới điểm
  const away = (p: GridPoint, dist: number) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const d = Math.hypot(dx, dy) || 1;
    return [X(p.x) + (dx / d) * dist, Y(p.y) + (dy / d) * dist + 7];
  };
  return (
    <svg viewBox={`0 0 ${width * s + pad * 2} ${height * s + pad * 2}`} className="w-full max-w-xl mx-auto">
      <g stroke="#a9cdf5" strokeWidth={1.5}>
        {Array.from({ length: width + 1 }, (_, i) => (
          <line key={`v${i}`} x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(height)} />
        ))}
        {Array.from({ length: height + 1 }, (_, j) => (
          <line key={`h${j}`} x1={X(0)} y1={Y(j)} x2={X(width)} y2={Y(j)} />
        ))}
      </g>
      <polygon points={vertices.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      {vertices.map((p) => {
        const [lx, ly] = away(p, 22);
        return (
          <g key={p.label}>
            <circle cx={X(p.x)} cy={Y(p.y)} r={5} fill={INK} />
            <text x={lx} y={ly} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK} fontFamily="Nunito">
              {p.label}
            </text>
          </g>
        );
      })}
      {marks.map((p) => {
        const [lx, ly] = away(p, 24);
        return (
          <g key={p.label}>
            <circle cx={X(p.x)} cy={Y(p.y)} r={6} fill={PINK} stroke={INK} strokeWidth={2} />
            <text x={lx} y={ly} textAnchor="middle" fontSize={22} fontWeight={800} fill="#b5179e" fontFamily="Nunito">
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Khối hộp chữ nhật ghép từ các khối lập phương nhỏ (vẽ kiểu SGK: mặt trước, mặt trên, mặt bên). */
function CubeStack({ a, b, c }: { a: number; b: number; c: number }) {
  const s = 44;
  const k = 20;
  const x0 = 16;
  const y0 = 16 + b * k;
  const fx = x0 + a * s;
  const pt = (x: number, y: number) => `${x},${y}`;
  const lines: [number, number, number, number][] = [];
  for (let i = 1; i < a; i++) lines.push([x0 + i * s, y0, x0 + i * s, y0 + c * s], [x0 + i * s, y0, x0 + i * s + b * k, y0 - b * k]);
  for (let j = 1; j < c; j++) lines.push([x0, y0 + j * s, fx, y0 + j * s], [fx, y0 + j * s, fx + b * k, y0 + j * s - b * k]);
  for (let d = 1; d < b; d++) lines.push([x0 + d * k, y0 - d * k, fx + d * k, y0 - d * k], [fx + d * k, y0 - d * k, fx + d * k, y0 - d * k + c * s]);
  return (
    <svg viewBox={`0 0 ${fx + b * k + 16} ${y0 + c * s + 16}`} className="w-60 sm:w-72 mx-auto">
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
        <polygon points={[pt(x0, y0), pt(fx, y0), pt(fx, y0 + c * s), pt(x0, y0 + c * s)].join(' ')} fill="#ff9cc8" />
        <polygon points={[pt(x0, y0), pt(fx, y0), pt(fx + b * k, y0 - b * k), pt(x0 + b * k, y0 - b * k)].join(' ')} fill="#ffc8e0" />
        <polygon points={[pt(fx, y0), pt(fx + b * k, y0 - b * k), pt(fx + b * k, y0 - b * k + c * s), pt(fx, y0 + c * s)].join(' ')} fill="#ec6fa9" />
      </g>
      <g stroke={INK} strokeWidth={2}>
        {lines.map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </svg>
  );
}

/** Hình ghép để đếm số hình. */
function CountShapes({ shape }: { shape: CountShape }) {
  const stroke = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' as const, fill: 'none' };
  let body: ReactNode;
  if (shape === 'fan-2' || shape === 'fan-3') {
    const n = shape === 'fan-2' ? 2 : 3;
    const [ax, ay, bx, cx, by] = [130, 20, 20, 240, 180];
    body = (
      <>
        <polygon points={`${ax},${ay} ${bx},${by} ${cx},${by}`} {...stroke} fill={SOFT} />
        {Array.from({ length: n - 1 }, (_, i) => {
          const x = bx + ((cx - bx) * (i + 1)) / n;
          return <line key={i} x1={ax} y1={ay} x2={x} y2={by} {...stroke} />;
        })}
      </>
    );
  } else if (shape === 'strips-2' || shape === 'strips-3') {
    const n = shape === 'strips-2' ? 2 : 3;
    const w = 66;
    const x0 = (260 - n * w) / 2;
    body = (
      <>
        <rect x={x0} y={50} width={n * w} height={90} {...stroke} fill={SOFT} />
        {Array.from({ length: n - 1 }, (_, i) => (
          <line key={i} x1={x0 + (i + 1) * w} y1={50} x2={x0 + (i + 1) * w} y2={140} {...stroke} />
        ))}
      </>
    );
  } else if (shape === 'grid-2x2') {
    body = (
      <>
        <rect x={50} y={20} width={160} height={160} {...stroke} fill={SOFT} />
        <line x1={130} y1={20} x2={130} y2={180} {...stroke} />
        <line x1={50} y1={100} x2={210} y2={100} {...stroke} />
      </>
    );
  } else {
    body = (
      <>
        <rect x={50} y={20} width={160} height={160} {...stroke} fill={SOFT} />
        <line x1={50} y1={20} x2={210} y2={180} {...stroke} />
        <line x1={210} y1={20} x2={50} y2={180} {...stroke} />
      </>
    );
  }
  return (
    <svg viewBox="0 0 260 200" className="w-60 mx-auto">
      {body}
    </svg>
  );
}

/** Đồ vật xếp thành các hàng bằng nhau; hàng đầu được khoanh bằng nét đứt. */
function Items({ emoji, total, marked }: { emoji: string; total: number; marked: number }) {
  const rows = total / marked;
  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${total} đồ vật`}>
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className={`px-3 py-0.5 text-2xl sm:text-3xl tracking-wide rounded-full border-4 ${r === 0 ? 'border-dashed border-primary bg-primary/10' : 'border-transparent'}`}
        >
          {emoji.repeat(marked)}
        </div>
      ))}
    </div>
  );
}
