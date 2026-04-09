import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['owner', 'user', 'admin'], default: 'user' },
    image: { type: String, default: '' },
    drivingLicenseNumber: { type: String, default: '' },
    drivingLicenseDocument: { type: String, default: '' },
    ownerRegistrationNumber: { type: String, default: '' },
    ownerRegistrationDocument: { type: String, default: '' },
    ownerRegisteredAt: { type: Date, default: null },
    ownerVerificationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    ownerReviewedAt: { type: Date, default: null },
    resetPasswordCode: { type: String, default: '' },
    resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
