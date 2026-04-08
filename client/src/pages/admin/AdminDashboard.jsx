import React, { useEffect, useMemo, useState } from 'react'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const defaultDashboardData = {
    totalUsers: 0,
    totalOwners: 0,
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    availableCars: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    recentBookings: [],
    monthlyPerformance: [],
    topLocations: [],
}

const Chart = ({ data }) => {
    const chartData = data?.length
        ? data
        : [
            { label: 'Jan', bookings: 0 },
            { label: 'Feb', bookings: 0 },
            { label: 'Mar', bookings: 0 },
            { label: 'Apr', bookings: 0 },
        ]

    const maxValue = Math.max(...chartData.map((item) => item.bookings), 4)
    const width = 680
    const height = 250
    const paddingX = 36
    const paddingTop = 24
    const paddingBottom = 34
    const graphHeight = height - paddingTop - paddingBottom
    const graphWidth = width - paddingX * 2

    const points = chartData.map((item, index) => {
        const x = paddingX + (graphWidth / Math.max(chartData.length - 1, 1)) * index
        const y = paddingTop + graphHeight - (item.bookings / maxValue) * graphHeight
        return { ...item, x, y }
    })

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ')

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`

    return (
        <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='mb-5 flex items-center justify-between gap-4'>
                <div>
                    <p className='text-sm font-semibold text-slate-900'>Bookings / Month</p>
                    <p className='mt-1 text-sm text-slate-500'>Reservation volume trend across the latest six months</p>
                </div>
                <div className='rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600'>
                    Trend
                </div>
            </div>

            <div className='overflow-x-auto'>
                <svg viewBox={`0 0 ${width} ${height}`} className='min-w-[620px]'>
                    {[0, 1, 2, 3, 4].map((step) => {
                        const y = paddingTop + (graphHeight / 4) * step
                        const value = Math.round(maxValue - (maxValue / 4) * step)
                        return (
                            <g key={step}>
                                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />
                                <text x={8} y={y + 4} fontSize="11" fill="#94a3b8">{value}</text>
                            </g>
                        )
                    })}

                    <path d={areaPath} fill="url(#bookingArea)" opacity="0.85" />
                    <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

                    {points.map((point) => (
                        <g key={point.label}>
                            <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                            <text x={point.x} y={height - 10} textAnchor="middle" fontSize="11" fill="#64748b">
                                {point.label}
                            </text>
                        </g>
                    ))}

                    <defs>
                        <linearGradient id="bookingArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    )
}

const AdminDashboard = () => {
    const { axios, isAdmin, currency } = useAppContext()

    const [data, setData] = useState(defaultDashboardData)

    const metrics = useMemo(() => ([
        {
            title: 'Total Cars',
            value: data.totalCars,
            subtitle: `${data.availableCars} available right now`,
            icon: assets.carIconColored,
            accent: 'from-sky-500/12 to-cyan-500/12',
        },
        {
            title: 'Platform Revenue',
            value: `${currency}${Number(data.totalRevenue || 0).toLocaleString()}`,
            subtitle: `${data.confirmedBookings} confirmed bookings`,
            icon: assets.dashboardIconColored,
            accent: 'from-emerald-500/12 to-teal-500/12',
        },
        {
            title: 'Total Bookings',
            value: data.totalBookings,
            subtitle: `${data.pendingBookings} pending approval`,
            icon: assets.listIconColored,
            accent: 'from-indigo-500/12 to-violet-500/12',
        },
        {
            title: 'Active Owners',
            value: data.totalOwners,
            subtitle: `${data.totalUsers} registered renters`,
            icon: assets.users_icon,
            accent: 'from-amber-500/12 to-orange-500/12',
        },
    ]), [currency, data])

    const fetchDashboardData = async () => {
        try {
            const { data } = await axios.get('/api/admin/dashboard')
            if (data.success) {
                setData({ ...defaultDashboardData, ...data.data })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardData()
        }
    }, [isAdmin])

    return (
        <div className='px-5 py-6 md:px-8 lg:px-10'>
            <div className='mx-auto w-full max-w-[1480px] rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm md:px-8'>
                <div className='grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:items-start'>
                    <div>
                        <p className='text-sm font-semibold uppercase tracking-[0.24em] text-emerald-500'>Admin Dashboard</p>
                        <h1 className='mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl'>
                            Rental platform operations at a glance
                        </h1>
                        <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-500'>
                            Track fleet supply, booking momentum, partner activity, and the cities driving the most demand across Turbo Rides.
                        </p>
                    </div>

                    <div className='grid grid-cols-2 gap-4 self-start sm:grid-cols-3 2xl:grid-cols-1'>
                        <div className='rounded-2xl bg-slate-50 p-4'>
                            <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Occupancy</p>
                            <p className='mt-2 text-2xl font-semibold text-slate-900'>{data.occupancyRate}%</p>
                        </div>
                        <div className='rounded-2xl bg-slate-50 p-4'>
                            <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Pending</p>
                            <p className='mt-2 text-2xl font-semibold text-slate-900'>{data.pendingBookings}</p>
                        </div>
                        <div className='rounded-2xl bg-slate-50 p-4 col-span-2 sm:col-span-1'>
                            <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Cancelled</p>
                            <p className='mt-2 text-2xl font-semibold text-slate-900'>{data.cancelledBookings}</p>
                        </div>
                    </div>
                </div>

                <div className='mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
                    {metrics.map((metric) => (
                        <div key={metric.title} className='rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm'>
                            <div className='flex items-start justify-between gap-4'>
                                <div>
                                    <p className='text-sm text-slate-500'>{metric.title}</p>
                                    <p className='mt-3 text-3xl font-semibold tracking-tight text-slate-900'>{metric.value}</p>
                                    <p className='mt-2 text-sm text-slate-400'>{metric.subtitle}</p>
                                </div>
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.accent}`}>
                                    <img src={metric.icon} alt="" className='h-6 w-6' />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]'>
                    <Chart data={data.monthlyPerformance} />

                    <div className='space-y-6'>
                        <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-semibold text-slate-900'>Market Snapshot</p>
                                    <p className='mt-1 text-sm text-slate-500'>Top fleet locations by listed cars</p>
                                </div>
                                <img src={assets.location_icon_colored} alt="" className='h-5 w-5' />
                            </div>

                            <div className='mt-6 space-y-4'>
                                {data.topLocations.length === 0 && (
                                    <p className='text-sm text-slate-400'>No location data available yet.</p>
                                )}

                                {data.topLocations.map((location) => {
                                    const availability = location.cars ? Math.round((location.available / location.cars) * 100) : 0
                                    return (
                                        <div key={location.city} className='rounded-2xl bg-slate-50 p-4'>
                                            <div className='flex items-center justify-between'>
                                                <p className='font-medium text-slate-900'>{location.city}</p>
                                                <p className='text-sm text-slate-500'>{location.cars} cars</p>
                                            </div>
                                            <div className='mt-3 h-2 rounded-full bg-slate-200'>
                                                <div className='h-2 rounded-full bg-emerald-500' style={{ width: `${availability}%` }} />
                                            </div>
                                            <p className='mt-2 text-xs uppercase tracking-[0.18em] text-slate-400'>
                                                {availability}% currently available
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className='rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,#0f172a_0%,#172554_100%)] p-6 text-white shadow-sm'>
                            <p className='text-sm font-semibold uppercase tracking-[0.22em] text-blue-200'>Operations Note</p>
                            <p className='mt-3 text-xl font-semibold'>Availability and bookings should stay balanced.</p>
                            <p className='mt-3 text-sm leading-6 text-slate-300'>
                                Use the cars and bookings sections to catch bottlenecks quickly when pending requests rise or inventory gets concentrated in one city.
                            </p>
                        </div>
                    </div>
                </div>

                <div className='mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]'>
                    <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
                        <div className='flex items-center justify-between gap-4'>
                            <div>
                                <p className='text-sm font-semibold text-slate-900'>Recent Bookings</p>
                                <p className='mt-1 text-sm text-slate-500'>Latest reservations created across the platform</p>
                            </div>
                            <div className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>
                                Live feed
                            </div>
                        </div>

                        <div className='mt-6 space-y-4'>
                            {data.recentBookings.length === 0 && (
                                <div className='rounded-2xl bg-slate-50 p-5 text-sm text-slate-400'>
                                    No recent bookings yet.
                                </div>
                            )}

                            {data.recentBookings.map((booking) => (
                                <div key={booking._id} className='flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between'>
                                    <div className='flex items-center gap-4'>
                                        <div className='h-14 w-14 overflow-hidden rounded-2xl bg-slate-100'>
                                            {booking.car?.image ? (
                                                <img src={booking.car.image} alt={`${booking.car.brand} ${booking.car.model}`} className='h-full w-full object-cover' />
                                            ) : (
                                                <div className='flex h-full items-center justify-center text-xs text-slate-400'>No image</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className='font-semibold text-slate-900'>
                                                {booking.car?.brand} {booking.car?.model}
                                            </p>
                                            <p className='text-sm text-slate-500'>
                                                {booking.user?.name || 'Unknown renter'} booked from {booking.owner?.name || 'Unknown owner'}
                                            </p>
                                            <p className='mt-1 text-xs uppercase tracking-[0.18em] text-slate-400'>
                                                {booking.car?.location || 'Location unavailable'} • {booking.pickupTime || '10:00'} to {booking.returnTime || '10:00'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className='text-left md:text-right'>
                                        <p className='text-lg font-semibold text-slate-900'>{currency}{booking.price}</p>
                                        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : booking.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
                        <p className='text-sm font-semibold text-slate-900'>Platform Health</p>
                        <p className='mt-1 text-sm text-slate-500'>Quick checks across supply and reservations</p>

                        <div className='mt-6 space-y-4'>
                            <div className='rounded-2xl bg-slate-50 p-4'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm text-slate-500'>Confirmed booking share</p>
                                    <p className='text-lg font-semibold text-slate-900'>
                                        {data.totalBookings ? Math.round((data.confirmedBookings / data.totalBookings) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                            <div className='rounded-2xl bg-slate-50 p-4'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm text-slate-500'>Cars unavailable</p>
                                    <p className='text-lg font-semibold text-slate-900'>{Math.max(data.totalCars - data.availableCars, 0)}</p>
                                </div>
                            </div>
                            <div className='rounded-2xl bg-slate-50 p-4'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm text-slate-500'>Owner to car ratio</p>
                                    <p className='text-lg font-semibold text-slate-900'>
                                        {data.totalOwners ? (data.totalCars / data.totalOwners).toFixed(1) : '0.0'}
                                    </p>
                                </div>
                            </div>
                            <div className='rounded-2xl bg-slate-50 p-4'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm text-slate-500'>Revenue per booking</p>
                                    <p className='text-lg font-semibold text-slate-900'>
                                        {currency}{data.confirmedBookings ? Math.round(data.totalRevenue / data.confirmedBookings) : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
