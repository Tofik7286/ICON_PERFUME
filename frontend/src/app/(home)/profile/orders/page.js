import React from 'react'
import Orders from './Orders'
import axios from 'axios';
import { cookies } from 'next/headers';

export const metadata = {
  alternates: {
    canonical: `https://www.iconperfumes.in/profile/orders`,
  }
};

async function getOrder(){
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  try {
    const response =  await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/`,{
      withCredentials:true,
      headers:{
        "Cookie":cookieString,
        "Content-Type":"application/json"
      }
    })
    if(response.data.success){
      const sortedOrders = [...response.data.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return sortedOrders
    }
  } catch (error) {
      return null
  }
}

const page = async () => {
  const data = await getOrder()
  return (
    <Orders data={data}/>
  )
}

export default page
