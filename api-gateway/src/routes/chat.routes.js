import express from "express";
import chatController from "../controllers/chat.controller.js";
import isLoggedIn from "../middleware/isUserLoggedIn.js";
import organisationResolver from "../middleware/organisationResolver.middleware.js";

const chatRouter = express.Router();
chatRouter.use(isLoggedIn);
chatRouter.use(organisationResolver);

chatRouter.route("/")
.get(chatController.getAllChats)
.post(chatController.createNewChat);

chatRouter.route("/:id")
.get(chatController.getChatById)
.patch(chatController.chatWithBot)
.delete(chatController.deleteChatById);

export default chatRouter;