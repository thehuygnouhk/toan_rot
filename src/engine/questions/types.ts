import type { Rng } from '../rng';

/** Mã chủ đề theo SGK Kết nối tri thức (xem docs/01-chuong-trinh-toan-3.md). */
export type TopicId = 'CD01' | 'CD02' | 'CD03';

/** Hình minh hoạ đi kèm đề bài, được vẽ bằng SVG trong features/quiz/VisualView. */
export type Visual =
  /** Nhóm đồ vật: groups nhóm, mỗi nhóm perGroup cái. */
  | { kind: 'groups'; emoji: string; groups: number; perGroup: number }
  /** Hình chia thành parts phần bằng nhau, tô màu shaded phần. */
  | { kind: 'fraction'; shape: 'bar' | 'circle'; parts: number; shaded: number }
  /** Đoạn thẳng trên lưới ô vuông, các điểm đặt ở vị trí nguyên (đơn vị ô). */
  | { kind: 'segment'; length: number; points: { label: string; at: number }[]; showRuler: boolean }
  /** Hình tròn tâm O với các đoạn thẳng có nhãn. */
  | {
      kind: 'circle';
      center: string;
      segments: { label: string; from: string; to: string; type: 'radius' | 'diameter' | 'chord' }[];
    }
  /** Một góc có đỉnh, hai cạnh; degrees là số đo thật để vẽ. */
  | { kind: 'angle'; degrees: number; rotation: number }
  /** Một hình phẳng. */
  | { kind: 'polygon'; shape: 'triangle' | 'right-triangle' | 'quadrilateral' | 'rectangle' | 'square' }
  /** Một hình khối. */
  | { kind: 'solid'; solid: 'cube' | 'box' };

export interface Choice {
  value: string;
  /** Lỗi sai mà lựa chọn này bắt được — dùng để phản hồi đúng chỗ khi bé chọn nhầm. */
  why?: string;
}

export interface Question {
  id: string;
  topicId: TopicId;
  skillId: SkillId;
  prompt: string;
  /** Câu đọc to (đã đổi ký hiệu thành chữ). */
  speak: string;
  visual?: Visual;
  answer: string;
  /** Đơn vị hiển thị sau ô nhập số (nếu có). */
  unit?: string;
  input: 'choice' | 'number';
  choices: Choice[];
  hints: string[];
  hintVisual?: Visual;
  solution: string;
}

/** Phần do từng bộ sinh trả về; engine tự thêm id, speak, xáo trộn lựa chọn. */
export interface Draft {
  prompt: string;
  /** Câu đọc to riêng, khi đọc nguyên đề nghe không tự nhiên. */
  speak?: string;
  visual?: Visual;
  answer: number | string;
  unit?: string;
  input?: 'choice' | 'number';
  /** Đáp án nhiễu có lý do. Với câu số, engine tự bổ sung nếu thiếu. */
  distractors?: Choice[];
  /** Với câu chọn chữ: toàn bộ lựa chọn (kể cả đáp án đúng). */
  options?: string[];
  hints: string[];
  hintVisual?: Visual;
  solution: string;
}

export type SkillId =
  | 'so-den-1000'
  | 'so-sanh-1000'
  | 'cong-tru-1000'
  | 'tim-thanh-phan-cong-tru'
  | 'bang-nhan-2-5'
  | 'bang-chia-2-5'
  | 'bang-nhan-6-9'
  | 'bang-chia-6-9'
  | 'tim-thanh-phan-nhan-chia'
  | 'mot-phan-may-hinh'
  | 'mot-phan-may-so'
  | 'loi-van-nhan-chia'
  | 'trung-diem'
  | 'hinh-tron'
  | 'goc-vuong'
  | 'hinh-phang'
  | 'khoi-hinh';

export interface SkillInfo {
  id: SkillId;
  topicId: TopicId;
  name: string;
  /** Bài trong SGK Kết nối tri thức. */
  lessons: string;
  generate: (rng: Rng) => Draft;
}
