import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import OwnerFeedback from "../models/OwnerFeedback.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";

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
            feedbacks,
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
            OwnerFeedback.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('user', 'name')
                .populate('owner', 'name')
                .populate('booking', 'status'),
        ]);

        const totalRevenue = bookings.reduce((sum, booking) => {
            return booking.status === 'confirmed' ? sum + booking.price : sum;
        }, 0);

        const cancelledBookings = bookings.filter((booking) => booking.status === 'canceled').length;
        const occupancyRate = totalCars ? Math.round(((totalCars - availableCars) / totalCars) * 100) : 0;
        const complaintCount = feedbacks.filter((item) => item.type === 'complaint').length;
        const reviewItems = feedbacks.filter((item) => item.type === 'review' && item.rating);
        const averageOwnerRating = reviewItems.length
            ? Number((reviewItems.reduce((sum, item) => sum + item.rating, 0) / reviewItems.length).toFixed(1))
            : 0;

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
                totalFeedbacks: feedbacks.length,
                complaintCount,
                averageOwnerRating,
                recentFeedbacks: feedbacks,
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

// Get all newsletter subscribers
export const getNewsletterSubscribers = async (req, res) => {
    try {
        const subscribers = await NewsletterSubscriber.find()
            .sort({ createdAt: -1 })
            .select('email createdAt');
        res.json({ success: true, subscribers });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get pending owner verification requests
export const getOwnerRequests = async (req, res) => {
    try {
        const requests = await User.find({ ownerVerificationStatus: 'pending' })
            .select('-password')
            .sort({ ownerRegisteredAt: -1, createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get detailed user profile with booking analytics
export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const [bookings, submittedFeedbacks] = await Promise.all([
            Booking.find({ user: id })
                .sort({ createdAt: -1 })
                .populate('car', 'brand model image location pricePerDay')
                .populate('owner', 'name email image'),
            OwnerFeedback.find({ user: id })
                .sort({ createdAt: -1 })
                .populate('owner', 'name email image')
                .populate('booking', 'status pickupDate returnDate'),
        ]);

        const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed');
        const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
        const canceledBookings = bookings.filter((booking) => booking.status === 'canceled');
        const totalSpent = confirmedBookings.reduce((sum, booking) => sum + booking.price, 0);
        const averageBookingValue = confirmedBookings.length
            ? Math.round(totalSpent / confirmedBookings.length)
            : 0;

        const monthlyMap = new Map();
        bookings.forEach((booking) => {
            const date = new Date(booking.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const current = monthlyMap.get(monthKey) || { monthKey, bookings: 0, spend: 0 };
            current.bookings += 1;
            if (booking.status === 'confirmed') {
                current.spend += booking.price;
            }
            monthlyMap.set(monthKey, current);
        });

        const monthlyActivity = Array.from(monthlyMap.values())
            .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
            .slice(-12)
            .map((item) => ({
                monthKey: item.monthKey,
                label: new Date(`${item.monthKey}-01`).toLocaleString('en-US', { month: 'short' }),
                bookings: item.bookings,
                spend: item.spend,
            }));

        res.json({
            success: true,
            user,
            stats: {
                totalBookings: bookings.length,
                confirmedBookings: confirmedBookings.length,
                pendingBookings: pendingBookings.length,
                canceledBookings: canceledBookings.length,
                totalSpent,
                averageBookingValue,
                submittedFeedbacks: submittedFeedbacks.length,
            },
            recentBookings: bookings.slice(0, 15),
            submittedFeedbacks: submittedFeedbacks.slice(0, 15),
            monthlyActivity,
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Approve or reject owner verification request
export const reviewOwnerRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (action === 'approve') {
            user.role = 'owner';
            user.ownerVerificationStatus = 'approved';
        } else {
            user.role = 'user';
            user.ownerVerificationStatus = 'rejected';
        }

        user.ownerReviewedAt = new Date();
        await user.save();

        const message = action === 'approve'
            ? "Owner request approved successfully"
            : "Owner request rejected";

        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get detailed owner profile with analytics
export const getOwnerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const owner = await User.findById(id).select('-password');
        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        const [cars, bookings] = await Promise.all([
            Car.find({ owner: id }).sort({ createdAt: -1 }),
            Booking.find({ owner: id })
                .sort({ createdAt: -1 })
                .populate('user', 'name email image')
                .populate('car', 'brand model image pricePerDay location'),
        ]);
        const feedbacks = await OwnerFeedback.find({ owner: id })
            .sort({ createdAt: -1 })
            .populate('user', 'name email image')
            .populate('booking', 'pickupDate returnDate status');

        const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
        const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed');
        const canceledBookings = bookings.filter((booking) => booking.status === 'canceled');
        const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.price, 0);
        const availableCars = cars.filter((car) => car.isAvailable).length;
        const averageBookingValue = confirmedBookings.length
            ? Math.round(totalRevenue / confirmedBookings.length)
            : 0;
        const complaintsCount = feedbacks.filter((feedback) => feedback.type === 'complaint').length;
        const reviews = feedbacks.filter((feedback) => feedback.type === 'review' && feedback.rating);
        const averageOwnerRating = reviews.length
            ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
            : 0;
        const monthlyMap = new Map();

        bookings.forEach((booking) => {
            const bookingDate = new Date(booking.createdAt);
            const monthKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
            const current = monthlyMap.get(monthKey) || {
                monthKey,
                bookings: 0,
                revenue: 0,
                confirmedBookings: 0,
                pendingBookings: 0,
                canceledBookings: 0,
            };
            current.bookings += 1;
            if (booking.status === 'confirmed') {
                current.revenue += booking.price;
                current.confirmedBookings += 1;
            } else if (booking.status === 'pending') {
                current.pendingBookings += 1;
            } else if (booking.status === 'canceled') {
                current.canceledBookings += 1;
            }
            monthlyMap.set(monthKey, current);
        });

        const monthlyPerformance = Array.from(monthlyMap.values())
            .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
            .slice(-12)
            .map((item) => ({
                monthKey: item.monthKey,
                label: new Date(`${item.monthKey}-01`).toLocaleString('en-US', { month: 'short' }),
                bookings: item.bookings,
                revenue: item.revenue,
                confirmedBookings: item.confirmedBookings,
                pendingBookings: item.pendingBookings,
                canceledBookings: item.canceledBookings,
            }));

        res.json({
            success: true,
            owner,
            stats: {
                totalCars: cars.length,
                availableCars,
                totalBookings: bookings.length,
                pendingBookings: pendingBookings.length,
                confirmedBookings: confirmedBookings.length,
                canceledBookings: canceledBookings.length,
                totalRevenue,
                averageBookingValue,
                totalFeedbacks: feedbacks.length,
                complaintsCount,
                averageOwnerRating,
            },
            cars: cars.slice(0, 12),
            recentBookings: bookings.slice(0, 12),
            monthlyPerformance,
            recentFeedbacks: feedbacks.slice(0, 15),
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
