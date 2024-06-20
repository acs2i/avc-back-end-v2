// routes/chat/chatPost.ts

import express, { Request, Response } from "express";
import Message from "../../models/Message"; // Assurez-vous que le modèle de message est correctement importé
import { MESSAGES } from "./shared";
import {verifyToken} from "../../middleware/auth"
import User from "../../models/UserModel"

const router = express.Router();

router.post(
  MESSAGES,
  verifyToken,
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const { sender, receiver, message } = req.body;

    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const newMessage = new Message({ sender, receiver, message });
      await newMessage.save();

      await User.findByIdAndUpdate(receiver, {
        $inc: { [`unreadMessages.${sender}`]: 1 }
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).send("Error sending message");
    }
  }
);

export default router;
