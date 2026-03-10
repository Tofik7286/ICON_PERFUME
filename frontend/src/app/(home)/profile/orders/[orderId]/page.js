import React from 'react'
import OrderId from './OrderId'
import axios from 'axios';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const orderId = params.orderId;
  // Fetch the home data for metadata purposes

  return {
    alternates: {
      canonical: `https://www.iconperfumes.in/profile/orders/${orderId}/`,
    }
  };
}
async function getOrderDetails(id){
  const cookiStore = await cookies()
  const cookieString = cookiStore.toString()
  try {
    const response =  await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-order/${id}/`,{
      withCredentials:true,
      headers:{
        "Cookie":cookieString,
        "Content-Type":"application/json"
      }
    })
    if(response.data.success){      
      return response.data
    }
  } catch (error) {
      return null
  }
}
const page = async({params}) => {
  const id = params.orderId;
  const data = await getOrderDetails(id)
  if(data){
    return (
      <OrderId data={data} id={id} />
    )
  } else {
    notFound();
  }
}

export default page
