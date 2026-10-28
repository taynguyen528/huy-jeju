# Hướng dẫn sử dụng hệ thống Jeju

> Phiên bản tài liệu: 0.43
> Cập nhật gần nhất: 28/10/2026
> Phạm vi: môi trường phát triển local

## 1. Giới thiệu

Jeju là website hỗ trợ khám phá văn hóa và du lịch Jeju. Hệ thống hiện có:

- Trang giới thiệu theo phong cách editorial.
- Danh sách địa điểm và nội dung nổi bật.
- Carousel kéo bằng chuột hoặc cảm ứng.
- Preview nhanh địa điểm.
- Trợ lý AI Taewak hỗ trợ lên lịch trình.
- Lối tắt “Trợ lý Jeju” cố định ở góc dưới bên phải trên mọi trang; chọn nhân vật để mở trang lập lịch trình.
- Đăng ký, đăng nhập và quản lý phiên người dùng.
- Trang tài khoản cá nhân.
- Khu vực quản trị dành cho Admin.
- CMS sơ bộ để tạo, duyệt và lưu trữ nội dung.
- Giao diện và nội dung vận hành bằng tiếng Anh.
- Kho dữ liệu mẫu địa điểm Jeju từ nguồn du lịch chính thức.

## 2. Cấu trúc dự án

```text
Huy/
├── client/       React, TypeScript, Vite và Mantine UI
├── backend/      NestJS, SQLite, OpenAI-compatible API và Auth
└── docs/         Tài liệu nghiệp vụ và hướng dẫn
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

Backend mặc định chạy tại:

```text
http://localhost:8787/api
```

## 3. Chuẩn bị môi trường

Yêu cầu:

- Node.js phiên bản 20 trở lên.
- npm.
- API key của OpenAI hoặc một gateway tương thích OpenAI.

Kiểm tra phiên bản:

```powershell
node --version
npm --version
```

## 4. Cấu hình backend

Di chuyển vào thư mục backend:

```powershell
cd C:\Users\ADMIN\Desktop\Huy\backend
npm install
```

Nếu chưa có `.env`, tạo từ file mẫu:

```powershell
Copy-Item .env.example .env
```

Cấu hình tối thiểu:

```env
OPENAI_BASE_URL=https://gpt.teamsoclo.site/v1
OPENAI_API_KEY=your_gateway_api_key
OPENAI_MODEL=gpt-6.1-sol
PORT=8787
JWT_SECRET=replace_with_a_long_random_secret
DATABASE_PATH=data/jeju-ai.sqlite
```

Cấu hình tài khoản Admin bootstrap, chỉ nên dùng khi khởi tạo môi trường:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
ADMIN_NAME=Jeju Admin
EMAIL_PROVIDER=console
BREVO_API_KEY=xkeysib_your_brevo_api_key
BREVO_FROM_EMAIL=your_verified_sender@gmail.com
BREVO_FROM_NAME=Jeju
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM=Jeju <onboarding@resend.dev>
```

Email xác nhận và đặt lại mật khẩu hỗ trợ Brevo hoặc Resend qua HTTPS API để tương thích Railway Trial/Free/Hobby, nơi kết nối SMTP outbound bị chặn. Nếu dùng `console` ở môi trường local, backend ghi mã vào terminal và frontend hiển thị mã kiểm thử. Production không trả mã kiểm thử về trình duyệt.

Ở local, giữ `EMAIL_PROVIDER=console` để không gọi dịch vụ bên ngoài và nhận `devCode` ngay trên giao diện. Trên Railway khi chưa có domain riêng, nên đặt `EMAIL_PROVIDER=brevo`, cùng `BREVO_API_KEY`, `BREVO_FROM_EMAIL` đã xác minh và `BREVO_FROM_NAME`. Brevo gọi qua HTTPS và cho phép bắt đầu bằng cách xác minh riêng địa chỉ gửi.

`onboarding@resend.dev` chỉ phù hợp để kiểm thử theo giới hạn tài khoản Resend. Muốn gửi cho thành viên bằng các địa chỉ email khác, cần thêm và xác minh domain trong Resend rồi đổi `RESEND_FROM`, ví dụ `Jeju <no-reply@your-domain.com>`.

Không để nguyên domain mẫu như `yourdomain.com` hoặc `example.com`: backend sẽ dừng sớm và báo lỗi cấu hình rõ ràng. API key dạng chỉ-gửi-email không có quyền đọc danh sách domain; việc xác minh domain cần được kiểm tra trong dashboard Resend.

Nếu dùng `onboarding@resend.dev`, Resend chỉ cho phép gửi tới email chủ tài khoản Resend. Đăng ký bằng email người dùng khác sẽ nhận lỗi dịch vụ `503`; để gửi rộng rãi, cần xác minh domain riêng và dùng sender thuộc domain đó.

Không commit `.env`, API key, JWT secret hoặc database SQLite.

Chạy backend:

```powershell
npm run dev
```

Kiểm tra trạng thái:

```text
http://localhost:8787/api/health
```

Kết quả hợp lệ:

```json
{
  "ok": true,
  "model": "gpt-6.1-sol",
  "aiBaseUrl": "https://gpt.teamsoclo.site/v1",
  "openaiConfigured": true
}
```

## 5. Chạy frontend

Mở terminal khác:

```powershell
cd C:\Users\ADMIN\Desktop\Huy\client
npm install
npm run dev
```

Truy cập:

```text
http://localhost:5173
```

