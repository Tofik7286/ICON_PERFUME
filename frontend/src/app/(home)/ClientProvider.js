// app/admin/ClientProviderWrapper.js
"use client";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import NextTopLoader from 'nextjs-toploader';

const ClientProvider = ({ children }) => {

    const [color, setColor] = useState("#fff");
    
      useEffect(() => {
        const handleScroll = () => {
          const scrollTop = window.scrollY;
          setColor(scrollTop > 50 ? "#000" : "#fff"); // Becomes sticky when scrolling down
        };
    
        window.addEventListener('scroll', handleScroll);  
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);
    

    return (
        <Provider store={store}>
        <NextTopLoader 
          zIndex={999999999} 
          color={color} 
          shadow={false}
          showSpinner={false}
          id="next-progress"
        />
            {children}
        </Provider>
    );
};

export default ClientProvider;
