# XuanNha.Dev

ASP.NET Core MVC portfolio + CMS: public site, technical blog, project showcase, and an Admin dashboard backed by SQL Server.

## Project Overview

- Solution: `XuanNha.Dev.slnx`
- Main project: `XuanNha.Dev/XuanNha.Dev.csproj`
- Framework: `.NET 10.0`
- Stack: ASP.NET Core MVC, Razor Views, EF Core (SQL Server LocalDB), ASP.NET Identity, Markdig, Bootstrap 5, Three.js (homepage)

## Current Features

### Public site

- Dark-tech 3D homepage (`/`)
- Project listing and case-study detail pages (`/projects`, `/projects/{slug}`), published only
- Blog listing and article pages (`/blog`, `/blog/{slug}`) with Markdown-rendered content, reading time, and view counting
- About page (`/about`) rendered like a CV from database content: profile, skills, experience, education, certificates, social links (sections appear as content is added in Admin)
- Contact page (`/contact`) with validation and honeypot anti-spam
- SEO: meta description, canonical URL, Open Graph/Twitter Card tags, `robots.txt`, dynamic `/sitemap.xml`
- Multi-language UI (English default, Tiếng Việt, 中文) with a language dropdown in the nav; preference stored in a culture cookie
- Dark/light theme toggle with preference persisted in `localStorage`

### Admin dashboard (`/Admin`, role-protected)

- Login/logout with ASP.NET Identity and the Admin role
- Dashboard statistics
- Projects CRUD with featured toggle
- Blog CRUD with Markdown editor, preview, publish/draft, and category assignment
- Categories and Tags CRUD with usage counts
- Media Manager: multi-file upload (images/video/PDF/documents with whitelist and size limits), search/filter, copy URL, delete
- Messages inbox: unread filter, auto mark-as-read, delete
- About page content: Profile editor plus CRUD for Skills, Experience, Education, Certificates, and Social Links

### REST API

- `/api/projects` — list/detail/slug, Admin-protected mutations
- `/api/blogs` — list/detail/slug, Admin-protected mutations
- `/api/contact` — public message submission
- `/api/messages` — Admin-protected inbox endpoints

## Build

From the solution folder:

```powershell
dotnet build
```

## Run

```powershell
dotnet run --project .\XuanNha.Dev\XuanNha.Dev.csproj
```

Launch profiles define these local URLs:

- HTTP: `http://localhost:5145`
- HTTPS: `https://localhost:7093`

On first run the app applies EF Core migrations and seeds the Admin role and development Admin account (see `DEVELOPMENT_LOG.md`; local development only).

## Documentation

- `DUAN.md` — architecture and product specification
- `DEVELOPMENT_LOG.md` — implementation history and verification notes

## Local credentials

Copy `XuanNha.Dev/appsettings.Development.example.json` to `XuanNha.Dev/appsettings.Development.json` and set `AdminSeed:Password` locally before the first run. The local configuration is excluded from Git.

