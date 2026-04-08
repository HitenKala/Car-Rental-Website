import mongoose from 'mongoose';
import 'dotenv/config';
import Car from '../models/Car.js';

await mongoose.connect(process.env.MONGODB_URI);

console.log('Starting migration to add missing car images...\n');

// Define image URLs for cars without images
const carImages = {
    'BMW M3': 'https://images.unsplash.com/photo-1617654112368-307921291f50?w=1280&h=720&fit=crop',
    'Tesla Model 3': 'https://images.unsplash.com/photo-1560958089-b8a46dd52d12?w=1280&h=720&fit=crop',
    'Toyota Corolla': 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=1280&h=720&fit=crop'
};

try {
    // Find all cars without images
    const carsWithoutImages = await Car.find({
        $or: [
            { image: { $exists: false } },
            { image: null },
            { image: '' }
        ]
    });

    console.log(`Found ${carsWithoutImages.length} cars without images\n`);

    if (carsWithoutImages.length === 0) {
        console.log('✓ All cars already have images!');
        process.exit(0);
    }

    // Update cars with images
    for (const car of carsWithoutImages) {
        const carKey = `${car.brand} ${car.model}`;
        const imageUrl = carImages[carKey] || 'https://via.placeholder.com/1280x720?text=' + encodeURIComponent(carKey);

        await Car.findByIdAndUpdate(
            car._id,
            { image: imageUrl },
            { new: true }
        );

        console.log(`✓ Updated: ${carKey} with image`);
    }

    console.log(`\n✓ Migration completed! ${carsWithoutImages.length} cars updated.`);

} catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
} finally {
    await mongoose.connection.close();
}
