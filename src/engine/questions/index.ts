import { createRng, type Rng } from '../rng';
import { congTru1000, divisionFact, doLuong, loiVanCongTru, multiplicationFact, soDen1000, soSanh1000, timThanhPhanCongTru, xemDongHo } from './cd01';
import { loiVanNhanChia, motPhanMayHinh, motPhanMaySo, timThanhPhanNhanChia } from './cd02';
import { chiaHaiChuSo } from './cd04';
import { demHinh, gocVuong, hinhPhang, hinhTron, hinhTronUngDung, khoiGhep, khoiHinh, trungDiem } from './cd03';
import { toSpeech } from './format';
import type { Choice, Draft, Question, SkillId, SkillInfo } from './types';

export type { Question, SkillId, Visual, Choice } from './types';

export const SKILLS: Record<SkillId, SkillInfo> = {
  'so-den-1000': { id: 'so-den-1000', topicId: 'CD01', name: 'Đọc, viết số đến 1 000', lessons: 'Bài 1', generate: soDen1000 },
  'so-sanh-1000': { id: 'so-sanh-1000', topicId: 'CD01', name: 'So sánh số đến 1 000', lessons: 'Bài 1', generate: soSanh1000 },
  'cong-tru-1000': { id: 'cong-tru-1000', topicId: 'CD01', name: 'Cộng, trừ trong phạm vi 1 000', lessons: 'Bài 2', generate: congTru1000 },
  'loi-van-cong-tru': { id: 'loi-van-cong-tru', topicId: 'CD01', name: 'Toán có lời văn cộng, trừ', lessons: 'Bài 2', generate: loiVanCongTru },
  'tim-thanh-phan-cong-tru': { id: 'tim-thanh-phan-cong-tru', topicId: 'CD01', name: 'Tìm thành phần phép cộng, trừ', lessons: 'Bài 3', generate: timThanhPhanCongTru },
  'bang-nhan-2-5': { id: 'bang-nhan-2-5', topicId: 'CD01', name: 'Bảng nhân 2, 3, 4, 5', lessons: 'Bài 4–6', generate: (r) => multiplicationFact(r, [2, 3, 4, 5]) },
  'bang-chia-2-5': { id: 'bang-chia-2-5', topicId: 'CD01', name: 'Bảng chia 2, 3, 4, 5', lessons: 'Bài 4–6', generate: (r) => divisionFact(r, [2, 3, 4, 5]) },
  'xem-dong-ho': { id: 'xem-dong-ho', topicId: 'CD01', name: 'Xem đồng hồ, giờ buổi chiều', lessons: 'Bài 7', generate: xemDongHo },
  'do-luong': { id: 'do-luong', topicId: 'CD01', name: 'Đo độ dài, ki-lô-gam, lít', lessons: 'Bài 7', generate: doLuong },
  'bang-nhan-6-9': { id: 'bang-nhan-6-9', topicId: 'CD02', name: 'Bảng nhân 6, 7, 8, 9', lessons: 'Bài 9–12', generate: (r) => multiplicationFact(r, [6, 7, 8, 9]) },
  'bang-chia-6-9': { id: 'bang-chia-6-9', topicId: 'CD02', name: 'Bảng chia 6, 7, 8, 9', lessons: 'Bài 9–12', generate: (r) => divisionFact(r, [6, 7, 8, 9]) },
  'tim-thanh-phan-nhan-chia': { id: 'tim-thanh-phan-nhan-chia', topicId: 'CD02', name: 'Tìm thành phần phép nhân, chia', lessons: 'Bài 13', generate: timThanhPhanNhanChia },
  'mot-phan-may-hinh': { id: 'mot-phan-may-hinh', topicId: 'CD02', name: 'Một phần mấy (hình)', lessons: 'Bài 14', generate: motPhanMayHinh },
  'mot-phan-may-so': { id: 'mot-phan-may-so', topicId: 'CD02', name: 'Một phần mấy của một số', lessons: 'Bài 14', generate: motPhanMaySo },
  'loi-van-nhan-chia': { id: 'loi-van-nhan-chia', topicId: 'CD02', name: 'Toán có lời văn nhân, chia', lessons: 'Bài 4–15', generate: loiVanNhanChia },
  'trung-diem': { id: 'trung-diem', topicId: 'CD03', name: 'Điểm ở giữa, trung điểm', lessons: 'Bài 16', generate: trungDiem },
  'hinh-tron': { id: 'hinh-tron', topicId: 'CD03', name: 'Hình tròn: tâm, bán kính, đường kính', lessons: 'Bài 17', generate: hinhTron },
  'hinh-tron-ung-dung': { id: 'hinh-tron-ung-dung', topicId: 'CD03', name: 'Hình tròn trong hình vẽ: kiến bò, cúc áo', lessons: 'Bài 17, 22', generate: hinhTronUngDung },
  'goc-vuong': { id: 'goc-vuong', topicId: 'CD03', name: 'Góc vuông, góc không vuông', lessons: 'Bài 18', generate: gocVuong },
  'hinh-phang': { id: 'hinh-phang', topicId: 'CD03', name: 'Tam giác, tứ giác, HCN, hình vuông', lessons: 'Bài 19', generate: hinhPhang },
  'dem-hinh': { id: 'dem-hinh', topicId: 'CD03', name: 'Đếm hình', lessons: 'Bài 19, 22', generate: demHinh },
  'khoi-hinh': { id: 'khoi-hinh', topicId: 'CD03', name: 'Khối lập phương, hộp chữ nhật, trụ, cầu', lessons: 'Bài 7, 21', generate: khoiHinh },
  'khoi-ghep': { id: 'khoi-ghep', topicId: 'CD03', name: 'Ghép khối lập phương nhỏ, sơn mặt', lessons: 'Bài 21', generate: khoiGhep },
  'chia-2-chu-so': { id: 'chia-2-chu-so', topicId: 'CD04', name: 'Chia số có hai chữ số cho số có một chữ số', lessons: 'Bài 25–26', generate: chiaHaiChuSo },
};

