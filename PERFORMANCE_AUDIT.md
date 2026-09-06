# Hiệu năng và rà soát mã nguồn — 06/09/2026

## Kết quả đo trên máy local

| Chỉ số | Trước | Sau |
|---|---:|---:|
| JavaScript tải ban đầu trang chủ (Next build) | 236 KB | 130 KB |
| JavaScript tải thực tế (encodedBodySize, Chrome) | 230.031 B | 124.206 B |
| HTML trang chủ chưa nén | 66.175 B | 57.785 B |
| Video nền 1080p | 1.937.560 B | 643.492 B |
| Ảnh chân dung tải trên desktop | PNG 801.413 B | WebP 13.352 B (640px) |
| Số request font quan sát được | 7 | 3 |
| Dev, HTML total p50 (5 lượt sau warm-up) | 248,6 ms | 221,6 ms |
| Production, HTML total p50 (5 lượt sau warm-up) | 4,9 ms | 5,4 ms |
| CLS trong Chrome trace | 0 | 0 |

Không có bằng chứng production server mất 5 giây mỗi lượt tải. Hai mẫu production trên đều khoảng 5 ms, chênh lệch nhỏ là nhiễu đo. LCP quan sát local không giới hạn CPU/mạng: trước 241 ms, sau 277 ms; không dùng hai mẫu này để khẳng định cải thiện LCP thực tế. Chưa có số liệu người dùng thật hoặc đo qua mạng di động.

Log dev mới: biên dịch / trong 3,1 giây, GET đầu 4.527 ms, các GET tiếp theo 213–233 ms. Lần đầu npm run dev vẫn có chi phí biên dịch; dùng bản production để đánh giá tốc độ website triển khai.

## Các thay đổi

- Tách thư mục build: dev dùng .next-dev, production dùng .next. Trước đây hai server cùng workspace ghi đè manifest, từng gây lỗi routesManifest.dataRoutes is not iterable.
- Chỉ dùng Inter, bỏ font heading/mono tải riêng; mono dùng font hệ thống.
- Bỏ nextjs-toploader; trang một trang đã có thanh tiến trình cuộn riêng.
- Chỉ tải Toaster trong /admin (gồm login).
- Form công khai dùng HTML validation và React state, không kéo React Hook Form, Zod resolver và schema quản trị vào bundle trang chủ. Server vẫn kiểm tra bằng Zod.
- Các tab quản trị tải code khi mở, giữ panel đã mở để không mất bản nháp.
- Ảnh dùng Next Image responsive/WebP với local asset và các remote host đã cho phép; URL ảnh khác vẫn có fallback không tối ưu để không phá hồ sơ tùy chỉnh.
- Nén video H.264 CRF 28, giữ 1920×1080 và thời lượng. File gốc trong Media không đổi.
- Hồ sơ public dùng MongoDB projection chuyển data URL thành endpoint ngay trong truy vấn; không đưa toàn bộ base64 CV/avatar vào render.
- Gom các phép đọc vị trí trước khi cập nhật style cho hiệu ứng cuộn.
- Sửa redirect dự án cũ sang #work.
- Cập nhật loading skeleton và benchmark cho cấu trúc một trang.

## Code đã dọn

- 5 module không được tham chiếu: use-debounce, models/index, image-upload, social-icon, switch.
- 5 SVG mặc định của bộ khởi tạo Next.js.
- CSS của cấu trúc 4 trang cũ, Markdown/blog và utility glass không dùng.
- Hàm slugify, readingTime, formatNumber, truncate không còn người gọi.
- Nhánh slug, chuyển đổi ngày và public-read không dùng trong CRUD factory.
- Bỏ 2 package theo cây dependency của nextjs-toploader.

Không xóa dữ liệu MongoDB, CV, ảnh gốc, video gốc hoặc tài khoản. Media API được giữ vì CV uploader vẫn sử dụng.

## Kiểm tra

- Build production, ESLint, TypeScript.
- Fixture database/build độc lập: đăng nhập owner, lưu nội dung và cập nhật trang chủ, social CRUD/visibility, form liên hệ, quyền truy cập, chat streaming mock.
- Browser: form native báo thiếu dữ liệu và gửi thành công vào fixture; không gửi email thử đến Gmail thật.
- Browser: mọi tab admin mở được sau khi chuyển sang lazy import.
- Browser: CV đã upload được chuyển thành endpoint, trả PDF 200 và nội dung đúng; HTML không nhúng PDF base64.
- Desktop/mobile: không tràn ngang; ảnh và video hiển thị; chatbot trả lời qua dịch vụ mock.
- Các kiểm tra email mock xác minh thành công/thất bại/thiếu cấu hình; không cần gửi lại email thật cho thay đổi hiệu năng.

## Dependency audit

npm audit --omit=dev vẫn báo 6 mục high trong cây dependency (Next/PostCSS/Sharp và Auth/Nodemailer). Báo cáo của npm đề xuất cả thay đổi major và downgrade Auth, nên chưa áp dụng audit fix --force trong đợt tối ưu này. Không tuyên bố đã hoàn tất kiểm toán bảo mật; phần nâng cấp framework/dependency cần kiểm tra tương thích riêng.

## Chạy và đo lại

- npm run dev → http://localhost:3000 (phát triển).
- npm run build rồi npm run start -- --port 3200 → http://localhost:3200 (production).
- npm run perf:routes -- http://localhost:3200.
- npx tsx scripts/verify-fixture.ts.
- npx tsx scripts/verify-contact-email.ts.

Tham khảo chính thức:
- https://nextjs.org/docs/app/guides/lazy-loading
- https://nextjs.org/docs/app/api-reference/components/image
