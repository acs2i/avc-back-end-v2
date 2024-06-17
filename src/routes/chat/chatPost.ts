// routes/chat/chatPost.ts

import express, { Request, Response } from "express";
import Message from "../../models/Message"; // Assurez-vous que le modèle de message est correctement importé
import { MESSAGES } from "./shared";

const router = express.Router();

router.post(
  MESSAGES,
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const { sender, receiver, message } = req.body;

    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const newMessage = new Message({ sender, receiver, message });
      await newMessage.save();

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).send("Error sending message");
    }
  }
);

export default router;
