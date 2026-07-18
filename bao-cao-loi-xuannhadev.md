# Báo cáo kiểm thử & Mô tả chi tiết lỗi — XuanNha.Dev

**Phạm vi kiểm thử:** xuannhadev.com (trang public) và xuannhadev.com/admin (CMS)
**Ngày kiểm thử:** 18/07/2026
**Người thực hiện:** Claude (kiểm thử thủ công qua trình duyệt)

---

## Tổng quan mức độ ưu tiên

| # | Lỗi | Mức độ | Khu vực |
|---|-----|--------|---------|
| 1 | Số liệu thống kê trang chủ không khớp dữ liệu thật | Cao | Trang chủ |
| 2 | Chatbot AI treo vô thời hạn, không phản hồi | Cao | Toàn site (widget chat) |
| 3 | Form liên hệ im lặng khi email sai định dạng | Cao | Trang Liên hệ |
| 4 | Đa ngôn ngữ (i18n) chỉ dịch nav + trang chủ | Trung bình | About / Projects / Contact / Blog |
| 5 | Toast thông báo thành công không tự tắt | Thấp | Trang Liên hệ |
| 6 | Chớp trắng khi chuyển trang | Thấp | Toàn site |
| 7 | Google Analytics / Search Console chưa cấu hình | Thấp (vận hành) | CMS > Cài đặt |

---

## Lỗi 1: Số liệu thống kê trang chủ không khớp dữ liệu thật

**Vị trí:** Trang chủ (`/`), section thống kê ngay dưới phần giới thiệu (4 ô: Dự án hoàn thành, Bài viết chia sẻ, Kỹ năng công nghệ, Lượt truy cập).

**Mô tả hiện tượng:**
Trang chủ hiển thị bộ đếm động (animation đếm từ 0 lên số đích) cho 4 chỉ số, nhưng số đích đang sai:

| Chỉ số | Hiển thị trên trang chủ | Dữ liệu thật trong CMS |
|--------|--------------------------|--------------------------|
| Dự án hoàn thành | 0+ | 2 |
| Bài viết chia sẻ | 0+ | 1 |
| Kỹ năng công nghệ | 1+ | 8 |
| Lượt truy cập | 101+ | 627 (tổng lượt xem theo Dashboard CMS) |

**Cách tái hiện:**
1. Mở `xuannhadev.com`, cuộn xuống section thống kê (dưới phần giới thiệu bản thân).
2. So sánh với CMS: `/admin` (Dashboard), `/admin/projects`, `/admin/posts`, `/admin/skills`.

**Nguyên nhân khả nghi:**
Component thống kê trang chủ đang lấy dữ liệu từ nguồn khác (có thể hardcode giá trị mặc định, hoặc gọi sai API/collection, hoặc field đếm chưa được cập nhật khi thêm dữ liệu mới trong CMS).

**Đề xuất sửa:**
- Đảm bảo component thống kê query trực tiếp `count()` từ bảng `projects` (trạng thái "Công khai"), bảng `posts` (trạng thái "Công khai"), bảng `skills`, và bảng lượt xem/analytics — thay vì giá trị tĩnh.
- Thêm cache/revalidate hợp lý (ISR hoặc `revalidateTag`) để số liệu cập nhật khi CMS thay đổi mà không cần rebuild toàn site.
- Viết 1 test đơn giản: thêm 1 dự án mới trong CMS → kiểm tra số trên trang chủ tăng theo.

---

## Lỗi 2: Chatbot AI (Trợ lý AI) treo vô thời hạn

**Vị trí:** Widget chat nổi ở góc dưới phải, xuất hiện trên mọi trang.

**Mô tả hiện tượng:**
Khi bấm vào 1 trong các câu hỏi gợi ý (ví dụ "Có những dự án nào nổi bật?"), giao diện hiển thị "Trợ lý đang trả lời..." và không bao giờ kết thúc. Theo dõi tab Network, request `POST https://xuannhadev.com/api/chat` giữ trạng thái **pending** vĩnh viễn (đã chờ hơn 15 giây không có phản hồi, không timeout, không báo lỗi).

**Cách tái hiện:**
1. Vào bất kỳ trang nào, bấm icon chat góc dưới phải.
2. Bấm 1 câu hỏi gợi ý bất kỳ hoặc gõ câu hỏi rồi Enter.
3. Quan sát: khung chat kẹt ở trạng thái loading vĩnh viễn.

**Nguyên nhân khả nghi:**
- Endpoint `/api/chat` bị lỗi ở backend (có thể do API key AI hết hạn/thiếu, hoặc lỗi kết nối tới provider AI) nhưng không trả về response hoặc không có timeout xử lý.
- Không có cơ chế timeout ở phía client để huỷ request và hiển thị thông báo lỗi.

