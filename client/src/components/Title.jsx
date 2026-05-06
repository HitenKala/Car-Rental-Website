import React from 'react'

const Title = ({title,subTitle,align}) => {
  return (
    <div className={`flex flex-col justify-center items-center text-center ${align === 'left' && 'md:items-start md:text-left'}`}>
        <h1 className='text-3xl font-semibold leading-tight sm:text-4xl md:text-[40px]' >{title}</h1>
        <p className='mt-3 max-w-3xl text-sm leading-6 text-gray-500/90 md:text-base' >{subTitle}</p>

      
    </div>
  )
}

export default Title
