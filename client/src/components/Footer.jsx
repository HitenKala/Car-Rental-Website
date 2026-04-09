import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'

const Footer = () => {
    const navigate = useNavigate()
    const { user, isOwner, setShowLogin } = useAppContext()

    const handleListYourCar = () => {
        if (!user) {
            setShowLogin(true)
            return
        }
        if (user.ownerVerificationStatus === 'pending') {
            toast('Your owner request is under admin review.')
            return
        }
        navigate('/owner')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-gray-500 px-6 md:px-16 lg:px-24 xl:px-32 mt-60 text-sm'
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='flex flex-wrap justify-between items-start gap-8 pb-6 border-gray-300 border-b'
            >
                <div>
                    <motion.img
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        src={assets.turbo_rides2}
                        alt='logo'
                        className='h-10 md:h-28'
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className='max-w-60 mt-0'
                    >
                        Premium car rental service for fun driving.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className='flex items-center gap-3 mt-6'
                    >
                        <a href='https://www.facebook.com' target='_blank' rel='noreferrer'>
                            <img src={assets.facebook_logo} className='w-5 h-5' alt='facebook' />
                        </a>
                        <a href='https://www.instagram.com' target='_blank' rel='noreferrer'>
                            <img src={assets.instagram_logo} className='w-5 h-5' alt='instagram' />
                        </a>
                        <a href='https://x.com' target='_blank' rel='noreferrer'>
                            <img src={assets.twitter_logo} className='w-5 h-5' alt='x' />
                        </a>
                        <a href='mailto:info@turborides.com'>
                            <img src={assets.gmail_logo} className='w-5 h-5' alt='email' />
                        </a>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className='flex flex-wrap justify-between w-1/2 gap-8'
                >
                    <div>
                        <h2 className='text-base font-medium text-gray-800 uppercase'>QUICK LINKS</h2>
                        <ul className='mt-3 flex flex-col gap-1.5'>
                            <li><Link to='/'>Home</Link></li>
                            <li><Link to='/cars'>Browse Cars</Link></li>
                            <li>
                                <button onClick={handleListYourCar} className='cursor-pointer'>
                                    {isOwner ? 'Owner Dashboard' : 'List Your Car'}
                                </button>
                            </li>
                            <li><Link to='/info/about-us'>About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='text-base font-medium text-gray-800 uppercase'>RESOURCES</h2>
                        <ul className='mt-3 flex flex-col gap-1.5'>
                            <li><Link to='/info/help-center'>Help Center</Link></li>
                            <li><Link to='/info/terms-of-service'>Terms of Service</Link></li>
                            <li><Link to='/info/privacy-policy'>Privacy Policy</Link></li>
                            <li><Link to='/info/insurance'>Insurance</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='text-base font-medium text-gray-800 uppercase'>CONTACT</h2>
                        <ul className='mt-3 flex flex-col gap-1.5'>
                            <li>
                                <a href='https://maps.google.com/?q=123 Shakti Vihar, Srinagar Garhwal, Country' target='_blank' rel='noreferrer'>
                                    Shakti Vihar, Srinagar Garhwal,
                                </a>
                            </li>
                            <li>Pauri, Uttarakhand</li>
                            <li><a href='tel:+15551234567'>+91 9548487346</a></li>
                            <li><a href='mailto:info@turborides.com'>info@turborides.com</a></li>
                        </ul>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'
            >
                <p>� {new Date().getFullYear()} <Link to='/'>TurboRides</Link>. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><Link to='/info/privacy-policy'>Privacy</Link><span> | </span></li>
                    <li><Link to='/info/terms-of-service'>Terms</Link><span> | </span></li>
                    <li><Link to='/info/cookies'>Cookies</Link></li>
                </ul>
            </motion.div>
        </motion.div>
    )
}

export default Footer
