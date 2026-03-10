import React, { Suspense } from 'react'
import Shop from './Shop'
import axios from 'axios';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic'

export const metadata = {
  alternates: {
    canonical: `https://www.iconperfumes.in/shop/`,
  }
};

// ✅ No need to pass searchParams into another async function
const page = async ({ searchParams }) => {
  // Access searchParams directly after awaiting it
  const params = await searchParams;
  const pageParam = params?.page || 1;
  const priceParam = params?.price;
  const sortParam = params?.sort_by;
  const best_seller = params?.best_seller;
  const new_arrival = params?.new_arrival;
  const query = params?.q;

  const cookieStore = await cookies()
  const cookieString = cookieStore.toString()

  // Parse price filter
  let filters = {};
  if (priceParam) {
    const decoded = decodeURIComponent(priceParam);
    const parts = decoded.split(',');
    const priceFilter = { min: 0 };
    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key === 'minPrice') priceFilter.min = Number(value);
      if (key === 'maxPrice') priceFilter.max = Number(value);
    });
    filters.price = priceFilter;
  }

  // Fetch products and categories
  let products = [], categories = [], totalPages = 1;
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/`, {
        params: {
          page: pageParam,
          sort_by: sortParam,
          best_seller,
          new_arrival,
          query,
          ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) })
        },
        withCredentials: true,
        headers: { "Cookie": cookieString }
      }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/`)
    ]);

    products = productsResponse.data.variants || [];
    totalPages = productsResponse.data?.pagination?.totalPages || 1;
    categories = categoriesResponse.data.categories || [];
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center flex-col" style={{ height: "100vh" }}>
        <div className="loader-circle">
          <span className="loader"></span>
        </div>
      </div>
    }>
      <Shop products={products} categories={categories} totalPages={totalPages} />
    </Suspense>
  )
}

export default page
