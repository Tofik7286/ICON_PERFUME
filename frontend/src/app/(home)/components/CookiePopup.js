"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/cookie_popup.module.css";
import Cookies from "universal-cookie";
import { useDispatch, useSelector } from "react-redux";
import { acceptCookie, closePopup, rejectCookie } from "../redux/cookieSlice";
import Image from "next/image";

const cookie = new Cookies()

function CookiePopup() {
  const [cookieValue, setCookieValue] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  const { visible } = useSelector((state) => state.cookie)

  const handleAccept = () => {
    dispatch(acceptCookie());
    setCookieValue("accepted");
    dispatch(closePopup())
  };

  const handleReject = () => {
    dispatch(rejectCookie());
    setCookieValue("rejected");
    dispatch(closePopup())
  };

  useEffect(() => {
    // Ensure this only runs in the browser
    setIsClient(true);
    const value = cookie.get("cookie_consent");
    if(value === "accepted" ){
      dispatch(closePopup())
    }
    setCookieValue(value);
  }, []);

  if (!isClient || !visible) {
    return null;
  }

  return (
    <div className={styles.popup}>
      <div className={styles.background}>
        <div className={styles.background1}></div>
      </div>
      <div className={styles.cookie_box}>
        <div className={styles.title}>
          <div className={styles.img}>
            <Image
              src={"/images/cookie_image.png"}
              alt="Cookie Icon"
              width={50}
              height={50}
            />
          </div>
          <div className={styles.box_title}>Cookies</div>
        </div>
        <div className={styles.description}>
          We and our selected partners wish to use cookies to collect
          information about you for functional purposes and statistical
          marketing. You may not give us your consent for certain purposes by
          selecting an option, and you can withdraw your consent at any time
          via the cookie icon.
        </div>
        <div className={styles.buttons}>
          <div
            onClick={handleAccept}
            className={`${styles.cookie_button} ${styles.accept_button}`}
          >
            Accept All Cookies
          </div>
          <div
            onClick={handleReject}
            className={`${styles.cookie_button} ${styles.reject_button}`}
          >
            Reject All Cookies
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookiePopup;
