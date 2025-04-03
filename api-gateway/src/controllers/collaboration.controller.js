import mongoose from "mongoose";
import OrganisationInvitation from "../models/organisationInvitation.model.js";
import Organisation from "../models/organisation.model.js";
import transporter from "../smtpClient.js";
import { PERMISSION, hasPermission } from "../accessControl.js";
import ejs from "ejs";
import organisationInvitationTemplate from "../templates/organisation-invitation.template.js";



/*
GET type request
Expects nothing in request
Description: fetches all the chats from chat schema
*/
async function getOrganisationInvitationDetails(req, res) {
    const invitationId = new mongoose.Types.ObjectId(req.params.invitationId);

    let invitationRecord;
    try {
        invitationRecord = await OrganisationInvitation.findById(invitationId);
        if (!invitationRecord)
            return res.json({ messgae: "Couldn't fetch the organisationInvitationRecord from organisationInvitationCollection" });
    }
    catch (err) {
        return res.status(500).json({
            err, message: "Internal Server Error",
            description: "Failed to fetch the invitationRecord from organisationInvitationCollection"
        });
    }

    let organisationRecord;
    try {
        organisationRecord = await Organisation.findById(invitationRecord.organisationId);
        if (!organisationRecord)
            return res.json({ messgae: "Couldn't fetch the organisationRecord from organisationCollection" });
    }
    catch (err) {
        return res.status(500).json({ err, message: "Internal Server Error" });
    }

    return res.status(200).json({
        invitationDetails: {
            invitationId : invitationRecord._id.toString(),
            organisationName: organisationRecord.name,
            organisationRole: invitationRecord.organisationRole,
            email: invitationRecord.email,
        },
        message: "The invitation details are sent along in response body"
    });
}



/*
POST type request
Expects user in request object
Description: Created a new invitationRecord for collaboration within organisation
*/
const createOrganisationInvitation = async (req, res) => {
    const email = req.body.email;
    if (!email) return res.status(401).send({ message: "Invalid request body", description: "email feild missing in req body" });

    const organisationRole = req.body.organisationRole;
    if (!organisationRole) return res.status(401).json({ message: "Invalid request body", description: "organisationRole missing in request body" });

    const user = req.user;
    if(!hasPermission(user.organisationRole,PERMISSION.SEND_ORGANISATION_INVITATION))
        return res.status(401).json({ message: "Access Denied", description: "User is not authorised to access this route" });

    let invitationRecord;
    try {
        const invitationRecordTemplate = new OrganisationInvitation({
            organisationId: user.organisationId,
            organisationRole,
            email
        });
        invitationRecord = await invitationRecordTemplate.save();
        if(!invitationRecord)
            res.json({ message: "Internal Server Error", description: "Couldn't fetch invitationRecord from organisationInvitationCollection" });
    }
    catch (err) {
        return res.status(500).json({
            err, message: "Internal Server Error",
            description: "Failed to create the invitationRecord for organisationInvitationCollection"
        });
    }

    const registrationLink = `http://localhost:4200/auth/login?invitationId=${invitationRecord._id.toString()}`;

    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Mail Quill: Organisation invitation',
            html: ejs.render(organisationInvitationTemplate, {
                organisationName: req.organisation.name,
                organisationPicture: req.organisation.picture,
                userEmail: invitationRecord.email,
                userRole: invitationRecord.organisationRole,
                invitationLink: registrationLink
            })
        }
        await transporter.sendMail(mailOptions);
    }
    catch (err){
        return res.status(401).json({ err, message: "Error sending invitation link", description: "This is error from node mailer, unable to send mail" });
    }

    return res.status(200).json({ invitationRecord, message: "The invitation details are sent along in response body" });
}




/*
DELETE type request
Expects user in request object adn invitationId in query params
Description: Deletes invitationRecord form organisationInvitationCollection
*/
const revokeOrganisationInvitation = async (req, res) => {
    const invitationId = new mongoose.Types.ObjectId(req.params.invitationId);
    const user = req.user;
    if(!hasPermission(user.organisationRole,PERMISSION.REVOKE_ORGANISATION_INVITATION))
        return res.status(401).json({ message: "Access Denied", description: "User is not authorised to access this route" });

    let invitationRecord;
    try {
        invitationRecord = await OrganisationInvitation.findById(invitationId);
        if(!invitationRecord)
            return res.status(500).json({message: "Couldn't find the invitationRecord"});
    }
    catch (err) {
        return res.status(500).json({
            err, message: "Internal Server Error",
            description: "Failed to fetch the invitationRecord for organisationInvitationCollection"
        });
    }

    // console.log("invitationRecord",invitationRecord);
    console.log(user.organisationId,invitationRecord.organisationId);

    if(user.organisationId.toString()!=invitationRecord.organisationId.toString())
        return res.status(500).json({ message: "Access denied", description: "Authorisation failed. You do not have the necessary previlaged needed to request" });

    try{
        await OrganisationInvitation.findByIdAndDelete(invitationId);
    }
    catch(err) {
        res.status(500).json({ err, message: "Internal Server Error" });
    }

    return res.status(200).json({ message: "The invitationRecord has been deleted successfully" });
}



export {
    getOrganisationInvitationDetails,
    createOrganisationInvitation,
    revokeOrganisationInvitation,
};