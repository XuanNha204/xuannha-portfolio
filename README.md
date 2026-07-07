# XuanNha.Dev — Vibe Coding Studio

Website portfolio cá nhân kết hợp **Blog + CMS + Project Showcase**, xây dựng theo hướng AI-Assisted Development (Vibe Coding).

## Công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| UI/UX | Shadcn-style components, Framer Motion, Lenis (smooth scroll), Embla Carousel, Lucide Icons |
| Form/Data | React Hook Form, Zod, TanStack Query |
| Backend | Next.js Route Handlers, Service Layer |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v5 (JWT, role-based) |
| Storage | MongoDB Media collection (data URL/base64) |
| Charts | Recharts |

## Bắt đầu

### 1. Cài đặt

```bash
npm install
cp .env.example .env.local
# → điền MONGODB_URI, AUTH_SECRET
```

### 2. Seed dữ liệu

```bash
npm run seed            # tạo tài khoản owner + site settings
npm run seed -- --demo  # kèm dữ liệu mẫu (skills, project, blog...)
```

Tài khoản mặc định: `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env.local`.

### 3. Chạy dev

```bash
npm run dev
```

- Website: http://localhost:3000
- CMS: http://localhost:3000/admin

## Cấu trúc thư mục

```
src/
  app/            # App Router: (site) public + admin CMS + api
  components/     # UI kit, layout, motion, shared
  features/       # Module theo tính năng (home, projects, blog, contact, admin)
  hooks/          # Custom hooks (useCrud, useDebounce)
  lib/            # db, auth, utils, rate-limit, crud-factory
  models/         # Mongoose models (14 collections)
  schemas/        # Zod validation schemas
  services/       # Service layer (data access cho Server Components)
  types/          # DTO types cho client
scripts/seed.ts   # Seed owner + demo data
```

## Tính năng chính

**Public site** — Home (Hero, About, Featured Projects, Stats, Skills, Blog, CTA), About (timeline học vấn/kinh nghiệm, chứng chỉ, CV), Projects (horizontal slider + drag scroll + progress bar, gallery Embla), Blog (search, category filter, pagination, related posts, view count), Contact (form + rate limiting).

**CMS (/admin)** — Dashboard (thống kê + biểu đồ lượt xem 30 ngày), Project Manager (CRUD, multi-image upload, featured/draft/publish/archive, search/filter), Blog Manager (Markdown + preview, SEO, schedule publish, category), Skill/Profile/Media/Message Manager, Site Settings.

**SEO & hiệu năng** — Metadata động, Open Graph, JSON-LD, sitemap.xml, robots.txt, RSS feed, ISR (revalidate 60s), next/image, code splitting.

**Bảo mật** — NextAuth v5 JWT, middleware bảo vệ /admin, role-based (owner), Zod validation mọi input, rate limiting, security headers.

## Deploy

**Vercel**: import repo → thêm env vars → deploy. Đặt `NEXT_PUBLIC_SITE_URL` = domain thật.

**VPS + Docker**: `next build` → chạy `next start` sau reverse proxy (Nginx).
