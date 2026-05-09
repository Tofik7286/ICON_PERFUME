// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "127.0.0.1",
      "localhost",
      "3.109.240.161",
      "www.iconperfumes.in",
      "api.iconperfumes.in",
      "www.test4.wardah.in",
      "api.test4.wardah.in",
      "13.232.103.131",
      "http://66.116.232.36:4019/",
      "66.116.232.36:4019",
      "66.116.232.36"
    ],
    // Optimize image caching to reduce memory footprint
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
  },
  
  // Limit on-demand entries cache to prevent memory bloat
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 seconds - removes inactive pages from cache
    pagesBufferLength: 5, // Keep only 5 pages in buffer instead of unlimited
  },
  
  // Compress build output
  compress: true,
};

module.exports = nextConfig;
