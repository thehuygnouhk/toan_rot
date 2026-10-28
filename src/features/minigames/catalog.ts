// Danh mục mini-game (không import Phaser để trang menu tải nhanh).
export type GameId = 'hung-keo' | 'bong-bay' | 'lat-the' | 'tiem-banh';

export interface GameInfo {
  id: GameId;
  name: string;
  emoji: string;
  desc: string;
  /** Loại chủ đề bé chọn trước khi chơi. */
  topics: 'quick' | 'memory' | 'none';
  color: string;
}

export const GAMES: GameInfo[] = [
  { id: 'hung-keo', name: 'Hứng kẹo', emoji: '🍬', desc: 'Kéo giỏ hứng viên kẹo có kết quả đúng', topics: 'quick', color: 'bg-primary/20' },
  { id: 'bong-bay', name: 'Bắn bóng bay', emoji: '🎈', desc: 'Chạm vỡ quả bóng có kết quả đúng', topics: 'quick', color: 'bg-secondary/40' },
  { id: 'lat-the', name: 'Lật thẻ ghép đôi', emoji: '🃏', desc: 'Lật 2 thẻ, tìm các cặp đi với nhau', topics: 'memory', color: 'bg-info/40' },
  { id: 'tiem-banh', name: 'Tiệm bánh chia đều', emoji: '🧁', desc: 'Kéo bánh vào hộp cho mỗi hộp bằng nhau', topics: 'none', color: 'bg-accent/40' },
];

export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

export const QUICK_COUNT = 8;
export const MEMORY_PAIRS = 6;
export const BAKERY_ROUNDS = 4;
/** Thưởng thêm khi chơi xong một lượt. */
export const GAME_BONUS = 5;
