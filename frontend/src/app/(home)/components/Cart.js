"use client";

import React, { useEffect, useState } from "react";
import styles from "@/app/(home)/styles/cart.module.css";
import { IoCart, IoCloseOutline } from "react-icons/io5";
import Image from "next/image";
import { LuPlus, LuMinus } from "react-icons/lu";
import Link from "next/link";
import { cartDrawer, decreaseQty, fetchCart, increaseQty, removeFromCart, selectCart, setQty } from "../redux/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import { addToast } from "../redux/toastSlice";
import Cookies from "universal-cookie";
import { setCheckoutItems } from "../redux/checkoutSlice";
import { loader } from "../redux/loaderSlice";
import { useRouter } from "next/navigation";
import { openPopup } from "../redux/cookieSlice";
import { SlHandbag } from "react-icons/sl";
import {motion} from 'framer-motion'

const Cart = ({ open, close,recommend_products }) => {
  const cookies = new Cookies();
  const url = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [cartValid,setcartValid] = useState(true)

  const dispatch = useDispatch();
  const { status, error, openCart, cart, total } = useSelector(selectCart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleCheckout = () => {
    dispatch(setCheckoutItems());
    if (!cookies.get("is_logged_in")) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
    close(false);
    dispatch(cartDrawer(false));
  };

  useEffect(() => {
    const hasUnavailableItem = cart.some(
      item => item.variant?.available === false || Number(item.variant?.stock) < 1
    );
    setcartValid(!hasUnavailableItem); // Invert the result to set cartValid correctly
  }, [cart]);

  // Manage URL state for popup and back button behavior
  useEffect(() => {
    const handlePopState = () => {
      // Close the cart if the back button is pressed while it's open
      if (open || openCart) {
        close(false);
        dispatch(cartDrawer(false));
      }
    };

    // Open the cart: update history state with shallow routing (no page reload)
    if (open || openCart) {
      const currentState = window.history.state;
      if (!currentState || !currentState.cartOpen) {
        window.history.pushState({ ...currentState, cartOpen: true }, 'Cart Open', router.asPath);
      }
    }

    // Listen for back/forward navigation
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, openCart, close, dispatch, router]);

  
  const handleClosePopup = () => {
    close(false);
    dispatch(cartDrawer(false));
  };

  function getProductURL(product) {
    const mainCategory = product.category.find(cat => cat.level === 0);
    const subCategory = product.category.find(cat => cat.level === 1);

    if (subCategory) {
      // We're on subcategory page → include both
      return `/${mainCategory.name.toLowerCase().replace(/\s+/g, '-')}/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}/${product.slug}`;
    }

    // Otherwise just category/product-slug
    return `/${mainCategory.name.toLowerCase().replace(/\s+/g, '-')}/${product.slug}`;
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${open || openCart ? styles.active : ""}`}
        onClick={handleClosePopup}
      ></div>
      <div className={`${styles.cart} border-l-2 ${open || openCart ? styles.active : ""}`}>
       
        <div className={`relative w-full overflow-y-auto  border-[rgb(0,0,0,0.1)] bg-[var(--bg-color)] flex flex-col h-[85%]  z-50 ${styles.cart_main_container}`}>

        <div className={styles.head}>
          <h4 className="uppercase">Cart ({cart?.length})</h4>
          <div className={`${styles.icon}`}>
            <IoCloseOutline onClick={handleClosePopup} />
          </div>
        </div>

        <div className={styles.cart_list}>
        {cart && cart.length > 0 ? (
          cart.map((item, index) => (
            <div  className={styles.item} key={index}>
              <Link
                onClick={handleClosePopup}
                href={getProductURL(item.variant.product)}
                className={styles.image}
              >
                <Image
                  src={
                    item.variant.images?.[0]?.image
                      ? process.env.NEXT_PUBLIC_BACKEND_URL + item.variant.images[0].image
                      : "/images/not_found.png"
                  }
                  width={100}
                  height={100}
                  alt={item?.variant?.product?.title + "- Icon perfumes"}
                  className="img-fluid"
                />
              </Link>
              <div className={styles.item_content}>
                <Link
                  href={`/shop/${item.variant.product.slug}/${item.variant.encoded_sku}/${encodeURIComponent(
                    item.variant.product.description.slice(0, 50)
                  )}`}
                >
                  <h6>{item.variant.product.title}</h6>
                </Link>
              
                <div className="my-1 flex items-center gap-2 ">
                  <p className=" opacity-60">Price:</p>
                  <span className={Cart.price}>
                    &#8377; {(item.variant.discounted_price * item.quantity).toFixed(2)}
                  </span>
                </div>
                {
                  item.variant.available && item.variant.stock!=0?
                <div className="">
                  <div className="quantity">
                    <button
                      className={`svg ${item.quantity === 1 ? "disabled" : ""}`}
                      onClick={() => {
                        dispatch(decreaseQty(item.variant.id));
                      }}
                      disabled={item.quantity === 1}
                    >
                      <LuMinus />
                    </button>
                    <input type="number" minLength={0} value={item.quantity} readOnly />
                    <button
                      className="svg"
                      onClick={() => {
                        dispatch(increaseQty({ id: item.variant.id, quantity: 1 }));
                      }}
                          disabled={item.quantity === 10}
                    >
                      <LuPlus />
                    </button>
                  </div>
                      {item.variant.stock < 11 && <p className="!text-xs !text-red-500">Only {item.variant.stock} left</p> }
                </div>:
                <p className="text-red-500">Out of stock</p>
                }
              </div>
              <IoCloseOutline
                className={styles.delete}
                onClick={() => {
                  dispatch(removeFromCart(item.variant.id));
                }}
              />
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <div className="flex h-full flex-col gap-4 justify-center items-center">
                  <p>Your cart is currently empty.</p>
                    <Link onClick={handleClosePopup} className="w-full flex justify-center" href="/shop/?best_seller=true">
                     {/* <button className="shine-button">BEST SELLERS</button> */}
                  </Link>
                  <Link onClick={handleClosePopup} className="w-full flex justify-center" href="/shop/?new_arrival=true">
                      <button className="shine-button" >
                        NEW ARRIVALS
                      </button>    
                  </Link>
                  <button className="shine-button">
                    SALE
                  </button>
            </div>
          </div>
        )}
        </div> 
        
       
        </div>
        {
          (open || openCart) &&
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} transition={{ duration: 0.4, delay: 0.7 }} className={`${styles.cart_drawer}  ${open || openCart ? styles.draweractive : ""}`}>

            {/* old code  */}
            {/* <div className="flex flex-col gap-3 h-full">
              <h4 className="uppercase">We think you&apos;ll love...</h4>
              <div className={styles.recommend_products}>
                {
                    recommend_products.map((item,index) => {
                    return (
                      <div onClick={handleClosePopup} key={index} className={styles.rec_pro_items}>
                        <div className="w-40 ">
                          <Image src={
                            item?.images[0] &&
                            process.env.NEXT_PUBLIC_BACKEND_URL + item?.images[0]?.image
                          } width={300} height={300} alt={item.product?.title +  "Icon perfumes"} className="w-ful h-full object-cover" />
                        </div>
                        <div className="w-60">
                          <h6 className="line-clamp-2">{item.product.title}</h6>
                          <p className="mt-2 !text-[0.8em] "><span className="line-through opacity-60">&#8377; {item.price }</span> <span className="!text-red-500">&#8377; {item.discounted_price}</span></p>
                          <Link onClick={handleClosePopup} href={getProductURL(item.product)} className="flex  mt-2 gap-2 w-full  items-center border-b border-black pb-1">
                            <SlHandbag />
                            <p className="!font-[200] !text-[.8em]">View option</p>
                          </Link>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div> */}

            {/* new code  */}

            <div className="flex flex-col gap-3 h-full">
  <h4 className="uppercase">We think you&apos;ll love...</h4>

  <div className={styles.recommend_products}>
    {recommend_products?.map((item, index) => {
      const imageSrc = item?.images?.[0]?.image
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${item.images[0].image}`
        : "/images/no_product.svg"; // fallback image

      return (
        <div
          onClick={handleClosePopup}
          key={item?.id || index}
          className={styles.rec_pro_items}
        >
          {/* Image */}
          <div className="w-40">
            <Image
              src={imageSrc}
              width={300}
              height={300}
              alt={`${item?.product?.title || "Product"} Icon perfumes`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="w-60">
            <h6 className="line-clamp-2">
              {item?.product?.title || "Untitled Product"}
            </h6>

            <p className="mt-2 !text-[0.8em]">
              <span className="line-through opacity-60">
                &#8377; {item?.price ?? 0}
              </span>{" "}
              <span className="!text-red-500">
                &#8377; {item?.discounted_price ?? 0}
              </span>
            </p>

            <Link
              onClick={handleClosePopup}
              href={getProductURL(item?.product)}
              className="flex mt-2 gap-2 w-full items-center border-b border-black pb-1"
            >
              <SlHandbag />
              <p className="!font-[200] !text-[.8em]">View option</p>
            </Link>
          </div>
        </div>
      );
    })}
  </div>
</div>

          </motion.div>
        }
        {cart && cart.length > 0 ? (
          <div className={styles.bottom}>
            <div className={styles.total}>
              <h4 className="uppercase !text-lg">Subtotal</h4>
              <h4 style={{ fontWeight: "500" }}>&#8377; {total.toFixed(2)}</h4>
            </div>
            <button disabled={!cartValid} onClick={handleCheckout} className="shine-button disabled:!bg-[rgb(0,0,0,0.4)] disabled:cursor-not-allowed !w-full mt-2">
              Checkout
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Cart;
