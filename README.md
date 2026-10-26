# 🐰🥕 Toán Rốt

Trang web giúp bé gái lớp 3 **thích học Toán** qua tô màu, vẽ, thời trang và mini-game dễ thương — bám sát chương trình Toán lớp 3 sách mới (GDPT 2018).

> Hiện repo đang ở **Bước 1: nghiên cứu, học skill và lập kịch bản**. Code sẽ được làm theo các giai đoạn trong `docs/03-kich-ban-xay-dung.md`.

## Đọc gì trước

| File | Nội dung |
|---|---|
| [docs/01-chuong-trinh-toan-3.md](docs/01-chuong-trinh-toan-3.md) | Phạm vi kiến thức Toán 3, mục lục sách Kết nối tri thức (16 chủ đề), khác biệt Chân trời sáng tạo / Cánh diều, chỗ trẻ hay nhầm |
| [docs/02-tham-khao-website-github.md](docs/02-tham-khao-website-github.md) | 19 website/ứng dụng tương tự, 26 repo GitHub (sao, giấy phép, dùng để làm gì), tài nguyên miễn phí, danh sách skill đã học |
| [docs/03-kich-ban-xay-dung.md](docs/03-kich-ban-xay-dung.md) | Kịch bản sản phẩm (câu chuyện, nhân vật, bản đồ, hành trình cả năm) + 10 giai đoạn thi công kèm câu lệnh dán cho AI + kịch bản thử nghiệm với bé |
| [AGENTS.md](AGENTS.md) | Quy tắc cho AI (Antigravity, Claude Code, Gemini CLI, Codex, Cursor…) |

## Skill cho AI

Thư mục [`.agents/skills/`](.agents/skills) chứa **27 skill** mà AI tự nạp khi làm việc trong repo:

- **7 skill tự viết** từ nghiên cứu: `toan-lop-3`, `giao-dien-de-thuong`, `to-mau-va-ve`, `phong-thoi-trang`, `vong-lap-hoc-va-thuong`, `mini-game-phaser`, `tu-hoc-skill`.
- **20 skill chính thức của Phaser 4** (`phaser-*`), lấy từ repo [phaserjs/phaser](https://github.com/phaserjs/phaser/tree/master/skills) (MIT, xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).

Antigravity, Gemini CLI, Codex, Cursor đọc `.agents/skills/`; Claude Code đọc `.claude/skills/` (là liên kết tới cùng thư mục). Trên Windows, nếu `.claude/skills` hiện ra thành file văn bản thay vì thư mục, bật symlink cho Git (`git config core.symlinks true`, cần Developer Mode) rồi clone lại — Antigravity không bị ảnh hưởng.

## Bắt đầu

1. Mở repo trong Antigravity (hoặc Claude Code).
2. Làm theo **Giai đoạn 0** trong [docs/03-kich-ban-xay-dung.md](docs/03-kich-ban-xay-dung.md).
