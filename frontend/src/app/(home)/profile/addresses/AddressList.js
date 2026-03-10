"use client";
import React, { useEffect, useState } from 'react';
import styles from '@/app/(home)/styles/Profile.module.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../../redux/modalSlice';
import { loader } from '../../redux/loaderSlice';
import { addToast } from '../../redux/toastSlice';
import { fetchAddresses } from '../../redux/userSlice';
import Image from 'next/image';

const AddressList = ({addresses}) => {
    const router = useRouter();
    // const [data, setData] = useState([])
    const dispatch = useDispatch()

    // const getAllAddresses = async () => {
    //     try {
    //         dispatch(loader(true))

    //         const response = await axios.get(`${url}/getAllAddresses/?token=${token}`)
    //         const json = response.data
    //         if (json.success) {
    //             setData(json.address)
    //         }
    //     } catch (error) {
    //         dispatch(addToast({ message: "Internal Server Error", type: 'error' }))
    //     } finally {
    //         dispatch(loader(false))
    //     }
    // }

    const handleAddressClick = (id) => {
        router.push(`/profile/addresses/${id}`)
    }

    const addAddress = async () => {
        dispatch(openModal({
            component: 'Address',
        }))
    }

    

    return (
        <div className={styles.orders_container}>
            <h4 className={`${styles.heading} !font-[500] `}>My Addresses</h4>

            <div className="d-flex align-items-center justify-content-end mb-2">
                <button type="button" className={`${styles.button} shine-button`} onClick={addAddress}>Add Address</button>
            </div>
            {addresses && addresses.length > 0 ? (
                [...addresses].reverse().map((item, index) => (
                    <div
                        key={index}
                        className={`${styles.order_card} w-100`}
                        onClick={() => handleAddressClick(item.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={`${styles.order_details} w-100`}>
                            <p>
                                <b>Address:</b> {item.address}
                            </p>
                            <div className="d-flex align-items-center justify-content-between flex-wrap w-100">
                                <p>
                                    <b>City:</b> {item.city}
                                </p>
                                <p>
                                    <b>State:</b> {item.state}
                                </p>
                                <p>
                                    <b>Pin Code:</b> {item.pincode}
                                </p>
                                <p>
                                    <b>Country:</b> {item.country}
                                </p>
                            </div>
                        </div>
                    </div>

                ))) : (
                <div className='d-flex align-items-center justify-center w-100 flex-col '>
                    <Image src={"/images/no_address.png"} className="mb-4" style={{opacity: ".5"}} width={100} height={100} alt="No saved addresses" />
                    <h3 style={{fontSize: "1.7em", fontWeight: "500"}}>No Address Found</h3>
                </div>
            )}
            {/* <div className={styles.button_container}>
           <button type="button" className={styles.cancel_button} onClick={()=>{deleteAddress(item.id)}}>Delete</button>
        </div> */}
        </div>
    );
};

export default AddressList;
