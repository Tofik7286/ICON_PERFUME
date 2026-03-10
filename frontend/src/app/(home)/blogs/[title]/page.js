import React from 'react'
import BlogPage from './BlogPage'
import { notFound } from 'next/navigation';
import axios from 'axios';
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
    const slug =  params.title;
    // Fetch the home data for metadata purposes
    const { blogsData } = await fetchBlogData(slug);

    const title = blogsData[0].meta_title || 'Icon Perfumes Blog';
    const description = blogsData[0].meta_description || '';
    const canonical = `https://www.iconperfumes.in/blogs/${slug}/`;
    const imageUrl = blogsData[0].image?.url
        ? `${process.env.STRAPI_API}${blogsData[0].image.url}`
        : 'https://www.iconperfumes.in/images/og-default.jpg';

    return {
        title,
        description,
        keywords: blogsData[0].keywords || '',
        robots: {
            index: true,
            follow: true,
        },
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: 'Icon Perfumes',
            images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

const fetchBlogData = async(slug)=>{
    if(slug){
        const query = `/api/uk-blogs?filters[slug][$eq]=${slug}&populate=*`
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
}

async function page({params}) {
    if (params.slug !== "null") {
        const slug = await params.title;
        const { blogsData } = await fetchBlogData(slug)
        return (
            <BlogPage data={blogsData && blogsData[0]} />
        );
    }
    else {
        notFound()
    }
}

export default page
