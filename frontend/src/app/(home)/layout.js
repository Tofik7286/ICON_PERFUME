import "@/app/(home)/index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar1 from "./components/Navbar1";
import Footer from "./components/Footer";
import ClientProvider from "./ClientProvider";
import ToastsContainer from "./components/ToastContainer";
import Loader from "./components/Loader";
import Modal from "./components/Modal";
import ConfirmModal from "./components/Confirm";
import RedirectHandler from "./components/RedirectHandler";
import { Inter,Bricolage_Grotesque } from 'next/font/google'
import axios from "axios";
import fetchBestSellers from "./lib/fetchBestSellers";
// import SubscribePopup from "./components/SubscribePopup";
// import Script from "next/script";
import TrackingScript from "./components/TrackingScript";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"], 
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const fetchCategories = async() =>{
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/`)
    
    if(response?.data?.success){
        return response.data.categories || []
    }
    return []
  } catch (error) {

      return []
  }
}


export const metadata = {
  title: "Icon Perfume",
  description: "",
  verification: {
    google: "v0AIuIpbm2jX9t1dfgTCUO32JUrIujl6dAgQiS1bNTk",
  },
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon_io/favicon-16x16.png', sizes: '16x16' },
      { rel: 'icon', url: '/favicon_io/favicon-32x32.png', sizes: '32x32' },
      { rel: 'icon', url: '/favicon_io/favicon.png', sizes: 'any' },
      { rel: 'apple-touch-icon', url: '/favicon/apple-touch-icon.png', sizes: '180x180' },
      { rel: 'icon', url: '/favicon_io/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/favicon_io/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
};

export default async function HomeLayout({ children }) {
  const {categories} = await fetchCategories();
  const products = await fetchBestSellers();
  
  return (
    <html lang="en">
      {/* <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive" // or 'lazyOnload'
      /> */}
      <body className={`${inter.variable} ${bricolage.variable}`}>
        <ClientProvider>
          <TrackingScript/>
          <ConfirmModal />
          <RedirectHandler />
          <ToastsContainer />
          <Loader />
          <Navbar1 categories={categories}/>
          {/* <SubscribePopup/> */}
          <Modal />
          <main className="main">
            {children} 
          </main>
          <Footer products={products}/>
          {/* <CookiePopup /> */}
        </ClientProvider>
      </body>
    
    </html>
  );
}
