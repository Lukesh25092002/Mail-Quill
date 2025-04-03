import mongoose from 'mongoose';

import dotenv from "dotenv";
dotenv.config();

if(!process.env.MONGODB_URI)
    throw new Error("MONGODB_URL not defined in environment");

/*
Establishing a connection from server and database
MONGODB_URL: string , must be present as environment variable

Refer to .env.sample for more information about environment variables
*/
mongoose.connect(process.env.MONGODB_URI)
.then(function() {
    console.log("Database connected successfully ...");
})
.catch(function() {
    console.log("Database connection failed ...");
});