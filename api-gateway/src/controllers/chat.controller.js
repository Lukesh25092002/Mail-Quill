import Chat from "../models/chatSchema.js";
import User from "../models/User.js";
import axiosInstance from "../httpClient.js";
import mongoose from "mongoose";
import { PERMISSION, hasPermission } from "../accessControl.js";


/*
GET type request
Expects nothing in request
Description: fetches all the chats from chat schema
*/
async function getAllChats(req,res) {
    const organisationId = req.organisation._id;

    let chats;
    try{
        chats = await Chat.find({organisationId}).populate('userId', "-password").sort({createdAt:-1})
        return res.json(chats)
    }
    catch(err) {
        return res.status(500).json({
            err: err,
            message: "Server Error",
            description: "Fetching of list of all chats from Chat Schema failed"
        });
    }

    return res.status(200).json({
        chats,
        message: "The chats are attaches in the 'chats' feild along with the response"
    });
}


/*
This is a GET type request
Expects id of the chat to be fetched in request link as parameter
Description: search by ID a specific chat
*/
async function getChatById(req,res) {
    const userId = String(req.user._id);
    const chatId = req.params.id;
    Chat.findOne({ _id: chatId, userId: userId })
    .then((chat)=>{
        return res.status(200).json({
            chat: chat,
            messgae: "The chat contains chat searched by id from Chat Collection"
        });
    })
    .catch((err)=>{
        return res.status(500).json({
            err: err,
            message: "Server Error",
            description: "Fetching of messages of the chat by Id from Chat Schema failed"
        });
    });
}



/*
This is a PATCH type request
Expects id of the chat to be fetched in request link as parameter under the name of id and userMessage in body
Description: Add the userMessage in history array and also respond with a valid email.
*/
async function chatWithBot(req,res) {
    const chatId = req.params.id;
    const userMessage = req.body.userMessage;

    if(!chatId || !userMessage){
        return res.json({
            message: "Incomplete information",
            description: "chatId or userMessage is missing"
        });
    }

    let latestEmail = null;
    try{
        const latestAIMessage = await Chat.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(chatId) } }, // Match the chat document by ID
            {
                $project: {
                latestAIMessage: {
                    $arrayElemAt: [
                    {
                        $filter: {
                        input: "$history",
                        as: "item",
                        cond: { $eq: ["$$item.type", "AIMessage"] }
                        }
                    },
                    -1 // Get the last element
                    ]
                }
                }
            },
            {
                $project: {
                "latestAIMessage.type": 1,         // Include only the "type" field
                "latestAIMessage.email.subject": 1, // Include only specific fields inside "email"
                "latestAIMessage.email.body": 1,
                "latestAIMessage.query": 1         // Include the "query" field
                }
            }
        ]);

        latestEmail = latestAIMessage.length > 0 ? latestAIMessage[0].latestAIMessage.email : null;
    } catch(err) {
        res.status(500).json({
            err: err,
            message: "Server Fault",
            description: "Cannot fetch the most recent email"
        });
    } finally {
        console.log(latestEmail);
        if(latestEmail==null)
            return res.status(500).json({
                message: "Server Fault",
                description: "Cannot fetch the most recent email, It turned out to be null"
            });
    }

    let responseEmail = null;
    try{
        const response = await axiosInstance({
            method: "PATCH",
            url: "/chats",
            data: {
                userPrompt: userMessage,
                email: latestEmail
            }
        });

        responseEmail = response.data.email;
    } catch(err){
        return res.status(500).json({
            err: err,
            message: "Failed to extract data from python server",
            description: "The error is the one from axios API, while hitting the python endpoint"
        });
    } finally {
        if(responseEmail==null)
            return res.status(500).json({
                message: "Failed to extract data from python server",
                description: "The error is the one from axios API, while hitting the python endpoint"
            });
    }

    const newHistoryEntries = [{
        type: "HumanMessage",
        query: userMessage,
    },
    {
        type: "AIMessage",
        email: responseEmail
    }];

    Chat.updateOne(
        { _id: chatId },
        { $push: { history: { $each: newHistoryEntries } } }
    )
    .then((metadata)=>{
        return res.status(200).json({
            email: responseEmail,
            metadata: metadata,
            message: "Successfully updated chat"
        });
    })
    .catch((err)=>{
        return res.status(500).json({
            err: err,
            message: "server failed",
            description: "Failed to update the history array in ChatCollection"
        });
    })
}



/*
This is a DELETE type request
Expects id of the chat to be fetched in request link as parameter under the name of id
Description: Delete by ID a specific chat
*/
async function deleteChatById(req,res) {
    const user = req.user;
    const organisation = req.organisation;

    if(!hasPermission(user.organisationRole, PERMISSION.DELETE_CHAT))
        return res.status(401).json({ message: "Permission denied", description: "Not allowed to delete chat" });

    const chatId = req.params.id;
    if(!chatId)
        return res.status(401).json({ message: "Invalid request params", description: "id feild not present in request parameters" });
    
    try{
        await Chat.findByIdAndDelete(chatId);
    }
    catch(err) {
        return res.status(500).json({
            err: err,
            message: "Internal Server Error",
            description: "The ChatRecord couldn't be deleted from ChatSchema"
        });
    }

    return res.status(200).json({
        message: "chat deleted succesfully"
    });
}



/*
This is a post type request
Expects {link: string, client: string} in request body
Description: create a new entry in 'Chat Schema'
*/
async function createNewChat(req,res) {
    const userId = String(req.user._id);
    const organisation = req.organisation._id;

    const link = req.body.link;
    const client = req.body.client;

    if(!link || !client){
        return res.json({
            message: "Incomplete information",
            description: "link or client feild required in request body"
        });
    }

    let email;
    try{
        const response = await axiosInstance({
            method: "POST",
            url: "/chats",
            data: {
                link: link,
                client: client
            }
        });

        email = response.data.email;
    } catch(err){
        return res.status(500).json({
            err: err,
            message: "Failed to extract data from python server",
            description: "The error is the one from axios API, while hitting the python endpoint"
        });
    }

    console.log(email);

    let newChatRecord;
    try {
        const newChatTemplate = new Chat({
            organisationId: organisation._id,
            userId: userId,
            link: link,
            client: client,
            history: [{
                type: "AIMessage",
                email: email
            }]
        });
        newChatRecord = await newChatTemplate.save();
    } catch(err){
        return res.status(500).json({
            error: err,
            message: "Core server error",
            description: "Creation of new chat entry failed"
        });
    }

    return res.status(200).json({
        chat: newChatRecord,
        message: "Successfully created new chat"
    });
}

const chatController = {
    createNewChat,
    getAllChats,
    getChatById,
    chatWithBot,
    deleteChatById,
};

export default chatController;