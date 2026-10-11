# Thiết kế cơ sở dữ liệu

## 1. Mục tiêu và phạm vi

Tài liệu này đề xuất cơ sở dữ liệu PostgreSQL cho hệ thống Jeju, bao gồm:

- Tài khoản và phân quyền.
- CMS quản lý nội dung văn hóa.
- Địa điểm du lịch và dữ liệu liên quan.
- Bài viết cộng đồng, đánh giá và tương tác.
- Lịch trình du lịch.
- Thông báo.
- Hội thoại với trợ lý AI.
- Lịch sử phiên bản và nhật ký quản trị.

SEO chưa nằm trong phạm vi hiện tại. Vì vậy thiết kế không có bảng hoặc thuộc tính dành riêng cho SEO.

Quy ước chung:

- Khóa chính dùng `UUID`.
- Thời gian dùng `TIMESTAMPTZ` và lưu theo UTC.
- Các bảng nghiệp vụ chính có `created_at` và `updated_at`.
- Dữ liệu đã xuất bản hoặc có phát sinh tương tác sử dụng `deleted_at` để xóa mềm.
- File ảnh và video được lưu ở object storage; database chỉ lưu metadata và URL.
- Các giá trị tiền tệ dùng `DECIMAL`, không dùng `FLOAT`.

## 2. Sơ đồ quan hệ tổng quát

```text
users ──< user_roles >── roles
  │
  ├──< contents ──< content_revisions
  │       ├──< content_tags >── tags
  │       ├──< content_media >── media
  │       └──< content_destinations >── destinations
  │
  ├──< community_posts ──< comments
  │          ├──< reactions
  │          ├──< reports
  │          └──< post_media >── media
  │
  ├──< reviews >── destinations
  ├──< itineraries ──< itinerary_days ──< activities
  ├──< notifications
  └──< ai_conversations ──< ai_messages

cultural_topics ──< contents
cultural_topics ──< topic_destinations >── destinations
users ──< audit_logs
```

## 3. Tài khoản và phân quyền

### 3.1. Bảng `users`

Đại diện cho tài khoản thành viên, biên tập viên, kiểm duyệt viên và quản trị viên.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh người dùng. |
| `email` | VARCHAR(255) | Unique, Not null | Email đăng nhập. |
| `password_hash` | VARCHAR(255) | Nullable | Mật khẩu đã băm; có thể rỗng nếu đăng nhập OAuth. |
| `display_name` | VARCHAR(120) | Not null | Tên hiển thị. |
| `avatar_url` | TEXT | Nullable | Ảnh đại diện. |
| `preferred_language` | VARCHAR(10) | Default `vi` | Ngôn ngữ ưu tiên. |
| `status` | ENUM | Not null | `ACTIVE`, `SUSPENDED`, `DEACTIVATED`. |
| `email_verified_at` | TIMESTAMPTZ | Nullable | Thời điểm xác minh email. |
| `last_login_at` | TIMESTAMPTZ | Nullable | Lần đăng nhập gần nhất. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Thời điểm xóa mềm. |

Chức năng đại diện: đăng ký, đăng nhập, hồ sơ, khóa tài khoản và xác định chủ sở hữu dữ liệu.

### 3.2. Bảng `roles`

Danh mục vai trò của hệ thống.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh vai trò. |
| `code` | VARCHAR(50) | Unique | `ADMIN`, `EDITOR`, `MODERATOR`, `MEMBER`. |
| `name` | VARCHAR(100) | Not null | Tên hiển thị. |
| `description` | TEXT | Nullable | Mô tả phạm vi vai trò. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |

### 3.3. Bảng `user_roles`

Bảng nối nhiều-nhiều giữa người dùng và vai trò.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | UUID | PK, FK → `users.id` | Người dùng. |
| `role_id` | UUID | PK, FK → `roles.id` | Vai trò được gán. |
| `assigned_by` | UUID | FK → `users.id` | Người thực hiện cấp quyền. |
| `assigned_at` | TIMESTAMPTZ | Not null | Thời điểm cấp quyền. |

