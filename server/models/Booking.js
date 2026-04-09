import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({

    car: { type: ObjectId, ref: "Car", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    pickupTime: { type: String, default: '10:00' },
    returnTime: { type: String, default: '10:00' },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    price: { type: Number, required: true },
    renterDetails: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        mobileNumber: { type: String, default: '' },
        drivingLicenseNumber: { type: String, default: '' },
        emergencyContactName: { type: String, default: '' },
        emergencyContactPhone: { type: String, default: '' },
        pickupAddress: { type: String, default: '' },
        notes: { type: String, default: '' },
    },
    renterDocuments: {
        drivingLicenseDocument: { type: String, default: '' },
        additionalDocument: { type: String, default: '' },
    },

}, { timestamps: true })

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking;