Frontend không cần API key. Trình duyệt gọi `/api`; Vite chuyển request sang backend. API key chỉ được đặt trong `backend/.env`, tuyệt đối không đặt trong biến `VITE_*`.

## 6. Public routes

Các route này không yêu cầu đăng nhập.

| Route | Chức năng |
| --- | --- |
| `/` | Landing page, nội dung nổi bật và hành trình tuyển chọn. |
| `/gioi-thieu` | Tầm nhìn, sứ mệnh, giá trị cốt lõi và cách JEJU sử dụng AI. |
| `/kham-pha` | Danh sách địa điểm theo layout editorial. |
| `/van-hoa` | Culture Journal và bài viết đã xuất bản. |
| `/van-hoa/:slug` | Trang đọc chi tiết một bài blog đã xuất bản. |
| `/dang-nhap` | Đăng nhập. |
| `/dang-ky` | Tạo tài khoản thành viên. |
| `/quen-mat-khau` | Nhận mã qua email và đặt lại mật khẩu. |

`/lich-trinh` không còn là public route. Nếu chưa đăng nhập, hệ thống chuyển sang `/dang-nhap` và quay lại lịch trình sau khi xác thực thành công.

### Điều hướng sidebar

- Trên desktop và tablet, một thanh icon rộng 70px luôn hiển thị bên trái; nút ba gạch mở rộng thanh này để hiện **About**, **Explore**, **Itinerary** và **Jeju Culture**.
- Sidebar mặc định chỉ hiện icon; chọn một trang, bấm lại nút hoặc bấm vùng nền sẽ thu sidebar về thanh icon.
- Chọn một mục để chuyển trực tiếp đến route tương ứng; mục hiện tại được đánh dấu.
- Bên dưới **Jeju Culture** là submenu lấy động các bài đang ở trạng thái `published`; chọn tiêu đề để mở `/van-hoa/:slug`.
- Trên tablet và mobile, sidebar được ẩn để giữ diện tích nội dung; menu drawer trong header tiếp tục đảm nhiệm điều hướng.

### Ngôn ngữ giao diện

- Hệ thống chỉ sử dụng tiếng Anh; header không còn bộ chọn ngôn ngữ.
- Dữ liệu địa điểm public chỉ trả tên và mô tả tiếng Anh.
- Bài Culture Journal có một phiên bản tiếng Anh duy nhất, không còn trạng thái bản dịch hoặc cơ chế fallback.
- Khi nâng cấp database cũ, bản dịch tiếng Anh đã được duyệt (nếu có) được chuyển thành nội dung chính; bảng `content_translations` sau đó bị xóa.

### Carousel địa điểm

- Kéo ngang bằng chuột hoặc touch.
- Dùng nút mũi tên để chuyển card.
- Dùng indicator phía dưới để nhận biết vị trí.
- Nhấn vào card để mở preview.
- Từ preview, chọn **Lên lịch trình** để mở Taewak.

### Trợ lý Taewak

1. Mở `/lich-trinh`.
2. Nhập điểm đến.
3. Chọn ngày đi và ngày về nếu đã xác định.
4. Chọn số người.
5. Chọn một hoặc nhiều sở thích.
6. Chọn nhịp độ, phương tiện và nhập ngân sách dự kiến.
7. Nhập yêu cầu trong khung chat.
8. Với lịch trình theo ngày, xem các điểm chính và bản đồ ngay dưới câu trả lời. Marker `D1.1`, `D1.2`... thể hiện ngày và thứ tự ghé thăm; mỗi ngày dùng một màu riêng.
9. Sau khi AI trả lời, thành viên có thể chọn **Lưu lịch trình**.

Thông tin form được gửi kèm request chat và xuất hiện trong `contextUsed` của API response. Với câu trả lời dạng lịch trình theo ngày, response còn có `days`; mỗi phần tử chứa `day`, `title` và `places`. Mỗi địa điểm có thứ tự, tên, tọa độ, địa chỉ và nguồn phân giải. Giao diện hiển thị các địa điểm thành chip tương tác và bản đồ Leaflet/OpenStreetMap; chọn chip sẽ điền câu hỏi tìm hiểu thêm về địa điểm đó.

Backend ưu tiên tọa độ đã có trong bảng `destinations`, sau đó tra Geoapify nếu đã cấu hình `GEOAPIFY_API_KEY`, rồi mới dùng Nominatim làm fallback. Kết quả thành công được lưu vào bảng cache `geocoded_places` để tránh gọi lại. Tọa độ không phân giải được vẫn xuất hiện trong danh sách nhưng không có marker. Đường nét đứt trên bản đồ chỉ nối điểm theo thứ tự ghé thăm, **không phải** chỉ đường theo đường bộ, không tính thời gian thực và không phản ánh giao thông. Nominatim công cộng chỉ phù hợp cho bản local/MVP có lưu cache.

Để bật Geoapify, tạo API key trong Geoapify My Projects, copy key vào `backend/.env` rồi restart backend:

```env
GEOAPIFY_API_KEY=your_geoapify_key
```

Request Geoapify chạy ở backend nên không cần cấu hình HTTP Origin/CORS cho local. Không commit hoặc đưa key vào frontend. Khi deploy, nhập biến này trong dashboard hosting; chỉ thêm IP restriction nếu hosting cung cấp outbound IP cố định.

Ví dụ:

