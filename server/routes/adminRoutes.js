import express from "express";
import { protect } from "../middleware/auth.js";
import {
    getAllUsers,
    getUserDetails,
    getAllOwners,
    getAllCars,
    getAllBookings,
    getNewsletterSubscribers,
    getOwnerRequests,
    reviewOwnerRequest,
    getOwnerDetails,
    deleteUser,
    deleteOwner,
    deleteCar,
    updateBookingStatus,
    getAdminDashboardData
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.json({ success: false, message: "Access denied. Admin only." });
    }
    next();
};

// Apply both protect and adminOnly to all admin routes
adminRouter.use(protect);
adminRouter.use(adminOnly);

adminRouter.get("/dashboard", getAdminDashboardData);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/:id", getUserDetails);
adminRouter.get("/owners", getAllOwners);
adminRouter.get("/owners/:id", getOwnerDetails);
adminRouter.get("/owner-requests", getOwnerRequests);
adminRouter.get("/cars", getAllCars);
adminRouter.get("/bookings", getAllBookings);
adminRouter.get("/newsletter", getNewsletterSubscribers);
adminRouter.post("/owners/:id/review", reviewOwnerRequest);

adminRouter.delete("/users/:id", deleteUser);
adminRouter.delete("/owners/:id", deleteOwner);
adminRouter.delete("/cars/:id", deleteCar);
adminRouter.post("/bookings/:id/status", updateBookingStatus);

export default adminRouter;
