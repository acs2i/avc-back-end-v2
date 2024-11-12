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
      const { creator_id } = collection;
      const user = await User.findById(creator_id);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      const body = JSON.stringify(collection);
      const response = await Post("/collection", body);

      // Vérification des erreurs spécifiques
      if (response.status === 409) {
        const errorData = await response.json();
        console.warn("Erreur 409 : collection existe déjà.", errorData);
        return res.status(409).json({
          error: errorData.msg || "Une collection avec ce code existe déjà",
          status: 409,
        });
      } else if (response.status !== 200) {
        const errorData = await response.json();
        console.warn("Erreur du data lake :", errorData);
        throw new HttpError("Erreur sur le data lake", response.status);
      }

      // Traitement si pas d’erreur
      const savedCollection = await response.json();
      
        res.status(200).json(savedCollection);

    } catch (err) {
      console.error("Erreur dans la route de collection :", err);
      return next(err);
    }
  }
);




export default router;
