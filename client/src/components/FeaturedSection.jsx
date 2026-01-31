import React, { use } from 'react'
import Title from './Title'
import { assets, dummyCarData } from '../assets/assets'
import CarCard from './CarCard'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const FeaturedSection = () => {

  const navigate = useNavigate();
  const { cars } = useAppContext();

  return (
    <div className='flex flex-col items-center py-24  px-6 md:px-16 lg:px-24 xl:px-32'>

      <div>
        <Title title="Featured Cars" subTitle="Explore our handpicked selection of top-rated vehicles, chosen for their quality, performance, and customer satisfaction." align="center" />

      </div>

      <div className='mt-18 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
        {
          cars.slice(0, 6).map((car) => (
            <div key={car._id} className='group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition all duration-500 cursor-pointer'>
              <CarCard car={car} />
            </div>

          ))
        }
      </div>
      <button onClick={() => {
        navigate('/cars'); scrollTo(0, 0)
      }}
        className='mt-18 flex items-center gap-2 px-6 py-2 bg-[#185a9d] hover:bg-neutral3 text-white rounded-md cursor-pointer'>
        Explore all Cars <img src={assets.arrow_icon} alt="arrow" />
      </button>

    </div>
  )
}

export default FeaturedSection
