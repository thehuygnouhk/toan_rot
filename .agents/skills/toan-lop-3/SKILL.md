---
name: toan-lop-3
description: "Dùng skill này khi tạo câu hỏi, bài tập, màn chơi, lời giải hay nội dung học cho môn Toán lớp 3 (chương trình GDPT 2018, sách Kết nối tri thức / Chân trời sáng tạo / Cánh diều). Bao gồm phạm vi số theo từng chủ đề, dạng bài, cách viết đề tiếng Việt, cách tạo đáp án nhiễu từ lỗi sai thường gặp và kiểm tra câu hỏi đúng chương trình. Kích hoạt khi: câu hỏi toán, ngân hàng câu hỏi, question generator, bài toán có lời văn, bảng nhân, bảng chia, chu vi, diện tích, tiền Việt Nam, đồng hồ, thống kê, xác suất."
---

# Toán lớp 3 — phạm vi kiến thức và cách ra đề

> Bản đầy đủ (kèm từng bài trong sách) nằm ở `docs/01-chuong-trinh-toan-3.md`. Skill này là phần rút gọn để AI tra nhanh khi viết code hoặc nội dung.

## Nguyên tắc vàng

1. **Không ra đề vượt chương trình.** Mọi con số, phép tính phải nằm trong phạm vi của chủ đề mà bé đang học (bảng dưới). Chủ đề chưa học thì không xuất hiện.
2. **Đề viết bằng tiếng Việt có dấu, câu ngắn** (≤ 25 từ mỗi câu), dùng từ ngữ sách giáo khoa: "số bị chia", "thương", "gấp lên … lần", "giảm đi … lần", "chu vi", "diện tích", "xăng-ti-mét vuông (cm²)", "mi-li-mét (mm)", "gam (g)", "mi-li-lít (ml)", "độ C (°C)".
3. **Số viết theo kiểu Việt Nam:** tách lớp nghìn bằng dấu cách (`10 000`, `45 650`), tiền ghi `đồng` (`20 000 đồng`).
4. **Ngữ cảnh dễ thương**: thời trang, may váy, tiệm bánh, thú cưng, hoa, sticker, tiệc sinh nhật. Nhân vật dùng tên Việt (Mai, Lan, Na, Bống, Thỏ Rốt…).
5. **Mỗi câu hỏi phải có**: đáp án đúng, 3 đáp án nhiễu có lý do, 1–3 bậc gợi ý, lời giải mẫu ngắn.
6. **Kiểm tra tự động**: mỗi bộ sinh câu hỏi phải có unit test khẳng định đáp án đúng, các số nằm trong phạm vi, đáp án nhiễu không trùng đáp án đúng và không âm.

## Bản đồ chủ đề (theo thứ tự sách Kết nối tri thức)

