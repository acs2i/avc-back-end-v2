import express, { Request, Response, NextFunction } from "express";
import User from "../../models/UserModel";
import HttpError from "../../models/http-errors";
import { Post } from "../../services/fetch";
import { CLIENT } from "./shared";

const router = express.Router();

router.post(
  CLIENT,
  async (req: Request, res: Response, next: NextFunction) => {
    const client = req.body;

    try {

      const {creatorId} = client;
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const body = JSON.stringify(client)

      const response = await Post("/client", body);

      if(response.status !== 200 ){
        throw new HttpError("Erreur sur le coté data lake à propos de Post client " + JSON.stringify(response), 400);
      }

      const result = await response.json();

      res.status(200).json(result);
    } catch (err) {
      console.error(err)
      return next(err);
    }
  }
);



export default router;
