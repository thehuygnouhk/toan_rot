import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import { checkGeo, GEO_KINDS, geoRound, GRID_H, GRID_W, makeGeoTask, sampleSolution, type GeoKind, type Pt } from './geometry';

const inGrid = (p: Pt) => p.x >= 0 && p.x <= GRID_W && p.y >= 0 && p.y <= GRID_H && Number.isInteger(p.x) && Number.isInteger(p.y);

describe('bảng vẽ hình học', () => {
  it('mọi bài đều có cách vẽ đúng nằm trong lưới, và cách đó được chấm đúng', () => {
    const rng = createRng(3);
    for (let i = 0; i < 400; i++) {
      for (const kind of GEO_KINDS) {
        const task = makeGeoTask(kind, rng);
        for (const p of task.given.points) expect(inGrid(p), `${kind} ${JSON.stringify(p)}`).toBe(true);
        const sol = sampleSolution(task);
        expect(sol).toHaveLength(task.labels.length);
        for (const p of sol) expect(inGrid(p), `${kind} ${JSON.stringify(p)}`).toBe(true);
        expect(checkGeo(task, sol), task.prompt).toMatchObject({ ok: true });
      }
    }
  });

  it('một lượt có 6 bài khác dạng', () => {
    for (let seed = 1; seed < 50; seed++) {
      const round = geoRound(seed);
      expect(round).toHaveLength(6);
      expect(new Set(round.map((t) => t.kind)).size).toBe(6);
    }
  });

  const task = (kind: GeoKind, seed = 1) => makeGeoTask(kind, createRng(seed));

  it('hình chữ nhật: sai số đo, sai góc, chạm không theo vòng đều bị nhắc đúng lỗi', () => {
    const t = { ...task('hcn'), a: 5, b: 3 };
    expect(checkGeo(t, [{ x: 1, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 4 }, { x: 1, y: 4 }]).ok).toBe(true);
    // Bắt đầu từ đỉnh khác, đi ngược chiều vẫn đúng
    expect(checkGeo(t, [{ x: 6, y: 4 }, { x: 6, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 4 }]).ok).toBe(true);
    expect(checkGeo(t, [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 4 }, { x: 1, y: 4 }]).message).toContain('dài 4 ô, rộng 3 ô');
    expect(checkGeo(t, [{ x: 1, y: 1 }, { x: 6, y: 4 }, { x: 6, y: 1 }, { x: 1, y: 4 }]).message).toContain('góc vuông');
    expect(checkGeo(t, [{ x: 1, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 4 }, { x: 2, y: 4 }]).message).toContain('góc vuông');
  });

  it('hình vuông: cạnh không bằng nhau thì nhắc', () => {
    const t = { ...task('hinh-vuong'), a: 3, b: 3 };
    expect(checkGeo(t, [{ x: 2, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 5 }, { x: 2, y: 5 }]).ok).toBe(true);
    expect(checkGeo(t, [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 6, y: 5 }, { x: 2, y: 5 }]).message).toContain('bằng nhau');
    expect(checkGeo(t, [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 2, y: 4 }]).message).toContain('cần dài 3 ô');
  });

  it('trung điểm: ngoài đoạn thẳng / lệch về một phía', () => {
    const t = task('trung-diem');
    const [A, B] = t.given.points;
    const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    expect(checkGeo(t, [mid]).ok).toBe(true);
    expect(checkGeo(t, [A]).message).toContain('gần A');
    expect(checkGeo(t, [{ x: mid.x + (A.y === B.y ? 0 : 1), y: mid.y + (A.y === B.y ? 1 : 0) }]).message).toContain('nằm trên đoạn thẳng AB');
  });

  it('đường gấp khúc: đi chéo, không gấp, sai tổng độ dài', () => {
    const t = { ...task('gap-khuc'), a: 9 };
    const A = t.given.points[0];
    expect(checkGeo(t, [{ x: A.x + 3, y: A.y }, { x: A.x + 3, y: A.y - 3 }, { x: A.x + 6, y: A.y - 3 }]).ok).toBe(true);
    expect(checkGeo(t, [{ x: A.x + 3, y: A.y - 1 }, { x: A.x + 3, y: A.y - 3 }, { x: A.x + 6, y: A.y - 3 }]).message).toContain('đường kẻ ô');
    expect(checkGeo(t, [{ x: A.x + 3, y: A.y }, { x: A.x + 5, y: A.y }, { x: A.x + 5, y: A.y - 4 }]).message).toContain('gấp khúc');
    expect(checkGeo(t, [{ x: A.x + 2, y: A.y }, { x: A.x + 2, y: A.y - 2 }, { x: A.x + 4, y: A.y - 2 }]).message).toContain('dài 6 ô');
  });

  it('góc vuông, bán kính, đường kính', () => {
    const g = task('goc-vuong');
    const [O, A] = g.given.points;
    expect(checkGeo(g, [A]).ok).toBe(false);
    expect(checkGeo(g, [O]).ok).toBe(false);
    const d = { ...task('duong-kinh'), given: { points: [{ label: 'O', x: 6, y: 4 }], segments: [], circle: { center: { x: 6, y: 4 }, r: 3 } } };
    expect(checkGeo(d, [{ x: 3, y: 4 }, { x: 9, y: 4 }]).ok).toBe(true);
    expect(checkGeo(d, [{ x: 3, y: 4 }, { x: 6, y: 1 }]).message).toContain('đi qua tâm');
    expect(checkGeo(d, [{ x: 4, y: 4 }, { x: 8, y: 4 }]).message).toContain('nằm trên đường tròn');
  });
});
