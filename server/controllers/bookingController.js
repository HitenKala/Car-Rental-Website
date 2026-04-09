import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
import OwnerFeedback from "../models/OwnerFeedback.js";
import fs from 'fs';
import ImageKit from '@imagekit/nodejs';

const combineDateTime = (date, time = '10:00') => {
    const parsedTime = time || '10:00'
    return new Date(`${date}T${parsedTime}:00`)
}

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed'];

//Function to check Availaility of Car for given date
const checkAvailablity = async (car, pickupDate, returnDate, pickupTime = '10:00', returnTime = '10:00') => {
    const pickupDateTime = combineDateTime(pickupDate, pickupTime)
    const returnDateTime = combineDateTime(returnDate, returnTime)
    const bookings = await Booking.find({
        car,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        pickupDate: { $lt: returnDateTime },
        returnDate: { $gt: pickupDateTime },

    })
    return bookings.length === 0;
}
//API to check Availaility of Cars for given date and location
export const checkAvailablityofCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate, pickupTime, returnTime } = req.body;

        //fetch all the cars in given location
        const cars = await Car.find({ location, isAvailable: true })

        //check car Availability for given date using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailablity(car._id, pickupDate, returnDate, pickupTime, returnTime)
            return { ...car._doc, isAvailable: isAvailable }
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true)

        res.json({ success: true, availableCars })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to create booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const {
            car,
            pickupDate,
            returnDate,
            pickupTime,
            returnTime,
            renterName,
            renterEmail,
            renterPhone,
            drivingLicenseNumber,
            emergencyContactName,
            emergencyContactPhone,
            pickupAddress,
            notes,
        } = req.body;

        const allFiles = req.file ? [req.file] : (req.files || []);
        const drivingLicenseFile = allFiles.find((file) => file.fieldname === 'drivingLicenseDocument');
        const additionalDocFile = allFiles.find((file) => file.fieldname === 'additionalDocument');

        if (!pickupDate || !returnDate || !pickupTime || !returnTime) {
            return res.json({ success: false, message: "Pickup and drop-off date/time are required" })
        }

        if (!renterName || !renterEmail || !renterPhone || !drivingLicenseNumber) {
            return res.json({ success: false, message: "Name, email, mobile number and driving license number are required" })
        }

        if (!drivingLicenseFile) {
            return res.json({ success: false, message: "Driving license document is required" })
        }

        const isAvailable = await checkAvailablity(car, pickupDate, returnDate, pickupTime, returnTime)
        if(!isAvailable){
            return res.json({ success: false, message: "Car is not Available"})
        }

        // Acquire a short DB lock on this car to prevent concurrent overlapping bookings.
        const lockExpiry = new Date(Date.now() + 15 * 1000);
        const carData = await Car.findOneAndUpdate(
            {
                _id: car,
                $or: [
                    { bookingLockUntil: null },
                    { bookingLockUntil: { $lte: new Date() } },
                ],
            },
            { $set: { bookingLockUntil: lockExpiry } },
            { new: true }
        );

        if (!carData) {
            return res.json({ success: false, message: "This car is being booked right now. Please retry in a moment." })
        }

        try {
            // Re-check while holding lock to eliminate race conditions.
            const isStillAvailable = await checkAvailablity(car, pickupDate, returnDate, pickupTime, returnTime)
            if (!isStillAvailable) {
                return res.json({ success: false, message: "Car is not available for the selected dates/times" })
            }

            //Calculate price based on pickupDate and returnDate car Availability for given date using promise
            const picked = combineDateTime(pickupDate, pickupTime)
            const returned = combineDateTime(returnDate, returnTime)
            if (returned <= picked) {
                return res.json({ success: false, message: "Drop-off time must be after pickup time" })
            }
            const noOfDays = Math.ceil((returned-picked)/(1000*60*60*24))
            const price = carData.pricePerDay*noOfDays

            const client = new ImageKit({
                publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
                privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
            });

            const licenseUploadRes = await client.files.upload({
                file: fs.createReadStream(drivingLicenseFile.path),
                fileName: drivingLicenseFile.originalname,
                folder: '/booking-docs/license'
            });

            let additionalDocUrl = '';
            if (additionalDocFile) {
                const additionalUploadRes = await client.files.upload({
                    file: fs.createReadStream(additionalDocFile.path),
                    fileName: additionalDocFile.originalname,
                    folder: '/booking-docs/additional'
                });
                additionalDocUrl = additionalUploadRes.url || additionalUploadRes.filePath || additionalUploadRes.name;
                fs.unlink(additionalDocFile.path, (err) => {
                    if (err) console.error('Failed to remove additional booking temp file:', err);
                });
            }

            fs.unlink(drivingLicenseFile.path, (err) => {
                if (err) console.error('Failed to remove license temp file:', err);
            });
            const drivingLicenseDocument = licenseUploadRes.url || licenseUploadRes.filePath || licenseUploadRes.name;

            await Booking.create({
                car,
                owner: carData.owner,
                user: _id,
                pickupDate: picked,
                returnDate: returned,
                pickupTime,
                returnTime,
                price,
                renterDetails: {
                    name: String(renterName).trim(),
                    email: String(renterEmail).trim(),
                    mobileNumber: String(renterPhone).trim(),
                    drivingLicenseNumber: String(drivingLicenseNumber).trim(),
                    emergencyContactName: (emergencyContactName || '').trim(),
                    emergencyContactPhone: (emergencyContactPhone || '').trim(),
                    pickupAddress: (pickupAddress || '').trim(),
                    notes: (notes || '').trim(),
                },
                renterDocuments: {
                    drivingLicenseDocument,
                    additionalDocument: additionalDocUrl,
                },
            })
            res.json({ success: true, message: "booking created"})
        } finally {
            await Car.findByIdAndUpdate(car, { $set: { bookingLockUntil: null } });
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to List User Bookings
export const getUserBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({ createdAt: -1 })
        const bookingIds = bookings.map((booking) => booking._id);
        const feedbacks = await OwnerFeedback.find({ user: _id, booking: { $in: bookingIds } }).sort({ createdAt: -1 });
        const feedbackMap = new Map(feedbacks.map((feedback) => [feedback.booking.toString(), feedback]));
        const bookingsWithFeedback = bookings.map((booking) => ({
            ...booking._doc,
            ownerFeedback: feedbackMap.get(booking._id.toString()) || null,
        }));

        res.json({ success: true, bookings: bookingsWithFeedback })
        

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to get Owner Bookings
export const getOwnerBooking = async (req, res) => {
    try {
        if(req.user.role !== 'owner' && req.user.role !== 'admin'){
            return res.json({ success: false, message: "Unauthorized" })
        }
        const bookings = await Booking.find({owner: req.user._id}).populate("car user").select("-user.password").sort({createdAt:-1})
        res.json({ success: true, bookings})
        

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
//API to Change the Bookings status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const {bookingId, status} = req.body

        const booking = await Booking.findById(bookingId)
        
        if(booking.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized" })
        }

        booking.status = status;
        await booking.save();
       
        res.json({ success: true, message: "Status Updated"})
        

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to submit owner review/complaint
export const submitOwnerFeedback = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, type, rating, message } = req.body;

        if (!bookingId || !type || !message?.trim()) {
            return res.status(400).json({ success: false, message: "bookingId, type and message are required" });
        }

        if (!["review", "complaint"].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid feedback type" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (booking.status !== "confirmed") {
            return res.status(400).json({ success: false, message: "Feedback can be submitted only for confirmed bookings" });
        }

        const existing = await OwnerFeedback.findOne({ booking: bookingId, user: _id });
        if (existing) {
            return res.status(400).json({ success: false, message: "Feedback already submitted for this booking" });
        }

        const feedback = await OwnerFeedback.create({
            booking: bookingId,
            user: _id,
            owner: booking.owner,
            type,
            rating: type === "review" ? Number(rating) || null : null,
            message: message.trim(),
        });

        res.json({ success: true, message: "Feedback submitted successfully", feedback });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
