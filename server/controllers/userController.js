import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import nodemailer from "nodemailer"
import Car from "../models/Car.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";

const mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

const sendResetCodeEmail = async (recipientEmail, resetCode) => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email is not configured in environment variables. Reset code will not be delivered by email.');
        return false;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Turbo Rides password reset code',
        text: `Your Turbo Rides password reset code is ${resetCode}. This code expires in 15 minutes.`,
        html: `<p>Your Turbo Rides password reset code is <strong>${resetCode}</strong>.</p><p>This code expires in 15 minutes.</p>`,
    }

    await mailTransporter.sendMail(mailOptions)
    return true
}

//Generate JWT Token
const generateToken = (userID) => {
    const payload = userID;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

//User Registration
export const regsisterUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password || password.length < 8) {
            return res.json({ success: false, message: "Fill all the fields correctly" })
        }
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.json({ success: false, message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword })
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//User Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//Get User data from token(JWT)
export const getUserData = async (req, res) => {
    try {
        const { user } = req;
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//Get All Cars for the frontend
export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({ isAvailable: true })
        res.json({ success: true, cars })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
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

        const emailDelivered = await sendResetCodeEmail(email, resetCode)
        const isProduction = process.env.NODE_ENV === "production"

        const response = {
            success: emailDelivered || !isProduction,
            message: emailDelivered
                ? "Password reset code sent to your email. It expires in 15 minutes."
                : !isProduction
                    ? "Reset code generated (development mode). Use it to reset your password."
                    : "Password reset request created, but email delivery is not configured. Check server logs or configure SMTP settings.",
        }

        // Always include reset code in non-production for testing
        if (!emailDelivered && !isProduction) {
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

//Newsletter subscription
export const subscribeNewsletter = async (req, res) => {
    try {
        const email = (req.body?.email || '').trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address" });
        }

        const existing = await NewsletterSubscriber.findOne({ email });
        if (existing) {
            return res.json({ success: true, message: "This email is already subscribed" });
        }

        await NewsletterSubscriber.create({ email });
        res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
