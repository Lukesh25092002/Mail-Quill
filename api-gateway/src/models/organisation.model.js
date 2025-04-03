import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        picture: { type: String, default: "https://c8.alamy.com/comp/2R2HFW5/setting-icon-vector-cog-settings-icon-symbol-2R2HFW5.jpg" },
    },
    { timestamps: true }
);

const Organisation = mongoose.model("Organisation", organisationSchema);
export default Organisation;