```json
{
  "message": "Day-by-day itinerary in Markdown...",
  "days": [
    {
      "day": 1,
      "title": "Jeju City: local culture and coast",
      "places": [
        {
          "order": 1,
          "name": "Dongmun Traditional Market",
          "latitude": 33.5116,
          "longitude": 126.526,
          "address": "Jeju-si, Jeju-do, South Korea",
          "source": "nominatim"
        }
      ]
    }
  ],
  "contextUsed": {
    "destination": "Jeju, South Korea",
    "startDate": null,
    "endDate": null,
    "travelers": "2 travelers",
    "interests": ["Culture", "Nature"],
    "pace": "Balanced",
    "transport": "Bus + taxi",
    "budget": "1500000"
  }
}
```

AI có thể cung cấp thông tin chưa chính xác hoặc đã thay đổi. Người dùng cần kiểm tra giờ mở cửa, giá và điều kiện thực tế trước chuyến đi.

### Không gian đọc kết quả chat

- Nút panel ở góc phải header chat dùng để thu gọn hoặc mở lại phần **Thông tin chuyến đi**.
- Khi thu gọn, khu vực chat sử dụng gần như toàn bộ chiều rộng màn hình.
- Phản hồi dài nằm trong vùng cuộn riêng; ô nhập luôn giữ ở cuối khung chat.
- Backend cho phép tối đa 6.000 output token để hạn chế lịch trình dài bị cắt giữa câu.
- Ô nhập tự tăng chiều cao khi nội dung có nhiều dòng và dừng ở chiều cao tối đa để không che kết quả.
- Trên tablet và mobile, form chuyến đi nằm phía trên chat; có thể thu gọn để ưu tiên không gian đọc.
- Có tám prompt gợi ý về cặp đôi, Haenyeo, ẩm thực, Hallasan, ngày mưa, giao thông và ngân sách.

## 7. Đăng ký và đăng nhập

### Đăng ký

1. Mở `/dang-ky`.
2. Nhập tên hiển thị.
3. Nhập tên đăng nhập duy nhất, dài 3–30 ký tự và chỉ dùng chữ, số hoặc dấu gạch dưới.
4. Nhập email hợp lệ.
5. Nhập mật khẩu tối thiểu 8 ký tự, có ít nhất một chữ và một số.
6. Đồng ý với điều khoản và chọn **Gửi mã xác nhận**.
7. Nhập mã gồm 6 chữ số được gửi tới email. Mã hết hạn sau 10 phút.
8. Có thể gửi lại mã sau 60 giây. Sau 5 lần nhập sai, cần yêu cầu mã mới.

Tài khoản mới nhận role `MEMBER` nhưng không thể đăng nhập hoặc truy cập private route trước khi email được xác nhận.

### Đăng nhập

1. Mở `/dang-nhap`.
2. Nhập tên đăng nhập và mật khẩu. Email không được dùng để đăng nhập.
3. Nhấn **Đăng nhập**.

Sau khi thành công, hệ thống lưu JWT trong HttpOnly cookie. Token không được lưu trong `localStorage` và JavaScript phía client không thể đọc trực tiếp cookie này.

### Quên mật khẩu

1. Tại trang đăng nhập, chọn **Quên mật khẩu?**.
2. Nhập email đã xác nhận.
3. Nhập OTP 6 số được gửi tới email và mật khẩu mới.
4. Sau khi hoàn tất, đăng nhập lại bằng **tên đăng nhập** và mật khẩu mới.

Để tránh lộ tài khoản, API yêu cầu mã luôn trả phản hồi chung kể cả khi email không tồn tại.

### Đăng xuất

Nhấn menu avatar/tên ở góc phải header, sau đó chọn **Đăng xuất**. Dropdown này cũng có lối tắt tới trang tài khoản và lịch trình đã lưu.

1. Mở `/tai-khoan` hoặc khu vực Admin.
2. Nhấn **Đăng xuất**.
3. Session cookie được xóa.

### Lịch trình đã lưu

- Chỉ thành viên đã đăng nhập mới lưu được lịch trình.
- Hệ thống lưu thông tin form và toàn bộ nội dung đề xuất gần nhất của Taewak vào SQLite.
- Mở `/tai-khoan` để xem danh sách và nội dung chi tiết.
- Chọn lưu trữ để đưa một lịch trình ra khỏi danh sách đang sử dụng.
- Mỗi thành viên chỉ đọc và lưu trữ lịch trình thuộc tài khoản của mình.

## 8. Private routes

| Route | Quyền | Chức năng |
| --- | --- | --- |
| `/lich-trinh` | MEMBER | Nhập thông tin chuyến đi, chat với Taewak và lưu kế hoạch. |
| `/tai-khoan` | MEMBER | Hồ sơ và danh sách lịch trình đã lưu. |

| Route | Quyền yêu cầu | Chức năng |
| --- | --- | --- |
| `/tai-khoan` | Đã đăng nhập | Xem thông tin tài khoản và khu vực lịch trình cá nhân. |
| `/admin` | `ADMIN` | Dashboard quản trị. |
| `/admin/content` | `ADMIN` | Quản lý nội dung. |
| `/admin/users` | `ADMIN` | Xem người dùng và vai trò. |

Nếu khách truy cập private route, hệ thống chuyển đến `/dang-nhap`. Nếu `MEMBER` truy cập route Admin, hệ thống chuyển về `/tai-khoan`.

## 9. Vai trò và quyền hạn

### MEMBER

- Truy cập public route.
- Truy cập trang tài khoản.
- Sau này có thể lưu lịch trình, nội dung yêu thích và bài viết cá nhân.

### EDITOR

- Chuẩn bị bài viết văn hóa.
- Chỉnh sửa nội dung được giao.
- Lưu nháp và gửi bài chờ duyệt.
- Không tự duyệt bài của chính mình.

