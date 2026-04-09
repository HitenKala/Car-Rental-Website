import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title';
import CarCard from '../components/CarCard';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const Cars = () => {

  //getting search params from url
  const [searchParams, setSearchParams] = useSearchParams();
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');
  const pickupTime = searchParams.get('pickupTime');
  const returnTime = searchParams.get('returnTime');
  const querySearch = searchParams.get('q') || '';

  const { cars, axios } = useAppContext();

  const [input, setInput] = useState(querySearch);

  const isSearchData = pickupLocation && pickupDate && returnDate && pickupTime && returnTime;
  const [baseCars, setBaseCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const quickFilters = ['SUV', 'Automatic', 'Electric', 'Luxury'];

  const applyFilter = async () => {
    if (input.trim() === '') {
      setFilteredCars(baseCars);
      return null;
    }

    const filtered = baseCars.slice().filter((car) => {
      const searchTerm = input.trim().toLowerCase();
      return (car.brand || '').toLowerCase().includes(searchTerm) ||
        (car.model || '').toLowerCase().includes(searchTerm) ||
        (car.category || '').toLowerCase().includes(searchTerm) ||
        (car.transmission || '').toLowerCase().includes(searchTerm) ||
        (car.location || '').toLowerCase().includes(searchTerm);
    });
    setFilteredCars(filtered);
  }

  const searchCarAvailablity = async () => {
    const { data } = await axios.post('/api/bookings/check-availability', { location: pickupLocation, pickupDate, returnDate, pickupTime, returnTime });
    if (data.success) {
      setBaseCars(data.availableCars);
      if (data.availableCars.length === 0) {
        toast('No cars available for the selected criteria.');
      }
      return null;
    }
  }

  useEffect(() => {
    setInput(querySearch);
  }, [querySearch]);

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailablity();
      return;
    }
    setBaseCars(cars);
  }, [isSearchData, cars, pickupLocation, pickupDate, returnDate, pickupTime, returnTime]);

  useEffect(() => {
    applyFilter();
  }, [input, baseCars]);

  const handleSearchInput = (value) => {
    setInput(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  }

  return (

    <div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}

        className="flex flex-col items-center py-20 bg-light max-md:px-4">
        <Title title='Available Cars' subTitle='Browse our selection of available vehicles' />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={(e) => e.preventDefault()}
          className='group mt-8 flex w-full max-w-4xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 focus-within:border-blue-300'
        >
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
            <img src={assets.search_icon} alt='search' className='h-5 w-5 opacity-70' />
          </div>

          <input
            onChange={(e) => handleSearchInput(e.target.value)}
            value={input}
            type='text'
            placeholder='Search by brand, model, category, transmission, or city'
            className='h-10 w-full bg-transparent text-base font-medium text-slate-700 outline-none placeholder:text-slate-400'
          />

          {input && (
            <button
              type='button'
              onClick={() => handleSearchInput('')}
              className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700'
            >
              Clear
            </button>
          )}

          <button
            type='button'
            onClick={() => handleSearchInput(input)}
            className='rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]'
          >
            Search
          </button>
        </motion.form>

        <div className='mt-4 flex w-full max-w-4xl flex-wrap items-center gap-2 px-1'>
          <span className='mr-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400'>Quick Picks</span>
          {quickFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleSearchInput(filter)}
              type='button'
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${input.toLowerCase() === filter.toLowerCase()
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

        className='px-6 md:px-6 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </div>

      </motion.div>
    </div>
  )
}

export default Cars
