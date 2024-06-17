import mongoose, { Document, Schema } from "mongoose";

interface IMessage extends Document {
  sender: string;
  receiver: string;
  message: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