Các API và màn hình Editor chuyên biệt chưa được triển khai.

### MODERATOR

- Duyệt, từ chối hoặc yêu cầu sửa nội dung.
- Kiểm duyệt bài cộng đồng, bình luận và review.
- Xử lý báo cáo vi phạm.

Các API và màn hình Moderator chuyên biệt chưa được triển khai.

### ADMIN

- Chỉ truy cập khu vực quản trị; không sử dụng public route hoặc `/tai-khoan`.
- Xem dashboard.
- Xem danh sách người dùng và role.
- Tạo và thay đổi trạng thái content.
- Lưu trữ content.

Sau khi Admin đăng nhập, hệ thống chuyển thẳng đến `/admin`. Nếu Admin nhập URL của trang public hoặc trang thành viên, frontend chuyển lại về dashboard quản trị.

## 10. Khu vực quản trị

### Dashboard `/admin`

Dashboard hiện hiển thị:

- Số phiên trình duyệt đang truy cập gần thời gian thực, phân theo khách, thành viên và Admin.
- Số người dùng hoạt động.
- Số nội dung chờ duyệt.
- Số nội dung đã xuất bản.
- Số báo cáo đang mở.
- Placeholder cho hàng đợi kiểm duyệt.

Client gửi heartbeat mỗi 15 giây; phiên không phản hồi trong 45 giây được xem là offline. Dashboard cập nhật mỗi 10 giây. Số liệu presence hiện lưu trong bộ nhớ backend và sẽ về 0 khi restart server; đây là giải pháp phù hợp demo/học tập, chưa phải hạ tầng realtime nhiều instance. Chỉ số báo cáo mở vẫn là dữ liệu sơ bộ.

### Content `/admin/content`

Admin có thể:

- Tạo bài viết.
- Nhập và chỉnh sửa tiêu đề, slug, chủ đề, tác giả, mô tả và nội dung.
- Chọn trạng thái ngay trong form hoặc thay đổi nhanh ở danh sách.
- Tìm kiếm theo tiêu đề, slug, chủ đề và tác giả.
- Chuyển trạng thái giữa bản nháp, chờ duyệt, xuất bản và lưu trữ.
- Lưu trữ bằng trạng thái `archived` để có thể khôi phục.
- Xóa vĩnh viễn sau bước xác nhận. Thao tác này không thể hoàn tác.
- Soạn nội dung định dạng bằng TipTap: tiêu đề, chữ đậm, chữ nghiêng, danh sách, trích dẫn và liên kết.
- Upload ảnh JPG, PNG, WebP hoặc GIF tối đa 5 MB và chèn trực tiếp vào vị trí con trỏ.
- Chọn một ảnh bìa/background độc lập, xem trước, thay thế hoặc gỡ ảnh trước khi lưu.

Content được lưu trong SQLite. Bài đã tạo và trạng thái xuất bản được giữ lại sau khi restart backend.

### Luồng xuất bản blog

1. Admin mở `/admin/content` và chọn **Tạo bài viết**.
2. Nhập tiêu đề, slug, chủ đề, mô tả và tác giả.
3. Soạn nội dung bằng TipTap: heading, chữ đậm/nghiêng, danh sách, trích dẫn và liên kết.
   - Editor chỉ có một bộ trường tiếng Anh gồm title, summary và body.
   - Không còn tab hoặc trạng thái kiểm duyệt bản dịch.
4. Trong khối **Ảnh bìa / background**, chọn một ảnh ngang riêng cho card và đầu trang chi tiết. Có thể xem trước, thay ảnh hoặc gỡ ảnh.
5. Trong khối **Hình ảnh bài viết**, chọn **Tải ảnh lên**. Có thể chọn một hoặc nhiều tệp JPG, PNG, WebP hoặc GIF; mỗi tệp tối đa 5 MB.
   - Ảnh được chèn trực tiếp vào vị trí con trỏ trong nội dung.
   - Ảnh bìa được ưu tiên trên card `/van-hoa`; bài cũ chưa có ảnh bìa vẫn dùng ảnh đầu tiên trong nội dung để tương thích.
   - Nếu upload thất bại, editor hiển thị thông báo ngay dưới khu vực upload.
6. Lưu nháp, chuyển chờ duyệt hoặc xuất bản.
7. Chỉ bài có trạng thái `published` xuất hiện tại `/van-hoa` và `/van-hoa/:slug`.

Ảnh hiện lưu local tại `backend/uploads/articles`; đây là giải pháp môi trường học tập, chưa phải object storage production.

1. Admin mở `/admin/content` và chọn **Tạo bài viết**.
2. Nhập tiêu đề, slug, chủ đề, mô tả và tác giả.
3. Soạn nội dung trong rich-text editor; dùng nút hình ảnh để upload và chèn ảnh.
4. Chọn `Bản nháp` để tiếp tục biên tập hoặc `Đã xuất bản` để công khai.
5. Bài published xuất hiện tại `/van-hoa`.
6. Nhấn **Đọc câu chuyện** để mở `/van-hoa/:slug`.

Ảnh bài viết được lưu local tại `backend/uploads/articles/`. Thư mục này không được commit Git. Khi triển khai production cần chuyển sang object storage như S3 hoặc Cloudinary.

### Người dùng `/admin/users`

Hiển thị:

- Tên người dùng.
- Email.
- Một hoặc nhiều role.
- Trạng thái `ACTIVE` hoặc `INACTIVE`.
- Ngày tham gia.

