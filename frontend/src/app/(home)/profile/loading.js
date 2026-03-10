import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="container-fluid padd-x mt-4">
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-40 mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
