import React from 'react'
import { adminMenuLinks, assets } from '../../assets/assets'
import { Link, NavLink, useLocation } from 'react-router-dom'
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
        <div className='sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur'>
            <div className='flex items-center justify-between px-5 py-4 md:px-8'>
                <div className='flex min-w-0 items-center gap-4'>
                    <Link to='/' className='flex items-center gap-3'>
                        <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10'>
                            <img src={assets.logo} alt="Turbo Rides logo" className='h-6 w-6' />
                        </div>
                        <div className='min-w-0'>
                            <p className='whitespace-nowrap text-lg font-semibold tracking-tight text-slate-900'>Turbo Rides</p>
                            <div className='mt-1 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white'>
                                Admin
                            </div>
                        </div>
                    </Link>
                    <div className='hidden h-10 w-px bg-slate-200 md:block' />
                    <div className='hidden min-w-0 md:block'>
                        <p className='text-sm text-slate-500'>Control Center</p>
                        <p className='whitespace-nowrap text-base font-semibold text-slate-900'>{currentPageName}</p>
                    </div>
                </div>

                <div className='flex shrink-0 items-center gap-6'>
                    <div className='hidden items-center gap-5 text-sm text-slate-500 md:flex'>
                        <Link to='/' className='whitespace-nowrap transition hover:text-slate-900'>User Home</Link>
                        <Link to='/owner' className='whitespace-nowrap transition hover:text-slate-900'>Owner Dashboard</Link>
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

            <div className='sticky top-[76px] border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur lg:hidden'>
                <div className='mb-1.5 flex items-center justify-between'>
                    <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-500'>Operations</p>
                    <p className='text-xs font-medium text-slate-400'>{currentPageName}</p>
                </div>
                <div className='flex gap-1.5 overflow-x-auto pb-1'>
                    {adminMenuLinks.map((link, index) => {
                        const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                        return (
                            <NavLink
                                key={index}
                                to={link.path}
                                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'}`}
                            >
                                <img src={isActive ? link.coloredIcon : link.icon} alt="" className='h-3.5 w-3.5' />
                                <span>{link.name}</span>
                            </NavLink>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default NavbarAdmin
