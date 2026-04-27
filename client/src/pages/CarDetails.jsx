import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets';
import Loader from '../components/Loader';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import LocationMap from '../components/LocationMap';
import { buildGoogleMapsUrl, resolveCoordinates } from '../utils/locationMap';

const CarDetails = () => {

  const { id } = useParams();

  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, pickupTime, setPickupTime, returnTime, setReturnTime, currency, user, setShowLogin } = useAppContext();

  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [showBookingProfileModal, setShowBookingProfileModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingProfile, setBookingProfile] = useState({
    renterName: '',
    renterEmail: '',
    renterPhone: '',
    drivingLicenseNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });
  const [drivingLicenseDocument, setDrivingLicenseDocument] = useState(null);
  const [additionalDocument, setAdditionalDocument] = useState(null);

  const openBookingProfileModal = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (!pickupDate || !returnDate || !pickupTime || !returnTime) {
      toast.error('Please select pickup and drop-off date/time first');
      return;
    }
    setBookingProfile((prev) => ({
      ...prev,
      renterName: prev.renterName || user?.name || '',
      renterEmail: prev.renterEmail || user?.email || '',
    }));
    setShowBookingProfileModal(true);
  }

  const closeBookingProfileModal = () => {
    if (isSubmittingBooking) return;
    setShowBookingProfileModal(false);
  }

  const handleBookingProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!drivingLicenseDocument) {
        toast.error('Driving license document is required');
        return;
      }

      setIsSubmittingBooking(true);

      const formData = new FormData();
      formData.append('car', id);
      formData.append('pickupDate', pickupDate);
      formData.append('returnDate', returnDate);
      formData.append('pickupTime', pickupTime);
      formData.append('returnTime', returnTime);
      formData.append('renterName', bookingProfile.renterName.trim());
      formData.append('renterEmail', bookingProfile.renterEmail.trim());
      formData.append('renterPhone', bookingProfile.renterPhone.trim());
      formData.append('drivingLicenseNumber', bookingProfile.drivingLicenseNumber.trim());
      formData.append('emergencyContactName', bookingProfile.emergencyContactName.trim());
      formData.append('emergencyContactPhone', bookingProfile.emergencyContactPhone.trim());
      formData.append('notes', bookingProfile.notes.trim());
      formData.append('drivingLicenseDocument', drivingLicenseDocument);
      if (additionalDocument) {
        formData.append('additionalDocument', additionalDocument);
      }

      const { data } = await axios.post('/api/bookings/create', formData);

      if (data.success) {
        toast.success(data.message);
        setShowBookingProfileModal(false);
        navigate('/my-bookings');
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  useEffect(() => { setCar(cars.find(car => car._id === id)) }, [cars, id])

  useEffect(() => {
    if (pickupDate && returnDate && pickupDate > returnDate) {
      setReturnDate(pickupDate);
    }
  }, [pickupDate, returnDate]);

  useEffect(() => {
    if (returnDate === pickupDate && pickupTime && returnTime && returnTime <= pickupTime) {
      const [hours, minutes] = pickupTime.split(':');
      const newTime = new Date();
      newTime.setHours(parseInt(hours) + 1, parseInt(minutes));
      setReturnTime(newTime.toTimeString().slice(0, 5));
    }
  }, [pickupDate, returnDate, pickupTime, returnTime]);

  const getMinPickupTime = () => {
    const today = new Date().toISOString().split('T')[0];
    if (pickupDate === today) {
      const now = new Date();
      now.setHours(now.getHours() + 1); // add 1 hour buffer
      return now.toTimeString().slice(0, 5);
    }
    return undefined;
  };

  const getMinReturnTime = () => {
    if (returnDate === pickupDate && pickupTime) {
      return pickupTime;
    }
    return undefined;
  };

  const mapCoordinates = resolveCoordinates(car?.location, car?.pickupCoordinates);
  const mapLabel = car?.preciseLocation || car?.location || '';

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16 '>

      <button onClick={() => navigate(-1)} className='flex items-center gap-2 text-gray-500 mb-6 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back To all Cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left Car Image Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}

          className='lg:col-span-2'>
          <motion.img
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}

            src={car.image} alt={car.name} className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
          <motion.div className='space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} {car.year} </p>
            </div>
            <hr className='border-gray-300 my-6' />
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: ` ${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}

                  key={text} className='flex flex-col items-center gap-3 bg-gray-100 p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  <p className='text-gray-700 font-medium'>{text}</p>
                </motion.div>
              ))}
            </div>
            {/* Description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
              {car.preciseLocation ? (
                <p className='mt-2 text-sm text-gray-500'>
                  <span className='font-medium text-gray-700'>Precise pickup:</span> {car.preciseLocation}
                </p>
              ) : null}
            </div>
            {/* Google Map */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Pickup location</h1>
              {mapCoordinates ? (
                <LocationMap
                  coordinates={mapCoordinates}
                  title='Car pickup location'
                  subtitle={mapLabel}
                  height={320}
                  zoom={14}
                />
              ) : (
                <div className='overflow-hidden rounded-2xl border border-gray-200'>
                  <iframe
                    title='Car pickup location map'
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapLabel)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    width='100%'
                    height='320'
                    className='min-h-[320px] w-full border-0'
                    allowFullScreen
                    loading='lazy'
                    referrerPolicy='no-referrer-when-downgrade'
                  />
                </div>
              )}
              <div className='mt-3 flex flex-wrap items-center gap-3 text-sm'>
                <a
                  href={buildGoogleMapsUrl({ label: mapLabel, coordinates: mapCoordinates })}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100'
                >
                  Open in Google Maps
                </a>
                {mapCoordinates ? (
                  <p className='text-gray-500'>
                    Exact map pin available for this pickup point.
                  </p>
                ) : (
                  <p className='text-gray-500'>
                    Using city-level fallback because this car does not have saved coordinates yet.
                  </p>
                )}
              </div>
            </div>
            {/* Features */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {
                  ["Air Conditioning", "Leather Seats", "Bluetooth Connectivity", "Backup Camera", "Cruise Control", "Keyless Entry", "Heated Seats", "Sunroof/Moonroof"].map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                      {item}
                    </li>))
                }
              </ul>
            </div>
          </motion.div>
        </motion.div>


        {/* Righty Booking Form */}

        <motion.form
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onSubmit={openBookingProfileModal} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500 w-full max-w-xl lg:max-w-none'>

          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'> per day
          </span>
          </p>

          <hr className='border-gray-300 my-6' />

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <label htmlFor="pickup-date">Pickup Date</label>
              <input value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
                type="date" className='w-full border border-gray-300 px-3 py-2 rounded-lg' required id='pickup-date'
                min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="pickup-time">Pickup Time</label>
              <input value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
                type="time" className='w-full border border-gray-300 px-3 py-2 rounded-lg' required id='pickup-time'
                min={getMinPickupTime()} />
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="return-date">Drop-off Date</label>
              <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                type="date" className='w-full border border-gray-300 px-3 py-2 rounded-lg' required id='return-date'
                min={pickupDate} />
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="return-time">Drop-off Time</label>
              <input value={returnTime} onChange={(e) => setReturnTime(e.target.value)}
                type="time" className='w-full border border-gray-300 px-3 py-2 rounded-lg' required id='return-time'
                min={getMinReturnTime()} />
            </div>
          </div>

          <button type='submit' className='w-full bg-blue-500 font-medium text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer'>
            Book Now
          </button>
          <p className='text-center text-sm'>No credit card required to reserve</p>

        </motion.form>
      </div>

      {showBookingProfileModal && (
        <div
          className='fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 py-8'
          onClick={closeBookingProfileModal}
        >
          <form
            onSubmit={handleBookingProfileSubmit}
            onClick={(event) => event.stopPropagation()}
            className='w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'
          >
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Booking details</p>
            <h3 className='mt-2 text-2xl font-semibold text-slate-900'>Complete renter verification</h3>
            <p className='mt-2 text-sm text-slate-600'>Please provide valid details and documents before confirming this booking.</p>

            <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
              <label className='text-sm font-medium text-slate-700'>
                Full Name
                <input
                  required
                  type='text'
                  value={bookingProfile.renterName}
                  onChange={(e) => setBookingProfile((prev) => ({ ...prev, renterName: e.target.value }))}
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Email
                <input
                  required
                  type='email'
                  value={bookingProfile.renterEmail}
                  onChange={(e) => setBookingProfile((prev) => ({ ...prev, renterEmail: e.target.value }))}
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Mobile Number
                <input
                  required
                  type='tel'
                  value={bookingProfile.renterPhone}
                  onChange={(e) => setBookingProfile((prev) => ({ ...prev, renterPhone: e.target.value }))}
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Driving License Number
                <input
                  required
                  type='text'
                  value={bookingProfile.drivingLicenseNumber}
                  onChange={(e) => setBookingProfile((prev) => ({ ...prev, drivingLicenseNumber: e.target.value }))}
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Emergency Contact Name
                <input
                  type='text'
                  value={bookingProfile.emergencyContactName}
                  onChange={(e) => setBookingProfile((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Emergency Contact Phone
                <input
                  type='tel'
                  value={bookingProfile.emergencyContactPhone}
                  onChange={(e) => setBookingProfile((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                />
              </label>
            </div>

            <label className='mt-4 block text-sm font-medium text-slate-700'>
              Driving License Document (required)
              <input
                required
                type='file'
                accept='image/*,.pdf'
                onChange={(e) => setDrivingLicenseDocument(e.target.files?.[0] || null)}
                className='mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium'
              />
            </label>

            <label className='mt-4 block text-sm font-medium text-slate-700'>
              Additional Document (optional)
              <input
                type='file'
                accept='image/*,.pdf'
                onChange={(e) => setAdditionalDocument(e.target.files?.[0] || null)}
                className='mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium'
              />
            </label>

            <label className='mt-4 block text-sm font-medium text-slate-700'>
              Additional Notes (optional)
              <textarea
                value={bookingProfile.notes}
                onChange={(e) => setBookingProfile((prev) => ({ ...prev, notes: e.target.value }))}
                className='mt-2 h-20 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                placeholder='Any special pickup instructions...'
              />
            </label>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                type='button'
                onClick={closeBookingProfileModal}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmittingBooking}
                className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70'
              >
                {isSubmittingBooking ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  ) : <Loader />
}

export default CarDetails