export const ALL_SKILLS = Object.keys(SKILLS) as SkillId[];

/** Tạo danh sách lựa chọn cho câu trả lời bằng số: đáp án nhiễu hợp lệ, đủ 4 lựa chọn. */
function numberChoices(answer: number, distractors: Choice[], rng: Rng): Choice[] {
  const out: Choice[] = [];
  const seen = new Set<string>([String(answer)]);
  for (const d of distractors) {
    const v = Number(d.value);
    if (Number.isInteger(v) && v >= 0 && !seen.has(d.value) && out.length < 3) {
      seen.add(d.value);
      out.push(d);
    }
  }
  const deltas = answer < 100 ? [1, -1, 2, -2, 3, -3, 5, 10] : [10, -10, 1, -1, 100, -100, 2, -2];
  for (const delta of rng.shuffle(deltas)) {
    if (out.length >= 3) break;
    const v = answer + delta;
    if (v >= 0 && !seen.has(String(v))) {
      seen.add(String(v));
      out.push({ value: String(v) });
    }
  }
  return out;
}

/** Bỏ hình nhóm đồ vật quá đông (khó đếm trên màn hình nhỏ). */
const MAX_GROUP_ITEMS = 45;
function tidyVisual<T extends Draft['visual']>(v: T): T | undefined {
  if (v?.kind === 'groups' && v.groups * v.perGroup > MAX_GROUP_ITEMS) return undefined;
  return v;
}

export function finalize(skillId: SkillId, seed: number, draft: Draft, rng: Rng): Question {
  const skill = SKILLS[skillId];
  const answer = String(draft.answer);
  let choices: Choice[];
  if (draft.options) {
    const whyByValue = new Map((draft.distractors ?? []).map((d) => [d.value, d.why]));
    const unique = [...new Set(draft.options.map(String))];
    if (!unique.includes(answer)) unique.unshift(answer);
    choices = unique.map((value) => ({ value, why: whyByValue.get(value) }));
    // Dấu >, <, = và Có/Không giữ nguyên thứ tự cho dễ nhìn
    if (!['>', 'Có', 'Góc vuông'].includes(unique[0])) choices = rng.shuffle(choices);
  } else {
    choices = rng.shuffle([{ value: answer }, ...numberChoices(Number(draft.answer), draft.distractors ?? [], rng)]);
  }
  return {
    id: `${skillId}#${seed}`,
    topicId: skill.topicId,
    skillId,
    prompt: draft.prompt,
    speak: draft.speak ?? toSpeech(draft.prompt),
    visual: tidyVisual(draft.visual),
    answer,
    unit: draft.unit,
    input: draft.options ? 'choice' : (draft.input ?? 'choice'),
    choices,
    hints: draft.hints,
    hintVisual: tidyVisual(draft.hintVisual),
    solution: draft.solution,
  };
}

/** Sinh một câu hỏi tái tạo được từ (skillId, seed). */
export function makeQuestion(skillId: SkillId, seed: number): Question {
  const rng = createRng(seed);
  const draft = SKILLS[skillId].generate(rng);
  return finalize(skillId, seed, draft, rng);
}

/** Sinh một bộ câu hỏi: xoay vòng các kỹ năng (theo trọng số), không trùng đề. */
export function buildQuiz(skills: SkillId[], count: number, seed: number, weights?: Partial<Record<SkillId, number>>): Question[] {
  const rng = createRng(seed);
  const bag: SkillId[] = [];
  for (const s of skills) for (let i = 0; i < Math.max(1, Math.round(weights?.[s] ?? 1)); i++) bag.push(s);
  const out: Question[] = [];
  const prompts = new Set<string>();
  let order = rng.shuffle(bag);
  let tries = 0;
  while (out.length < count && tries < count * 20) {
    if (order.length === 0) order = rng.shuffle(bag);
    const skillId = order.pop()!;
    const q = makeQuestion(skillId, rng.int(1, 2 ** 31 - 1));
    tries++;
    if (prompts.has(q.prompt + (q.visual ? JSON.stringify(q.visual) : ''))) continue;
    prompts.add(q.prompt + (q.visual ? JSON.stringify(q.visual) : ''));
    out.push(q);
  }
  return out;
}
