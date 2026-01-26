import User from "../models/User.js";
import fs from 'fs';
import ImageKit from '@imagekit/nodejs';
import Car from "../models/Car.js";
import Booking from "../models/Booking.js"

//API to change role of user
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" })
        res.json({ sucess: true, message: "Now you can list your cars" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }

}

//API to list cars

export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!req.body || !req.body.carData) {
            return res.status(400).json({ success: false, message: 'Missing carData in form body' });
        }
        // Accept file from req.file (single) or req.files (upload.any())
        if (!req.file && !(req.files && req.files.length)) {
            return res.status(400).json({ success: false, message: 'Missing image file' });
        }

        let car;
        try {
            car = JSON.parse(req.body.carData);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'carData must be valid JSON string' });
        }

        const imageFile = req.file ? req.file : req.files[0];

        //Upload Image to Imagekit
        const client = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

        const uploadRes = await client.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname,
            folder: '/cars'
        });

        // Remove temporary file written by multer to free disk space
        fs.unlink(imageFile.path, (err) => {
            if (err) console.error('Failed to remove temp file:', err);
        });

        const uploadedPath = uploadRes.filePath || uploadRes.name || uploadRes.url;

        // Generate optimized image URL with transformations
        const optimizedImageUrl = client.helper.buildSrc({
            src: uploadedPath,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            transformation: [
                { width: 1280, quality: 'auto', format: 'webp' }
            ]
        });

        const image = optimizedImageUrl || uploadRes.url || uploadedPath;
        await Car.create({ ...car, owner: _id, image })

        res.json({ sucess: true, message: "car added" })


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message || 'Server error' })
    }
}

//API to list owner cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id })
        res.json({ success: true, cars })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to Toggle Car Availablity
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body
        const car = await Car.findById(carId)

        //Checking if car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" })
        }
        car.isAvailable = !car.isAvailable;
        await car.save()

        res.json({ success: true, message: "Availability Toggled" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to delete the Car
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body
        const car = await Car.findById(carId)

        //Checking if car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" })
        }

        car.owner = null;
        car.isAvailable = false;
        await car.save()

        res.json({ success: true, message: "Car Removed" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" })
        }
        const cars = await Car.find({ owner: _id })
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({ owner: _id, status: "pending" })

        const completedBookings = await Booking.find({ owner: _id, status: "confirmed" })

        //Calcuate monthlyRevenue where status Booking are Confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status == "confirmed").reduce((acc, booking) => acc + booking.price, 0)
        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }
        res.json({ success: true, dashboardData })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to update user image

export const updateUserImage = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const imageFile = req.file ? req.file : req.files[0];

        //Upload Image to Imagekit
        const client = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

        const uploadRes = await client.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname,
            folder: '/user'
        });

        const optimizedImageUrl = client.helper.buildSrc({
            src: uploadRes.url,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            transformation: [
                { width: 400, quality: 'auto', format: 'webp' }
            ]
        });

        const image = optimizedImageUrl || uploadRes.url || uploadedPath;
        await User.findByIdAndUpdate(_id, { image });

        res.json({ success: true, message: "image updated" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}