import mongoose from 'mongoose';
import 'dotenv/config';

const carSchema = new mongoose.Schema({
    owner: mongoose.Schema.Types.ObjectId,
    brand: String,
    model: String,
    image: String,
    year: Number,
    category: String,
    seating_capacity: Number,
    fuel_type: String,
    transmission: String,
    pricePerDay: Number,
    location: String,
    description: String,
    isAvailable: Boolean,
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    user: mongoose.Schema.Types.ObjectId,
    owner: mongoose.Schema.Types.ObjectId,
    pickupDate: Date,
    returnDate: Date,
    status: String,
    price: Number,
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);
const Booking = mongoose.model('Booking', bookingSchema);

try {
    const uri = `${process.env.MONGODB_URL}/car-rental`;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB\n');

    // Get all bookings with their cars
    const bookings = await Booking.find().populate('car');
    console.log(`Total bookings: ${bookings.length}`);

    // Find cars referenced in bookings that are missing images
    const carsWithoutImages = [];
    bookings.forEach(b => {
        if (b.car && (!b.car.image || b.car.image === '')) {
            carsWithoutImages.push(b.car._id.toString());
        }
    });

    console.log(`\nCars without images referenced in bookings: ${carsWithoutImages.length}`);
    console.log('Car IDs:', carsWithoutImages);

    if (carsWithoutImages.length > 0) {
        // Update these specific cars
        const result = await Car.updateMany(
            { _id: { $in: carsWithoutImages } },
            { $set: { image: 'https://via.placeholder.com/1280x720?text=Car+Image' } }
        );
        console.log(`\n✓ Updated ${result.modifiedCount} cars`);
    }

    // List all cars with their image status
    const allCars = await Car.find().select('brand model image');
    console.log('\nAll cars in database:');
    allCars.forEach(car => {
        console.log(`  - ${car.brand} ${car.model}: ${car.image ? '✓ Has image' : '✗ Missing image'}`);
    });

    process.exit(0);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
