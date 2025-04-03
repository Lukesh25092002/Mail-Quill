import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ForgotPassword from "../models/forgotPassword.js";
import transporter from "../smtpClient.js";
import OAuthClient from "../oauthClient.js";
import mongoose from "mongoose";
import Organisation from "../models/organisation.model.js";
import OrganisationInvitation from "../models/organisationInvitation.model.js";
import { ROLE, PERMISSION } from "../accessControl.js";
import registerPasswordTemplate from "../templates/reset-password.template.js";
import ejs from "ejs";
import resetPasswordTemplate from "../templates/reset-password.template.js";

// Refresh Token API
const refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate new idToken
    const newIdToken = jwt.sign(
      { conversationId: decoded.conversationId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ idToken: newIdToken });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid refresh token", error: err.message });
  }
};



/*
POST type request
expects email: string, password: string in request body
Append JWT as proof of auth in response headers
*/
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(401).json({ message: "email required" });
  if (!password) return res.status(401).json({ message: "password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "invalid credentials" });

  if (user.password !== password)
    return res.status(401).json({ message: "invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "9h" });
  return res.status(200).json({ UserAuthToken: `Bearer ${token}`, message: "login successful" });
}



/*
POST type request
expects JWT-credential generatede by google request body
Append JWT as proof of auth in response headers
*/
const userLoginWithGoogle = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(401).json({ message: "credential required" });

  let email;
  try {
    const ticket = await OAuthClient.verifyIdToken({ idToken: credential });
    email = ticket.getPayload().email;
  } catch (err) {
    res.status(500).json({ err: err, message: "Authentication error", description: "Couldn't extract payload form token_id" });
  }

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    res.status(500).json({ err: err, message: "User dosen't exists", description: "Couldn't find a user with that email" });
  }

  if (!user) return res.status(401).json({ message: "invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return res.status(200).json({ UserAuthToken: `Bearer ${token}`, message: "login successful" });
}



/*
POST type request
expects  unique email: string, password: string in request body
*/
const userRegister = async (req, res) => {
  const { email, password, organisationName, organisationRole } = req.body;
  if (!email) return res.status(401).json({ message: "email required" });
  if (!password) return res.status(401).json({ message: "password required" });
  if (!organisationName) return res.status(401).json({ message: "organisationName required" });

  console.log(ROLE.ADMIN);

  console.log(email,password,organisationName);

  let organisationRecord;
  try{
    const organisationRecordTemplate = new Organisation({ name: organisationName });
    organisationRecord = await organisationRecordTemplate.save();
  }
  catch (err) {
    return res.json({ err, message: "Internal server Error"});
  }

  const newUser = new User({ email, password, organisationId: organisationRecord._id, organisationRole: ROLE.ADMIN});
  newUser.save()
    .then(() => {
      return res.status(200).json({ message: "registration successful" });
    })
    .catch((err) => {
      return res.status(401).json({ err, message: "something went wrong" });
    });
}



/*
POST type request
expects  unique email: string, password: string in request body
*/
const userRegisterWithInvitation = async (req, res) => {
  const invitationId = new mongoose.Types.ObjectId(req.params.invitationId);

  const password = req.body.password;
  if(!password)  return res.status(401).json({ message: "Invalid request body", description: "Required feild missing 'password'" });

  let invitationRecord;
  try {
    invitationRecord = await OrganisationInvitation.findById(invitationId);
    if (!invitationRecord)
      return res.json({ mesage: "Internal Server rrorr", description: "No invitationRecord found with specified Id" });
  }
  catch (err) {
    return res.json({ err, message: "Internal server error", description: "Failed to fetch invitationRecord form InvitationSchema" });
  }

  let userRecord;
  try {
    const userRecordTemplate = new User({
      organisationId: invitationRecord.organisationId,
      organisationRole: invitationRecord.organisationRole,
      email: invitationRecord.email,
      password
    });
    userRecord = await userRecordTemplate.save();
  }
  catch (err) {
    return res.status(500).json({ err, message: "Internal Server error", description: "Failed to create the userRecord" });
  }

  return res.json({ message: "User created successfully" });
}



/*
POST type request
expects  credential: JWT string in request body
*/
const userRegisterWithGoogle = async (req, res) => {
  const { credential, organisationName, organisationRole } = req.body.credential;
  if (!credential) return res.status(401).json({ message: "credential required" });

  let organisationRecord;
  if (!organisationName) {
    if (!organisationRole) return res.status(401).json({ message: "organisationRole required" });

    try {
      const organisationRecordTemplate = new Organization({ name: organisationName });
      const organisationRecord = await organisationRecordTemplate.save();
    }
    catch (err) {
      res.status(500).json({ err, message: "Failed to create new organisation" });
    }
  }
  else {
    try {
      organisationRecord = await Organisation.findOne({ name: organisationName });
    } catch (err) {
      res.status(500).json({ err, message: "Failed to fetch the organisation" });
    }
  }

  if (!organisationRecord)
    return res.json({ message: "Couldn't resolve organisation" });

  let payload;
  try {
    const ticket = await OAuthClient.verifyIdToken({ idToken: credential });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(500).json({ err: err, message: "Authentication error", description: "Couldn't extract payload form token_id" });
  }

  if (!payload) return res.status(401).json({ message: "Invalid payload" });

  const { name, email, picture } = payload;
  const newUser = new User({ name, email, password: "password", profile: picture, organisation: organisationName, organisationRole });
  newUser.save()
    .then(() => {
      return res.status(200).json({ message: "registration successful" });
    })
    .catch((err) => {
      return res.status(401).json({ err, message: "something went wrong" });
    });
}


/*
POST type request
expects userId: string, email: string in request body
Sends reset password link to user's email
*/
const userForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(401).json({ message: "email required" });

  let userId = null;
  try {
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(401).json({ message: "Invalids email", description: "No user found in UserCollection with the provoided email" });
    userId = user._id;
  } catch (err) {
    return res.status(501).json({ err, message: "Internal server error", description: "Problem in finding user from UserCollection" });
  }

  try {
    await ForgotPassword.deleteMany({ userId });
  } catch (err) {
    return res.status(401).json({ err, message: "Internal server error", description: "Some problem in deleting the previous records" });
  }

  console.log(userId);
  console.log(email);

  let sessionId;
  try {
    const forgotPasswordRecord = new ForgotPassword({ userId: userId, email: email });
    const sessionRecord = await forgotPasswordRecord.save();
    sessionId = sessionRecord._id;
  } catch (err) {
    return res.status(401).json({ err, message: "Internal server error", description: "Some problem in inserting the forgot password record" });
  }

  console.log(sessionId);

  const resetPasswordLink = `http://localhost:4200/auth/reset-password/${sessionId.toString()}`;

  // Recovery link using nodemailer
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Mail Quill: Reset Your Password',
      html: ejs.render(resetPasswordTemplate,{resetPasswordLink})
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    return res.status(401).json({ err, message: "Error sending recovery link", description: "This is error from node mailer, unable to send mail" });
  }

  res.status(200).json({
    link: resetPasswordLink,
    message: "A link has been sent to your email"
  });
}


/*
POST type request
expects id: string, is request params and password: string in request body
*/
const userResetPassword = async (req, res) => {
  const tempId = req.params.id;
  if (!tempId) return res.status(401).json({ message: "id feild required in request URL" });

  const password = req.body.password;
  if (!password) return res.status(401).json({ message: "password feild required in request body" });

  let userId;
  try {
    const forgotPasswordRecord = await ForgotPassword.findById(tempId);
    if (!forgotPasswordRecord)
      return res.status(401).json({
        message: "Invalid ID",
        description: "No record found in ForgotPasswordCollection with the specified ID"
      });
    userId = forgotPasswordRecord.userId;
  } catch (err) {
    return res.status(501).json({
      err,
      message: "Internal server error",
      description: "Problem in finding record from ForgotPasswordCollection"
    });
  }

  try {
    await User.findByIdAndUpdate(userId, { password: password });
  } catch (err) {
    return res.status(401).json({ err, message: "Internal server error", description: "Some problem in inserting the forgot password record" });
  }

  res.status(200).json({
    message: "Password updated successfully"
  });
}

const timepass = (req, res) => {
  console.log(req.user);
  return res.status(200).json({ message: "Ok Fine" });
}

export {
  refreshToken,
  userLogin,
  userLoginWithGoogle,
  userRegister,
  userRegisterWithInvitation,
  userRegisterWithGoogle,
  userForgotPassword,
  userResetPassword,
  timepass
};