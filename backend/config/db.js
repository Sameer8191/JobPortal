import mongoose from "mongoose";

export const connectDB = async (req, res) => {
  await mongoose
    .connect(
      process.env.MONGODB_URI,
    )
    .then(() => {
      console.log("DB Connected");
    });
};
