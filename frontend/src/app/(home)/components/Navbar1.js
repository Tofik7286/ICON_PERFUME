'use client'
import React, { useEffect, useRef, useState } from 'react'
import styles from '@/app/(home)/styles/navbar1.module.css'
import Link from 'next/link'
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoMdHeartEmpty } from "react-icons/io";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { GoPerson } from "react-icons/go";

import Menu from './Menu';
import Cart from './Cart';
import { IoSearchOutline } from "react-icons/io5";
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchUser, selectUser } from '../redux/userSlice';
import { selectCart } from '../redux/cartSlice';
import { fetchWishList, selectWishList } from '../redux/wishListSlice';
import Search from './search';
import Image from 'next/image';
import { FiChevronDown } from "react-icons/fi";

// Import Swiper styles

// Import required modules
import { addToast } from '../redux/toastSlice';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MdOutlineLocalShipping } from 'react-icons/md';

const Navbar1 = ({categories}) => {

  const [menu, setMenu] = useState(false);
  const [cartSlider, setCartSlider] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, status, error } = useSelector(selectUser);
  const { cart } = useSelector(selectCart);
  const { wishList } = useSelector(selectWishList);
  const [searchPopup, setSearchPopup] = useState(false);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const promoRef = useRef(null);
  const [promo, setPromo] = useState([]);
  const [recommended,setRecommended] = useState([])

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUser());
    }
  }, [status, dispatch]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      dispatch(addToast({ message: `Coupon code "${code}" copied to clipboard!`, type: 'success' }));
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  const fetchRecommendedProducts = async()=>{
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/?recommended=true`);
      
      if (response.data.success) {
        const products = response.data.variants;
        setRecommended(products)
      }
    } catch (error) {

    }
   
  }
  useEffect(()=>{
    fetchRecommendedProducts()
  },[])
  

  const fetchPromo = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-promos/`);
      const json = response.data;

      if (json.success) {
        // Transform data for PromoCarousel
        const promotions = json.promotions.map((promo) => ({
          promo: `${promo.tag_line || ""} (Code: ${promo.coupon_code})`,
          coupon_code: promo.coupon_code, // Required for clipboard
          is_active: promo.is_active,
          end_date: promo.end_date,
        }));

        // Filter active promotions
        const activePromos = promotions.filter(
          (promo) => promo.is_active && new Date(promo.end_date) > new Date()
        );

        setPromo(activePromos);
      } else {

      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  useEffect(() => {
    dispatch(fetchWishList());
  }, [dispatch]);

  useEffect(() => {
    fetchPromo();
  }, [])

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 50); // Becomes sticky when scrolling down
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if(pathname === "/payment-process/"){
    return;
  }
  const buildCategoryTree = (categories) => {
    const tree = [];
    const lookup = {};

    if(!categories || !Array.isArray(categories) || categories.length === 0) return []

    categories.forEach(cat => {
      lookup[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent === null) {
        tree.push(lookup[cat.id]);
      } else {
        lookup[cat.parent]?.children.push(lookup[cat.id]);
      }
    });

    return tree;
  };

  const categoryTree = buildCategoryTree(categories);

  const slugify = (text) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

  return (
    <>
      <header className={`${styles.header}  ${isSticky ? styles.scrolled : ''}`} >
        {pathname === "/checkout/" || pathname === "/payment/" ? null : <div className={`${styles.promo} ${styles.promo2}`}>
          <p><MdOutlineLocalShipping /> Free Shipping on all orders Above &#8377;499/- </p>
        </div>}
        {pathname === "/checkout/" || pathname === "/payment/" ? null :
          promo && promo.length > 0 ? <div ref={promoRef} className={styles.promo}>
            <Swiper
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: true,
              }}
              slidesPerView={1}
              className={`${styles.swiper} w-100`}
              modules={[Navigation, Autoplay]}
              wrapperClass='align-items-center'
            >
              {promo && promo.length > 0 ? promo.map((item, index) => {
                return <SwiperSlide key={index} className='w-100 h-100 d-flex align-items-center justify-center'>
                  <p onClick={() => copyToClipboard(item.coupon_code)}>{item.promo}</p>
                </SwiperSlide>
              }) : null}
            </Swiper>

            <div className={`${styles.swiperButton} ${styles.prevButton}`} ref={prevRef}>
              &lt;
            </div>
            <div className={`${styles.swiperButton} ${styles.nextButton}`} ref={nextRef}>
              &gt;
            </div>
          </div> : null
        } 
        <nav className={`${styles.navbar} `}>
          <div className='relative h-full py-[10px] px-[2vw] bg-[var(--bg-color)] z-50 flex w-full justify-between items-center'>
            <div className="d-flex align-items-center" style={{ gap: "15px" }}>
              {pathname === "/checkout/" || pathname === "/payment/" ? null : <div className={styles.menu} onClick={() => { setMenu(true) }}>
                <HiOutlineMenuAlt2 />
                <span>Menu</span>
              </div>}
              <Link href="/" className={styles.logo} style={pathname === "/checkout/" || pathname === "/payment/" ? null : { top: "0px" }}>
                <Image src="/icon_images/logo.png"  className='img-fluid' alt="Icon perfumes Logo" width={80} height={60} />
              </Link>
              {pathname === "/checkout/" || pathname === "/payment/" ? null :
              <div className={`${styles.icon} md:hidden`} onClick={() => { setSearchPopup(true) }}>
                <IoSearchOutline />
              </div>}
            </div>
          
            {pathname === "/checkout/" || pathname === "/payment/" ? null :
              <ul className={`${styles.links}  ${menu ? styles.menu : ''}`}>
                <li onClick={() => setSearchPopup(false)}><Link href="/" className={pathname === "/" ? styles.active : ''}>Home</Link></li>
                <li onClick={() => setSearchPopup(false)}><Link href="/shop" className={pathname === "/shop/" ? styles.active : ''}>Shop</Link></li>
                {categoryTree.length > 0 && categoryTree.map(cat => (
                  <li onClick={() => setSearchPopup(false)} key={cat.id} className={styles.cat_dropdown}>
                    <div className={styles.dropdownTrigger}>
                      <Link href={`/${slugify(cat.name)}`} className={pathname === `/category/${cat.id}` ? styles.active : ''}>
                        {cat.name}
                      </Link>

                      {cat.children.length > 0 && (
                        <span className={styles.chevron}>
                          <FiChevronDown />
                        </span>
                      )}
                    </div>

                    {cat.children.length > 0 && (
                      <ul className={styles.submenu}>
                        {cat.children.map(sub => (
                          <li key={sub.id}>
                            <Link href={`/${slugify(cat.name)}/${slugify(sub.name)}`}>{sub.name}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
                <li onClick={() => setSearchPopup(false)}><Link href="/about" className={pathname === "/about/" ? styles.active : ''} >About Us</Link></li>
                <li onClick={() => setSearchPopup(false)}><Link href="/contact" className={pathname === "/contact/" ? styles.active : ''} >Contact</Link></li>
              </ul>}

            {pathname === "/checkout/" || pathname === "/payment/" ? null : <div className="d-flex align-items-center">
              <div className={`${styles.icon} hidden md:!flex`} onClick={() => { setSearchPopup(true) }}>
                <IoSearchOutline />
              </div>
              <Link onClick={() => setSearchPopup(false)} href={"/wishlist"} className={`${styles.icon} ${styles.wishlist} ${styles.badge}`} total={wishList ? wishList.length : "0"}>
                <IoMdHeartEmpty />
              </Link>
              <div  className={`${styles.icon} ${styles.bag} ${styles.badge}`} total={cart ? cart.length : "0"} onClick={() => { setCartSlider(true) }}>
                <HiOutlineShoppingBag />
              </div>
              <div className={styles.user}>
                <Link title={user ? "Profile" : "Login"} aria-label={user ? "Go to profile" : "Login to your account"} onClick={() => setSearchPopup(false)}  href={user ? "/profile" : "/login"} className={styles.icon}>
                  <GoPerson />
                </Link>
                {user && <Link onClick={() => setSearchPopup(false)} className={styles.profile} href={"/profile"}>
                {user.name && <h6>
                  {user.name.includes(' ') // Check if space exists
                    ? user.name
                        .split(' ')
                        .slice(0, 2)
                        .map(word => (word.length > 8 ? word.slice(0, 8) + '...' : word))
                        .join(' ')
                    : user.name.length > 8 // If no space, truncate the single word if necessary
                    ? user.name.slice(0, 8) + '...'
                    : user.name}</h6>}
                  <span>View Profile</span>
                </Link>}
              </div>
            </div>}
          </div>
        <Search recommend_products={recommended} searchPopup={searchPopup} toggleSearchPopup={setSearchPopup} />
        </nav>
      </header>
      <Menu categoryTree={categoryTree}  menu={menu} setMenu={setMenu} />
      <Cart recommend_products={recommended} open={cartSlider} close={setCartSlider} />
    </>
  )
}

export default Navbar1