Unique key: `(user_id, role_id)`.

Chức năng đại diện: RBAC và kiểm soát quyền truy cập CMS.

## 4. CMS nội dung văn hóa

### 4.1. Bảng `cultural_topics`

Danh mục chủ đề văn hóa như Haenyeo, Yeongdeunggut, Shaman và Shingugan.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh chủ đề. |
| `name` | VARCHAR(150) | Not null | Tên chủ đề. |
| `slug` | VARCHAR(180) | Unique | Đường dẫn thân thiện. |
| `description` | TEXT | Nullable | Mô tả ngắn. |
| `sort_order` | INTEGER | Default `0` | Thứ tự hiển thị. |
| `is_active` | BOOLEAN | Default `true` | Có hiển thị chủ đề hay không. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |

Chức năng đại diện: menu và landing page theo chủ đề văn hóa.

### 4.2. Bảng `contents`

Bảng trung tâm lưu bài văn hóa và trang nội dung do đội ngũ biên tập quản lý.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh nội dung. |
| `type` | ENUM | Not null | `ARTICLE`, `STATIC_PAGE`, `CULTURE_STORY`. |
| `title` | VARCHAR(250) | Not null | Tiêu đề. |
| `slug` | VARCHAR(250) | Unique khi chưa xóa | Đường dẫn nội dung. |
| `excerpt` | TEXT | Nullable | Tóm tắt dùng trên card và danh sách. |
| `body` | JSONB | Not null | Các block nội dung của trình soạn thảo. |
| `status` | ENUM | Not null | Trạng thái biên tập. |
| `topic_id` | UUID | FK → `cultural_topics.id`, Nullable | Chủ đề chính. |
| `author_id` | UUID | FK → `users.id` | Tác giả. |
| `reviewed_by` | UUID | FK → `users.id`, Nullable | Người duyệt gần nhất. |
| `reviewed_at` | TIMESTAMPTZ | Nullable | Thời điểm duyệt. |
| `review_note` | TEXT | Nullable | Lý do yêu cầu sửa hoặc từ chối. |
| `published_at` | TIMESTAMPTZ | Nullable | Thời điểm xuất bản thực tế. |
| `scheduled_at` | TIMESTAMPTZ | Nullable | Thời điểm dự kiến xuất bản. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

Giá trị `status`:

```text
DRAFT
PENDING_REVIEW
CHANGES_REQUESTED
PUBLISHED
UNPUBLISHED
REJECTED
ARCHIVED
```

`body` nên lưu cấu trúc block JSON thay vì HTML thô để hỗ trợ heading, ảnh, trích dẫn và mục lục mà không phụ thuộc một trình soạn thảo cụ thể.

Chức năng đại diện: tạo bài, lưu nháp, gửi duyệt, duyệt bài, xuất bản, gỡ bài và lưu trữ.

### 4.3. Bảng `content_revisions`

Lưu snapshot các phiên bản quan trọng của nội dung.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh phiên bản. |
| `content_id` | UUID | FK → `contents.id` | Nội dung gốc. |
| `version_number` | INTEGER | Not null | Số phiên bản tăng dần. |
| `title` | VARCHAR(250) | Not null | Tiêu đề tại phiên bản này. |
| `excerpt` | TEXT | Nullable | Tóm tắt tại phiên bản này. |
| `body` | JSONB | Not null | Nội dung snapshot. |
| `status` | ENUM | Not null | Trạng thái khi tạo snapshot. |
| `edited_by` | UUID | FK → `users.id` | Người tạo thay đổi. |
| `change_note` | TEXT | Nullable | Ghi chú thay đổi. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo phiên bản. |

Unique key: `(content_id, version_number)`.

Chức năng đại diện: xem lịch sử, so sánh và khôi phục phiên bản.

