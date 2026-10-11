# Yêu cầu chức năng chi tiết

## FR 01 About Us

**Nguồn nêu rõ:** trình bày quá trình hình thành, sứ mệnh, tầm nhìn, giá trị cốt lõi và công nghệ AI dùng để bảo tồn văn hóa Jeju.

Yêu cầu:

- CMS cho phép tạo, sửa, xóa hoặc ẩn các khối nội dung.
- Mỗi trang có tiêu đề, nội dung, ảnh hoặc media và thứ tự hiển thị.
- Quản trị được meta title, meta description, từ khóa hoặc tag, slug và canonical URL.
- Có trạng thái bản nháp, chờ duyệt, đã xuất bản và lưu trữ.

Tiêu chí nghiệm thu:

- Nội dung đã xuất bản hiển thị đúng thứ tự trên web.
- Thay đổi SEO trong CMS phản ánh ở HTML public.
- Bản nháp không truy cập được từ người dùng thông thường.

## FR 02 Home và Điểm đến

**Nguồn nêu rõ:** slider banner bản đồ Jeju, thanh tìm kiếm, tìm kiếm bằng AI; giao diện rõ ràng và tương thích trình duyệt phổ biến.

Yêu cầu:

- Hiển thị bản đồ Jeju với marker địa điểm.
- Tìm theo tên, khu vực, loại hình hoặc từ khóa.
- Có bộ lọc đề xuất: chủ đề văn hóa, miễn phí hoặc trả phí, đánh giá, khoảng cách và thời gian phù hợp. Bộ lọc là đề xuất cần xác nhận.
- Đồng bộ lựa chọn giữa map và danh sách; địa điểm đang chọn phải nổi bật.
- Kết quả hiển thị ảnh, tên, đánh giá, địa chỉ và mức giá khi có.
- Chi tiết địa điểm có mô tả, media, vị trí, giờ mở cửa, giá, liên hệ, liên kết ngoài và địa điểm liên quan.
- Người dùng có thể thêm địa điểm vào lịch trình.

Tiêu chí nghiệm thu:

- Tìm kiếm trả về kết quả phù hợp hoặc trạng thái không có kết quả.
- Chọn marker làm nổi bật card; chọn card định vị marker.
- Dữ liệu thiếu không tạo nhãn rỗng hoặc thông tin giả.

## FR 03 Lịch trình

**Nguồn nêu rõ:** tùy chỉnh lịch trình cá nhân, AI đề xuất theo thời gian và sở thích, thông báo đúng thời gian có mặt tại địa điểm. Hình tham khảo có bước chọn điểm đến và ngày đi về; lịch trình theo từng ngày; hoạt động, chi phí khác và ngân sách.

Yêu cầu:

- Nhập điểm đến, ngày đi, ngày về hoặc chọn “chưa xác định thời gian”.
- Thu thập sở thích, nhóm đi, nhịp độ, ngân sách và hạn chế nếu triển khai cá nhân hóa sâu.
- AI sinh lịch trình theo ngày và theo khung giờ.
- Thêm, sửa, xóa, kéo thả và đổi ngày cho hoạt động.
- Cảnh báo trùng giờ, thời gian di chuyển không khả thi hoặc địa điểm đóng cửa.
- Theo dõi ngân sách dự kiến theo hoạt động và chi phí khác.
- Lưu bản nháp và hoàn tất lịch trình.
- Thiết lập nhắc trước hoạt động; nhắc theo vị trí cần người dùng cấp quyền định vị.

Tiêu chí nghiệm thu:

- Ngày kết thúc không thể trước ngày bắt đầu.
- Hoạt động ngoài khoảng chuyến đi bị cảnh báo.
- Mọi thay đổi của người dùng được lưu mà không tự động bị AI ghi đè.
- Khi không thể sinh lịch trình, hệ thống giữ dữ liệu nhập và hướng dẫn thử lại.

## FR 04 Viết ngay và cộng đồng

Ba loại nội dung: trải nghiệm hoặc review, chia sẻ ảnh, hỏi đáp du lịch.

Yêu cầu:

- Trình soạn thảo có tiêu đề, nội dung, chủ đề, địa điểm liên quan, ảnh và tag.
- Review có điểm đánh giá; chia sẻ ảnh có caption và alt text; hỏi đáp có tiêu đề câu hỏi và mô tả.
- Lưu nháp, xem trước, gửi duyệt, xuất bản, sửa và xóa nội dung của chính mình.
- Hiển thị lượt xem, lượt thích, bình luận và chia sẻ nếu các tính năng tương tác được duyệt.
- Có báo cáo vi phạm và hàng đợi kiểm duyệt. Đây là đề xuất cần xác nhận nhưng nên có cho nội dung do người dùng tạo.

Tiêu chí nghiệm thu:

- Chỉ tác giả hoặc người có quyền mới sửa nội dung.
- Media sai định dạng hoặc quá dung lượng bị từ chối với thông báo rõ.
- Nội dung chưa duyệt không hiển thị công khai khi bật chế độ tiền kiểm.

## FR 05 Haenyeo

- Landing page gồm Giới thiệu, Điểm du lịch liên quan và Kinh nghiệm du lịch.
- Nội dung bao phủ lịch sử, văn hóa, đời sống, công cụ lặn, luật lệ cộng đồng.
- Hỗ trợ phỏng vấn đa phương tiện; nếu AI tham gia dịch, tóm tắt hoặc tạo phụ đề phải ghi nhãn.
- Bài dài có mục lục tự động từ heading và liên kết neo.
- Bài viết có trường SEO và structured data phù hợp.
- Ghi chú nguồn yêu cầu “Bỏ hình ảnh” khi click Haenyeo mâu thuẫn với ý phỏng vấn đa phương tiện; cần xác nhận là bỏ banner, bỏ thư viện ảnh hay bỏ toàn bộ hình.

## FR 06 Yeongdeunggut

- Bốn mục: Giới thiệu, Điểm du lịch liên quan, Hình ảnh, Kinh nghiệm du lịch.
- CMS quản lý bài, gallery và quan hệ với địa điểm.
- Thông tin lịch lễ hội phải có năm áp dụng và trạng thái xác minh.

## FR 07 Shaman và Shingugan

- Bốn mục: Giới thiệu, Điểm du lịch liên quan, Hình ảnh, Kinh nghiệm du lịch.
- Nội dung tín ngưỡng cần quy trình biên tập và nguồn tham khảo để tránh diễn giải sai văn hóa.
- Các khái niệm bản địa nên hỗ trợ tên gốc, phiên âm, bản dịch và chú giải.

## FR 08 Tài khoản và thông báo

- Hồ sơ người dùng, tùy chọn ngôn ngữ và thiết lập riêng tư.
- Danh sách lịch trình và nội dung đã tạo.
- Trung tâm thông báo có trạng thái đã đọc hoặc chưa đọc.
- Cấu hình loại thông báo, kênh nhận và thời điểm nhắc.
- Yêu cầu đăng nhập cho thao tác lưu hoặc xuất bản; phạm vi khách dùng AI cần xác nhận.

## FR 09 CMS và thống kê

- CRUD nội dung, địa điểm, danh mục, tag, media và cấu hình SEO.
- Quy trình bản nháp, gửi duyệt, xuất bản, gỡ và lưu trữ.
- Thống kê khách đang truy cập, lượt xem bài viết và nguồn truy cập.
- Nhật ký thay đổi ghi người thao tác, thời gian và nội dung thay đổi.
- Không nên hiển thị số liệu real time nếu hạ tầng chỉ hỗ trợ dữ liệu gần thời gian thực; cần ghi rõ độ trễ.

