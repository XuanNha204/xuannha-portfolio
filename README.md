# Xuân Nhã — Portfolio một trang

Website gồm một trang công khai `/` và trang quản lý `/admin`.

- Video mở đầu → giới thiệu và ảnh → kỹ năng mẫu → hợp tác → footer và mạng xã hội.
- Hiệu ứng cuộn tự nhiên: thu nhỏ khung video, chữ đổi màu, thẻ kỹ năng xếp lớp, nội dung xuất hiện khi cuộn.
- Tôn trọng chế độ giảm chuyển động của thiết bị; nút trên video cho phép bật lại hiệu ứng.
- Trợ lý Cam ở góc phải dùng video thú cưng đã tách nền.

## Chạy
1. `npm install`
2. Tạo `.env.local` theo `.env.example`, điền MongoDB và cấu hình đăng nhập.
3. `npm run seed` nếu chưa có tài khoản.
4. `npm run dev`.

Dev chạy ở cổng 3000, dùng `.next-dev`; production dùng `.next`. Để xem tốc độ thực tế: `npm run build` rồi `npm run start -- --port 3200`. Lần tải đầu trong dev có thêm thời gian biên dịch. Xem `PERFORMANCE_AUDIT.md` cho số đo trước/sau và phạm vi rà soát.

## Quản lý
Đăng nhập tại `/admin/login`. Chỉnh tiêu đề, lời giới thiệu, video/ảnh nền, kỹ năng, email hợp tác, footer, chatbot, hồ sơ, ảnh, mạng xã hội, SEO; đọc tin nhắn và đổi mật khẩu tại `/admin`.
Các kỹ năng ban đầu là nội dung mẫu để chủ website chỉnh lại. Form liên hệ lưu vào hộp thư quản trị và gửi thông báo Gmail khi đã cấu hình. Nếu gửi email lỗi, tin nhắn vẫn được giữ; trạng thái thông báo hiện trong quản trị.

## Nhận thông báo Gmail

1. Bật xác minh 2 bước và tạo Mật khẩu ứng dụng tại https://myaccount.google.com/apppasswords.
2. Điền GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_NOTIFICATION_EMAIL trong .env.local. Không đưa mật khẩu lên Git.
3. Chạy `npx tsx scripts/verify-gmail.ts` để kiểm tra xác thực, không gửi thư.
4. Khởi động lại server. Khi triển khai, cấu hình cùng biến môi trường trên máy chủ.

Email chứa tên, email và nội dung lời nhắn; Reply-To là email người gửi. Địa chỉ nhận do server cấu hình, không lấy từ request khách. Nội dung là văn bản thuần. Website lưu tin trước khi gửi email. Trạng thái sent nghĩa là SMTP chấp nhận thư; kiểm tra cả Spam. Không tự gửi lại thư thất bại hoặc tin nhắn cũ.

Kiểm tra độc lập: `npx tsx scripts/verify-contact-email.ts` (mock, không gửi email thật).
Hướng dẫn: https://support.google.com/accounts/answer/185833 và https://nodemailer.com/guides/using-gmail.

## AI
API key chỉ nằm phía máy chủ. Chọn nhà cung cấp qua `CHAT_PROVIDER_ORDER`; cấu hình `OPENAI_*`, `LLAMA_*`, `DEEPSEEK_*` hoặc `GEMINI_*` theo nhà cung cấp. Endpoint phải tương thích Chat Completions streaming.
Chatbot lấy ngữ cảnh từ nội dung công khai trong CMS, giới hạn độ dài/tần suất, có hủy trả lời và báo lỗi kết nối. Hội thoại chỉ nằm trong bộ nhớ của tab.
Cần key hợp lệ và model mà tài khoản được cấp quyền. Không có key hợp lệ, giao diện vẫn mở nhưng API báo chưa kết nối; không dùng câu trả lời giả.

## Tài nguyên
Các file gốc trong `Media/` được dùng cho video nền, ảnh chân dung và thú cưng. Chatbot hiện dùng `Media/petChatBot.mp4`. Bản phục vụ web nằm ở `public/media/`: video nền bỏ âm thanh và faststart; `pet-chat.webm` có alpha, `pet-chat.mp4` dự phòng, poster và avatar đồng bộ. File nguồn được giữ nguyên.

## Kiểm tra
```sh
npm run lint
npm run build
npx tsx scripts/verify-compact.ts http://localhost:3200
npx tsx scripts/verify-fixture.ts
```
Fixture dùng database/build tạm, kiểm tra đăng nhập, CMS, liên hệ, chuyển hướng và streaming AI qua máy chủ mô phỏng; tự dọn sau kiểm tra. Không dùng mật khẩu owner thật.

`scripts/reset-single-page.ts` là công cụ chuyển đổi có chủ ý xóa dữ liệu nội dung cũ, chỉ cho database local xuannha-dev và yêu cầu cờ `--apply`. Đã chạy cho bản local này; không chạy lại để tránh mất nội dung mới. Tài khoản đăng nhập được giữ.
