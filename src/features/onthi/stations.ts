import type { SkillId } from '../../engine/questions';

export interface Station {
  id: string;
  title: string;
  emoji: string;
  lessons: string;
  skills: SkillId[];
  count: number;
  mode: 'practice' | 'exam';
  /** Trọng số cố định (đề thi thử); trạm luyện tập dùng trọng số theo độ thành thạo. */
  weights?: Partial<Record<SkillId, number>>;
}

/** Lộ trình ôn thi giữa học kì 1 — Toán 3 Kết nối tri thức, Bài 1–22 (Chủ đề 1–3). */
export const STATIONS: Station[] = [
  { id: 'so-cong-tru', title: 'Số và phép cộng, trừ', emoji: '🔢', lessons: 'Bài 1–3', skills: ['so-den-1000', 'so-sanh-1000', 'cong-tru-1000', 'tim-thanh-phan-cong-tru'], count: 8, mode: 'practice' },
  { id: 'bang-2-5', title: 'Bảng nhân, chia 2 – 5', emoji: '🧁', lessons: 'Bài 4–6', skills: ['bang-nhan-2-5', 'bang-chia-2-5'], count: 8, mode: 'practice' },
  { id: 'bang-6-9', title: 'Bảng nhân, chia 6 – 9', emoji: '🍰', lessons: 'Bài 9–12', skills: ['bang-nhan-6-9', 'bang-chia-6-9'], count: 8, mode: 'practice' },
  { id: 'tim-thanh-phan', title: 'Tìm số chưa biết', emoji: '🔍', lessons: 'Bài 3, 13', skills: ['tim-thanh-phan-cong-tru', 'tim-thanh-phan-nhan-chia'], count: 8, mode: 'practice' },
  { id: 'mot-phan-may', title: 'Một phần mấy', emoji: '🍪', lessons: 'Bài 14', skills: ['mot-phan-may-hinh', 'mot-phan-may-so'], count: 8, mode: 'practice' },
  { id: 'loi-van', title: 'Toán có lời văn', emoji: '📖', lessons: 'Bài 2–15', skills: ['loi-van-nhan-chia', 'mot-phan-may-so'], count: 6, mode: 'practice' },
  { id: 'trung-diem-tron-goc', title: 'Trung điểm, hình tròn, góc vuông', emoji: '📐', lessons: 'Bài 16–18', skills: ['trung-diem', 'hinh-tron', 'goc-vuong'], count: 8, mode: 'practice' },
  { id: 'hinh-phang-khoi', title: 'Hình phẳng và hình khối', emoji: '🎁', lessons: 'Bài 19–21', skills: ['hinh-phang', 'khoi-hinh', 'goc-vuong'], count: 8, mode: 'practice' },
  {
    id: 'de-thi-thu',
    title: 'Đề thi thử giữa kì 1',
    emoji: '🏆',
    lessons: 'Bài 1–22',
    skills: [
      'so-den-1000', 'so-sanh-1000', 'cong-tru-1000', 'tim-thanh-phan-cong-tru', 'bang-nhan-2-5', 'bang-chia-2-5', 'bang-nhan-6-9', 'bang-chia-6-9',
      'tim-thanh-phan-nhan-chia', 'mot-phan-may-hinh', 'mot-phan-may-so', 'loi-van-nhan-chia', 'trung-diem', 'hinh-tron', 'goc-vuong', 'hinh-phang', 'khoi-hinh',
    ],
    count: 15,
    mode: 'exam',
    weights: { 'cong-tru-1000': 2, 'bang-nhan-6-9': 2, 'bang-chia-6-9': 2, 'loi-van-nhan-chia': 2 },
  },
];

export const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));

/** Trạm luyện tập đầu tiên có chứa kỹ năng — để gợi ý "ôn lại" sau đề thi thử. */
export function stationForSkill(skillId: SkillId): Station | undefined {
  return STATIONS.find((s) => s.mode === 'practice' && s.skills.includes(skillId));
}
