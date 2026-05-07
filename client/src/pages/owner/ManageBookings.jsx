import React, { useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageBookings = () => {

  const { axios, currency } = useAppContext()

  const [bookings, setBookings] = useState([])

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/owner')
      data.success ? setBookings(data.bookings) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }
  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post('/api/bookings/owner/change-status', { bookingId, status })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
  }, [])
  return (
    <div className='w-full px-4 pt-8 sm:px-6 md:px-8 lg:px-10'>

      <Title title="Manage Bookings" subTitle="Track all customer bookings" />

      <div className='mt-6 w-full max-w-6xl overflow-x-auto rounded-2xl border border-gray-300 bg-white shadow-sm'>
        <table className='min-w-[920px] w-full border-collapse text-left text-gray-700 text-sm'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Date Range</th>
              <th className='p-3 font-medium max-md:hidden'>Renter Details</th>
              <th className='p-3 font-medium'>Total</th>
              <th className='p-3 font-medium max-md:hidden'>Payment</th>
              <th className='p-3 font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className='border-t border-gray-300 hover:bg-gray-50 text-gray-700'>
                <td className='p-3 flex items-center gap-3'>
                  <img src={booking.car.image} alt="" className='w-12 h-12 aspect-square object-cover rounded-md' />
                  <p className='font-medium max-md:hidden'>{booking.car.brand} {booking.car.model}</p>
                </td>
                <td className='p-3 max-md:hidden'>
                  {booking.pickupDate.split('T')[0]} {booking.pickupTime || '10:00'} to {booking.returnDate.split('T')[0]} {booking.returnTime || '10:00'}
                </td>
                <td className='p-3 max-md:hidden'>
                  <p className='font-medium text-gray-800'>{booking.renterDetails?.name || booking.user?.name || 'N/A'}</p>
                  <p className='text-xs text-gray-500'>{booking.renterDetails?.email || booking.user?.email || 'N/A'}</p>
                  <p className='text-xs text-gray-500'>{booking.renterDetails?.mobileNumber || 'N/A'}</p>
                  <p className='text-xs text-gray-500 mt-1'>DL: {booking.renterDetails?.drivingLicenseNumber || 'N/A'}</p>
                  {booking.renterDocuments?.drivingLicenseDocument ? (
                    <a
                      href={booking.renterDocuments.drivingLicenseDocument}
                      target='_blank'
                      rel='noreferrer'
                      className='text-xs text-blue-600 underline'
                    >
                      View License
                    </a>
                  ) : null}
                </td>
                <td className='p-3'>{currency}{booking.price}</td>
                <td className='p-3 max-md:hidden'>
                  <span className='bg-gray-100 px-3 py-1 rounded-md text-xs'>offline</span>
                </td>
                <td className='p-3'>{booking.status === 'pending' ? (
                  <select onChange={e => changeBookingStatus(booking._id, e.target.value)} value={booking.status} className='border border-gray-300 rounded-md px-2 py-1.5 mt-1 text-gray-500 text-sm outline-none'>
                    <option value="pending">Pending</option>
                    <option value="canceled">Canceled</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                ) : (<span className={`px-3 py-1 rounded-md text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>{booking.status}</span>)
                }</td>

              </tr>
            ))}
          </tbody>
        </table>


      </div>

    </div>
  )
}

export default ManageBookings
