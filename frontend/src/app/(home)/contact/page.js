import React from 'react'
import Contact from './Contact'

export const metadata = {
  title: 'Contact Us | Icon Perfumes - Attar & Perfume Oil',
  description: 'Reach out to us for any inquiries about our pure attars, natural perfume oils, lime sticks, or wholesale orders. We are based in Ahmedabad, India.',
  alternates: {
    canonical: 'https://www.iconperfumes.in/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const page = () => {
  return (
    <Contact />
  )
}

export default page
