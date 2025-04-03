import Organisation from "../models/organisation.model.js";
import User from "../models/User.js";
import cloudinaryClient from "../cloudinaryClient.js";
import { PERMISSION, hasPermission } from "../accessControl.js";
import OrganisationInvitation from "../models/organisationInvitation.model.js";
import mongoose, { Mongoose } from "mongoose";



/*
GET type request
expects user, orgnisation in request object
Fetches all the people in the organisation
*/
const getOrganisationPeople = async (req, res) => {
    const organisationId = req.organisation._id;

    let people;
    try {
        people = (await User.find({ organisationId })).map(userRecord => {
            return {
                userId: userRecord._id,
                name: userRecord.name,
                profile: userRecord.profile,
                email: userRecord.email,
                gender: userRecord.gender,
                role: userRecord.role,
                organisationRole: userRecord.organisationRole
            };
        });
    } catch (err) {
        return res.status(500).json({
            err,
            message: "Internal server error",
            description: "Failed to fetch the people of the oprganisation"
        });
    }

    return res.status(202).json({
        people,
        message: "The people are attached in 'people' feild of the response"
    });
}



/*
PUT type request
expects user request parameters and organisationRole in request body
Promote/Demote users within organisation
*/
const updateUserPrivileges = async (req,res) => {
    const organisationRole = req.body.organisationRole;
    if(!organisationRole)
        return res.json({ message: "Invalid request body", description: "missing required 'organisationRole' feild" });

    if(!hasPermission(req.user.organisationRole,PERMISSION.UPDATE_USER_PRIVILEGES))
        return res.status(401).json({ message: "Access Denied", description: "User is not authorised to access this route" });

    let userId;
    try{
        userId = new mongoose.Types.ObjectId(req.params.userId);
    }
    catch(err) {
        return res.json({ err, message: "Internal server error" });
    }

    let userRecord;
    try{
        userRecord = await User.findById(userId);
    }
    catch(err) {
        return res.json({ err, message: "Internal server error", description: "Failed to fetch user from userCollection" });
    }

    if(req.user._id==userRecord._id)
        return res.json({ message: "Invalid request", description: "This route is not meant for this purpose" });

    if(userRecord.organisationId.toString()!=req.user.organisationId.toString())
        return res.json({ message: "Invalid request", description: "The organisation of owner and user does not match" });

    if(hasPermission(req.user.organisationRole,PERMISSION.REMOVE_USER_FROM_ORGANISATION))
        return res.json({ message: "Not Authorised", description: "You dont have the necessary privelages to perform the action" });

    try{
        await User.findByIdAndUpdate(userId,{ organisationRole });
    }
    catch (err) {
        return res.json({ err, message : "Internal Server Error", description: "Failed to update the user record from UserCollection" });
    }

    return res.json({ message: "Successfully updated user record" });
}



const removeUserFromOrganisation = async(req,res) => {
    let userId;
    try{
        userId = new mongoose.Types.ObjectId(req.params.userId);
    }
    catch(err) {
        return res.json({ err, message: "Internal server error" });
    }

    let userRecord;
    try{
        userRecord = await User.findById(userId);
    }
    catch(err) {
        return res.json({ err, message: "Internal server error", description: "Failed to fetch user from userCollection" });
    }

    if(req.user._id==userRecord._id)
        return res.json({ message: "Invalid request", description: "This route is not meant for this purpose" });

    if(userRecord.organisationId.toString()!=req.user.organisationId.toString())
        return res.json({ message: "Invalid request", description: "The organisation of owner and user does not match" });

    if(hasPermission(req.user.organisationRole,PERMISSION.REMOVE_USER_FROM_ORGANISATION))
        return res.json({ message: "Not Authorised", description: "You dont have the necessary privelages to perform the action" });

    try{
        await User.findByIdAndRemove(userId);
    }
    catch(err) {
        return res.json({ err, message: "Internal server error", description: "Couldn't delete user from UserCollection" });
    }

    res.json({ message: "User deleted successfully" });
}


/*
GET type request
expects user, orgnisation in request object
Fetches all the people in the organisation
*/
const getOrganisationInvitations = async (req, res) => {
    const user = req.user;
    const organisationId = req.organisation._id;

    let invitations;
    try {
        invitations = await OrganisationInvitation.find({ organisationId });
    } catch (err) {
        return res.status(500).json({
            err,
            message: "Internal server error",
            description: "Failed to fetch the invitations of the organisation"
        });
    }

    return res.status(202).json({
        invitations,
        message: "The people are attached in 'people' feild of the response"
    });
}


/*
DELETE type request
expects user, orgnisation in request object
deletes organisation including all the users in it
*/
const deleteOrganisation = async (req, res) => {
    const user = req.user;
    const organisation = req.organisation;

    if (!hasPermission(user.organisationRole, PERMISSION.DELETE_ORGANISATION))
        return res.json({ message: "Access Denied", description: "user does not have the appropritate permissions" });

    try {
        await Organisation.findByIdAndDelete(organisation._id);
    }
    catch (err) {
        return res.status(500).json({ err, message: "Failed to delete the organisationRecord" });
    }

    try {
        await User.deleteMany({ organisationId: organisation._id });
    }
    catch (err) {
        return res.status(500).json({ err, message: "Failed to delete the members of the organisation" });
    }

    return res.status(500).json({ error: "Organisation deleted successfully" });
}



/*
PATCH type request
expects user, orgnisation in request object
uploads the organisation picture
*/
const uploadOrganisationPicture = async (req, res) => {
    const role = req.user.organisationRole;
    if (!hasPermission(role, PERMISSION.UPDATE_ORGANISATION_PICTURE))
        return res.json({ message: "Authorisation Failed" });

    const organisationId = req.organisation._id.toString();
    const imageBuffer = req.file.buffer;

    let uploadResult;
    try {
        uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinaryClient.uploader.upload_stream({ public_id: organisationId }, (error, result) => {
                if (error)
                    return reject(error);

                resolve(result);
            });
            uploadStream.end(imageBuffer);
        });
    } catch (err) {
        return res.status(500).json({ err, message: "Couldn't upload to Cloudinary", description: "An error occurred while uploading the file" });
    }

    const imageURL = uploadResult.secure_url;

    console.log("The organisation id :", organisationId);

    try {
        await Organisation.findByIdAndUpdate(organisationId, { picture: imageURL });
    } catch (err) {
        return res.status(501).json({ err, message: "Internal server error", description: "Failed to Update user profile picture" });
    }

    return res.status(200).json({
        link: imageURL,
        message: "Organisation picture uploaded successfully"
    });
}

export {
    getOrganisationPeople,
    updateUserPrivileges,
    removeUserFromOrganisation,
    getOrganisationInvitations,
    deleteOrganisation,
    uploadOrganisationPicture
}