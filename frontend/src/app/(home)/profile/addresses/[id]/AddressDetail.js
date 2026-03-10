'use client'
import React, { useEffect, useState } from 'react';
import styles from '@/app/(home)/styles/Profile.module.css'
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { addToast } from '@/app/(home)/redux/toastSlice';
import { loader } from '@/app/(home)/redux/loaderSlice';
import { useRouter } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import Select from "react-select";
import { customStyles } from '@/app/(home)/components/CustomeSelectStyles';

export default function AddressDetail({ address,id }) {
    
    const url = process.env.NEXT_PUBLIC_API_URL
    const cookies = new Cookies();

    // const [data, setData] = useState([])
    const dispatch = useDispatch();
    const router = useRouter();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues:{
            address:address.address||"",
            pincode:address.pincode||"",
        }
    });

    const india = Country.getAllCountries().find(
        (c) => c.name === "India"
    );
    const [selectedCountry, setSelectedCountry] = useState({
        label: india.name,
        value: india.isoCode,
    });
    const [selectedState, setSelectedState] = useState({ label: address.state });
    const [selectedCity, setSelectedCity] = useState({ label: address.city });

    const countryOptions = Country.getAllCountries().map((country) => ({
        value: country.isoCode,
        label: country.name,
    }));
    const stateOptions = selectedCountry
        ? State.getStatesOfCountry(selectedCountry.value).map((state) => ({
            value: state.isoCode,
            label: state.name,
        }))
        : [];

    const cityOptions = selectedCountry && selectedState
        ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map((city) => ({
            value: city.name,
            label: city.name,
        }))
        : [];
    
    useEffect(() => {
        setValue("country", selectedCountry?.label || "");
        setValue("state", selectedState?.label || "");
        setValue("city", selectedCity?.label || "");
    }, [selectedCountry, selectedState, selectedCity]);
    // const getAddress = async () => {
    //     try {
    //         const response = await axios.get(`${url}/addresses/?address_id=${id}`,{
    //             withCredentials:true
    //         })
    //         const { address } = response.data;

    //         // setData(json.address)
    //         if (!address) {
    //             router.push('/profile/addresses/')
    //         }
    //         setValue('address', address.address);
    //         setValue('city', address.city);
    //         setValue('state', address.state);
    //         setValue('pincode', address.pincode);
    //         setValue('country', address.country);
    //     } catch (error) {
    //         console.error("Error fetching address", error)
    //     }

    // }

    const onSubmit = async (data) => {
        try {
            dispatch(loader(true))

            const response = await fetch(`${url}/addresses/?address_id=${id}`, {
                method: 'PUT',
                credentials:"include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            const json = await response.json();
            if (json.success) {
                dispatch(addToast({ message: json.message, type: 'success' }));
            }
        } catch (error) {
            console.error("Error updating address", error)
        } finally {
            dispatch(loader(false))
        }
    }

    const deleteAddress = async (id) => {

        try {
            dispatch(loader(true))
            const response = await axios.delete(`${url}/addresses/?address_id=${id}`,{
                withCredentials:true
            })
            const json = response.data;

            if (json.success) {
                dispatch(addToast({ message: json.message, type: 'success' }))
                router.push('/profile/addresses/')
            } else {

            }
        } catch (error) {
            dispatch(addToast({ message: error.message, type: 'error' }))
        } finally {
            dispatch(loader(false))
        }
    }

    // useEffect(() => {
    //     getAddress();
    // }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form_container}>
            <div className="row mb-3">
                <h4 className={`${styles.heading} !font-[500] `}>My Address</h4>

                {/* Address */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="address">Address</label>
                        <div className="input">
                            <input
                                type="text"
                                placeholder="Enter address"
                                {...register("address", { required: "Address is required" })}
                            />
                            {errors.address && <p className={styles.error}>{errors.address.message}</p>}
                        </div>
                    </div>
                </div>

                {/* City */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="city">City</label>
                        <div className="w-full">
                            <Select
                                id="city"
                                options={cityOptions}
                                value={selectedCity}
                                onChange={(val) => setSelectedCity(val)}
                                classNamePrefix="react-select"
                                placeholder="Select City"
                                styles={customStyles}
                                isDisabled={!selectedState}
                            />
                        </div>
                        {errors.city && <p className={styles.error}>{errors.city.message}</p>}
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                {/* State */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="state">State</label>
                        <div className="w-full">
                            <Select
                                id="state"
                                options={stateOptions}
                                value={selectedState}
                                onChange={(val) => {
                                    setSelectedState(val);
                                    setSelectedCity(null);
                                }}
                                styles={customStyles}
                                classNamePrefix="react-select"
                                placeholder="Select State"
                                isDisabled={!selectedCountry}
                            />
                        </div>
                        {errors.state && <p className={styles.error}>{errors.state.message}</p>}
                    </div>
                </div>

                {/* Pin-Code */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="pincode">Pin-Code</label>
                        <div className="input">
                            <input
                                type="text"
                                placeholder="Enter Pin-code"
                                {...register("pincode", { required: "Pin-Code is required" })}
                            />
                            {errors.pincode && <p className={styles.error}>{errors.pincode.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                {/* Country */}
                <div className="col-md-6">
                    <div className="input-field">
                        <label htmlFor="country">Country</label>
                        <div className="w-full">
                            <Select
                                id="country"
                                options={countryOptions}
                                value={selectedCountry}
                                onChange={(val) => {
                                    setSelectedCountry(val);
                                    setSelectedState(null);
                                    setSelectedCity(null);
                                }}
                                isDisabled
                                styles={customStyles}
                                classNamePrefix="react-select"
                                placeholder="Select Country"
                            />
                            {errors.country && (
                                <span className="text-red-500 text-xs">{errors.country.message}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.button_container}>
                <button type="button" className={styles.cancel_button} onClick={() => { deleteAddress(id) }}>Delete</button>
                <button type="button" className={styles.cancel_button}>Cancel</button>
                <button type="submit" className={`${styles.button} shine-button`}>Save Changes</button>
            </div>
        </form>
    );
}
