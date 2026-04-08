import express from "express"
import { forgotPassword, getCars, getUserData, loginUser, regsisterUser, resetPassword } from "../controllers/userController.js"
import { protect } from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post("/register", regsisterUser)
userRouter.post("/login", loginUser)
userRouter.post("/forgot-password", forgotPassword)
userRouter.post("/reset-password", resetPassword)
userRouter.get("/data", protect, getUserData)
userRouter.get("/cars", getCars)

export default userRouter
