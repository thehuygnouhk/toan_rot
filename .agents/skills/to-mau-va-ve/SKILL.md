---
name: to-mau-va-ve
description: "Dùng skill này khi làm Xưởng Tô Màu: tô màu theo phép tính (color-by-number), tô màu tự do, vẽ tay, dán sticker, lưu tranh vào bộ sưu tập. Gồm định dạng tranh SVG theo vùng, cách ghép câu hỏi toán với màu, thuật toán tô loang (flood fill) cho tranh ảnh bitmap, nét vẽ mượt bằng perfect-freehand và xuất ảnh PNG. Kích hoạt khi: tô màu, coloring, color by number, vẽ, drawing, canvas, brush, sticker, flood fill, gallery, bộ sưu tập tranh."
---

# Xưởng Tô Màu — tô màu theo phép tính và vẽ tự do

Đây là "trái tim" của trang web vì bé thích tô màu nhất. Ý tưởng lấy từ phiếu **"color by number / mystery picture"** mà giáo viên tiểu học hay dùng: giải phép tính → kết quả cho biết vùng đó tô màu gì → bức tranh dễ thương hiện ra dần.

## Ba chế độ

1. **Tô màu bí mật (theo phép tính)** — mỗi vùng của tranh có một phép tính; bảng màu là "kết quả → màu". Bé chọn vùng, giải, đúng thì vùng tự tô màu với hiệu ứng loang. Hoàn thành → tranh được "thổi hồn" (nhân vật chớp mắt, lấp lánh) và vào **bộ sưu tập**.
2. **Tô màu tự do** — tranh nét đã mở khoá, bé tô màu bất kỳ. Đây là phần thưởng, không có câu hỏi.
3. **Vẽ tự do + sticker** — bảng vẽ trắng, bút nhiều cỡ, sticker mua bằng cà rốt, lưu vào bộ sưu tập.

## Định dạng tranh (ưu tiên SVG theo vùng)

Mỗi vùng tô là một `<path>` khép kín có `id` riêng, nên **không cần flood fill**: tô màu = đổi `fill` của path.

```jsonc
// public/tranh/meo-cong-chua.json
{
  "id": "meo-cong-chua",
  "ten": "Mèo công chúa",
  "svg": "/tranh/meo-cong-chua.svg",  // nét đen ở lớp trên cùng, vùng tô ở lớp dưới
  "vung": [
    { "pathId": "vay", "mauDung": "hong" },
    { "pathId": "vuong-mien", "mauDung": "vang" },
    { "pathId": "no", "mauDung": "tim" }
    // ...
  ],
  "bangMau": { "hong": "#FF7EB6", "vang": "#FFD84D", "tim": "#B388FF", "xanh": "#7FD6C2" }
}
```

- Khi chơi, code **gán ngẫu nhiên một kết quả số cho mỗi màu** trong bảng màu (ví dụ hồng = 24, vàng = 35, tím = 42), rồi sinh cho mỗi vùng một phép tính có kết quả đúng bằng số của màu đó, lấy từ chủ đề bé đang học (dùng skill `toan-lop-3`). Vì vậy cùng một tranh có thể dùng lại cho mọi chủ đề.
- Lớp nét (outline) đặt `pointer-events: none` để chạm vào trúng vùng bên dưới.
- Vùng nhỏ (< 40px) phải gộp hoặc cho phép phóng to; trên máy tính bảng ngón tay rất khó trúng vùng nhỏ.
- Hiệu ứng tô: dùng `clipPath` theo vùng + một hình tròn lớn dần từ điểm chạm (tạo cảm giác "loang màu").
- Hỗ trợ trẻ mù màu: bảng màu luôn ghi **cả số và tên màu**, vùng chưa tô hiện số nhỏ khi bé chọn chế độ "nhìn số".

## Nguồn tranh nét

- Tự vẽ bằng công cụ vector (Inkscape, Figma) hoặc nhờ AI tạo tranh nét **đơn giản, nét dày, ít vùng (15–40 vùng)**, rồi tách vùng thành path.
- Có thể chuyển ảnh màu thành tranh tô theo số bằng thuật toán kiểu **paint-by-numbers generator** (k-means gom màu → tách vùng → xuất SVG). Repo tham khảo: `drake7707/paintbynumbersgenerator` (kiểm tra giấy phép trước khi chép code).
- Chỉ dùng hình có giấy phép cho phép (tự vẽ, CC0, hoặc của chính gia đình). Ghi nguồn vào `public/tranh/NGUON.md`.

## Tô loang cho tranh bitmap (khi không có SVG theo vùng)

Dùng **scanline flood fill** trên `ImageData` của `<canvas>`:

- Ngưỡng sai khác màu (tolerance) khoảng 32/255 để tô qua viền khử răng cưa.
- Coi pixel tối (độ sáng < 80) là "tường" để màu không tràn qua nét.
- Chạy trong `requestAnimationFrame` theo từng lô dòng để không đứng hình trên máy yếu.
- Lưu lịch sử bằng mảng snapshot `ImageData` (tối đa 20 bước) để có **Hoàn tác**.

## Vẽ tay mượt

- Dùng thư viện `perfect-freehand` (MIT): nhận các điểm từ Pointer Events (có áp lực bút nếu thiết bị hỗ trợ) → trả về đường viền nét vẽ đẹp, render bằng SVG `<path>` hoặc `Path2D` trên canvas.
- Bút: bút chì, bút sáp, bút lông, bút kim tuyến (thêm hạt lấp lánh), tẩy. Cỡ nét: 3 nút to (nhỏ / vừa / to), không dùng thanh trượt nhỏ.
- `touch-action: none` trên vùng vẽ để không bị cuộn trang khi vẽ.
- Sticker: ảnh SVG kéo thả, xoay, phóng to bằng 2 ngón; có thể dùng `fabric.js` hoặc `konva` nếu cần thao tác đối tượng phức tạp.

## Lưu tranh

- Xuất PNG bằng `canvas.toBlob()` (SVG → vẽ lên canvas trước), lưu vào **IndexedDB** (thư viện `idb-keyval` hoặc `Dexie`) kèm ngày, tên tranh.
- Trang **Bộ sưu tập** dạng lưới ảnh to; phụ huynh có nút tải về / in.
- Tranh có thể **in lên áo** trong Phòng Thời Trang (dùng PNG làm hoạ tiết vải) — nối hai khu vực với nhau để bé thấy tranh mình vẽ "có ích".

## Kiểm tra trước khi xong

- [ ] Chạm trúng vùng trên máy tính bảng 8–10 inch.
- [ ] Mỗi vùng có đúng một phép tính trong phạm vi chủ đề đang học.
- [ ] Sai không làm hỏng tranh (vùng không bị tô sai màu vĩnh viễn).
- [ ] Hoàn tác / làm lại hoạt động khi vẽ tự do.
- [ ] Tải lại trang vẫn còn tranh trong bộ sưu tập.