### 4.4. Bảng `tags`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh tag. |
| `name` | VARCHAR(100) | Unique | Tên tag. |
| `slug` | VARCHAR(120) | Unique | Mã dùng trong URL hoặc bộ lọc. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |

### 4.5. Bảng `content_tags`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `content_id` | UUID | PK, FK → `contents.id` | Nội dung. |
| `tag_id` | UUID | PK, FK → `tags.id` | Tag. |

Chức năng đại diện: gắn nhãn, lọc và tìm nội dung liên quan.

## 5. Media

### 5.1. Bảng `media`

Lưu metadata của ảnh, video hoặc audio; không lưu binary file trực tiếp.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh media. |
| `storage_key` | TEXT | Unique | Khóa file trong object storage. |
| `public_url` | TEXT | Not null | URL truy cập file. |
| `media_type` | ENUM | Not null | `IMAGE`, `VIDEO`, `AUDIO`. |
| `mime_type` | VARCHAR(100) | Not null | MIME type. |
| `size_bytes` | BIGINT | Not null | Dung lượng file. |
| `width` | INTEGER | Nullable | Chiều rộng ảnh/video. |
| `height` | INTEGER | Nullable | Chiều cao ảnh/video. |
| `duration_seconds` | INTEGER | Nullable | Thời lượng video/audio. |
| `alt_text` | TEXT | Nullable | Văn bản thay thế. |
| `caption` | TEXT | Nullable | Chú thích. |
| `copyright_owner` | VARCHAR(250) | Nullable | Chủ sở hữu bản quyền. |
| `uploaded_by` | UUID | FK → `users.id` | Người tải lên. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tải lên. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

### 5.2. Bảng `content_media`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `content_id` | UUID | PK, FK → `contents.id` | Nội dung. |
| `media_id` | UUID | PK, FK → `media.id` | Media. |
| `role` | ENUM | Not null | `COVER`, `INLINE`, `GALLERY`. |
| `sort_order` | INTEGER | Default `0` | Thứ tự hiển thị. |

Chức năng đại diện: ảnh bìa, media nhúng và thư viện ảnh của bài viết.

## 6. Địa điểm du lịch

### 6.1. Bảng `destinations`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh địa điểm. |
| `name` | VARCHAR(250) | Not null | Tên địa điểm. |
| `slug` | VARCHAR(250) | Unique khi chưa xóa | Đường dẫn. |
| `description` | TEXT | Nullable | Mô tả. |
| `address` | TEXT | Nullable | Địa chỉ. |
| `latitude` | DECIMAL(9,6) | Not null | Vĩ độ. |
| `longitude` | DECIMAL(9,6) | Not null | Kinh độ. |
| `opening_hours` | JSONB | Nullable | Giờ mở cửa và ngoại lệ. |
| `pricing` | JSONB | Nullable | Mức giá, đơn vị tiền và ghi chú. |
| `phone` | VARCHAR(50) | Nullable | Điện thoại. |
| `website_url` | TEXT | Nullable | Website chính thức. |
| `verification_status` | ENUM | Not null | `UNVERIFIED`, `VERIFIED`, `OUTDATED`. |
| `verified_at` | TIMESTAMPTZ | Nullable | Lần xác minh gần nhất. |
| `data_source` | TEXT | Nullable | Nguồn dữ liệu. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

Chức năng đại diện: tìm kiếm, bản đồ, chi tiết địa điểm và dữ liệu dùng để lập lịch trình.

### 6.2. Bảng `content_destinations`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `content_id` | UUID | PK, FK → `contents.id` | Bài viết. |
| `destination_id` | UUID | PK, FK → `destinations.id` | Địa điểm. |
| `relation_type` | ENUM | Not null | `FEATURED`, `RELATED`, `MENTIONED`. |
| `sort_order` | INTEGER | Default `0` | Thứ tự hiển thị. |

