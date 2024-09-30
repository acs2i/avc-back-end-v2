import { verifyToken } from "./../../middleware/auth";
import express, { Request, Response } from "express";
import { DRAFT } from "./shared";
import DraftModel from "../../models/draftSchema";
import User from "../../models/UserModel";
import { Document, Query } from "mongoose";
import { Get } from "../../services/fetch";

const router = express.Router();

;


router.post(DRAFT, async (req: Request, res: Response) => {
  try {
    const draft = req.body;
    const userId = req.body.creator_id;

    if (!draft) {
      throw new Error("req.body was falsy");
    }

    const id = req.body.id;
    const { long_label } = draft;

    const existingDraft = await DraftModel.findOne({ long_label, id });

    if (existingDraft) {
      throw new Error(
        req.originalUrl + ", msg: There already is a draft with this name"
      );
    }

    const newDraft = await new DraftModel({ ...draft, id });

    if (!newDraft) {
      throw new Error(
        req.originalUrl +
          " msg: draft save did not work for some reason: " +
          draft
      ); 5
    }

    const result: Document | null | undefined = await newDraft.save({
      timestamps: true,
    });
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { products: newDraft._id },
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
});

router.post(DRAFT + "/batch", async (req: Request, res: Response) => {
  try  {
    const drafts = req.body.drafts;
    const userId = req.body.creator_id;

    if (drafts.length === 0) {
      throw new Error("req.body was empty");
    }

    if(!userId) {
      throw new Error("No user id was present on the request")
    }

    // const id = req.body.id;
    // const { long_label } = draft;

    // const existingDraft = await DraftModel.findOne({ long_label, id });

    // if (existingDraft) {
    //   throw new Error(
    //     req.originalUrl + ", msg: There already is a draft with this name"
    //   );
    // }

    // const newDraft = await new DraftModel({ ...draft, id });

    // if (!newDraft) {
    //   throw new Error(
    //     req.originalUrl +
    //       " msg: draft save did not work for some reason: " +
    //       draft
    //   );
    // }

    // const result: Document | null | undefined = await newDraft.save({
    //   timestamps: true,
    // });
    // if (userId) {
    //   await User.findByIdAndUpdate(userId, {
    //     $push: { products: newDraft._id },
    //   });
    // }

    const insertedDrafts : any[] = await DraftModel.insertMany(drafts)
    const draftIds = insertedDrafts.map((draft) => draft._id);

    await User.findByIdAndUpdate(userId, {
      $push: { products: draftIds},
    });
    

    res.status(200).json(insertedDrafts);
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
});

router.post(DRAFT + "/draft/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (typeof status !== 'number') {
    return res.status(400).json({ error: "Le champ 'status' est requis et doit être un nombre." });
  }

  try {
    // Mettre à jour le statut du brouillon
    const updatedDraft = await DraftModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({ error: "Brouillon non trouvé" });
    }

    // Trouver l'utilisateur qui a créé le brouillon
    const user = await User.findById(updatedDraft.creator_id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Ajouter une notification à l'utilisateur
    user.notifications.push({
      message: `La référence ${updatedDraft.reference} que vous venez de créer est en cours de validation.`,
      date: new Date(),
      read: false
    });
    await user.save();

    res.status(200).json(updatedDraft);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour du brouillon." });
  }
});


export default router;