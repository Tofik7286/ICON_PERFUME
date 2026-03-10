const axios = require("axios");

function slugify(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '') // remove special chars
        .replace(/\-\-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.iconperfumes.in',
    generateRobotsTxt: true,
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    outDir: './public',
    additionalPaths: async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/`);
            const categories = res.data.categories || [];

            const categoryMap = {};
            const urls = [];

            // Step 1: Create a map of ID to category slug
            for (const cat of categories) {
                categoryMap[cat.id] = slugify(cat.name);
            }

            // Step 2: Generate category URL paths based on parent-child structure
            for (const cat of categories) {
                const slug = slugify(cat.name);

                let loc = `/${slug}`; // default path

                if (cat.parent && categoryMap[cat.parent]) {
                    const parentSlug = categoryMap[cat.parent];
                    loc = `/${parentSlug}/${slug}`; // nested path
                }

                urls.push({
                    loc,
                    lastmod: new Date().toISOString(),
                });
            }

            // Step 3: Generate product URLs dynamically
            const productsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/?isPage=false`);
            const variants = productsRes.data.variants || [];

            for (const variant of variants) {
                const productSlug = variant.product?.slug;
                if (!productSlug) continue;

                // Build category path from product's categories
                const productCategories = variant.product?.category || [];
                let categoryPath = '';

                if (productCategories.length > 0) {
                    // Find root category and subcategory
                    const rootCat = productCategories.find(c => !c.parent);
                    const subCat = productCategories.find(c => c.parent);

                    if (rootCat && subCat) {
                        categoryPath = `/${slugify(rootCat.name)}/${slugify(subCat.name)}`;
                    } else if (rootCat) {
                        categoryPath = `/${slugify(rootCat.name)}`;
                    }
                }

                const loc = categoryPath ? `${categoryPath}/${productSlug}` : `/${productSlug}`;

                // Avoid duplicate URLs
                if (!urls.some(u => u.loc === loc)) {
                    urls.push({
                        loc,
                        lastmod: variant.updated_at || new Date().toISOString(),
                        priority: 0.8,
                        changefreq: 'weekly',
                    });
                }
            }

            return urls;
        } catch (err) {
            console.error("Error generating sitemap:", err.message);
            return [];
        }
    },
};
