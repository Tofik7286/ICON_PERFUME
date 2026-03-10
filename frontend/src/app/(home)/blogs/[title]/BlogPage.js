'use client'
import React from 'react'
import PageHeader from '../../components/PageHeader'
import Breadcrumb from '../../components/BreadCrumb'
import Image from 'next/image'
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/toastSlice';
import { useForm } from 'react-hook-form';
import { loader } from '../../redux/loaderSlice';

import styles1 from '@/app/(home)/styles/water.module.css'
import { notFound } from 'next/navigation'
import { BlocksRenderer, BlocksContent } from '@strapi/blocks-react-renderer';

function BlogPage({data}) {
  const url = process.env.NEXT_PUBLIC_API_URL
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const dispatch = useDispatch()
  const onSubmit = async (formdata) => {

    dispatch(loader(true))
    try {
      const response = await fetch(`${url}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formdata,
        })
      })
      const json = await response.json();
      if (json.success) {
        dispatch(addToast({ message: json.message, type: 'success' }))
        reset()
      } else {
        dispatch(addToast({ message: json.message, type: 'error' }))
      }
    } catch (error) {

    } finally {
      dispatch(loader(false))
    }
  }
  if (!data) return notFound();
  return (
   <>
      <PageHeader color={"white"} heading={"New Year's Gift Ideas for 2025"} content={"When every detail counts, why settle for anything less than extraordinary? Introducing Hides`ign’s collection of leather laptop bags for men"} img={'/images/blogs_inner_banner.webp'} tag={"h1"} />
      <div className={`${styles1.cta} !mt-0 p-2 mb-4`} style={{ backgroundImage:`url("${process.env.STRAPI_API}${data?.banner_image?.url}")`} }>
        <div className={styles1.cta_content}>
          {
            data.title &&
            <h1>{data.title}</h1>
          }
          {
            data.description &&
            <p className='lg:w-[80%] lg:!text-lg'>{data.description}
            </p>  
          }
        </div>
      </div>
      <div className="padd-x mb-5">
        <Breadcrumb/>
        <div className='row g-3 mt-3 relative'>
          <div className='col-lg-8 flex flex-col gap-3'>
            <BlocksRenderer
              content={data?.content}
              blocks={{
                image: ({ image }) => {
                  if (!image || !image.url) return null;
                  const fixedUrl = image.url.replace("localhost", "127.0.0.1");

                  return (
                    <Image
                      className="img-fluid col-lg-12 rounded-xl"
                      src={fixedUrl}
                      width={1000}
                      height={1000}
                      alt={image.alternativeText || ""}
                    />
                  );
                },
                heading: ({ level, children }) => {
                  if (level === 2) {
                    return (
                      <div className="heading !my-0">
                        <h2 className="!w-[100%]"><span>{children}</span></h2>
                      </div>
                    );
                  }
                  const Tag = `h${level}`;
                  return <Tag>{children}</Tag>;
                },
                // Custom list renderer for rich text lists
                list: ({ children, format }) => {
                  
                  if (format === "unordered") {
                    return <ul className="!list-disc !p-4 flex flex-col gap-3">{children}</ul>;
                  }
                  if (format === "ordered") {
                    return <ol className="!list-decimal !p-4 flex flex-col gap-3">{children}</ol>;
                  }
                },
              }}
            />

              {/* <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquam fugiat aliquid optio dolorum, consequuntur provident nihil, totam architecto iste ab quidem laudantium nulla sed! Officia?</p>
              <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Recusandae cupiditate similique nihil saepe odio ea sint enim laborum ullam! Et, at? Esse fugit non nisi.</p>
              <ul className='!list-disc !p-4 flex flex-col gap-3'>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur, sit in praesentium molestias vitae, mollitia quibusdam accusantium tempora soluta eius dicta, facilis expedita aliquam distinctio.</li>
                <li>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Labore aut officiis rerum maiores fuga accusamus.</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod excepturi commodi nostrum ipsum hic architecto error saepe illum unde voluptates! Ut quam nemo rerum reprehenderit officiis, quibusdam tempore! Quidem architecto at reiciendis alias mollitia consequuntur libero. Velit sequi deserunt non, maxime temporibus saepe excepturi iure.</li>
              </ul>
              <div className='heading '>
              <h2 className='!w-[100%]'><span>Why Business Consultation Matters</span></h2>
              </div>
            <p>Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium morbi nisl curabitur lectus, eu curae at purus maximus
              metus rhoncus ac pretium elit. Consectetur lobortis sodales tristique mi ultricies natoque maecenas. Hac ullamcorper
              vitae ligula taciti iaculis tristique curabitur dictum.</p>
            <Image className='img-fluid rounded' width={1500} height={1500} src="/images/blog_inner_img1.png" alt=''/> */}
          </div>
          <div className='col-lg-4'>
            <div className='sticky top-[15%]  bg-[rgb(0,0,0,0.05)] rounded-xl px-5 py-5'>
              <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col items-center gap-3'>
                <div className='heading !my-0'>
                    <h3 className='!w-full text-3xl'>Get In Touch</h3> 
                </div>
                <p className='text-center !text-sm'>Lorem ipsum dolor sit amet consectetur adipiscing elit Proin
                  sem eros ornare sed lacinia</p>
                <input  {...register('f_name', { required: true })} className='rounded-full px-4 bg-transparent border-2 py-2 w-full text-sm' type="text"  id="f_name" placeholder='First Name' />
                {errors.f_name && <p className="!text-red-500 text-xs">{errors.f_name.message}</p>}
                <input  {...register('l_name', { required: true })} className='rounded-full px-4 bg-transparent border-2 py-2 w-full text-sm' type="text" name="l_name" id="l_name" placeholder='Last Name' />
                {errors.l_name && <p className="text-red-500 text-xs">{errors.l_name.message}</p>}
                <input  {...register('email', { required: true })} className='rounded-full px-4 bg-transparent border-2 py-2 w-full text-sm' type="email" name="email" id="email" placeholder='Your email address' />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                <input  {...register('phone', { required: true })} className='rounded-full px-4 bg-transparent border-2 py-2 w-full text-sm' type="text" name="phone" id="phone" placeholder='Phone number' />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}

                <textarea  {...register('message', { required: true })} className='rounded px-4 bg-transparent border-2 py-2 w-full text-sm' name="message" id="message" placeholder='Your Message'  rows="4"></textarea>
                {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}

                <button type="submit" className='border-1 border-black text-black rounded-full w-full py-2 px-4 text-sm'>
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
   </>
  )
}

export default BlogPage
