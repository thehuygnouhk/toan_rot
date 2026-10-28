// Giao thức trao đổi giữa React và Phaser (skill mini-game-phaser).
// React gửi đề và kết quả chấm; Phaser chỉ hiển thị và báo bé đã chọn gì. File này không import Phaser.
import type { CardFace } from '../engine/questions/games';

export const EV = {
  /** Phaser → React: scene đã sẵn sàng nhận đề. */
  ready: 'san-sang',
  /** React → Phaser: câu hỏi mới (QuestionMsg). */
  question: 'cau-hoi',
  /** Phaser → React: bé chọn một đáp án ({ value }). */
  answer: 'tra-loi',
  /** React → Phaser: kết quả chấm (FeedbackMsg). */
  feedback: 'ket-qua',
  /** React → Phaser: bộ thẻ ghép đôi (DeckMsg). */
  deck: 'bo-the',
  /** Phaser → React: bé lật hai thẻ ({ a, b }). */
  pick: 'chon-cap',
  /** React → Phaser: hai thẻ có là một cặp không ({ a, b, match }). */
  pairResult: 'ket-qua-cap',
  /** React → Phaser: một lượt chia bánh (BakeryMsg). */
  bakery: 'de-banh',
  /** Phaser → React: bé bấm Xong ({ counts }). */
  submit: 'nop-banh',
  /** React → Phaser: tạm dừng / chơi tiếp (boolean). */
  pause: 'tam-dung',
  /** React → Phaser: hết lượt, ăn mừng. */
  end: 'het-luot',
} as const;

export interface QuestionMsg {
  prompt: string;
  choices: number[];
}

export interface FeedbackMsg {
  correct: boolean;
  message: string;
}

export interface DeckMsg {
  title: string;
  cards: { id: number; face: CardFace }[];
}

export interface BakeryMsg {
  prompt: string;
  total: number;
  boxes: number;
}
