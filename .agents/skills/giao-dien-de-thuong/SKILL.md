---
name: giao-dien-de-thuong
description: "Dùng skill này khi thiết kế hoặc code bất kỳ màn hình, nút, hiệu ứng, âm thanh, lời khen hay phản hồi nào cho trẻ 8 tuổi (bé gái lớp 3) trong dự án. Gồm bảng màu pastel, font tiếng Việt, kích thước chạm, đọc to bằng giọng Việt, nguyên tắc phản hồi khi sai, hoạt ảnh dễ thương và các điều cấm (quảng cáo, đồng hồ đếm ngược gây áp lực…). Kích hoạt khi: UI, giao diện, CSS, Tailwind, daisyUI, theme, nút bấm, animation, confetti, âm thanh, feedback, màn hình, component."
---

# Giao diện dễ thương cho bé gái lớp 3

Người dùng là **một bé gái 8 tuổi**, thích tô màu, vẽ, thời trang và những thứ dễ thương. Bé đọc được nhưng còn chậm; bé dùng máy tính bảng hoặc laptop của gia đình. Mục tiêu của giao diện: **bé muốn quay lại mỗi ngày, không sợ sai.**

## Phong cách

- **Pastel, tròn, mềm**: góc bo lớn (16–28px), bóng đổ mềm, viền dày 2–3px màu đậm hơn nền một chút (kiểu sticker).
- **Bảng màu gợi ý** (khai báo thành CSS variables / theme daisyUI tuỳ biến dựa trên `cupcake` hoặc `valentine`):

| Token | Màu | Dùng cho |
|---|---|---|
| `--hong-sua` | `#FFD6E7` | nền chính |
| `--hong-dam` | `#FF7EB6` | nút chính, điểm nhấn |
| `--tim-lavender` | `#CDB4FF` | thẻ, khung |
| `--xanh-bac-ha` | `#B8F2E6` | đúng / thành công |
| `--vang-bo` | `#FFE8A3` | phần thưởng, sao |
| `--cam-ca-rot` | `#FFAD5A` | cà rốt (tiền trong game) |
| `--chu` | `#4A3B5C` | chữ (tím than, không dùng đen tuyền) |

  Kiểm tra độ tương phản chữ ≥ 4.5:1. **Không dùng màu đỏ để báo sai** — dùng tím nhạt + biểu cảm nhân vật.
- **Font hỗ trợ tiếng Việt** (Google Fonts): tiêu đề `Baloo 2`, nội dung `Nunito` hoặc `Quicksand`. Chữ nội dung ≥ 20px, đề toán ≥ 24px, con số trong phép tính ≥ 32px.
- **Biểu tượng**: Microsoft Fluent Emoji 3D (MIT) hoặc hình SVG tự vẽ; nhân vật linh vật là **Thỏ Rốt** (thỏ hồng cầm cà rốt).

## Kích thước và thao tác

- Vùng chạm tối thiểu **56×56px**, khoảng cách giữa các nút ≥ 12px. Đáp án trắc nghiệm là thẻ to, tối đa 4 lựa chọn.
- Ưu tiên **chạm / kéo-thả** hơn gõ phím. Khi cần nhập số, hiện **bàn phím số ảo to** (0–9, xoá, xong) thay cho bàn phím hệ điều hành.
- Mỗi màn hình **một nhiệm vụ chính**; luôn có nút 🏠 về nhà và 🔊 nghe lại đề ở cùng một vị trí.
- Hỗ trợ cả dọc và ngang trên máy tính bảng; không cuộn ngang.

## Đọc to bằng giọng Việt

- Mọi đề bài, lời nhắn của nhân vật đều có nút 🔊, dùng `speechSynthesis` với giọng `vi-VN` (chọn giọng có `lang` bắt đầu bằng `vi`; nếu máy không có giọng Việt thì ẩn nút và ghi nhận trong trang phụ huynh).
- Tốc độ đọc `rate ≈ 0.9`. Đọc số theo kiểu Việt ("mười nghìn", "hai mươi lăm nghìn đồng"); với công thức, truyền chuỗi `speak` riêng đã viết thành chữ.

## Phản hồi khi đúng / sai

- **Đúng**: hiệu ứng nhỏ (sao lấp lánh, tiếng "ting"), +cà rốt. Mỗi 5 câu đúng hoặc khi xong màn: **confetti** (`canvas-confetti`) + nhân vật nhảy.
- **Sai**: không "X" đỏ, không tiếng còi, không trừ điểm. Thỏ Rốt nghiêng đầu: "Gần đúng rồi! Mình thử lại nhé?" và **mở gợi ý bậc 1**. Sai lần 2 → gợi ý bậc 2 (hình minh hoạ từng bước). Sai lần 3 → xem lời giải mẫu rồi làm một câu tương tự.
- **Khen nỗ lực, không khen "thông minh"**: "Con kiên trì quá!", "Con đã tự sửa được lỗi!".
- Không có bảng xếp hạng so sánh với người khác; chỉ so với chính mình hôm qua.

## Hoạt ảnh

- Thời lượng 150–400ms, easing mềm (`ease-out`, `back.out` cho nảy nhẹ). Nút khi nhấn: co lại 0.95 rồi nảy về.
- Tôn trọng `prefers-reduced-motion`: tắt rung/lắc, giữ chuyển cảnh đơn giản.
- Âm thanh (Howler.js): tiếng nhỏ, dễ chịu; có nút tắt tiếng và nhạc nền tách riêng; mặc định nhạc nền tắt.

## Điều cấm

- Không quảng cáo, không link ra ngoài trong khu vực của bé, không mua bán bằng tiền thật.
- Không thu thập dữ liệu cá nhân, không đăng nhập bằng mạng xã hội. Tiến độ lưu ở máy (IndexedDB).
- Không đồng hồ đếm ngược ở chế độ học. Chế độ "thử thách tốc độ" là tuỳ chọn, bé tự bật.
- Không phần thưởng ngẫu nhiên kiểu cờ bạc gắn với tiền thật. "Túi mù" chỉ dùng cà rốt kiếm được trong game và để dạy khả năng xảy ra.
- Không màn hình tối om, hình đáng sợ, nhân vật buồn bã quá mức.

## Kiểm tra trước khi xong

- [ ] Xem ở bề rộng 768px (máy tính bảng dọc) và 1280px.
- [ ] Mọi nút ≥ 56px, chữ đề ≥ 24px.
- [ ] Có 🔊 cho đề bài; đọc đúng tiếng Việt.
- [ ] Trả lời sai không có màu đỏ / âm thanh gây sợ.
- [ ] Bật `prefers-reduced-motion` vẫn dùng được.
