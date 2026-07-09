import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-primary">
        Trang bạn tìm không tồn tại
      </h1>
      <p className="mt-2 max-w-md text-muted">
        Có thể liên kết đã cũ hoặc nội dung đã được di chuyển.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-inverse px-6 text-sm font-medium text-inverse-fg transition-colors duration-200 hover:bg-inverse-hover"
      >
        <Home className="h-4 w-4" aria-hidden /> Về trang chủ
      </Link>
    </div>
  );
}
