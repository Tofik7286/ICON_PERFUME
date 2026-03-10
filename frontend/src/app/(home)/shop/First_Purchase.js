import Image from 'next/image'
import React from 'react'

function First_Purchase() {
  return (
    <div className='container-fluid !text-[var(--font)] padd-x'>
        <div className="my-5">
            <div className='bg-[var(--accent-color)] rounded'>
                <div className='row gx-3 gy-3'>
                    <div className='col-lg-8   flex flex-col justify-center'>
                        <div className=' p-[1em] lg:!pl-[5em] lg:w-[60%]'>
                            <div className='heading'>
                                <h2 className='!w-full'>Let Your Scent Journey Begin Today </h2>
                            </div>
                            <p>Experience the purity of handcrafted, alcohol-free attars made to inspire and elevate your everyday experience. Stay updated with our Exclusive Offers</p>
                                <div>
                                  <div className="relative  mt-10">
                                      <input
                                          type="email"
                                          placeholder="YOUR EMAIL"
                                          autoComplete="email"
                                          aria-label="Email address"
                                          className="block w-full rounded-full border border-neutral-300 bg-[var(--bg-color)] py-3 pl-4 pr-20 text-base/6 text-neutral-950 ring-4 ring-transparent transition placeholder:text-black focus:border-neutral-950 focus:outline-none focus:ring-neutral-950/5"
                                      />
                                      <div className="absolute inset-y-2 right-2 flex justify-end">
                                          <button
                                              type="submit"
                                              aria-label="Submit"
                                              className="flex h-fit !text-black border border-black px-3 py-2 items-center justify-center rounded-full transition hover:bg-neutral-800 hover:!text-white"
                                          >
                                             Subscribe
                                          </button>
                                      </div>
                                  </div>

                                </div>
                        </div>
                    </div>
                    <div className='col-lg-4'>
                          <Image src="/icon_images/first_purchase.png" width={1000} height={1000} className='img-fluid' alt='first_purchase'/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default First_Purchase
