import React from 'react'
import About from './About'

export const metadata = {
  title: 'About Icon Perfumes | Authentic Attars & Natural Fragrances',
  description: 'Learn more about our passion for pure attars, traditional fragrance oils, and natural products. Based in Ahmedabad, we are committed to quality and authenticity.',
  alternates: {
    canonical: 'https://www.iconperfumes.in/about',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const page = () => {
  return (
    <About />
  )
}

export default page
