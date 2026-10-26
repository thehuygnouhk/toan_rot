---
name: tu-hoc-skill
description: "Dùng skill này khi được yêu cầu học một website hoặc repo GitHub rồi biến kiến thức đó thành skill mới cho dự án, hoặc khi cài thêm bộ skill có sẵn. Gồm quy trình đọc nguồn, rút ra mẫu thiết kế/kỹ thuật, viết SKILL.md đúng chuẩn, kiểm tra giấy phép và an toàn. Kích hoạt khi: học skill, tự học, tạo skill, cài skill, đọc repo, học từ website, SKILL.md, skills add."
---

# Tự học skill từ website và GitHub

Skill là một thư mục `.agents/skills/<ten-skill>/` chứa `SKILL.md` (có YAML frontmatter `name`, `description`). Antigravity, Gemini CLI, Codex, Cursor… đọc thư mục `.agents/skills/`; Claude Code đọc `.claude/skills/` (trong repo này là liên kết tới cùng thư mục). Khi bắt đầu, AI chỉ thấy `name` + `description`; nội dung đầy đủ được nạp khi công việc khớp mô tả — vì vậy **`description` phải nêu rõ khi nào dùng và các từ khoá kích hoạt**.

## Quy trình học một nguồn mới

1. **Xác định mục tiêu**: học nguồn này để làm phần nào của Toán Rốt? (ví dụ "học cách Toy Theater làm đồng hồ kéo kim" → cho mini-game Đồng hồ cung điện).
2. **Kiểm tra giấy phép** trước khi đọc code:
   - MIT / ISC / Apache-2.0 / BSD: được chép code, phải giữ thông báo bản quyền (ghi vào `THIRD_PARTY_NOTICES.md`).
   - GPL / AGPL (ví dụ GCompris): **chỉ học ý tưởng**, không chép code vào dự án.
   - Không có giấy phép hoặc website thương mại (Prodigy, SplashLearn…): chỉ học ý tưởng, cách chơi, cảm giác; không chép hình, âm thanh, chữ.
3. **Đọc có chủ đích**: README → cấu trúc thư mục → 2–3 file lõi của tính năng cần học. Với website: chơi thử, chụp lại luồng màn hình, ghi lại thao tác, phản hồi, phần thưởng.
4. **Rút ra mẫu** thành 3 nhóm: *khái niệm* (vì sao nó hay), *cách làm* (API, thuật toán, cấu trúc dữ liệu), *bẫy* (lỗi hay gặp, giới hạn).
5. **Viết skill** theo mẫu dưới, đặt tên kebab-case không dấu, tối đa ~400 dòng; chi tiết dài đưa vào `references/`.
6. **Thử skill**: yêu cầu AI làm một việc nhỏ dựa trên skill và xem nó có tự nạp đúng không; sửa `description` nếu không kích hoạt.
7. **Ghi nguồn** vào cuối SKILL.md và cập nhật bảng skill trong `AGENTS.md`.

## Mẫu SKILL.md

```markdown
---
name: ten-skill
description: "Dùng skill này khi … Gồm … Kích hoạt khi: từ khoá 1, từ khoá 2, …"
---

# Tiêu đề

## Khi nào dùng
## Khái niệm chính
## Cách làm (code mẫu ngắn, đúng stack của dự án: React + TypeScript + Phaser 4)
## Bẫy thường gặp
## Kiểm tra trước khi xong
## Nguồn
- <link> — giấy phép — học được gì
```

## Cài bộ skill có sẵn (chạy trên máy của bạn)

Lệnh dùng công cụ `skills` (vercel-labs/skills); `-a antigravity` cài vào `.agents/skills/`, thêm `-g` để cài toàn máy (`~/.gemini/antigravity/skills/`):

```bash
# xem skill có trong một repo
npx skills add phaserjs/phaser --list
# cài một skill cụ thể cho Antigravity và Claude Code
npx skills add phaserjs/phaser --skill tilemaps -a antigravity -a claude-code
```

Repo này **đã có sẵn 20 skill Phaser** (đổi tên thêm tiền tố `phaser-`, ví dụ `phaser-particles`), nên chỉ cài thêm những skill chưa có để tránh trùng.

Thư viện lớn `sickn33/antigravity-awesome-skills` có trình cài riêng: `npx agentic-awesome-skills --antigravity --skills <id1,id2> --dry-run` (luôn chọn ít skill, không cài tất cả vì làm nặng ngữ cảnh).

## An toàn khi cài skill của người khác

- **Đọc hết SKILL.md và mọi script đi kèm trước khi dùng.** Skill có thể chứa lệnh shell; không cài skill yêu cầu chạy `curl … | bash`, gửi dữ liệu ra ngoài, hay đọc file bí mật.
- Ưu tiên skill từ nguồn chính thức (ví dụ thư mục `skills/` trong repo `phaserjs/phaser`).
- Ít mà đúng: mỗi skill thêm vào đều chiếm ngữ cảnh khi AI khởi động.
