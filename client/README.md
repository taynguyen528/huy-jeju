# Jeju Client

React + TypeScript frontend cho website du lịch Jeju. Backend NestJS nằm độc lập tại thư mục `../backend`.

## Chạy frontend

```powershell
npm install
npm run dev
```

Mở một terminal khác để chạy backend:

```powershell
cd ..\backend
npm install
Copy-Item .env.example .env
# Điền GEMINI_API_KEY trong .env
npm run dev
```

Frontend chạy tại `http://localhost:5173` và proxy `/api` sang backend tại cổng `8787`.

## Routes

- `/` hoặc `/lich-trinh`: trợ lý lập lịch trình.
- `/van-hoa`: danh sách bài văn hóa đã xuất bản.
- `/admin/content`: tạo bài, đổi trạng thái và lưu trữ nội dung.

## Bảo mật Gemini key

Frontend không đọc `GEMINI_API_KEY`. Trình duyệt gọi `/api/chat`; NestJS trong `../backend` mới gọi Gemini. Không đưa API key vào biến `VITE_*` vì các biến này xuất hiện trong bundle trình duyệt.

## Scripts

- `npm run dev`: chạy Vite frontend.
- `npm run build`: type-check và build production frontend.
- `npm run preview`: xem thử production build.
