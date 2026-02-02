import React, { useEffect, useState } from 'react'
import { assets, dummyCarData } from '../assets/assets'
import Title from '../components/Title';
import CarCard from '../components/CarCard';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Cars = () => {

  //getting search params from url
  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  const { cars, axios } = useAppContext();

  const [input, setInput] = useState('');

  const isSearchData = pickupLocation && pickupDate && returnDate;
  const [filteredCars, setFilteredCars] = useState([]);

  const applyFilter = async () => {
    if (input === '') {
      setFilteredCars(cars);
      return null;
    }

    const filtered = cars.slice().filter((car) => {
      const searchTerm = input.toLowerCase();
      return car.brand.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.category.toLowerCase().includes(searchTerm) ||
        car.transmission.toLowerCase().includes(searchTerm);
    });
    setFilteredCars(filtered);
  }

  const searchCarAvailablity = async () => {
    const { data } = await axios.post('/api/bookings/check-availability', { location: pickupLocation, pickupDate, returnDate });
    if (data.success) {
      setFilteredCars(data.availableCars);
      if (data.availableCars.length === 0) {
        toast('No cars available for the selected criteria.');
      }
      return null;
    }
  }

  useEffect(() => {
    isSearchData && searchCarAvailablity();
  }, []);

  useEffect(() => {
    cars.length > 0 && !isSearchData && applyFilter();
  }, [input, cars]);

  return (

    <div>
      <div className="flex flex-col items-center py-20 bg-light max-md:px-4">
        <Title title='Available Cars' subTitle='Browse our selection of available vehicles' />

        <div className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow' >
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2' />

          <input onChange={(e) => setInput(e.target.value)} value={input} type="text"
            placeholder='Search my make, model, or features'
            className='w-full h-full outine-none text-gray-500' />

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 ml-2' />
        </div>
      </div>

      <div className='px-6 md:px-6 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 mx-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index) => (
            <div key={index}>
              <CarCard car={car} />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Cars
