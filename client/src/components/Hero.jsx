import React, { useEffect, useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

const Hero = () => {

  const [pickupLocation, setPickupLocation] = useState("");

  const { pickupDate, setPickupDate, returnDate, setReturnDate, pickupTime, setPickupTime, returnTime, setReturnTime, navigate } = useAppContext()
  const today = new Date().toISOString().split('T')[0];

  const getMinPickupTime = () => {
    if (pickupDate === today) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '00:00';
  }

  const addMinutesToTime = (time, minutesToAdd) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + minutesToAdd);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  const getMinReturnTime = () => {
    if (!pickupDate) return '00:00';
    if (returnDate === pickupDate && pickupTime) return addMinutesToTime(pickupTime, 60);
    return '00:00';
  }

  useEffect(() => {
    if (pickupDate === today && pickupTime && pickupTime < getMinPickupTime()) {
      setPickupTime(getMinPickupTime());
    }
  }, [pickupDate, pickupTime]);

  useEffect(() => {
    if (pickupDate && returnDate && returnDate < pickupDate) {
      setReturnDate(pickupDate);
    }
  }, [pickupDate, returnDate]);

  useEffect(() => {
    if (pickupDate && returnDate && pickupDate === returnDate && pickupTime && returnTime && returnTime <= pickupTime) {
      setReturnTime(addMinutesToTime(pickupTime, 60));
    }
  }, [pickupDate, returnDate, pickupTime, returnTime]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate + '&pickupTime=' + pickupTime + '&returnTime=' + returnTime);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral2 px-4 py-10 text-center sm:px-5 md:gap-12 md:px-6 lg:px-8' >

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        className='space-y-4'
      >

        <motion.h1 initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className='mx-auto max-w-[14ch] text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl'>
          Cars On Rent
        </motion.h1>


      </motion.div>

      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSearch}
        className='w-full max-w-6xl rounded-[28px] bg-white p-4 shadow-[0px_8px_20px_rgba(0,0,0,0.1)] sm:p-5 md:p-7'
        action=""
      >
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_1fr_0.9fr_auto] xl:items-end'>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="pickup-location" className='text-sm font-medium text-slate-700'>Pickup location</label>
            <select value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} id="pickup-location" className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none focus:border-[#185a9d]' required>
              <option value="" disabled>Pickup Location</option>
              {cityList.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="pickup-date" className='text-sm font-medium text-slate-700'>Pick-up date</label>
            <input value={pickupDate} onChange={e => setPickupDate(e.target.value)} type="date" id='pickup-date' min={new Date().toISOString().split('T')[0]}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none focus:border-[#185a9d]' required />
          </div>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="pickup-time" className='text-sm font-medium text-slate-700'>Pick-up time</label>
            <input value={pickupTime} onChange={e => setPickupTime(e.target.value)} type="time" id='pickup-time'
              min={getMinPickupTime()}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none focus:border-[#185a9d]' required />
          </div>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="return-date" className='text-sm font-medium text-slate-700'>Drop-off date</label>
            <input value={returnDate} onChange={e => setReturnDate(e.target.value)} type="date" id='return-date' min={pickupDate || today}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none focus:border-[#185a9d]' required />
          </div>
          <div className='flex min-w-0 flex-col items-start gap-2'>
            <label htmlFor="return-time" className='text-sm font-medium text-slate-700'>Drop-off time</label>
            <input value={returnTime} onChange={e => setReturnTime(e.target.value)} type="time" id='return-time'
              min={getMinReturnTime()}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none focus:border-[#185a9d]' required />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex h-[52px] w-full items-center justify-center gap-1 rounded-xl bg-[#185a9d] px-9 py-3 text-white cursor-pointer sm:col-span-2 xl:col-span-1 xl:self-end'>
            <img src={assets.search_icon} alt="search" className='border-white brightness-300' />
            Search
          </motion.button>
        </div>
      </motion.form>

      <motion.img
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}

        src={assets.main_car4} alt="Car" className='w-full max-w-[960px] px-2 sm:px-0 md:max-h-74 md:w-auto' />

    </motion.div>
  )
}

export default Hero
