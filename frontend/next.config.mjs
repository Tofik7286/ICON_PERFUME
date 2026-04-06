/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      "127.0.0.1",
      "localhost",
      "3.109.240.161",
      "www.iconperfumes.in",
      "www.hidelifestyle.au",
      "api.iconperfumes.in",
      "www.test4.wardah.in",
      "api.test4.wardah.in",
    ],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    IMAGE_URL: process.env.IMAGE_URL,
    STRAPI_API: process.env.STRAPI_API,
    BANNER_IMAGE_URL: process.env.BANNER_IMAGE_URL,
    DOMAIN: process.env.DOMAIN,
  },
  trailingSlash: true,
};

export default nextConfig;
