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
  | { kind: 'solid'; solid: 'cube' | 'box' }
  /** Mặt đồng hồ kim: giờ 1–12, phút 0/15/30. */
  | { kind: 'clock'; hour: number; minute: number }
  /** Đường gấp khúc, mỗi đoạn ghi độ dài. */
  | { kind: 'polyline'; lengths: number[]; unit: string }
  /** Các hình tròn bằng nhau đặt sát nhau thành hàng; chú kiến bò theo đường xanh (từ A trên hình đầu qua các tâm tới B, hoặc chỉ nối các tâm). */
  | { kind: 'circle-chain'; count: number; radius: number; route: 'full' | 'centers' }
  /** Các hình tròn bằng nhau xếp vừa khít trong hình chữ nhật; ghi sẵn chiều dài hoặc bán kính. */
  | { kind: 'circles-in-rect'; count: number; theme: 'cuc-ao' | 'banh-quy'; given: 'length' | 'radius'; value: number }
  /** Hình vẽ trên lưới ô vuông: các đỉnh nối thành hình khép kín, các điểm được đánh dấu (toạ độ theo ô). */
  | { kind: 'grid-figure'; width: number; height: number; vertices: GridPoint[]; marks: GridPoint[] }
  /** Khối hộp chữ nhật ghép từ khối lập phương nhỏ: a khối theo chiều dài, b theo chiều sâu, c tầng. */
  | { kind: 'cube-stack'; a: number; b: number; c: number }
  /** Hình ghép để đếm số hình. */
  | { kind: 'count-shapes'; shape: CountShape }
  /** Nhóm đồ vật xếp thành hàng, hàng đầu (marked cái) được khoanh. */
  | { kind: 'items'; emoji: string; total: number; marked: number };

export interface GridPoint {
  label: string;
  x: number;
  y: number;
}

export type CountShape = 'fan-2' | 'fan-3' | 'strips-2' | 'strips-3' | 'grid-2x2' | 'square-x';

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
  | 'loi-van-cong-tru'
  | 'tim-thanh-phan-cong-tru'
  | 'bang-nhan-2-5'
  | 'bang-chia-2-5'
  | 'xem-dong-ho'
  | 'do-luong'
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
  | 'khoi-hinh'
  | 'hinh-tron-ung-dung'
  | 'dem-hinh'
  | 'khoi-ghep';

export interface SkillInfo {
  id: SkillId;
  topicId: TopicId;
  name: string;
  /** Bài trong SGK Kết nối tri thức. */
  lessons: string;
  generate: (rng: Rng) => Draft;
}
