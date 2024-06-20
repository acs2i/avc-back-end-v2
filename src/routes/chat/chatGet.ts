import express, { Request, Response } from 'express';
import MessageModel from '../../models/Message';
import User from "../../models/UserModel"
import { MESSAGES } from "./shared";

const router = express.Router();

router.get(MESSAGES + '/:userId/:contactId', async (req: Request, res: Response) => {
  const { userId, contactId } = req.params;

  try {
    const messages = await MessageModel.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });

    // Reset unread messages count for the user
    await User.findByIdAndUpdate(userId, {
      $set: { [`unreadMessages.${contactId}`]: 0 }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
