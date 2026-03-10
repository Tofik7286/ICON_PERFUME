import React from 'react'
import styles from '@/app/(home)/styles/banner.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { useSelector } from 'react-redux'

const Banner = ({products}) => {

  // const { products } = useSelector((state) => state.products)

  const data = products && products.filter((item) => item.product.highlight === true)

  const capitalizeFirstWord = (title) => {
    // Split the title into words, take the first one, and capitalize it
    const words = title.split(' ');
    const firstWord = words[0];
    const capitalizedFirstWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    return capitalizedFirstWord;
  };

  const colors = data && data.map((item) => { return item.color.name })

  return (
    <>
      <div className={`container-fluid padd-x ${styles.banner}`} title={data[0] && capitalizeFirstWord(data[0].product.title)}>
        <div className={styles.banner_content}>
          {data[0] && <Link href={`/shop/${data[0].product.slug}/${data[0].encoded_sku}/${encodeURIComponent(data[0].product.description.slice(0, 50))}`} className={`${styles.item} ${styles.item1}`}>
            <div className={styles.item_content}>
              <div className="d-flex align-items-center">
                <button>{data[0].product.sub_category}</button>
              </div>
              <h5>{data[0] && data[0].product.title}</h5>
              <span>Style Meets Purpose in Every Detail.</span>
              <div className={styles.price}>GBP {data[0] && parseInt(data[0].discounted_price)} <span>/GBP {data[0] && parseInt(data[0].price)}</span></div>
            </div>
            <div className={styles.item_img}>
              <Image
                  src={
                    data[0]?.images?.[0]?.image
                      ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${data[0].images[0].image}`
                      : "/images/product2.webp"
                  }
                  alt={data[0]?.product?.title || "product"}
                  width={100}
                  height={200}
                />

            </div>
          </Link>}
          <div className={styles.banner_image}>
            <Image src={"/images/single_product.png"} className={`img-fluid`} alt='Featured product banner' width={1500} height={1500} />
          </div>
          {data[1] && <Link href={`/shop/${data[1].product.slug}/${data[1].encoded_sku}/${encodeURIComponent(data[1].product.description.slice(0, 50))}`} className={`${styles.item} ${styles.item2}`}>
            <div className={styles.item_content}>
              <div className="d-flex align-items-center">
                <button>{data[1].product.sub_category}</button>
              </div>
              <h5>{data[1] && data[1].product.title}</h5>
              <p><b>Dimensions:</b> 16.6 x 6 x 11.5</p>
              <p><b>Weight:</b> 1.60 kg</p>
              <p><b>Colors:</b> {colors.join(', ')}</p>
              <div className={styles.price}>GBP {data[1] && parseInt(data[1].discounted_price)} <span>/GBP {data[1] && parseInt(data[1].price)}</span></div>
            </div>
            <div className={styles.item_img}>
              <Image
                src={
                  data[1]?.images?.[1]?.image
                    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${data[1].images[1].image}`
                    : "/images/product2.webp"
                }
                alt={data[1]?.product?.title || "product"}
                width={100}
                height={200}/>

            </div>
          </Link>}
        </div>
      </div>
    </>
  )
}

export default Banner
