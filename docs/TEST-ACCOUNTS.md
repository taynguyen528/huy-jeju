# Tài khoản kiểm thử Jeju

## Phạm vi sử dụng

Các tài khoản dưới đây chỉ dùng cho môi trường local hoặc test. Không sử dụng các email, mật khẩu này trên staging hoặc production.

Chạy seed từ thư mục backend:

```powershell
cd C:\Users\ADMIN\Desktop\Huy\backend
npm run seed:test
```

Trang đăng nhập:

```text
http://localhost:5173/dang-nhap
```

## Danh sách tài khoản

| STT | Vai trò | Tên hiển thị | Tên đăng nhập | Email | Mật khẩu | Route dùng để kiểm tra |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Admin | Jeju Admin | `admin` | `pttnguyen528@gmail.com` | `Pttn2002@` | `/admin`, `/admin/content`, `/admin/users` |
| 2 | Editor + Member | Minji Editor | `editor` | `editor@jeju.local` | `Editor@2026` | `/tai-khoan`; chưa được phép vào `/admin` |
| 3 | Moderator + Member | Hana Moderator | `moderator` | `moderator@jeju.local` | `Moderator@2026` | `/tai-khoan`; chưa được phép vào `/admin` |
| 4 | Member | Huy Traveler | `huy` | `huy@jeju.local` | `Member@2026` | `/tai-khoan` và các public route |
| 5 | Member | Linh Explorer | `linh` | `linh@jeju.local` | `Member@2026` | `/tai-khoan` và các public route |
| 6 | Member | Nam Photographer | `nam` | `nam@jeju.local` | `Member@2026` | `/tai-khoan` và các public route |

## Kịch bản kiểm thử nhanh

### Khách chưa đăng nhập

1. Truy cập `/`, `/kham-pha`, `/lich-trinh` và `/van-hoa`.
2. Xác nhận các public route mở bình thường.
3. Truy cập `/tai-khoan`; hệ thống phải chuyển sang `/dang-nhap`.
4. Truy cập `/admin`; hệ thống phải chuyển sang `/dang-nhap`.

### Thành viên

1. Đăng nhập bằng `huy@jeju.local`.
2. Truy cập `/tai-khoan`; trang phải hiển thị tên và email.
3. Truy cập `/admin`; hệ thống phải chuyển về `/tai-khoan`.
4. Đăng xuất; gọi `/api/auth/me` phải trả `401`.

### Admin

1. Đăng nhập bằng `admin@jeju.local`.
2. Truy cập `/admin`; dashboard phải hiển thị.
3. Mở `/admin/users`; danh sách phải có đủ các tài khoản đã seed.
4. Chọn một Member, thêm role `EDITOR`, lưu và xác nhận badge role được cập nhật.
5. Vô hiệu hóa tài khoản đó và xác nhận tài khoản không thể đăng nhập; sau đó kích hoạt lại để hoàn nguyên dữ liệu test.
6. Xác nhận Admin hiện tại không thể tự tắt tài khoản hoặc tự gỡ role `ADMIN`.
7. Mở `/admin/content`; kiểm tra tạo bài, đổi trạng thái và lưu trữ.
8. Truy cập `/`, `/kham-pha`, `/lich-trinh`, `/van-hoa` hoặc `/tai-khoan`; hệ thống phải chuyển về `/admin`.

### Editor và Moderator

Hai role này đã được chuẩn bị trong database để phát triển workflow biên tập và kiểm duyệt sau này. Hiện tại chúng chỉ có quyền như `MEMBER`; chưa được phép truy cập khu vực admin.

## Lưu ý bảo mật

- File này chứa mật khẩu test công khai trong repository, vì vậy chỉ dùng cho dữ liệu local giả lập.
- Seed script có thể chạy nhiều lần. Nó cập nhật lại tên, mật khẩu và trạng thái của account test nhưng không tạo bản ghi trùng email.
- Không chạy `npm run seed:test` trên database production.
- Production phải dùng mật khẩu riêng, secret riêng và không bootstrap account từ tài liệu này.
