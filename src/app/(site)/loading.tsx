import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton hiển thị trong lúc server render trang mới, thay cho màn hình trắng. */
export default function SiteLoading() {
  return (
    <div className="py-24 md:py-28">
      <div className="container-page">
        <div className="mb-16 max-w-2xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
