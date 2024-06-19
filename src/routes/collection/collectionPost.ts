import express, { Request, Response, NextFunction } from "express";
import User from "../../models/UserModel";
import HttpError from "../../models/http-errors";
import { Delete, Post } from "../../services/fetch";
import { COLLECTION } from "./shared";

const router = express.Router();

//CREATE
// connecté à data lake
//@POST
//api/v1/collection/create
router.post(
  COLLECTION,
  async (req: Request, res: Response, next: NextFunction) => {
    const collection = req.body;

    try {

      const {creatorId} = collection;
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const body = JSON.stringify(collection)

      const response = await Post("/collection", body);

      if(response.status !== 200 ){
        throw new HttpError("Erreur sur le coté data lake à propos de Post collection " + JSON.stringify(response), 400);
      }

      const savedCollection = await response.json();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creatorId,
        {
          $push: {
            products: {
              _id: savedCollection._id,
              name: savedCollection.name,
              date: savedCollection.createdAt,
            },
          },
        },
        { new: true }
      )

      if ( updatedUser === null ||  updatedUser === undefined) {
        Delete("/collection", savedCollection._id);
        throw new Error("could not find user, rolling back the changes")
    }


      res.status(200).json(savedCollection);
    } catch (err) {
      console.error(err)
      return next(err);
    }
  }
);



export default router;
