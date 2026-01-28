import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
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