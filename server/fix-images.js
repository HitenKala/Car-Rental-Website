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

const Car = mongoose.model('Car', carSchema);

try {
    const uri = `${process.env.MONGODB_URL}/car-rental`;
    await mongoose.connect(uri);

    const result = await Car.updateMany(
        { $or: [{ image: { $exists: false } }, { image: null }, { image: '' }] },
        { $set: { image: 'https://via.placeholder.com/1280x720?text=Car+Image' } }
    );

    console.log(`✓ Updated ${result.modifiedCount} cars with missing images`);

    process.exit(0);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
