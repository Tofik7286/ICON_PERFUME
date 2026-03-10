'use client';
import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/(home)/styles/welcome.module.css";
import Image from "next/image";
import Link from "next/link";
import { TiSocialFacebook } from "react-icons/ti";
import { AiOutlineInstagram } from "react-icons/ai";
import { RiTwitterXFill } from "react-icons/ri";
import { GrLinkedinOption } from "react-icons/gr";
import { IoCloseOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, selectUser } from "../redux/userSlice";

const Welcome = () => {
  const [open, setOpen] = useState(false);
  const { user, status, error } = useSelector(selectUser);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        if (!user) {
          const is_intro = sessionStorage.getItem("welcome_intro"); // No second argument
          if (is_intro === null) {
            setOpen(true);
            sessionStorage.setItem("welcome_intro", "true"); // Store as a string
          }
        }
      }, 5000);
    }
  }, [user]);

  const containerRef = useRef(null);

  // Function to handle clicks outside
  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setOpen(false); // Close the container
      sessionStorage.setItem("welcome_intro", false);
    }
  };

  // Attach event listener on mount, remove on unmount
  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!open) {
    return;
  }

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("welcome_intro", false);
  };

  return (
    <div className={`${styles.fixed_content} ${open ? styles.active : ""}`}>
      <div ref={containerRef} className={`${styles.container}`}>
        <div className={`${styles.close}`} onClick={handleClose}>
          <IoCloseOutline />
        </div>
        <div className="row align-items-center g-3">
          <div className="col-md-6 col-12">
            <div className={styles.image}>
              <Image
                width={1000}
                height={1000}
                src={"/images/welcome.webp"}
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-md-6 col-12">
            <div className={styles.content}>
              <h2>
                Welcome to hidelifestyle to celebrate, we&apos;re offering free
                delivery on all orders.
              </h2>
              <p>
                Be among the first to discover our new product, get personalized
                advice and take advantage of our exclusive offers.
              </p>
              <Link href={"/sign-up/"} className={styles.button}>
                <span>Sign up</span>
              </Link>
              <div className={styles.social}>
                <Link href={""} className={styles.icon}>
                  <TiSocialFacebook />
                </Link>
                <Link href={""} className={styles.icon}>
                  <AiOutlineInstagram />
                </Link>
                <Link href={""} className={styles.icon}>
                  <RiTwitterXFill />
                </Link>
                <Link href={""} className={styles.icon}>
                  <GrLinkedinOption />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
