import React, { useEffect, useState } from 'react'
import styles from '../styles/reviewForm.module.css'
import { FaStar } from "react-icons/fa6";
import Cookies from 'universal-cookie';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/toastSlice';
import { closeModal, resolveModal } from '../redux/modalSlice';

const cookie = new Cookies()

function ReviewForm({id}) {
    
    const [reviewData,setReviewData] = useState({
        rating:0,
        comment:'',
    });
    const dispatch = useDispatch()
    const [hover,setHover] = useState()

    useEffect(()=>{
        handleClick(0)
        handleHover(0)
    },[])

    const handleSubmit = async (e)=>{
        e.preventDefault();
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/review/${id}/`,{
                method:'POST',
                credentials:"include",
                headers:{
                    'Content-type':'application/json'
                },
                body:JSON.stringify({rating: reviewData.rating, comment: reviewData.comment})
            })
            const json = await response.json()
            if(json.success){
                dispatch(resolveModal(json))
                dispatch(closeModal())
            }else{
                dispatch(addToast({message:json.message,type:'error'}))
            }
        } catch (error) {

            dispatch(addToast({ message: 'Something went wrong. Please try again.', type: 'error' }))
        }
    }
    const handleClick = (index) =>{
        setReviewData({...reviewData,rating:index+1})
    }
    const handleChange = (e)=>{
        setReviewData({...reviewData,comment:e.target.value})
    }
    const handleHover = (index)=>{
        setHover(index+1)
    }

  return (
    <div className={styles.review_form_box}>
            <div className={styles.review_title}>
                Write review
            </div>
        
                <form className={styles.review_box} onSubmit={handleSubmit}>
                <div className={styles.rating_star}>
                    {
                        [1,2,3,4,5].map((ele,i)=>{
                            return(
                                <div onMouseLeave={()=>setHover(reviewData.rating)} onMouseEnter={()=>handleHover(i)} key={ele}  onClick={()=>handleClick(i)} className={styles.review_items}>
                                <div style={i<reviewData.rating||i<hover?{color:'orange'}:{color:'rgb(0,0,0,0.3)'}}  className={styles.review_icon}>
                                   <FaStar/>
                                </div>
                            </div>
                            )
                   
                        })
                    }
                     
                </div>
                <div className={styles.review_text_box}>
                    <textarea onChange={(e)=>handleChange(e)} type="text" placeholder='Please Say Something about Your Expirence on this product' required/>
                </div>
                <div className={styles.review_submit}>
                    <button type='submit' className={styles.submit}>Submit</button>
                </div>
                </form>    
      
    </div>
  )
}

export default ReviewForm
