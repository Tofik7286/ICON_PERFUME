'use client';
import React from 'react';
import '@/app/(home)/page.css';
import dynamic from 'next/dynamic';
import HeroBanner from './components/HeroBanner';

const Categorie_sec = dynamic(() => import('./components/Categorie_sec'),{ssr:true});
const Wellness = dynamic(() => import('./components/Wellness'), { ssr: false });
const WeeBeing = dynamic(() => import('./components/WeeBeing'), { ssr: false });
const ProductList = dynamic(() => import('./components/ProductList'), { ssr: false });
const Icon_whychoose = dynamic(() => import('./components/Icon_whychoose'), { ssr: false });
// const Trusted = dynamic(() => import('./components/Trusted'), { ssr: false });
const Journey = dynamic(() => import('./components/Journey'), { ssr: false });
const Appointment = dynamic(() => import('./components/Appointment'), { ssr: false });

const Home = ({ data, newProducts,banners }) => {
  const { products } = data;

  return (
    <>
     <HeroBanner banners={banners}/>
      {/* <Hero /> */}
      <Categorie_sec products={products} />
      <Wellness />
      <WeeBeing />
      <ProductList products={newProducts} />
      <Icon_whychoose />
      {/* <Trusted /> */}
      <Journey />
      <Appointment />
    </>
  );
};

export default Home;
