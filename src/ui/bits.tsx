import { speak, useHasVietnameseVoice } from './speech';

/** Hiện "1/3" thành phân số xếp chồng; giá trị khác hiện nguyên văn. */
export function AnswerText({ value }: { value: string }) {
  const m = value.match(/^(\d+)\/(\d+)$/);
  if (!m) return <>{value}</>;
  return (
    <span className="inline-flex flex-col items-center leading-none align-middle" aria-label={`${m[1]} phần ${m[2]}`}>
      <span>{m[1]}</span>
      <span className="block w-full border-t-4 border-current my-1" />
      <span>{m[2]}</span>
    </span>
  );
}

export function ReadAloudButton({ text, className = '' }: { text: string; className?: string }) {
  const hasVoice = useHasVietnameseVoice();
  if (!hasVoice) return null;
  return (
    <button type="button" className={`btn btn-circle btn-lg btn-secondary text-2xl ${className}`} onClick={() => speak(text)} aria-label="Nghe đọc đề">
      🔈
    </button>
  );
}

export function Stars({ count, max = 3, size = 'text-3xl' }: { count: number; max?: number; size?: string }) {
  return (
    <span className={size} aria-label={`${count} sao`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? '' : 'opacity-25 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  );
}

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

/** Bàn phím số to cho ngón tay trẻ em. */
export function NumberPad({ value, onChange, onSubmit, disabled }: { value: string; onChange: (v: string) => void; onSubmit: () => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto w-full">
      {PAD.map((k) => (
        <button
          key={k}
          type="button"
          disabled={disabled || (k === '✓' && value === '')}
          className={`btn h-16 text-3xl font-display ${k === '✓' ? 'btn-primary' : k === '⌫' ? 'btn-secondary' : 'bg-base-100 border-2 border-base-300'}`}
          onClick={() => {
            if (k === '⌫') onChange(value.slice(0, -1));
            else if (k === '✓') onSubmit();
            else if (value.length < 4) onChange(value === '0' ? k : value + k);
          }}
          aria-label={k === '⌫' ? 'Xoá' : k === '✓' ? 'Xong' : k}
        >
          {k}
        </button>
      ))}
    </div>
  );
}
