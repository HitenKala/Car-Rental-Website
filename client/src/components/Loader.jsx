import React from 'react'

const Loader = () => {
  return (
    <div className='flex justify-center items-center h-[80vh]'>
        <div className='animate-spin rounded-full border-4 border-t-8 border-gray-200 h-14 w-14'></div>
      
    </div>
  )
}

export default Loader
