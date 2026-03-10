import React from 'react'
import Blogs from './Blogs'
import axios from 'axios'

export const dynamic = 'force-dynamic' 

export const metadata = {
  alternates: {
    canonical: `https://www.iconperfumes.in/blogs/`,
  }
};

export async function fetchBlogs() {
  const query = `/api/uk-blogs?populate=*`
  try {
    // Fetch banners, categories, and products concurrently
    const [dataResponse] = await Promise.all([
      axios.get(`${process.env.STRAPI_API}${query}`),
    ]);

    // Parse the JSON responses
    const blogsData = dataResponse.data.data;

    return { blogsData };
  } catch (error) {
    console.error("Error fetching data:", error);

  }
}

const page = async() => {
  const { blogsData } = await fetchBlogs();
  return (
    <Blogs blogsData={blogsData && blogsData} />
  )
}

export default page
