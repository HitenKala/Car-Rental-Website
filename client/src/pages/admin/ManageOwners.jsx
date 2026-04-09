import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ManageOwners = () => {

    const { isAdmin, axios } = useAppContext()
    const navigate = useNavigate()

    const [owners, setOwners] = useState([])
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchOwnersData = async () => {
        try {
            setLoading(true)
            setError('')

            const [ownersRes, requestsRes] = await Promise.all([
                axios.get('/api/admin/owners'),
                axios.get('/api/admin/owner-requests'),
            ])

            if (ownersRes.data.success) {
                setOwners(ownersRes.data.owners)
            } else {
                setError(ownersRes.data.message || 'Failed to fetch owners')
                toast.error(ownersRes.data.message || 'Failed to fetch owners')
            }

            if (requestsRes.data.success) {
                setRequests(requestsRes.data.requests)
            } else {
                setError(requestsRes.data.message || 'Failed to fetch owner requests')
                toast.error(requestsRes.data.message || 'Failed to fetch owner requests')
            }
        } catch (fetchError) {
            setError(fetchError.message || 'Error fetching owners')
            toast.error(fetchError.message || 'Error fetching owners')
        } finally {
            setLoading(false)
        }
    }

    const reviewOwnerRequest = async (ownerId, action) => {
        try {
            const confirmMessage = action === 'approve'
                ? 'Approve this owner request?'
                : 'Reject this owner request?'
            const confirmAction = window.confirm(confirmMessage)
            if (!confirmAction) return

            const { data } = await axios.post(`/api/admin/owners/${ownerId}/review`, { action })
            if (data.success) {
                toast.success(data.message)
                fetchOwnersData()
            } else {
                toast.error(data.message)
            }
        } catch (reviewError) {
            toast.error(reviewError.message)
        }
    }

    const deleteOwner = async (ownerId) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this owner and all their cars?")
            if (!confirmDelete) return

            const { data } = await axios.delete(`/api/admin/owners/${ownerId}`)
            if (data.success) {
                toast.success(data.message)
                fetchOwnersData()
            } else {
                toast.error(data.message)
            }
        } catch (deleteError) {
            toast.error(deleteError.message)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchOwnersData()
        }
    }, [isAdmin])

    return (
        <div className='px-4 pt-10 md:px-10 w-full'>
            <Title title="Manage Owners" subTitle="Review owner applications and manage approved owners" />

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4'>
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {loading && (
                <div className='flex items-center justify-center h-40'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                        <p className='text-gray-600'>Loading owners...</p>
                    </div>
                </div>
            )}

            {!loading && (
                <div className='space-y-8 mt-6'>
                    <div>
                        <h3 className='text-lg font-semibold text-slate-900'>Pending Requests</h3>
                        {requests.length === 0 ? (
                            <p className='text-sm text-slate-500 mt-2'>No pending owner requests.</p>
                        ) : (
                            <div className='max-w-5xl w-full rounded-md mt-3 overflow-hidden border border-gray-300'>
                                <table className='w-full border-collapse text-left text-gray-700 text-sm'>
                                    <thead className='text-gray-500'>
                                        <tr>
                                            <th className='p-3 font-medium'>Applicant</th>
                                            <th className='p-3 font-medium'>Registration No.</th>
                                            <th className='p-3 font-medium'>Document</th>
                                            <th className='p-3 font-medium'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request._id} className='border-t border-gray-300 hover:bg-gray-50'>
                                                <td className='p-3 flex items-center gap-3'>
                                                    <img src={request.image || assets.user_profile} alt="" className='w-12 h-12 aspect-square object-cover rounded-full' />
                                                    <div>
                                                        <p className='font-medium'>{request.name}</p>
                                                        <p className='text-xs text-slate-500'>{request.email}</p>
                                                    </div>
                                                </td>
                                                <td className='p-3'>{request.ownerRegistrationNumber || '-'}</td>
                                                <td className='p-3'>
                                                    {request.ownerRegistrationDocument ? (
                                                        <a
                                                            href={request.ownerRegistrationDocument}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            className='text-blue-600 underline'
                                                        >
                                                            View document
                                                        </a>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>
                                                <td className='p-3'>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => navigate(`/admin/owners/${request._id}`)}
                                                            className='rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white'
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => reviewOwnerRequest(request._id, 'approve')}
                                                            className='rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white'
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => reviewOwnerRequest(request._id, 'reject')}
                                                            className='rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white'
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className='text-lg font-semibold text-slate-900'>Approved Owners</h3>
                        {owners.length === 0 ? (
                            <p className='text-sm text-slate-500 mt-2'>No approved owners found.</p>
                        ) : (
                            <div className='max-w-4xl w-full rounded-md mt-3 overflow-hidden border border-gray-300'>
                                <table className='w-full border-collapse text-left text-gray-700 text-sm'>
                                    <thead className='text-gray-500'>
                                        <tr>
                                            <th className='p-3 font-medium'>Owner</th>
                                            <th className='p-3 font-medium'>Email</th>
                                            <th className='p-3 font-medium'>Status</th>
                                            <th className='p-3 font-medium'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {owners.map((owner) => (
                                            <tr key={owner._id} className='border-t border-gray-300 hover:bg-gray-50'>
                                                <td className='p-3 flex items-center gap-3'>
                                                    <img src={owner.image || assets.user_profile} alt="" className='w-12 h-12 aspect-square object-cover rounded-full' />
                                                    <div>
                                                        <p className='font-medium'>{owner.name}</p>
                                                    </div>
                                                </td>
                                                <td className='p-3'>{owner.email}</td>
                                                <td className='p-3'>
                                                    <span className='px-3 py-1 rounded-full text-xs bg-green-100 text-green-600'>
                                                        Approved
                                                    </span>
                                                </td>
                                                <td className='p-3'>
                                                    <div className='flex items-center gap-3'>
                                                        <button
                                                            onClick={() => navigate(`/admin/owners/${owner._id}`)}
                                                            className='rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white'
                                                        >
                                                            View
                                                        </button>
                                                        <img onClick={() => deleteOwner(owner._id)} src={assets.delete_icon} alt="" className='cursor-pointer' />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageOwners
