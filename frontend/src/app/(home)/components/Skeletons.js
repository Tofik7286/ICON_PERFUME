'use client';
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="d-flex flex-column gap-2">
      <Skeleton className="w-full rounded-md" style={{ aspectRatio: "3/4", height: "auto" }} />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="d-flex gap-2 align-items-center">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="row g-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-lg-3 col-md-4 col-6">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="container-fluid padd-x mt-3">
      <Skeleton className="h-5 w-64 mb-3" />
      <div className="row">
        {/* Image section */}
        <div className="col-lg-5 col-12">
          <div className="d-flex gap-2">
            <div className="d-none d-lg-flex flex-column gap-2" style={{ width: "80px" }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="rounded-md" style={{ width: "70px", height: "70px" }} />
              ))}
            </div>
            <Skeleton className="rounded-md flex-1" style={{ aspectRatio: "3/4", height: "auto" }} />
          </div>
        </div>
        {/* Info section */}
        <div className="col-lg-7 col-12 mt-3 mt-lg-0">
          <div className="d-flex flex-column gap-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="d-flex gap-2 align-items-center">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="d-flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="rounded-full" style={{ width: "40px", height: "40px" }} />
              ))}
            </div>
            <div className="d-flex gap-2 mt-2">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
            <Skeleton className="h-4 w-full mt-3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
