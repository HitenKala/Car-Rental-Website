import Booking from "../models/Booking.js"
import Car from "../models/Car.js"

//Function to check Availaility of Car for given date
const checkAvailablity = async(car, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        car,
        pickupDate:{$lte:returnDate},
        returnDate:{$lte:pickupDate},

    })
    return bookings.length === 0;
}
//API to check Availaility of Cars for given date and location
export const checkAvailablityofCar = async(req, res)=>{
    try {
        const {location, pickupDate, returnDate} = req.body;

        //fetch all the cars in given location
        const cars = await Car.find({location, isAvailable:true})

        //check car Availability for given date using promise
        const availableCarsPromises = cars.map(async(car)=>{
            const isAvailable = await checkAvailablity(car._id, pickupDate, returnDate)
            return{...car._doc, isAvailable:isAvailable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car =>car.isAvailable === true)

        res.json({success:true, availableCars})
        
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//API to create booking