Admin có thể:

- Tìm theo tên, email hoặc vai trò.
- Lọc theo trạng thái hoạt động.
- Gán hoặc gỡ các role `MEMBER`, `EDITOR`, `MODERATOR`, `ADMIN`.
- Vô hiệu hóa và kích hoạt lại tài khoản.
- Xem trạng thái, role và nhận diện tài khoản đang thao tác.

Quy tắc an toàn:

- Admin không thể tự vô hiệu hóa hoặc tự gỡ role `ADMIN`.
- Hệ thống luôn yêu cầu còn ít nhất một Admin đang hoạt động.
- Tài khoản `INACTIVE` không thể đăng nhập.
- Cookie cũ của tài khoản vừa bị vô hiệu hóa sẽ bị từ chối từ request tiếp theo.

## 11. Tài khoản kiểm thử

Danh sách account và kịch bản test nằm tại:

[TEST-ACCOUNTS.md](TEST-ACCOUNTS.md)

Để seed lại tài khoản test:

```powershell
cd C:\Users\ADMIN\Desktop\Huy\backend
npm run seed:test
```

Không chạy seed test trên production.

## 12. API chính

### System và AI

```text
GET  /api/health
POST /api/chat
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Lịch trình thành viên

```text
GET    /api/itineraries
POST   /api/itineraries
DELETE /api/itineraries/:id
```

### Public content

```text
GET /api/content/public
GET /api/content/public/:slug
GET /api/media/files/:filename
```

### Địa điểm công khai

```text
GET /api/destinations
GET /api/destinations?featured=true
GET /api/destinations/:slug
```

Dữ liệu seed hiện gồm 6 địa điểm: Seongsan Ilchulbong, Hallasan, Seopjikoji, Manjanggul, Jeju Folk Village và Seongeup Folk Village. Mỗi bản ghi có tên/mô tả VI-EN-KO, địa chỉ, tọa độ mẫu, loại địa điểm, trạng thái nổi bật và URL nguồn Visit Jeju. Đây là dữ liệu mẫu đã đối chiếu nguồn; giờ mở cửa và điều kiện tham quan vẫn cần kiểm tra lại trước chuyến đi.

### Upload media Admin

```text
POST /api/media/articles
```

Request sử dụng `multipart/form-data`, field file có tên `file`, yêu cầu role `ADMIN`.

Trường `coverImageUrl` trong API content lưu URL ảnh bìa riêng. File vẫn được lưu local trong môi trường học tập, chưa phải object storage production.

### Theo dõi phiên đang truy cập

```text
POST /api/presence/heartbeat
GET  /api/admin/overview
```

Heartbeat nhận `visitorId`, `path` và nhóm `guest`/`member`/`admin`. Endpoint overview yêu cầu quyền `ADMIN` và trả `onlineVisitors`, `byAudience`, `byPath`, `delaySeconds`. Hệ thống không gửi nội dung chat, vị trí chính xác hoặc thông tin nhận dạng cá nhân vào presence.

### Admin

```text
GET    /api/admin/overview
GET    /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/content
POST   /api/content
PATCH  /api/content/:id
DELETE /api/content/:id
```

## 13. Scripts

### Frontend

```powershell
npm run dev
npm run build
npm run preview
```

### Backend

```powershell
npm run dev
npm run check
npm run build
npm start
npm run seed:test
```

## 14. Xử lý lỗi thường gặp

### `openaiConfigured: false`

Kiểm tra `OPENAI_API_KEY` trong `backend/.env`, sau đó restart backend.

### Chat trả `502 Bad Gateway`

- Xem lỗi chi tiết tại terminal backend.
- Kiểm tra `OPENAI_BASE_URL` có kết thúc bằng `/v1` và model trong `OPENAI_MODEL` có nằm trong danh sách gateway cho phép.
- Kiểm tra hạn mức, ngày hết hạn và rate limit của gateway.
- Gửi lại request để loại trừ lỗi tạm thời.

### Frontend không gọi được backend

- Kiểm tra backend đang chạy ở cổng `8787`.
- Kiểm tra `http://localhost:8787/api/health`.
- Restart Vite sau khi thay đổi cấu hình proxy.

### Đăng nhập thành công nhưng vẫn quay lại trang login

- Xóa cookie `jeju_session` cũ.
- Kiểm tra backend và frontend cùng chạy qua localhost.
- Kiểm tra tab Network của request `/api/auth/me`.
- Kiểm tra `JWT_SECRET` không thay đổi giữa các lần restart.

### Không vào được Admin

- Tài khoản phải có role `ADMIN`.
- Chạy `npm run seed:test` và dùng account Admin trong `TEST-ACCOUNTS.md`.
- Restart backend sau khi thay đổi biến `ADMIN_*`.

## 15. Đưa mã nguồn lên GitHub và triển khai tạm

### 15.1. Trạng thái triển khai

Hệ thống hiện chạy ổn ở môi trường local nhưng **chưa được cấu hình production hoàn chỉnh**. Phương án tạm phù hợp cho nhóm là:

- Lưu monorepo trong một GitHub repository riêng tư.
- Deploy `backend/` thành một Railway service.
- Deploy `client/` thành một Railway service có reverse proxy `/api` về backend để cookie đăng nhập vẫn cùng origin với giao diện.
- Gắn Railway Volume cho SQLite và ảnh upload. Nếu không có volume, dữ liệu sẽ mất khi service được redeploy.

