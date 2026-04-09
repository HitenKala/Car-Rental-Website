import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

const Hero = () => {

  const [pickupLocation, setPickupLocation] = useState("");

  const { pickupDate, setPickupDate, returnDate, setReturnDate, pickupTime, setPickupTime, returnTime, setReturnTime, navigate } = useAppContext()
  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate + '&pickupTime=' + pickupTime + '&returnTime=' + returnTime);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='min-h-screen flex flex-col items-center justify-center gap-10 bg-neutral2 px-4 py-10 text-center md:gap-14 md:px-6' >

      <motion.h1 initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className='max-w-[12ch] text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl'>
        Cars On Rent
      </motion.h1>

      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSearch}
        className='w-full max-w-6xl rounded-[30px] bg-white p-4 shadow-[0px_8px_20px_rgba(0,0,0,0.1)] sm:p-5 md:p-7'
        action=""
      >
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_1fr_0.9fr_auto] xl:items-end'>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="pickup-location">Pickup Location</label>
            <select value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} id="pickup-location" className='w-full rounded-xl border border-slate-200 px-4 py-3' required>
              <option value="" disabled>Pickup Location</option>
              {cityList.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="pickup-date">Pick-up Date</label>
            <input value={pickupDate} onChange={e => setPickupDate(e.target.value)} type="date" id='pickup-date' min={new Date().toISOString().split('T')[0]}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-500' required />
          </div>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="pickup-time">Pick-up Time</label>
            <input value={pickupTime} onChange={e => setPickupTime(e.target.value)} type="time" id='pickup-time'
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-500' required />
          </div>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="return-date">Drop-off Date</label>
            <input value={returnDate} onChange={e => setReturnDate(e.target.value)} type="date" id='return-date'
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-500' required />
          </div>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="return-time">Drop-off Time</label>
            <input value={returnTime} onChange={e => setReturnTime(e.target.value)} type="time" id='return-time'
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-500' required />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex h-[52px] w-full items-center justify-center gap-1 rounded-xl bg-[#185a9d] px-9 py-3 text-white cursor-pointer sm:w-auto xl:self-end'>
            <img src={assets.search_icon} alt="search" className='border-white brightness-300' />
            Search
          </motion.button>
        </div>
      </motion.form>

      <motion.img
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}

      src={assets.main_car4} alt="Car" className='w-full max-w-[900px] px-4 sm:px-0 md:max-h-74 md:w-auto' />

    </motion.div>
  )
}

export default Hero
