import React from 'react'
import { adminMenuLinks, assets } from '../../assets/assets'
import { useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const SidebarAdmin = () => {

    const { user } = useAppContext()
    const location = useLocation()

    return (
        <aside className='hidden min-h-[calc(100vh-76px)] w-72 shrink-0 border-r border-slate-200 bg-white xl:block'>
            <div className='border-b border-slate-200 px-7 py-8'>
                <div className='flex items-center gap-4 rounded-3xl bg-slate-50 p-4'>
                    <img src={user?.image || assets.user_profile} alt="Admin profile" className='h-14 w-14 rounded-2xl object-cover' />
                    <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500'>Platform Admin</p>
                        <p className='mt-1 text-lg font-semibold text-slate-900'>Hi, {user?.name || 'Admin'}</p>
                    </div>
                </div>
            </div>

            <div className='px-4 py-6'>
                <p className='px-3 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400'>Operations</p>
                <div className='mt-4 space-y-1.5'>
                    {adminMenuLinks.map((link, index) => {
                        const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                        return (
                            <NavLink
                                key={index}
                                to={link.path}
                                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 transition ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <span className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full ${isActive ? 'bg-emerald-500' : 'bg-transparent'}`} />
                                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white'}`}>
                                    <img src={isActive ? link.coloredIcon : link.icon} alt="icon" className='h-4 w-4' />
                                </span>
                                <div>
                                    <p className='font-medium'>{link.name}</p>
                                    <p className='text-xs text-slate-400'>
                                        {link.name === 'Dashboard' && 'Platform summary'}
                                        {link.name === 'Manage Users' && 'Customer accounts'}
                                        {link.name === 'Manage Owners' && 'Fleet partners'}
                                        {link.name === 'Manage Cars' && 'Vehicle inventory'}
                                        {link.name === 'Manage Bookings' && 'Reservation flow'}
                                        {link.name === 'Newsletter' && 'Subscriber emails'}
                                    </p>
                                </div>
                            </NavLink>
                        )
                    })}
                </div>

                <div className='mt-8 rounded-3xl bg-[linear-gradient(145deg,#0f172a_0%,#1e3a8a_100%)] p-5 text-white'>
                    <p className='text-xs font-semibold uppercase tracking-[0.24em] text-blue-200'>Daily Focus</p>
                    <p className='mt-3 text-lg font-semibold'>Keep bookings moving smoothly.</p>
                    <p className='mt-2 text-sm leading-6 text-slate-300'>
                        Review pending reservations, watch fleet availability, and support owners before demand spikes.
                    </p>
                </div>
            </div>
        </aside>
    )
}

export default SidebarAdmin
