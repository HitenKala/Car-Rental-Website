import React, { useEffect } from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const { isOwner, navigate, isCheckingAuth } = useAppContext()

  useEffect(() => {
    if (!isCheckingAuth && !isOwner) {
      navigate('/')
    }
  }, [isCheckingAuth, isOwner, navigate])

  if (isCheckingAuth) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500'></div>
          <p className='text-gray-600'>Loading owner dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isOwner) return null

  return (
    <div className='flex flex-col'>
      <NavbarOwner />
      <div className='flex'>
        <Sidebar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
