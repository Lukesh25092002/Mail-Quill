import mongoose from "mongoose";
import User from "../models/User.js";

const forgotPasswordSchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: User
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 180, // Automatically delete after specified seconds
      },
  },
  { timestamps: true }
);

const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema);
export default ForgotPassword;