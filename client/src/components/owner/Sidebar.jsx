import React, { useState } from 'react'
import { dummyUserData } from '../../assets/assets'
import { useLocation } from 'react-router-dom'

const Sidebar = () => {
    const user = dummyUserData
    const location = useLocation()
    const [image,setImage] = useState('')
    
    const updateImage = async()=>{
        user.image = URL.createObjectURL(image)
        setImage('')
    }
  return (
    <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300 text-sm'>
        <div className='group relative'>
            <label htmlFor="image">
                <img src={image ? URL.createObjectURL(image) : user?.image || assets.user_profile.png } alt="" />
                <input type="file" id='image'  accept="image/*" className='hidden' onChange={(e)=>setImage(e.target.files[0])} />
                <div>
                    
                </div>
            </label>
        </div>      
    </div>
  )
}

export default Sidebar
