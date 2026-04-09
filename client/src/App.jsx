import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetails from './pages/CarDetails'
import MyBookings from './pages/MyBookings'
import Footer from './components/Footer';
import Layout from './pages/owner/Layout';
import Dashboard from './pages/owner/Dashboard';
import AddCar from './pages/owner/AddCar';
import ManageCar from './pages/owner/ManageCar';
import ManageBookings from './pages/owner/ManageBookings';
import Login from './components/Login';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './context/AppContext';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import UserDetails from './pages/admin/UserDetails';
import ManageOwners from './pages/admin/ManageOwners';
import OwnerDetails from './pages/admin/OwnerDetails';
import ManageCars from './pages/admin/ManageCars';
import ManageBookingsAdmin from './pages/admin/ManageBookings';
import NewsletterSubscribers from './pages/admin/NewsletterSubscribers';
import DebugAdmin from './pages/admin/DebugAdmin';
import InfoPage from './pages/InfoPage';

const App = () => {

  const { showLogin } = useAppContext();
  const isOwnerPath = useLocation().pathname.startsWith('/owner')
  const isAdminPath = useLocation().pathname.startsWith('/admin')

  return (
    <>
      <Toaster />

      {showLogin && <Login />}

      {!isOwnerPath && !isAdminPath && <Navbar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/car-details/:id' element={<CarDetails />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/info/:slug' element={<InfoPage />} />
        <Route path='/owner' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='add-car' element={<AddCar />} />
          <Route path='manage-cars' element={<ManageCar />} />
          <Route path='manage-bookings' element={<ManageBookings />} />
        </Route>
        <Route path='/admin-debug' element={<DebugAdmin />} />
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path='users' element={<ManageUsers />} />
          <Route path='users/:id' element={<UserDetails />} />
          <Route path='owners' element={<ManageOwners />} />
          <Route path='owners/:id' element={<OwnerDetails />} />
          <Route path='cars' element={<ManageCars />} />
          <Route path='bookings' element={<ManageBookingsAdmin />} />
          <Route path='newsletter' element={<NewsletterSubscribers />} />
        </Route>
      </Routes>

      {!isOwnerPath && !isAdminPath && <Footer />}

    </>
  )
}

export default App
