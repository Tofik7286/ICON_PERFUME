import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/app/(home)/styles/shop.module.css';
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import colorNameToHex from '@uiw/react-color-name';
import { IoCloseOutline } from "react-icons/io5";

const Filter = ({ categories, products, close, open, searchParams, data, setFilters, filters, filter_item, setFilter_item, category_name }) => {

    const [availability, setAvailability] = useState({ inStock: false, outOfStock: false });
    const hasMounted = useRef(false);
    // const { categories, products } = useSelector((state) => state.products)
    const [priceChange, setPriceChange] = useState(false);

    const params = new URLSearchParams(searchParams.toString());

    const router = useRouter();
    const pathname = usePathname()

    const colors = [
        ...new Map(
            products && products
                .filter(item => item?.color && item?.color?.name) // Ensure color.name exists
                .map(item => [item?.color?.name?.trim()?.toLowerCase(), item?.color]) // Create a map of color names as keys
        ).values() // Extract the color objects without duplication
    ];
    
    const inStock = data?.reduce((total, item) => {
        return total + (item.available === true || item.stock > 0 ? 1 : 0);
    }, 0);

    const outOfStock = data?.reduce((total, item) => {
        return total + (item.available === false && item.stock === 0 ? 1 : 0);
    }, 0);

    const minLimit = 0;
    const maxLimit = 10000;

    const handleMinInputChange = (e) => {
        const value = Math.min(Number(e.target.value), filter_item.price.max - 1); // Prevent overlap
        setFilter_item((prev) => {
            return {
                ...prev,
                price: {
                    ...prev.price,
                    min: value
                }
            };
        });
        setPriceChange(true)
    };

    const handleMaxInputChange = (e) => {
        const value = Math.max(Number(e.target.value), filter_item.price.min + 1); // Prevent overlap
        setFilter_item((prev) => {
            return {
                ...prev,
                price: {
                    ...prev.price,
                    max: value
                }
            };            
        });
        setPriceChange(true)

    };

    const handleMinRangeChange = (e) => {
        const value = Math.min(Number(e.target.value), filter_item.price.max - 1);
        setFilter_item((prev) => {
            return {
                ...prev,
                price: {
                    ...prev.price,
                    min: value
                }
            };
        });
        setPriceChange(true)

    };

    const handleMaxRangeChange = (e) => {
        const value = Math.max(Number(e.target.value), filter_item.price.min + 1);
        setFilter_item((prev) => {
            return {
                ...prev,
                price: {
                    ...prev.price,
                    max: value
                }
            };
        });
        setPriceChange(true)

    };

    const createQueryString = useCallback(
        (name, values) => {
            const params = new URLSearchParams(searchParams.toString());

            if (!values || values.length === 0) {
                params.delete(name);
            } else {
                params.set(name, values.join(',')); // Simplified comma-separated format
            }

            return params.toString();
        },
        [searchParams] 
    );
 
    const handleCategory = (name) => {
        router.push(`/${name}`);
    };

    const groupedCategories = categories.reduce((acc, item) => {
        if (!item.parent) {
            acc[item.id] = { ...item, subcategories: [] };
        } else {
            if (acc[item.parent]) {
                acc[item.parent].subcategories.push(item);
            }
        }
        return acc;
    }, {});
   

    const handleAvailability = (name) => {
        setFilter_item((prev) => {
            const updatedAvailability = prev.availability.includes(name)
                ? prev.availability.filter((item) => item !== name) // Remove if already exists
                : [...prev.availability, name]; // Add if not exists

            // Update query string in URL
            const newUrl = pathname + '?' + createQueryString('availability', updatedAvailability)
            window.history.pushState(null, '', newUrl);

            return { ...prev, availability: updatedAvailability };
        });
        close(false)
    };

    const updateQueryParams = (name, value) => {
        const queryString = createQueryString(name, value);
        const newUrl = (`${pathname}?${queryString}`)
        router.replace(newUrl);
        router.refresh(); 

    };
    useEffect(() => {
        // Update the query string when price range changes
        if (!priceChange) {
            return;
        }

        const queryParams = [];

        if (filter_item.price.min > minLimit) queryParams.push(`minPrice=${filter_item.price.min}`);
        if (filter_item.price.max < maxLimit) queryParams.push(`maxPrice=${filter_item.price.max}`);

        if (queryParams.length > 0) {
            updateQueryParams('price', queryParams);
        } else {
            // Remove price query parameters if no price range is set
            updateQueryParams('price', []);
        }
    }, [filter_item.price.max, filter_item.price.min]);

    return (
        <>
            <div className={`${styles.filter_backdrop} ${open ? styles.active : ''}`} onClick={() => { close(false) }}></div>
            <div className={`${styles.filter} ${open ? styles.active : ''}`}>
                <div className={styles.filter_head}>
                    <h2>Filters</h2>
                    {/*<button className={styles.apply}>Apply</button>*/}
                    <IoCloseOutline onClick={() => { close(false) }} className={`${styles.closeBtn} ${styles.filter_btn}`} />
                </div>
                <div className={styles.filterSection}>

                    <Accordion type="single" collapsible defaultValue="category">
                        <AccordionItem value="category">
                            <AccordionTrigger>Category</AccordionTrigger>
                            <AccordionContent>
                                <div className={styles.label_list}>
                                    {Object.values(groupedCategories).map((mainCategory) => (
                                        <div key={mainCategory.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="ui-checkbox"
                                                    checked={category_name === mainCategory.name.replace(/\s+/g, "-")}
                                                    onChange={() => handleCategory(mainCategory.name.replace(/\s+/g, "-"))}
                                                />
                                                {mainCategory.name}
                                            </label>

                                            {/* Subcategories */}
                                            {mainCategory.subcategories.length > 0 && (
                                                <div style={{ marginLeft: "1rem",marginTop:".5rem" }}>
                                                    {mainCategory.subcategories.map((sub) => (
                                                        <label className='mt-2' key={sub.id}>
                                                            <input
                                                                type="checkbox"
                                                                className="ui-checkbox"
                                                                checked={
                                                                    category_name ===
                                                                    `${sub.name.replace(/\s+/g, "-")}`
                                                                }
                                                                onChange={() =>
                                                                    handleCategory(
                                                                        `${mainCategory.name.replace(/\s+/g, "-")}/${sub.name.replace(/\s+/g, "-")}`
                                                                    )
                                                                }
                                                            />
                                                            {sub.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    
                   

                    <Accordion type="single" collapsible defaultValue='price'>
                        <AccordionItem value="price" >
                            <AccordionTrigger>Price</AccordionTrigger>
                            <AccordionContent>
                                <div className={styles.slider}>
                                    <div
                                        className={styles.progress}
                                        style={{
                                            left: `${(filter_item.price.min / maxLimit) * 100}%`,
                                            right: `${100 - (filter_item.price.max / maxLimit) * 100}%`,
                                        }}
                                    ></div>
                                </div>

                                <div className={styles.range_input}>
                                    <input
                                        type="range"
                                        className={styles.range_min}
                                        min={minLimit}
                                        max={maxLimit}
                                        value={filter_item.price.min}
                                        step="1"
                                        onChange={handleMinRangeChange}
                                    />
                                    <input
                                        type="range"
                                        className={styles.range_max}
                                        min={minLimit}
                                        max={maxLimit}
                                        value={filter_item.price.max}
                                        step="1"
                                        onChange={handleMaxRangeChange}
                                    />
                                </div>
                                <div className={styles.price_input}>
                                    <div className={styles.field}>
                                        <span>&#8377;</span>
                                        <input
                                            type="number"
                                            className="input-min"
                                            value={filter_item.price.min}
                                            min={minLimit}
                                            max={maxLimit - 1}
                                            onChange={handleMinInputChange}
                                        />
                                    </div>
                                    <div className={styles.seperator}>To</div>
                                    <div className={styles.field}>
                                        <span>&#8377;</span>
                                        <input
                                            type="number"
                                            className="input-max"
                                            value={filter_item.price.max}
                                            min={minLimit + 1}
                                            max={maxLimit}
                                            onChange={handleMaxInputChange}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    

                    {/* <Accordion type="single" collapsible defaultValue='availability'>
                        <AccordionItem value="availability">
                            <AccordionTrigger>Availability</AccordionTrigger>
                            <AccordionContent>
                                <div className={styles.label_list}>
                                    <label >
                                        <input
                                            type="checkbox"
                                            className="ui-checkbox"
                                            checked={filter_item.availability.includes("In Stock")}
                                            onChange={() => handleAvailability('In Stock')}
                                        />
                                        In Stock ({inStock || 0})
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="ui-checkbox"
                                            checked={filter_item.availability.includes("Out Of Stock")}
                                            onChange={() => handleAvailability('Out Of Stock')}
                                        />
                                        Out of Stock ({outOfStock})
                                    </label>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion> */}
                </div>
            </div>
        </>
    );
};

export default Filter;
