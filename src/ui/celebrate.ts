import confetti from 'canvas-confetti';

const PASTEL = ['#f0569a', '#ffd6e7', '#cdb4ff', '#7fd6c2', '#ffe08a', '#ffad5a'];

export function celebrate(big = false) {
  void confetti({
    particleCount: big ? 160 : 70,
    spread: big ? 100 : 70,
    startVelocity: big ? 45 : 32,
    origin: { y: 0.65 },
    colors: PASTEL,
    shapes: ['circle', 'square'],
    scalar: 1.1,
    disableForReducedMotion: true,
  });
}

const PRAISE = [
  'Giỏi quá!',
  'Đúng rồi!',
  'Tuyệt vời!',
  'Con làm hay lắm!',
  'Xuất sắc!',
  'Chính xác!',
  'Thỏ Rốt thích lắm!',
];
const PRAISE_AFTER_TRY = ['Con kiên trì quá!', 'Con đã tự sửa được rồi!', 'Cố gắng thế là giỏi lắm!'];
const ENCOURAGE = ['Gần đúng rồi! Mình thử lại nhé?', 'Chưa đúng, mình xem gợi ý nhé!', 'Không sao, thử lần nữa nào!'];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
export const praise = () => pick(PRAISE);
export const praiseAfterTry = () => pick(PRAISE_AFTER_TRY);
export const encourage = () => pick(ENCOURAGE);
