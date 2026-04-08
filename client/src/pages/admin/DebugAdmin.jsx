import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'

const DebugAdmin = () => {
    const { token, user, isAdmin, isCheckingAuth, axios } = useAppContext()
    const [apiResponse, setApiResponse] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const testAPI = async () => {
            try {
                const { data } = await axios.get('/api/user/data')
                setApiResponse(data)
            } catch (err) {
                setError(err.message)
            }
        }
        if (token) {
            testAPI()
        }
    }, [token])

    return (
        <div className='p-8 max-w-2xl mx-auto'>
            <h1 className='text-2xl font-bold mb-6'>Admin Authentication Debug</h1>

            <div className='space-y-4 bg-gray-100 p-4 rounded-lg mb-6'>
                <div className='flex justify-between'>
                    <span className='font-semibold'>Token Present:</span>
                    <span className={token ? 'text-green-600' : 'text-red-600'}>{token ? 'YES ✓' : 'NO ✗'}</span>
                </div>

                <div className='flex justify-between'>
                    <span className='font-semibold'>Is Checking Auth:</span>
                    <span>{isCheckingAuth ? 'YES (loading...)' : 'NO (done)'}</span>
                </div>

                <div className='flex justify-between'>
                    <span className='font-semibold'>Is Admin:</span>
                    <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>{isAdmin ? 'YES ✓' : 'NO ✗'}</span>
                </div>

                <div className='flex justify-between'>
                    <span className='font-semibold'>User Name:</span>
                    <span>{user?.name || 'Not loaded'}</span>
                </div>

                <div className='flex justify-between'>
                    <span className='font-semibold'>User Role:</span>
                    <span className={user?.role === 'admin' ? 'text-green-600 font-bold' : 'text-orange-600'}>{user?.role || 'Not loaded'}</span>
                </div>
            </div>

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6'>
                    <p className='font-semibold'>API Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {apiResponse && (
                <div className='bg-blue-100 border border-blue-400 text-blue-900 p-4 rounded mb-6'>
                    <p className='font-semibold mb-2'>API Response:</p>
                    <pre className='text-xs overflow-auto'>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
            )}

            <div className='bg-yellow-100 border border-yellow-400 p-4 rounded'>
                <p className='font-semibold mb-2'>What to check:</p>
                <ul className='list-disc list-inside space-y-1 text-sm'>
                    <li>If "Is Admin" is NO, your user role in MongoDB is NOT "admin"</li>
                    <li>If "Token Present" is NO, you're not logged in</li>
                    <li>If API Error shows, backend server may not be running</li>
                    <li>Check the console (F12) for detailed logs</li>
                </ul>
            </div>
        </div>
    )
}

export default DebugAdmin
