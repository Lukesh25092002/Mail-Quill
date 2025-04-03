import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isUserLoggedIn = async (req,res,next) => {
  const token = req.header("UserAuthToken")?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Access Denied. No Token Provided." });

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
    if(!userId)
      return res.status(500).json({ message: "Invalid token payload." });
  } catch (err) {
    return res.status(401).json({ err, message: "Invalid Token." });
  }

  let user;
  try{
    user = await User.findById(userId);
    if(!user)
      return res.status(401).json({ message: "No user found" });
  } catch(err) {
    return res.status(500).json({ err, message: "Invalid Token." });
  }

  req.user = user;
  next();
};

export default isUserLoggedIn;