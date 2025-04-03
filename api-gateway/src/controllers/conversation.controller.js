import Conversation from "../models/Conversation";
import Joi from "joi";
import axios from "axios";

// Input validation schema
const conversationValidationSchema = Joi.object({
  message: Joi.string().required(),
});

// Continue/Update Conversation API
exports.continueConversation = async (req, res) => {
  try {
    // Validate the input data
    const { error } = conversationValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Payload for Continue Conversation / Query
    const options = {
      url: `/query`,
      baseURL: process.env.CORE_API_BASE_URL,
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${process.env.CORE_API_ACCESS_TOKEN}`,
      },
      json: true,
      data: {
        query_text: req.body.message,
      },
    };

    const coreAPIResponse = await axios(options);

    // Add the human message
    await Conversation.findByIdAndUpdate(
      req.conversation?.conversationId,
      { $push: { history: { ...req.body, sender: "Human" } } }, // Push the new message into the history array
      { new: true } // Return the updated document
    );

    // Increment the conversationThresholdCount
    await Conversation.updateOne(
      { _id: req.conversation?.conversationId }, // Filter
      { $inc: { conversationThresholdCount: 1 } } // Increment
    );

    let continueConversationResponse = await Conversation.findByIdAndUpdate(
      req.conversation?.conversationId,
      {
        $push: {
          history: { message: coreAPIResponse.data?.response, sender: "Bot" },
        },
      }, // Push the new message into the history array
      { new: true } // Return the updated document
    );

    res.status(201).json({
      history: continueConversationResponse.history,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to continue conversation",
      error: err.message,
    });
  }
};
