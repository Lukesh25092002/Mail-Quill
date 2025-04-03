import mongoose from "mongoose";
import { ROLE } from "../accessControl.js";

const organisationInvitationSchema = new mongoose.Schema(
    {
        organisationId: { type: mongoose.Types.ObjectId, required: true },
        organisationRole: {
            type: String,
            enum: Object.values(ROLE),
            required: true,
        },
        email: { type: String, required: true, unique: true },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60 * 60 * 24, // Document will expire after 1 day
        },
    }
);

organisationInvitationSchema.pre('save', async function (next) {
    if (this.isNew)
        await mongoose.model('OrganisationInvitation').deleteMany({ email: this.email });
    
    next();
});

const OrganisationInvitation = mongoose.model("OrganisationInvitation", organisationInvitationSchema);
export default OrganisationInvitation;
