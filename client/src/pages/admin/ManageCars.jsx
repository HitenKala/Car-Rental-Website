import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import CarDetailsModal from '../../components/CarDetailsModal'

const ManageCars = () => {

    const { isAdmin, axios, currency } = useAppContext()

    const [cars, setCars] = useState([])
    const [selectedCar, setSelectedCar] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchCars = async () => {
        try {
            setLoading(true)
            setError('')
            const { data } = await axios.get('/api/admin/cars')
            if (data.success) {
                setCars(data.cars)
            } else {
                setError(data.message || 'Failed to fetch cars')
                toast.error(data.message)
            }
        } catch (error) {
            setError(error.message || 'Error fetching cars')
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const deleteCar = async (carId) => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this car?")

            if (!confirm) return null;

            const { data } = await axios.delete(`/api/admin/cars/${carId}`)
            if (data.success) {
                toast.success(data.message)
                fetchCars()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchCars()
        }
    }, [isAdmin])

    const openCarDetails = (car) => {
        setSelectedCar(car)
    }

    const closeCarDetails = () => {
        setSelectedCar(null)
    }

    return (
        <div className='w-full px-4 pt-8 sm:px-6 md:px-8 lg:px-10'>

            <Title title="Manage Cars" subTitle="View all cars on the platform" />

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4'>
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {loading && (
                <div className='flex items-center justify-center h-40'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                        <p className='text-gray-600'>Loading cars...</p>
                    </div>
                </div>
            )}

            {!loading && cars.length === 0 && !error && (
                <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4'>
                    <p>No cars found in the system.</p>
                </div>
            )}

            {!loading && cars.length > 0 && (
                <div className='mt-6 w-full max-w-6xl overflow-x-auto rounded-2xl border border-gray-300 bg-white shadow-sm'>
                    <table className='min-w-[880px] w-full border-collapse text-left text-gray-700 text-sm'>
                        <thead className='text-gray-500'>
                            <tr>
                                <th className='p-3 font-medium'>Car</th>
                                <th className='p-3 font-medium'>Owner</th>
                                <th className='p-3 font-medium max-md:hidden'>Category</th>
                                <th className='p-3 font-medium'>Price</th>
                                <th className='p-3 font-medium max-md:hidden'>Location</th>
                                <th className='p-3 font-medium'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.map((car, index) => (
                                <tr key={index} className='border-t border-gray-300 hover:bg-gray-50'>
                                    <td className='cursor-pointer p-3' onClick={() => openCarDetails(car)}>
                                        <div className='flex items-center gap-3'>
                                        <div className='w-12 h-12 aspect-square bg-gray-200 rounded-md flex items-center justify-center overflow-hidden'>
                                            {car.image ? (
                                                <img
                                                    src={car.image}
                                                    alt={`${car.brand} ${car.model}`}
                                                    className='w-full h-full object-cover rounded-md'
                                                />
                                            ) : (
                                                <span className='text-xs text-gray-500'>No image</span>
                                            )}
                                        </div>
                                        <div className='max-md:hidden'>
                                            <p className='font-medium'>{car.brand} {car.model}</p>
                                            <p className='text-xs text-gray-500'>{car.seating_capacity} seats, {car.transmission}</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td className='cursor-pointer p-3' onClick={() => openCarDetails(car)}>{car.owner?.name || 'Unknown'}</td>
                                    <td className='cursor-pointer p-3 max-md:hidden' onClick={() => openCarDetails(car)}>{car.category}</td>
                                    <td className='cursor-pointer p-3' onClick={() => openCarDetails(car)}>{currency}{car.pricePerDay}/day</td>
                                    <td className='cursor-pointer p-3 max-md:hidden' onClick={() => openCarDetails(car)}>{car.location}</td>
                                    <td className='p-3'>
                                        <img onClick={() => deleteCar(car._id)} src={assets.delete_icon} alt="" className='cursor-pointer' />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedCar && (
                <CarDetailsModal
                    car={selectedCar}
                    onClose={closeCarDetails}
                    currency={currency}
                    showOwner
                />
            )}

        </div>
    )
}

export default ManageCars
