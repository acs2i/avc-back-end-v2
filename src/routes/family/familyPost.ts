import express, { Request, Response, NextFunction } from "express";
import User from "../../models/UserModel";
import HttpError from "../../models/http-errors";
import {Post} from "../../services/fetch";
import { FAMILY } from "./shared";

const router = express.Router();

//CREATE
// connecté à datalake
//@POST
//api/v1/family/create
// TELL VINCE TO CHANGE THIS ON THE FRONT END
router.post(FAMILY, async (req: Request, res: Response, next: NextFunction) => {
    const { family, creatorId } = req.body;

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);
      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      const body = JSON.stringify({...family});

      // // Enregistre le produit
      const response = await Post("/family", body);

      if(response.status !== 200) {
        throw new HttpError("Le Post ne pouvait pas recevoir les valeurs à propos des familles", 400);
      }
  
      const newFamily = await response.json();

      res
        .status(200)
        .json(newFamily);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
);

export default router;