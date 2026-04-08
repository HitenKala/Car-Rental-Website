import React, { useEffect } from 'react'
import NavbarAdmin from '../../components/admin/NavbarAdmin'
import SidebarAdmin from '../../components/admin/SidebarAdmin'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const AdminLayout = () => {
    const { isAdmin, navigate, isCheckingAuth } = useAppContext()

    useEffect(() => {
        console.log('AdminLayout - isCheckingAuth:', isCheckingAuth, 'isAdmin:', isAdmin)
        if (!isCheckingAuth && !isAdmin) {
            console.warn('User is not admin, redirecting to home')
            navigate('/')
        }
    }, [isAdmin, isCheckingAuth, navigate])

    return (
        <div className='min-h-screen bg-[#f8fafc] text-slate-900'>
            {isCheckingAuth ? (
                <div className='flex h-screen items-center justify-center'>
                    <div className='text-center'>
                        <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500'></div>
                        <p className='text-slate-500'>Verifying admin access...</p>
                    </div>
                </div>
            ) : (
                <>
                    <NavbarAdmin />
                    <div className='flex'>
                        <SidebarAdmin />
                        <main className='min-w-0 flex-1'>
                            <Outlet />
                        </main>
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminLayout
