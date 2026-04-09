import React, { useEffect, useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import { motion } from 'motion/react'

const Navbar = () => {

    const { setShowLogin, user, logout, isOwner, isAdmin, axios, fetchUser } =
        useAppContext()

    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [showOwnerForm, setShowOwnerForm] = useState(false);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [registrationFile, setRegistrationFile] = useState(null);
    const [isSubmittingOwnerForm, setIsSubmittingOwnerForm] = useState(false);
    const [navbarSearch, setNavbarSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setNavbarSearch(params.get('q') || '');
    }, [location.search]);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const openOwnerRegistration = () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        if (user.ownerVerificationStatus === 'pending') {
            toast('Your owner request is under admin review.');
            return;
        }
        setShowOwnerForm(true);
    }

    const closeOwnerRegistration = (forceClose = false) => {
        if (isSubmittingOwnerForm && !forceClose) return;
        setShowOwnerForm(false);
        setRegistrationNumber('');
        setRegistrationFile(null);
    }

    const changeRole = async (event) => {
        event.preventDefault();
        try {
            if (!registrationNumber.trim()) {
                toast.error('Please enter your registration number');
                return;
            }
            if (!registrationFile) {
                toast.error('Please upload your car registration document');
                return;
            }

            setIsSubmittingOwnerForm(true);

            const formData = new FormData();
            formData.append('registrationNumber', registrationNumber.trim());
            formData.append('registrationDocument', registrationFile);

            const { data } = await axios.post('/api/owner/change-role', formData);
            if (data.success) {
                toast.success(data.message);
                await fetchUser();
                closeOwnerRegistration(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmittingOwnerForm(false);
        }
    }

    const handleNavbarSearch = (event) => {
        event.preventDefault();
        const params = new URLSearchParams(location.pathname === '/cars' ? location.search : '');
        const value = navbarSearch.trim();

        if (value) {
            params.set('q', value);
        } else {
            params.delete('q');
        }

        const query = params.toString();
        navigate(`/cars${query ? `?${query}` : ''}`);
        setOpen(false);
    }

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex items-center justify-start gap-6 lg:gap-8 px-6 md:px-10 lg:px-14 xl:px-16 
    py-0 text-textDark border-b border-borderColor relative transition-all 
    ${location.pathname === "/" && "bg-[#cdc7cc] border-b-3 border-[#ff344c]"}`}>

            <Link to={"/"}>
                <motion.img
                    whileHover={{ scale: 1.2 }}
                    src={assets.turbo_rides2} type='png' alt="logo" className="h-22" />
            </Link>

            <div className={`max-sm:fixed max-sm:left-0 max-sm:h-screen max-sm:w-full max-sm:top-18 max-sm:overflow-y-auto   
             max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row sm:flex-nowrap
             items-start sm:items-center gap-4 sm:gap-10 max-sm:p-4 transition-all sm:w-full sm:ml-8 lg:ml-14
            duration-300 z-50 ${location.pathname === "/" ? "bg-[#cdc7cc]" : "bg-white "} 
            ${open ? "max-sm:translate-x-0" : "max-sm:-translate-x-full"}`}>
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 lg:ml-auto'>
                    {menuLinks.map((link, index) => (
                        <Link key={index} to={link.path} className='whitespace-nowrap'>
                            {link.name}
                        </Link>
                    ))}
                </div>

                <form
                    onSubmit={handleNavbarSearch}
                    className='group relative flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all duration-300 focus-within:border-blue-300 focus-within:shadow-[0_10px_28px_rgba(37,99,235,0.18)] lg:hidden'
                >
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                        <img src={assets.search_icon} alt='search' className='h-4 w-4 opacity-70' />
                    </div>
                    <input
                        type='text'
                        value={navbarSearch}
                        onChange={(e) => setNavbarSearch(e.target.value)}
                        className='w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400'
                        placeholder='Search cars, brands, models'
                    />
                    <button
                        type='submit'
                        className='rounded-full bg-[#1d4ed8] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1e40af]'
                    >
                        Search
                    </button>
                </form>

                <form
                    onSubmit={handleNavbarSearch}
                    className='group relative hidden lg:flex w-full lg:max-w-[500px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all duration-300 focus-within:border-blue-300 focus-within:shadow-[0_10px_28px_rgba(37,99,235,0.18)]'
                >
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                        <img src={assets.search_icon} alt='search' className='h-4 w-4 opacity-70' />
                    </div>
                    <input
                        type='text'
                        value={navbarSearch}
                        onChange={(e) => setNavbarSearch(e.target.value)}
                        className='w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400'
                        placeholder='Search cars, brands, models'
                    />
                    {navbarSearch && (
                        <button
                            type='button'
                            onClick={() => setNavbarSearch('')}
                            className='rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100'
                            aria-label='Clear search'
                        >
                            Clear
                        </button>
                    )}
                    <button
                        type='submit'
                        className='rounded-full bg-[#1d4ed8] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1e40af]'
                    >
                        Search
                    </button>
                </form>

                {isAdmin ? (
                    <button onClick={() => navigate('/admin')} className='cursor-pointer whitespace-nowrap'>Admin Dashboard</button>
                ) : (
                    <button onClick={() => isOwner ? navigate('/owner') : openOwnerRegistration()} className='cursor-pointer whitespace-nowrap'>
                        {isOwner
                            ? "Dashboard"
                            : user?.ownerVerificationStatus === 'pending'
                                ? "Owner Review Pending"
                                : user?.ownerVerificationStatus === 'rejected'
                                    ? "Reapply For Owner"
                                    : "List Cars"}
                    </button>
                )}

                <button onClick={() => { user ? logout() : setShowLogin(true) }} className='cursor-pointer whitespace-nowrap px-6 py-2 bg-gray-100 hover:bg-[#232323] transition-all
                     text-[#DA2917] hover:text-[#fff] rounded-lg font-bold '>{user ? "Logout" : "Login"}</button>

            </div>
            <button className='sm:hidden cursor-pointer' aria-label='Menu' onClick={() => setOpen(!open)}>
                <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
            </button>

            {showOwnerForm && (
                <div
                    onClick={closeOwnerRegistration}
                    className='fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 py-8'
                >
                    <form
                        onSubmit={changeRole}
                        onClick={(e) => e.stopPropagation()}
                        className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'
                    >
                        <p className='text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>Owner registration</p>
                        <h3 className='mt-2 text-xl font-semibold text-slate-900'>Submit your car registration</h3>
                        <p className='mt-2 text-sm text-slate-600'>Share your registration number and a clear document copy. Admin approval is required before owner access is enabled.</p>

                        <label className='mt-5 block text-sm font-medium text-slate-700'>
                            Registration number
                            <input
                                type='text'
                                required
                                value={registrationNumber}
                                onChange={(e) => setRegistrationNumber(e.target.value)}
                                className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                                placeholder='e.g. DL3CAF1234'
                            />
                        </label>

                        <label className='mt-4 block text-sm font-medium text-slate-700'>
                            Car registration document
                            <input
                                type='file'
                                required
                                accept='image/*,.pdf'
                                onChange={(e) => setRegistrationFile(e.target.files?.[0] || null)}
                                className='mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium'
                            />
                        </label>

                        <div className='mt-6 flex justify-end gap-3'>
                            <button
                                type='button'
                                onClick={closeOwnerRegistration}
                                className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={isSubmittingOwnerForm}
                                className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70'
                            >
                                {isSubmittingOwnerForm ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </motion.div>

    )
}

export default Navbar
