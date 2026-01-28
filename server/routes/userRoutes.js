import express from "express"
import { getCars, getUserData, loginUser, regsisterUser } from "../controllers/userController.js"
import { protect } from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post("/register", regsisterUser)
userRouter.post("/login", loginUser)
userRouter.get("/data", protect, getUserData)
userRouter.get("/cars", getCars)

export default userRouter