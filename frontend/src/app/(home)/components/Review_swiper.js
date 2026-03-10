"use client";
import React from "react";
import styles from "../styles/content_pages.module.css";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { BiRightArrow } from "react-icons/bi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { BsArrowLeftShort } from "react-icons/bs";
import { BsArrowRightShort } from "react-icons/bs";

function Review_swiper() {
  return (
    <div className={styles.review_swiper}>
      <div className="padd-x">
        <div className="sm:flex heading  justify-between">
          <h2>
            <span>Reviews</span>
          </h2>
          <div className="flex mt-3 sm:mt-0">
            <button
              className="custom-prev arrow   
        disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <BsArrowLeftShort />
            </button>
            <button
              className="custom-next  arrow
        disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <BsArrowRightShort />
            </button>
          </div>
        </div>
        <div className="mt-3 mb-5">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={3}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            autoplay={true}
            breakpoints={{
              300: { slidesPerView: 1, spaceBetween: 10 }, // Small screens
              900: { slidesPerView: 2, spaceBetween: 15 }, // Tablets
              1024: { slidesPerView: 3, spaceBetween: 20 }, // Desktops
              1280: { slidesPerView: 3, spaceBetween: 25 }, // Large screens
            }}
            pagination={false} // Disable dots
          >
            {[...Array(5)].map((slide, i) => {
              return (
                <SwiperSlide key={i}>
                  <div className={styles.slider_item}>
                    <div className="flex flex-col gap-3 p-4 items-center text-center">
                      <div className="rounded-full overflow-hidden">
                        <Image
                          src="/images/review_user.png"
                          width={80}
                          height={80}
                          alt="Customer review avatar"
                        />
                      </div>
                      <div className={styles.star}>
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                      </div>
                      <p className="line-clamp-3">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Ipsam, nam reprehenderit corrupti exercitationem iusto
                        vero quos maxime quaerat atque. Minus fuga impedit
                        expedita pariatur labore, sequi nisi doloremque nemo
                        minima qui eligendi quos similique saepe?
                      </p>
                      <div className="flex flex-col gap-2">
                        <h5 className="font-bold">Soifya Lareson</h5>
                        <p>COD of cormpx</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default Review_swiper;
