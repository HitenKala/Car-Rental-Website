import React from 'react'
import Title from './Title'
import { assets } from '../assets/assets'
import CarCard from './CarCard'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react';

const FeaturedSection = () => {

  const navigate = useNavigate();
  const { cars } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{opacity: 1, y:0}}
      transition={{ duration: 1, ease: 'easeInOut' }}

    className='flex flex-col items-center px-4 py-18 sm:px-6 md:px-10 md:py-24 lg:px-16 xl:px-24'>

      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{opacity: 1, y:0}}
      transition={{ duration: 1, delay: 0.5 }}
      >
        <Title title="Featured Cars" subTitle="Explore our handpicked selection of top-rated vehicles, chosen for their quality, performance, and customer satisfaction." align="center" />

      </motion.div>

      <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{opacity: 1, y:0}}
      transition={{ delay: 0.5, duration: 1 }}

       className='mt-12 grid w-full max-w-7xl grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3'>
        {
          cars.slice(0, 6).map((car) => (
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{opacity: 1, scale:1}}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            
            key={car._id} className='h-full'>
              <CarCard car={car} />
            </motion.div>

          ))
        }
      </motion.div>
      <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{opacity: 1, y:0}}
      transition={{ delay: 0.6, duration: 0.4}}
      
      onClick={() => {
        navigate('/cars'); scrollTo(0, 0)
      }}
        className='mt-10 flex items-center gap-2 rounded-md bg-[#185a9d] px-6 py-3 text-white cursor-pointer transition hover:bg-[#102f4e] sm:mt-12'>
        Explore all Cars <img src={assets.arrow_icon} alt="arrow" />
      </motion.button>

    </motion.div>
  )
}

export default FeaturedSection