### 6.3. Bảng `topic_destinations`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `topic_id` | UUID | PK, FK → `cultural_topics.id` | Chủ đề văn hóa. |
| `destination_id` | UUID | PK, FK → `destinations.id` | Địa điểm liên quan. |
| `sort_order` | INTEGER | Default `0` | Thứ tự hiển thị. |

Chức năng đại diện: địa điểm liên quan trong bài và landing page văn hóa.

## 7. Cộng đồng và đánh giá

### 7.1. Bảng `community_posts`

Tách khỏi `contents` vì bài cộng đồng có quyền sở hữu, kiểm duyệt và tương tác khác với bài biên tập.

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh bài. |
| `type` | ENUM | Not null | `EXPERIENCE`, `PHOTO_SHARE`, `QUESTION`. |
| `title` | VARCHAR(250) | Not null | Tiêu đề hoặc câu hỏi. |
| `body` | TEXT | Not null | Nội dung. |
| `author_id` | UUID | FK → `users.id` | Tác giả. |
| `destination_id` | UUID | FK → `destinations.id`, Nullable | Địa điểm liên quan. |
| `moderation_status` | ENUM | Not null | `DRAFT`, `PENDING`, `PUBLISHED`, `REJECTED`, `REMOVED`. |
| `moderation_note` | TEXT | Nullable | Lý do xử lý. |
| `moderated_by` | UUID | FK → `users.id`, Nullable | Người kiểm duyệt. |
| `moderated_at` | TIMESTAMPTZ | Nullable | Thời điểm kiểm duyệt. |
| `published_at` | TIMESTAMPTZ | Nullable | Thời điểm công khai. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

### 7.2. Bảng `post_media`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `post_id` | UUID | PK, FK → `community_posts.id` | Bài cộng đồng. |
| `media_id` | UUID | PK, FK → `media.id` | Media. |
| `sort_order` | INTEGER | Default `0` | Thứ tự. |

### 7.3. Bảng `comments`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh bình luận. |
| `post_id` | UUID | FK → `community_posts.id` | Bài được bình luận. |
| `author_id` | UUID | FK → `users.id` | Người bình luận. |
| `parent_id` | UUID | FK → `comments.id`, Nullable | Bình luận cha. |
| `body` | TEXT | Not null | Nội dung bình luận. |
| `status` | ENUM | Not null | `VISIBLE`, `HIDDEN`, `REMOVED`. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm sửa. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

### 7.4. Bảng `reactions`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh phản ứng. |
| `user_id` | UUID | FK → `users.id` | Người tương tác. |
| `target_type` | ENUM | Not null | `POST`, `COMMENT`, `REVIEW`. |
| `target_id` | UUID | Not null | ID đối tượng. |
| `reaction_type` | ENUM | Not null | Trước mắt dùng `LIKE`. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tương tác. |

Unique key: `(user_id, target_type, target_id, reaction_type)`.

### 7.5. Bảng `reports`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh báo cáo. |
| `reporter_id` | UUID | FK → `users.id` | Người báo cáo. |
| `target_type` | ENUM | Not null | `POST`, `COMMENT`, `REVIEW`. |
| `target_id` | UUID | Not null | Đối tượng bị báo cáo. |
| `reason` | ENUM | Not null | Loại vi phạm. |
| `description` | TEXT | Nullable | Mô tả bổ sung. |
| `status` | ENUM | Not null | `OPEN`, `RESOLVED`, `DISMISSED`. |
| `handled_by` | UUID | FK → `users.id`, Nullable | Người xử lý. |
| `handled_at` | TIMESTAMPTZ | Nullable | Thời điểm xử lý. |
| `resolution_note` | TEXT | Nullable | Kết quả xử lý. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm báo cáo. |

