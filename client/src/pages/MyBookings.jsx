import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react';

const MyBookings = () => {

  const { axios, user, currency } = useAppContext();

  const [bookings, setBookings] = useState([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [feedbackType, setFeedbackType] = useState('review')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openFeedbackModal = (bookingId) => {
    setSelectedBookingId(bookingId)
    setFeedbackType('review')
    setFeedbackRating(5)
    setFeedbackMessage('')
    setShowFeedbackModal(true)
  }

  const closeFeedbackModal = () => {
    if (isSubmittingFeedback) return
    setShowFeedbackModal(false)
    setSelectedBookingId('')
    setFeedbackType('review')
    setFeedbackRating(5)
    setFeedbackMessage('')
  }

  const submitOwnerFeedback = async (event) => {
    event.preventDefault()
    try {
      if (!feedbackMessage.trim()) {
        toast.error('Please enter feedback message')
        return
      }
      setIsSubmittingFeedback(true)
      const payload = {
        bookingId: selectedBookingId,
        type: feedbackType,
        rating: feedbackType === 'review' ? feedbackRating : null,
        message: feedbackMessage.trim(),
      }
      const { data } = await axios.post('/api/bookings/user/feedback', payload)
      if (data.success) {
        toast.success(data.message)
        closeFeedbackModal()
        fetchMyBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  useEffect(() => {
    user && fetchMyBookings()
  }, [user])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'
    >
      <Title title='My Bookings' subTitle='View and manage your car bookings' align="left" />

      <div>
        {bookings.map((booking, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            key={booking._id}
            className='grid grid-cols-1 md:grid-cols-4 gap-6 border border-gray-200 rounded-lg p-6 mt-5 first:mt-12'
          >
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img src={booking.car.image} alt="" className='w-full h-auto aspect-video object-cover' />
              </div>
              <p className='text-lg font-medium mt-2'>{booking.car.brand} {booking.car.model}</p>
              <p className='text-gray-500'>{booking.car.year} {booking.car.category} {booking.car.location}</p>
            </div>

            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p>
                <p className={`px-3 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-400/15 text-green-600' : 'bg-red-400/15 text-red-600'}`}>{booking.status}</p>
              </div>

              <div className='flex items-start mt-3 gap-2'>
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Rental Period</p>
                  <p>{booking.pickupDate.split('T')[0]} {booking.pickupTime || '10:00'} to {booking.returnDate.split('T')[0]} {booking.returnTime || '10:00'}</p>
                </div>
              </div>

              <div className='flex items-start mt-3 gap-2'>
                <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Pick-up Location</p>
                  <p>{booking.car.location}</p>
                  {booking.car.preciseLocation ? <p className='text-xs text-gray-500 mt-1'>{booking.car.preciseLocation}</p> : null}
                </div>
              </div>

              {booking.ownerFeedback ? (
                <div className='mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3'>
                  <p className='text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700'>Submitted {booking.ownerFeedback.type}</p>
                  {booking.ownerFeedback.rating ? <p className='text-sm text-emerald-900 mt-1'>Rating: {booking.ownerFeedback.rating}/5</p> : null}
                  <p className='text-sm text-emerald-900 mt-1'>{booking.ownerFeedback.message}</p>
                </div>
              ) : null}
            </div>

            <div className='md:col-span-1 flex flex-col justify-between gap-6'>
              <div className='text-sm text-gray-500 text-right'>
                <p className='text-gray-500'>Total Price</p>
                <h1 className='text-2xl font-semibold text-[#185a9d]'>{currency}{booking.price}</h1>
                <p>Booked on {booking.createdAt.split('T')[0]}</p>
              </div>

              {booking.status === 'confirmed' && !booking.ownerFeedback ? (
                <button
                  type='button'
                  onClick={() => openFeedbackModal(booking._id)}
                  className='rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white'
                >
                  Add Owner Review / Complaint
                </button>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      {showFeedbackModal && (
        <div className='fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 py-8' onClick={closeFeedbackModal}>
          <form
            onClick={(event) => event.stopPropagation()}
            onSubmit={submitOwnerFeedback}
            className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'
          >
            <h3 className='text-xl font-semibold text-slate-900'>Owner Feedback</h3>
            <p className='mt-2 text-sm text-slate-600'>Share your experience or report an issue with this owner.</p>

            <label className='mt-4 block text-sm font-medium text-slate-700'>
              Feedback type
              <select
                value={feedbackType}
                onChange={(event) => setFeedbackType(event.target.value)}
                className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
              >
                <option value="review">Review</option>
                <option value="complaint">Complaint</option>
              </select>
            </label>

            {feedbackType === 'review' ? (
              <label className='mt-4 block text-sm font-medium text-slate-700'>
                Rating
                <select
                  value={feedbackRating}
                  onChange={(event) => setFeedbackRating(Number(event.target.value))}
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Bad</option>
                </select>
              </label>
            ) : null}

            <label className='mt-4 block text-sm font-medium text-slate-700'>
              Message
              <textarea
                value={feedbackMessage}
                onChange={(event) => setFeedbackMessage(event.target.value)}
                className='mt-2 h-28 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                placeholder={feedbackType === 'complaint' ? 'Describe the issue clearly...' : 'Tell us about your owner experience...'}
                required
              />
            </label>

            <div className='mt-6 flex justify-end gap-3'>
              <button type='button' onClick={closeFeedbackModal} className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700'>Cancel</button>
              <button type='submit' disabled={isSubmittingFeedback} className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-70'>
                {isSubmittingFeedback ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  )
}

export default MyBookings
