/** Viết số kiểu Việt Nam: tách lớp nghìn bằng dấu cách (1 000, 45 650). */
export function fmt(n: number): string {
  const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  return n < 0 ? `−${s}` : s;
}

/** Đổi ký hiệu toán thành chữ để giọng đọc tiếng Việt đọc đúng. */
export function toSpeech(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, '')
    .replace(/\u00a0/g, '')
    .replace(/\b1\/4\b/g, 'một phần tư')
    .replace(/×/g, ' nhân ')
    .replace(/(\d|\?) : (\d|\?)/g, '$1 chia $2')
    .replace(/\s=\s/g, ' bằng ')
    .replace(/\s\+\s/g, ' cộng ')
    .replace(/\s[−-]\s/g, ' trừ ')
    .replace(/(^|[\s,])\?(?=[\s,]|$)/g, '$1mấy')
    .replace(/ > /g, ' lớn hơn ')
    .replace(/ < /g, ' bé hơn ')
    .replace(/\bcm\b/g, 'xăng-ti-mét')
    // \b không hiểu chữ có dấu ("lọ", "mặt"), nên chặn hai bên bằng \p{L} (không dùng lookbehind: iPad cũ không hỗ trợ)
    .replace(/(^|[^\p{L}])dm(?!\p{L})/gu, '$1đề-xi-mét')
    .replace(/(^|[^\p{L}])km(?!\p{L})/gu, '$1ki-lô-mét')
    .replace(/(^|[^\p{L}])kg(?!\p{L})/gu, '$1ki-lô-gam')
    .replace(/(\d|mấy) m(?!\p{L})/gu, '$1 mét')
    .replace(/(\d|mấy) l(?!\p{L})/gu, '$1 lít')
    .replace(/(\d)\/(\d)/g, '$1 phần $2')
    .replace(/\s+/g, ' ')
    .trim();
}

export const NAMES = ['Mai', 'Lan', 'Na', 'Bống', 'Thư', 'Vy', 'Ngọc', 'Chi', 'An', 'Hà'] as const;

/** Đồ vật dễ thương: [tên có loại từ, đơn vị đếm, emoji, tên không loại từ]. */
export const THINGS = [
  ['chiếc nơ', 'chiếc', '🎀', 'nơ'],
  ['bông hoa', 'bông', '🌸', 'hoa'],
  ['chiếc bánh quy', 'chiếc', '🍪', 'bánh quy'],
  ['viên kẹo', 'viên', '🍬', 'kẹo'],
  ['quả dâu tây', 'quả', '🍓', 'dâu tây'],
  ['nhãn dán', 'cái', '⭐', 'nhãn dán'],
  ['chiếc cúc áo', 'chiếc', '🔘', 'cúc áo'],
  ['cây bút màu', 'cây', '🖍️', 'bút màu'],
  ['chiếc kẹp tóc', 'chiếc', '💖', 'kẹp tóc'],
  ['củ cà rốt', 'củ', '🥕', 'cà rốt'],
] as const;

export const CONTAINERS = ['hộp', 'túi', 'lọ', 'khay', 'đĩa'] as const;
