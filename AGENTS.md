# AGENTS.md — Quy tắc cho AI làm việc trong dự án "Toán Rốt"

## Dự án

Trang web giúp **một bé gái 8 tuổi học Toán lớp 3** (chương trình GDPT 2018, sách mới) một cách hứng thú. Bé thích **tô màu, vẽ, thời trang và những thứ dễ thương**. Linh vật: **Thỏ Rốt** 🐰; tiền trong game: **cà rốt** 🥕.

Tài liệu gốc — đọc trước khi làm việc lớn:
- `docs/01-chuong-trinh-toan-3.md` — phạm vi kiến thức, mục lục sách, ghép kiến thức vào khu vực trong game.
- `docs/02-tham-khao-website-github.md` — website, repo tham khảo và giấy phép.
- `docs/03-kich-ban-xay-dung.md` — kịch bản sản phẩm và các giai đoạn thi công.

## Ngôn ngữ

- Trả lời người dùng bằng **tiếng Việt**.
- Mọi chữ trên giao diện là **tiếng Việt có dấu**, câu ngắn, giọng ấm áp.
- Tên biến, hàm, file: tiếng Anh hoặc tiếng Việt không dấu kebab-case/camelCase — giữ nhất quán trong từng thư mục.

## Công nghệ

Vite + React + TypeScript · Tailwind CSS + daisyUI · Phaser 4 (mini-game) · SVG (tô màu, thay đồ) · perfect-freehand · canvas-confetti · Web Audio (`src/ui/sound.ts`; howler.js khi cần file âm thanh) · Dexie (IndexedDB) · ts-fsrs · Vitest + Playwright · vite-plugin-pwa · React Three Fiber (tuỳ chọn, chỉ cho phòng 3D).

**Đã có** (28/10/2026): bản ôn thi giữa học kì 1 — bộ sinh câu hỏi CD01–CD03 (Bài 1–22, có câu hình vẽ như vở bài tập), trạm ôn + đề thi thử, 4 mini-game Phaser (hứng kẹo, bóng bay, lật thẻ, tiệm bánh), Sàn diễn thời trang, nhiệm vụ hằng ngày + vườn hoa, Xưởng Tô Màu, Tủ đồ Thỏ Rốt (đổi màu, đồ đặc biệt mở khoá bằng thành tích), bảng tiến độ. Bé học bộ **Kết nối tri thức**. Chủ đề mới chỉ mở khi bé đã học trên lớp.

Không thêm thư viện lớn khác khi chưa giải thích lý do cho người dùng.

## Cấu trúc thư mục

```
src/ui/                     linh vật Thỏ Rốt, nút, âm thanh, đọc to, pháo giấy
src/engine/questions/       bộ sinh câu hỏi theo chủ đề (cd01.ts, cd02.ts…) + test; đăng ký kỹ năng trong index.ts
src/engine/progress/        Dexie, điểm thành thạo, cà rốt, sao
src/features/<khu-vuc>/     onthi, quiz, coloring, wardrobe, parent…
src/games/<mini-game>/      scene Phaser (EventBus, PhaserGame, BaseScene dùng chung ở src/games/)
```

Thêm chủ đề mới: viết hàm sinh câu hỏi trả về `Draft` trong `src/engine/questions/cdXX.ts`, đăng ký vào `SKILLS` (index.ts), thêm `TopicId`, thêm trạm vào `src/features/onthi/stations.ts`, chạy `npm test` (test tự kiểm tra mọi kỹ năng trong `ALL_SKILLS`; nhớ nới giới hạn số trong test nếu chủ đề vượt 1 000).

## Skill — luôn dùng skill phù hợp trước khi làm

| Việc | Skill |
|---|---|
| Câu hỏi, bài tập, nội dung toán | `toan-lop-3` |
| Bất kỳ giao diện, hiệu ứng, âm thanh, phản hồi nào | `giao-dien-de-thuong` |
| Tô màu, vẽ, sticker, bộ sưu tập | `to-mau-va-ve` |
| Nhân vật, thay đồ, cửa hàng, tiền, may đo | `phong-thoi-trang` |
| Tiến độ, thưởng, độ khó, ôn tập, phụ huynh | `vong-lap-hoc-va-thuong` |
| Mini-game 2D/2.5D, bản đồ, 3D | `mini-game-phaser` + các skill `phaser-*` |
| Học thêm từ website/GitHub, tạo skill mới | `tu-hoc-skill` |

Skill nằm ở `.agents/skills/` (Claude Code đọc qua liên kết `.claude/skills`). Khi tạo skill mới, thêm một dòng vào bảng này.

## Quy tắc bắt buộc

1. **Đúng chương trình**: không ra đề vượt phạm vi chủ đề (xem skill `toan-lop-3`). Mỗi bộ sinh câu hỏi phải có unit test.
2. **An toàn cho trẻ**: không quảng cáo, không link ra ngoài trong khu vực của bé, không thu thập dữ liệu cá nhân, không mua bằng tiền thật, không đăng nhập mạng xã hội. Tiến độ lưu trên máy.
3. **Không làm bé sợ sai**: không dấu X đỏ, không trừ đồ / trừ cà rốt, không đồng hồ đếm ngược mặc định.
4. **Bản quyền**: chỉ dùng hình, âm thanh, font có giấy phép cho phép (CC0, MIT, OFL…) hoặc tự vẽ; ghi nguồn vào `public/NGUON.md`. Code từ repo GPL/AGPL chỉ học ý tưởng, không chép. Code MIT/ISC/Apache chép vào thì cập nhật `THIRD_PARTY_NOTICES.md`.
5. **Không dùng nhân vật có thương hiệu** (Elsa, Hello Kitty, Barbie…). Chỉ dùng nhân vật tự tạo.
6. **Tờ tiền** là hình cách điệu ghi mệnh giá, không sao chép ảnh tờ tiền thật.
7. **Máy tính bảng là thiết bị chính**: mọi màn phải dùng được bằng chạm ở bề rộng 768px.

## Hoàn thành một việc khi

- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` đều qua.
- [ ] Đã xem trên trình duyệt ở 768px và 1280px.
- [ ] Đã đối chiếu mục "Kiểm tra trước khi xong" của các skill đã dùng.
- [ ] Đã nói cho người dùng biết cách tự kiểm tra (bấm vào đâu, thấy gì).
