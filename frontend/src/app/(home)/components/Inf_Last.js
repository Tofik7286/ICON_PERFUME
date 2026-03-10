import React from 'react'
import styles from '../styles/content_pages.module.css'
import Image from 'next/image'

function Inf_Last() {
    const data = [
        {
            image:{
                src:"/images/influence_sec4.webp",
                tag1:"Tag us in your content using",
                hastag:"#HideLifestyle",
                tag2:"and get noticed by our growing community! "
            },
            title: "What Influencers Do",
            sub:[
                {
                    subtitle:"Create, Share & Inspire",
                    sub_content:"Join the Hide Lifestyle family and showcase our premium leather bags on your social platforms. Share stunning content, inspire your audience, and be part of a brand that values style, quality, and craftsmanship.",
                    list: ["Post engaging content featuring Hide Lifestyle accessories on Instagram, YouTube, TikTok, and Facebook. ",
                        "Join our affiliate program and earn commissions by sharing your unique referral link. ",
                        "Connect with a fashion-forward community and let your content shine with Hide Lifestyle's signature elegance."
                    ]
                }
            ]
        },
        {
            image:{
                src:"/images/inflluence_sec5.webp",
                tag1: "Mention us on your contents ",
                hastag: "@hidelife_style",
                tag2:"and get featured on our page!"
            },
            title:"Designed for Every Style",
            sub:[
                {
                    subtitle: "Premium, Versatile & Timeless ",
                    sub_content:"No matter your aesthetic, we have something for you. Our leather bags are designed for all personalities, offering the perfect balance of elegance, durability, and functionality. ",
                    list:[
                        "Whether you're a fashion lover, traveler, or lifestyle influencer, our collections fit every occasion. ",
                        "Crafted with passion, our accessories are made from the finest leather, ensuring premium quality and long-lasting style. ",
                        "Elevate your content with pieces that speak sophistication and make a statement in every frame. "
                    ]
                }
            ]
        },
        {
            image: {
                src: "/images/influence_sec6.webp",
                tag1: "Mention us on your contents ",
                hastag: "@hidelife_style",
                tag2: "and get featured on our page!"
            },
            title: "Become a Hide Lifestyle Creator ",
            sub: [
                {
                    subtitle: "Easy, Fun & Rewarding",
                    sub_content: "We believe in working with influencers who share our love for fashion and creativity. If you’re passionate about quality leather accessories, we’d love to have you on board! ",
                    list: [
                        "Must be 18+ years old and have an active social media presence. ",
                        "Have a creative eye, a great sense of style, and strong audience engagement. ",
                        "Skilled in photography and video content creation to highlight the beauty of our products. "
                    ]
                }
            ]
        }
    ]
  return (
    <div className={styles.last_sec}>
        {
            data.map((item,i)=>{
                return(
                    <div key={i} className='row gx-5  gy-5 mb-3'>
                        <div className={`${i % 2 == 1 && "lg:order-1"}  col-lg-5 flex justify-end relative`}>
                            <div className='w-[90%] '>
                                <Image className='img-fluid' src={item.image.src} width={1000} height={1000} alt={item.name || 'Influencer feature'}/>
                            </div>
                            <div className=' z-2 absolute  flex lg:w-[55%] lg:h-[30%] p-3 flex-col justify-center items-center gap-1 bottom-[-10%] left-0 rounded bg-[#eee] lg:px-5 lg:py-3'>
                                <div>
                                    <p className='!text-sm' >{item.image.tag1}</p>
                                    <div className='heading !my-0'>
                                        <h4 className='!font-bold'><span>{item.image.hastag}</span></h4>
                                    </div>
                                    <p className='!text-sm'>{item.image.tag2}</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-7 mt-5  justify-center flex flex-col lg:gap-5 gap-2'>
                            <div className='heading !my-0'>
                             <h2 className='!w-full'><span>{item.title}</span></h2>
                            </div>
                            {
                                item.sub.map((list,index)=>{
                                    return(
                                        <div className='flex flex-col gap-3 lg:w-[90%]' key={index}>
                                            <div className='heading !my-0'>
                                                <h3 className='!text-lg'>{list.subtitle}</h3>
                                            </div>
                                            <p className='lg:!text-lg'>{list.sub_content}</p>
                                            {
                                                list.list.length>0 &&
                                                <ul className='!list-disc !pl-4'>
                                                    {
                                                        list.list.map((item)=>{
                                                            return(
                                                                <li key={item}>
                                                                    {item}
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            })
        }
    </div>
  )
}

export default Inf_Last
