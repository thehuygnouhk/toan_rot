# 🐰🥕 Toán Rốt

Trang web giúp bé gái lớp 3 **thích học Toán** qua tô màu, thời trang và nhân vật dễ thương — bám sát chương trình Toán lớp 3 sách mới (GDPT 2018, bộ Kết nối tri thức).

> **Bản hiện tại: ôn thi giữa học kì 1 (Bài 1 – Bài 22).** 8 trạm ôn + đề thi thử, Xưởng Tô Màu, Tủ đồ Thỏ Rốt, bảng tiến độ cho bố mẹ. Xem mục ⚡ trong [docs/03-kich-ban-xay-dung.md](docs/03-kich-ban-xay-dung.md).

## Chạy trên máy

Cần [Node.js](https://nodejs.org) bản 22 trở lên.

```bash
npm install
npm run dev        # mở http://localhost:5173
```

| Lệnh | Làm gì |
|---|---|
| `npm test` | Chạy 83 test: câu hỏi đúng phạm vi, đáp án đúng, lưu tiến độ… |
| `npm run lint` / `npm run typecheck` | Kiểm tra code |
| `npm run build` | Tạo bản web tĩnh trong `dist/` (mở được ở bất kỳ đâu) |

**Đưa lên mạng miễn phí:** khi code nằm trên nhánh `main`, workflow `.github/workflows/deploy.yml` tự đưa lên GitHub Pages. Chỉ cần bật một lần: *Settings → Pages → Source: GitHub Actions*. Trên máy tính bảng, mở link rồi chọn "Thêm vào màn hình chính".

Tiến độ, cà rốt và tranh của bé **chỉ lưu trên trình duyệt của máy đó** (IndexedDB), không gửi đi đâu.

## Cấu trúc code

```
src/engine/questions/   bộ sinh câu hỏi theo bài (cd01, cd02, cd03) + test
src/engine/progress/    lưu tiến độ (Dexie), điểm thành thạo, cà rốt, sao
src/features/onthi/     bản đồ ôn thi, các trạm, đề thi thử
src/features/quiz/      màn làm bài dùng chung, hình minh hoạ SVG
src/features/coloring/  Xưởng Tô Màu (tranh SVG theo vùng)
src/features/wardrobe/  Tủ đồ Thỏ Rốt
src/features/parent/    bảng tiến độ, xem trước câu hỏi
src/ui/                 Thỏ Rốt, nút, âm thanh, đọc to, pháo giấy
```

## Tài liệu

| File | Nội dung |
|---|---|
| [docs/01-chuong-trinh-toan-3.md](docs/01-chuong-trinh-toan-3.md) | Phạm vi kiến thức Toán 3, mục lục sách Kết nối tri thức (16 chủ đề), khác biệt Chân trời sáng tạo / Cánh diều, chỗ trẻ hay nhầm |
| [docs/02-tham-khao-website-github.md](docs/02-tham-khao-website-github.md) | 19 website/ứng dụng tương tự, 26 repo GitHub (sao, giấy phép, dùng để làm gì), tài nguyên miễn phí, danh sách skill đã học |
| [docs/03-kich-ban-xay-dung.md](docs/03-kich-ban-xay-dung.md) | Kịch bản sản phẩm + 10 giai đoạn thi công kèm câu lệnh dán cho AI + kịch bản thử nghiệm với bé |
| [AGENTS.md](AGENTS.md) | Quy tắc cho AI (Antigravity, Claude Code, Gemini CLI, Codex, Cursor…) |

## Skill cho AI

Thư mục [`.agents/skills/`](.agents/skills) chứa **27 skill** mà AI tự nạp khi làm việc trong repo:

- **7 skill tự viết** từ nghiên cứu: `toan-lop-3`, `giao-dien-de-thuong`, `to-mau-va-ve`, `phong-thoi-trang`, `vong-lap-hoc-va-thuong`, `mini-game-phaser`, `tu-hoc-skill`.
- **20 skill chính thức của Phaser 4** (`phaser-*`), lấy từ repo [phaserjs/phaser](https://github.com/phaserjs/phaser/tree/master/skills) (MIT, xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).

Antigravity, Gemini CLI, Codex, Cursor đọc `.agents/skills/`; Claude Code đọc `.claude/skills/` (là liên kết tới cùng thư mục). Trên Windows, nếu `.claude/skills` hiện ra thành file văn bản thay vì thư mục, bật symlink cho Git (`git config core.symlinks true`, cần Developer Mode) rồi clone lại — Antigravity không bị ảnh hưởng.
