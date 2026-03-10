import React, { Suspense } from 'react'
import Shop from '../shop/Shop'
import axios from 'axios';
import { notFound } from 'next/navigation';
import Detail from '../components/Detail';
import { cookies } from 'next/headers';
import { ProductGridSkeleton } from '../components/Skeletons';
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
    const { slug = [] } = await params;

    // Skip metadata generation for invalid or reserved paths
    const reservedPaths = ['checkout', 'payment', 'login', 'register', 'cart', 'order-confirm', '.well-known'];
    const invalidSlugs = ['null', 'undefined', ''];
    
    if (slug.some(s => reservedPaths.includes(s) || invalidSlugs.includes(s))) {
        return {
            title: 'Page Not Found',
            description: 'The page you are looking for does not exist.',
            robots: 'noindex, nofollow',
        };
    }

    try {
        if (slug.length === 1) {
            // Category page
            const [category] = slug;
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/?category=${category}`);
            const data = response?.data // assuming it's an array
            if (data) {
                return {
                    title: data?.categories?.meta_title || data.name,
                    description: data?.categories?.meta_description || '',
                    robots: data?.categories?.index === false ? 'noindex, nofollow' : 'index, follow',
                    alternates: {
                        canonical: `https://www.iconperfumes.in/${category}/` || ''
                    }
                };
            }
        }

        if (slug.length === 2) {
            const [category, second] = slug;

            // First, check if it's a product
            const isProduct = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/?category=${category}&product=${second}`);

            if (isProduct?.data?.success) {
                const productData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/product/${second}/`);
                const data = productData.data;
                const variant = data?.variants?.[0];
                const title = variant?.meta_title || variant?.product?.name || "Icon Perfumes";
                const description = variant?.meta_description || '';
                const imageUrl = variant?.images?.[0]?.image
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${variant.images[0].image}`
                    : 'https://www.iconperfumes.in/images/og-default.jpg';
                const canonical = `https://www.iconperfumes.in/${category}/${variant?.product?.slug}/`;
                return {
                    title,
                    description,
                    robots: variant?.index === false ? 'noindex, nofollow' : 'index, follow',
                    alternates: { canonical },
                    openGraph: {
                        title,
                        description,
                        url: canonical,
                        siteName: 'Icon Perfumes',
                        images: [{ url: imageUrl, width: 800, height: 800, alt: title }],
                        type: 'website',
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title,
                        description,
                        images: [imageUrl],
                    },
                };
            }

            // Otherwise, treat as subcategory
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/?category=${category}&sub-category=${second}`);
            const data = response?.data;

            if (data?.success) {
                return {
                    title: data?.categories?.meta_title || data.name,
                    description: data?.categories?.meta_description || '',
                    robots: data?.categories?.index === false ? 'noindex, nofollow' : 'index, follow',
                    alternates: {
                        canonical: `https://www.iconperfumes.in/${category}/${second}/` || ''
                    }
                };
            }
        }

        if (slug.length === 3) {
            const [category, subcategory, product] = slug;
            const productData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/product/${product}/`);
            const data = productData.data;
            const variant = data?.variants?.[0];
            const title = variant?.meta_title || variant?.product?.name || "Icon Perfumes";
            const description = variant?.meta_description || '';
            const imageUrl = variant?.images?.[0]?.image
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${variant.images[0].image}`
                : 'https://www.iconperfumes.in/images/og-default.jpg';
            const canonical = `https://www.iconperfumes.in/${category}/${subcategory}/${variant?.product?.slug}/`;
            return {
                title,
                description,
                robots: variant?.index === false ? 'noindex, nofollow' : 'index, follow',
                alternates: { canonical },
                openGraph: {
                    title,
                    description,
                    url: canonical,
                    siteName: 'Icon Perfumes',
                    images: [{ url: imageUrl, width: 800, height: 800, alt: title }],
                    type: 'website',
                },
                twitter: {
                    card: 'summary_large_image',
                    title,
                    description,
                    images: [imageUrl],
                },
            }
        }
    } catch (error) {
        console.error("Metadata error:", error);
    }

    // Default fallback
    return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
        robots: 'noindex, nofollow',
    };
}

