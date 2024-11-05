import express, { Request, Response, NextFunction } from "express";
import User from "../../models/UserModel";
import HttpError from "../../models/http-errors";
import { Delete, Post } from "../../services/fetch";
import { PRODUCT } from "./shared";

const router = express.Router();

router.post(PRODUCT + "/send-code", async (req: Request, res: Response) => {
  try {
    const { code } = req.body; // Extraire le code de la requête

    console.log("Code envoyé:", code); // Loggez le code envoyé

    if (!code) {
      throw new Error(req.originalUrl + ", msg: dimension was falsy: " + code);
    }

    // Envoie le code sous forme de chaîne JSON
    const response = await Post("/get-id",  JSON.stringify(code));

    console.log("Réponse de /get-id:", response.status); // Loggez le statut de la réponse

    if (response.status !== 200) {
      const errorText = await response.text(); // Récupérez le texte d'erreur pour le débogage
      throw new Error("Response status was not 200: " + JSON.stringify({ status: response.status, error: errorText }));
    }

    const document = await response.json();
    res.status(200).json(document);
  } catch (err) {
    console.error("Erreur dans send-code:", err);
    res.status(400).json({ message: "erreur", details: "erreur" });
  }
});



//CREATE
// Connecté à datalake - TESTED NEW DATA LAKE
//@POST
//api/v1/product/create
//TELL VINCE THAT THERE IS NO LONGER A CREATE
router.post(
  PRODUCT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = req.body;


      const body = JSON.stringify(product );
      console.log("Données envoyées au Data Lake :", body);
      // Envoie de la requête pour créer le produit dans le data lake
      const response = await Post("/product", body);

      if (response.status !== 200) {
        throw new HttpError(
          "Erreur à propos de la requête vers le data lake pour référence",
          400
        );
      }

      const data = await response.json();

      // Retourner les données du produit créé
      res.status(200).json(data);
      
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);



export default router;
