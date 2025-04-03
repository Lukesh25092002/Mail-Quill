import mongoose, { Mongoose } from "mongoose";

const emailSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  body: { type: String, required: true },
}, { _id: false });

let chatSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Types.ObjectId,ref:'Organisation', required: true },
  userId: { type: mongoose.Types.ObjectId, ref:'User', required: true },
  client: { type: String, required: true },
  link: { type: String, required: true },
  history: {
    type: [
      {
        type: { type: String, required: true },
        email: { type: emailSchema, required: false },
        query: { type: String, required: false },
      },
    ],
    required: true,
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;