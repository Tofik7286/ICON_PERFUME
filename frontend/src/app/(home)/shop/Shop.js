'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Product from '../components/Product'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { loader } from '../redux/loaderSlice';
import PageHeader from '../components/PageHeader';
import { ChevronDown } from "lucide-react"
import { fetchCategories, fetchProducts } from '../redux/productSlice';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import styles from '@/app/(home)/styles/shop.module.css'
import Filter from '../components/Filter';
import { IoCloseOutline } from "react-icons/io5";
import Fuse from 'fuse.js';
import Breadcrumb from '../components/BreadCrumb';
import ShopHero from './ShopHero';
import First_Purchase from './First_Purchase';
import Image from 'next/image';
import {motion} from 'framer-motion'
import PaginationData from '../components/PaginationData';

const Shop = ({ products, categories, category_name, totalPages }) => {
      
    // const { products, categories, status, error, loading } = useSelector((state) => state.products);

    const [sortOption, setSortOption] = useState("Relevance"); // Default sort option
    const [openFilter, setOpenFilter] = useState(false);

    const searchParams = useSearchParams();
    const [data, setData] = useState(products);
    const dispatch = useDispatch()
    const [filters, setFilters] = useState([]);
    const router = useRouter();
    const pathname = usePathname()
    const hasMounted = useRef(false);

    // const category = searchParams.get('category');
    const price = searchParams.get('price')
    const priceParams = decodeURIComponent(price).split(',');
    const minPrice = priceParams.find(param => param.startsWith('minPrice'))?.split('=')[1] || 0;
    const maxPrice = priceParams.find(param => param.startsWith('maxPrice'))?.split('=')[1] || 100;
    const colors = searchParams.get('colors');
    const availability = searchParams.get('availability');
    const sortBy = searchParams.get('sort_by')
    const searchQuery = searchParams.get('q')
    

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
        }
    }

    const maxLength = 200
    const [filter_item, setFilter_item] = useState({
        // category: category ? category.split(',') : [],
        price: {
            min: minPrice ? Math.max(Number(minPrice), 0) : 0,
            max: maxPrice ? Math.min(Number(maxPrice), maxLength) : maxLength,
        },
        colors: colors ? colors.split(',') : [],
        availability: availability ? availability.split(',') : []
    });
    const fuse = new Fuse(products, {
        keys: [
            { name: 'product.title', weight: 0.7 }, // Higher weight for title
            { name: 'product.description', weight: 0.3 },
            { name: 'product.sub_category', weight: 0.2 },
            { name: 'color.name', weight: 0.7 }, // Focus on variant colors
        ],
        threshold: 0.4, // Slightly higher for broader matching
        includeScore: true, // Include score to assess result relevance
    });

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchCategories())
    }, [dispatch]);

    useEffect(()=>{
        setData(products)
    },[products])
    useEffect(() => {
        let newFilters = [];

      
        // If a category is selected, filter based on category
        // if (category) {
        //     const categories = category.split(',');
        //     newFilters = categories.map(cat => ({
        //         name: 'category',
        //         value: cat
        //     }));
        //     // Filter products based on sub_category matching any category in the array
        //     filteredProducts = filteredProducts.filter((item) =>
        //         categories.some(category => 
        //             item.product.category.map(cat => cat.name).includes(category)
        //         )                
        //     );
        // }

        // If minPrice or maxPrice is set, filter products based on price range
        if (price) {
            if (minPrice || maxPrice) {
                // Add price range to the filters array
                newFilters = [...newFilters, { name: 'price', value: `Price: ${minPrice || 0} - ${maxPrice}` }];
              
            }
        }

        if (colors) {
            const colorItems = colors.split(',');
            newFilters = [
                ...newFilters,
                ...colorItems.map((color) => {
                    return {
                        name: 'colors',
                        value: color
                    }
                })
            ];
            // Filter products based on sub_category matching any category in the array
           
        }

        if (availability) {
            const availableItems = availability.split(',');
            newFilters = [
                ...newFilters,
                ...availableItems.map((item) => {
                    return {
                        name: 'availability',
                        value: item
                    }
                })
            ];
           
            // Filter products based on sub_category matching any category in the array
        }

     

        // Set the filtered data based on both category and price filters
        // Update the filters state
        setFilters(newFilters);

        // Reset filters if no category and no price range are selected
        if (! !minPrice && !maxPrice && !colors && !availability && !sortBy && !searchQuery) {
            setFilters([]);
            setData(products);
        }
    }, [ minPrice, maxPrice, products, colors, availability, sortBy, searchQuery]);

    const createQueryString = useCallback(
        (name, values) => {
            const params = new URLSearchParams(searchParams.toString());
            // If no values or an empty array is passed, remove the query parameter
            if (!values || values.length === 0) {
                params.delete(name);
            } else {
                // Handle dynamic query names (like 'price', which can include multiple sub-parameters)
                if (name === 'price') {
                    params.delete(name)
                } else {
                    // For other filters, join values with commas and set the query param
                    params.set(name, values.join(','));
                }
            }

            return params.toString();
        },
        [searchParams]
    );
    
    // Handle deleting a filter
    const handleRemoveFilter = (name, value) => {
        setFilter_item((prev) => {
            let updatedFilter;
            let updatedQueryString;
            // Handle price removal (min or max)
            if (name === 'price') {
                const newPrice = { ...prev.price };
                // Reset minPrice or maxPrice depending on which filter is being removed
                if (value === 'min') {
                    newPrice.min = 0; // Reset min price
                } else if (value === 'max') {
                    newPrice.max = 100; // Reset max price
                }
                // TODO: There is issue in this realtime stating the price filter to inital values
                updatedFilter = {
                    ...prev,
                    price: newPrice
                };
                updatedQueryString = createQueryString(name, updatedFilter.price);
            } else {
                updatedFilter = {
                    ...prev,
                    [name]: prev[name].filter((item) => item !== value), // Remove the value from the list
                };
                updatedQueryString = createQueryString(name, updatedFilter[name]);
            }
            if (searchParams.toString() === '') return updatedFilter
            // Navigate to the new URL
            const newUrl = pathname + '?' + updatedQueryString
            router.replace(newUrl);
            router.refresh(); 

            return updatedFilter;
        });

        // Remove the filter from the filters array
        setFilters((prevFilters) => {
            return prevFilters.filter(
                (filter) => filter.name !== name || filter.value !== value // Remove the filter from the array
            );
        });
    };

    const handleSortChange = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort_by', value)
        setSortOption(value)
        const newUrl = pathname + '?' + params.toString()
        router.replace(newUrl);
        router.refresh(); 
    };
    
    
    return (
        <>
           {/* <ShopHero/> */}
            <div className={`container-fluid padd-x ${styles.shop}`}>
               
                <div className='!py-[2em]'>
                    <div className='mb-2 w-full'>
                        <h1 className='text-center capitalize'>{pathname.replaceAll("/", " ").trim().split(" ")[0]?.replaceAll("-"," ")}</h1>
                        {
                            category_name &&
                            <h5 className=' !text-xl capitalize text-center mt-1'>
                                    {pathname.replaceAll("/", " ").trim().split(" ")[1]?.replaceAll("-"," ")}
                            </h5>
                        }
                    </div>
                    <div id='product' className="row ">
                        <div className="col-lg-3 col-12">
                            <Filter category_name={category_name} categories={categories} products={products} open={openFilter} close={setOpenFilter} filters={filters} setFilters={setFilters} filter_item={filter_item} setFilter_item={setFilter_item} searchParams={searchParams} data={data} setData={setData} />
                        </div>
                        <div className="col-12">
                            <div className="d-flex align-items-center justify-between w-full flex-wrap mb-2" style={{ gap: "1em" }}>
                                <div className='flex gap-4'>
                                    <button
                                        onClick={() => { setOpenFilter(true) }}
                                        style={{ color: "var(--text-color) !important", fontSize: "1.1em !important", fontWeight: "600 !important" }}
                                        className={`${styles.filter_btn} d-flex align-items-center justify-content-between w-[5em]`}
                                    >
                                        <span style={{ fontWeight: "600" }}>Filter</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    <Select value={sortOption} onValueChange={handleSortChange}>
                                        <SelectTrigger className="w-[12em]">
                                            <SelectValue placeholder="Relevance" />
                                        </SelectTrigger>
                                        <SelectContent >
                                            <SelectGroup >
                                                <SelectItem value="Relevance">Relevance</SelectItem>
                                                <SelectItem value="Exclusive">Exclusive</SelectItem>
                                                <SelectItem value="New Arrival">Best Selling</SelectItem>
                                                <SelectItem value="name_a_to_z">Alphabetically, A-Z</SelectItem>
                                                <SelectItem value="name_z_to_a">Alphabetically, Z-A</SelectItem>
                                                <SelectItem value="price_low_to_high">Price, low to high</SelectItem>
                                                <SelectItem value="price_high_to_low">Price, high to low</SelectItem>
                                                <SelectItem value="date_old_to_new">Date, old to new</SelectItem>
                                                <SelectItem value="date_new_to_old">Date, new to old</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                            </div>
                            {searchQuery && <h4 className='mb-3'>Found {data.length} results for &apos;{searchQuery}&apos;</h4>}
                            {filters && <div className={styles.filter_items}>
                                {filters.map((item, index) => { 
                                    return <button  onClick={() => { handleRemoveFilter(item.name, item.value) }} key={index}><IoCloseOutline /> {item.value}</button>
                                })}
                            </div>}
                            <div  className="row g-lg-4 g-3">
                                {data && data?.length > 0 ? data?.map((item, index) => {
                                    return <motion.div variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }} transition={{duration:0.5,ease:"easeOut",delay:index*0.1}}  key={index} className="col-lg-3 col-md-4 col-sm-6 col-6">
                                        <Product data={item} />
                                    </motion.div>
                                }) :
                                    data?.length < 0 || data?.filter((item) => !item.availability && item.stock === 0)  &&
                                        // <div className="d-flex align-items-center justify-content-center flex-col" style={{ height: "100vh" }}>
                                        //     <div className="loader-circle">
                                        //         <span class="loader"></span>
                                        //     </div>
                                        //     {data && data?.length < 0 && <h6 className="mt-2">!No Product Found</h6>}
                                        // </div> :
                                        <div className="d-flex align-items-center justify-content-start flex-col" style={{ height: "100vh" }}>
                                            <img src="/images/no_product.svg" className='img-fluid' style={{ width: "10%" }} alt="no_product.svg" />
                                            <h6 className="mt-4" style={{ color: "#999" }}>Sorry, there are no products in this collection                                    </h6>
                                        </div>
                                }
                            </div>
                        </div>
                    </div>

                </div>
                <div className='py-4'>
                    <PaginationData totalPages={totalPages} initialPage={1} />
                </div>
            </div>
            <First_Purchase/>
            <div className='container-fluid bg-[var(--accent-color)] padd-x'>
                <div className='my-6 py-[3em]'>
                    <div className='row gx-3 gy-3'>
                        <div className='col-md-4 col-sm-6 '>
                            <div className='h-full flex flex-col gap-2 justify-between'>
                                <div className='flex gap-3 items-center'>
                                    <Image src="/icon_images/truck.png" 
                                    alt='truck.png' width={50} height={50}/>
                                    <h4 className='!mb-0'>Quick Order Process</h4>
                                </div>
                                <p> Our streamlined shopping experience ensures your favorite fragrance is just a few clicks away, with fast checkout, secure payments, and real-time order tracking for complete peace of mind.</p>
                            </div>
                        </div>
                        <div className='col-md-4 col-sm-6 '>
                            <div className='h-full flex flex-col gap-2 justify-between'>
                                <div className='flex gap-3 items-center'>
                                    <Image src="/icon_images/glove.png" alt='glove.png' width={50} height={50} />
                                    <h4 className='!mb-0'>Reliable Shipping Partners</h4>
                                </div>
                                <p>We partner with trusted logistics services to ensure your products arrive safely, securely, and on time—handled with care and delivered across India and beyond with speed and reliability.</p>
                            </div>
                        </div>
                        <div className='col-md-4 col-sm-6 '>
                            <div className='h-full flex flex-col gap-2 justify-between'>
                                <div className='flex gap-3 items-center'>
                                    <Image src="/icon_images/returns.png" alt='returns.png' width={40} height={40} />
                                    <h4 className='!mb-0'>Customer First Policy</h4>
                                </div>
                                <p> We’re committed to your satisfaction—easy returns, responsive support, detailed product guidance, and a fragrance experience that exceeds expectations with every order, every scent, and every interaction.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Shop
