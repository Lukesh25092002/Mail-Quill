import mongoose from "mongoose";
import { ROLE } from "../accessControl.js";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    profile: {type: String, default: "default-user.jpg"},
    organisationId: {type: mongoose.Types.ObjectId, required: true},
    organisationRole: { type: String, enum: Object.values(ROLE), required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {type: String, enum: ["BDE", "SM"]},
    gender: {type: String, enum: ["Male","Female"]}
  },
  { timestamps: true }
);

// Pre-save hook to hash passwords
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

const User = mongoose.model("User", userSchema);
export default User;