### 7.6. Bảng `reviews`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh đánh giá. |
| `destination_id` | UUID | FK → `destinations.id` | Địa điểm. |
| `author_id` | UUID | FK → `users.id` | Người đánh giá. |
| `rating` | SMALLINT | Check `1..5` | Điểm đánh giá. |
| `body` | TEXT | Nullable | Nội dung đánh giá. |
| `status` | ENUM | Not null | `PENDING`, `PUBLISHED`, `REJECTED`, `REMOVED`. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

Unique key đề xuất: `(destination_id, author_id)` nếu mỗi người chỉ được đánh giá một lần cho một địa điểm.

Chức năng đại diện của nhóm bảng này: viết ngay, chia sẻ ảnh, hỏi đáp, bình luận, thích, báo cáo vi phạm và đánh giá địa điểm.

## 8. Lịch trình

### 8.1. Bảng `itineraries`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh lịch trình. |
| `owner_id` | UUID | FK → `users.id` | Chủ sở hữu. |
| `title` | VARCHAR(250) | Not null | Tên chuyến đi. |
| `destination_name` | VARCHAR(250) | Not null | Điểm đến tổng quát. |
| `start_date` | DATE | Nullable | Ngày bắt đầu. |
| `end_date` | DATE | Nullable | Ngày kết thúc. |
| `date_flexible` | BOOLEAN | Default `false` | Chưa xác định thời gian. |
| `travelers` | INTEGER | Not null | Số người. |
| `interests` | JSONB | Nullable | Sở thích đầu vào. |
| `pace` | ENUM | Nullable | `RELAXED`, `BALANCED`, `INTENSIVE`. |
| `budget_amount` | DECIMAL(14,2) | Nullable | Ngân sách dự kiến. |
| `budget_currency` | CHAR(3) | Default `KRW` | Đơn vị tiền. |
| `status` | ENUM | Not null | `DRAFT`, `COMPLETED`, `ARCHIVED`. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

Ràng buộc: `end_date >= start_date` khi cả hai có giá trị.

### 8.2. Bảng `itinerary_days`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh ngày. |
| `itinerary_id` | UUID | FK → `itineraries.id` | Lịch trình cha. |
| `day_number` | INTEGER | Not null | Ngày thứ mấy. |
| `date` | DATE | Nullable | Ngày thực tế. |
| `title` | VARCHAR(250) | Nullable | Chủ đề của ngày. |
| `note` | TEXT | Nullable | Ghi chú. |

Unique key: `(itinerary_id, day_number)`.

### 8.3. Bảng `activities`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh hoạt động. |
| `itinerary_day_id` | UUID | FK → `itinerary_days.id` | Ngày chứa hoạt động. |
| `destination_id` | UUID | FK → `destinations.id`, Nullable | Địa điểm có sẵn trong hệ thống. |
| `title` | VARCHAR(250) | Not null | Tên hoạt động. |
| `start_time` | TIME | Nullable | Giờ bắt đầu. |
| `end_time` | TIME | Nullable | Giờ kết thúc. |
| `duration_minutes` | INTEGER | Nullable | Thời lượng dự kiến. |
| `estimated_cost` | DECIMAL(14,2) | Nullable | Chi phí dự kiến. |
| `currency` | CHAR(3) | Default `KRW` | Đơn vị tiền. |
| `note` | TEXT | Nullable | Ghi chú. |
| `source` | ENUM | Not null | `USER`, `AI`, `SYSTEM`. |
| `sort_order` | INTEGER | Not null | Thứ tự trong ngày. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |

### 8.4. Bảng `itinerary_expenses`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh chi phí. |
| `itinerary_id` | UUID | FK → `itineraries.id` | Lịch trình. |
| `label` | VARCHAR(200) | Not null | Tên khoản chi. |
| `amount` | DECIMAL(14,2) | Not null | Số tiền. |
| `currency` | CHAR(3) | Default `KRW` | Đơn vị tiền. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |

Chức năng đại diện: tạo lịch trình, chỉnh sửa từng ngày, kéo thả hoạt động, cảnh báo lịch và theo dõi ngân sách.

## 9. Thông báo

