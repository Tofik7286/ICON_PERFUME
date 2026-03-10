'use client'
import React from 'react'
import PageHeader from '../components/PageHeader'
import Link from 'next/link'
import styles from '@/app/(home)/styles/blogs.module.css'
import Breadcrumb from '../components/BreadCrumb'
import Image from 'next/image'
import dateFormat, { masks } from "dateformat";

const Blogs = ({ blogsData }) => {
    return (
        <>
            <div className="container-fluid mb-5 my-4 padd-x">
                
                <div className="container-fluid p-0">
                    <div className="heading align-items-center mb-3">
                        <h1>
                            Our Blogs
                        </h1>
                        <div className="para">
                            <Link href={"/about/"} className='button border mt-3'>
                                <span className="text-wrapper" data-text="Know more"></span>
                                <div className="fill"></div>
                            </Link>
                        </div>
                    </div>

                    <div className="row g-3">
                        {
                           blogsData?.length>0 && blogsData.map((item,i)=>{
                                return(
                                    <div key={item.id} className="col-lg-4 col-md-6 col-12">
                                        <div className={styles.item}>
                                            <Image width={500} height={500} src={`${process.env.STRAPI_API}${item?.thumbnail?.url}`} className='img-fluid' alt={item?.title || 'Blog thumbnail'} />
                                            <div className={styles.content}>
                                                <span>{item.publishedAt && dateFormat(item.publishedAt, "mmmm dS, yyyy")}</span>
                                                <h4>{item.title}</h4>
                                                <Link href={`/blogs/${item.slug}`} className='button border mt-3'>
                                                    <span className="text-wrapper" data-text="Know more"></span>
                                                    <div className="fill"></div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                       
                    </div>
                </div>
            </div>
        </>
    )
}

export default Blogs
