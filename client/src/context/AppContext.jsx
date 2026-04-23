import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate();
    const currency = '\u20B9';

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')
    const [pickupTime, setPickupTime] = useState('10:00')
    const [returnTime, setReturnTime] = useState('10:00')
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    const [cars, setCars] = useState([])

    //Function to check if user is logged in
    const fetchUser = async () => {
        try {
            console.log('Fetching user data...')
            const { data } = await axios.get('/api/user/data')
            console.log('User data response:', data)
            if (data.success) {
                setUser(data.user)
                const isAdminUser = data.user.role === 'admin'
                const isOwnerUser = data.user.role === 'owner' || isAdminUser
                setIsOwner(isOwnerUser)
                setIsAdmin(isAdminUser)
                console.log('User role:', data.user.role, 'isAdmin:', isAdminUser, 'isOwner:', isOwnerUser)
            }
            else {
                console.warn('API returned success: false', data.message)
                navigate('/')
            }
        } catch (error) {
            console.error('Error fetching user:', error.message)
            toast.error(error.message);
        } finally {
            console.log('Setting isCheckingAuth to false')
            setIsCheckingAuth(false)
        }
    }

    //Function to fetch all cars
    const fetchCars = async () => {
        try {
            const { data } = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : toast.error(data.message)

        } catch (error) {
            toast.error(error.message);
        }
    }
    //Function to logout user
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsOwner(false);
        setIsAdmin(false);
        axios.defaults.headers.common['Authorization'] = '';
        toast.success('You have been Logged out successfully');
    }


    //useEffect to retrieve the token from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token')
        console.log('Retrieved token from localStorage:', token ? 'Yes' : 'No')
        setToken(token)
        if (!token) {
            console.log('No token found, setting isCheckingAuth to false')
            setIsCheckingAuth(false)
        }
        fetchCars();
    }, [])

    //useEffect to fetch user data when token is available
    useEffect(() => {
        if (token) {
            console.log('Token available, setting axios Authorization header and fetching user')
            axios.defaults.headers.common['Authorization'] = `${token}`;
            fetchUser();
        } else {
            console.log('No token available')
        }
    }, [token])


    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, isOwner, setIsOwner, isAdmin, setIsAdmin, fetchUser,
        showLogin, setShowLogin, logout, fetchCars,
        cars, setCars, pickupDate, setPickupDate, returnDate, setReturnDate,
        pickupTime, setPickupTime, returnTime, setReturnTime,
        isCheckingAuth
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )

}

export const useAppContext = () => {
    return useContext(AppContext);
}
