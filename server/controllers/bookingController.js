import Booking from "../models/Booking.js"
import Car from "../models/Car.js"

const combineDateTime = (date, time = '10:00') => {
    const parsedTime = time || '10:00'
    return new Date(`${date}T${parsedTime}:00`)
}

//Function to check Availaility of Car for given date
const checkAvailablity = async (car, pickupDate, returnDate, pickupTime = '10:00', returnTime = '10:00') => {
    const pickupDateTime = combineDateTime(pickupDate, pickupTime)
    const returnDateTime = combineDateTime(returnDate, returnTime)
    const bookings = await Booking.find({
        car,
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
        const { car, pickupDate, returnDate, pickupTime, returnTime } = req.body;

        if (!pickupDate || !returnDate || !pickupTime || !returnTime) {
            return res.json({ success: false, message: "Pickup and drop-off date/time are required" })
        }

        const isAvailable = await checkAvailablity(car, pickupDate, returnDate, pickupTime, returnTime)
        if(!isAvailable){
            return res.json({ success: false, message: "Car is not Available"})
        }
        
        const carData = await Car.findById(car)

        //Calculate price based on pickupDate and returnDate car Availability for given date using promise
        const picked = combineDateTime(pickupDate, pickupTime)
        const returned = combineDateTime(returnDate, returnTime)
        if (returned <= picked) {
            return res.json({ success: false, message: "Drop-off time must be after pickup time" })
        }
        const noOfDays = Math.ceil((returned-picked)/(1000*60*60*24))
        const price = carData.pricePerDay*noOfDays

        await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate: picked,
            returnDate: returned,
            pickupTime,
            returnTime,
            price
        })
        res.json({ success: true, message: "booking created"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to List User Bookings
export const getUserBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({user:_id}).populate("car").sort({createdAt:-1})
        res.json({ success: true, bookings})
        

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