### 9.1. Bảng `notifications`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh thông báo. |
| `user_id` | UUID | FK → `users.id` | Người nhận. |
| `type` | ENUM | Not null | Loại thông báo. |
| `title` | VARCHAR(250) | Not null | Tiêu đề. |
| `message` | TEXT | Not null | Nội dung. |
| `data` | JSONB | Nullable | Dữ liệu điều hướng liên quan. |
| `scheduled_at` | TIMESTAMPTZ | Nullable | Thời gian dự kiến gửi. |
| `sent_at` | TIMESTAMPTZ | Nullable | Thời gian đã gửi. |
| `read_at` | TIMESTAMPTZ | Nullable | Thời gian đã đọc. |
| `status` | ENUM | Not null | `PENDING`, `SENT`, `FAILED`, `CANCELLED`. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |

### 9.2. Bảng `notification_preferences`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | UUID | PK, FK → `users.id` | Người dùng. |
| `type` | ENUM | PK | Loại thông báo. |
| `in_app_enabled` | BOOLEAN | Default `true` | Nhận trong ứng dụng. |
| `email_enabled` | BOOLEAN | Default `false` | Nhận qua email. |
| `reminder_minutes` | INTEGER | Nullable | Số phút nhắc trước. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |

Chức năng đại diện: trung tâm thông báo, trạng thái đã đọc và thiết lập kênh nhận.

## 10. Trợ lý AI

### 10.1. Bảng `ai_conversations`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh hội thoại. |
| `user_id` | UUID | FK → `users.id`, Nullable | Người dùng; rỗng nếu khách. |
| `session_id` | VARCHAR(150) | Not null | Phiên trình duyệt. |
| `itinerary_id` | UUID | FK → `itineraries.id`, Nullable | Lịch trình đang được hỗ trợ. |
| `title` | VARCHAR(250) | Nullable | Tên hội thoại. |
| `language` | VARCHAR(10) | Default `vi` | Ngôn ngữ. |
| `model` | VARCHAR(100) | Nullable | Model AI sử dụng. |
| `consent_at` | TIMESTAMPTZ | Nullable | Thời điểm đồng ý lưu dữ liệu AI. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm tạo. |
| `updated_at` | TIMESTAMPTZ | Not null | Thời điểm cập nhật. |
| `deleted_at` | TIMESTAMPTZ | Nullable | Xóa mềm. |

### 10.2. Bảng `ai_messages`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh tin nhắn. |
| `conversation_id` | UUID | FK → `ai_conversations.id` | Hội thoại. |
| `role` | ENUM | Not null | `USER`, `ASSISTANT`, `SYSTEM`. |
| `content` | TEXT | Not null | Nội dung tin nhắn. |
| `metadata` | JSONB | Nullable | Token, model, latency hoặc lỗi. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm gửi. |

Chức năng đại diện: lịch sử chat, tiếp tục hội thoại và liên kết kết quả AI với lịch trình.

Không nên lưu prompt hoặc dữ liệu cá nhân nhạy cảm nếu người dùng chưa đồng ý.

## 11. Nhật ký quản trị

### 11.1. Bảng `audit_logs`

| Thuộc tính | Kiểu | Ràng buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | UUID | PK | Định danh sự kiện. |
| `actor_id` | UUID | FK → `users.id`, Nullable | Người thực hiện; rỗng nếu hệ thống. |
| `action` | VARCHAR(100) | Not null | Ví dụ `CONTENT_PUBLISHED`. |
| `entity_type` | VARCHAR(100) | Not null | Loại đối tượng. |
| `entity_id` | UUID | Not null | ID đối tượng. |
| `before_data` | JSONB | Nullable | Giá trị trước thay đổi. |
| `after_data` | JSONB | Nullable | Giá trị sau thay đổi. |
| `ip_address` | INET | Nullable | IP thực hiện. |
| `user_agent` | TEXT | Nullable | Thiết bị hoặc trình duyệt. |
| `created_at` | TIMESTAMPTZ | Not null | Thời điểm xảy ra. |

