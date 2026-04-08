import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

// Get admin dashboard data
export const getAdminDashboardData = async (req, res) => {
    try {
        const [
            totalUsers,
            totalOwners,
            totalCars,
            totalBookings,
            pendingBookings,
            confirmedBookings,
            availableCars,
            recentBookings,
            bookings,
            cars,
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'owner' }),
            Car.countDocuments(),
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'confirmed' }),
            Car.countDocuments({ isAvailable: true }),
            Booking.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name')
                .populate('owner', 'name')
                .populate('car', 'brand model location image'),
            Booking.find().sort({ createdAt: 1 }),
            Car.find().select('location isAvailable'),
        ]);

        const totalRevenue = bookings.reduce((sum, booking) => {
            return booking.status === 'confirmed' ? sum + booking.price : sum;
        }, 0);

        const cancelledBookings = bookings.filter((booking) => booking.status === 'canceled').length;
        const occupancyRate = totalCars ? Math.round(((totalCars - availableCars) / totalCars) * 100) : 0;

        const bookingsByMonthMap = new Map();
        bookings.forEach((booking) => {
            const date = new Date(booking.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const current = bookingsByMonthMap.get(monthKey) || { monthKey, bookings: 0, revenue: 0 };
            current.bookings += 1;
            if (booking.status === 'confirmed') {
                current.revenue += booking.price;
            }
            bookingsByMonthMap.set(monthKey, current);
        });

        const monthlyPerformance = Array.from(bookingsByMonthMap.values())
            .slice(-6)
            .map((item) => ({
                label: new Date(`${item.monthKey}-01`).toLocaleString('en-US', { month: 'short' }),
                bookings: item.bookings,
                revenue: item.revenue,
            }));

        const locationMap = new Map();
        cars.forEach((car) => {
            const current = locationMap.get(car.location) || { city: car.location, cars: 0, available: 0 };
            current.cars += 1;
            if (car.isAvailable) current.available += 1;
            locationMap.set(car.location, current);
        });

        const topLocations = Array.from(locationMap.values())
            .sort((a, b) => b.cars - a.cars)
            .slice(0, 4);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalOwners,
                totalCars,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                availableCars,
                cancelledBookings,
                totalRevenue,
                occupancyRate,
                recentBookings,
                monthlyPerformance,
                topLocations,
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all owners
export const getAllOwners = async (req, res) => {
    try {
        const owners = await User.find({ role: 'owner' }).select('-password');
        res.json({ success: true, owners });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all cars
export const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().populate('owner', 'name email');
        res.json({ success: true, cars });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('owner', 'name email')
            .populate('car');

        console.log('\n========== BOOKINGS FETCH DEBUG ==========');
        console.log('Total bookings fetched:', bookings.length);

        bookings.forEach((b, idx) => {
            console.log(`\nBooking ${idx}:`, {
                bookingId: b._id,
                carId: b.car?._id,
                carExists: !!b.car,
                carBrand: b.car?.brand,
                carModel: b.car?.model,
                carImage: b.car?.image,
                carImageExists: !!b.car?.image,
                allCarFields: Object.keys(b.car || {})
            });
        });
        console.log('========================================\n');

        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete owner
export const deleteOwner = async (req, res) => {
    try {
        const { id } = req.params;
        // Also delete all cars owned by this owner
        await Car.deleteMany({ owner: id });
        await User.findByIdAndDelete(id);
        res.json({ success: true, message: "Owner and their cars deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete car
export const deleteCar = async (req, res) => {
    try {
        const { id } = req.params;
        await Car.findByIdAndDelete(id);
        res.json({ success: true, message: "Car deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await Booking.findByIdAndUpdate(id, { status });
        res.json({ success: true, message: "Booking status updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
