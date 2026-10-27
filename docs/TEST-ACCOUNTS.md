# Tài khoản kiểm thử Jeju

## Phạm vi sử dụng

Database local hiện chỉ giữ một tài khoản Admin. Không sử dụng thông tin đăng nhập này trên staging hoặc production.

Chạy seed từ thư mục backend:

```powershell
cd C:\Users\ADMIN\Desktop\Huy\backend
npm run seed:test
```

## Tài khoản duy nhất

| Vai trò | Tên hiển thị | Tên đăng nhập | Email | Mật khẩu | Route kiểm tra |
| --- | --- | --- | --- | --- | --- |
| Admin + Member | Jeju Admin | `admin` | `pttnguyen528@gmail.com` | `Pttn2002@` | `/admin`, `/admin/content`, `/admin/users` |

Seed script chỉ tạo hoặc cập nhật tài khoản này; không còn tạo Editor, Moderator hoặc Member mẫu.

## Kịch bản kiểm thử nhanh

1. Mở `/dang-nhap` và đăng nhập bằng username `admin`.
2. Truy cập `/admin`; dashboard phải hiển thị.
3. Mở `/admin/users`; danh sách chỉ có tài khoản Admin.
4. Xác nhận Admin hiện tại không thể tự vô hiệu hóa hoặc tự gỡ role `ADMIN`.
5. Mở `/admin/content`; kiểm tra tạo bài, đổi trạng thái và lưu trữ.

## Lưu ý bảo mật

- Đây là thông tin đăng nhập dành riêng cho môi trường local/test.
- Không chạy `npm run seed:test` trên database production.
- Production phải dùng mật khẩu, secret và quy trình bootstrap riêng.
