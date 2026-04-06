import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!,{
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
  }
};