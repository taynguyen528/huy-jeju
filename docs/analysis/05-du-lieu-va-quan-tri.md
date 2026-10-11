# Dữ liệu và hệ thống quản trị

## 1. Thực thể dữ liệu khái niệm

| Thực thể | Trường chính đề xuất | Quan hệ |
| --- | --- | --- |
| User | id, tên, email, vai trò, ngôn ngữ, trạng thái | Có nhiều lịch trình, bài viết, thông báo |
| Destination | tên, slug, mô tả, tọa độ, địa chỉ, giờ mở cửa, giá, trạng thái xác minh | Có media, review, tag, bài văn hóa |
| CulturalTopic | tên, slug, mô tả, thứ tự | Có nhiều article và destination |
| Article | loại, tiêu đề, slug, nội dung, tác giả, nguồn, trạng thái, SEO | Thuộc topic; liên kết destination và media |
| CommunityPost | loại bài, nội dung, tác giả, trạng thái kiểm duyệt | Có media, bình luận, phản ứng, báo cáo |
| Review | điểm số, nội dung, tác giả, trạng thái | Thuộc destination |
| Itinerary | chủ sở hữu, điểm đến, ngày, sở thích, ngân sách, trạng thái | Có nhiều itinerary day và activity |
| Activity | thời gian, thời lượng, chi phí, ghi chú, nguồn tạo | Có thể liên kết destination |
| Notification | loại, lịch gửi, kênh, trạng thái đọc và gửi | Thuộc user và có thể thuộc activity |
| Media | file, loại, caption, alt text, bản quyền | Được dùng bởi article, destination, post |
| SEOProfile | title, description, canonical, index rule, social image | Thuộc trang hoặc nội dung |
| AIConversation | session, user, ngôn ngữ, thời gian, consent | Có nhiều message và event |

## 2. Quan hệ quan trọng

- Một địa điểm có thể liên quan nhiều chủ đề văn hóa và ngược lại.
- Một bài văn hóa có thể dẫn đến nhiều địa điểm.
- Một lịch trình gồm nhiều ngày; mỗi ngày gồm nhiều hoạt động có thứ tự.
- Hoạt động do AI tạo phải có `source = AI` nhưng sau khi người dùng sửa vẫn giữ lịch sử nguồn.
- Media cần metadata bản quyền và văn bản thay thế.

## 3. Trạng thái nội dung

```text
Nháp -> Chờ duyệt -> Đã xuất bản -> Đã lưu trữ
                    \-> Bị gỡ
Chờ duyệt -> Yêu cầu sửa -> Nháp
Chờ duyệt -> Từ chối
```

Không xóa cứng nội dung đã từng xuất bản trừ yêu cầu pháp lý hoặc bảo mật. Dùng soft delete và audit log.

## 4. Phân quyền đề xuất

| Hành động | Thành viên | Biên tập viên | Kiểm duyệt viên | Admin |
| --- | --- | --- | --- | --- |
| Sửa nội dung cá nhân | Có | Có | Có | Có |
| Tạo bài văn hóa | Không | Có | Có | Có |
| Duyệt bài văn hóa | Không | Không mặc định | Có | Có |
| Kiểm duyệt cộng đồng | Không | Không mặc định | Có | Có |
| Quản lý danh mục và SEO toàn site | Không | Hạn chế | Hạn chế | Có |
| Quản lý người dùng và vai trò | Không | Không | Không | Có |

## 5. Chức năng CMS

- Dashboard chỉ số chính và công việc chờ xử lý.
- Quản lý trang tĩnh, bài viết, chủ đề, địa điểm, tag và media.
- Trình soạn thảo hỗ trợ heading, mục lục, nhúng media và xem trước responsive.
- Quản lý quan hệ “địa điểm liên quan” và “bài liên quan”.
- Thiết lập SEO từng trang và giá trị mặc định toàn site.
- Lịch xuất bản, phiên bản, khôi phục và audit log.
- Hàng đợi kiểm duyệt cộng đồng, báo cáo và lý do xử lý.
- Import hoặc export dữ liệu địa điểm nếu có nguồn dữ liệu lớn.

## 6. Chất lượng dữ liệu

- Địa điểm cần thời điểm xác minh gần nhất và nguồn dữ liệu.
- Không cho xuất bản địa điểm thiếu tên, tọa độ hoặc mô tả tối thiểu.
- Giờ mở cửa hỗ trợ ngoại lệ theo ngày lễ và khoảng thời gian mùa vụ.
- Giá phải có đơn vị tiền tệ và ghi rõ miễn phí hoặc chưa có dữ liệu.
- Dữ liệu văn hóa cần nguồn tham khảo và người kiểm duyệt chuyên môn.
- Nội dung trùng slug, URL hỏng hoặc media không dùng cần được CMS cảnh báo.

