import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const WhyChoose = () => {
    return (
        <div className='container-fluid padd-x why-choose'>
            <div className="heading align-items-center">
                <h2>
                    <span>Why Hide Lifestyle?</span>
                </h2>
                <div className="para">
                    <Link href={"/about/"} className='button border mt-3'>
                        <span className="text-wrapper" data-text="Discover More"></span>
                        <div className="fill"></div>
                    </Link>
                </div>
            </div>

            <div className="row align-items-center">
                <div className="col-lg-4 col-md-6 col-12">
                    <div className="why-item">
                        <div className="why-image">
                            <Image src="/images/secure.svg" className='img-fluid' width={200} height={200} alt="Premium quality" />
                        </div>
                        <h4>Premium Quality</h4>
                        <p>Crafted from 100% genuine leather, ensuring durability, elegance, and timeless appeal in every piece.</p>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12">
                    <div className="why-item">
                        <div className="why-image">
                            <Image src="/images/handmade.svg" className='img-fluid' width={200} height={200} alt="Thoughtful craftsmanship" />
                        </div>
                        <h4>Thoughtful Craftsmanship</h4>
                        <p>Each product undergoes rigorous quality checks, combining style, comfort, and superior functionality.</p>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12">
                    <div className="why-item">
                        <div className="why-image">
                            <Image src="/images/delivery.svg" className='img-fluid' width={200} height={200} alt="Trusted by many" />
                        </div>
                        <h4>Trusted by Many</h4>
                        <p>With 97% customer satisfaction, we are a trusted choice for luxury leather accessories worldwide</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WhyChoose
