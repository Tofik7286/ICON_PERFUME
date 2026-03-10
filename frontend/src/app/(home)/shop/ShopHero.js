import Image from 'next/image'
import React from 'react'

function ShopHero() {
  return (
    <div className='container-fluid padd-x'>
        <div className='shop-hero py-[1em] lg:py-[3em]'>
                <div className='row gx-3 gy-3'>
                    <div className='col-lg-6 flex flex-col justify-between gap-3'>
                      <h1>Discover Our Authentic Alcohol-Free Attar Collection </h1>
                      <Image src="/icon_images/shop_hero2.png" width={1000} height={1000} className='img-fluid' alt="Attar collection showcase" />
                    </div>
                    <div className='col-lg-6'>
                      <Image src="/icon_images/shop_hero1.png" width={1000} height={1000} className='img-fluid' alt="Shop hero banner"/>
                    </div>
                </div>
        </div>
    </div>
  )
}

export default ShopHero
