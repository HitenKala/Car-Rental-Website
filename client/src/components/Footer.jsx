import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'motion/react';

const Footer = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}

            className='text-gray-500 px-6 md:px-16 lg:px-24 xl:px-32 mt-60 text-sm'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}


                className='flex flex-wrap justify-between items-start gap-8 pb-6 border-gray-300 border-b'>
                <div>
                    <motion.img
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}

                        src={assets.turbo_rides2} alt="logo" className='h-10 md:h-28' />
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}

                        className='max-w-60 mt-0'>
                        Premium car rental service for fun driving.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}


                        className='flex items-center gap-3 mt-6'>
                        <a href="#"> <img src={assets.facebook_logo} className='w-5 h-5' alt="" /></a>
                        <a href="#"> <img src={assets.instagram_logo} className='w-5 h-5' alt="" /></a>
                        <a href="#"> <img src={assets.twitter_logo} className='w-5 h-5' alt="" /></a>
                        <a href="#"> <img src={assets.gmail_logo} className='w-5 h-5' alt="" /></a>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}

                    className='flex flex-wrap justify-between w-1/2 gap-8'>

                    <div>
                        <h2 className='text-base font-medium text-gray-800 uppercase'>QUICK LINKS</h2>
                        <ul className='mt-3 flex flex-col gap-1.5'>
                            <li><a href="#">Home</a></li>
                            <li><a href="#">Browse Cars</a></li>
                            <li><a href="#">List Your Car</a></li>
                            <li><a href="#">About Us</a></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='text-base font-medium text-gray-800 uppercase'>RESOURCES</h2>
                        <ul className='mt-3 flex flex-col gap-1.5'>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Insurance</a></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='text-base font-medium text-gray-800 uppercase'>CONTACT</h2>
                        <ul className='mt-3 flex flex-col gap-1.5'>
                            <li>123 Main Street, City, Country</li>
                            <li>San Francisco, CA 94107</li>
                            <li>+1 (555) 123-4567</li>
                            <li>info@turborides.com</li>
                        </ul>
                    </div>

                </motion.div>

            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}

                className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} <a href="https://prebuiltui.com">TurboRides </a>. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Privacy</a><span> | </span></li>
                    <li><a href="#">Terms</a><span> | </span></li>
                    <li><a href="#">Cookies</a></li>
                </ul>
            </motion.div>
        </motion.div>
    )
}

export default Footer
