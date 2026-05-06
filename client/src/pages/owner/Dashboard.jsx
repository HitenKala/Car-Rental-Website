import React, { useEffect, useMemo, useState } from 'react'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const defaultData = {
  totalCars: 0,
  totalBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
  recentBookings: [],
  monthlyRevenue: 0,
  totalFeedbacks: 0,
  complaintsCount: 0,
  averageRating: 0,
  recentFeedbacks: [],
}

const Dashboard = () => {
  const { axios, isOwner, currency } = useAppContext()
  const [data, setData] = useState(defaultData)

  const stats = useMemo(() => {
    const completionRate = data.totalBookings ? Math.round((data.completedBookings / data.totalBookings) * 100) : 0
    const activeFleet = Math.max(data.totalCars - data.pendingBookings, 0)

    return [
      {
        title: 'Total Cars',
        value: data.totalCars,
        helper: `${activeFleet} active in your fleet`,
        icon: assets.carIconColored,
        accent: 'from-sky-500/12 to-cyan-500/12',
      },
      {
        title: 'Total Earnings',
        value: `${currency}${Number(data.monthlyRevenue || 0).toLocaleString()}`,
        helper: 'Confirmed booking revenue',
        icon: assets.dashboardIconColored,
        accent: 'from-emerald-500/12 to-teal-500/12',
      },
      {
        title: 'Total Bookings',
        value: data.totalBookings,
        helper: `${data.pendingBookings} pending requests`,
        icon: assets.listIconColored,
        accent: 'from-indigo-500/12 to-violet-500/12',
      },
      {
        title: 'Booking Success',
        value: `${completionRate}%`,
        helper: `${data.completedBookings} confirmed trips`,
        icon: assets.tick_icon,
        accent: 'from-amber-500/12 to-orange-500/12',
      },
      {
        title: 'Owner Rating',
        value: data.averageRating ? `${data.averageRating}/5` : 'N/A',
        helper: `${data.totalFeedbacks} feedback entries`,
        icon: assets.star_icon,
        accent: 'from-fuchsia-500/12 to-rose-500/12',
      },
      {
        title: 'Complaints',
        value: data.complaintsCount,
        helper: 'Items needing follow-up',
        icon: assets.cautionIconColored,
        accent: 'from-rose-500/12 to-red-500/12',
      },
    ]
  }, [currency, data])

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/owner/dashboard')
      if (data.success) {
        setData({ ...defaultData, ...data.dashboardData })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData()
    }
  }, [isOwner])

  return (
    <div className='px-4 py-5 sm:px-6 md:px-8 lg:px-8 xl:px-10'>
      <div className='mx-auto w-full max-w-[1480px] rounded-[28px] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6 md:px-8 md:py-7'>
        <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_340px]'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.24em] text-emerald-500'>Owner Dashboard</p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl'>
              Manage your rental fleet from one place
            </h1>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-500'>
              Monitor listed cars, track bookings, review confirmed trips, and keep your revenue moving with a faster owner workflow.
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4 self-start sm:grid-cols-3 xl:grid-cols-1'>
            <div className='rounded-2xl bg-slate-50 p-4'>
              <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Pending</p>
              <p className='mt-2 text-2xl font-semibold text-slate-900'>{data.pendingBookings}</p>
            </div>
            <div className='rounded-2xl bg-slate-50 p-4'>
              <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Confirmed</p>
              <p className='mt-2 text-2xl font-semibold text-slate-900'>{data.completedBookings}</p>
            </div>
            <div className='rounded-2xl bg-slate-50 p-4 col-span-2 sm:col-span-1'>
              <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Revenue</p>
              <p className='mt-2 text-2xl font-semibold text-slate-900'>{currency}{Number(data.monthlyRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className='mt-8 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3'>
          {stats.map((stat) => (
            <div key={stat.title} className='rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-sm text-slate-500'>{stat.title}</p>
                  <p className='mt-3 text-3xl font-semibold tracking-tight text-slate-900'>{stat.value}</p>
                  <p className='mt-2 text-sm text-slate-400'>{stat.helper}</p>
                </div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent}`}>
                  <img src={stat.icon} alt="" className='h-6 w-6' />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-8 grid items-start gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]'>
          <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Recent Bookings</p>
                <p className='mt-1 text-sm text-slate-500'>Latest reservations for your listed vehicles</p>
              </div>
              <div className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>
                Owner feed
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
                        Pickup {booking.pickupDate?.split('T')[0]} {booking.pickupTime || '10:00'} to {booking.returnDate?.split('T')[0]} {booking.returnTime || '10:00'}
                      </p>
                      <p className='mt-1 text-xs uppercase tracking-[0.18em] text-slate-400'>
                        Created {booking.createdAt?.split('T')[0]}
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

          <div className='space-y-6'>
            <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-sm font-semibold text-slate-900'>Reviews & Complaints</p>
                  <p className='mt-1 text-sm text-slate-500'>Latest feedback from your renters</p>
                </div>
                <div className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>
                  Feedback
                </div>
              </div>

              <div className='mt-4 space-y-3'>
                {data.recentFeedbacks?.length === 0 ? (
                  <div className='rounded-2xl bg-slate-50 p-4 text-sm text-slate-400'>
                    No feedback submitted yet.
                  </div>
                ) : (
                  data.recentFeedbacks.map((feedback) => (
                    <div key={feedback._id} className='rounded-2xl border border-slate-200 p-4'>
                      <div className='flex items-center justify-between gap-3'>
                        <p className='font-medium text-slate-900'>{feedback.user?.name || 'User'}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${feedback.type === 'complaint' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {feedback.type}
                        </span>
                      </div>
                      {feedback.rating ? <p className='mt-1 text-xs text-slate-500'>Rating: {feedback.rating}/5</p> : null}
                      <p className='mt-2 text-sm text-slate-600'>{feedback.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
              <p className='text-sm font-semibold text-slate-900'>Fleet Health</p>
              <p className='mt-1 text-sm text-slate-500'>Quick checks across your rental business</p>

              <div className='mt-6 space-y-4'>
                <div className='rounded-2xl bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-slate-500'>Cars per confirmed trip</p>
                    <p className='text-lg font-semibold text-slate-900'>
                      {data.totalCars ? (data.completedBookings / data.totalCars).toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
                <div className='rounded-2xl bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-slate-500'>Revenue per confirmed booking</p>
                    <p className='text-lg font-semibold text-slate-900'>
                      {currency}{data.completedBookings ? Math.round(data.monthlyRevenue / data.completedBookings) : 0}
                    </p>
                  </div>
                </div>
                <div className='rounded-2xl bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-slate-500'>Pending workload</p>
                    <p className='text-lg font-semibold text-slate-900'>{data.pendingBookings}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,#0f172a_0%,#14532d_100%)] p-6 text-white shadow-sm'>
              <p className='text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200'>Owner Note</p>
              <p className='mt-3 text-xl font-semibold'>Fast replies help secure more rentals.</p>
              <p className='mt-3 text-sm leading-6 text-slate-300'>
                Keep your fleet updated, review pending requests daily, and confirm strong bookings quickly so your cars stay productive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
