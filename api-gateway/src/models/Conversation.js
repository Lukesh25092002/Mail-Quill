const mongoose = require("../config/database");

// Define a history schema
const historySchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      enum: ["Bot", "Human"],
    },
    message: mongoose.Schema.Types.Mixed,
  },
  { _id: true, timestamps: true }
); // This is the default; history automatically get an _id field & timestamps

const conversationSchema = new mongoose.Schema(
  {
    history: [historySchema],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