| ID | Chủ đề (HK) | Nội dung chính | Phạm vi số / giới hạn |
|---|---|---|---|
| CD01 | Ôn tập và bổ sung (HK1) | Số đến 1 000; cộng, trừ trong 1 000; tìm thành phần phép cộng, trừ; bảng nhân/chia 2, 3, 4, 5 | ≤ 1 000 |
| CD02 | Bảng nhân, bảng chia (HK1) | Bảng nhân/chia 6, 7, 8, 9; tìm thành phần phép nhân, chia; **một phần mấy** (1/2 … 1/9) | thừa số 2–9; thương ≤ 10 |
| CD03 | Hình phẳng, hình khối (HK1) | Điểm ở giữa, trung điểm; hình tròn (tâm, bán kính, đường kính); góc vuông / không vuông; tam giác, tứ giác, HCN, hình vuông; vẽ trang trí; khối lập phương, khối hộp chữ nhật | không có tính toán lớn |
| CD04 | Nhân, chia trong 100 (HK1) | Số có 2 chữ số × số có 1 chữ số; gấp lên … lần; chia hết, chia có dư; số có 2 chữ số : số có 1 chữ số; giảm đi … lần; bài toán 2 bước | ≤ 100 |
| CD05 | Đơn vị đo (HK1) | mm, g, ml, °C; đổi m–dm–cm–mm, kg–g, l–ml | số đo đơn giản |
| CD06 | Nhân, chia trong 1 000 (HK1) | Số có 3 chữ số × / : số có 1 chữ số; biểu thức số (≤ 2 dấu phép tính, có/không có ngoặc); số lớn gấp mấy lần số bé | ≤ 1 000 |
| CD07 | Ôn tập học kì 1 | Tổng hợp CD01–CD06 | — |
| CD08 | Các số đến 10 000 (HK2) | Số có 4 chữ số; so sánh; **chữ số La Mã** (I–XX); làm tròn đến hàng chục, hàng trăm | ≤ 10 000 |
| CD09 | Chu vi, diện tích (HK2) | Chu vi tam giác, tứ giác, HCN, hình vuông; diện tích, cm²; diện tích HCN, hình vuông | cạnh nguyên, cm |
| CD10 | + − × : trong 10 000 (HK2) | Cộng, trừ; số có 4 chữ số × / : số có 1 chữ số | ≤ 10 000 |
| CD11 | Các số đến 100 000 (HK2) | Số có 5 chữ số; so sánh; làm tròn đến hàng nghìn, hàng chục nghìn | ≤ 100 000 |
| CD12 | + − trong 100 000 (HK2) | Cộng, trừ số có đến 5 chữ số | ≤ 100 000 |
| CD13 | Đồng hồ, tháng–năm, tiền (HK2) | Xem đồng hồ chính xác đến từng phút; tháng, năm, số ngày trong tháng; tiền Việt Nam | tiền ≤ 100 000 đồng |
| CD14 | × : trong 100 000 (HK2) | Số có 5 chữ số × / : số có 1 chữ số | ≤ 100 000 |
| CD15 | Thống kê, xác suất (HK2) | Thu thập, phân loại, ghi chép số liệu; bảng số liệu; khả năng xảy ra: **chắc chắn / có thể / không thể** | — |
| CD16 | Ôn tập cuối năm | Tổng hợp | — |

Chân trời sáng tạo và Cánh diều dạy **cùng yêu cầu cần đạt** nhưng sắp xếp khác thứ tự. Code phải lưu `topicId` theo bảng trên và có lớp ánh xạ `bookOrder` riêng cho từng bộ sách, không gắn cứng thứ tự.

## Giới hạn tính toán theo yêu cầu cần đạt (đừng vượt)

- Cộng, trừ số có đến 5 chữ số: **có nhớ không quá hai lượt và không liên tiếp**. Kết quả ≤ 100 000, phép trừ không ra số âm.
- Nhân với số có 1 chữ số: **có nhớ không quá một lượt** (khi thừa số có nhiều chữ số).
- Chia cho số có 1 chữ số; chia có dư thì **số dư < số chia**.
- Biểu thức số: tối đa **2 dấu phép tính**, có thể có ngoặc; nhân/chia làm trước cộng/trừ.
- Một phần mấy: chỉ phân số dạng **1/n với n = 2…9**, minh hoạ bằng hình hoặc nhóm đồ vật chia đều (ví dụ "1/4 của 20 cái nơ").
- Làm tròn: đến hàng chục, trăm (CD08); nghìn, chục nghìn (CD11). Quy ước: chữ số bên phải ≥ 5 thì làm tròn lên.
- Số La Mã: chỉ I đến XX (I, II, III, IV, V, VI … IX, X, XI … XX).
- Đồng hồ: kim giờ, kim phút; đọc "8 giờ 25 phút", "9 giờ kém 10 phút".
- Tiền Việt Nam: tờ 1 000, 2 000, 5 000, 10 000, 20 000, 50 000, 100 000 đồng. Tổng tiền ≤ 100 000 đồng.
- Chu vi / diện tích: số đo nguyên, đơn vị cm, cm²; diện tích HCN = dài × rộng, hình vuông = cạnh × cạnh; chu vi HCN = (dài + rộng) × 2, hình vuông = cạnh × 4.

