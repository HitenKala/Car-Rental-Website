import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const NewsletterSubscribers = () => {
    const { isAdmin, axios } = useAppContext()
    const [subscribers, setSubscribers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchSubscribers = async () => {
        try {
            setLoading(true)
            setError('')
            const { data } = await axios.get('/api/admin/newsletter')
            if (data.success) {
                setSubscribers(data.subscribers || [])
            } else {
                setError(data.message || 'Failed to fetch newsletter subscribers')
                toast.error(data.message || 'Failed to fetch newsletter subscribers')
            }
        } catch (fetchError) {
            setError(fetchError.message || 'Failed to fetch newsletter subscribers')
            toast.error(fetchError.message || 'Failed to fetch newsletter subscribers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchSubscribers()
        }
    }, [isAdmin])

    return (
        <div className='px-4 pt-10 md:px-10 w-full'>
            <Title title="Newsletter Subscribers" subTitle="View all users who subscribed for updates and offers" />

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4'>
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {loading && (
                <div className='flex items-center justify-center h-40'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                        <p className='text-gray-600'>Loading subscribers...</p>
                    </div>
                </div>
            )}

            {!loading && subscribers.length === 0 && !error && (
                <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4'>
                    <p>No newsletter subscribers found yet.</p>
                </div>
            )}

            {!loading && subscribers.length > 0 && (
                <div className='max-w-4xl w-full rounded-md mt-6 overflow-hidden border border-gray-300'>
                    <table className='w-full border-collapse text-left text-gray-700 text-sm'>
                        <thead className='text-gray-500'>
                            <tr>
                                <th className='p-3 font-medium'>#</th>
                                <th className='p-3 font-medium'>Email</th>
                                <th className='p-3 font-medium'>Subscribed On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((item, index) => (
                                <tr key={item._id || index} className='border-t border-gray-300 hover:bg-gray-50'>
                                    <td className='p-3'>{index + 1}</td>
                                    <td className='p-3 font-medium'>{item.email}</td>
                                    <td className='p-3'>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default NewsletterSubscribers
