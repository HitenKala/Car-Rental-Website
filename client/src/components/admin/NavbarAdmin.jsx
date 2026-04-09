import React from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const NavbarAdmin = () => {

    const { user } = useAppContext();
    const location = useLocation();

    const pageNames = {
        '/admin': 'Dashboard',
        '/admin/users': 'Users',
        '/admin/owners': 'Owners',
        '/admin/cars': 'Cars',
        '/admin/bookings': 'Bookings',
        '/admin/newsletter': 'Newsletter',
    }

    const currentPageName = location.pathname.startsWith('/admin/owners/')
        ? 'Owner Details'
        : location.pathname.startsWith('/admin/users/')
            ? 'User Details'
        : (pageNames[location.pathname] || 'Admin Panel')

    return (
        <div className='sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-8'>
            <div className='flex items-center gap-4 min-w-0'>
                <Link to='/' className='flex items-center gap-3'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10'>
                        <img src={assets.logo} alt="Turbo Rides logo" className='h-6 w-6' />
                    </div>
                    <div className='min-w-0'>
                        <p className='text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap'>Turbo Rides</p>
                        <div className='mt-1 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white'>
                            Admin
                        </div>
                    </div>
                </Link>
                <div className='hidden h-10 w-px bg-slate-200 md:block' />
                <div className='hidden md:block min-w-0'>
                    <p className='text-sm text-slate-500'>Control Center</p>
                    <p className='text-base font-semibold text-slate-900 whitespace-nowrap'>{currentPageName}</p>
                </div>
            </div>

            <div className='flex items-center gap-6 shrink-0'>
                <div className='hidden items-center gap-5 text-sm text-slate-500 md:flex'>
                    <Link to='/' className='transition hover:text-slate-900 whitespace-nowrap'>User Home</Link>
                    <Link to='/owner' className='transition hover:text-slate-900 whitespace-nowrap'>Owner Dashboard</Link>
                </div>

                <div className='flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-2 pl-4'>
                    <div className='text-right leading-tight'>
                        <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Admin</p>
                        <p className='text-sm font-semibold text-slate-900'>Hi, {user?.name || 'Admin'}</p>
                    </div>
                    <img src={user?.image || assets.user_profile} alt="Admin profile" className='h-10 w-10 rounded-full object-cover ring-2 ring-white' />
                </div>
            </div>
        </div>
    )
}

export default NavbarAdmin
