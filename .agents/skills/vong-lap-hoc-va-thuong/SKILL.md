---
name: vong-lap-hoc-va-thuong
description: "Dùng skill này khi thiết kế luồng học, hệ thống điểm thưởng, độ khó thích ứng, ôn tập ngắt quãng, gợi ý, chuỗi ngày học, nhiệm vụ hằng ngày, giới hạn thời gian chơi và trang phụ huynh. Kích hoạt khi: tiến độ, progress, mastery, độ khó, adaptive, spaced repetition, FSRS, ôn tập, phần thưởng, cà rốt, sticker, streak, nhiệm vụ, phụ huynh, báo cáo, thời gian chơi."
---

# Vòng lặp học — thưởng

Mục tiêu: mỗi buổi **15–20 phút**, bé học đúng thứ cần học, thấy mình tiến bộ và muốn quay lại ngày mai. Không gây nghiện, không gây áp lực.

## Một buổi học mẫu (15 phút)

1. **Chào** (30 giây): Thỏ Rốt chào, nhắc phần thưởng đang chờ ("Hôm nay may xong chiếc váy hoa nhé!").
2. **Khởi động** (2–3 phút): 5 câu ôn nhanh từ hàng đợi ôn tập (bảng nhân, chia… đến hạn).
3. **Bài chính** (8–10 phút): một khu vực theo chủ đề đang học — học qua hình ảnh → làm 6–10 câu → một mini-game.
4. **Phần thưởng** (2–3 phút): nhận cà rốt / sticker, tô màu hoặc thay đồ.
5. **Chào tạm biệt**: tóm tắt "Hôm nay con đã…", hẹn mai. Hết giờ phụ huynh đặt → khoá nhẹ nhàng ("Thỏ Rốt đi ngủ rồi").

## Mô hình kỹ năng

- Mỗi `skillId` (ví dụ `bang-nhan-7`, `chu-vi-hcn`, `xem-dong-ho-phut`) có điểm thành thạo `0–100` và trạng thái: `chua-hoc → dang-hoc → thanh-thao`.
- Đúng lần đầu +10, đúng sau gợi ý +4, sai −3 (không thấp hơn 0). Thành thạo khi ≥ 80 **và** đúng ở ít nhất 2 ngày khác nhau.
- Chọn câu tiếp theo: 70% kỹ năng đang học, 20% ôn tập đến hạn, 10% kỹ năng đã thành thạo (giữ tự tin).
- Độ khó trong kỹ năng: đúng 3 câu liền → tăng; sai 2 câu liền → giảm và quay về hình minh hoạ.

## Ôn tập ngắt quãng

- Dùng thư viện **`ts-fsrs`** (MIT) cho các "thẻ sự kiện" học thuộc: từng phép tính trong bảng nhân/chia 2–9, đổi đơn vị, số La Mã I–XX.
- Đánh giá tự động: đúng nhanh → `Easy`, đúng → `Good`, đúng sau gợi ý → `Hard`, sai → `Again`.
- Kỹ năng giải toán (chu vi, bài toán 2 bước…) không dùng thẻ mà dùng mô hình kỹ năng ở trên.

## Gợi ý 3 bậc

1. **Nhắc nhẹ**: một câu hỏi gợi mở ("Mỗi hộp có 7 nơ, có mấy hộp nhỉ?").
2. **Hình minh hoạ**: nhóm đồ vật, tia số, lưới ô vuông, đồng hồ có kim chuyển động.
3. **Lời giải mẫu** cho một câu tương tự, rồi bé làm lại câu gốc.

Phản hồi sai nên nhắm vào **lỗi cụ thể** (dùng trường `why` của đáp án nhiễu trong skill `toan-lop-3`): chọn 7 + 6 = 13 cho câu "6 hộp, mỗi hộp 7 nơ" → "À, mình có 6 nhóm bằng nhau, nên dùng phép nhân nhé!".

## Phần thưởng

| Phần thưởng | Kiếm bằng | Dùng để |
|---|---|---|
| 🥕 Cà rốt | mỗi câu đúng, hoàn thành màn | mua đồ, sticker, bút vẽ |
| ⭐ Sao | hoàn thành màn (1–3 sao theo số gợi ý đã dùng) | mở khoá khu vực mới trên bản đồ |
| 🎀 Sticker | thành thạo một kỹ năng | dán vào **sổ sticker** (bộ sưu tập theo chủ đề) |
| 🖼️ Tranh | hoàn thành tranh tô màu bí mật | bộ sưu tập, in lên áo |
| 👗 Đồ đặc biệt | xong chủ đề / sàn diễn cuối kì | chỉ có được bằng học, không mua được |

- **Chuỗi ngày học** hiển thị bằng một khu vườn: mỗi ngày học nở một bông hoa. Bỏ một ngày **không** làm héo vườn (tránh tâm lý sợ mất).
- **Nhiệm vụ hằng ngày**: 3 nhiệm vụ nhỏ, đổi mới mỗi ngày, luôn có 1 nhiệm vụ "sáng tạo" (vẽ, thay đồ).

## Lưu trữ

- Toàn bộ tiến độ lưu ở máy bằng IndexedDB (Dexie hoặc idb-keyval) + nút **Xuất / Nhập file sao lưu** (JSON) trong trang phụ huynh.
- Dữ liệu tối thiểu: hồ sơ (tên gọi, nhân vật), kỹ năng, thẻ FSRS, kho đồ, cà rốt, tranh, nhật ký buổi học (ngày, phút, số câu, đúng/sai theo kỹ năng).

## Trang phụ huynh

- Vào bằng **cổng phụ huynh** (ví dụ giữ nút 3 giây hoặc trả lời phép tính lớp người lớn), không dùng mật khẩu phức tạp.
- Hiển thị: thời gian học mỗi ngày, kỹ năng đã thành thạo / đang khó, bản đồ chủ đề theo sách, gợi ý "nên ôn gì".
- Cài đặt: bộ sách đang học (Kết nối tri thức / Chân trời sáng tạo / Cánh diều), chủ đề hiện tại trên lớp, giới hạn phút mỗi ngày, bật/tắt chế độ tốc độ, âm thanh, giọng đọc.

## Kiểm tra trước khi xong

- [ ] Một buổi học tự kết thúc sau giới hạn phút phụ huynh đặt.
- [ ] Không mất tiến độ khi tải lại trang hoặc mất mạng.
- [ ] Câu sai được hỏi lại (biến thể khác) trong cùng buổi hoặc buổi sau.
- [ ] Không có cơ chế phạt mất đồ / mất cà rốt.
