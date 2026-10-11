# Phạm vi đã chốt và roadmap hiện tại

> Cập nhật: 11/10/2026  
> Trạng thái: tài liệu làm việc cho giai đoạn phát triển local

## 1. Mục tiêu đang theo đuổi

Xây dựng website khám phá văn hóa và du lịch Jeju bằng tiếng Việt. Sản phẩm kết hợp nội dung biên tập, địa điểm, lập lịch trình với Taewak và khu vực quản trị. Đây là project học tập; ưu tiên luồng hoàn chỉnh và dữ liệu có cấu trúc hơn các tích hợp trả phí.

## 2. Những điểm đã chốt

- Frontend và backend nằm ở hai thư mục riêng: `client/` và `backend/`.
- Frontend dùng React, TypeScript, Vite và Mantine UI.
- Backend dùng NestJS và SQLite trong giai đoạn local.
- Giao diện public giữ phong cách premium editorial đã thống nhất.
- Public route hiện tại gồm `/`, `/kham-pha`, `/lich-trinh`, `/van-hoa`, `/dang-nhap` và `/dang-ky`.
- Private route gồm `/tai-khoan`; khu vực quản trị gồm `/admin`, `/admin/content` và `/admin/users`.
- JWT được lưu trong HttpOnly cookie. API key Gemini chỉ nằm trong `backend/.env`.
- Role đã có: `MEMBER`, `EDITOR`, `MODERATOR`, `ADMIN`. Hiện `EDITOR` và `MODERATOR` mới có quyền tương đương thành viên cho đến khi có workspace riêng.
- `ADMIN` là tài khoản vận hành độc lập: chỉ truy cập dashboard và route quản trị, không sử dụng public route hoặc không gian thành viên.
- Nội dung có bốn trạng thái: `draft`, `review`, `published`, `archived`.
- SEO chưa nằm trong giai đoạn hiện tại.
- Google Places API và bản đồ được hoãn. Ô điểm đến tiếp tục dùng dữ liệu nhập tay; destination và offer sẽ lấy từ API nội bộ khi module địa điểm hoàn thành.
- Không triển khai bán vé, thanh toán, bảo hiểm, SIM, ví hoặc điểm thưởng trong MVP.

## 3. Phần đã có

- Giao diện editorial và các section carousel, preview.
- Taewak gọi Gemini qua backend và nhận context chuyến đi.
- Đăng ký, đăng nhập, đăng xuất, route guard và phân quyền Admin.
- Tài khoản test và script seed.
- Dashboard Admin, danh sách người dùng và CMS nội dung sơ bộ.
- Nội dung CMS được lưu bền vững trong SQLite; restart backend không làm mất bài.

## 4. Thứ tự phát triển tiếp theo

### P1. Hoàn thiện CMS nội dung

- Đã có CRUD nội dung đầy đủ: thêm, sửa, đổi trạng thái, lưu trữ và xóa có xác nhận.
- Đã có tìm kiếm, validation và trạng thái loading/error/success bằng Mantine UI.
- Đã tích hợp TipTap rich-text editor và upload ảnh bài viết.
- Đã có trang đọc blog công khai `/van-hoa/:slug`; bước sau có thể thêm preview riêng cho bản nháp.
- Đã validate định dạng và lỗi trùng slug.
- Gắn tác giả theo tài khoản đang đăng nhập thay vì nhập chuỗi tự do.

### P2. Module địa điểm nội bộ

- Bảng và API `destinations` trong SQLite.
- Admin CRUD địa điểm, trạng thái xác minh và ảnh đại diện.
- Public API danh sách và chi tiết địa điểm.
- Thay dữ liệu mock trong carousel bằng API.
- Tìm kiếm theo tên, khu vực và chủ đề từ database nội bộ.

### P3. Lưu lịch trình

- Đã lưu thông tin form và phản hồi AI của thành viên vào SQLite.
- Đã có trang “Lịch trình của tôi” để xem chi tiết và lưu trữ.
- Tiếp theo: chuyển phản hồi AI thành ngày và hoạt động có cấu trúc để chỉnh sửa riêng từng mục.
- Tiếp theo: kéo thả hoạt động, lưu nháp và đánh dấu hoàn tất.

### P4. Workflow Editor và Moderator

- Editor tạo bản nháp và gửi duyệt.
- Moderator duyệt, từ chối hoặc yêu cầu chỉnh sửa.
- Admin quản lý role và khóa hoặc mở tài khoản.
- Ghi audit log cho thay đổi quan trọng.

### P5. Cộng đồng và thông báo

- Bài trải nghiệm, review và hỏi đáp.
- Báo cáo vi phạm và hàng đợi kiểm duyệt.
- Thông báo trong hệ thống; email hoặc push để sau.

## 5. Chưa làm trong giai đoạn hiện tại

- Google Places API, Google Maps và geofencing.
- SEO nâng cao, sitemap và structured data.
- Upload lên object storage.
- Quên mật khẩu, xác minh email và đăng nhập mạng xã hội.
- Thanh toán hoặc đặt dịch vụ.
- Đa ngôn ngữ.

## 6. Quy tắc cập nhật

Khi một chức năng được thêm hoặc thay đổi, cần cập nhật đồng thời tài liệu hướng dẫn sử dụng và trạng thái tương ứng trong roadmap này.
