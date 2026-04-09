import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageBookings = () => {

    const { axios, currency, isAdmin } = useAppContext()

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchBookings = async () => {
        try {
            setLoading(true)
            setError('')
            const { data } = await axios.get('/api/admin/bookings')
            console.log('Admin bookings response:', data)
            if (data.success) {
                console.log('Full bookings data:', JSON.stringify(data.bookings.slice(0, 2), null, 2))
                console.log('Bookings with car data:', data.bookings.map((b, idx) => ({
                    bookingIdx: idx,
                    carExists: !!b.car,
                    carBrand: b.car?.brand,
                    carModel: b.car?.model,
                    carImage: b.car?.image,
                    carImageLength: b.car?.image?.length || 0,
                    carImagePreview: b.car?.image?.substring(0, 50)
                })))
                setBookings(data.bookings)
            } else {
                setError(data.message || 'Failed to fetch bookings')
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
            setError(error.message || 'Error fetching bookings')
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const changeBookingStatus = async (bookingId, status) => {
        try {
            const { data } = await axios.post(`/api/admin/bookings/${bookingId}/status`, { status })
            if (data.success) {
                toast.success(data.message)
                fetchBookings()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchBookings()
        }
    }, [isAdmin])

    return (
        <div className='px-4 pt-10 md:px-10 w-full'>

            <Title title="Manage Bookings" subTitle="Track all bookings on the platform" />

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4'>
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {loading && (
                <div className='flex items-center justify-center h-40'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                        <p className='text-gray-600'>Loading bookings...</p>
                    </div>
                </div>
            )}

            {!loading && bookings.length === 0 && !error && (
                <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4'>
                    <p>No bookings found in the system.</p>
                </div>
            )}

            {!loading && bookings.length > 0 && (
                <div className='max-w-6xl w-full rounded-md mt-6 overflow-hidden border border-gray-300'>
                    <table className='w-full border-collapse text-left text-gray-700 text-sm'>
                        <thead className='text-gray-500'>
                            <tr>
                                <th className='p-3 font-medium'>Car</th>
                                <th className='p-3 font-medium'>User</th>
                                <th className='p-3 font-medium'>Owner</th>
                                <th className='p-3 font-medium max-md:hidden'>Date Range</th>
                                <th className='p-3 font-medium max-md:hidden'>Renter Details</th>
                                <th className='p-3 font-medium'>Total</th>
                                <th className='p-3 font-medium'>Status</th>
                                <th className='p-3 font-medium'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={index} className='border-t border-gray-300 hover:bg-gray-50 text-gray-700'>
                                    <td className='p-3 flex items-center gap-3'>
                                        <div className='w-12 h-12 aspect-square bg-gray-200 rounded-md flex items-center justify-center overflow-hidden'>
                                            {booking.car?.image ? (
                                                <img
                                                    src={booking.car.image}
                                                    alt={`${booking.car?.brand} ${booking.car?.model}`}
                                                    className='w-full h-full object-cover'
                                                    onError={(e) => {
                                                        console.warn('Image failed to load:', booking.car?.image)
                                                        e.target.style.display = 'none'
                                                        e.target.parentElement.innerHTML = '<span className="text-xs text-gray-500">No image</span>'
                                                    }}
                                                />
                                            ) : (
                                                <span className='text-xs text-gray-500'>No image</span>
                                            )}
                                        </div>
                                        <p className='font-medium max-md:hidden'>{booking.car?.brand} {booking.car?.model}</p>
                                    </td>
                                    <td className='p-3'>{booking.user?.name || 'Unknown'}</td>
                                    <td className='p-3'>{booking.owner?.name || 'Unknown'}</td>
                                    <td className='p-3 max-md:hidden'>
                                        {booking.pickupDate?.split('T')[0] || 'N/A'} {booking.pickupTime || '10:00'} to {booking.returnDate?.split('T')[0] || 'N/A'} {booking.returnTime || '10:00'}
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
                                    <td className='p-3'>
                                        <span className={`px-3 py-1 rounded-md text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-500' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-500' : 'bg-red-100 text-red-500'}`}>{booking.status}</span>
                                    </td>
                                    <td className='p-3'>
                                        {booking.status === 'pending' ? (
                                            <select onChange={e => changeBookingStatus(booking._id, e.target.value)} value={booking.status} className='border border-gray-300 rounded-md px-2 py-1.5 mt-1 text-gray-500 text-sm outline-none'>
                                                <option value="pending">Pending</option>
                                                <option value="canceled">Canceled</option>
                                                <option value="confirmed">Confirmed</option>
                                            </select>
                                        ) : (
                                            <span className='text-gray-400'>No actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    )
}

export default ManageBookings
