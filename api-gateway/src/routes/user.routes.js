import express from "express";
import { getUserDetails, deleteUser, uploadProfilePicture, userProfile, updateProfile, userOrganisation, timepass } from "../controllers/user.controller.js";
import isUserLoggedIn from "../middleware/isUserLoggedIn.js";
import organisationResolver from "../middleware/organisationResolver.middleware.js";
import multerClient from "../multerClient.js";


const userRouter = express.Router();
userRouter.use(isUserLoggedIn);

userRouter.delete("/", deleteUser);

userRouter.route("/profile")
    .get(userProfile)
    .put(updateProfile);

userRouter.route("/organisation")
    .get(organisationResolver, userOrganisation);

userRouter.patch('/profile/profile-picture', multerClient.single('avatar'), uploadProfilePicture);

userRouter.post("", timepass);
userRouter.get("/:userId", getUserDetails);

export default userRouter;