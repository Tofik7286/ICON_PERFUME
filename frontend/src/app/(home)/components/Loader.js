'use client'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectLoader } from '../redux/loaderSlice'

const Loader = () => {

    const open = useSelector((state) => state.loader.open);    

    if (open) {
        return (
            <div className="loader-container">
                <div className="loader-backdrop"></div>
                <div className="loader-circle">
                    <span className="loader"></span>
                </div>
            </div>
        )
    }
}

export default Loader
