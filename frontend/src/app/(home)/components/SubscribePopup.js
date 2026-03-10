'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Mail } from 'lucide-react'
import { usePathname } from 'next/navigation'

const popupVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: 50, scale: 0.8, transition: { duration: 0.4, ease: 'easeIn' } }
}

const minimizedVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
}

export default function SubscribePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    useEffect(()=>{
        if(pathname==="/"){
            setIsOpen(true)
        }
    },[])

    return (
        <div className="fixed bottom-4 right-4 z-50">
           
                {isOpen ? (
                    <motion.div
                        key="popup"
                        variants={popupVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative bg-white  shadow-2xl flex max-w-xl w-[90vw] md:w-[600px] overflow-hidden"
                    >
                        <div className="w-1/2 hidden md:block">
                            <Image src="/icon_images/saffron-oil-glass-bottle-with-gold-rim-cork-stopper_1301196-798.avif" alt="subscribe image" width={300} height={300} className="object-cover w-full h-full" />
                        </div>
                        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-black">
                                <X size={20} />
                            </button>
                            <div>
                                <h2 style={{lineHeight:"1em"}} className="text-2xl md:text-3xl font-bold mb-2">Get 10% Off</h2>
                                <p className="text-sm text-gray-600 mb-4">Subscribe to our newsletter and get 10% off your first purchase!</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="email" placeholder="Enter your email" className="pl-10 pr-4 py-2 rounded-full w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                                </div>
                                <button className="w-full bg-black text-white py-2 rounded-full font-semibold hover:bg-gray-800 transition-all">Subscribe Now</button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        key="minimized"
                        variants={minimizedVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setIsOpen(true)}
                        className="bg-black text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-xl hover:bg-gray-800"
                    >
                        <Mail size={18} /> <span className="text-sm font-medium">Get 10% Off</span>
                    </motion.button>
                )}
           
        </div>
    )
}
