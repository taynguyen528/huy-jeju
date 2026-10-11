# Kiến trúc thông tin và điều hướng

## 1. Điều hướng toàn cục

### Thanh ngang cố định

Nguồn mô tả các mục: About Us, Điểm đến, Lịch trình, Viết ngay, tài khoản và thông báo. Logo dẫn về Home. Tìm kiếm có thể đặt trực tiếp trên thanh đầu trang hoặc trong màn hình Điểm đến.

### Thanh dọc cố định

Ba nhóm nội dung văn hóa:

1. Haenyeo, là chủ đề trọng tâm.
2. Lễ hội cầu thần gió Chilmeoridang Yeongdeunggut.
3. Tín ngưỡng Shaman bản địa và Shingugan.

Yêu cầu “thanh dọc và thanh ngang giữ nguyên vị trí” được diễn giải là sticky hoặc fixed navigation trên màn hình desktop. Trên mobile nên chuyển thành menu drawer để không làm hẹp vùng nội dung.

### Trợ lý AI

Mascot hoặc nút chat nằm ở góc phải Home và có thể tồn tại xuyên suốt website. Khi mở, hiển thị các gợi ý: Đi lại, Ăn uống, Mua sắm và Thiết kế lộ trình du lịch chi tiết.

## 2. Sitemap đề xuất

```text
Home hoặc Điểm đến
├── Tìm kiếm
├── Bản đồ Jeju
├── Danh sách địa điểm
└── Chi tiết địa điểm
About Us
Lịch trình
├── Tạo lịch trình
├── Lịch trình AI đề xuất
├── Chi tiết và chỉnh sửa lịch trình
└── Thông báo lịch trình
Viết ngay
├── Trải nghiệm và review
├── Chia sẻ ảnh
└── Hỏi đáp du lịch
Văn hóa Jeju
├── Haenyeo
│   ├── Giới thiệu
│   ├── Điểm du lịch liên quan
│   └── Kinh nghiệm du lịch
├── Yeongdeunggut
│   ├── Giới thiệu
│   ├── Điểm du lịch liên quan
│   ├── Hình ảnh
│   └── Kinh nghiệm du lịch
└── Shaman và Shingugan
    ├── Giới thiệu
    ├── Điểm du lịch liên quan
    ├── Hình ảnh
    └── Kinh nghiệm du lịch
Tài khoản
├── Hồ sơ
├── Lịch trình đã lưu
├── Nội dung đã đăng
└── Thiết lập thông báo và riêng tư
Thông báo
Trợ lý AI
```

## 3. Cấu trúc nội dung văn hóa

Mỗi chủ đề nên có landing page và các nội dung con. Haenyeo cần hỗ trợ nội dung chuyên sâu như lịch sử, đời sống, công cụ lặn, luật lệ cộng đồng và phỏng vấn đa phương tiện có AI. Trang bài dài phải có mục lục neo theo đề mục.

## 4. Mẫu URL đề xuất

- `/about`
- `/destinations`
- `/destinations/{slug}`
- `/itineraries`
- `/itineraries/new`
- `/write/review`, `/write/photo`, `/write/question`
- `/culture/haenyeo`
- `/culture/yeongdeunggut`
- `/culture/shaman-shingugan`
- `/articles/{slug}`
- `/assistant`
- `/account`

Slug cần ổn định, không phụ thuộc tiêu đề hiển thị và có cơ chế redirect khi thay đổi.

## 5. Quy tắc điều hướng

- Trạng thái mục đang chọn phải rõ ở cả thanh ngang và thanh dọc.
- Khi chọn địa điểm trên danh sách, marker tương ứng trên bản đồ được làm nổi bật và ngược lại.
- Trở lại danh sách phải giữ bộ lọc, từ khóa và vị trí cuộn.
- Link từ bài văn hóa sang địa điểm liên quan phải mở đúng chi tiết địa điểm.
- Link từ AI sang kết quả phải có ngữ cảnh để người dùng quay lại cuộc trò chuyện.

