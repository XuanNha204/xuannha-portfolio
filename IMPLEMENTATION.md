# Báo cáo hiện thực hóa dự án — XuanNha.Dev (Vibe Coding Studio)

> Tài liệu ghi lại toàn bộ những gì đã được xây dựng từ Project Blueprint v2.0, ngày 07/07/2026.
> Kết quả: **~100 file mã nguồn, build thành công 38 routes, đã seed dữ liệu và kiểm thử thực tế trên server production.**

---

## 1. Tổng quan

| Hạng mục | Kết quả |
|---|---|
| Framework | Next.js **15.5** (App Router, Turbopack) + React **19** |
| Ngôn ngữ | TypeScript (strict) |
| Styling | Tailwind CSS **v4** (design token qua `@theme`) |
| Database | MongoDB + Mongoose (14 collections) |
| Auth | NextAuth **v5** (Credentials, JWT session, role-based) |
| Storage | MongoDB Media collection (data URL/base64 cho ảnh, video, PDF nhỏ) |
| Trạng thái build | ✅ `next build` thành công — 38 routes |
| Kiểm thử | ✅ Smoke test 12 routes, login flow, rate limiting |

---

## 2. Quá trình thực hiện (theo thứ tự)

### Bước 1 — Scaffold & cài đặt
- Scaffold bằng `create-next-app@15` (TS, Tailwind, ESLint, App Router, `src/`, alias `@/*`).
- Cài dependencies: `mongoose`, `next-auth@beta`, `bcryptjs`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `framer-motion`, `lucide-react`, `lenis`, `embla-carousel-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `sonner`, `react-markdown`, `remark-gfm`, `recharts`, `tsx`.

### Bước 2 — Core lib (`src/lib/`)
| File | Vai trò |
|---|---|
| `db.ts` | Kết nối MongoDB có cache global (tránh tạo connection mới mỗi hot-reload) |
| `auth.ts` + `auth.config.ts` | NextAuth v5 — tách config edge-safe cho middleware, Credentials provider + bcrypt |
| `media` API | Upload file multipart, convert thành data URL/base64 và lưu trong MongoDB |
| `utils.ts` | `cn()`, `slugify()` (hỗ trợ tiếng Việt), `readingTime()`, `formatDate()`, `absoluteUrl()`… |
| `rate-limit.ts` | Rate limiter in-memory (sliding window) |
| `api-helpers.ts` | `requireOwner()`, `parseBody()` (Zod), `jsonError()` |
| `crud-factory.ts` | Factory sinh route handlers GET/POST/PUT/DELETE — tái sử dụng cho 7 resource |
| `fetcher.ts` | Client fetch wrapper (`apiGet/Post/Put/Patch/Delete`) có `ApiError` |

### Bước 3 — Mongoose models (`src/models/` — 14 collections)
`User` (kiêm Profile của Owner), `Project` (gallery ảnh nhúng), `BlogPost` (SEO object, schedule), `Category`, `Tag`, `Skill`, `Experience`, `Education`, `Certificate`, `Message`, `SocialLink`, `SiteSettings` (singleton), `Media`, `Analytics` (view theo path + ngày, unique index).

### Bước 4 — Validation & Service layer
- `src/schemas/index.ts` — 13 Zod schemas (login, contact, project, blogPost, category, tag, skill, experience, education, certificate, socialLink, profile, siteSettings) + types suy ra.
- `src/services/` — `project.service`, `blog.service` (tự động publish bài hẹn giờ đến hạn), `profile.service`, `settings.service`, `stats.service` (aggregate analytics). **Mọi hàm đọc public đều có try/catch fallback** → website không sập khi DB mất kết nối, build không cần DB.
- `src/types/index.ts` — DTO types (dữ liệu đã serialize) cho Client Components.

### Bước 5 — Auth & bảo mật
- `src/middleware.ts` — chặn toàn bộ `/admin/*`, redirect về `/admin/login`; đã đăng nhập thì không vào lại được trang login.
- JWT session 7 ngày, role `owner` nhúng trong token.
- Mọi API ghi dữ liệu đều qua `requireOwner()` + Zod validation.
- Rate limiting: form liên hệ (3 req/phút/IP), analytics beacon (60 req/phút/IP).
- Security headers trong `next.config.ts` (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy).

### Bước 6 — API Routes (`src/app/api/` — 26 endpoints)
| Nhóm | Endpoints |
|---|---|
| Auth | `auth/[...nextauth]` |
| Nội dung | `projects` + `[id]`, `posts` + `[id]` (slug tự sinh + chống trùng, readingTime tự tính, publishedAt tự set) |
| Taxonomy | `categories`, `tags` (+`[id]`) — dùng CRUD factory |
| Hồ sơ | `skills`, `experiences`, `educations`, `certificates`, `social-links` (+`[id]`) — CRUD factory |
| Khác | `contact` (public, rate-limited), `messages` + `[id]` (read/archive/delete), `media` + `[id]` (upload multipart → MongoDB data URL, max 8MB), `profile`, `settings`, `analytics/track` (beacon), `dashboard` (thống kê) |

### Bước 7 — Design System
- `globals.css`: đủ bảng màu blueprint (`#111827`, `#1F2937`, `#3B82F6`, `#F8FAFC`…), shadow tokens, keyframes shimmer, utility `container-page`, `skeleton`, và bộ style `.prose-custom` cho Markdown.
- Fonts qua `next/font`: **Inter** (body), **Space Grotesk** (heading), **JetBrains Mono** (code) — subset `vietnamese`.
- UI kit kiểu Shadcn (`src/components/ui/`): `Button` (variants + loading state), `Input`, `Textarea`, `Label`, `Badge`, `Card`, `Skeleton` (shimmer), `Switch`, `Select`, `Dialog` (Framer Motion + portal).

### Bước 8 — Animation & Interaction
| Yêu cầu blueprint | Hiện thực |
|---|---|
| Smooth scrolling | `SmoothScroll` — Lenis, hỗ trợ anchor, RAF loop |
| Page transitions | `PageTransition` — AnimatePresence fade/slide theo pathname |
| Scroll reveal | `Reveal` (up/down/left/right/scale) + `RevealGroup`/`RevealItem` (stagger) |
| Horizontal slider | `ProjectSlider` — drag-to-scroll (Pointer Events), wheel dọc → cuộn ngang, snap, nút prev/next, thanh tiến trình, chặn click sau khi drag |
| Carousel | `ProjectGallery` — Embla: drag, touch, loop, keyboard, dots |
| Hover animation | Card scale/shadow/border/image-zoom/icon-slide |
| Counter | `AnimatedCounter` — spring count-up khi vào viewport |
| Micro interaction | Sonner toast, skeleton loading, accordion tin nhắn, dialog transition |

### Bước 9 — Public site (`src/app/(site)/`)
- **Home** (`/`) — Hero (grid + glow background, stagger animation, social links), About Preview, Featured Projects, Statistics (counter động từ DB), Skills (progress bar animate), Latest Blog, Contact CTA. ISR 60s.
- **About** (`/about`) — intro + avatar, mục tiêu nghề nghiệp, **timeline** kinh nghiệm & học vấn, kỹ năng, chứng chỉ, nút tải CV.
- **Projects** (`/projects`) — horizontal slider cho dự án nổi bật + grid toàn bộ; **chi tiết** (`/projects/[slug]`): gallery, demo/github/video buttons, vai trò, tech stack, 3 khối Khó khăn/Giải pháp/Kết quả, JSON-LD, tự tăng view.
- **Blog** (`/blog`) — search, lọc category, phân trang; **chi tiết** (`/blog/[slug]`): Markdown render (GFM), reading time, view count, tags, related posts, metadata SEO riêng từng bài, JSON-LD BlogPosting.
- **Contact** (`/contact`) — form RHF + Zod, thông tin liên hệ, social links, tải CV.
- `not-found.tsx` — trang 404 riêng.

### Bước 10 — CMS (`/admin`)
- **Login** (`/admin/login`) — dark UI, NextAuth signIn.
- **Dashboard** — 4 thẻ thống kê (view/dự án/bài viết/tin nhắn + số chưa đọc), **biểu đồ Recharts** lượt xem 30 ngày, top pages.
- **Project Manager** — bảng có search + filter trạng thái + phân trang; form 2 cột: thông tin, câu chuyện dự án (khó khăn/giải pháp/kết quả), **upload nhiều ảnh gallery**, cover, links, tech stack, featured, draft/publish/archive, ngày hoàn thành, thứ tự.
- **Blog Manager** — bảng quản lý; form: **Markdown editor + tab Preview**, khối SEO (meta title/description/keywords/canonical), category, tags, featured, **hẹn giờ đăng bài** (tự publish khi đến hạn), quản lý danh mục qua dialog.
- **Skill Manager** — nhóm theo category, slider mức độ 1–100, ẩn/hiện, thứ tự.
- **Profile Manager** — 5 tab: Thông tin (avatar + CV PDF upload), Kinh nghiệm, Học vấn, Chứng chỉ, Mạng xã hội — tất cả CRUD qua component `CrudSection` tái sử dụng.
- **Media Manager** — grid ảnh/video/PDF, upload nhiều file vào MongoDB, copy data URL, xóa record DB, lọc theo loại, phân trang.
- **Message Manager** — hộp thư/chưa đọc/lưu trữ, mở tin tự đánh dấu đã đọc, trả lời qua mailto, lưu trữ/xóa.
- **Site Settings** — tên site, tagline, footer, logo, ảnh OG, SEO mặc định, Google Analytics ID, Search Console verification.

### Bước 11 — SEO
- Metadata động từ DB (`generateMetadata` ở root + từng trang), template title.
- Open Graph + Twitter Card, canonical URL.
- **`sitemap.xml`** động (trang tĩnh + mọi slug project/blog), **`robots.txt`** (chặn `/admin`, `/api`), **`rss.xml`** (20 bài mới nhất, cache 1h).
- Structured Data JSON-LD: `CreativeWork` (project), `BlogPosting` (blog).
- Analytics tự vận hành: client beacon (`navigator.sendBeacon`) → `Analytics` collection → biểu đồ dashboard.

### Bước 12 — Seed & tài liệu
- `scripts/seed.ts` (chạy `npm run seed`, thêm `-- --demo` để có dữ liệu mẫu) — tự đọc `.env.local`, tạo owner (bcrypt), site settings, demo skills/category/social/project/blog.
- `.env.example` — mẫu đầy đủ biến môi trường.
- `.env.local` — đã tạo sẵn với `AUTH_SECRET` ngẫu nhiên.
- `README.md` — hướng dẫn cài đặt, seed, chạy, deploy.

---

## 3. Lỗi gặp phải & cách xử lý

| Vấn đề | Xử lý |
|---|---|
| Tên thư mục `Portfolio` viết hoa → npm từ chối tạo project | Scaffold vào thư mục tạm rồi move vào `D:\Portfolio` |
| `lucide-react` v1 đã xóa brand icons (Github, Facebook…) | Hạ xuống `lucide-react@0.469.0` |
| Mongoose 9 không còn export type `FilterQuery` | Bỏ import, cast an toàn tại chỗ gọi |
| ESLint `react/jsx-no-comment-textnodes` với text trang trí `// about` | Bọc thành chuỗi `{"// about"}` |
| Keyframes trong `@theme` không được emit khi dùng trực tiếp | Khai báo thêm `@keyframes shimmer` ở top-level CSS |

---

## 4. Kết quả kiểm thử (production server thật)

```
200  /                    200  /blog/vibe-coding-la-gi
200  /about               200  /projects/xuannha-dev-vibe-coding-studio
200  /projects            200  /admin/login
200  /blog                307  /admin  ← middleware redirect đúng
200  /contact             200  /sitemap.xml · /rss.xml · /robots.txt
```

- **Login flow**: POST `api/auth/callback/credentials` → session trả `role=owner` → gọi được `/api/dashboard` (protected) ✅
- **Contact + rate limit**: 3 request đầu `201`, request thứ 4 `429` ✅
- **Seed**: owner + settings + demo data tạo thành công ✅

---

## 5. Cấu trúc thư mục cuối cùng

```
D:\Portfolio
├── scripts/seed.ts              # Seed owner + demo data
├── src/
│   ├── app/
│   │   ├── (site)/              # Public: /, about, projects(+slug), blog(+slug), contact, 404
│   │   ├── admin/               # login + (dashboard)/: dashboard, projects, posts, skills,
│   │   │                        #   profile, media, messages, settings
│   │   ├── api/                 # 26 route handlers
│   │   ├── layout.tsx           # Fonts + metadata động + Providers
│   │   ├── globals.css          # Design tokens Tailwind v4
│   │   ├── sitemap.ts / robots.ts / rss.xml/route.ts
│   ├── components/              # ui/ (10 components), layout/, motion/ (4), shared/ (6)
│   ├── features/                # home/ (7 sections), projects/, contact/, admin/ (14 modules)
│   ├── hooks/                   # use-crud, use-debounce
│   ├── lib/                     # db, auth, utils, rate-limit, crud-factory, fetcher
│   ├── models/                  # 14 Mongoose models
│   ├── schemas/                 # 13 Zod schemas
│   ├── services/                # 5 services + serialize
│   ├── types/                   # DTO types + next-auth.d.ts
│   └── middleware.ts            # Bảo vệ /admin
├── .env.example / .env.local
├── next.config.ts               # Remote image allowlist + security headers
└── README.md
```

---

## 6. Chạy dự án

```bash
npm install
npm run seed -- --demo     # đã chạy rồi — chỉ cần khi reset DB
npm run dev                # http://localhost:3000
```

- **Website**: http://localhost:3000
- **CMS**: http://localhost:3000/admin — đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` đặt trong `.env.local`

## 7. Việc cần làm trước khi lên production

1. Đổi `ADMIN_PASSWORD` và chạy lại seed trên DB production (hoặc đổi trong DB).
2. Đặt `NEXT_PUBLIC_SITE_URL` = domain thật (SEO/sitemap/RSS).
3. `git init` + commit (thư mục hiện chưa phải git repo).
4. Deploy: Vercel (import repo + env vars) hoặc VPS (`next build` → `next start` sau Nginx).

---

## 8. Cập nhật luồng upload Avatar Profile

Ngày 07/07/2026, luồng upload avatar trong CMS `/admin/profile` đã được chỉnh theo hướng **không dùng Cloudinary cho avatar**. Lý do: dự án dự kiến deploy lên VPS và avatar chỉ có 1 ảnh, nên có thể lưu trực tiếp trong MongoDB mà không ảnh hưởng đáng kể đến dung lượng.

### Luồng cũ

```txt
Admin chọn avatar
→ POST /api/media
→ Upload file lên Cloudinary
→ Lưu record vào collection Media
→ Trả URL Cloudinary
→ Gán URL vào form profile
→ Bấm "Lưu hồ sơ"
→ Lưu URL vào User.avatar
```

### Luồng mới

```txt
Admin chọn avatar từ máy
→ Browser đọc file bằng FileReader
→ Convert ảnh thành data URL/base64
→ Gán data URL vào field avatar của form
→ Bấm "Lưu hồ sơ"
→ PUT /api/profile
→ Lưu trực tiếp vào User.avatar trong MongoDB
→ Public site hiển thị avatar từ dữ liệu trong database
```

### File đã thay đổi

| File | Thay đổi |
|---|---|
| `src/features/admin/profile/avatar-upload.tsx` | Thêm component upload avatar riêng, đọc file local bằng `FileReader`, giới hạn ảnh tối đa 2MB, không gọi `/api/media`. |
| `src/features/admin/profile/profile-info-form.tsx` | Thay `ImageUpload` bằng `AvatarUpload` cho phần Avatar. Phần CV/Resume dùng `ImageUpload` qua `/api/media`, hiện đã lưu vào MongoDB. |
| `src/schemas/index.ts` | Cập nhật `profileSchema.avatar`: cho phép data URL `data:image/...`, giữ tương thích tạm thời với URL cũ, giới hạn chuỗi tối đa khoảng 3MB. |
| `src/features/home/hero.tsx` | Avatar public dùng `next/image` với `unoptimized` để hiển thị được data URL từ MongoDB. |
| `src/features/home/about-preview.tsx` | Avatar preview ở trang chủ dùng `next/image unoptimized`. |
| `src/app/(site)/about/page.tsx` | Avatar ở trang About dùng `next/image unoptimized`. |

### Ghi chú kỹ thuật

- Avatar mới được lưu trong field `User.avatar` dưới dạng chuỗi `data:image/...;base64,...`.
- Ảnh không còn tạo record trong `Media` collection và không upload lên Cloudinary.
- Nút xóa avatar trong UI chỉ set `avatar = ""`; khi bấm lưu, database sẽ xóa nội dung avatar.
- Giữ giới hạn 2MB ở client để tránh vượt giới hạn document MongoDB 16MB và tránh làm HTML payload quá nặng.
- Các upload khác như Project image, Blog cover, Site Settings image, Media Manager và CV/PDF hiện cũng lưu vào MongoDB qua `/api/media`.

### Kiểm tra

```bash
npm.cmd run lint
npm.cmd run build
```

Kết quả:

- `lint` thành công, không còn warning/error.
- `build` production thành công sau khi cho phép network để `next/font` tải Google Fonts (`Inter`, `JetBrains Mono`, `Space Grotesk`).

---

## 9. Cập nhật lưu trữ Media: bỏ Cloudinary toàn hệ thống

Ngày 07/07/2026, toàn bộ luồng upload còn lại đã được chuyển từ Cloudinary sang MongoDB.

### Phạm vi thay đổi

- `/api/media` không còn gọi `uploadToCloudinary`.
- File upload multipart được đọc thành `Buffer`, convert sang `data:<mime>;base64,...`, lưu trực tiếp vào `Media.url`.
- `Media.publicId` vẫn được giữ để tương thích kiểu dữ liệu, nhưng được sinh nội bộ theo folder + timestamp + UUID.
- `/api/media/[id]` chỉ xóa record trong MongoDB, không gọi Cloudinary destroy.
- Xóa helper `src/lib/cloudinary.ts`.
- Gỡ dependency `cloudinary` khỏi `package.json` và `package-lock.json`.
- Bỏ `res.cloudinary.com` khỏi `next.config.ts`.

### File/UI bị ảnh hưởng

| File | Thay đổi |
|---|---|
| `src/app/api/media/route.ts` | Lưu file vào MongoDB dưới dạng data URL/base64, giới hạn upload 8MB. |
| `src/app/api/media/[id]/route.ts` | Xóa media chỉ xóa record DB. |
| `src/features/admin/image-upload.tsx` | Cập nhật comment và preview ảnh dùng `next/image unoptimized`. |
| `src/features/admin/media/media-manager.tsx` | Mô tả UI thành lưu trong database, preview ảnh data URL. |
| `src/features/admin/projects/project-form.tsx` | Gallery preview dùng `unoptimized`. |
| `src/components/shared/project-card.tsx` | Project cover public dùng `unoptimized`. |
| `src/components/shared/blog-card.tsx` | Blog cover card dùng `unoptimized`. |
| `src/components/layout/header.tsx` | Logo site dùng `unoptimized`. |
| `src/features/projects/project-gallery.tsx` | Gallery dự án public dùng `unoptimized`. |
| `src/app/(site)/projects/[slug]/page.tsx` | Project cover chi tiết dùng `unoptimized`. |
| `src/app/(site)/blog/[slug]/page.tsx` | Blog cover chi tiết dùng `unoptimized`. |
| `README.md`, `IMPLEMENTATION.md`, `scripts/seed.ts` | Cập nhật tài liệu/seed demo để bỏ Cloudinary. |

### Ghi chú kỹ thuật

- Giới hạn upload chung giảm từ 25MB xuống 8MB để tránh vượt giới hạn document MongoDB 16MB sau khi base64 hóa.
- Cách này phù hợp với ảnh, PDF nhỏ và media portfolio dung lượng thấp; video lớn vẫn nên dùng URL ngoài hoặc storage chuyên dụng nếu sau này cần.
- Open Graph image lưu dạng data URL có thể không được crawler mạng xã hội hỗ trợ tốt như URL file/CDN công khai.

---

## 10. Cập nhật public UX, admin profile và cảnh báo runtime

Ngày 07/07/2026, bổ sung và sửa các hạng mục sau.

### Website public: ngôn ngữ và dark mode

- Thêm `SitePreferencesProvider` chỉ bọc public site trong `src/app/(site)/layout.tsx`, không áp dụng cho admin.
- Thêm file `src/components/site/site-preferences.tsx`:
  - Quản lý `language`: `vi`, `en`, `zh`.
  - Quản lý `theme`: `light`, `dark`.
  - Lưu lựa chọn vào `localStorage`.
  - Gắn `data-site-theme` lên `<html>` để đổi theme.
  - Cập nhật `document.documentElement.lang` theo ngôn ngữ đang chọn.
- Header public có menu chọn ngôn ngữ dạng dropdown gọn:
  - `🇻🇳 VI - Tiếng Việt`
  - `🇺🇸 EN - English`
  - `🇨🇳 中文 - 中文`
- Dark mode mặc định là sáng, có nút chuyển sáng/tối trên header.
- Cập nhật `src/app/globals.css` để override token màu khi `html[data-site-theme="dark"]`.
- Các UI text chính trong Header, Hero, Footer được dịch qua dictionary. Nội dung nhập từ CMS vẫn giữ nguyên theo dữ liệu người dùng.

### CV PDF

- Thêm `src/features/admin/file-upload.tsx` để upload file/PDF riêng, không dùng `ImageUpload`.
- Trang `admin/profile` dùng `FileUpload` cho CV/Resume:
  - Hiển thị file row thay vì preview ảnh.
  - Có nút mở file và xóa file.
  - Upload vẫn qua `/api/media` và lưu data URL/base64 trong MongoDB.
- Các nút public tải CV ở Home Hero, About và Contact đã dùng thuộc tính `download="xuan-nha-cv.pdf"` để tải file thay vì mở tab mới.

### Admin profile layout

- Sửa layout form `admin/profile`:
  - Card thông tin cá nhân chiếm 2/3 chiều rộng.
  - Sidebar Avatar/CV chiếm 1/3 chiều rộng.
  - Avatar preview đổi từ khung ngang sang khung vuông tròn, giới hạn `max-w-64`.
- Mục tiêu: tránh lỗi form bị ép cột quá nhỏ và avatar preview phình quá lớn.

### Auth/admin login: fix HTTP 431

- Lỗi: sau khi avatar lưu base64 trong DB, NextAuth từng đưa `user.avatar` vào `image` của session/JWT cookie.
- Hậu quả: cookie quá lớn, browser/server trả `HTTP ERROR 431`.
- Sửa:
  - `src/lib/auth.ts`: bỏ `image: user.avatar` khỏi object user trả về khi login.
  - `src/lib/auth.config.ts`: xóa `token.picture` và `session.user.image` trong callback.
- Lưu ý vận hành: nếu trình duyệt đã có cookie cũ chứa base64, cần xóa cookie site rồi đăng nhập lại.

### Mongoose warning

- Cảnh báo:

```txt
mongoose: the `new` option for `findOneAndUpdate()` and `findOneAndReplace()` is deprecated.
```

- Đã thay toàn bộ `{ new: true }` bằng `{ returnDocument: "after" }`.
- Các file đã sửa:
  - `src/services/blog.service.ts`
  - `src/services/project.service.ts`
  - `src/lib/crud-factory.ts`
  - `src/app/api/profile/route.ts`
  - `src/app/api/settings/route.ts`
  - `src/app/api/messages/[id]/route.ts`
  - `src/app/api/posts/[id]/route.ts`

### Next.js smooth scroll warning

- Cảnh báo dev:

```txt
Detected `scroll-behavior: smooth` on the `<html>` element...
```

- Nguyên nhân: `globals.css` có `html { scroll-behavior: smooth; }`.
- Cách xử lý khuyến nghị: thêm `data-scroll-behavior="smooth"` vào thẻ `<html>` trong `src/app/layout.tsx` nếu muốn tắt warning ở phiên bản Next tương lai.

### Kiểm tra

```bash
npm.cmd run lint
npm.cmd run build
```

Kết quả:

- `lint` thành công.
- `build` production thành công sau khi cho phép network để `next/font` tải Google Fonts.

---

## 11. Tích hợp Chatbot AI đa provider + nâng cấp tính năng

Ngày 07/07/2026 (tiếp theo), thêm chatbot AI thông minh với failover tự động và nhiều tính năng nâng cao.

### Chatbot AI — Phần 1: Đa Provider Failover

**Tạo registry provider** ([src/lib/chat-providers.ts](src/lib/chat-providers.ts)):
- Hỗ trợ 4 provider (Llama/NVIDIA, OpenAI, Gemini, DeepSeek) — tất cả dùng chuẩn OpenAI-compatible.
- Chỉ provider **có API key** mới được dùng; provider chưa có key tự bỏ qua.
- Thứ tự failover tuỳ chỉnh qua `CHAT_PROVIDER_ORDER`.

**Route API** ([src/app/api/chat/route.ts](src/app/api/chat/route.ts)):
- Thử lần lượt các provider; lỗi (timeout, key sai, model degraded...) tự nhảy sang provider kế.
- System prompt kèm **thông tin portfolio từ DB** (hồ sơ, dự án, kỹ năng, mạng xã hội).
- Streaming SSE → text stream thuần cho client.
- Rate limit: 15 req/phút/IP.

**Widget chat** ([src/features/chat/chat-widget.tsx](src/features/chat/chat-widget.tsx)):
- Nút chat nổi góc phải dưới, animation Framer Motion.
- Danh sách tin nhắn với scroll, loading indicator.
- Đa ngôn ngữ (VI/EN/ZH) via [site-preferences.tsx](src/components/site/site-preferences.tsx).

**Kiểm thử:** thử Llama NVIDIA → trả lời đúng; model degraded tự sang model kế ✅

### Chatbot AI — Phần 2: Multi-Model Failover (Cùng 1 Key)

**Nâng cấp chat-providers.ts**:
- Mỗi provider nhận DANH SÁCH model (cách nhau bằng dấu phẩy) trong biến `*_MODEL`.
- Chung 1 key + 1 base URL → model đầu quá tải thì tự thử model kế.
- Header phản hồi có `X-Chat-Model` để biết model nào đã trả lời.

**Cấu hình mặc định** ([.env.local](.env.local) + [.env.example](.env.example)):
```
LLAMA_MODEL=meta/llama-4-maverick-17b-128e-instruct,meta/llama-3.3-70b-instruct,meta/llama-3.1-8b-instruct
```
Thứ tự: maverick (vision) → 3.3-70b → 3.1-8b, cùng NVIDIA key.

**Kiểm thử:** model đầu hỏng → tự sang model 2 cùng key ✅

### Chatbot AI — Phần 3: Gợi Ý + Voice + Ảnh

**Gợi ý links (Markdown Render)**:
- System prompt chèn `[Tên dự án](/projects/slug)` → AI tự chèn link vào câu trả lời.
- Widget dùng `react-markdown + remark-gfm` render: link nội bộ (`/…`) dùng Next Link, link ngoài mở tab mới.
- Thêm chip gợi ý 3 câu hỏi khi chat mới (`chat.suggest1/2/3`).

**Voice Input & Output** 🎤🔊:
- Nút mic: Web Speech API nghe tiếng nói, nhập text tự động (đúng ngôn ngữ đang chọn: vi/en/zh).
- Nút loa dưới mỗi câu trả lời: `speechSynthesis` đọc to, bấm lại dừng.
- Tự ẩn nút mic nếu trình duyệt không hỗ trợ (Chrome/Edge tốt nhất).

**Hình ảnh → Vision** 🖼️:
- Nút đính kèm ảnh, tự nén (≤1024px, JPEG 0.8) để gửi nhẹ.
- Model vision (maverick/GPT-4o/Gemini) đọc ảnh + trả lời; provider không hỗ trợ ảnh tự failover.
- Validation Zod: `content` có thể là string hoặc mảng part (text + image_url).

**Kiểm thử:**
- Chat hỏi dự án → trả về link `/projects/xuannha-dev-vibe-coding-studio` ✅
- Gửi ảnh có chữ "HELLO 2026" → model đọc đúng ✅
- Voice input/output hoạt động trên trình duyệt ✅

### File thay đổi
| File | Chi tiết |
|---|---|
| `src/lib/chat-providers.ts` | Registry 4 provider + multi-model split |
| `src/app/api/chat/route.ts` | Route chat với failover 2 tầng (provider → model), vision support, link gợi ý trong prompt |
| `src/features/chat/chat-widget.tsx` | Widget UI đầy đủ: voice, ảnh, Markdown render, gợi ý câu hỏi, đa ngôn ngữ |
| `src/components/site/site-preferences.tsx` | Thêm i18n key cho chat (vi/en/zh), 15+ khóa mới |
| `.env.local` + `.env.example` | 4 provider × (key + base URL + model); LLAMA_MODEL là danh sách |
| `src/app/(site)/layout.tsx` | Gắn `<ChatWidget />` vào public site layout |

---

## 12. Chuẩn bị Deploy lên Windows VPS

Ngày 07/07/2026, tài liệu + hướng dẫn chuẩn bị deploy.

**Audit deployment** ([C:\Users\Admin\.claude\plans\deploy-next-portfolio-to-windows-vps.md](../../.claude/plans/deploy-next-portfolio-to-windows-vps.md)):
- Next.js 15.5.20 (chạy `npm start`), React 19, cần persistent Node process (không phải static export).
- Yêu cầu Node `^18.18 || ^19.8 || >=20`, MongoDB URI (local hoặc Atlas).
- Native binaries: tất cả `-win32-x64-msvc` → phải chạy `npm install` trên VPS, không copy node_modules.
- Middleware Edge runtime protect `/admin` only; API auth riêng từng route.
- Environment: `MONGODB_URI`, `AUTH_SECRET`, 4 chatbot API key (server-only) + `NEXT_PUBLIC_SITE_URL` (build-time public).
- Seed script idempotent — chạy 1 lần post-deploy để tạo owner.

**Kiến trúc deploy recommended** (Windows Server + RDP):
1. Node.js LTS (v20+) cài trên VPS
2. MongoDB cài local hoặc dùng Atlas (cloud)
3. App folder clone/copy → `npm install` + `npm run build` trên VPS
4. `.env.local` tạo với real secrets + production URL
5. `npm run seed` khởi tạo owner
6. PM2 start app, tự restart on crash
7. (Tuỳ chọn) Reverse proxy (Nginx/Caddy) + HTTPS (Let's Encrypt)

**Troubleshoot**:
- npm install lỗi native: chạy trên Windows x64 vps
- MongoDB lỗi: kiểm tra service chạy + connection URI
- Port blocked: firewall rule allow 3000 (hoặc reverse proxy)
- Cold start 5-10 phút: bình thường (npm install + build)

**Kiểm thử trước production**: `npm start` local → truy cập trang chủ/admin/blog → kiểm tra DB kết nối ✅

---

## 13. Tối ưu UI mobile, fix bug slider dự án, bỏ thanh tiến trình kỹ năng, nâng cấp Chat Widget

Ngày 08/07/2026, gồm 4 nhóm thay đổi.

### 13.1. Fix menu chọn ngôn ngữ trong mobile menu

- **Lỗi**: dropdown ngôn ngữ dùng `position: absolute` nằm trong panel mobile menu có `overflow-hidden` (cần cho animation đóng/mở height) → khi xổ xuống, danh sách ngôn ngữ bị cắt mất; dropdown còn căn `right-0` theo nút sát mép trái nên tràn ra ngoài màn hình.
- **Sửa** (`src/components/layout/header.tsx`): trên mobile bỏ dropdown, thay bằng **grid 3 nút chọn ngôn ngữ trực tiếp** (🇻🇳 VI / 🇺🇸 EN / 🇨🇳 中文), ngôn ngữ đang chọn viền accent; nút sáng/tối thành hàng riêng full-width. Desktop giữ nguyên dropdown.

### 13.2. Fix click vào Project Card không điều hướng (trang /projects)

- **Triệu chứng**: click card dự án → URL không đổi, không request, không lỗi console.
- **Nguyên nhân** (`src/features/projects/project-slider.tsx` — slider tự viết bằng Pointer Events, không phải Embla): `onPointerDown` gọi `setPointerCapture()` ngay khi nhấn chuột. Theo spec Pointer Events, khi track đang giữ capture thì sự kiện `click` bị **retarget về track div** thay vì thẻ `<a>` bên trong → click không bao giờ tới Link.
- **Sửa**: chỉ `setPointerCapture` trong `onPointerMove` khi cử chỉ vượt ngưỡng 6px (đã thực sự là drag); click thường đi thẳng tới Link. Drag vẫn mượt, click-sau-drag vẫn bị chặn đúng. Thêm chặn chuột phải/giữa (`e.button !== 0`).

### 13.3. Bỏ hoàn toàn thanh tiến trình (level %) của kỹ năng

Chỉ hiển thị tên kỹ năng dạng **chip/tag** bo tròn; xóa hẳn field `level` khỏi toàn hệ thống:

| File | Thay đổi |
|---|---|
| `src/features/home/skills-section.tsx` | Bỏ thanh progress + số %, render tên skill thành chip `flex flex-wrap` (dùng chung cho Home + About) |
| `src/features/admin/skills/skill-manager.tsx` | Xóa slider "Mức độ thành thạo" trong form, xóa badge % trong danh sách, bỏ `level` khỏi form state/payload |
| `src/schemas/index.ts` | Xóa `level` khỏi `skillSchema` |
| `src/models/Skill.ts` | Xóa `level` khỏi interface + schema |
| `src/types/index.ts` | Xóa `level` khỏi `SkillDTO` |
| `src/services/profile.service.ts` + `src/app/api/skills/route.ts` | Sort đổi `{ order: 1, level: -1 }` → `{ order: 1, name: 1 }` |
| `scripts/seed.ts` | Bỏ `level` khỏi 9 skill demo |

- Document skill cũ trong MongoDB vẫn còn field `level` — vô hại, không cần migration.

### 13.4. Tối ưu Chat Widget (Trợ lý AI) — mobile UX + accessibility

Toàn bộ trong `src/features/chat/chat-widget.tsx` + i18n mới trong `src/components/site/site-preferences.tsx`. 9 hạng mục:

1. **Full-screen trên mobile** (<640px): khung chat chiếm `h-dvh` × full width (dùng `dvh` né thanh địa chỉ động), trượt lên từ cạnh dưới, khóa cuộn `body` khi mở → không còn thấy/chạm được nội dung trang phía sau (hết cảnh 2 nút "Gửi" cạnh nhau ở /contact). Desktop giữ dạng thẻ nổi.
2. **Typing indicator + timeout**: bubble ba chấm nhấp nháy + chữ "Trợ lý đang trả lời..." hiện liên tục khi chờ (streaming SSE đã có sẵn). Timeout 60s nếu chưa nhận byte nào → hủy request + thông báo `chat.timeout` thân thiện. Lỗi giữa chừng thay vào bubble rỗng thay vì để tin nhắn trống.
3. **Chống auto-zoom iOS**: ô nhập `text-base` (16px) trên mobile, `sm:text-sm` desktop.
4. **Textarea auto-resize**: thay input 1 dòng bằng textarea tự giãn tối đa ~5 dòng (120px) rồi cuộn trong; Enter gửi, Shift+Enter xuống dòng, xử lý IME (`isComposing`) cho bộ gõ tiếng Việt/Trung.
5. **Vùng chạm chuẩn**: các nút ảnh/mic/gửi/đóng tăng lên 44×44px (`h-11 w-11`), khoảng cách `gap-2` (8px), form `items-end`.
6. **Phản hồi nút mic**: đang nghe → nền đỏ đặc + ring + icon pulse + phụ đề "Đang nghe..."; bị từ chối quyền → banner đỏ `chat.micDenied` tự ẩn sau 5s; `rec.start()` bọc try/catch; nút vẫn tự ẩn nếu trình duyệt không hỗ trợ.
7. **Nút đọc to rõ ràng**: thêm nhãn chữ "Đọc to"/"Dừng đọc", khi phát có nền accent + sóng âm 3 vạch động. Fix bug: `onend` của utterance bị cancel có thể xóa nhầm trạng thái tin mới → chỉ clear khi index còn khớp (đảm bảo 1 tin/lúc).
8. **Header khung chat**: cao tối thiểu 56px (`min-h-14`), nút đóng X ngay trong header, đệm `safe-area-inset-top` khi full-screen.
9. **Safe area**: nút nổi + khung chat desktop + form nhập mobile đều cộng `env(safe-area-inset-bottom)` để không bị thanh gesture iPhone che.

**i18n mới** (vi/en/zh): `chat.thinking`, `chat.timeout`, `chat.micDenied`.

### Kiểm tra

```bash
npm.cmd run lint    # ✅ pass
npm.cmd run build   # ✅ pass — 40 routes
```

Nghiệm thu thủ công đề xuất: mở chat ở 360×640 / 390×844 / 414×896 (phải phủ kín màn hình), gõ câu hỏi dài 150-200 ký tự (textarea giãn dòng), test iOS Safari (không auto-zoom), click card dự án ở `/projects` (điều hướng bình thường, kéo ngang vẫn hoạt động).

---

## 14. Redesign toàn diện — Premium Developer Portfolio (dark mode first)

Ngày 09/07/2026, nâng cấp toàn bộ chất lượng thiết kế theo hướng **Modern Clean / Apple / Vercel / Linear**: tối giản, thanh lịch, glassmorphism có chọn lọc, **dark mode làm mặc định**. Không thay đổi nội dung, không bỏ tính năng nào — chỉ cải thiện thiết kế.

### 14.1. Design system mới (`src/app/globals.css`)

**Bảng màu dark-first (phong cách Vercel/Linear):**

| Token | Light | Dark |
|---|---|---|
| `background` | `#fafafa` | `#09090b` (near-black) |
| `surface` | `#ffffff` | `#101014` |
| `border` | `#e4e4e7` | `#26262b` |
| `primary` (text) | `#18181b` | `#f4f4f5` |
| `accent` | `#2563eb` | `#60a5fa` |

- Accent chỉnh theo từng theme để đạt **WCAG AA 4.5:1** (màu cũ `#3b82f6` trên nền trắng chỉ đạt ~3.7:1).
- **Token mới `inverse` / `inverse-fg` / `inverse-hover`**: nút CTA chính kiểu Vercel — nền đen chữ trắng ở light mode, nền trắng chữ đen ở dark mode. Thay thế hoàn toàn các hack CSS cũ (`html[dark] .bg-primary {...}`, `.text-white {...}`) vốn dễ vỡ.
- **Token mới `accent-fg`**: màu chữ an toàn trên nền accent ở cả 2 theme (trắng trên xanh đậm / chữ tối trên xanh nhạt) — dùng cho chip lọc blog, bubble chat, nút accent.
- Bổ sung: `:focus-visible` ring toàn cục cho điều hướng bàn phím; `@media (prefers-reduced-motion: reduce)` tắt animation; utility `glass` (frosted blur — chỉ dùng cho header và bề mặt nổi); font features Inter (`cv02/cv03/cv04/cv11`); `text-wrap: balance` cho heading; shadow tinh tế hơn theo theme; code block Markdown luôn nền tối có viền (fix vỡ ở dark mode); skeleton shimmer theo token thay vì trắng cứng; `container-page` padding rộng hơn.

### 14.2. Dark mode mặc định, không flash

| File | Thay đổi |
|---|---|
| `src/components/site/site-preferences.tsx` | State theme mặc định `"dark"`; light là opt-in lưu localStorage |
| `src/app/(site)/layout.tsx` | Inline script chạy **trước khi paint**: đọc `localStorage` → gắn `data-site-theme` ngay, không còn flash trắng khi tải trang |
| `src/app/layout.tsx` | Thêm `suppressHydrationWarning` trên `<html>` |
| `src/components/providers.tsx` | Bọc `MotionConfig reducedMotion="user"` — framer-motion tôn trọng cài đặt giảm chuyển động của hệ điều hành |

Admin (`/admin`) không bị ảnh hưởng — vẫn giữ theme sáng vì provider chỉ bọc public site.

### 14.3. Redesign từng khu vực

| Khu vực | Thay đổi chính |
|---|---|
| **Hero** (`hero.tsx`) | `min-h-100svh`, grid nền mờ hơn + glow accent, badge kiểu glass, headline scale mượt hơn (`sm/md/lg`), CTA dạng **pill** dùng token inverse, social buttons tròn. Avatar **giữ nguyên kiểu hiển thị cũ** theo yêu cầu |
| **Navigation** (`header.tsx`) | Header dùng utility `glass` khi cuộn; nav link màu muted → primary, active indicator mảnh 1px; CTA pill inverse; menu ngôn ngữ item chọn dùng `accent/10` thay nền đặc; mobile menu nền glass |
| **Project/Blog cards** | `rounded-2xl`, padding `p-6`, ảnh zoom chậm 700ms + overlay gradient khi hover, hover lift + border accent nhẹ, `cursor-pointer` |
| **Skills** (`skills-section.tsx`) | Card `rounded-2xl p-7` có hover border; label category kèm chấm accent; chip kỹ năng có hover feedback |
| **Timeline** (`about/page.tsx`) | Marker mới dạng vòng + chấm accent, đường nối gradient mờ dần, ngày tháng mono uppercase, khoảng cách `space-y-10`, icon section có viền |
| **Stats** (`stats-section.tsx`) | Bỏ panel `bg-primary` (phụ thuộc hack cũ, vỡ ở dark) → dải bordered dùng token, số to `text-5xl`, phân cách cột bằng border trái |
| **Contact** (`contact/page.tsx`) | Card `rounded-2xl`, spacing rộng hơn, input nền `background` + focus ring mềm, hover states tinh chỉnh |
| **Footer** (`footer.tsx`) | `py-16/20`, tiêu đề cột mono uppercase tracking rộng, link muted → primary khi hover, social buttons tròn |
| **Contact CTA** (`contact-cta.tsx`) | `rounded-3xl py-20/24`, glow lớn hơn, nút pill inverse |
| **SectionHeading** | Eyebrow đổi từ pill sang **mono uppercase `tracking-[0.2em]`** (thống nhất toàn site), `mb-14/16`, description `text-pretty` |
| Trang `/projects`, `/blog` | Đồng bộ hero heading (`py-24/28`, tracking-tight, eyebrow mới) |

Nhịp section thống nhất toàn trang chủ: `py-24 md:py-32`.

### 14.4. UI primitives & dọn dẹp hack

| File | Thay đổi |
|---|---|
| `ui/button.tsx` | Variant `default` → token inverse; `accent` → `text-accent-fg`; bỏ translate-y gây layout shift; focus ring có `ring-offset-background`; `cursor-pointer` |
| `ui/badge.tsx` | Variant `mono` → `bg-inverse text-inverse-fg` (trước đây vỡ ở dark mode) |
| `ui/input.tsx` + `ui/textarea.tsx` | Nền `background`, `h-11` (touch target), focus ring mềm `accent/30`, hover border |
| `ui/dialog.tsx` | Overlay `bg-primary/40` (thành trắng mờ ở dark — bug) → `bg-black/55` |
| `chat-widget.tsx` | Nút nổi/header/nút gửi → token inverse; bubble user → `text-accent-fg` |
| `not-found.tsx`, `projects/[slug]` | Nút CTA → pill inverse; nút phụ → outline trung tính |
| `(site)/blog/page.tsx` | Chip lọc + phân trang active → `text-accent-fg` |
| `globals.css` | **Xóa hẳn** các override hack: `html[dark] .bg-primary`, `.hover:bg-secondary`, `.text-white`, override shadow |

> Ghi chú (09/07/2026): avatar ở Hero, About Preview và trang About ban đầu được ép về khung tròn/vuông cố định, nhưng theo yêu cầu đã **khôi phục kiểu hiển thị avatar như thiết kế cũ** (tỷ lệ ảnh gốc, class như trước redesign) ở cả 3 vị trí.

### 14.5. Accessibility

- `aria-hidden` cho toàn bộ icon trang trí.
- Focus ring hiển thị rõ khi Tab (toàn cục + từng component).
- `prefers-reduced-motion` được tôn trọng ở cả CSS lẫn framer-motion.
- Contrast màu accent/muted đạt AA ở cả 2 theme; nút accent luôn dùng `accent-fg`.
- Touch target ≥ 44px cho input và nút tương tác chính.

### Kiểm tra

```bash
npx tsc --noEmit    # ✅ pass
npx eslint          # ✅ pass — không warning/error
npm run build       # ✅ pass — build production thành công
```

- Nghiệm thu trực quan bằng Chrome trên `localhost:3000`: hero/about/projects/stats/skills/blog/CTA/footer ở **dark mode mặc định** ✅; toggle sang light mode hiển thị đúng ✅; trang `/about` (timeline), `/contact` (form + sidebar) ✅; xóa `localStorage` → mặc định vào dark, không flash ✅.
- Lưu ý: trình duyệt đã từng chọn light sẽ giữ light (đúng thiết kế — tôn trọng lựa chọn đã lưu); khách mới luôn thấy dark.
