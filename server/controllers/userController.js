import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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
            return res.json({sucess:false, message:"Fill all the fields correctly"})
        }
        const userExists = await User.findOne({email})
        if (userExists){
            return res.json({sucess:false, message:"User already exists"})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({name,email,password:hashedPassword})
        const token = generateToken(user._id.toString())
        res.json({sucess: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({sucess:false, message:error.message})
    }
}

//User Login
export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user){
            return res.json({sucess:false, message:"User does not exist"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch){
            return res.json({sucess:false, message:"Invalid credentials"})
        }
        const token = generateToken(user._id.toString())
        res.json({sucess: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({sucess:false, message:error.message})
    }
}