Không commit `backend/.env`, OpenAI/gateway API key, Resend API key, JWT secret, file SQLite hoặc thư mục upload. Root `.gitignore` đã loại trừ các dữ liệu này.

### 15.2. Tạo Git repository local

Chạy tại thư mục gốc dự án:

```powershell
cd C:\Users\ADMIN\Desktop\Huy
git init -b main
git status
git add .
git status
git commit -m "chore: initial Jeju project"
```

Trước khi commit, phải kiểm tra `git status` và bảo đảm không xuất hiện:

- `backend/.env`
- `backend/data/*.sqlite`
- `backend/uploads/`
- bất kỳ thư mục `node_modules/` hoặc `dist/` nào

### 15.3. Push lên GitHub

Trên GitHub, tạo repository mới ở chế độ **Private** và không tạo sẵn README, `.gitignore` hoặc License. Sau đó chạy:

```powershell
git remote add origin https://github.com/OWNER/REPOSITORY.git
git remote -v
git push -u origin main
```

Mời thành viên tại `Repository settings -> Collaborators`. Thành viên clone bằng:

```powershell
git clone https://github.com/OWNER/REPOSITORY.git
```

### 15.4. Biến môi trường cần nhập trên hosting

Các giá trị này phải được nhập trong dashboard của Railway, không lưu trực tiếp vào Git:

```env
NODE_ENV=production
OPENAI_BASE_URL=https://gpt.teamsoclo.site/v1
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-6.1-sol
GEOAPIFY_API_KEY=...
JWT_SECRET=mot_chuoi_ngau_nhien_dai_va_rieng
DATABASE_PATH=/data/jeju-ai.sqlite
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
ADMIN_NAME=Jeju Admin
EMAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib_...
BREVO_FROM_EMAIL=dia-chi-gmail-da-xac-minh@gmail.com
BREVO_FROM_NAME=Jeju
```

Không tự đặt `PORT`; Railway cấp biến này cho service. Không dùng SMTP trên Railway Trial/Free/Hobby vì nền tảng chặn outbound SMTP; Brevo và Resend trong dự án đều được gọi qua HTTPS API và có timeout 10 giây.

### 15.5. Các bước Railway sau khi mã nguồn đã có trên GitHub

1. Tạo một Railway project trống.
2. Tạo service `Backend`, kết nối GitHub repository và đặt Root Directory là `/backend`.
3. Đặt Build Command là `npm ci && npm run build`, Start Command là `npm start`, Healthcheck Path là `/api/health`.
4. Nhập các biến môi trường backend ở mục Variables.
5. Gắn volume tại `/data`; cấu hình database và upload phải cùng trỏ vào volume bền vững.
6. Generate Domain cho backend và kiểm tra `https://BACKEND-DOMAIN/api/health`.
7. Tạo service `Frontend`, kết nối cùng GitHub repository và đặt Root Directory là `/client`.
8. Frontend sử dụng `client/Dockerfile` để build Vite và Caddy để phục vụ static files, fallback các route SPA về `index.html`, đồng thời reverse proxy `/api/*`.
9. Trong Variables của Frontend, thêm `BACKEND_UPSTREAM=https://DOMAIN-BACKEND.up.railway.app`; không thêm dấu `/` ở cuối.
10. Railway tự nhận Dockerfile; không cần đặt Build Command hoặc Start Command cho Frontend.
11. Generate Domain cho frontend, kiểm tra đăng nhập, đăng ký/xác nhận email, chat AI, upload ảnh và Admin dashboard.

Không dùng `npm run preview` làm web server production lâu dài. Frontend đã có cấu hình Caddy cho bản deploy tạm; đường dẫn upload theo volume backend vẫn cần hoàn thiện trước khi coi dữ liệu là bền vững.

### 15.6. Checklist sau deploy

- `/api/health` trả `ok: true` và `openaiConfigured: true`.
- Đăng ký nhận được OTP qua email và đăng nhập bằng username.
- Refresh trang ở các route sâu không trả 404.
- Upload ảnh, redeploy backend rồi xác nhận ảnh và dữ liệu vẫn còn.
- Admin vào được `/admin`; Member không vào được route Admin.
- `JWT_SECRET`, `OPENAI_API_KEY` và `RESEND_API_KEY` không xuất hiện trong repository hoặc log frontend.
- Chỉ chia sẻ URL frontend cho thành viên, không chia sẻ secret.

## 16. Chức năng chưa hoàn thiện

- Chưa upload file lên object storage.
- Offer tuyển chọn vẫn dùng nội dung mẫu phía frontend; carousel và trang khám phá đã lấy địa điểm qua API SQLite.
- Bản đồ lịch trình hiện dùng Leaflet, tile OpenStreetMap và Nominatim công cộng, chưa có routing theo đường bộ, thời gian di chuyển, giao thông trực tiếp hoặc SLA production.
- Quên mật khẩu và xác minh email đã có; gửi email thật phụ thuộc cấu hình SMTP hợp lệ của môi trường chạy.
- Frontend đã có Docker/Caddy, SPA fallback và reverse proxy để deploy tạm; backend vẫn chưa đưa thư mục upload vào volume bền vững.
- Chưa có refresh-token rotation hoặc thu hồi session theo thiết bị.
- Editor và Moderator chưa có workspace riêng.
- Chưa chỉnh sửa lịch trình theo từng ngày hoặc kéo thả hoạt động sau khi lưu.
- Chưa có quy trình biên tập tự động để chuyển nội dung cũ không có bản tiếng Anh sang tiếng Anh.
- Hệ thống chỉ hỗ trợ tiếng Anh; chưa có kế hoạch bật lại bản địa hóa trong phiên bản hiện tại.