**Đề xuất sửa:**
- Kiểm tra log server cho route `/api/chat` để xác định nguyên nhân request không bao giờ resolve (lỗi kết nối provider, thiếu API key, deadlock trong streaming response...).
- Thêm timeout phía client (ví dụ 15-20 giây) — nếu quá hạn, huỷ request và hiển thị "Xin lỗi, trợ lý đang gặp sự cố, vui lòng thử lại sau."
- Thêm try/catch và trả lỗi rõ ràng (status code + message) ở phía API thay vì để hàng chờ vô hạn.
- Cân nhắc thêm nút "Huỷ" trong lúc đang chờ phản hồi.

---

## Lỗi 3: Form liên hệ không báo lỗi khi email sai định dạng

**Vị trí:** Trang Liên hệ (`/contact`), form gửi tin nhắn.

**Mô tả hiện tượng:**
- Khi điền đầy đủ thông tin nhưng trường Email nhập giá trị không đúng định dạng (ví dụ `invalidemail`, thiếu ký tự `@`), rồi bấm nút "Gửi tin nhắn":
  - Không có thông báo lỗi nào xuất hiện (không có text đỏ dưới field, không có toast lỗi).
  - Không có request nào được gửi đi (kiểm tra Network không thấy request POST tới API liên hệ).
  - Nút bấm không phản hồi gì cả — người dùng không biết vì sao form "không hoạt động".
- Khi sửa lại email đúng định dạng (`test@example.com`) và bấm gửi lại, form hoạt động bình thường: gửi thành công, hiện toast xanh "Đã gửi tin nhắn! Tôi sẽ phản hồi sớm nhất có thể.", form tự động xóa nội dung.

**Cách tái hiện:**
1. Vào `/contact`.
2. Điền Họ tên, Email = `invalidemail` (sai định dạng), Nội dung.
3. Bấm "Gửi tin nhắn".
4. Quan sát: không có phản hồi nào từ giao diện.

**Nguyên nhân khả nghi:**
Validation email chỉ tồn tại ở phía trước khi submit thật (hoặc validate silent-fail), nhưng không có UI feedback khi validation thất bại — có thể do điều kiện `if (!isValid) return;` mà thiếu bước `setError()`/hiển thị thông báo.

**Đề xuất sửa:**
- Thêm validate rõ ràng cho từng field (required, đúng định dạng email) và hiển thị thông báo lỗi ngay dưới field tương ứng (ví dụ: "Email không hợp lệ").
- Có thể dùng thuộc tính HTML `type="email"` kết hợp validate JS để trình duyệt tự hiển thị tooltip lỗi gốc, hoặc tự custom UI lỗi đồng bộ với thiết kế site.
- Disable nút gửi hoặc hiển thị rung nhẹ (shake animation) khi submit thất bại do validation, để người dùng biết hành động của họ đã được ghi nhận.

---

## Lỗi 4: Đa ngôn ngữ (i18n) chưa hoàn chỉnh

**Vị trí:** Toàn site khi chuyển ngôn ngữ sang English (dropdown góc phải header).

**Mô tả hiện tượng:**
Khi chuyển ngôn ngữ từ Tiếng Việt sang English:
- Menu điều hướng và trang chủ (`/`) được dịch đầy đủ và chính xác (Home, About, Projects, Blog, Contact, "Hi, I'm Huỳnh Xuân Nhã", "View projects"...).
- Các trang **About** (`/about`), **Projects** (`/projects`), **Contact** (`/contact`) vẫn hiển thị 100% nội dung tiếng Việt (tiêu đề, mô tả, nhãn form, nút bấm...) dù ngôn ngữ đã chuyển sang EN.
- Tiêu đề tab trình duyệt (`<title>`) của trang Projects vẫn là "Dự án | XuanNha.Dev" thay vì bản dịch tiếng Anh.
- Chưa kiểm tra kỹ 中文 (tiếng Trung) nhưng nhiều khả năng gặp tình trạng tương tự.

**Cách tái hiện:**
1. Vào bất kỳ trang nào, bấm dropdown ngôn ngữ (cờ + mã ngôn ngữ) ở header.
2. Chọn "English".
3. Điều hướng qua About / Projects / Contact — nội dung không đổi sang tiếng Anh.

**Nguyên nhân khả nghi:**
Các trang này có thể đang lấy nội dung trực tiếp từ CMS (vốn chỉ lưu 1 ngôn ngữ — tiếng Việt) thay vì qua lớp dịch (i18n dictionary) như trang chủ. Trang chủ có thể dùng content tĩnh đã được dịch sẵn trong code, còn các trang còn lại render thẳng dữ liệu CMS.

