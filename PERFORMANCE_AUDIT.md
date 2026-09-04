# Performance audit — Next.js 15 / Turbopack

Ngày audit: 2026-09-05
Project: `D:\Portfolio`
Runtime đã kiểm tra: Next.js 15.5.20, React 19.1, Mongoose 9.7, MongoDB local 8.2

## Kết luận nhanh

Hiện tượng chậm không đến từ một nguyên nhân duy nhất. Bottleneck lớn nhất là `MONGODB_URI`
cloud trả `MongoServerError code=8000: bad auth`. Các service bắt lỗi và trả fallback nên HTTP vẫn
`200`, nhưng `dbConnect()` reset promise sau mỗi lần lỗi. Metadata, layout, page và footer vì vậy tạo
nhiều đợt retry nối tiếp, cộng dồn thành 11.7 giây cho `/` và 2.7 giây cho analytics.

Sau khi chuyển development/production sang MongoDB local, giảm số query, memoize direct DB calls,
defer analytics write và loại blob base64 khỏi RSC payload:

- Cold dev `/`: **11,679 ms → 5,104 ms total** (trong đó phần còn lại chủ yếu là cold compile).
- Warm dev `/` p50 TTFB: **2,909 ms → 219 ms**.
- Production `/` p50: **6.3 ms total**.
- Production `/api/analytics/track` p50: **3.9 ms total**; handler `Server-Timing` khoảng **0.8 ms**.
- Payload production `/`: **9.19 MB → 108 KB**.
- Payload production `/contact`: **8.51 MB → 57 KB**.

Không thay đổi UI, không xóa feature và không thay đổi document schema. MongoDB indexes chỉ được
audit; chưa thêm index phỏng đoán khi collection hiện còn rất nhỏ.

## Cấu hình MongoDB local

MongoDB Windows service đang ở trạng thái `Running`, start type `Automatic`, bind
`127.0.0.1:27017`. Hai file override local đã được tạo:

- `.env.development.local`
- `.env.production.local`

