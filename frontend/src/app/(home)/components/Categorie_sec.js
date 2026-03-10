'use client'
import React, { useEffect, useRef } from 'react'
import { motion } from "motion/react"
import { useInView } from "motion/react"
import Link from 'next/link'
import Image from 'next/image'

function Categorie_sec({products}) {
    const ref = useRef(null)
    const headerRef = useRef(null)
    const paraRef = useRef(null)

    const isInView = useInView(ref, { once: true });
    const headerInview = useInView(headerRef,{once:true})
    const paraInview = useInView(paraRef, { once: true })
    function getProductURL(product) {
        const mainCategory = product.category.find(cat => cat.level === 0);
        const subCategory = product.category.find(cat => cat.level === 1);

        if (subCategory) {
            // We're on subcategory page → include both
            return `/${mainCategory.name.toLowerCase().replace(/\s+/g, '-')}/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}/${product.slug}`;
        }

        // Otherwise just category/product-slug
        return `/${mainCategory.name.toLowerCase().replace(/\s+/g, '-')}/${product.slug}`;
    }
    return (
        <div   
            className="container-fluid mt-4  padd-x"
        >
            <div className='flex flex-col gap-3 text-center items-center'>
                <motion.p ref={paraRef}
                    className='uppercase !font-[500]'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: paraInview ? 1 : 0, y: paraInview ? 0 : 20 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    Trending Now
                </motion.p>
                <motion.div ref={headerRef} initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: headerInview ? 1 : 0, y: headerInview ? 0 : 20 }}
                    transition={{ delay: 0.2, duration: 0.6 }} className='heading !my-0'>
                    <h2 className='!w-full'>Explore Our Collection</h2>
                </motion.div>
            </div>
            <div ref={ref} className="row mt-3 g-lg-4 g-2">
                {/* Repeat for each product category */}
                {products?.length>0 && products.slice(0,4).map((item, idx) => (
                    <div key={idx} className="col-lg-3 col-6">
                        <Link href={getProductURL(item.product)} className="main-category h-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }} // Staggered delay for each item
                            >
                                <Image
                                    src={ item.images[0] ? process.env.NEXT_PUBLIC_BACKEND_URL + item.images[0].image : '/images/not_found.png'}
                                    className='img-fluid'
                                    width={1000}
                                    loading='lazy'
                                    height={1000}
                                    alt={item.product.title + "- icon perfumes"}
                                />
                                <div className='py-3 h-full flex flex-col justify-between items-center gap-2'>
                                    <p className='uppercase !text-xs'>Limited time</p>
                                    <h4 className='!text-center !font-semibold line-clamp-2 '>{item.product.title.toUpperCase()}</h4>
                                   
                                        <p className='!font-medium'>Shop Now</p>
                                   
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Categorie_sec
