import User from "../models/User.js";

import cloudinaryClient from "../cloudinaryClient.js";

import dotenv from "dotenv";
import mongoose from "mongoose";
import { ROLE, hasPermission } from "../accessControl.js";
dotenv.config();



/*
GET type request
ex1pects userId object by isLoggedIn in request
Returns the userDetails
*/
const getUserDetails = async (req, res) => {
    let userId;
    try{
        userId = new mongoose.Types.ObjectId(req.params.userId);
    }
    catch(err){
        return res.json({ err, message: "Internal Server error" });
    }

    let userRecord;
    try {
        userRecord = await User.findById(userId);
        if (!userRecord)
            return res.status(401).json({ message: "No user found" });
    } catch (err) {
        return res.status(500).json({ err, message: "Internal server error" });
    }

    return res.status(200).json({
        user: {
            userId: userRecord._id.toString(),
            organisationRole: userRecord.organisationRole,
            email: userRecord.email,
            name: userRecord.name,
            role: userRecord.role,
            gender: userRecord.gender,
            profile: userRecord.profile
        },
        message: "User details are sent along with the response in the 'user' feild"
    });
}



/*
GET type request
expects user object by isLoggedIn in request
Returns the userDetails
*/
const userProfile = async (req, res) => {
    return res.status(200).json({
        user: {
            _id: req.user._id.toString(),
            organisationRole: req.user.organisationRole,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            gender: req.user.gender,
            profile: req.user.profile
        },
        message: "User details are sent along with the response in the 'user' feild"
    });
}



const deleteUser = async (req,res) => {
    const user = req.user;

    let organisationVIPcount;
    try{
        organisationVIPcount = await User.countDocuments({
            organisationId: req.organisation.organisationId,
            organisationRole: ROLE.ADMIN
        });
    }
    catch(err) {
        res.status(500).json({ err, message: "Internal server error", description: "Couldn't access the organisation user data" });
    }

    if(user.organisationRole==ROLE.ADMIN && organisationVIPcount==1)
        return res.status(300).json({ message: "Request rejected", descriptrion: "Required user cannot be deleted" });

    try{
        await User.findByIdAndDelete(req.user._id);
    }
    catch (err) {
        return res.status(500).json({ err, message: "Internal server error" });
    }

    return res.json(200).json({ err, message : "user deleted successfully" });
}



/*
GET type request
expects organisation object by orgnanisationResolver in request
Returns the organisationDetails
*/
const userOrganisation = async (req, res) => {
    return res.status(200).json({
        organisation: {
            organisationId: req.organisation._id,
            name: req.organisation.name,
            picture: req.organisation.picture
        },
        message: "The organisation details are appended in the organisation feild of response"
    });
}



/*
PUT type request
expects user object by isLoggedIn in request adn name: string|null, role: string|null and gender: string|null
updates users profile
*/
const updateProfile = async (req, res) => {
    const userId = req.user._id.toString();

    try {
        await User.findByIdAndUpdate(userId, {
            name: req.body.name,
            role: req.body.role,
            gender: req.body.gender
        });
    } catch (err) {
        return res.status(500).json({ err: err, message: 'Server error', description: "Failed to update user profile" });
    }

    return res.status(200).json({
        message: "User Details updated successfully"
    });
}



/*
PATCH type request
expects email: string, password: string in request body
Only for development purposes
*/
const uploadProfilePicture = async (req, res) => {
    const userId = req.user._id.toString();
    const imageBuffer = req.file.buffer;

    let uploadResult;
    try {
        uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinaryClient.uploader.upload_stream({ public_id: userId }, (error, result) => {
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

    try {
        await User.findByIdAndUpdate(userId, { profile: imageURL });
    } catch (err) {
        return res.status(501).json({ err, message: "Internal server error", description: "Failed to Update user profile picture" });
    }

    return res.status(200).json({
        message: "Profile picture uploaded successfully"
    });
}



/*
GET type request
expects email: string, password: string in request body
Only for development purposes
*/
const timepass = (req, res) => {
    console.log(req.user);
    return res.status(200).json({ message: "Ok Fine" });
}


export {
    getUserDetails,
    userProfile,
    deleteUser,
    userOrganisation,
    updateProfile,
    uploadProfilePicture,
    timepass
};