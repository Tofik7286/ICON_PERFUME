import React from 'react'
import AddressDetail from './AddressDetail'
import axios from 'axios';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const slug = params.id;
  // Fetch the home data for metadata purposes
  

  return {
    alternates: {
      canonical: `https://www.iconperfumes.in/profile/addresses/${slug}/`,
    }
  };
}

async function getAddressDetail(params) {
  const cookiesStore = await cookies()
  const cookieString = cookiesStore.toString()
    const id =  params.id
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addresses/?address_id=${id}`,{
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
  const data = await getAddressDetail(params)
  if (!data) return notFound()
  return (
    <AddressDetail address={data.address} id={params.id} />
  )
}

export default page
