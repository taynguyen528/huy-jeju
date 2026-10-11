# Yêu cầu phi chức năng SEO và phân tích

## 1. Trải nghiệm và responsive

- Thiết kế mobile first, hoạt động tốt ở điện thoại, tablet và desktop.
- Thanh ngang và dọc cố định trên desktop nhưng không che nội dung; trên mobile dùng header gọn và drawer.
- Trạng thái loading, empty, error và offline phải được thiết kế cho bản đồ, AI, danh sách và media.
- Thao tác chính có thể dùng bằng bàn phím; focus rõ; ảnh có alt text; màu đạt độ tương phản phù hợp.

## 2. Tương thích

Nguồn yêu cầu hiển thị trên các trình duyệt phổ biến. Baseline đề xuất: hai phiên bản gần nhất của Chrome, Edge, Firefox, Safari; Safari iOS và Chrome Android. Cần chốt ma trận chính thức theo người dùng mục tiêu.

## 3. Hiệu năng

- Ảnh dùng định dạng tối ưu, nhiều kích cỡ và lazy loading.
- Bản đồ chỉ tải dữ liệu trong vùng nhìn; clustering khi có nhiều marker.
- Trang nội dung nên cache tại CDN.
- AI dùng phản hồi streaming nếu phù hợp và có timeout rõ.
- Mục tiêu Core Web Vitals cần được chốt; đề xuất theo ngưỡng “good” của Google tại percentile 75.

## 4. SEO

- Meta title, description, canonical, robots, Open Graph và social image quản trị được.
- URL thân thiện, redirect 301 khi đổi slug.
- Sitemap XML, robots.txt và breadcrumb.
- Structured data phù hợp cho Article, TouristAttraction, BreadcrumbList và FAQ khi nội dung đáp ứng điều kiện.
- Heading đúng cấp; mục lục bài dài dùng anchor ổn định.
- Nội dung đa ngôn ngữ cần hreflang và URL riêng từng ngôn ngữ.
- Không index trang tìm kiếm nội bộ, chat riêng tư và lịch trình cá nhân.

## 5. Bảo mật

- Xác thực an toàn, session timeout và giới hạn thử đăng nhập.
- Phân quyền phía server cho mọi API quản trị.
- Chống XSS trong nội dung rich text, CSRF, injection và upload file độc hại.
- Rate limit cho tìm kiếm, đăng nội dung và AI.
- URL media có kiểm soát; quét tệp và loại bỏ metadata nhạy cảm nếu cần.
- Audit log cho đăng nhập quản trị, xuất bản, thay đổi quyền và xử lý kiểm duyệt.

## 6. Độ tin cậy và vận hành

- Backup dữ liệu và media, kiểm thử phục hồi định kỳ.
- Theo dõi lỗi API, độ trễ AI, job thông báo thất bại và dữ liệu bản đồ lỗi.
- Các tác vụ gửi thông báo phải idempotent để tránh gửi trùng.
- Có cơ chế tắt AI hoặc bản đồ độc lập mà phần nội dung còn lại vẫn hoạt động.

## 7. Analytics

Sự kiện tối thiểu:

- `search_submitted`, `filter_applied`, `destination_viewed`, `map_marker_selected`.
- `itinerary_started`, `ai_itinerary_generated`, `activity_added`, `itinerary_completed`.
- `assistant_opened`, `assistant_prompt_sent`, `assistant_result_clicked`, `assistant_feedback`.
- `post_started`, `post_submitted`, `post_published`, `article_viewed`.
- `notification_opened`.

Không gửi nội dung chat, vị trí chính xác hoặc dữ liệu nhận dạng vào analytics nếu chưa có mục đích và đồng ý phù hợp.

## 8. Thống kê quản trị

- Active users hiện tại hoặc gần thời gian thực, kèm độ trễ dữ liệu.
- Lượt xem duy nhất và tổng lượt xem theo bài.
- Nguồn truy cập, thiết bị, ngôn ngữ và đường dẫn chuyển đổi.
- Tỷ lệ tạo lịch trình thành công và sử dụng AI.
- Hàng đợi kiểm duyệt, thời gian xử lý và tỷ lệ bị từ chối.

