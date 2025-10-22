import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
    }
export default connectDB;

// Call this function in your main server file to connect to the database
// Example: import connectDB from './utils/db.js'; connectDB();