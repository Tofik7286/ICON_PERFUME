  'use client'
  import React, { useEffect, useRef, useState } from 'react';
  import styles from '../styles/searchComponents.module.css';
  import { IoCloseOutline, IoSearchOutline } from 'react-icons/io5';
  import { useDispatch, useSelector } from 'react-redux';
  import Fuse from 'fuse.js';
  import Link from 'next/link';
  import { useRouter } from 'next/navigation';
  import Image from 'next/image';
  import { fetchProducts } from '../redux/productSlice';
import Product from './Product';
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios';
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  }
};

const Search = ({ searchPopup, toggleSearchPopup, recommend_products }) => {
   

    const [query, setQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    // const { products } = useSelector((state) => state.products)
    const [suggestions, setSuggestions] = useState([]);
    const router = useRouter()
    const searchRef = useRef(null);
    const dispatch = useDispatch();

    const allQueryStrings = Array.from(
      new Set(
        filteredProducts.flatMap(filteredProducts => [
          filteredProducts?.product?.title,
          filteredProducts?.product?.sub_category,
          filteredProducts?.color?.name,
        ].filter(Boolean)) // remove undefined/null
      )
    );

    const debounce = (func, delay) => {
      let timeoutId;
      return function (...args) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func.apply(this, args);
        }, delay);
      };
    };
    const getProducts = async (query) => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/?query=${query}`)
        if (response.data.success) {
          setFilteredProducts(response.data.variants)
        }
        else {
          setFilteredProducts([])
        }
      } catch (error) {
        setFilteredProducts([])
      }
    }
      const debouncedFetchProducts = debounce(getProducts, 300);

    useEffect(()=>{
      debouncedFetchProducts(query)
         
    },[query])

    const queryFuse = new Fuse(allQueryStrings, {
      includeScore: true,
      threshold: 0.3,
    });
    
    

    function getQuerySuggestions(query, limit = 5) {
      if (!query) return [];
      return queryFuse.search(query).slice(0, limit).map(res => res.item);
    }
    
    const handleSearch = (e) => {
      const value = e.target.value;
      setQuery(value);

      if (value) {
        // Generate guesses for the user query
        const suggestion = getQuerySuggestions(value)
        setSuggestions(suggestion)
      } else {
        setSuggestions([]);
      }
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      toggleSearchPopup(false)
      setQuery('')
      setFilteredProducts([]); // Reset if the query is empty
      setSuggestions([]);
      router.push(`/shop?q=${query}`)
    }

    const handleClose = () => {
      toggleSearchPopup(false)
      setQuery('')
      setFilteredProducts([]); // Reset if the query is empty
      setSuggestions([]);
    }

    useEffect(() => {
      if (searchPopup) {
        searchRef.current.focus();
      }
    }, [searchPopup])

    return (
      <>
          <AnimatePresence>
      {
        searchPopup &&
            <motion.div initial={{ y: -700 }} animate={{ y: 0 }} exit={{ y: -1000 }} transition={{duration:0.5,ease:"easeIn"}} className={`${styles.popup} ${searchPopup ? styles.active : ''}`}>
          <div className={styles. backdrop} onClick={() => toggleSearchPopup(false)}></div>
          <div className={styles.bg_white}>
            <div className={styles.popupContent}>
            
              <div className={styles.search_head}>
                <h6>Search our store</h6>
                <button className={styles.icon} onClick={() => toggleSearchPopup(false)}>
                  <IoCloseOutline />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.search}>
                <IoSearchOutline />
                <input
                  type="text"
                  placeholder="Find your Style"
                  value={query}
                  onChange={handleSearch}
                  name="search"
                  autoComplete="off"
                  ref={searchRef}
                />
                {/* {query !== '' && <IoCloseOutline onClick={() => setQuery('')} />} */}
                <IoCloseOutline onClick={() => toggleSearchPopup(false)} />
              </form>
              {query!="" && filteredProducts.length>0 ? 
                <div className={styles.suggestions}>
                  <div className="row">
                    <div className="col-md-3 col-12 d-flex align-items-start flex-col p-0">
                      {
                        query === ""?
                        <div className={styles.suggests}>
                          <div className={styles.heading_suggest}>
                              <h4 className='uppercase !text-lg !font-[500] text-left'>Featured Collections</h4>
                          </div>
                          {/* {suggestions.length > 0 && (
                            <ul className={styles.suggestionsList}>
                              {suggestions.map((suggestion, index) => (
                                <li key={index} className={styles.suggestionItem}>
                                  <Link onClick={() => handleClose()} href={`/shop?q=${suggestion}`}>{suggestion}</Link>
                                </li>
                              ))}
                            </ul>
                          )} */}
                        
                          <div className={styles.suggest_collection}>
                                    <p className='!text-left cursor-pointer hover:underline' onClick={() => {
                                      router.push(`/shop?new_arrival=true`);
                                      toggleSearchPopup(false);
                                    }}>New Arrivals</p>
                                    <p className='!text-left cursor-pointer hover:underline' onClick={() => {
                                      router.push(`/shop?is_perfume=true`);
                                      toggleSearchPopup(false);
                                    }}>Perfume Collection</p>
                                    <p className='!text-left cursor-pointer hover:underline' onClick={() => {
                                      router.push(`/shop?best_seller=true`);
                                      toggleSearchPopup(false);
                                    }}>Best Seller</p>
                          </div>
                        </div>:
                          <div className={styles.suggests}>
                            <div className={styles.heading_suggest}>
                              <h4 className='uppercase !text-lg !font-[500] text-left'>Suggestions</h4>
                            </div>
                            {/* {suggestions.length > 0 && (
                            <ul className={styles.suggestionsList}>
                              {suggestions.map((suggestion, index) => (
                                <li key={index} className={styles.suggestionItem}>
                                  <Link onClick={() => handleClose()} href={`/shop?q=${suggestion}`}>{suggestion}</Link>
                                </li>
                              ))}
                            </ul>
                          )} */}

                            <div className={styles.suggest_collection}>
                              {suggestions.map((suggestion, i) => (
                                <p className='cursor-pointer hover:underline' key={i} onClick={() => {
                                  setQuery(suggestion);
                                  router.push(`/shop?q=${suggestion}`);
                                  toggleSearchPopup(false);
                                }}>
                                  {suggestion}
                                </p>
                              ))}
                            </div>
                          </div>

                      }
                    </div>
                    <div className="col-md-9 col-12 p-0">
                      <div className={styles.suggestsList}>
                      <div className={styles.heading_suggest}>
                        <h4 className='uppercase !text-lg !font-[500] text-left'>Best Seller</h4>
                          <p onClick={() => {
                            router.push(`/shop?q=${query}`);
                            toggleSearchPopup(false);
                          }} className='!font-[300] !text-sm underline cursor-pointer '>View Collections</p>
                      </div>
                        <div className='row gx-3 mt-2 gy-3'>
                            {filteredProducts.slice(0, 4).map((product, index) => {
                              // return <Link onClick={() => handleClose()} href={`/shop/${product.item.product.slug}/${product.item.encoded_sku}/${encodeURIComponent(product.item.product.description.slice(0, 50))}`} key={index} className={styles.suggestionItem}>
                              //   <Image
                              //     src={
                              //       product?.item?.images?.[0]?.image
                              //         ? process.env.NEXT_PUBLIC_BACKEND_URL + product.item.images[0].image
                              //         : '/images/not_found.png'
                              //     }
                              //     alt={product?.item?.product?.title || 'Product not found'}
                              //     className={styles.productImage}
                              //     width={100}
                              //     height={100}
                              //   />
                              //   <div className={styles.productDetails}>
                              //     <h4>{product.item.product.title}</h4>
                              //     <p>£{product.item.discounted_price}</p>
                              //   </div>
                              // </Link>
                              return (
                                <motion.div
                                  key={product.id}
                                  onClick={() => toggleSearchPopup(false)}
                                  initial="hidden"
                                  animate="visible"
                                  variants={fadeUp}
                                  transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                                  viewport={{ once: false, amount: 0.3 }}
                                  className="col-lg-3 col-6"
                                >
                                  <Product    data={product} />
                                </motion.div>
                              )
                            })}

                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className={styles.sugguestFooter}>
                    <Link onClick={() => handleClose()} href={`/shop?q=${query}`}>Results For &quot;<span>{query}</span>&quot;</Link>
                  </div> */}
                </div> :
                query===""?
                  <div className={styles.suggestions}>
                    <div className="row">
                      <div className="col-md-3 col-12 d-flex align-items-start flex-col p-0">
                        <div className={styles.suggests}>
                          <div className={styles.heading_suggest}>
                            <h4 className='uppercase !text-lg !font-[500] text-left'>Featured Collections</h4>
                          </div>
                          {/* {suggestions.length > 0 && (
                          <ul className={styles.suggestionsList}>
                            {suggestions.map((suggestion, index) => (
                              <li key={index} className={styles.suggestionItem}>
                                <Link onClick={() => handleClose()} href={`/shop?q=${suggestion}`}>{suggestion}</Link>
                              </li>
                            ))}
                          </ul>
                        )} */}
                                <div className={styles.suggest_collection}>
                                  <p className='!text-left cursor-pointer hover:underline' onClick={() => {
                                    router.push(`/shop?new_arrival=true`);
                                    toggleSearchPopup(false);
                                  }}>New Arrivals</p>
                                  <p className='!text-left cursor-pointer hover:underline' onClick={() => {
                                    router.push(`/shop?is_perfume=true`);
                                    toggleSearchPopup(false);
                                  }}>Perfume Collection</p>
                                  <p className='!text-left cursor-pointer hover:underline' onClick={() => {
                                    router.push(`/shop?best_seller=true`);
                                    toggleSearchPopup(false);
                                  }}>Best Seller</p>
                                </div>
                        </div>
                      </div>
                      <div className="col-md-9 col-12 p-0">
                        <div className={styles.suggestsList}>
                          <div className={styles.heading_suggest}>
                            <h4 className='uppercase !text-lg !font-[500] text-left'>Best Seller</h4>
                          </div>
                          <div className='row gx-3 mt-2 gy-3'>
                                  {recommend_products.map((product, index) => {
                              // return <Link onClick={() => handleClose()} href={`/shop/${product.item.product.slug}/${product.item.encoded_sku}/${encodeURIComponent(product.item.product.description.slice(0, 50))}`} key={index} className={styles.suggestionItem}>
                              //   <Image
                              //     src={
                              //       product?.item?.images?.[0]?.image
                              //         ? process.env.NEXT_PUBLIC_BACKEND_URL + product.item.images[0].image
                              //         : '/images/not_found.png'
                              //     }
                              //     alt={product?.item?.product?.title || 'Product not found'}
                              //     className={styles.productImage}
                              //     width={100}
                              //     height={100}
                              //   />
                              //   <div className={styles.productDetails}>
                              //     <h4>{product.item.product.title}</h4>
                              //     <p>£{product.item.discounted_price}</p>
                              //   </div>
                              // </Link>
                              return (
                                <motion.div
                                  key={product.id}
                                  onClick={() => toggleSearchPopup(false)}
                                  initial="hidden"
                                  animate="visible"
                                  variants={fadeUp}
                                  transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                                  viewport={{ once: false, amount: 0.3 }}
                                  className="col-lg-3 col-6"
                                >
                                  <Product  data={product} />
                                </motion.div>
                              )
                            })}

                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <div className={styles.sugguestFooter}>
                    <Link onClick={() => handleClose()} href={`/shop?q=${query}`}>Results For &quot;<span>{query}</span>&quot;</Link>
                  </div> */}
                  </div> 
                :
                <div className='border-b-4 border-[rgb(0,0,0,0.1)] flex p-5 justify-center items-center'>
                  <p className='!font-[300] !text-sm'>No results found. Please try again with a different query.</p>
                </div>
              }
            </div>
          </div>

        </motion.div>
      }
      </AnimatePresence>
      </>
    );
  };

  export default Search;
