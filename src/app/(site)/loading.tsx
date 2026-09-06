import { Skeleton } from "@/components/ui/skeleton";

/** One-page loading placeholder, matching the hero instead of retired project cards. */
export default function SiteLoading() {
  return (
    <div className="py-24 md:py-28">
      <div className="container-page">
        <div className="mb-16 max-w-2xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl md:h-96" />
      </div>
    </div>
  );
}
