// Danh mục mini-game (không import Phaser để trang menu tải nhanh).
/** Trò vẽ bằng Phaser (tải riêng) và trò làm từng bước bằng React (cần bố cục chữ số, nhập số chính xác). */
export type PhaserGameId = 'hung-keo' | 'bong-bay' | 'lat-the' | 'tiem-banh';
export type GameId = PhaserGameId | 'chia-tung-buoc' | 'bang-ve';

export interface GameInfo {
  id: GameId;
  name: string;
  emoji: string;
  desc: string;
  /** Loại chủ đề bé chọn trước khi chơi. */
  topics: 'quick' | 'memory' | 'none';
  color: string;
  /** "Làm từng bước" (suy nghĩ nhiều bước) hay "Phản xạ nhanh". */
  group: 'tung-buoc' | 'phan-xa';
}

export const GAMES: GameInfo[] = [
  {
    id: 'chia-tung-buoc',
    name: 'Chia từng bước',
    emoji: '➗',
    desc: 'Đặt tính chia số có hai chữ số (Bài 26): chia – nhân – trừ – hạ',
    topics: 'none',
    color: 'bg-warning/40',
    group: 'tung-buoc',
  },
  {
    id: 'bang-ve',
    name: 'Bảng vẽ hình học',
    emoji: '📐',
    desc: 'Vẽ hình chữ nhật, hình vuông, góc vuông, trung điểm, đường kính… trên lưới ô vuông',
    topics: 'none',
    color: 'bg-success/30',
    group: 'tung-buoc',
  },
  { id: 'tiem-banh', name: 'Tiệm bánh chia đều', emoji: '🧁', desc: 'Kéo bánh vào hộp cho mỗi hộp bằng nhau', topics: 'none', color: 'bg-accent/40', group: 'tung-buoc' },
  { id: 'hung-keo', name: 'Hứng kẹo', emoji: '🍬', desc: 'Kéo giỏ hứng viên kẹo có kết quả đúng', topics: 'quick', color: 'bg-primary/20', group: 'phan-xa' },
  { id: 'bong-bay', name: 'Bắn bóng bay', emoji: '🎈', desc: 'Chạm vỡ quả bóng có kết quả đúng', topics: 'quick', color: 'bg-secondary/40', group: 'phan-xa' },
  { id: 'lat-the', name: 'Lật thẻ ghép đôi', emoji: '🃏', desc: 'Lật 2 thẻ, tìm các cặp đi với nhau', topics: 'memory', color: 'bg-info/40', group: 'phan-xa' },
];

export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

export const QUICK_COUNT = 8;
export const MEMORY_PAIRS = 6;
export const BAKERY_ROUNDS = 4;
/** Thưởng thêm khi chơi xong một lượt. */
export const GAME_BONUS = 5;
