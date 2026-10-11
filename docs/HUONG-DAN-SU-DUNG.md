# Hướng dẫn sử dụng hệ thống Jeju

> Phiên bản tài liệu: 0.22  
> Cập nhật gần nhất: 11/10/2026  
> Phạm vi: môi trường phát triển local

## 1. Giới thiệu

Jeju là website hỗ trợ khám phá văn hóa và du lịch Jeju. Hệ thống hiện có:

- Trang giới thiệu theo phong cách editorial.
- Danh sách địa điểm và nội dung nổi bật.
- Carousel kéo bằng chuột hoặc cảm ứng.
- Preview nhanh địa điểm.
- Trợ lý AI Taewak hỗ trợ lên lịch trình.
- Đăng ký, đăng nhập và quản lý phiên người dùng.
- Trang tài khoản cá nhân.
- Khu vực quản trị dành cho Admin.
- CMS sơ bộ để tạo, duyệt và lưu trữ nội dung.
- Giao diện ba ngôn ngữ Việt, Anh và Hàn.
- Kho dữ liệu mẫu địa điểm Jeju từ nguồn du lịch chính thức.

## 2. Cấu trúc dự án

```text
Huy/
├── client/       React, TypeScript, Vite và Mantine UI
├── backend/      NestJS, SQLite, Gemini API và Auth
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
- Gemini API key.

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
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
PORT=8787
JWT_SECRET=replace_with_a_long_random_secret
DATABASE_PATH=data/jeju-ai.sqlite
```

