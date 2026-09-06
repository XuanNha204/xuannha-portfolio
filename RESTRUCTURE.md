# Cấu trúc hiện tại

## Trang công khai
`src/app/(site)/page.tsx` kết hợp các section home, about, skills, contact. Header dùng liên kết neo; footer chứa liên kết xã hội. Những đường dẫn cũ chuyển hướng về section tương ứng. Sitemap chỉ có trang chính.

## Thành phần
- `src/features/landing`: video và hiệu ứng cuộn.
- `src/features/chat`: cửa sổ hội thoại, launcher video, streaming và hủy yêu cầu.
- `src/features/contact`: form hợp tác.
- `src/features/admin/content`: quản lý nội dung tập trung.
- `src/lib/site-content.ts`: schema và nội dung mẫu dùng chung CMS/public.
- `src/app/landing.css`: giao diện công khai, responsive và giảm chuyển động.
- `src/app/api/chat`: gọi AI từ server, giới hạn request và chỉ đưa hồ sơ công khai vào ngữ cảnh.
- `src/services` và `src/models`: dữ liệu/auth/media/liên hệ.

## Đã bỏ
Các trang blog, dự án, giới thiệu, liên hệ và mạng xã hội riêng; dashboard phân tích và CRUD không còn phục vụ portfolio. Dữ liệu nội dung cũ trong MongoDB local đã được dọn bằng script có phạm vi rõ ràng; giữ tài khoản owner.

Thiết kế mới ít chữ, nền video tối, các section màu kem và olive, điểm nhấn cam. Footer tham khảo cách chia cột, khoảng trắng và chữ nhỏ của Apple; không sao chép thương hiệu.

## Vận hành
Build và fixture kiểm tra độc lập. Khi triển khai cần MongoDB, AUTH_SECRET và nhà cung cấp AI hợp lệ. Khóa AI hiện có trên máy đã bị nhà cung cấp từ chối khi kiểm tra; cần cập nhật để có câu trả lời thật.
