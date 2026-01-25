import express from "express";
import { changeBookingStatus, checkAvailablityofCar, createBooking, getOwnerBooking, getUserBooking } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailablityofCar)
bookingRouter.post('/create',protect, createBooking)
bookingRouter.get('/user',protect, getUserBooking)
bookingRouter.get('/create',protect, getOwnerBooking)
bookingRouter.post('/change-status',protect, changeBookingStatus)

export default bookingRouter;