Chức năng đại diện: truy vết thao tác quản trị, điều tra lỗi và kiểm tra ai đã thay đổi dữ liệu.

`content_revisions` và `audit_logs` không thay thế nhau: revision giữ phiên bản có thể khôi phục; audit log ghi lại hành động đã xảy ra.

## 12. Ánh xạ bảng sang chức năng

| Bảng | Module NestJS đề xuất | Chức năng đại diện |
| --- | --- | --- |
| `users` | `AuthModule`, `UsersModule` | Đăng nhập, hồ sơ, trạng thái tài khoản. |
| `roles`, `user_roles` | `AuthModule` | RBAC và phân quyền CMS. |
| `cultural_topics` | `TopicsModule` | Chủ đề và menu văn hóa. |
| `contents` | `ContentModule` | CRUD bài biên tập và quy trình xuất bản. |
| `content_revisions` | `ContentModule` | Lịch sử và khôi phục nội dung. |
| `tags`, `content_tags` | `TagsModule`, `ContentModule` | Gắn tag, lọc và nội dung liên quan. |
| `media` | `MediaModule` | Upload và thư viện media. |
| `content_media` | `ContentModule`, `MediaModule` | Ảnh bìa, ảnh nhúng và gallery. |
| `destinations` | `DestinationsModule` | Tìm kiếm, bản đồ và chi tiết địa điểm. |
| `content_destinations` | `ContentModule` | Địa điểm được nhắc hoặc đề xuất trong bài. |
| `topic_destinations` | `TopicsModule` | Địa điểm liên quan trên landing văn hóa. |
| `community_posts` | `CommunityModule` | Trải nghiệm, chia sẻ ảnh và hỏi đáp. |
| `post_media` | `CommunityModule`, `MediaModule` | Media của bài cộng đồng. |
| `comments` | `CommentsModule` | Bình luận và trả lời. |
| `reactions` | `ReactionsModule` | Lượt thích và phản ứng. |
| `reports` | `ModerationModule` | Báo cáo vi phạm và hàng đợi xử lý. |
| `reviews` | `ReviewsModule` | Đánh giá địa điểm. |
| `itineraries` | `ItinerariesModule` | Thông tin tổng quát của chuyến đi. |
| `itinerary_days` | `ItinerariesModule` | Lịch trình theo ngày. |
| `activities` | `ItinerariesModule` | Hoạt động theo giờ và địa điểm. |
| `itinerary_expenses` | `ItinerariesModule` | Chi phí khác và tổng ngân sách. |
| `notifications` | `NotificationsModule` | Tạo, gửi và đọc thông báo. |
| `notification_preferences` | `NotificationsModule` | Cấu hình kênh và thời gian nhắc. |
| `ai_conversations` | `ChatModule` | Phiên hội thoại AI. |
| `ai_messages` | `ChatModule` | Tin nhắn và lịch sử chat. |
| `audit_logs` | `AuditModule` | Nhật ký thay đổi toàn hệ thống. |

## 13. Ánh xạ chức năng sang bảng

