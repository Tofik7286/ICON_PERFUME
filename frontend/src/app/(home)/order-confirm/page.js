import React, { Suspense } from 'react'
import OrderConfirm from './OrderConfirm'
import axios from 'axios';
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation';

export const metadata = {
  alternates: {
    canonical: `https://www.iconperfumes.in/order-confirm/`,
  }
};

async function fetchData() {
  try {
    // Fetch banners, categories, and products concurrently
    const [productsResponse] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/`)
    ]);

    // Parse the JSON responses
    const products = productsResponse.data.variants;

    return products;
  } catch (error) {
    console.error("Error fetching data:", error);
    // return error
  }
}
async function getOrderDetails(searchParams){
  const order_Id = await searchParams?.order_id
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  try {
    const response  = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-order/${order_Id}/`,
      { withCredentials:true,
        headers:{
          "Cookie":cookieString,
          "Content-Type": "application/json",
        }
      }
    );
    
    if(response.data.success){
      return response.data
    }
  } catch (error) {

      return null
  }
}
const page = async ({searchParams}) => {

  const products = await fetchData()
  const orderData = await getOrderDetails(searchParams)
  if(orderData){
    return (
      <Suspense fallback={
        <div className="d-flex align-items-center justify-content-center flex-col" style={{ height: "100vh" }}>
          <div className="loader-circle">
            <span className="loader"></span>
          </div>
        </div>
      }>
        <OrderConfirm products={products} orderData={orderData} />
      </Suspense>
    )
  } else {
    notFound();
  }
}

export default page
