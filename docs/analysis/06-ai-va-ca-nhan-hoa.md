# AI và cá nhân hóa

## 1. Vai trò của AI

AI có bốn năng lực phù hợp với nguồn:

1. Trợ lý hội thoại về đi lại, ăn uống, mua sắm và khám phá Jeju.
2. Tìm kiếm ngữ nghĩa bằng câu tự nhiên.
3. Thiết kế lịch trình cá nhân hóa.
4. Hỗ trợ nội dung đa phương tiện như tóm tắt, dịch hoặc phụ đề phỏng vấn, nếu được phê duyệt.

## 2. Trợ lý hội thoại

Giao diện tham khảo có lịch sử chat, xóa chat, ô nhập, câu hỏi gợi ý và trạng thái trực tuyến. Với sản phẩm Jeju, câu hỏi gợi ý nên bám bốn nhu cầu nguồn nêu: Đi lại, Ăn uống, Mua sắm, Thiết kế lộ trình.

Đầu ra nên gồm:

- Câu trả lời ngắn, dễ quét.
- Link đến địa điểm hoặc bài viết thật trong hệ thống.
- Lý do gợi ý và các điều kiện đã áp dụng.
- Thời điểm cập nhật khi trả lời giờ mở cửa, giá hoặc sự kiện.
- Cảnh báo khi thông tin chưa được xác minh.

## 3. Lịch trình AI

### Đầu vào tối thiểu

- Điểm đến hoặc vùng tại Jeju.
- Ngày đi và về, hoặc số ngày.
- Sở thích.

### Đầu vào nên có

- Nhóm đi, trẻ em hoặc người cao tuổi.
- Ngân sách và loại phương tiện.
- Nhịp độ chuyến đi.
- Giờ bắt đầu, kết thúc mỗi ngày.
- Yêu cầu tiếp cận, ăn kiêng và địa điểm bắt buộc.

### Ràng buộc bắt buộc

- Không xếp hai hoạt động trùng thời gian.
- Tính thời gian di chuyển hợp lý.
- Kiểm tra giờ mở cửa và ngày đóng cửa từ dữ liệu có cấu trúc.
- Không vượt ngày chuyến đi.
- Phân biệt chi phí biết chắc và chi phí ước tính.
- Cho phép người dùng sửa tất cả kết quả.

## 4. Kiến trúc logic đề xuất

```text
Câu hỏi người dùng
-> Nhận diện ý định và điều kiện
-> Truy xuất nội dung hoặc địa điểm đã xác minh
-> Bộ quy tắc kiểm tra dữ liệu và lịch
-> Mô hình ngôn ngữ soạn câu trả lời
-> Gắn nguồn nội bộ và cảnh báo
-> Người dùng phản hồi hoặc thực hiện hành động
```

Không nên để mô hình tự tạo giờ mở cửa, giá, tọa độ hoặc sự kiện mà không đối chiếu kho dữ liệu.

## 5. An toàn và riêng tư

- Xin đồng ý trước khi dùng lịch sử, vị trí hoặc sở thích để cá nhân hóa.
- Cho phép xóa lịch sử chat và giải thích tác động của thao tác.
- Không đưa dữ liệu cá nhân nhạy cảm vào prompt nếu không cần thiết.
- Có thời hạn lưu dữ liệu và cơ chế xóa theo yêu cầu.
- Chặn hướng dẫn nguy hiểm, nội dung thù ghét và thông tin xúc phạm văn hóa.
- Ghi nhãn nội dung do AI tạo hoặc dịch khi có nguy cơ người đọc hiểu là tư liệu gốc.

## 6. Đánh giá chất lượng AI

- Tỷ lệ câu trả lời có link nguồn hợp lệ.
- Độ chính xác của địa điểm, giờ mở cửa và thời gian di chuyển.
- Tỷ lệ lịch trình vượt ràng buộc.
- Tỷ lệ người dùng chấp nhận, sửa hoặc tạo lại đề xuất.
- Phản hồi hữu ích hoặc không hữu ích.
- Tỷ lệ từ chối đúng và sai với câu hỏi ngoài phạm vi.

## 7. Kịch bản thất bại

- Không tìm thấy dữ liệu: nói rõ không đủ thông tin và đề xuất truy vấn khác.
- Dịch vụ AI lỗi: giữ nguyên nội dung đã nhập, cho thử lại và cung cấp tìm kiếm thường.
- Dữ liệu mâu thuẫn: ưu tiên nguồn mới và đã xác minh, hiển thị cảnh báo.
- Lịch trình không khả thi: chỉ rõ xung đột để người dùng quyết định, không âm thầm bỏ hoạt động.

