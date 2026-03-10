import axios from "axios";
import { cache } from "react";

const fetchBestSellers = cache(async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/products/?best_seller=true`
    );
    return response.data.variants || [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
});

export default fetchBestSellers;
