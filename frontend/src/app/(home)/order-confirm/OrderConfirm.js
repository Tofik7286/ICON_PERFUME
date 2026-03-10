"use client";
import React, { useEffect, useState } from "react";
import styles from "@/app/(home)/styles/orderConfirm.module.css"; // Make sure to create this CSS file
import Image from "next/image";
import { notFound, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loader } from "../redux/loaderSlice";
import Cookies from "universal-cookie";
import Link from "next/link";
import Recommend from "../components/Recommend";
import { useRouter } from "next/navigation";

const OrderConfirmationPage = ({ products,orderData }) => {
  const searchParam = useSearchParams();
  const [orderItems, setOrderItems] = useState(orderData.order_items);
  const [order, setOrder] = useState(orderData.order);
 

  const formatDate = (date) => {
    try {
      if (date) {
        return date.split("T")[0];
      } else {
        return;
      }
    } catch (e) {

    }
  };

  const category = [
    ...new Set(
      orderItems &&
        orderItems.map((item) =>
          item.variant.product.category.map((cat) => cat.name)
        )
    ),
  ];
  const flatCategory = category.flat();

  const related =
    products ?
    products.filter((item) =>
      item.product.category.some((cat) =>
        flatCategory.includes(cat.name)
      )
    ) : [];

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
      {order ? (
        <div className={`${styles.container} padd-x `}>
          <div className="!py-[2em] w-full">
            <div className="row g-2 w-100">
              <div className="col-lg-6 col-12 mb-lg-0 mb-4">
                {/* Left Side - Thank You Section */}
                <div className={styles.thank_you_container}>
                  <h1>
                    <b>Thank you for your purchase!</b>
                  </h1>
                  <div className={styles.billing_address}>
                    <h3>Billing address</h3>
                    <p>
                      <b>Name:</b> {order.name}
                    </p>
                    <p>
                      <b>Address:</b> {order.address}
                    </p>
                    <p>
                      <b>Phone:</b> {order.phone_number}
                    </p>
                    <p>
                      <b>Email:</b> {order.email}
                    </p>
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className={`block w-fit ${styles.button}`}
                    >
                      Track your order
                    </Link>
                  </div>
                  {/* <button className={styles.track_button}>Track Your Order</button> */}
                </div>
              </div>
              <div className="col-lg-6 col-12">
                {/* Right Side - Order Summary */}
                <div className={styles.summary_container}>
                  <h2>Order Summary</h2>
                  <div className={styles.order_details}>
                    <p className={styles.content_upper}>
                      <b>Date:</b>
                      <span>
                        {order.order_date && formatDate(order.order_date)}
                      </span>
                    </p>
                    <p className={styles.content_upper}>
                      <b>Order Number:</b> <span>{order.order_number}</span>
                    </p>
                    {/*<p className={styles.content_upper}>
                      <b>Payment Method:</b>
                      <span>Mastercard</span>
                    </p>*/}
                  </div>

                  {orderItems &&
                    orderItems.map((item, index) => {
                      return (
                        <Link
                          href={getProductURL(item?.variant?.product)}
                          key={index}
                          className={styles.items}
                        >
                          <div className={styles.item}>
                            <Image
                              src={item?.variant?.images[0]?.image?`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.variant.images[0].image}`:""}
                              alt="All In One Chocolate Combo"
                              className={styles.item_image}
                              width={200}
                              height={200}
                            />
                            <div>
                              <h5>{item.variant.product.title}</h5>
                              <p>
                                {item.variant.color
                                  ? `Color: ${item.variant.color.name} |`
                                  : null}
                                Qty: {item.quantity}
                              </p>
                              <p>
                                <b>
                                  &#8377; {" "}
                                  {(
                                    item.variant.discounted_price * item.quantity
                                  ).toFixed(2)}
                                </b>
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                  <div className={styles.total}>
                    {order.discount && order.discount !== "0.00" && (
                      <p className={styles.content_p}>
                        <b>Original Price:</b>{" "}
                        <span>
                          {" "}
                          &#8377; {" "}
                          {order.discount
                            ? order.final_price === "0.00"
                              ? order.discount
                              : parseFloat(
                                  parseFloat(order.sub_total) +
                                    parseFloat(order.gst)
                                ).toFixed(2)
                            : order.sub_total}
                        </span>
                      </p>
                    )}
                    {order.discount && order.discount !== "0.00" && (
                      <p className={styles.content_p}>
                        <b>Discount:</b> <span> &#8377; {order.discount}</span>
                      </p>
                    )}
                    <p className={styles.content_p}>
                      <b>Sub Total:</b> <span> &#8377; {order.sub_total}</span>
                    </p>
                    <p className={styles.content_p}>
                      <b>Shipping:</b>
                      <span> &#8377; {order.shipping_charges}</span>
                    </p>
                    {/* <p className={styles.content_p}>
                      <b>Tax:</b>
                      <span></span> &#8377; {order.gst}
                    </p> */}
                    <h3 className={styles.order_total}>
                      <b className={styles.total_text}>Order Total:</b>
                      <span className={styles.total_text}>
                        {" "}
                        &#8377; {order.final_price}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {related && related.length > 0 ? <Recommend data={related} /> : null}
    </>
  );
};

export default OrderConfirmationPage;
