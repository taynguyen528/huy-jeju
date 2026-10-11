# Backlog ưu tiên và câu hỏi mở

## 1. MVP đề xuất

### Must have

- Điều hướng toàn cục và ba chuyên mục văn hóa.
- About Us có CMS và SEO.
- Bản đồ Jeju, tìm kiếm thường, danh sách và chi tiết địa điểm.
- Trợ lý AI cơ bản có gợi ý và link đến dữ liệu nội bộ.
- Tạo, lưu, sửa lịch trình theo ngày; AI đề xuất lịch trình.
- Viết bài trải nghiệm hoặc review, chia sẻ ảnh và hỏi đáp ở mức cơ bản.
- CMS cho nội dung, địa điểm, media, SEO và xuất bản.
- Tài khoản, trung tâm thông báo và thống kê cơ bản.
- Responsive, bảo mật upload, logging và analytics cốt lõi.

### Should have

- Nhắc lịch qua email hoặc web push.
- Ngân sách và cảnh báo xung đột lịch.
- Bình luận, yêu thích, chia sẻ và báo cáo nội dung.
- Quy trình kiểm duyệt và phiên bản nội dung đầy đủ.
- Đa ngôn ngữ.

### Could have

- Nhắc theo vị trí.
- Phỏng vấn AI đa phương tiện, dịch và phụ đề.
- Cộng tác cùng lập lịch trình.
- Import địa điểm từ nguồn ngoài.
- Cá nhân hóa sâu dựa trên lịch sử.

### Không mặc định trong MVP

- Bán vé, bảo hiểm, SIM, ví, đơn hàng, điểm thưởng và thanh toán.

## 2. Epic triển khai

1. Nền tảng tài khoản, phân quyền và CMS.
2. Nội dung văn hóa và SEO.
3. Dữ liệu địa điểm, bản đồ và tìm kiếm.
4. Lịch trình và thông báo.
5. Trợ lý AI và tìm kiếm ngữ nghĩa.
6. Cộng đồng và kiểm duyệt.
7. Analytics, vận hành và tối ưu.

## 3. Rủi ro chính

| Rủi ro | Tác động | Giảm thiểu |
| --- | --- | --- |
| Dữ liệu địa điểm thiếu hoặc cũ | AI và lịch trình sai | Nguồn dữ liệu rõ, thời điểm xác minh, job kiểm tra |
| AI bịa thông tin văn hóa | Mất uy tín, gây phản cảm | RAG từ nội dung duyệt, trích nguồn, human review |
| Yêu cầu thông báo theo vị trí quá phức tạp trên web | Không ổn định trên iOS hoặc nền trình duyệt | Tách nhắc thời gian cho MVP; PWA hoặc app ở giai đoạn sau |
| Phạm vi cộng đồng lớn | Tốn nguồn lực kiểm duyệt | Tiền kiểm ban đầu, báo cáo, rate limit, chính sách rõ |
| Điều hướng ngang và dọc chiếm diện tích | Trải nghiệm mobile kém | Responsive drawer và test usability |
| Hình tham khảo bị hiểu thành phạm vi thật | Phình sản phẩm | Chốt riêng danh sách tính năng và ảnh chỉ tham khảo |

## 4. Câu hỏi cần Product Owner chốt

### Sản phẩm và người dùng

1. Website phục vụ khách Việt, khách Hàn hay quốc tế? Ngôn ngữ MVP là gì?
2. Home và Điểm đến là một trang hay hai trang riêng?
3. Người chưa đăng nhập được dùng AI và tạo lịch trình đến mức nào?
4. Có yêu cầu thương mại như đặt vé hoặc thanh toán không?

### Nội dung văn hóa

5. “Bỏ hình ảnh” ở Haenyeo nghĩa là bỏ banner, gallery hay mọi hình ảnh?
6. Ai chịu trách nhiệm xác minh nội dung văn hóa và nguồn tham khảo?
7. Phỏng vấn AI đa phương tiện cụ thể là avatar phỏng vấn, dịch, phụ đề hay hỏi đáp với kho tư liệu?

### Địa điểm và bản đồ

8. Dùng nhà cung cấp bản đồ nào và dữ liệu địa điểm lấy từ đâu?
9. “Map Jeju Huy bổ sung sau” là tài sản thiết kế hay bộ dữ liệu GIS?
10. Có review sao, giá, giờ mở cửa và liên hệ thực tế không?

### Lịch trình và thông báo

11. Thông báo cần web push, email, SMS hay trong hệ thống?
12. “Đúng thời gian có mặt tại địa điểm” là nhắc theo giờ hay geofencing theo GPS?
13. AI có tối ưu tuyến đường theo phương tiện và thời gian di chuyển không?
14. Có cần chia sẻ hoặc cộng tác lịch trình không?

### Cộng đồng và vận hành

15. Nội dung cộng đồng tiền kiểm hay hậu kiểm?
16. Có bình luận, like, share, báo cáo và điểm uy tín không?
17. Vai trò CMS cụ thể và quy trình duyệt nội dung là gì?
18. Số liệu “khách đang truy cập” phải real time đến mức nào?

## 5. Điều kiện sẵn sàng trước phát triển

- Chốt sitemap và phạm vi MVP.
- Chốt dữ liệu bản đồ, địa điểm và giấy phép sử dụng.
- Chốt ma trận vai trò và trạng thái nội dung.
- Chốt kênh thông báo và giới hạn nền tảng web.
- Có bộ nội dung mẫu cho cả ba chủ đề văn hóa.
- Có ít nhất 20 đến 50 địa điểm mẫu để kiểm thử tìm kiếm và lịch trình.
- Chốt nguyên tắc nguồn dữ liệu cho AI và tiêu chí đánh giá.

