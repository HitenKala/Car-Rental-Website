import express from "express";
import { protect } from "../middleware/auth.js";
import { addCar, changeRoleToOwner, deleteCar, getDashboardData, getOwnerCars, toggleCarAvailability, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

// Middleware to validate multipart/form-data header (must include boundary)
function validateMultipart(req, res, next) {
	const contentType = req.headers["content-type"] || "";
	if (!contentType.includes("multipart/form-data") || !contentType.includes("boundary=")) {
		return res.status(400).json({ success: false, message: 'Expected multipart/form-data with boundary. Use Body->form-data in Postman and do NOT set Content-Type manually.' });
	}
	next();
}

ownerRouter.post("/change-role", protect, changeRoleToOwner)
ownerRouter.post("/add-car", protect, validateMultipart, upload.any(), addCar)
ownerRouter.get("/cars", protect, getOwnerCars)
ownerRouter.post("/toggle-car", protect, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, deleteCar)

ownerRouter.get("/dashboard", protect, getDashboardData)
ownerRouter.post("/update-image", protect, validateMultipart, upload.any(), updateUserImage)

export default ownerRouter;