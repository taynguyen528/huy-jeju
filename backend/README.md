# Jeju Backend

NestJS API độc lập cho chat Gemini, quản lý content và xác thực người dùng.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

API mặc định chạy tại `http://localhost:8787/api`.

## Endpoints

- `GET /api/health`
- `POST /api/chat`
- `GET /api/content/public`
- `GET /api/content`
- `POST /api/content`
- `PATCH /api/content/:id`
- `DELETE /api/content/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Auth sử dụng bcrypt để băm mật khẩu, JWT trong HttpOnly cookie và SQLite tại `data/jeju-ai.sqlite`. Trước khi triển khai, đặt `JWT_SECRET` dài, ngẫu nhiên trong `.env`; không commit `.env` hoặc database.

Kho content hiện nằm trong bộ nhớ. Khi triển khai production, nên thay `ContentService` bằng PostgreSQL/Prisma và bảo vệ route CMS bằng authentication/RBAC.
