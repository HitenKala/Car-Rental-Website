import React, { useState } from 'react'
import { assets, ownerMenuLinks } from '../../assets/assets'
import { useLocation, NavLink } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const Sidebar = () => {
    const { user, axios, fetchUser } = useAppContext()
    const location = useLocation()
    const [image, setImage] = useState('')

    const updateImage = async () => {
        try {
            const formData = new FormData()
            formData.append('image', image)
            const { data } = await axios.post('/api/owner/update-image', formData)
            if (data.success) {
                fetchUser()
                setImage('')
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <aside className='hidden min-h-[calc(100vh-76px)] w-72 shrink-0 border-r border-slate-200 bg-white xl:block'>
            <div className='border-b border-slate-200 px-7 py-8'>
                <div className='rounded-3xl bg-slate-50 p-5'>
                    <div className='group relative mx-auto w-fit'>
                        <label htmlFor="image" className='block cursor-pointer'>
                            <img
                                src={image ? URL.createObjectURL(image) : user?.image || assets.user_profile}
                                alt="Owner profile"
                                className='h-20 w-20 rounded-3xl object-cover'
                            />
                            <input type="file" id='image' accept="image/*" className='hidden' onChange={(e) => setImage(e.target.files[0])} />
                            <div className='absolute inset-0 hidden items-center justify-center rounded-3xl bg-slate-900/35 group-hover:flex'>
                                <img src={assets.edit_icon} alt="edit profile" className='h-5 w-5 invert' />
                            </div>
                        </label>
                    </div>

                    {image && (
                        <button
                            onClick={updateImage}
                            className='mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600'
                        >
                            Save Photo
                            <img src={assets.check_icon} width={13} alt="" className='invert' />
                        </button>
                    )}

                    <div className='mt-4 text-center'>
                        <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500'>Fleet Owner</p>
                        <p className='mt-1 text-lg font-semibold text-slate-900'>{user?.name || 'Owner'}</p>
                    </div>
                </div>
            </div>

            <div className='px-4 py-6'>
                <p className='px-3 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400'>Workspace</p>
                <div className='mt-4 space-y-1.5'>
                    {ownerMenuLinks.map((link, index) => {
                        const isActive = link.path === location.pathname
                        return (
                            <NavLink
                                key={index}
                                to={link.path}
                                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 transition ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <span className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full ${isActive ? 'bg-emerald-500' : 'bg-transparent'}`} />
                                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white'}`}>
                                    <img src={isActive ? link.coloredIcon : link.icon} alt="menu icon" className='h-4 w-4' />
                                </span>
                                <div>
                                    <p className='font-medium'>{link.name}</p>
                                    <p className='text-xs text-slate-400'>
                                        {link.name === 'Dashboard' && 'Fleet overview'}
                                        {link.name === 'Add car' && 'List a new vehicle'}
                                        {link.name === 'Manage Cars' && 'Update availability'}
                                        {link.name === 'Manage Bookings' && 'Handle reservations'}
                                    </p>
                                </div>
                            </NavLink>
                        )
                    })}
                </div>

                <div className='mt-8 rounded-3xl bg-[linear-gradient(145deg,#0f172a_0%,#14532d_100%)] p-5 text-white'>
                    <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200'>Owner Tip</p>
                    <p className='mt-3 text-lg font-semibold'>Keep your best cars available.</p>
                    <p className='mt-2 text-sm leading-6 text-slate-300'>
                        Update fleet status regularly and respond to new bookings quickly to maintain consistent earnings.
                    </p>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