## Dạng bài và cách tạo đáp án nhiễu

| Dạng | Ví dụ đề (ngữ cảnh dễ thương) | Đáp án nhiễu nên dùng (lỗi sai thật của trẻ) |
|---|---|---|
| Bảng nhân/chia | "Mỗi hộp có 7 chiếc nơ. 6 hộp có bao nhiêu nơ?" | kết quả bảng liền kề (6×6, 6×8), cộng thay vì nhân (7+6) |
| Tìm thành phần | "? × 4 = 32" | 32 − 4, 32 + 4, 32 × 4 |
| Chia có dư | "Có 29 viên kẹo chia đều cho 4 bạn. Mỗi bạn được mấy viên, còn thừa mấy viên?" | dư ≥ số chia, quên phần dư |
| Gấp / giảm lần | "Mai có 3 chiếc kẹp tóc, số kẹp của chị gấp 4 lần số kẹp của Mai. Chị có mấy chiếc?" | nhầm "gấp 4 lần" với "thêm 4" (3 + 4 = 7) |
| So sánh gấp mấy lần | "Có 24 bông hồng và 6 bông cúc. Số hồng gấp mấy lần số cúc?" | 24 − 6 = 18 |
| Bài toán 2 bước | mua 3 dải ruy băng giá 5 000 đồng, đưa 20 000 đồng, được trả lại bao nhiêu? | chỉ làm bước 1 (15 000) |
| Biểu thức | "36 − 12 : 3" | tính từ trái sang phải (8) |
| Chu vi / diện tích | "Viền ren quanh tấm khăn HCN dài 9 cm, rộng 5 cm" | nhầm chu vi ↔ diện tích; cộng 2 cạnh không nhân 2 |
| Làm tròn | "Làm tròn 4 650 đến hàng trăm" | 4 600, 5 000, 4 650 |
| Đồng hồ | "Đồng hồ chỉ mấy giờ?" | đọc ngược kim giờ/kim phút; lệch 5 phút |
| Tiền | "Chọn các tờ tiền để trả đúng 35 000 đồng" | thiếu/thừa một tờ |
| Xác suất | "Túi mù có 5 nơ hồng. Lấy 1 cái: chắc chắn / có thể / không thể là nơ hồng?" | nhầm "có thể" với "chắc chắn" |

## Mẫu dữ liệu một câu hỏi

```ts
type Question = {
  id: string;               // ổn định để lưu tiến độ, ví dụ "CD02.bang-nhan.7x6"
  topicId: `CD${string}`;   // theo bảng chủ đề ở trên
  skillId: string;          // kỹ năng nhỏ, ví dụ "bang-nhan-7"
  prompt: string;           // đề tiếng Việt
  speak?: string;           // câu đọc to (nếu khác prompt)
  visual?: VisualSpec;      // hình minh hoạ: nhóm đồ vật, đồng hồ, tờ tiền, hình học…
  answer: number | string;
  choices?: { value: number | string; why?: string }[]; // why = lỗi sai mà lựa chọn này bắt
  hints: string[];          // từ gợi nhẹ đến gợi rõ
  solution: string;         // lời giải mẫu 1–3 dòng
  difficulty: 1 | 2 | 3;
};
```

Sinh câu hỏi bằng **hàm thuần có seed** (`makeQuestion(skillId, seed)`) để test được và để một câu sai có thể hỏi lại y hệt sau này.

## Tự kiểm tra trước khi xong

- [ ] Mọi số nằm trong phạm vi của `topicId`.
- [ ] Không có kết quả âm, số dư < số chia, phép chia hết khi đề nói "chia đều" không dư.
- [ ] Đáp án nhiễu khác nhau, khác đáp án đúng, cùng đơn vị.
- [ ] Đề đọc lên nghe tự nhiên (thử bằng Web Speech API giọng `vi-VN`).
- [ ] Có unit test cho từng generator.
