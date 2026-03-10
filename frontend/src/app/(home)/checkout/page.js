import React, { Suspense } from 'react'
import Checkout from './Checkout'

export const metadata = {
  alternates: {
    canonical: `https://www.iconperfumes.in/checkout/`,
  }
};

const page = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-pulse">Loading checkout...</div></div>}>
      <Checkout />
    </Suspense>
  );
};

export default page;
