import express from "express";
import {continueConversation} from "../controllers/conversation.controller";
import authenticator from "../middleware/authenticator";

const router = express.Router();

// Routes for conversations
router.post("/", authenticator, continueConversation);

export default router;
