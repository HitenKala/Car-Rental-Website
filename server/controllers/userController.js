import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import Car from "../models/Car.js";

//Generate JWT Token
const generateToken = (userID)=>{
    const payload = userID;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

//User Registration
export const regsisterUser = async(req, res) => {
    try {
        const {name, email, password} = req.body

        if (!name || !email || !password || password.length<8){
            return res.json({success:false, message:"Fill all the fields correctly"})
        }
        const userExists = await User.findOne({email})
        if (userExists){
            return res.json({success:false, message:"User already exists"})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({name,email,password:hashedPassword})
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//User Login
export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user){
            return res.json({success:false, message:"User does not exist"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch){
            return res.json({success:false, message:"Invalid credentials"})
        }
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//Get User data from token(JWT)
export const getUserData = async(req,res)=>{
    try {
        const {user} = req;
        if (!user) {
            return res.json({success:false, message:"User not found"})
        }
        res.json({success:true, user})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//Get All Cars for the frontend
export const getCars = async(req,res)=>{
    try {
        const cars = await Car.find({isAvailable:true})
        res.json({success:true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//Request password reset
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.json({ success: false, message: "Email is required" })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const resetCode = crypto.randomInt(100000, 999999).toString()
        const hashedResetCode = await bcrypt.hash(resetCode, 10)

        user.resetPasswordCode = hashedResetCode
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)
        await user.save()

        const response = {
            success: true,
            message: "Password reset code generated. It expires in 15 minutes.",
        }

        if (process.env.NODE_ENV !== "production") {
            response.resetCode = resetCode
        }

        console.log(`Password reset code for ${email}: ${resetCode}`)

        res.json(response)
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//Reset password with code
export const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body

        if (!email || !code || !password || password.length < 8) {
            return res.json({ success: false, message: "Provide a valid email, reset code, and password" })
        }

        const user = await User.findOne({ email })

        if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
            return res.json({ success: false, message: "No password reset request found" })
        }

        if (user.resetPasswordExpires.getTime() < Date.now()) {
            user.resetPasswordCode = ''
            user.resetPasswordExpires = null
            await user.save()
            return res.json({ success: false, message: "Reset code expired. Please request a new one." })
        }

        const isCodeValid = await bcrypt.compare(code, user.resetPasswordCode)

        if (!isCodeValid) {
            return res.json({ success: false, message: "Invalid reset code" })
        }

        user.password = await bcrypt.hash(password, 10)
        user.resetPasswordCode = ''
        user.resetPasswordExpires = null
        await user.save()

        res.json({ success: true, message: "Password updated successfully" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
