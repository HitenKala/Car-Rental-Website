import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const UserDetails = () => {
    const { id } = useParams()
    const { axios, currency } = useAppContext()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [userData, setUserData] = useState(null)
    const [stats, setStats] = useState(null)
    const [recentBookings, setRecentBookings] = useState([])
    const [submittedFeedbacks, setSubmittedFeedbacks] = useState([])
    const [monthlyActivity, setMonthlyActivity] = useState([])

    const fetchUserDetails = async () => {
        try {
            setLoading(true)
            setError('')
            const { data } = await axios.get(`/api/admin/users/${id}`)
            if (data.success) {
                setUserData(data.user)
                setStats(data.stats)
                setRecentBookings(data.recentBookings || [])
                setSubmittedFeedbacks(data.submittedFeedbacks || [])
                setMonthlyActivity(data.monthlyActivity || [])
            } else {
                setError(data.message || 'Failed to load user details')
            }
        } catch (fetchError) {
            setError(fetchError.message || 'Failed to load user details')
            toast.error(fetchError.message || 'Failed to load user details')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserDetails()
    }, [id])

    const statCards = useMemo(() => {
        if (!stats) return []
        return [
            { label: 'Total Bookings', value: stats.totalBookings },
            { label: 'Confirmed', value: stats.confirmedBookings },
            { label: 'Pending', value: stats.pendingBookings },
            { label: 'Canceled', value: stats.canceledBookings },
            { label: 'Total Spent', value: `${currency}${stats.totalSpent}` },
            { label: 'Avg Booking Value', value: `${currency}${stats.averageBookingValue}` },
            { label: 'Feedback Submitted', value: stats.submittedFeedbacks },
            { label: 'Account Role', value: userData?.role || 'user' },
        ]
    }, [stats, currency, userData])

    if (loading) {
        return <div className='w-full px-4 pt-8 sm:px-6 md:px-8 lg:px-10 text-slate-500'>Loading user details...</div>
    }

    if (error || !userData || !stats) {
        return (
            <div className='w-full px-4 pt-8 sm:px-6 md:px-8 lg:px-10'>
                <p className='text-rose-600'>{error || 'User details unavailable'}</p>
                <Link to='/admin/users' className='mt-4 inline-block text-blue-600 underline'>Back to users</Link>
            </div>
        )
    }

    return (
        <div className='w-full px-4 pt-8 pb-10 sm:px-6 md:px-8 lg:px-10'>
            <Title title='User Details' subTitle='Profile, bookings, driving license, and renter behavior' />
            <Link to='/admin/users' className='mt-3 inline-block text-sm font-medium text-blue-600 underline'>
                Back to Manage Users
            </Link>

            <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6'>
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div className='flex items-center gap-4'>
                        <img src={userData.image || assets.user_profile} alt='User profile' className='h-16 w-16 rounded-2xl object-cover' />
                        <div>
                            <p className='text-xl font-semibold text-slate-900'>{userData.name}</p>
                            <p className='text-sm text-slate-500'>{userData.email}</p>
                            <span className='mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700'>
                                {userData.role}
                            </span>
                        </div>
                    </div>
                    <div className='text-sm text-slate-600'>
                        <p><span className='font-medium text-slate-800'>Driving License Number:</span> {userData.drivingLicenseNumber || '-'}</p>
                        <p className='mt-1'>
                            <span className='font-medium text-slate-800'>Driving License Document:</span>{' '}
                            {userData.drivingLicenseDocument ? (
                                <a href={userData.drivingLicenseDocument} target='_blank' rel='noreferrer' className='text-blue-600 underline'>Open</a>
                            ) : '-'}
                        </p>
                        <p className='mt-1'><span className='font-medium text-slate-800'>Member Since:</span> {new Date(userData.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4'>
                {statCards.map((card) => (
                    <div key={card.label} className='rounded-2xl border border-slate-200 bg-white px-4 py-4'>
                        <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>{card.label}</p>
                        <p className='mt-2 text-2xl font-semibold text-slate-900'>{card.value}</p>
                    </div>
                ))}
            </div>

            <div className='mt-8 rounded-2xl border border-slate-200 bg-white p-5'>
                <p className='text-lg font-semibold text-slate-900'>Monthly Activity</p>
                <p className='mt-1 text-sm text-slate-500'>Bookings and spending trend (last 12 months)</p>
                <div className='mt-4 overflow-x-auto'>
                    <table className='w-full min-w-[620px] text-left text-sm'>
                        <thead className='text-slate-500'>
                            <tr>
                                <th className='px-4 py-2 font-medium'>Month</th>
                                <th className='px-4 py-2 font-medium'>Bookings</th>
                                <th className='px-4 py-2 font-medium'>Spend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyActivity.length === 0 ? (
                                <tr><td className='px-4 py-3 text-slate-500' colSpan={3}>No activity yet.</td></tr>
                            ) : monthlyActivity.map((item) => (
                                <tr key={item.monthKey} className='border-t border-slate-200'>
                                    <td className='px-4 py-3'>{item.label}</td>
                                    <td className='px-4 py-3'>{item.bookings}</td>
                                    <td className='px-4 py-3'>{currency}{item.spend}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='mt-8 rounded-2xl border border-slate-200 bg-white'>
                <div className='border-b border-slate-200 px-5 py-4'>
                    <p className='text-lg font-semibold text-slate-900'>Recent Bookings</p>
                </div>
                <div className='overflow-x-auto'>
                    <table className='w-full min-w-[820px] text-left text-sm'>
                        <thead className='text-slate-500'>
                            <tr>
                                <th className='px-5 py-3 font-medium'>Car</th>
                                <th className='px-5 py-3 font-medium'>Owner</th>
                                <th className='px-5 py-3 font-medium'>Dates</th>
                                <th className='px-5 py-3 font-medium'>Status</th>
                                <th className='px-5 py-3 font-medium'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr><td className='px-5 py-4 text-slate-500' colSpan={5}>No bookings yet.</td></tr>
                            ) : recentBookings.map((booking) => (
                                <tr key={booking._id} className='border-t border-slate-200'>
                                    <td className='px-5 py-3'>{booking.car?.brand} {booking.car?.model}</td>
                                    <td className='px-5 py-3'>{booking.owner?.name || 'Unknown'}</td>
                                    <td className='px-5 py-3'>{new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}</td>
                                    <td className='px-5 py-3 capitalize'>{booking.status}</td>
                                    <td className='px-5 py-3'>{currency}{booking.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='mt-8 rounded-2xl border border-slate-200 bg-white'>
                <div className='border-b border-slate-200 px-5 py-4'>
                    <p className='text-lg font-semibold text-slate-900'>Submitted Reviews / Complaints</p>
                </div>
                <div className='overflow-x-auto'>
                    <table className='w-full min-w-[820px] text-left text-sm'>
                        <thead className='text-slate-500'>
                            <tr>
                                <th className='px-5 py-3 font-medium'>Owner</th>
                                <th className='px-5 py-3 font-medium'>Type</th>
                                <th className='px-5 py-3 font-medium'>Rating</th>
                                <th className='px-5 py-3 font-medium'>Message</th>
                                <th className='px-5 py-3 font-medium'>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submittedFeedbacks.length === 0 ? (
                                <tr><td className='px-5 py-4 text-slate-500' colSpan={5}>No feedback submitted yet.</td></tr>
                            ) : submittedFeedbacks.map((item) => (
                                <tr key={item._id} className='border-t border-slate-200'>
                                    <td className='px-5 py-3'>{item.owner?.name || 'Unknown'}</td>
                                    <td className='px-5 py-3 capitalize'>{item.type}</td>
                                    <td className='px-5 py-3'>{item.rating ? `${item.rating}/5` : '-'}</td>
                                    <td className='px-5 py-3'>{item.message}</td>
                                    <td className='px-5 py-3'>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default UserDetails
