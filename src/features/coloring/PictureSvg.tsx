import type { Picture } from './pictures';

const INK = '#4a3b5c';

/** Vẽ tranh với màu đã tô; vùng chưa tô màu trắng. */
export function PictureSvg({
  picture,
  fills,
  onRegion,
  selected,
  className,
}: {
  picture: Picture;
  fills: Record<string, string>;
  onRegion?: (id: string) => void;
  selected?: string | null;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 300 300" className={className} role="img" aria-label={picture.name}>
      {picture.regions.map((r) => (
        <path
          key={r.id}
          d={r.d}
          fill={fills[r.id] ?? '#ffffff'}
          stroke={INK}
          strokeWidth={selected === r.id ? 6 : 3.5}
          strokeLinejoin="round"
          style={{ transition: 'fill 0.45s ease-out', cursor: onRegion ? 'pointer' : undefined }}
          onClick={onRegion ? () => onRegion(r.id) : undefined}
          data-region={r.id}
        />
      ))}
      {picture.decor.map((d) => (
        <path key={d} d={d} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" pointerEvents="none" />
      ))}
    </svg>
  );
}
