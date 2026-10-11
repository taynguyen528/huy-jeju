# Kịch bản thuyết trình chức năng lịch trình AI

> Cập nhật: 11/10/2026  
> Nghiệp vụ mẫu: chuẩn bị chuyến đi Jeju vào cuối tháng 10 năm 2026

## 1. Mục tiêu trình diễn

Trình bày một luồng nghiệp vụ hoàn chỉnh: thành viên nhập nhu cầu thực tế, Taewak tạo lịch trình cụ thể, người dùng lưu kết quả và mở lại lịch trình trong tài khoản cá nhân. AI đóng vai trò đề xuất; người dùng quyết định nội dung nào được lưu.

## 2. Dữ liệu demo đề xuất

| Trường | Giá trị mẫu |
| --- | --- |
| Điểm đến | Jeju, Hàn Quốc |
| Ngày đi | 27/10/2026 |
| Ngày về | 31/10/2026 |
| Số người | 2 người |
| Sở thích | Văn hóa, Thiên nhiên, Ẩm thực |
| Nhịp độ | Cân bằng |
| Phương tiện | Xe buýt và taxi |
| Ngân sách | 1.500.000 KRW |

Prompt mẫu:

```text
Hãy tạo lịch trình chi tiết cho toàn bộ chuyến đi. Mỗi ngày cần có khung giờ, địa điểm, thời lượng, cách di chuyển, chi phí ước tính và phương án khi thời tiết xấu. Cuối cùng tổng hợp ngân sách và checklist cần chuẩn bị.
```

## 3. Các bước trình diễn

1. Đăng nhập bằng tài khoản thành viên trong `TEST-ACCOUNTS.md`.
2. Mở `/lich-trinh`.
3. Nhập dữ liệu demo ở bảng trên.
4. Gửi prompt mẫu cho Taewak.
5. Giải thích rằng toàn bộ thông tin form được gửi kèm làm context; AI phải ưu tiên dữ liệu mới nhất từ form.
6. Khi câu trả lời hoàn tất, nhấn **Lưu lịch trình**.
7. Mở `/tai-khoan` và chỉ ra số chuyến đi đã lưu.
8. Nhấn biểu tượng xem để mở toàn bộ lịch trình AI.
9. Trình diễn thao tác lưu trữ một lịch trình không còn sử dụng.

## 4. Kết quả mong đợi

- AI trình bày lịch theo từng ngày thực tế từ 27 đến 31/10/2026.
- Mỗi hoạt động có thời gian và mô tả di chuyển.
- Câu trả lời có ngân sách, lưu ý đặt trước và checklist.
- Lịch trình được lưu trong SQLite và vẫn tồn tại sau khi restart backend.
- Thành viên chỉ nhìn thấy lịch trình thuộc tài khoản của mình.
- Admin không thể sử dụng hoặc đọc không gian lịch trình cá nhân.

## 5. Giới hạn cần nói rõ khi thuyết trình

- Giờ mở cửa, giá và thời tiết chưa được đồng bộ từ nguồn dữ liệu thời gian thực.
- Google Places và bản đồ đang được hoãn.
- Nội dung AI là đề xuất và cần được người dùng kiểm tra trước chuyến đi.
- Phiên bản hiện tại lưu nguyên nội dung AI; chỉnh sửa từng hoạt động và kéo thả sẽ phát triển ở bước tiếp theo.
