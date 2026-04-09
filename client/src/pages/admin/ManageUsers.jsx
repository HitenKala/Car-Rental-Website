import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ManageUsers = () => {

    const { isAdmin, axios } = useAppContext()
    const navigate = useNavigate()

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError('')
            const { data } = await axios.get('/api/admin/users')
            console.log('Admin users response:', data)
            if (data.success) {
                setUsers(data.users)
            } else {
                setError(data.message || 'Failed to fetch users')
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            setError(error.message || 'Error fetching users')
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const deleteUser = async (userId) => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this user?")

            if (!confirm) return null;

            const { data } = await axios.delete(`/api/admin/users/${userId}`)
            if (data.success) {
                toast.success(data.message)
                fetchUsers()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchUsers()
        }
    }, [isAdmin])

    return (
        <div className='px-4 pt-10 md:px-10 w-full'>

            <Title title="Manage Users" subTitle="View and manage all users" />

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4'>
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {loading && (
                <div className='flex items-center justify-center h-40'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                        <p className='text-gray-600'>Loading users...</p>
                    </div>
                </div>
            )}

            {!loading && users.length === 0 && !error && (
                <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4'>
                    <p>No users found in the system.</p>
                </div>
            )}

            {!loading && users.length > 0 && (
                <div className='max-w-4xl w-full rounded-md mt-6 overflow-hidden border border-gray-300'>
                    <table className='w-full border-collapse text-left text-gray-700 text-sm'>
                        <thead className='text-gray-500'>
                            <tr>
                                <th className='p-3 font-medium'>User</th>
                                <th className='p-3 font-medium'>Email</th>
                                <th className='p-3 font-medium'>Role</th>
                                <th className='p-3 font-medium'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index} className='border-t border-gray-300 hover:bg-gray-50'>
                                    <td className='p-3 flex items-center gap-3'>
                                        <img src={user.image || assets.user_profile} alt="" className='w-12 h-12 aspect-square object-cover rounded-full' />
                                        <div>
                                            <p className='font-medium'>{user.name}</p>
                                        </div>
                                    </td>
                                    <td className='p-3'>{user.email}</td>
                                    <td className='p-3'>
                                        <span className='px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-500'>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className='p-3'>
                                        <div className='flex items-center gap-3'>
                                            <button
                                                onClick={() => navigate(`/admin/users/${user._id}`)}
                                                className='rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white'
                                            >
                                                View
                                            </button>
                                            <img onClick={() => deleteUser(user._id)} src={assets.delete_icon} alt="" className='cursor-pointer' />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    )
}

export default ManageUsers
