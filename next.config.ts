import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A dev server must not overwrite a production build running alongside it.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  async redirects() {
    return [
      { source: "/blog/:path*", destination: "/", permanent: true },
      { source: "/projects/:path*", destination: "/#work", permanent: true },
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
      { source: "/links", destination: "/#footer", permanent: true },
      ...["posts", "projects", "profile", "skills", "settings", "media", "messages"].map((section) => ({
        source: `/admin/${section}/:path*`, destination: "/admin", permanent: false,
      })),
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
