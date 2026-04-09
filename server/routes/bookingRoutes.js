import express from "express";
import { changeBookingStatus, checkAvailablityofCar, createBooking, getOwnerBooking, getUserBooking, submitOwnerFeedback } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailablityofCar)
bookingRouter.post('/create', protect, upload.any(), createBooking)
bookingRouter.get('/user', protect, getUserBooking)
bookingRouter.get('/owner', protect, getOwnerBooking)
bookingRouter.post('/owner/change-status', protect, changeBookingStatus)
bookingRouter.post('/user/feedback', protect, submitOwnerFeedback)

export default bookingRouter;

