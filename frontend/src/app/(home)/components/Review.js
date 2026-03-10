import React, { useEffect, useState } from "react";
import styles from "../styles/review.module.css";
import axios from "axios";
import Cookies from "universal-cookie";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { openModal, registerModalCallback } from "../redux/modalSlice";
import Image from "next/image";
import { addToast } from "../redux/toastSlice";
import { AiFillStar } from "react-icons/ai";
import { AiOutlineStar } from "react-icons/ai";
import { useRouter } from 'next/navigation'

const formatDate = (dateStr) => {
  // Parse the input date string
  const dateObj = new Date(dateStr);
  const now = new Date();
  const timeDiff = now - dateObj;

  // If the difference is less than 30 days
  if (timeDiff <= 30 * 24 * 60 * 60 * 1000) {
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Format the output
    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} min ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 2) {
      return "1 day ago";
    } else {
      return `${days} days ago`;
    }
  } else {
    // If the date is more than 30 days ago, format as dd-mm-yy
    const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
    return dateObj.toLocaleDateString("en-GB", options);
  }
};

const renderStars = (rating) => {
  const fullStars = Math.floor(rating); // Number of full stars
  const hasHalfStar = rating % 1 !== 0; // Check if there's a half star

  return [
    ...Array(fullStars).fill(<FaStar />),
    hasHalfStar ? <FaStarHalfAlt /> : null,
    ...Array(5 - Math.ceil(rating)).fill(<FaRegStar />), // Fill remaining stars with empty stars
  ];
};

const Review = ({ reviews, variant,slug }) => {
  // const {reviews} = useSelector(state=>state.review)

  // const [review, setReview] = useState(reviews?.reviews);
  const [page,setPage] = useState(1)
  const ratingCounts = reviews?.ratings
  const dispatch = useDispatch();
  const router = useRouter();

 
  useEffect(()=>{
    if(page!=1){
      router.push(`?page=${page}`,{scroll:false})
    }
  },[page])
  
  const handleMoreReviews = async() => {
    setPage(prev=>prev+1)
  }
  const handleLessReviews =()=>{
    setPage(1)
  }
  
  const handleOpenForm = async () => {
    
      const modalPromise = new Promise((resolve) => {
        const callbackId = registerModalCallback(resolve);
        dispatch(openModal({
          component: 'ReviewForm',
          props: { id: variant.product.id },
          callbackId,
        }));
      })

      const modalResponse = await modalPromise
      if (modalResponse.success) {
        dispatch(addToast({ message: modalResponse.message, type: 'success' }))
        router.refresh()
      } else {
        dispatch(addToast({ message: modalResponse.message, type: 'success' }))
      }
  }

  return (
    <div className="padd-x">
      <div className={styles.container}>
        Total Reviews:{reviews?.total_reviews}
        {reviews?.reviews.length > 0 ?
          <div className={styles.give_review}>
            <button onClick={handleOpenForm}>Give review</button>
          </div>
          : <div className="d-flex align-items-center justify-content-center w-100 flex-column">
            <Image src="/images/no_review.png" className="img-fluid" height={300} width={300} alt="no_review.png" style={{opacity: 0.5}} />
            <h4 className="text-center">No Reviews Found On This Product</h4>
            <div className={styles.give_review}>
              <button onClick={handleOpenForm}>Give review</button>
            </div>
          </div>}

        <div className="row w-100">
          <div className="col-lg-8 col-12 order-lg-0 order-1 pe-0">
            <div className={styles.content}>
              {/* Reviews List */}
              <div className={styles.reviews}>
                {reviews?.reviews.length > 0 ? (
                  reviews?.reviews.map((ele) => (
                    <div key={ele.id} className={styles.review_card}>
                      <div className={styles.user_info}>
                        <div className={styles.profile_picture}>
                          {/* <img src="/images/product2.jpeg" alt="User" height={30} width={30}
                           style={{borderRadius:'90%'}} /> */}
                        </div>
                        <div className={styles.name_sec}>
                          <h6>{ele.user}</h6>
                          <span>{formatDate(ele.created_at)}</span>
                        </div>
                      </div>
                      <div className={styles.review_content}>
                        <div className={styles.rating}>
                          {Array.from({ length: ele.rating }, (_, index) => (
                            <FaStar key={index} color="gold" />
                          ))}
                          {Array.from({ length: 5 - ele.rating }, (_, index) => (
                            <FaRegStar key={index + ele.rating} color="gold" />
                          ))}
                        </div>
                        <p style={{ padding: "5px" }}>{ele.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  null
                )}
              </div>
             <div className={styles.see_more}>
              {
                  page < reviews?.total_pages &&
                <div className={styles.all_review}>
                  <a onClick={handleMoreReviews}>See More</a>
                </div>
              }
               {
                page>1 &&
               <div className={styles.all_review} >
                <a onClick={handleLessReviews}>See Less</a>
              </div>
               }

             </div>
            </div>
          </div>
          <div className="col-lg-4 col-12 mb-lg-0 mb-2 order-lg-1 order-0 pe-0">
            {/* Summary Section */}

            {reviews?.reviews.length > 0 ?
              <div className={styles.summary}>
                <h3>{reviews.average||0}</h3>
                <div className={styles.stars}>
                  {renderStars(reviews.average||0)}
                </div>
                <div className={styles.distribution}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star]; // Get count for each rating
                    const percentage = reviews?.total_reviews
                      ? (count / reviews?.total_reviews) * 100
                      : 0;

                    return (
                      <div key={star} className={styles.distribution_row}>
                        <span>{star} stars</span>
                        <div className={styles.progress}>
                          <div
                            style={{ width: `${percentage}%` }}
                            className={styles.progress_bar}
                          ></div>
                        </div>
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div> : null
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