Cấu hình tài khoản Admin bootstrap, chỉ nên dùng khi khởi tạo môi trường:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
ADMIN_NAME=Jeju Admin
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM=Jeju <your_email@gmail.com>
```

Để gửi mã xác nhận bằng Gmail, bật xác minh hai bước cho tài khoản Google và tạo **App Password**; đặt mật khẩu ứng dụng vào `SMTP_PASS`, không dùng mật khẩu Gmail thông thường. Nếu chưa cấu hình SMTP ở môi trường local, backend ghi mã vào terminal và frontend hiển thị mã kiểm thử. Production không trả mã kiểm thử về trình duyệt.

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
  "model": "gemini-3.8-flash",
  "geminiConfigured": true
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

Frontend không cần `.env` cho Gemini. Trình duyệt gọi `/api`; Vite chuyển request sang backend. Gemini key chỉ được đặt trong `backend/.env`.

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

### Đa ngôn ngữ

- Chọn `VI`, `EN` hoặc `한국` trong nút ngôn ngữ trên header.
- Lựa chọn được lưu ở `localStorage` với khóa `jeju-locale`.
- Header, footer, menu người dùng, dữ liệu địa điểm và module blog đã hỗ trợ ba ngôn ngữ.
- Khi đổi ngôn ngữ, `/van-hoa` và `/van-hoa/:slug` gọi lại API với query `locale=vi|en|ko`.
- Nếu bài chưa có ngôn ngữ được chọn, API trả bản tiếng Việt với `translationFallback: true`; giao diện hiển thị thông báo fallback.

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
8. Sau khi AI trả lời, thành viên có thể chọn **Lưu lịch trình**.

Thông tin form được gửi kèm request chat và xuất hiện trong `contextUsed` của API response.

Ví dụ:

```json
{
  "contextUsed": {
    "destination": "Jeju, Hàn Quốc",
    "startDate": null,
    "endDate": null,
    "travelers": "2 người",
    "interests": ["Văn hóa", "Thiên nhiên"],
    "pace": "Cân bằng",
    "transport": "Xe buýt + taxi",
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
   - Editor có ba tab **Tiếng Việt**, **English** và **한국어**.
   - Tiếng Việt là bản bắt buộc và là nội dung fallback.
   - Bản Anh/Hàn có thể để trống hoặc lưu với trạng thái `draft`/`reviewed`; chỉ bản `reviewed` có đủ tiêu đề và nội dung mới được trả cho public API.
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
GET /api/content/public?locale=vi|en|ko
GET /api/content/public/:slug?locale=vi|en|ko
```

Response bài viết chứa `locale`, `requestedLocale` và `translationFallback` để frontend biết nội dung thực tế đang hiển thị.

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

### `geminiConfigured: false`

Kiểm tra `GEMINI_API_KEY` trong `backend/.env`, sau đó restart backend.

### Chat trả `502 Bad Gateway`

- Xem lỗi chi tiết tại terminal backend.
- Kiểm tra model trong `GEMINI_MODEL`.
- Kiểm tra quota hoặc rate limit Google AI Studio.
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

Không commit `backend/.env`, API key, mật khẩu Gmail App Password, JWT secret, file SQLite hoặc thư mục upload. Root `.gitignore` đã loại trừ các dữ liệu này.

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
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.8-flash
JWT_SECRET=mot_chuoi_ngau_nhien_dai_va_rieng
DATABASE_PATH=/data/jeju-ai.sqlite
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
ADMIN_NAME=Jeju Admin
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Jeju <...>
```

Không tự đặt `PORT`; Railway cấp biến này cho service. `SMTP_PASS` phải là Gmail App Password, không phải mật khẩu Gmail thông thường.

### 15.5. Các bước Railway sau khi mã nguồn đã có trên GitHub

1. Tạo một Railway project trống.
2. Tạo service `Backend`, kết nối GitHub repository và đặt Root Directory là `/backend`.
3. Đặt Build Command là `npm ci && npm run build`, Start Command là `npm start`, Healthcheck Path là `/api/health`.
4. Nhập các biến môi trường backend ở mục Variables.
5. Gắn volume tại `/data`; cấu hình database và upload phải cùng trỏ vào volume bền vững.
6. Generate Domain cho backend và kiểm tra `https://BACKEND-DOMAIN/api/health`.
7. Tạo service `Frontend`, Root Directory là `/client`; frontend cần cấu hình static server và reverse proxy trước khi deploy.
8. Generate Domain cho frontend, kiểm tra đăng nhập, đăng ký/xác nhận email, chat AI, upload ảnh và Admin dashboard.

Phần Docker/static server, reverse proxy frontend và đường dẫn upload theo volume sẽ được bổ sung trước lần deploy đầu tiên. Không dùng `npm run preview` làm web server production lâu dài.

### 15.6. Checklist sau deploy

- `/api/health` trả `ok: true` và `geminiConfigured: true`.
- Đăng ký nhận được OTP qua email và đăng nhập bằng username.
- Refresh trang ở các route sâu không trả 404.
- Upload ảnh, redeploy backend rồi xác nhận ảnh và dữ liệu vẫn còn.
- Admin vào được `/admin`; Member không vào được route Admin.
- `JWT_SECRET`, `GEMINI_API_KEY` và `SMTP_PASS` không xuất hiện trong repository hoặc log frontend.
- Chỉ chia sẻ URL frontend cho thành viên, không chia sẻ secret.

## 16. Chức năng chưa hoàn thiện

- Chưa upload file lên object storage.
- Offer tuyển chọn vẫn dùng nội dung mẫu phía frontend; carousel và trang khám phá đã lấy địa điểm qua API SQLite.
- Google Places API và bản đồ được tạm hoãn; chưa có API key hoặc biến môi trường liên quan.
- Quên mật khẩu và xác minh email đã có; gửi email thật phụ thuộc cấu hình SMTP hợp lệ của môi trường chạy.
- Chưa có cấu hình deploy production cho static frontend, reverse proxy và volume upload; hướng dẫn mục 15 mới là quy trình chuẩn bị.
- Chưa có refresh-token rotation hoặc thu hồi session theo thiết bị.
- Editor và Moderator chưa có workspace riêng.
- Chưa chỉnh sửa lịch trình theo từng ngày hoặc kéo thả hoạt động sau khi lưu.
- Nội dung tĩnh ở một số section trang chủ vẫn chưa được đưa hết vào từ điển i18n.
- Chưa có nút dùng AI tạo bản dịch nháp; Admin hiện nhập bản Anh/Hàn thủ công.

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
