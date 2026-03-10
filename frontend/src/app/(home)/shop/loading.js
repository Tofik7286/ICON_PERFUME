import { ProductGridSkeleton } from "../components/Skeletons";

export default function ShopLoading() {
  return (
    <div className="container-fluid padd-x mt-3">
      <ProductGridSkeleton count={8} />
    </div>
  );
}