**Đề xuất sửa:**
- Quyết định kiến trúc: hoặc (a) lưu nội dung CMS đa ngôn ngữ (mỗi field có bản VI/EN/中文), hoặc (b) chỉ dịch phần UI cố định (label, nút, tiêu đề section) còn nội dung do người dùng nhập (dự án, bài viết, giới thiệu) giữ nguyên ngôn ngữ gốc — nhưng cần thông báo rõ cho người dùng biết (ví dụ: hiển thị badge "Nội dung gốc: Tiếng Việt").
- Nếu chọn hướng (a): thêm các trường đa ngôn ngữ trong CMS (Hồ sơ, Dự án, Bài viết) và cập nhật component hiển thị để chọn đúng ngôn ngữ.
- Cập nhật `<title>` và `meta description` động theo ngôn ngữ đang chọn.

---

## Lỗi 5: Toast thông báo thành công không tự đóng

**Vị trí:** Trang Liên hệ, sau khi gửi tin nhắn thành công.

**Mô tả hiện tượng:**
Sau khi gửi form liên hệ thành công, toast xanh "Đã gửi tin nhắn! Tôi sẽ phản hồi sớm nhất có thể." xuất hiện ở góc trên phải và **không tự biến mất** dù đã chờ hơn 8 giây. Toast che khuất nút chuyển theme (sáng/tối) và dropdown ngôn ngữ, khiến các nút này không bấm được cho đến khi người dùng chủ động bấm nút "X" để đóng toast.

**Cách tái hiện:**
1. Gửi thành công 1 tin nhắn ở `/contact`.
2. Chờ 5-10 giây, quan sát toast vẫn còn nguyên, che nút theme/ngôn ngữ.

**Đề xuất sửa:**
Thêm auto-dismiss cho toast (thời gian đề xuất: 3-5 giây), đồng thời đảm bảo toast không đè lên các control tương tác khác (có thể dịch vị trí xuống dưới header, hoặc thu nhỏ z-index khu vực tương tác của toast).

---

## Lỗi 6: Chớp trắng khi chuyển trang / chuyển ngôn ngữ

**Vị trí:** Toàn site, rõ nhất khi chuyển trang trong lúc đang ở chế độ ngôn ngữ khác Tiếng Việt (ví dụ chuyển sang Home khi đang ở English).

**Mô tả hiện tượng:**
Có khoảng thời gian ngắn (khoảng 1-2 giây) trang hiển thị trắng hoàn toàn (chỉ còn header) trước khi nội dung render ra. Đây nhiều khả năng là vấn đề hiệu năng tải/hydrate (Next.js) hơn là lỗi chức năng, nhưng ảnh hưởng đến trải nghiệm và có thể khiến người dùng tưởng trang bị lỗi.

**Đề xuất sửa:**
- Thêm skeleton loading hoặc giữ nguyên nội dung trang cũ trong lúc chờ trang mới load (transition mượt hơn) thay vì để trắng trơn.
- Kiểm tra kích thước bundle JS và cân nhắc code-splitting/lazy load hợp lý hơn cho các trang nặng.

---

## Lỗi 7 (vận hành): Google Analytics / Search Console chưa được cấu hình

**Vị trí:** CMS > Cài đặt > Tích hợp Google.

**Mô tả hiện tượng:**
Trường "Google Analytics ID" và "Search Console verification" đang để trống. Điều này đồng nghĩa số liệu "lượt truy cập" hiện tại trên site (nếu có) không đến từ Google Analytics chính thức, và site chưa được xác minh với Google Search Console — ảnh hưởng khả năng theo dõi traffic thực và SEO index.

**Đề xuất:**
Tạo Google Analytics 4 property và Search Console property cho domain, sau đó điền ID/mã xác minh vào 2 trường này trong CMS.

---

## Ghi chú thêm

- Trong quá trình kiểm thử, đã gửi 1 tin nhắn test qua form liên hệ (tên "Test User", email test@example.com) — tin nhắn này hiện đang nằm trong CMS > Tin nhắn ở trạng thái "Mới". Nên xóa hoặc đánh dấu đã đọc để hộp thư không bị nhiễu dữ liệu test.
- Các chức năng hoạt động tốt, không phát hiện lỗi: điều hướng menu, chuyển đổi theme sáng/tối, dropdown chọn ngôn ngữ (về mặt UI), form liên hệ với dữ liệu hợp lệ, các trang CMS (Dự án, Bài viết, Kỹ năng, Hồ sơ, Media, Tin nhắn, Cài đặt) đều truy cập và hiển thị dữ liệu đúng.

---

## Đề xuất thứ tự xử lý

1. Lỗi 2 (chatbot treo) và Lỗi 3 (form im lặng khi lỗi) — ảnh hưởng trực tiếp đến khả năng khách hàng liên hệ, nên ưu tiên cao nhất.
2. Lỗi 1 (số liệu sai) — ảnh hưởng ấn tượng đầu tiên của khách truy cập trang chủ.
3. Lỗi 4 (i18n chưa hoàn chỉnh) — cần quyết định kiến trúc trước khi sửa, nên lên kế hoạch riêng.
4. Lỗi 5, 6 — cải thiện UX, có thể làm sau.
5. Lỗi 7 — công việc vận hành, làm khi rảnh.
