---
name: mini-game-phaser
description: "Dùng skill này khi làm mini-game 2D / 2.5D bằng Phaser 4 trong ứng dụng React, bản đồ thị trấn 2.5D, hoặc phòng 3D tuỳ chọn bằng React Three Fiber. Gồm cách nhúng Phaser vào React, truyền câu hỏi và kết quả qua EventBus, danh mục mini-game theo chủ đề Toán 3, và quy tắc hiệu năng cho máy tính bảng. Kích hoạt khi: mini-game, game 2D, 2.5D, isometric, bản đồ, Phaser, scene, hứng kẹo, bóng bay, lật thẻ, 3D, three.js, react-three-fiber."
---

# Mini-game bằng Phaser 4 (và 2.5D / 3D)

Các skill `phaser-*` trong thư mục này là tài liệu chính thức của Phaser 4 (cài từ repo `phaserjs/phaser`, giấy phép MIT). Skill này nói cách **dùng Phaser trong dự án Toán Rốt**.

## Kiến trúc

- **React** lo giao diện, điều hướng, lưu trữ; **Phaser** chỉ lo phần chơi bên trong một khung `<div>`.
- Một component `<PhaserGame sceneKey="HungKeo" config={...} onFinish={...} />` tạo `new Phaser.Game(...)` khi mount và **gọi `game.destroy(true)` khi unmount** (tránh rò bộ nhớ khi bé chuyển màn liên tục).
- Giao tiếp hai chiều bằng một `EventBus` (`new Phaser.Events.EventEmitter()` export từ một file riêng):
  - React → Phaser: `EventBus.emit('cau-hoi', question)`.
  - Phaser → React: `EventBus.emit('tra-loi', { questionId, value, timeMs })`, `EventBus.emit('xong-man', { dung, sai, sao })`.
- **Phaser không tự sinh câu hỏi và không tự chấm điểm.** Câu hỏi đến từ question engine (skill `toan-lop-3`), chấm điểm và thưởng ở tầng React (skill `vong-lap-hoc-va-thuong`). Nhờ vậy mọi mini-game dùng chung một ngân hàng câu hỏi.
- Cấu hình chung: `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`, kích thước logic 1280×720, `input.activePointers = 2` cho thao tác 2 ngón. Xem `phaser-game-setup-and-config`, `phaser-scale-and-responsive`.
- Chữ tiếng Việt: dùng Text với font web đã tải xong trước khi `create()` (dùng `document.fonts.load(...)`), hoặc BitmapText tạo từ font có đủ dấu tiếng Việt. Xem `phaser-text-and-bitmaptext`.

## Danh mục mini-game theo chủ đề

| Mini-game | Cách chơi | Chủ đề phù hợp | Skill Phaser cần |
|---|---|---|---|
| **Hứng kẹo** | Kẹo mang số rơi xuống, kéo giỏ hứng kẹo có kết quả đúng | bảng nhân/chia, tính nhẩm (CD01, CD02) | physics-arcade, input, tweens |
| **Bóng bay** | Chạm vỡ bóng thoả điều kiện ("số chia hết cho 6", "số lớn hơn 4 500") | bảng nhân, so sánh số (CD02, CD08, CD11) | tweens, particles, input |
| **Lật thẻ ghép đôi** | Lật 2 thẻ: phép tính ↔ kết quả, số La Mã ↔ số, đồng hồ ↔ giờ | CD02, CD08, CD13 | tweens, input |
| **Thỏ nhảy tia số** | Thỏ nhảy về "cà rốt tròn chục/tròn trăm" gần nhất | làm tròn số (CD08, CD11) | tweens, graphics-and-shapes |
| **Tiệm bánh xếp hộp** | Kéo bánh vào các hộp chia đều, bánh thừa là số dư | chia hết, chia có dư, một phần mấy (CD02, CD04) | input (drag), groups-and-containers |
| **Đồng hồ cung điện** | Xoay kim đến giờ hẹn của buổi tiệc | xem đồng hồ (CD13) | input (drag), graphics-and-shapes |
| **Cân đĩa nhà bếp** | Thả quả cân để cân bằng bột, bơ | gam, ki-lô-gam (CD05) | tweens, physics nhẹ |
| **Túi mù dễ thương** | Dự đoán "chắc chắn / có thể / không thể" rồi mở túi | khả năng xảy ra (CD15) | particles, tweens |
| **Khảo sát màu yêu thích** | Hỏi các bạn thú, gạch vạch, lập bảng số liệu | thống kê (CD15) | text, input |
| **Sàn diễn thời trang** | Mỗi câu đúng người mẫu bước tiếp, cuối cùng chụp poster | ôn tập (CD07, CD16) | cameras, tweens, render-textures |

Mỗi mini-game: 1 phút đến 3 phút, 6–10 câu, có nút tạm dừng, **không thua cuộc** (hết câu là xong, chỉ khác số sao).

## Bản đồ thị trấn 2.5D

- Cách đơn giản và đẹp nhất: một **bức tranh bản đồ isometric vẽ sẵn** (hoặc ghép từ asset isometric CC0 của Kenney) + các toà nhà là sprite riêng có thể chạm, đặt trong Phaser với camera kéo/phóng to. Xem `phaser-cameras`, `phaser-sprites-and-images`.
- Chiều sâu: sắp xếp `depth = y` để nhân vật đi sau/trước toà nhà đúng; thêm mây trôi (parallax) và hoạt ảnh nhỏ (khói bếp, cờ bay) để có cảm giác "sống".
- Khu chưa mở khoá: phủ màu xám + ổ khoá, hiện số sao cần có.

## Phòng 3D (tuỳ chọn, làm sau cùng)

- Dùng **React Three Fiber** + `@react-three/drei`, mô hình low-poly CC0 (Kenney Furniture Kit, Quaternius). Bé đặt đồ nội thất mua bằng cà rốt, xoay phòng bằng một ngón.
- Hiệu năng: `frameloop="demand"`, giới hạn `dpr={[1, 1.5]}`, tổng số tam giác < 50k, texture ≤ 1024px, nén GLB bằng Draco/meshopt.
- Luôn có **phương án 2D** nếu máy không hỗ trợ WebGL hoặc quá chậm.

## Hiệu năng trên máy tính bảng

- Ảnh: dùng atlas (TexturePacker hoặc free-tex-packer), ảnh ≤ 2048px, định dạng WebP/PNG.
- Âm thanh: tải trước những tiếng ngắn; nhạc nền dạng stream, mặc định tắt.
- Khi tab bị ẩn: nghe `game.events.on('hidden')` để tạm dừng mini-game và đồng hồ đếm (âm thanh Phaser tự dừng nhờ `pauseOnBlur`). Xem `phaser-game-setup-and-config`.
- Mục tiêu: 60 fps trên máy tính bảng tầm trung; tải mỗi mini-game < 2 MB.

## Kiểm tra trước khi xong

- [ ] Rời mini-game rồi vào lại 10 lần không tăng bộ nhớ (kiểm tra bằng DevTools).
- [ ] Câu hỏi đến từ question engine, không viết cứng trong scene.
- [ ] Chơi được hoàn toàn bằng chạm.
- [ ] Không có trạng thái "thua", luôn kết thúc bằng phần thưởng.
