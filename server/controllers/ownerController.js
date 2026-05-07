import User from "../models/User.js";
import fs from 'fs';
import ImageKit from '@imagekit/nodejs';
import Car from "../models/Car.js";
import Booking from "../models/Booking.js"
import OwnerFeedback from "../models/OwnerFeedback.js";

const ensureOwnerOrAdmin = (user) => {
    return user.role === 'owner' || user.role === 'admin';
};

const normalizePickupCoordinates = (coordinates) => {
    if (!coordinates || coordinates.lat === '' || coordinates.lng === '') {
        return null;
    }

    const lat = Number(coordinates.lat);
    const lng = Number(coordinates.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return { lat, lng };
};

const createImageKitClient = () => new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const removeTempFile = (filePath, label = 'temp file') => {
    if (!filePath) return;
    fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to remove ${label}:`, err);
    });
};

const uploadCarGalleryImages = async (client, imageFiles = []) => {
    const uploadedImages = await Promise.all(
        imageFiles.map(async (imageFile) => {
            const uploadRes = await client.files.upload({
                file: fs.createReadStream(imageFile.path),
                fileName: imageFile.originalname,
                folder: '/cars'
            });

            const uploadedPath = uploadRes.filePath || uploadRes.name || uploadRes.url;
            const optimizedImageUrl = client.helper.buildSrc({
                src: uploadedPath,
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                transformation: [
                    { width: 1280, quality: 'auto', format: 'webp' }
                ]
            });

            removeTempFile(imageFile.path, 'car image temp file');
            return optimizedImageUrl || uploadRes.url || uploadedPath;
        })
    );

    return uploadedImages;
};

//API to change role of user
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id, role, ownerVerificationStatus } = req.user;
        const registrationNumber = (req.body?.registrationNumber || "").trim();
        const registrationFile = req.file ? req.file : (req.files && req.files[0]);

        // Prevent admins from changing their role
        if (role === 'admin') {
            return res.json({ success: false, message: "Admins cannot change their role" });
        }

        if (role === 'owner') {
            return res.json({ success: true, message: "You are already registered as an owner" });
        }

        if (ownerVerificationStatus === 'pending') {
            return res.json({ success: false, message: "Your owner request is already under review" });
        }

        if (!registrationNumber) {
            return res.status(400).json({ success: false, message: "Registration number is required" });
        }

        if (!registrationFile) {
            return res.status(400).json({ success: false, message: "Car registration document is required" });
        }

        const client = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

        const uploadRes = await client.files.upload({
            file: fs.createReadStream(registrationFile.path),
            fileName: registrationFile.originalname,
            folder: '/owner-docs'
        });

        fs.unlink(registrationFile.path, (err) => {
            if (err) console.error('Failed to remove temp file:', err);
        });

        const documentUrl = uploadRes.url || uploadRes.filePath || uploadRes.name;

        await User.findByIdAndUpdate(_id, {
            role: "user",
            ownerRegistrationNumber: registrationNumber,
            ownerRegistrationDocument: documentUrl,
            ownerRegisteredAt: new Date(),
            ownerVerificationStatus: "pending",
            ownerReviewedAt: null,
        });

        res.json({ success: true, message: "Owner registration submitted. Waiting for admin approval." })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }

}

//API to list cars

export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!ensureOwnerOrAdmin(req.user)) {
            return res.status(403).json({ success: false, message: "Owner approval required to list cars" });
        }
        if (!req.body || !req.body.carData) {
            return res.status(400).json({ success: false, message: 'Missing carData in form body' });
        }
        let car;
        try {
            car = JSON.parse(req.body.carData);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'carData must be valid JSON string' });
        }

        const pickupCoordinates = normalizePickupCoordinates(car.pickupCoordinates);
        if (car.pickupCoordinates && !pickupCoordinates) {
            return res.status(400).json({ success: false, message: 'pickupCoordinates must contain valid lat and lng values' });
        }

        const allFiles = req.file ? [req.file] : (req.files || []);
        const imageFiles = allFiles.filter((file) => file.fieldname === 'images' || file.fieldname === 'image');
        const rcDocumentFile = allFiles.find((file) => file.fieldname === 'rcDocument');

        if (imageFiles.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one car image is required' });
        }

        if (!car.rcNumber || !String(car.rcNumber).trim()) {
            return res.status(400).json({ success: false, message: 'RC number is required' });
        }

        if (!rcDocumentFile) {
            return res.status(400).json({ success: false, message: 'RC document is required' });
        }

        const client = createImageKitClient();
        const uploadedImages = await uploadCarGalleryImages(client, imageFiles);

        const rcUploadRes = await client.files.upload({
            file: fs.createReadStream(rcDocumentFile.path),
            fileName: rcDocumentFile.originalname,
            folder: '/car-rc'
        });

        removeTempFile(rcDocumentFile.path, 'temp RC file');
        const image = uploadedImages[0];
        const rcDocument = rcUploadRes.url || rcUploadRes.filePath || rcUploadRes.name;
        await Car.create({
            ...car,
            owner: _id,
            image,
            images: uploadedImages,
            rcDocument,
            rcNumber: String(car.rcNumber).trim(),
            pickupCoordinates: pickupCoordinates || undefined,
        })

        res.json({ success: true, message: "car added" })


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message || 'Server error' })
    }
}

//API to list owner cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!ensureOwnerOrAdmin(req.user)) {
            return res.status(403).json({ success: false, message: "Owner approval required" });
        }
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
        if (!ensureOwnerOrAdmin(req.user)) {
            return res.status(403).json({ success: false, message: "Owner approval required" });
        }
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
        if (!ensureOwnerOrAdmin(req.user)) {
            return res.status(403).json({ success: false, message: "Owner approval required" });
        }
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

        if (role !== 'owner' && role !== 'admin') {
            return res.json({ success: false, message: "Unauthorized" })
        }
        const cars = await Car.find({ owner: _id })
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });
        const feedbacks = await OwnerFeedback.find({ owner: _id })
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('booking', 'pickupDate returnDate status');

        const pendingBookings = await Booking.find({ owner: _id, status: "pending" })

        const completedBookings = await Booking.find({ owner: _id, status: "confirmed" })
        const complaintsCount = feedbacks.filter((item) => item.type === 'complaint').length;
        const reviewItems = feedbacks.filter((item) => item.type === 'review' && item.rating);
        const averageRating = reviewItems.length
            ? Number((reviewItems.reduce((sum, item) => sum + item.rating, 0) / reviewItems.length).toFixed(1))
            : 0;

        //Calcuate monthlyRevenue where status Booking are Confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status == "confirmed").reduce((acc, booking) => acc + booking.price, 0)
        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue,
            totalFeedbacks: feedbacks.length,
            complaintsCount,
            averageRating,
            recentFeedbacks: feedbacks.slice(0, 8),
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

//API to update car details
export const updateCarDetails = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!ensureOwnerOrAdmin(req.user)) {
            return res.status(403).json({ success: false, message: "Owner approval required" });
        }

        const { carId } = req.body;
        let { updateData } = req.body;
        if (!carId || !updateData) {
            return res.status(400).json({ success: false, message: "carId and updateData are required" });
        }

        if (typeof updateData === 'string') {
            try {
                updateData = JSON.parse(updateData);
            } catch (error) {
                return res.status(400).json({ success: false, message: "updateData must be valid JSON" });
            }
        }

        const allFiles = req.file ? [req.file] : (req.files || []);
        const imageFiles = allFiles.filter((file) => file.fieldname === 'images' || file.fieldname === 'image');
        const rcDocumentFile = allFiles.find((file) => file.fieldname === 'rcDocument');

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        if (car.owner.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const allowedFields = [
            'brand',
            'model',
            'year',
            'category',
            'seating_capacity',
            'fuel_type',
            'transmission',
            'pricePerDay',
            'location',
            'preciseLocation',
            'pickupCoordinates',
            'description',
            'rcNumber',
            'isAvailable',
        ];
        const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));
        if (providedFields.length === 0 && imageFiles.length === 0 && !rcDocumentFile && !Array.isArray(updateData.existingImages)) {
            return res.status(400).json({ success: false, message: "No valid fields provided for update" });
        }

        const requiredStringFields = ['brand', 'model', 'category', 'fuel_type', 'transmission', 'location', 'description', 'rcNumber'];
        const numericFields = ['year', 'seating_capacity', 'pricePerDay'];

        for (const field of providedFields) {
            const value = updateData[field];

            if (requiredStringFields.includes(field)) {
                if (!String(value || '').trim()) {
                    return res.status(400).json({ success: false, message: `${field} is required` });
                }
                car[field] = String(value).trim();
                continue;
            }

            if (numericFields.includes(field)) {
                const numericValue = Number(value);
                if (!Number.isFinite(numericValue) || numericValue <= 0) {
                    return res.status(400).json({ success: false, message: `${field} must be a valid number greater than 0` });
                }
                car[field] = numericValue;
                continue;
            }

            if (field === 'isAvailable') {
                car[field] = Boolean(value);
                continue;
            }

            if (field === 'pickupCoordinates') {
                if (!value) {
                    car.pickupCoordinates = { lat: null, lng: null };
                    continue;
                }

                const normalizedCoordinates = normalizePickupCoordinates(value);
                if (!normalizedCoordinates) {
                    return res.status(400).json({ success: false, message: 'pickupCoordinates must contain valid lat and lng values' });
                }

                car.pickupCoordinates = normalizedCoordinates;
                continue;
            }

            car[field] = value;
        }

        const existingImages = Array.isArray(updateData.existingImages)
            ? updateData.existingImages.filter((item) => typeof item === 'string' && item.trim())
            : (Array.isArray(car.images) && car.images.length ? [...car.images] : car.image ? [car.image] : []);
        const requestedPrimaryImage = typeof updateData.primaryImage === 'string' ? updateData.primaryImage : '';

        if (imageFiles.length || rcDocumentFile) {
            const client = createImageKitClient();

            if (imageFiles.length) {
                const uploadedImages = await uploadCarGalleryImages(client, imageFiles);
                car.images = [...existingImages, ...uploadedImages];
            } else {
                car.images = existingImages;
            }

            if (rcDocumentFile) {
                const rcUploadRes = await client.files.upload({
                    file: fs.createReadStream(rcDocumentFile.path),
                    fileName: rcDocumentFile.originalname,
                    folder: '/car-rc'
                });
                car.rcDocument = rcUploadRes.url || rcUploadRes.filePath || rcUploadRes.name;
                removeTempFile(rcDocumentFile.path, 'updated RC temp file');
            }
        } else {
            car.images = existingImages;
        }

        if (!Array.isArray(car.images) || car.images.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one car image is required' });
        }

        car.image = requestedPrimaryImage && car.images.includes(requestedPrimaryImage)
            ? requestedPrimaryImage
            : car.images[0];

        await car.save();
        res.json({ success: true, message: "Car updated successfully", car });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