Cả hai dùng:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/xuannha-dev
```

Các file này được `.gitignore` bảo vệ. URI Atlas cũ trong `.env.local` không bị sửa/xóa và có thể
dùng lại sau khi credential được rotate; với cấu hình hiện tại, file theo môi trường có độ ưu tiên
cao hơn `.env.local`.

Kết quả profile kết nối local:

| Operation | Thời gian |
|---|---:|
| `dbConnect.first` | 23.4 ms |
| MongoDB ping | 10.5 ms |
| Batch dữ liệu homepage sau tối ưu | 42.3 ms |
| Analytics upsert thực tế | 6.6 ms |

## Số đo trước tối ưu

Trace gốc trong `.next/trace` khớp log được cung cấp:

| Request | Tổng | Compile | Runtime/render còn lại |
|---|---:|---:|---:|
| `GET /` | 11,680.6 ms | 3,996.1 ms | khoảng 7,684.5 ms |
| `POST /api/analytics/track` | 2,745.4 ms | 264.5 ms | khoảng 2,480.9 ms |

Warm dev baseline (3–5 mẫu, TTFB median):

| Route | Trước |
|---|---:|
| `/` | 2,909 ms |
| `/about` | 2,946 ms |
| `/projects` | 3,878 ms |
| `/blog` | 2,546 ms |
| `/contact` | 2,650 ms |
| `/api/analytics/track` | 295 ms |

Probe dùng đúng env loader của Next cho thấy lần connect cloud đầu thất bại sau khoảng 0.5–2.0 giây;
8 lời gọi `dbConnect()` đồng thời cùng reject một lúc, chứng minh promise đang được reuse. Một lời
gọi sau khi promise bị reset lại mở attempt mới, gây các “wave” nối tiếp trong render tree.

## Nguyên nhân và thay đổi đã thực hiện

### 1. MongoDB connection retry storm

File: `src/lib/db.ts`

Trước đây connection thành công đã được cache global đúng cách, nhưng khi auth lỗi,
`cached.promise = null` khiến request/phase tiếp theo thử login lại ngay.

Đã thực hiện:

- Giữ một global cached connection/promise qua HMR.
- Kiểm tra `mongoose.connection.readyState` trước khi reuse connection.
- Giới hạn pool mỗi process (`maxPoolSize: 10`, `minPoolSize: 0`).
- Thêm cooldown 5 giây sau connection failure để tránh retry storm.
- Log timing `mongodb.connect`, outcome và error code mà không log URI/credential.

### 2. Homepage gọi quá nhiều query

Files: `src/app/(site)/page.tsx`, `src/services/analytics.service.ts`

Homepage cũ gọi 8 service, tương đương khoảng 18 DB operations:

- Query featured projects và toàn bộ projects riêng, dù có thể lọc trên cùng một list.
- Gọi pipeline published posts hai lần; mỗi pipeline gồm scheduled update, count và find.
- Gọi `getDashboardStats()` gồm 7 count/aggregate chỉ để lấy `totalViews`.

Đã rút xuống một batch 6 service:

- Một project query, filter featured trong memory.
- Một published-post query lấy đồng thời `items` và `total`.
- `getTotalViews()` chỉ chạy aggregate cần thiết.
- Các request độc lập vẫn chạy bằng `Promise.all`.

### 3. Direct Mongo calls không được request memoize tự động

Files: `src/services/settings.service.ts`, `profile.service.ts`, `project.service.ts`,
`blog.service.ts`

`getSiteSettings()` từng chạy ở root metadata, site layout và footer. `getSocialLinks()` cũng bị lặp.
Detail blog/project gọi getter ở cả `generateMetadata` và page; getter lại dùng
`findOneAndUpdate($inc views)`, tạo hai write/query và double count.

Đã bọc các public getters bằng React `cache()` để dedupe trong một render request. Next.js 15 ghi rõ
direct ORM/database calls cần React cache khi không dùng `fetch`:
[Caching guide](https://nextjs.org/docs/15/app/guides/caching) và
[`generateMetadata`](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata).

Không dùng persistent cache cho getter có side effect (`$inc views`) để không đổi semantics.

### 4. Analytics route await DB write và load quá nhiều model

Files: `src/app/api/analytics/track/route.ts`, `src/services/analytics.service.ts`,
`src/services/stats.service.ts`

Trước đây route await `dbConnect()` + `Analytics.updateOne()` trước response. Route import
`stats.service`, service import model barrel, khiến cold analytics bundle register toàn bộ 14 model.

Đã thực hiện:

- Tách analytics thành service riêng chỉ import trực tiếp model `Analytics`.
- Dùng `after()` để response không chờ page-view write. API này stable từ Next 15.1 và được thiết kế
  cho logging/analytics không block response:
  [`after` documentation](https://nextjs.org/docs/app/api-reference/functions/after).
- Thêm `Server-Timing: parse;dur=..., handler;dur=...`.
- Log riêng `connectMs`, `queryMs`, total và outcome của analytics write.
- Client tracker vốn đã dùng `navigator.sendBeacon`/fire-and-forget và không await, nên không phải
  nguyên nhân trực tiếp chặn navigation.

Analytics đã có unique compound index `{ path: 1, date: 1 }`; local explain dùng `IXSCAN`, không có
COLLSCAN ở write lookup.

### 5. Blob base64 bị serialize vào HTML/RSC

Files: `src/services/profile.service.ts`, `src/lib/profile-asset.ts`,
`src/app/api/profile/avatar/route.ts`, `src/app/api/profile/resume/route.ts`

Profile lưu avatar và CV dạng data URL. `getProfile()` trả nguyên blob cho client components, làm
`/`, `/about`, `/contact` mang nhiều bản sao base64 trong HTML/RSC. Production benchmark đầu tiên
sau tối ưu query vẫn cho 8.5–9.2 MB/response.

Đã thay data URL public bằng URL versioned nhỏ. Hai route mới đọc blob theo yêu cầu và trả:

- `Content-Length` chính xác.
- `Cache-Control: public, max-age=31536000, immutable`.
- MIME type gốc; resume giữ `Content-Disposition` download.

Asset test: avatar 94,569 bytes, CV 3,169,968 bytes; cả hai trả `200` và được browser cache riêng.
Database schema và UI download/avatar không đổi.

### 6. List queries trả document quá lớn

Files: `src/services/project.service.ts`, `src/services/blog.service.ts`

Project list trước đây trả cả long description, challenges, solutions, results và gallery có thể chứa
base64. Blog list trả cả full article content.

Đã thêm field projection cho list/card/chat; detail getters vẫn trả đầy đủ nội dung. Category populate
trên blog card chỉ lấy `name` và `slug`.

### 7. Sequential awaits không cần thiết

Files:

- `src/services/project.service.ts`
- `src/services/blog.service.ts`
- `src/app/api/messages/route.ts`
- `src/app/api/media/route.ts`
- `src/features/admin/media/media-manager.tsx`

Đã chạy `countDocuments()` và page `find()` bằng `Promise.all`. Multi-file media upload cũng chuyển
từ vòng lặp await tuần tự sang các request độc lập song song. Các await phụ thuộc dữ liệu như category
lookup trước khi dựng filter hoặc related posts sau khi có current post được giữ tuần tự.

### 8. Cold bundle và client work

Files: `src/components/providers.tsx`, `src/features/admin/query-provider.tsx`,
`src/features/chat/chat-widget.tsx`, `src/features/chat/chat-message-markdown.tsx`,
`src/components/motion/smooth-scroll.tsx`

Đã thực hiện:

- Chỉ mount TanStack Query provider trong admin; public routes không tải query client.
- Lazy-load `react-markdown` + `remark-gfm` khi mở chat.
- Batch streaming chat state update bằng `requestAnimationFrame`, tránh rerender theo mọi network chunk.
- Dừng Lenis RAF khi tab hidden; không chạy Lenis nếu user chọn reduced motion.
- Build manifest xác nhận chunk Markdown không nằm trong initial public route và chunk TanStack chỉ
  nằm trong admin route.
- Bỏ `router.refresh()` ngay sau `router.push()` ở login/post/project forms để tránh RSC request kép.

`PageTransition` vẫn có animation 250 ms và nhiều Reveal component cố ý ẩn/animate content. Đây là
perceived delay thuộc UI hiện tại nên được giữ nguyên theo yêu cầu không đổi UI.

### 9. Model barrel làm cold API bundle lớn

Files: `src/app/api/**`, `src/lib/auth.ts`, các service.

Các imports từ `@/models` đã được đổi sang direct model modules. Riêng analytics cold route trước đó
đánh giá/register User, Project, BlogPost, Category, Tag, Skill, Experience, Education, Certificate,
Message, SocialLink, Settings, Media và Analytics dù chỉ cần một model.

### 10. Middleware và authentication

File: `src/middleware.ts`

Matcher hiện là:

```ts
matcher: ["/admin/:path*"]
```

Regex manifest đã kiểm tra:

- Match: `/admin`, `/admin/...`.
- Không match: `/`, public pages, `/api/analytics/track`, `/_next/static`, `/_next/image`, favicon,
  robots, sitemap.

Do đó middleware đã đủ hẹp; thêm negative lookahead cho static asset là dư thừa. Auth middleware dùng
edge-safe config và JWT, không import DB. Admin layout gọi `auth()` để lấy session/sidebar nên các admin
pages dynamic là đúng chức năng. `/admin` production trả `307` tới login như mong đợi.

### 11. Dynamic rendering và fetch

- `/`, `/about`, `/projects`, `/contact`: static/ISR 60 giây sau build.
- `/blog/[slug]`, `/projects/[slug]`: SSG + ISR 60 giây.
- `/blog`: dynamic vì đọc `searchParams` cho search/category/tag/page; `revalidate = 60` không biến
  các tổ hợp query thành static route.
- Admin routes dynamic do session; đây là cần thiết.
- Không có server-component `fetch` waterfall. Client fetches thuộc submit/upload/chat/admin queries,
  không block server render. Analytics beacon không await.
- Footer async được đặt trong `Suspense` vì ở dưới fold, tránh giữ main shell chỉ vì social/settings.

## MongoDB index audit

Lệnh: `npm run perf:indexes` (chỉ explain/read, connect với `autoIndex: false`).

| Query | Winning plan local | Ghi chú |
|---|---|---|
| Analytics `{path,date}` | `IXSCAN path_1_date_1` | Index đúng cho upsert |
| Published projects + sort | `IXSCAN status_1` + in-memory sort | 1 document hiện tại |
| Featured projects + sort | `IXSCAN featured_1` + sort | 1 document hiện tại |
| Published posts + sort | `IXSCAN status_1` + sort | 2 documents hiện tại |
| Scheduled posts | `IXSCAN status_1` | 0 documents hiện tại |
| Active messages | `COLLSCAN` + sort | 0 documents hiện tại |
| Media by type + sort | `IXSCAN type_1` + sort | 2 documents hiện tại |
| Owner profile | `COLLSCAN` | 1 document hiện tại |

Với cardinality hiện tại, thêm compound indexes chưa đem lại lợi ích đáng kể và sẽ tăng write/index
cost, nên chưa thay đổi DB metadata. Khi collection tăng, ưu tiên kiểm tra:

- Project `{ status: 1, order: 1, completedAt: -1 }` và variant có `featured`.
- BlogPost `{ status: 1, publishedAt: -1 }`, `{ status: 1, scheduledAt: 1 }`.
- Message `{ archived: 1, createdAt: -1 }`.
- Media `{ type: 1, createdAt: -1 }`.

Chỉ thêm sau khi production `explain("executionStats")` cho thấy docs examined/index scan ratio xấu.

## Benchmark sau tối ưu

### Development + Turbopack + Mongo local

Cold đầu tiên gồm compile:

| Route | Trước | Sau |
|---|---:|---:|
| `/` total | 11,679 ms | 5,104 ms |

Warm dev (5 mẫu, p50 TTFB):

| Route | Trước | Sau |
|---|---:|---:|
| `/` | 2,909 ms | 219 ms |
| `/about` | 2,946 ms | 252 ms |
| `/projects` | 3,878 ms | 180 ms |
| `/blog` | 2,546 ms | 226 ms |
| `/contact` | 2,650 ms | 250 ms |
| `/api/analytics/track` | 295 ms | 279 ms |

Analytics warm dev còn khoảng 279 ms do Next dev/Turbopack request overhead; `Server-Timing` đo phần
handler dưới 1 ms và DB upsert local riêng khoảng 6.6 ms. Production là số đại diện cho runtime thật.

### Production + Mongo local

Lệnh: `npm run perf:routes -- http://127.0.0.1:3100`
Mỗi route: 1 warm-up + 5 mẫu tuần tự.

| Route | TTFB p50 | TTFB p95 | Total p50 | Total p95 | Body |
|---|---:|---:|---:|---:|---:|
| `/` | 4.8 ms | 6.5 ms | 6.3 ms | 7.9 ms | 107,770 B |
| `/about` | 4.1 ms | 6.1 ms | 4.9 ms | 7.2 ms | 74,824 B |
| `/projects` | 2.4 ms | 2.7 ms | 3.1 ms | 3.2 ms | 45,762 B |
| `/blog` | 16.2 ms | 22.4 ms | 25.8 ms | 34.1 ms | 55,349 B |
| `/contact` | 2.8 ms | 3.1 ms | 3.4 ms | 3.7 ms | 57,364 B |
| `/api/analytics/track` | 3.8 ms | 5.5 ms | 3.9 ms | 5.7 ms | 11 B |

Payload regression được phát hiện và sửa trong cùng audit:

| Route | Trước asset proxy | Sau asset proxy | Giảm |
|---|---:|---:|---:|
| `/` | 9,191,735 B | 107,770 B | 98.8% |
| `/about` | 8,906,513 B | 74,824 B | 99.2% |
| `/contact` | 8,510,742 B | 57,364 B | 99.3% |

## Verification

Đã chạy thành công:

```text
npx tsc --noEmit
npx eslint src scripts/performance-profile.ts scripts/benchmark-routes.ts
npm run perf:profile
npm run perf:indexes
npm run build
npm run start -- --port 3100
npm run perf:routes -- http://127.0.0.1:3100
```

Build cuối:

- Compile production: 6.0 giây.
- 43 static/route artifacts generated.
- Type check + lint trong build: pass.
- First Load JS shared: 142 KB.
- Public home: 215 KB first load; contact cao nhất 292 KB.

## Tối ưu tiếp theo được đề xuất

1. Chuyển avatar/CV/media lớn sang object storage/CDN. Route proxy hiện đã loại chúng khỏi RSC nhưng
   binary vẫn nằm trong MongoDB document, làm backup/query admin nặng.
2. Khi dùng lại Atlas, rotate database user/password và đặt cluster gần deployment region. Chạy lại
   `perf:profile`, `perf:indexes` và production benchmark trên đúng network path.
3. Tách toàn bộ ChatWidget thành deferred client chunk nếu muốn giảm tiếp cold compile/initial JS;
   hiện Markdown parser đã lazy nhưng shell widget vẫn được load trên mọi public page.
4. Chia dictionary ngôn ngữ theo locale/dynamic import; hiện cả ba locale nằm trong public bundle.
5. Cấu hình image loader/CDN rồi bỏ `unoptimized` để có resize/WebP/AVIF thay vì tải ảnh gốc.
6. Nếu `/blog` có traffic/filter cardinality cao, cache query read-only bằng `unstable_cache` + tags;
   không cache getter có `$inc views` hoặc scheduled-publish side effect.
7. Thay in-memory rate limit bằng Redis/managed KV khi chạy nhiều instance.
