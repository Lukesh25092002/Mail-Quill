import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import "./config/database.js";

import { fileURLToPath } from 'url';
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// App Initialization
import express from "express";
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use('/public', express.static(path.join(__dirname, "../public")));

// Rate Limiting (protect from brute force attacks)
import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Routes
/* /api route goes here */
// import routes from "./routes/auth.routes";
import authRouter from "./routes/auth.routes.js";
app.use("/userAuth", authRouter);

// User Router support
import userRouter from "./routes/user.routes.js";
app.use("/user", userRouter);

// Organisation Router support
import organisationRouter from "./routes/organisation.routes.js";
app.use('/organisation', organisationRouter);

// Organisation Router support
import collaborationRouter from "./routes/collaboration.routes.js";
app.use('/collaboration', collaborationRouter);

app.get("/", function (req, res) {
  res.send("Hello World");
});

// Chat Router support
import chatRouter from "./routes/chat.routes.js";
app.use("/chats", chatRouter);


// Server Start
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));