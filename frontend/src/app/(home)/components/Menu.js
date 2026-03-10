import React, { useEffect, useState } from 'react'
import styles from '@/app/(home)/styles/menu.module.css'
import { IoCloseOutline } from "react-icons/io5";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoPerson } from "react-icons/go";
import { IoMdHeartEmpty } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, selectUser } from '../redux/userSlice';
import { GoHome } from "react-icons/go";
import { BsShopWindow } from "react-icons/bs";
import { RiContactsBook3Line } from "react-icons/ri";
import { HiOutlineUsers } from "react-icons/hi2";
import { FiChevronDown } from "react-icons/fi";
import { GiSquareBottle } from "react-icons/gi";
import Image from 'next/image';

const Menu = ({ menu, setMenu, categoryTree }) => {

    const { user, status, error } = useSelector(selectUser);
    const [expanded, setExpanded] = useState(null);

    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchUser());
    }, [dispatch]);

    const pathname = usePathname();
    const slugify = (text) =>
        text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    
    return (
        <div className={styles.menuBar}>
            <div className={`${styles.backdrop} ${menu ? styles.menu : ''}`} onClick={() => { setMenu(false) }}></div>
            <ul className={`${styles.links} ${menu ? styles.menu : ''}`}>
                <li className="d-flex align-items-end justify-content-end w-full">
                    <div className={`${styles.icon} ${styles.menu} ${styles.active}`}><IoCloseOutline onClick={() => { setMenu(false) }} /></div>
                </li>
                <li><Link href="/" className={pathname === "/" ? styles.active : ''} style={{ display: "flex", alignItems: "center", gap: ".5em" }} onClick={() => { setMenu(false) }}><GoHome /> Home</Link></li>
                <li><Link href="/shop" className={pathname === "/shop/" ? styles.active : ''} style={{ display: "flex", alignItems: "center", gap: ".5em" }} onClick={() => { setMenu(false) }}><BsShopWindow /> Shop</Link></li>
                {categoryTree.map((cat) => (
                    <li key={cat.id} className={styles.dropdown}>
                        <div
                            className={styles.dropdownTrigger}
                            onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                            <Link onClick={() => { setMenu(false) }} href={`/${slugify(cat.name)}`} className={`${styles.categoryLink} gap-2 items-center`}>
                                {cat?.category_icon && <Image alt={`${cat.name}-Icon perfumes`} src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${cat.category_icon}`} width={18} height={18}/> }
                                {cat.name}
                            </Link>
                            {cat.children.length > 0 && (
                                <span
                                    className={`${styles.chevron} ${expanded === cat.id ? styles.rotate : ''}`}
                                >
                                    <FiChevronDown />
                                </span>
                            )}
                        </div>

                        {cat.children.length > 0 && expanded === cat.id && (
                            <ul className={`${styles.submenu} bg-[rgb(0,0,0,0.1)] p-1 `}>
                                {cat.children.map((sub) => (
                                    <li key={sub.id} >
                                        <Link
                                            href={`/${slugify(cat.name)}/${slugify(sub.name)}`}
                                            onClick={() => setMenu(false)}
                                            className='!text-sm gap-2 items-center w-full'
                                        >
                                            {sub.category_icon && <Image alt={`${sub.name}-Icon Perfumes`} src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${sub.category_icon}`} width={15} height={15} />}
                                            {sub.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
                <li><Link href="/about" className={pathname === "/about/" ? styles.active : ''} style={{ display: "flex", alignItems: "center", gap: ".5em" }} onClick={() => { setMenu(false) }}><HiOutlineUsers /> About Us</Link></li>
                <li><Link href="/contact" className={pathname === "/contact/" ? styles.active : ''} style={{ display: "flex", alignItems: "center", gap: ".5em" }} onClick={() => { setMenu(false) }}><RiContactsBook3Line /> Contact</Link></li>
                <li><Link href="/wishlist" className={pathname === "/wishlist/" ? styles.active : ''} style={{ display: "flex", alignItems: "center", gap: ".5em" }} onClick={() => { setMenu(false) }}><IoMdHeartEmpty /> Wishlist</Link></li>
                <li><Link href={user ? "/profile" : "/login"} className={pathname === "/login" ? styles.active : ''} style={{ display: "flex", alignItems: "center", gap: ".5em" }} onClick={() => { setMenu(false) }}><GoPerson /> Account</Link></li>
                
            </ul>
        </div>
    )
}

export default Menu
