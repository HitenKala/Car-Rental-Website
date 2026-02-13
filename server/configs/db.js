import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL;

if (!MONGODB_URI) {
        throw new Error('MONGODB_URL environment variable is not defined');
}

// Cache the connection across lambda invocations to avoid exhausting connections
// in serverless environments (Vercel / AWS Lambda etc.).
let cached = globalThis._mongoose;
if (!cached) {
        cached = globalThis._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
        if (cached.conn) {
                return cached.conn;
        }

        if (!cached.promise) {
                mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));
                const opts = { bufferCommands: false };
                cached.promise = mongoose
                        .connect(`${MONGODB_URI}/car-rental`, opts)
                        .then((m) => m.connection);
        }

        try {
                cached.conn = await cached.promise;
                return cached.conn;
        } catch (err) {
                cached.promise = null;
                console.error('Error connecting to MongoDB:', err.message || err);
                throw err;
        }
};

export default connectDB;