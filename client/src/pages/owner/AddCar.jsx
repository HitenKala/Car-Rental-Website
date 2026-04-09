import React, { useState } from 'react'
import Title from '../../components/owner/Title';
import { assets, cityList } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CITY_COORDINATES = {
  Dehradun: { lat: 30.3165, lon: 78.0322 },
  Haridwar: { lat: 29.9457, lon: 78.1642 },
  Rishikesh: { lat: 30.0869, lon: 78.2676 },
  Nainital: { lat: 29.3919, lon: 79.4542 },
  Mussoorie: { lat: 30.4598, lon: 78.0644 },
  Haldwani: { lat: 29.2183, lon: 79.5130 },
};

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const AddCar = () => {

  const { axios, currency } = useAppContext()

  const [image, setImage] = useState(null);
  const [rcDocument, setRcDocument] = useState(null);
  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: 0,
    pricePerDay: 0,
    category: "",
    transmission: "",
    fuel_type: "",
    seating_capacity: 0,
    location: "",
    preciseLocation: "",
    rcNumber: "",
    description: "",
    isAvailable: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const detectNearestPickupLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const nearestCity = cityList.reduce((closest, city) => {
          const coords = CITY_COORDINATES[city];
          if (!coords) return closest;

          const distance = getDistanceKm(latitude, longitude, coords.lat, coords.lon);
          if (!closest || distance < closest.distance) {
            return { city, distance };
          }
          return closest;
        }, null);

        if (!nearestCity) {
          toast.error('Could not detect nearest pickup location');
          setIsDetectingLocation(false);
          return;
        }

        setCar((prev) => ({ ...prev, location: nearestCity.city }));
        toast.success(`Nearest pickup location selected: ${nearestCity.city}`);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.log(error);
        toast.error('Unable to access location. Please allow location permission.');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return null;

    setIsLoading(true);
    try {
      if (!image) {
        toast.error('Please upload a car image');
        return;
      }
      if (!rcDocument) {
        toast.error('Please upload the RC document');
        return;
      }
      const formData = new FormData();
      formData.append('image', image);
      formData.append('rcDocument', rcDocument);
      formData.append('carData', JSON.stringify(car));

      const { data } = await axios.post('/api/owner/add-car', formData)
      if (data.success) {
        toast.success(data.message);
        setImage(null);
        setRcDocument(null);
        setCar({
          brand: "",
          model: "",
          year: 0,
          pricePerDay: 0,
          category: "",
          transmission: "",
          fuel_type: "",
          seating_capacity: 0,
          location: "",
          preciseLocation: "",
          rcNumber: "",
          description: "",
          isAvailable: true,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title="Add New Car" subTitle="Fill in car details to add a new car to your fleet" />

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-700 text-sm mt-6 max-w-xl'>

        {/* Car Image Upload */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor='car-image'>
            <img src={image ? URL.createObjectURL(image) : assets.upload_icon} alt="" className='h-14 rounded cursor-pointer' />
            <input type="file" id="car-image" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car</p>
        </div>

        {/* RC Number & RC Document Upload */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label>RC Number</label>
            <input
              type="text"
              placeholder='e.g. UK12G8126'
              required
              value={car.rcNumber}
              onChange={(e) => setCar({ ...car, rcNumber: e.target.value })}
              className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1'
            />
          </div>
          <div className='flex flex-col w-full'>
            <label>RC Document</label>
            <input
              type="file"
              accept="image/*,.pdf"
              required
              onChange={(e) => setRcDocument(e.target.files[0] || null)}
              className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1 text-[12px]'
            />
            <p className='mt-1 text-xs text-gray-500'>{rcDocument ? rcDocument.name : 'Upload clear RC image or PDF'}</p>
          </div>
        </div>

        {/* Car Brand & Model*/}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Brand</label>
            <input type="text" placeholder='e.g. BMW, Audi, Mercedes...' required value={car.brand} onChange={(e) => setCar({ ...car, brand: e.target.value })} className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1' />
          </div>
          <div className='flex flex-col w-full'>
            <label>Model</label>
            <input type="text" placeholder='e.g. X3, A4, C-Class...' required value={car.model} onChange={(e) => setCar({ ...car, model: e.target.value })} className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1' />
          </div>
        </div>

        {/* Car year, price, category */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Year</label>
            <input type="number" placeholder='e.g. 2020, 2021, 2022...' required value={car.year} onChange={(e) => setCar({ ...car, year: e.target.value })} className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1' />
          </div>
          <div className='flex flex-col w-full'>
            <label>Price Per Day ({currency})</label>
            <input type="number" placeholder='e.g. Rs5000, Rs7500, Rs10000...' required value={car.pricePerDay} onChange={(e) => setCar({ ...car, pricePerDay: e.target.value })} className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1' />
          </div>
          <div className='flex flex-col w-full'>
            <label>Category</label>
            <select onChange={e => setCar({ ...car, category: e.target.value })} value={car.category} required className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1 text-[12px]'>
              <option value="">Select a Category</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Sports car">Sports car</option>
              <option value="Hot hatch">Hot hatch</option>
            </select>
          </div>
        </div>

        {/* Transmission, fuel type, seating capacity */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Transmission</label>
            <select onChange={e => setCar({ ...car, transmission: e.target.value })} value={car.transmission} required className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1 text-[12px]'>
              <option value="">Select a Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Fuel Type</label>
            <select onChange={e => setCar({ ...car, fuel_type: e.target.value })} value={car.fuel_type} required className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1 text-[12px]'>
              <option value="">Select a Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Seating Capacity</label>
            <input type="number" placeholder='e.g. 4, 5, 6...' required value={car.seating_capacity} onChange={(e) => setCar({ ...car, seating_capacity: e.target.value })} className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1' />
          </div>
        </div>
        {/* Location */}
        <div className='flex flex-col w-full'>
          <div className='flex items-center justify-between'>
            <label>Pickup Location</label>

          </div>
          <select onChange={e => setCar({ ...car, location: e.target.value })} value={car.location} required className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1 text-[12px]'>
            <option value="">Select a Location </option>
            {cityList.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className='flex flex-col w-full'>
          <label>Precise Location (Nearest Public Spot)</label>
          <button
            type='button'
            onClick={detectNearestPickupLocation}
            disabled={isDetectingLocation}
            className='text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-60 gap-auto items-center mb-1 ml-auto flex w-max'
          >
            {isDetectingLocation ? 'Detecting...' : 'Use My Current Location'}
          </button>
          <input
            type='text'
            placeholder='e.g. Near Clock Tower Gate 2, Rajpur Road'
            value={car.preciseLocation}
            onChange={(e) => setCar({ ...car, preciseLocation: e.target.value })}
            className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1'
          />
          <p className='mt-1 text-xs text-gray-500'>Add exact landmark/address visible to users after booking.</p>

        </div>
        {/* Description */}
        <div className='flex flex-col w-full'>
          <label>Description</label>
          <textarea placeholder='Describe your car...' required value={car.description} onChange={(e) => setCar({ ...car, description: e.target.value })} className='border border-gray-300 rounded-md outline-none px-3 py-2 mt-1' rows="4" />
        </div>
        <button className='flex items-center gap-2 px-4 py-2.5 mt-4 mb-4 bg-blue-600 text-white rounded-md w-max font-medium cursor-pointer hover:bg-blue-700 transition-all duration-300'>
          <img src={assets.tick_icon} alt="" />{isLoading ? 'Listing...' : 'List Your Car'}
        </button>
      </form>
    </div>
  )
}

export default AddCar