async function fetchCategoryProducts(category_name, searchParams) {

    const cookieStore = await cookies()
    const cookieString = cookieStore.toString()
    try {
        const pageParam = searchParams?.page || 1;
        const priceParam = searchParams?.price;
        const sortParam = searchParams?.sort_by;
        let filters = {};
        if (priceParam) {
            const decoded = decodeURIComponent(priceParam); // e.g. "minPrice=18,maxPrice=100"
            const parts = decoded.split(',');

            const priceFilter = { min: 0 };
            parts.forEach(part => {
                const [key, value] = part.split('=');
                if (key === 'minPrice') priceFilter.min = Number(value);
                if (key === 'maxPrice') priceFilter.max = Number(value);
            });

            filters.price = priceFilter;
        }

        // Fetch banners, categories, and products concurrently
        const [productsResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/?category=${category_name}`, {
                params: {
                    page: pageParam,
                    sort_by: sortParam,
                    ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) })
                },
                withCredentials: true,
                headers: {
                    "Cookie": cookieString
                }
            }),
        ]);
        // Parse the JSON responses

        const products = productsResponse?.data?.variants || [];
        const totalPages = productsResponse.data?.pagination?.totalPages;

        return { products, totalPages };
    } catch (error) {
        console.error("Error fetching data:", error);
        const products = []
        return { products, totalPages: 1 }
        // return error
    }
}
async function fetchSubCategoryProducts(category_name, sub_category_name, searchParams) {
    const cookieStore = await cookies()
    const cookieString = cookieStore.toString()
    try {
        const pageParam = searchParams?.page || 1;
        const priceParam = searchParams?.price;
        const sortParam = searchParams?.sort_by;
        let filters = {};
        if (priceParam) {
            const decoded = decodeURIComponent(priceParam); // e.g. "minPrice=18,maxPrice=100"
            const parts = decoded.split(',');

            const priceFilter = { min: 0 };
            parts.forEach(part => {
                const [key, value] = part.split('=');
                if (key === 'minPrice') priceFilter.min = Number(value);
                if (key === 'maxPrice') priceFilter.max = Number(value);
            });

            filters.price = priceFilter;
        }

        // Fetch banners, categories, and products concurrently
        const [productsResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/?category=${category_name}&sub-category=${sub_category_name}`, {
                params: {
                    page: pageParam,
                    sort_by: sortParam,
                    ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) })
                },
                withCredentials: true,
                headers: {
                    "Cookie": cookieString
                }
            }),
        ]);
        // Parse the JSON responses

        const sub_cate_products = productsResponse?.data?.variants || [];
        const totalPages = productsResponse.data?.pagination?.totalPages;

        return { sub_cate_products, totalPages };
    } catch (error) {
        console.error("Error fetching data:", error);
        const sub_cate_products = []
        return { sub_cate_products, totalPages: 1 }
        // return error
    }
}
async function fetchProduct(product) {
    const cookieStore = await cookies()
    const cookieString = cookieStore.toString()
    try {
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/product/${product}/${sku}/?desc=${desc}`)
        const [responseData] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/product/${product}/`, {
                withCredentials: true,
                headers: {
                    "Cookie": cookieString
                }
            })
        ]);

        const data = responseData.data;
        return data
    } catch (error) {

    }
}
async function fetchCategories() {
    try {
        // Fetch banners, categories, and products concurrently
        const [categoriesResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/`),
        ]);
        // Parse the JSON responses

        const categories = categoriesResponse?.data?.categories || [];
        return { categories };
    } catch (error) {
        console.error("Error fetching data:", error);
        const categories = []
        return { categories }
        // return error
    }
}
async function checkCategories(categorySlug) {
    try {
        // Fetch banners, categories, and products concurrently
        const [categoriesResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/?category=${categorySlug}`),
        ]);
        // Parse the JSON response
        return categoriesResponse;
    } catch (error) {
        console.error("Error fetching data:", error);
        return false
        // return error
    }
}
async function checkCategoriesProducts(categorySlug, secondSlug) {
    try {
        // Fetch banners, categories, and products concurrently
        const [categoriesResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/?category=${categorySlug}&product=${secondSlug}`),
        ]);
        // Parse the JSON response
        return categoriesResponse;
    } catch (error) {
        console.error("Error fetching data:", error);
        return false
        // return error
    }
}
async function checkSubCategories(categorySlug, secondSlug, productSlug) {
    try {
        // Fetch banners, categories, and products concurrently
        const [categoriesResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/?category=${categorySlug}&sub-category=${secondSlug}&product=${productSlug}`),
        ]);
        // Parse the JSON response
        return categoriesResponse;
    } catch (error) {
        console.error("Error fetching data:", error);
        return false
        // return error
    }
}
async function getProductReviews(slug, searchParams) {
    const page = searchParams?.page || 1
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-reviews/${slug}/?page=${page}`);

        if (response.data.success) {
            return response.data
        }
    } catch (error) {

        return {
            data: {
                reviews: []
            }
        }
    }
}

const page = async ({ params, searchParams }) => {
    const { slug = [] } = await params;
    const resolvedSearchParams = await searchParams;

    if (slug.length === 1) {
        const [category] = slug;
        const { products, totalPages } = await fetchCategoryProducts(category, resolvedSearchParams);
        const { categories } = await fetchCategories();

        if (products.length > 0) {
            return (

                <Suspense fallback={<ProductGridSkeleton count={8} />}>
                    <Shop products={products} totalPages={totalPages} categories={categories} category_name={category} />
                </Suspense>
            )
        }
    }
    if (slug.length === 2) {
        const [categorySlug, secondSlug] = slug;

        const category = await checkCategories(categorySlug);
        if (!category?.data?.success) return notFound();

        const isProduct = await checkCategoriesProducts(categorySlug, secondSlug);
        if (isProduct?.data?.success) {
            const data = await fetchProduct(secondSlug);
            const reviews = await getProductReviews(secondSlug, resolvedSearchParams)
            if (data) {
                const variant = data?.variants?.[0];
                const productName = variant?.product?.name || variant?.meta_title || 'Product';
                const productImage = variant?.images?.[0]?.image
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${variant.images[0].image}`
                    : 'https://www.iconperfumes.in/images/og-default.jpg';
                const jsonLd = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: productName,
                    image: productImage,
                    description: variant?.meta_description || '',
                    brand: { '@type': 'Brand', name: 'Icon Perfumes' },
                    offers: {
                        '@type': 'Offer',
                        price: variant?.discounted_price || variant?.price || 0,
                        priceCurrency: 'INR',
                        availability: variant?.available && variant?.stock > 0
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/OutOfStock',
                        url: `https://www.iconperfumes.in/${categorySlug}/${variant?.product?.slug}/`,
                    },
                };
                return (
                    <>
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                        />
                        <Detail review={reviews} detailData={data} slug={secondSlug} />
                    </>
                )
            }
        }

        // Try checking if secondSlug is a PRODUCT

        // Otherwise, maybe it's a sub-category

        const { sub_cate_products, totalPages } = await fetchSubCategoryProducts(categorySlug, secondSlug, resolvedSearchParams);
        const { categories } = await fetchCategories();
        if (sub_cate_products.length > 0) {
            return (
                <Suspense fallback={<ProductGridSkeleton count={8} />}>
                    <Shop products={sub_cate_products} totalPages={totalPages} categories={categories} category_name={secondSlug} />
                </Suspense>
            )
        }
    }
    if (slug.length === 3) {
        const [categorySlug, subCategorySlug, productSlug] = slug;
        const category = await checkSubCategories(categorySlug, subCategorySlug, productSlug);
        if (!category?.data?.success) return notFound()
        const data = await fetchProduct(productSlug);
        const reviews  = await getProductReviews(productSlug, resolvedSearchParams);
        if (!data) return notFound();

        const variant = data?.variants?.[0];
        const productName = variant?.product?.name || variant?.meta_title || 'Product';
        const productImage = variant?.images?.[0]?.image
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${variant.images[0].image}`
            : 'https://www.iconperfumes.in/images/og-default.jpg';
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: productName,
            image: productImage,
            description: variant?.meta_description || '',
            brand: { '@type': 'Brand', name: 'Icon Perfumes' },
            offers: {
                '@type': 'Offer',
                price: variant?.discounted_price || variant?.price || 0,
                priceCurrency: 'INR',
                availability: variant?.available && variant?.stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                url: `https://www.iconperfumes.in/${categorySlug}/${subCategorySlug}/${variant?.product?.slug}/`,
            },
        };

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <Detail review={reviews} detailData={data} slug={productSlug} />
            </>
        )
    }

    notFound();
}

export default page
