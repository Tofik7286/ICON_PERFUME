
import Home from "./Home";
import axios from "axios";
import fetchBestSellers from "./lib/fetchBestSellers";
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Buy Pure Attar & Lime Sticks Online | Icon Perfumes',
  description: 'Shop Icon Perfumes for great quality, long-lasting fragrances in India. Find premium attars and lime sticks for men & women.',
  alternates: {
    canonical: 'https://www.iconperfumes.in/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function fetchBanners(){
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/banners/`)
    
    if(response.data.success){
      return response.data
    }
  } catch (error) {
    return{
      banners:[]
    }
  }
}
async function fetchNewProducts() {
  try {
    // Fetch banners, categories, and products concurrently
    const [productsResponse] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/?new_arrival=true`)
    ]);

    const newProducts = productsResponse.data.variants;
    return { newProducts };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { newProducts: [] }
    // return error
  }
}
export default async function page() {

  const products = await fetchBestSellers();
  const {newProducts} = await fetchNewProducts()
  const {banners} =  await fetchBanners()
  
  return (
    <>
      <Home banners={banners} data={{products}} newProducts={newProducts} />
    </>
  );
}
