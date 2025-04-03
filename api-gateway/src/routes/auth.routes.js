import express from "express";
import {refreshToken,userLogin,userLoginWithGoogle,userRegister,userRegisterWithInvitation,userRegisterWithGoogle,userForgotPassword,userResetPassword,timepass} from "../controllers/auth.controller.js";
import isUserLoggedIn from "../middleware/isUserLoggedIn.js";

const authRouter = express.Router();

// Routes
authRouter.post("/refresh-token", refreshToken);

authRouter.post("/refresh-token", refreshToken);

authRouter.post("/login",userLogin);
authRouter.post("/login-google",userLoginWithGoogle);
authRouter.post("/register",userRegister);
authRouter.post("/register/:invitationId",userRegisterWithInvitation);
authRouter.post("/register-google",userRegisterWithGoogle);
authRouter.post("/forgot-password",userForgotPassword);
authRouter.post("/reset-password/:id",userResetPassword);

// Only for development usage
authRouter.post("/timepass",isUserLoggedIn,timepass);

export default authRouter;