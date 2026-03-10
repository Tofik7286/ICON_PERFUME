import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="container-fluid padd-x mt-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="row g-4">
        {/* Shipping form skeleton */}
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="row g-3">
              <div className="col-6">
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="col-6">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {/* Order summary skeleton */}
        <div className="col-lg-5">
          <div className="d-flex flex-column gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-1 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
