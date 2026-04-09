import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageCar = () => {

  const { isOwner, axios, currency } = useAppContext()

  const [cars, setCars] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUpdatingCar, setIsUpdatingCar] = useState(false)
  const [editingCarId, setEditingCarId] = useState('')
  const [editImageFile, setEditImageFile] = useState(null)
  const [editRcDocumentFile, setEditRcDocumentFile] = useState(null)
  const [editForm, setEditForm] = useState({
    brand: '',
    model: '',
    year: '',
    category: '',
    seating_capacity: '',
    fuel_type: '',
    transmission: '',
    pricePerDay: '',
    location: '',
    preciseLocation: '',
    rcNumber: '',
    description: '',
    isAvailable: true,
  })

  const fetchOwnerCars = async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      if (data.success) {
        setCars(data.cars)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  const deleteCar = async (carId) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this car?")

      if (!confirm) return null;

      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openEditModal = (car) => {
    setEditingCarId(car._id)
    setEditImageFile(null)
    setEditRcDocumentFile(null)
    setEditForm({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      category: car.category || '',
      seating_capacity: car.seating_capacity || '',
      fuel_type: car.fuel_type || '',
      transmission: car.transmission || '',
      pricePerDay: car.pricePerDay || '',
      location: car.location || '',
      preciseLocation: car.preciseLocation || '',
      rcNumber: car.rcNumber || '',
      description: car.description || '',
      isAvailable: !!car.isAvailable,
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    if (isUpdatingCar) return
    setShowEditModal(false)
    setEditingCarId('')
    setEditImageFile(null)
    setEditRcDocumentFile(null)
  }

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateCar = async (event) => {
    event.preventDefault()
    try {
      if (!editingCarId) return
      const numericYear = Number(editForm.year)
      const numericSeats = Number(editForm.seating_capacity)
      const numericPrice = Number(editForm.pricePerDay)

      if (!Number.isFinite(numericYear) || numericYear <= 0) {
        toast.error('Please enter a valid year')
        return
      }
      if (!Number.isFinite(numericSeats) || numericSeats <= 0) {
        toast.error('Please enter valid seating capacity')
        return
      }
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        toast.error('Please enter valid price per day')
        return
      }

      setIsUpdatingCar(true)

      const updateData = {
        ...editForm,
        year: numericYear,
        seating_capacity: numericSeats,
        pricePerDay: numericPrice,
      }

      const formData = new FormData()
      formData.append('carId', editingCarId)
      formData.append('updateData', JSON.stringify(updateData))
      if (editImageFile) formData.append('image', editImageFile)
      if (editRcDocumentFile) formData.append('rcDocument', editRcDocumentFile)

      const { data } = await axios.post('/api/owner/update-car', formData)
      if (data.success) {
        toast.success(data.message)
        closeEditModal()
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsUpdatingCar(false)
    }
  }

  useEffect(() => {
    isOwner && fetchOwnerCars()
  }, [isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>

      <Title title="Manage Cars" subTitle="View all listed cars" />

      <div className='max-w-3xl w-full rounded-md mt-6 overflow-hidden border border-gray-300'>
        <table className='w-full border-collapse text-left text-gray-700 text-sm'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Category</th>
              <th className='p-3 font-medium'>Price</th>
              <th className='p-3 font-medium max-md:hidden'>Status</th>
              <th className='p-3 font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={index} className='border-t border-gray-300 hover:bg-gray-50'>
                <td className='p-3 flex items-center gap-3'>
                  <img src={car.image} alt="" className='w-12 h-12 aspect-square object-cover rounded-md' />
                  <div className='max-md:hidden'>
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-500'>{car.seating_capacity} {car.transmission}</p>
                  </div>
                </td>
                <td className='p-3 max-md:hidden'>{car.category}</td>
                <td className='p-3'>{currency}{car.pricePerDay}/day</td>
                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${car.isAvailable ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
                    {car.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </td>

                <td className='flex items-center p-3'>
                  <img onClick={() => openEditModal(car)} src={assets.edit_icon} alt="" className='cursor-pointer' />

                  <img onClick={() => toggleAvailability(car._id)} src={car.isAvailable ? assets.eye_close_icon : assets.eye_icon} alt="" className='cursor-pointer ml-2' />

                  <img onClick={() => deleteCar(car._id)} src={assets.delete_icon} alt="" className='cursor-pointer ml-2' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>


      </div>

      {showEditModal && (
        <div className='fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-8' onClick={closeEditModal}>
          <form
            onSubmit={updateCar}
            onClick={(event) => event.stopPropagation()}
            className='w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'
          >
            <h3 className='text-xl font-semibold text-slate-900'>Edit Car Details</h3>
            <p className='mt-1 text-sm text-slate-600'>Update pricing, specs, and availability details.</p>

            <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
              <label className='text-sm font-medium text-slate-700'>
                Brand
                <input required value={editForm.brand} onChange={(e) => handleEditChange('brand', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Model
                <input required value={editForm.model} onChange={(e) => handleEditChange('model', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Year
                <input required type='number' value={editForm.year} onChange={(e) => handleEditChange('year', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Category
                <input required value={editForm.category} onChange={(e) => handleEditChange('category', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Seating Capacity
                <input required type='number' value={editForm.seating_capacity} onChange={(e) => handleEditChange('seating_capacity', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Fuel Type
                <input required value={editForm.fuel_type} onChange={(e) => handleEditChange('fuel_type', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Transmission
                <input required value={editForm.transmission} onChange={(e) => handleEditChange('transmission', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Price Per Day
                <input required type='number' value={editForm.pricePerDay} onChange={(e) => handleEditChange('pricePerDay', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Location
                <input required value={editForm.location} onChange={(e) => handleEditChange('location', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                Precise Location
                <input value={editForm.preciseLocation} onChange={(e) => handleEditChange('preciseLocation', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='text-sm font-medium text-slate-700'>
                RC Number
                <input required value={editForm.rcNumber} onChange={(e) => handleEditChange('rcNumber', e.target.value)} className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
              </label>
              <label className='mt-7 inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
                <input type='checkbox' checked={editForm.isAvailable} onChange={(e) => handleEditChange('isAvailable', e.target.checked)} />
                Available for booking
              </label>
            </div>

            <label className='mt-4 block text-sm font-medium text-slate-700'>
              Description
              <textarea required value={editForm.description} onChange={(e) => handleEditChange('description', e.target.value)} className='mt-2 h-24 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none' />
            </label>

            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
              <label className='block text-sm font-medium text-slate-700'>
                Replace Car Image (optional)
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className='mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium'
                />
                <p className='mt-1 text-xs text-gray-500'>{editImageFile ? editImageFile.name : 'Keep current image if not changed'}</p>
              </label>

              <label className='block text-sm font-medium text-slate-700'>
                Replace RC Document (optional)
                <input
                  type='file'
                  accept='image/*,.pdf'
                  onChange={(e) => setEditRcDocumentFile(e.target.files?.[0] || null)}
                  className='mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium'
                />
                <p className='mt-1 text-xs text-gray-500'>{editRcDocumentFile ? editRcDocumentFile.name : 'Keep current RC document if not changed'}</p>
              </label>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <button type='button' onClick={closeEditModal} className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700'>Cancel</button>
              <button type='submit' disabled={isUpdatingCar} className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-70'>
                {isUpdatingCar ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}

export default ManageCar