## 17. Quy tắc cập nhật tài liệu

Khi thêm hoặc thay đổi chức năng có ảnh hưởng đến người dùng, tài liệu này phải được cập nhật cùng thay đổi mã nguồn. Tối thiểu cần kiểm tra:

- Route mới hoặc route thay đổi.
- Quyền truy cập và role.
- Luồng thao tác của người dùng.
- API endpoint liên quan.
- Biến môi trường mới.
- Script mới.
- Giới hạn hoặc chức năng chưa hoàn thiện.
- Ngày cập nhật và phiên bản tài liệu.

## 18. Lịch sử cập nhật

| Ngày | Phiên bản | Thay đổi |
| --- | --- | --- |
| 28/10/2026 | 0.43 | Căn thẳng hàng hai card “The Island Edit” trên trang chủ, bỏ hiệu ứng hạ card bên phải 100px làm tiêu đề lệch và sát footer. |
| 28/10/2026 | 0.42 | Sửa sidebar desktop ghi đè căn giữa của các trang có giới hạn chiều rộng, loại bỏ hiện tượng nội dung bị ghim sang trái và dư khoảng trắng lớn bên phải. |
| 28/10/2026 | 0.41 | Thay ảnh JPEG nền đen của widget Trợ lý Jeju bằng PNG có nền trong suốt để hiển thị đúng trên mọi trình duyệt và màu nền trang. |
| 28/10/2026 | 0.40 | Thêm nhân vật và nhãn “Trợ lý Jeju” cố định ở góc dưới bên phải trên mọi trang, liên kết trực tiếp tới trang lập lịch trình. |
| 27/10/2026 | 0.39 | Tích hợp Geoapify Geocoding làm nguồn tọa độ ưu tiên sau database và trước Nominatim; bổ sung biến `GEOAPIFY_API_KEY` cùng hướng dẫn bảo vệ key. |
| 27/10/2026 | 0.38 | Bắt AI xuất dữ liệu địa điểm cho đủ mọi ngày; bản đồ giữ các ngày chưa có tọa độ trong legend, báo số điểm chưa định vị và cho phép tra cứu lại kết quả thất bại thay vì cache vĩnh viễn. |
| 27/10/2026 | 0.37 | Sửa dependency injection của bộ phân giải địa điểm; lỗi tải tọa độ không còn bị báo nhầm thành lỗi AI 502 và không làm mất nội dung lịch trình đã tạo. |
| 27/10/2026 | 0.36 | Thêm bản đồ tương tác cho lịch trình: phân giải và cache tọa độ điểm chính, marker đánh số theo ngày/thứ tự, màu và đường nối riêng cho từng ngày; ghi rõ đường nối chưa phải routing đường bộ. |
| 27/10/2026 | 0.35 | Bổ sung dữ liệu lịch trình có cấu trúc `days/mainPlaces` trong API chat; backend tách và kiểm tra JSON do AI sinh, frontend hiển thị địa điểm chính theo từng ngày thành chip tương tác. |
| 27/10/2026 | 0.34 | Đổi sidebar off-canvas thành icon rail luôn hiển thị rộng 70px; nút ba gạch mở rộng rail để hiện nhãn và submenu Culture theo mẫu điều hướng tham chiếu. |
| 27/10/2026 | 0.33 | Chuyển sidebar desktop sang dạng off-canvas mặc định thu gọn, mở bằng nút ba gạch và tự đóng sau khi điều hướng hoặc bấm vùng nền. |
| 27/10/2026 | 0.32 | Thêm sidebar điều hướng cố định trên desktop, liên kết các trang chính và submenu động chứa những bài Jeju Culture đang xuất bản. |
| 27/10/2026 | 0.31 | Thay Gemini bằng API OpenAI-compatible; thêm `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, chuyển Taewak sang Chat Completions và cập nhật health check/cấu hình triển khai. |
| 27/10/2026 | 0.30 | Xóa toàn bộ tài khoản local ngoài Admin và rút gọn `seed:test` để chỉ tạo/cập nhật tài khoản `admin`; cập nhật lại danh sách tài khoản kiểm thử. |
| 27/10/2026 | 0.29 | Gỡ i18n VI/EN/KO và bộ chọn ngôn ngữ; chuyển giao diện, Taewak, email/thông báo vận hành, dữ liệu địa điểm và CMS bài viết sang mô hình chỉ dùng tiếng Anh; bỏ query `locale`, fallback và bảng bản dịch bài viết. |
| 12/10/2026 | 0.28 | Thêm Brevo HTTPS API làm lựa chọn mặc định trên production/Railway khi chưa có domain riêng; vẫn giữ `console` cho local và Resend cho môi trường đã cấu hình. |
| 12/10/2026 | 0.27 | Phân loại lỗi gửi email là lỗi dịch vụ `503` thay vì lỗi request `400`; chuyển lỗi sandbox Resend thành hướng dẫn tiếng Việt và không trả địa chỉ email chủ tài khoản trong thông báo. |
| 12/10/2026 | 0.26 | Sửa lỗi Resend do `RESEND_FROM` dùng domain mẫu; chuẩn hóa và kiểm tra cấu hình email, đồng thời làm rõ lỗi trả về từ Resend. |
| 11/10/2026 | 0.25 | Tách chế độ email theo môi trường: local `console` trả OTP kiểm thử, Railway `resend` gửi qua HTTPS API; chuẩn hóa thông báo lỗi không còn nhắc SMTP. |
| 11/10/2026 | 0.24 | Chuyển email OTP và đặt lại mật khẩu từ Gmail SMTP sang Resend HTTPS API để chạy trên Railway Trial/Free/Hobby; bổ sung timeout 10 giây và hướng dẫn sender/domain. |
| 11/10/2026 | 0.23 | Thêm Docker/Caddy cho frontend Railway, SPA fallback và reverse proxy `/api` về backend để duy trì cookie đăng nhập cùng origin. |
| 11/10/2026 | 0.22 | Thêm quy trình GitHub private và kế hoạch deploy tạm bằng Railway; bổ sung checklist secret, volume SQLite/upload, SMTP và xác định rõ phần production chưa hoàn thiện. |
| 11/10/2026 | 0.21 | Đổi mật khẩu Admin local sang giá trị đáp ứng validation frontend và chuẩn bị cấu hình SMTP Gmail cho email xác nhận/khôi phục. |
| 11/10/2026 | 0.20 | Reset tài khoản kiểm thử Admin thành username `admin`, email `pttnguyen528@gmail.com`; đồng bộ seed và xóa tài khoản Tây Nguyên khỏi database local. |
| 11/10/2026 | 0.19 | Chuẩn hóa đăng nhập chỉ bằng tên đăng nhập; bổ sung route quên mật khẩu dùng email, OTP và đặt mật khẩu mới. |
| 11/10/2026 | 0.18 | Thêm tên đăng nhập duy nhất và xác minh email bằng OTP 6 số trước khi kích hoạt quyền truy cập; hỗ trợ SMTP, gửi lại mã, thời hạn và giới hạn số lần thử. |
| 11/10/2026 | 0.17 | Thiết kế lại panel thông tin chuyến đi thành ba nhóm rõ ràng; chuẩn hóa ô ngày, định dạng ngân sách KRW và tăng khả năng đọc phần tóm tắt. |
| 11/10/2026 | 0.16 | Chuẩn hóa toàn bộ tên thương hiệu hiển thị và tài liệu thành Jeju/JEJU; giữ “AI” khi mô tả tính năng trí tuệ nhân tạo. |
| 11/10/2026 | 0.15 | Thêm thống kê phiên đang truy cập gần thời gian thực bằng heartbeat, phân nhóm khách/thành viên/Admin và tự cập nhật dashboard quản trị. |
| 11/10/2026 | 0.14 | Thêm ảnh bìa/background độc lập cho bài viết: upload, preview, thay/gỡ ảnh; lưu `coverImageUrl` trong SQLite/API và hiển thị trên card cùng trang chi tiết. |
| 11/10/2026 | 0.13 | Rà soát toàn bộ giao diện public, private và admin ở desktop/mobile; sửa lỗi mất chữ trên nút do CSS selector quá rộng, chuẩn hóa khu vực hành động địa điểm và thanh công cụ chat, đồng thời bổ sung menu Drawer cho trang quản trị trên màn hình nhỏ. |
| 11/10/2026 | 0.1 | Tạo tài liệu ban đầu; mô tả public routes, auth, account, admin, CMS, Taewak và tài khoản test. |
| 11/10/2026 | 0.2 | Mở rộng giao diện chat, thêm panel chuyến đi có thể thu gọn, tăng diện tích đọc phản hồi và tối ưu responsive. |
| 11/10/2026 | 0.3 | Đồng bộ form chuyến đi bằng Mantine, sửa icon điểm đến chồng chữ và chuẩn hóa khoảng cách, trạng thái focus của panel. |
| 11/10/2026 | 0.4 | Chốt roadmap hiện tại, hoãn Google Places và SEO; chuyển dữ liệu CMS nội dung từ bộ nhớ sang SQLite. |
| 11/10/2026 | 0.5 | Tách không gian Admin khỏi public route và tài khoản thành viên; Admin đăng nhập và được điều hướng cố định về dashboard quản trị. |
| 11/10/2026 | 0.6 | Hoàn thiện CRUD nội dung Admin bằng Mantine: modal thêm/sửa, tìm kiếm, trạng thái, xác nhận xóa và phản hồi loading/error/success. |
| 11/10/2026 | 0.7 | Bổ sung context ngân sách, nhịp độ và phương tiện cho AI; cho thành viên lưu, xem và lưu trữ lịch trình trong SQLite. |
| 11/10/2026 | 0.8 | Hoàn thiện module blog: TipTap rich-text editor, upload ảnh local, cover từ ảnh bài viết và trang đọc công khai theo slug. |
| 11/10/2026 | 0.9 | Tách Header/Footer/UserMenu; thêm i18n VI-EN-KO, khóa `/lich-trinh` cho thành viên, upload nhiều ảnh, tìm/lọc Culture Journal, trang Giới thiệu và API 6 địa điểm Jeju có nguồn Visit Jeju. |
| 11/10/2026 | 0.10 | Thêm quản trị phân quyền người dùng, tìm kiếm/lọc, ACTIVE/INACTIVE, chặn session tài khoản vô hiệu hóa và bảo vệ Admin cuối cùng. |
| 11/10/2026 | 0.11 | Căn lại form biên tập, thêm nút upload một/nhiều ảnh rõ ràng, trạng thái lỗi upload và chuẩn hóa Culture Journal thành danh sách card toàn chiều rộng. |
| 11/10/2026 | 0.12 | Thêm bảng bản dịch bài viết VI/EN/KO, editor ba tab, trạng thái bản dịch, API locale và fallback tiếng Việt có thông báo. |
