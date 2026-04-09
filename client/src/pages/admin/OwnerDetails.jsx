import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const OwnerMiniChart = ({ data = [], currency = '$' }) => {
    const chartData = data.length
        ? data
        : [
            { label: 'Jan', bookings: 0, revenue: 0, confirmedBookings: 0, pendingBookings: 0, canceledBookings: 0 },
            { label: 'Feb', bookings: 0, revenue: 0, confirmedBookings: 0, pendingBookings: 0, canceledBookings: 0 },
            { label: 'Mar', bookings: 0, revenue: 0, confirmedBookings: 0, pendingBookings: 0, canceledBookings: 0 },
            { label: 'Apr', bookings: 0, revenue: 0, confirmedBookings: 0, pendingBookings: 0, canceledBookings: 0 },
            { label: 'May', bookings: 0, revenue: 0, confirmedBookings: 0, pendingBookings: 0, canceledBookings: 0 },
            { label: 'Jun', bookings: 0, revenue: 0, confirmedBookings: 0, pendingBookings: 0, canceledBookings: 0 },
        ]

    const width = 640
    const height = 230
    const paddingX = 36
    const paddingTop = 22
    const paddingBottom = 34
    const graphHeight = height - paddingTop - paddingBottom
    const graphWidth = width - paddingX * 2

    const maxBookings = Math.max(...chartData.map((item) => item.bookings), 1)
    const maxRevenue = Math.max(...chartData.map((item) => item.revenue), 1)

    const [hoveredLinePoint, setHoveredLinePoint] = useState(null)
    const [hoveredBarPoint, setHoveredBarPoint] = useState(null)

    const points = chartData.map((item, index) => {
        const x = paddingX + (graphWidth / Math.max(chartData.length - 1, 1)) * index
        const y = paddingTop + graphHeight - (item.bookings / maxBookings) * graphHeight
        return { ...item, x, y }
    })

    const path = points.map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
    const areaPath = `${path} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`

    return (
        <div className='grid gap-4 xl:grid-cols-2'>
            <div className='rounded-2xl border border-slate-200 bg-white p-4'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                    <div>
                        <p className='text-sm font-semibold text-slate-900'>Bookings Trend</p>
                        <p className='text-xs text-slate-500'>Hover points for exact values</p>
                    </div>
                    <span className='rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600'>Monthly</span>
                </div>

                {hoveredLinePoint && (
                    <div className='mb-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-800'>
                        <p className='font-semibold'>{hoveredLinePoint.label}</p>
                        <p>Bookings: {hoveredLinePoint.bookings}</p>
                        <p>Confirmed: {hoveredLinePoint.confirmedBookings}</p>
                    </div>
                )}

                <div className='overflow-x-auto'>
                    <svg viewBox={`0 0 ${width} ${height}`} className='min-w-[560px]'>
                        {[0, 1, 2, 3, 4].map((step) => {
                            const y = paddingTop + (graphHeight / 4) * step
                            return <line key={step} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />
                        })}
                        <path d={areaPath} fill="url(#ownerBookingArea)" opacity="0.9" />
                        <path d={path} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                        {points.map((point) => (
                            <g key={point.label}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="5"
                                    fill="#fff"
                                    stroke="#4f46e5"
                                    strokeWidth="2.5"
                                    className='cursor-pointer'
                                    onMouseEnter={() => setHoveredLinePoint(point)}
                                    onMouseLeave={() => setHoveredLinePoint(null)}
                                />
                                <text x={point.x} y={height - 10} textAnchor="middle" fontSize="11" fill="#64748b">{point.label}</text>
                            </g>
                        ))}
                        <defs>
                            <linearGradient id="ownerBookingArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.42" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.06" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <div className='rounded-2xl border border-slate-200 bg-white p-4'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                    <div>
                        <p className='text-sm font-semibold text-slate-900'>Revenue Trend</p>
                        <p className='text-xs text-slate-500'>Hover bars for exact values</p>
                    </div>
                    <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600'>Confirmed</span>
                </div>

                {hoveredBarPoint && (
                    <div className='mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800'>
                        <p className='font-semibold'>{hoveredBarPoint.label}</p>
                        <p>Revenue: {currency}{hoveredBarPoint.revenue}</p>
                        <p>Pending: {hoveredBarPoint.pendingBookings}</p>
                        <p>Canceled: {hoveredBarPoint.canceledBookings}</p>
                    </div>
                )}

                <div className='grid grid-cols-6 gap-2 pt-2'>
                    {chartData.map((item) => {
                        const barHeight = Math.max((item.revenue / maxRevenue) * 130, 6)
                        return (
                            <div key={item.label} className='flex flex-col items-center justify-end'>
                                <div
                                    className='w-full cursor-pointer rounded-t-md bg-emerald-500/80 transition-all hover:bg-emerald-500'
                                    style={{ height: `${barHeight}px` }}
                                    onMouseEnter={() => setHoveredBarPoint(item)}
                                    onMouseLeave={() => setHoveredBarPoint(null)}
                                />
                                <p className='mt-2 text-[11px] text-slate-500'>{item.label}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const OwnerDetails = () => {
    const { id } = useParams()
    const { axios, currency } = useAppContext()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [owner, setOwner] = useState(null)
    const [stats, setStats] = useState(null)
    const [cars, setCars] = useState([])
    const [recentBookings, setRecentBookings] = useState([])
    const [recentFeedbacks, setRecentFeedbacks] = useState([])
    const [monthlyPerformance, setMonthlyPerformance] = useState([])
    const [monthRange, setMonthRange] = useState(6)

    const fetchOwnerDetails = async () => {
        try {
            setLoading(true)
            setError('')
            const { data } = await axios.get(`/api/admin/owners/${id}`)
            if (data.success) {
                setOwner(data.owner)
                setStats(data.stats)
                setCars(data.cars || [])
                setRecentBookings(data.recentBookings || [])
                setRecentFeedbacks(data.recentFeedbacks || [])
                setMonthlyPerformance(data.monthlyPerformance || [])
            } else {
                setError(data.message || 'Failed to load owner details')
            }
        } catch (fetchError) {
            setError(fetchError.message || 'Failed to load owner details')
            toast.error(fetchError.message || 'Failed to load owner details')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOwnerDetails()
    }, [id])

    const filteredMonthlyPerformance = useMemo(() => {
        if (!monthlyPerformance.length) return []
        return monthlyPerformance.slice(-monthRange)
    }, [monthlyPerformance, monthRange])

    const exportMonthlyCsv = () => {
        const rows = filteredMonthlyPerformance.length ? filteredMonthlyPerformance : []
        if (!rows.length) {
            toast.error('No analytics data available to export')
            return
        }

        const csvHeader = [
            'Month',
            'Total Bookings',
            'Confirmed Bookings',
            'Pending Bookings',
            'Canceled Bookings',
            'Revenue',
        ]

        const csvRows = rows.map((row) => ([
            row.monthKey || row.label,
            row.bookings,
            row.confirmedBookings ?? 0,
            row.pendingBookings ?? 0,
            row.canceledBookings ?? 0,
            row.revenue,
        ]))

        const csvText = [csvHeader, ...csvRows].map((line) => line.join(',')).join('\n')
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const safeName = (owner?.name || 'owner').replace(/\s+/g, '-').toLowerCase()
        link.setAttribute('href', url)
        link.setAttribute('download', `${safeName}-analytics-${monthRange}m.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className='px-4 pt-10 md:px-10 w-full'>
                <p className='text-slate-500'>Loading owner details...</p>
            </div>
        )
    }

    if (error || !owner || !stats) {
        return (
            <div className='px-4 pt-10 md:px-10 w-full'>
                <p className='text-rose-600'>{error || 'Owner details unavailable'}</p>
                <Link to='/admin/owners' className='mt-4 inline-block text-blue-600 underline'>Back to owners</Link>
            </div>
        )
    }

    const statusColor = owner.ownerVerificationStatus === 'approved'
        ? 'bg-emerald-100 text-emerald-700'
        : owner.ownerVerificationStatus === 'pending'
            ? 'bg-amber-100 text-amber-700'
            : owner.ownerVerificationStatus === 'rejected'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 text-slate-700'

    const statCards = [
        { label: 'Total Revenue', value: `${currency}${stats.totalRevenue}` },
        { label: 'Total Bookings', value: stats.totalBookings },
        { label: 'Confirmed Trips', value: stats.confirmedBookings },
        { label: 'Pending Trips', value: stats.pendingBookings },
        { label: 'Canceled Trips', value: stats.canceledBookings },
        { label: 'Fleet Size', value: stats.totalCars },
        { label: 'Cars Available', value: stats.availableCars },
        { label: 'Avg Booking Value', value: `${currency}${stats.averageBookingValue}` },
        { label: 'Owner Rating', value: stats.averageOwnerRating ? `${stats.averageOwnerRating}/5` : 'N/A' },
        { label: 'Complaints', value: stats.complaintsCount ?? 0 },
        { label: 'Feedback Entries', value: stats.totalFeedbacks ?? 0 },
    ]

    return (
        <div className='px-4 pt-10 md:px-10 w-full pb-10'>
            <Title title='Owner Details' subTitle='Performance, bookings, and compliance profile' />
            <Link to='/admin/owners' className='mt-3 inline-block text-sm font-medium text-blue-600 underline'>
                Back to Manage Owners
            </Link>

            <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-5'>
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div className='flex items-center gap-4'>
                        <img src={owner.image || assets.user_profile} alt='Owner profile' className='h-16 w-16 rounded-2xl object-cover' />
                        <div>
                            <p className='text-xl font-semibold text-slate-900'>{owner.name}</p>
                            <p className='text-sm text-slate-500'>{owner.email}</p>
                            <div className='mt-2 flex flex-wrap items-center gap-2'>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                                    {owner.ownerVerificationStatus || 'none'}
                                </span>
                                <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>
                                    Role: {owner.role}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='text-sm text-slate-600'>
                        <p><span className='font-medium text-slate-800'>RC Number:</span> {owner.ownerRegistrationNumber || '-'}</p>
                        <p className='mt-1'>
                            <span className='font-medium text-slate-800'>RC Document:</span>{' '}
                            {owner.ownerRegistrationDocument ? (
                                <a href={owner.ownerRegistrationDocument} target='_blank' rel='noreferrer' className='text-blue-600 underline'>Open</a>
                            ) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                {statCards.map((card) => (
                    <div key={card.label} className='rounded-2xl border border-slate-200 bg-white px-4 py-4'>
                        <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>{card.label}</p>
                        <p className='mt-2 text-2xl font-semibold text-slate-900'>{card.value}</p>
                    </div>
                ))}
            </div>

            <div className='mt-8 rounded-2xl border border-slate-200 bg-white p-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                        {[3, 6, 12].map((range) => (
                            <button
                                key={range}
                                type='button'
                                onClick={() => setMonthRange(range)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${monthRange === range ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                {range}M
                            </button>
                        ))}
                    </div>
                    <button
                        type='button'
                        onClick={exportMonthlyCsv}
                        className='rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white'
                    >
                        Export CSV
                    </button>
                </div>
                <div className='mt-4'>
                    <OwnerMiniChart data={filteredMonthlyPerformance} currency={currency} />
                </div>
            </div>

            <div className='mt-8 rounded-2xl border border-slate-200 bg-white'>
                <div className='border-b border-slate-200 px-5 py-4'>
                    <p className='text-lg font-semibold text-slate-900'>Recent Bookings</p>
                </div>
                <div className='overflow-x-auto'>
                    <table className='w-full min-w-[780px] text-left text-sm'>
                        <thead className='text-slate-500'>
                            <tr>
                                <th className='px-5 py-3 font-medium'>Car</th>
                                <th className='px-5 py-3 font-medium'>Customer</th>
                                <th className='px-5 py-3 font-medium'>Dates</th>
                                <th className='px-5 py-3 font-medium'>Status</th>
                                <th className='px-5 py-3 font-medium'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td className='px-5 py-4 text-slate-500' colSpan={5}>No bookings yet.</td>
                                </tr>
                            ) : (
                                recentBookings.map((booking) => (
                                    <tr key={booking._id} className='border-t border-slate-200'>
                                        <td className='px-5 py-3'>
                                            {booking.car?.brand} {booking.car?.model}
                                        </td>
                                        <td className='px-5 py-3'>
                                            {booking.user?.name || 'Unknown'}
                                        </td>
                                        <td className='px-5 py-3'>
                                            {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                                        </td>
                                        <td className='px-5 py-3 capitalize'>{booking.status}</td>
                                        <td className='px-5 py-3'>{currency}{booking.price}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='mt-8 rounded-2xl border border-slate-200 bg-white'>
                <div className='border-b border-slate-200 px-5 py-4'>
                    <p className='text-lg font-semibold text-slate-900'>Owner Feedback & Complaints</p>
                </div>
                <div className='overflow-x-auto'>
                    <table className='w-full min-w-[760px] text-left text-sm'>
                        <thead className='text-slate-500'>
                            <tr>
                                <th className='px-5 py-3 font-medium'>User</th>
                                <th className='px-5 py-3 font-medium'>Type</th>
                                <th className='px-5 py-3 font-medium'>Rating</th>
                                <th className='px-5 py-3 font-medium'>Message</th>
                                <th className='px-5 py-3 font-medium'>Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentFeedbacks.length === 0 ? (
                                <tr>
                                    <td className='px-5 py-4 text-slate-500' colSpan={5}>No feedback submitted yet.</td>
                                </tr>
                            ) : (
                                recentFeedbacks.map((feedback) => (
                                    <tr key={feedback._id} className='border-t border-slate-200'>
                                        <td className='px-5 py-3'>{feedback.user?.name || 'Unknown'}</td>
                                        <td className='px-5 py-3'>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${feedback.type === 'complaint' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {feedback.type}
                                            </span>
                                        </td>
                                        <td className='px-5 py-3'>{feedback.rating ? `${feedback.rating}/5` : '-'}</td>
                                        <td className='px-5 py-3'>{feedback.message}</td>
                                        <td className='px-5 py-3'>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='mt-8 rounded-2xl border border-slate-200 bg-white'>
                <div className='border-b border-slate-200 px-5 py-4'>
                    <p className='text-lg font-semibold text-slate-900'>Fleet Snapshot</p>
                </div>
                <div className='overflow-x-auto'>
                    <table className='w-full min-w-[760px] text-left text-sm'>
                        <thead className='text-slate-500'>
                            <tr>
                                <th className='px-5 py-3 font-medium'>Car</th>
                                <th className='px-5 py-3 font-medium'>Location</th>
                                <th className='px-5 py-3 font-medium'>Price/Day</th>
                                <th className='px-5 py-3 font-medium'>Availability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.length === 0 ? (
                                <tr>
                                    <td className='px-5 py-4 text-slate-500' colSpan={4}>No listed cars.</td>
                                </tr>
                            ) : (
                                cars.map((car) => (
                                    <tr key={car._id} className='border-t border-slate-200'>
                                        <td className='px-5 py-3'>{car.brand} {car.model}</td>
                                        <td className='px-5 py-3'>{car.location}</td>
                                        <td className='px-5 py-3'>{currency}{car.pricePerDay}</td>
                                        <td className='px-5 py-3'>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${car.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {car.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OwnerDetails
