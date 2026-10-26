const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

/** Đọc số từ 0 đến 999 theo cách viết trong SGK ("bốn trăm linh năm", "hai mươi mốt"). */
export function readNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new Error(`readNumber: ${n}`);
  if (n === 0) return 'không';
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const parts: string[] = [];
  if (h > 0) parts.push(`${DIGITS[h]} trăm`);
  if (t === 0) {
    if (u > 0) parts.push(h > 0 ? `linh ${DIGITS[u]}` : DIGITS[u]);
  } else {
    parts.push(t === 1 ? 'mười' : `${DIGITS[t]} mươi`);
    if (u === 1) parts.push(t === 1 ? 'một' : 'mốt');
    else if (u === 4) parts.push(t === 1 ? 'bốn' : 'tư');
    else if (u === 5) parts.push('lăm');
    else if (u > 0) parts.push(DIGITS[u]);
  }
  const s = parts.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
