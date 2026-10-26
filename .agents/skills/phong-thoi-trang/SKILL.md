---
name: phong-thoi-trang
description: "Dùng skill này khi làm Phòng Thời Trang và Cửa hàng: nhân vật thay đồ (dress-up) bằng SVG nhiều lớp, tủ đồ, đổi màu trang phục, cửa hàng bán quần áo/phụ kiện bằng cà rốt và bằng tiền Việt Nam giả lập để luyện toán (trả tiền, tiền thừa), tiệm may đo để luyện chu vi, diện tích. Kích hoạt khi: dress-up, thay đồ, avatar, nhân vật, tủ đồ, wardrobe, cửa hàng, shop, tiền Việt Nam, may đo, chu vi, diện tích, trình diễn thời trang."
---

# Phòng Thời Trang — thay đồ, mua sắm và may đo bằng toán

Bé đóng vai **nhà thiết kế thời trang nhí**. Toán là công cụ để điều hành tiệm: tính tiền, đo vải, viền ren, chuẩn bị buổi trình diễn. Phần thưởng hấp dẫn nhất là **quần áo, phụ kiện mới** cho nhân vật của bé.

## Nhân vật nhiều lớp (SVG)

Nhân vật là các lớp SVG xếp chồng theo thứ tự cố định, cùng khung `viewBox` (ví dụ `0 0 400 600`), nên chỉ cần thay file của từng lớp:

| z | Lớp | Ghi chú |
|---|---|---|
| 0 | `nen` | phông nền phòng / sàn diễn |
| 1 | `toc-sau` | phần tóc phía sau người |
| 2 | `co-the` | dáng người, màu da (nhiều tông) |
| 3 | `giay` | |
| 4 | `quan-vay` | |
| 5 | `ao` | |
| 6 | `ao-khoac` | |
| 7 | `mat` | mắt, má hồng, miệng (vài biểu cảm: cười, ngạc nhiên, nghĩ) |
| 8 | `toc-truoc` | mái, tóc mái |
| 9 | `phu-kien` | nơ, vương miện, kính, túi |

- Mỗi món đồ: `{ id, lop, ten, gia, svg, doiMau: boolean }`. Món `doiMau` dùng `fill="var(--mau-chinh)"` trong SVG để đổi màu bằng CSS mà không cần vẽ lại.
- Hoạ tiết vải có thể là **tranh bé tự vẽ** ở Xưởng Tô Màu (dùng `<pattern>` với ảnh PNG).
- Biểu cảm mặt đổi theo kết quả học (vui khi đúng, nghĩ khi đang làm) để nhân vật "sống".
- Cách nhanh để có nhân vật: thư viện **DiceBear** (code MIT; mỗi style có giấy phép riêng — chọn style cho phép dùng và ghi công). Muốn đẹp và "của riêng" hơn thì tự vẽ bộ lớp SVG theo bảng trên.

## Kinh tế trong game

- Tiền trong game là **cà rốt 🥕** — kiếm bằng cách làm bài (đúng lần đầu nhiều hơn, nhưng sai rồi sửa vẫn được thưởng để khuyến khích kiên trì).
- Giá đồ để **luyện toán**: giá ghi bằng số tròn chục/tròn trăm; khi bé đã học CD11–CD13, cửa hàng chuyển sang **tiền Việt Nam giả lập** (tờ 1 000 → 100 000 đồng), giá ≤ 100 000 đồng.
- Mua hàng là một bài toán thật:
  - "Chọn các tờ tiền để trả đúng 35 000 đồng" (kéo tờ tiền vào khay).
  - "Váy giá 48 000 đồng, con đưa 50 000 đồng. Cô bán hàng trả lại bao nhiêu?"
  - "Mua 3 chiếc nơ, mỗi chiếc 6 000 đồng…" (bài toán 2 bước).
- Không bao giờ dùng tiền thật, không có nút nạp tiền.

## Tiệm May Đo (hình học và đo lường)

| Hoạt động | Kiến thức (chủ đề) |
|---|---|
| Đo dải ruy băng bằng thước ảo có vạch mm, cm | mm, cm (CD05) |
| Viền ren quanh khăn / váy hình chữ nhật, hình vuông: cần bao nhiêu cm ren? | chu vi (CD09) |
| Cắt mảnh vải phủ ô vuông 1 cm²: tấm vải này bao nhiêu cm²? | diện tích (CD09) |
| Đặt hạt cườm ở **trung điểm** dải ruy băng; cắt khăn có **góc vuông** bằng ê ke | trung điểm, góc vuông (CD03) |
| Vẽ hoạ tiết tròn bằng **compa ảo** (kéo tâm, kéo bán kính) | hình tròn, tâm, bán kính, đường kính (CD03) |
| Đóng gói quà vào **hộp lập phương / hộp chữ nhật** | khối lập phương, khối hộp chữ nhật (CD03) |
| Chia đều 1/4 cuộn vải cho 4 bạn | một phần mấy (CD02) |

Kéo-thả và đo trực tiếp trên hình (ô lưới 1 cm hiển thị to) giúp bé **thấy** chu vi là "đường viền", diện tích là "phần vải bên trong" — đây là chỗ trẻ hay nhầm nhất.

## Buổi trình diễn thời trang (ôn tập)

- Cuối mỗi học kì (CD07, CD16) mở **Sàn diễn**: một chuỗi 8–10 câu ôn tập, mỗi câu đúng thì người mẫu bước thêm một bước trên sàn, cuối cùng chụp ảnh "poster" có nhân vật của bé và lưu vào bộ sưu tập.
- Có thể làm sàn diễn bằng 2.5D (sàn nghiêng, đèn spotlight) trong Phaser hoặc CSS 3D transform.

## Kiểm tra trước khi xong

- [ ] Các lớp SVG thẳng hàng ở mọi kích thước màn hình.
- [ ] Đồ đã mua lưu lại sau khi tải lại trang.
- [ ] Phép tính tiền đúng đơn vị, không ra số âm, dùng đúng mệnh giá tiền Việt Nam.
- [ ] Bài chu vi / diện tích có hình minh hoạ với lưới ô vuông.
