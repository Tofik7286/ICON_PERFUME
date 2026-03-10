'use client'
import React, { useEffect, useState } from 'react';
import styles from '@/app/(home)/styles/Profile.module.css'
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { addToast } from '@/app/(home)/redux/toastSlice';
import { loader } from '../redux/loaderSlice';
import { closeModal } from '../redux/modalSlice';
import { addAddress } from '../redux/userSlice';
import { Country, State, City } from 'country-state-city';
import { useRouter } from 'next/navigation';
import Select from "react-select";
import { customStyles } from './CustomeSelectStyles';

export default function Address() {
  const cookies = new Cookies();

  const dispatch = useDispatch();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({});
  const router = useRouter()
  const india = Country.getAllCountries().find(
    (c) => c.name === "India"
  );
  const [selectedCountry, setSelectedCountry] = useState({
    label: india.name,
    value: india.isoCode,
  });
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

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

  const onSubmit = async (data) => {
    dispatch(addAddress(data))
    router.push('/profile/addresses')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} >
      <div className="row g-lg-3 g-2">
        <h3 className={`${styles.heading} mb-3`}><b>My Address</b></h3>

        {/* Address */}
        <div className="col-12">
          <div className="input-field">
            <label htmlFor="address">Address</label>
            <div className="input">
              <input
                type="text"
                placeholder="Enter address"
                {...register("address", { required: "Address is required" })}
              />
            </div>
            {errors.address && <p className={styles.error}>{errors.address.message}</p>}
          </div>
        </div>

        {/* Country */}
        <div className="col-6">
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
            </div>

            {errors.country && (
              <span className="text-red-500 text-xs">{errors.country.message}</span>
            )}
          </div>
        </div>

        {/* State */}
        <div className="col-6">
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

        {/* City */}
        <div className="col-6">
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

        {/* Pin-Code */}
        <div className="col-6">
          <div className="input-field">
            <label htmlFor="pincode">Pin-Code</label>
            <div className="input">
              <input
                type="text"
                placeholder="Enter Pin-code"
                {...register("pincode", { required: "Pin-Code is required" })}
              />
            </div>
            {errors.pincode && <p className={styles.error}>{errors.pincode.message}</p>}
          </div>
        </div>

      </div>

      <div className={styles.button_container}>
        <button type="button" onClick={() => { dispatch(closeModal()) }} className={styles.cancel_button}>Cancel</button>
        <button type="submit" className={styles.button}>Save Changes</button>
      </div>
    </form>
  );
}
