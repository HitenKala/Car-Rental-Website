import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const ownerFeedbackSchema = new mongoose.Schema({
    booking: { type: ObjectId, ref: "Booking", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["review", "complaint"], required: true },
    rating: { type: Number, min: 1, max: 5, default: null },
    message: { type: String, required: true, trim: true },
}, { timestamps: true });

ownerFeedbackSchema.index({ booking: 1, user: 1 }, { unique: true });

const OwnerFeedback = mongoose.model("OwnerFeedback", ownerFeedbackSchema);

export default OwnerFeedback;