| Chức năng sản phẩm | Bảng chính | Bảng hỗ trợ |
| --- | --- | --- |
| Đăng ký và đăng nhập | `users` | `roles`, `user_roles`, `audit_logs` |
| Phân quyền quản trị | `roles`, `user_roles` | `users`, `audit_logs` |
| Danh sách bài văn hóa | `contents` | `cultural_topics`, `content_media`, `media`, `tags` |
| Chi tiết bài văn hóa | `contents` | `content_media`, `media`, `content_destinations`, `destinations` |
| Tạo và sửa bài CMS | `contents` | `content_revisions`, `tags`, `media`, `audit_logs` |
| Duyệt và xuất bản bài | `contents` | `content_revisions`, `users`, `audit_logs`, `notifications` |
| Khôi phục phiên bản bài | `content_revisions` | `contents`, `audit_logs` |
| Thư viện media | `media` | `content_media`, `post_media`, `users` |
| Bản đồ và tìm địa điểm | `destinations` | `reviews`, `topic_destinations` |
| Landing chủ đề văn hóa | `cultural_topics` | `contents`, `topic_destinations`, `destinations` |
| Viết trải nghiệm hoặc hỏi đáp | `community_posts` | `post_media`, `media`, `tags` nếu cần dùng chung |
| Bình luận và thích | `comments`, `reactions` | `community_posts`, `users` |
| Báo cáo và kiểm duyệt | `reports` | `community_posts`, `comments`, `reviews`, `audit_logs` |
| Đánh giá địa điểm | `reviews` | `destinations`, `users`, `reactions` |
| Tạo lịch trình | `itineraries` | `itinerary_days`, `activities`, `destinations` |
| Theo dõi ngân sách | `activities`, `itinerary_expenses` | `itineraries` |
| Nhắc hoạt động | `notifications` | `activities`, `notification_preferences` |
| Chat với Taewak | `ai_conversations`, `ai_messages` | `itineraries`, `users` |
| Dashboard CMS | `contents`, `users`, `audit_logs` | `reports`, `community_posts`, `destinations` |

## 14. Index và ràng buộc quan trọng

Các index tối thiểu nên có:

```sql
CREATE UNIQUE INDEX contents_slug_unique
ON contents (slug)
WHERE deleted_at IS NULL;

CREATE INDEX contents_public_list
ON contents (status, published_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX contents_topic_list
ON contents (topic_id, status, published_at DESC);

CREATE INDEX destinations_name_search
ON destinations USING GIN (name gin_trgm_ops);

CREATE INDEX notifications_inbox
ON notifications (user_id, read_at, created_at DESC);

CREATE INDEX activities_day_order
ON activities (itinerary_day_id, sort_order);

CREATE INDEX ai_messages_timeline
ON ai_messages (conversation_id, created_at);

CREATE INDEX audit_entity_history
ON audit_logs (entity_type, entity_id, created_at DESC);
```

Các ràng buộc nghiệp vụ chính:

- `itineraries.end_date >= itineraries.start_date`.
- `activities.end_time > activities.start_time` khi cả hai có giá trị.
- `reviews.rating` nằm trong khoảng từ 1 đến 5.
- Chỉ nội dung có `status = PUBLISHED` và `published_at <= now()` mới xuất hiện công khai.
- Một slug chưa xóa chỉ thuộc về một content hoặc destination.
- Không xóa cứng nội dung đã xuất bản, lịch sử duyệt hoặc audit log.
- Không cho xuất bản ảnh quan trọng nếu thiếu `alt_text` hoặc thông tin bản quyền bắt buộc.

## 15. Phạm vi triển khai theo giai đoạn

### Giai đoạn 1: CMS hiện tại

Triển khai trước:

```text
users
roles
user_roles
cultural_topics
contents
content_revisions
tags
content_tags
media
content_media
audit_logs
```

Nhóm này thay thế kho dữ liệu trong bộ nhớ của `ContentService`, đủ cho route `/van-hoa` và `/admin/content`.

### Giai đoạn 2: Địa điểm và lịch trình

```text
destinations
content_destinations
topic_destinations
itineraries
itinerary_days
activities
itinerary_expenses
```

### Giai đoạn 3: Cộng đồng và thông báo

```text
community_posts
post_media
comments
reactions
reports
reviews
notifications
notification_preferences
```

### Giai đoạn 4: Lưu lịch sử AI

```text
ai_conversations
ai_messages
```

Việc chia giai đoạn giúp backend không phải triển khai toàn bộ schema ngay từ đầu, nhưng vẫn giữ cấu trúc đủ ổn định để mở rộng mà không cần gộp hoặc tách lại các bảng nghiệp vụ chính.
