import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";
import { DIMENSION } from "./shared";

const router = express.Router();

// we will need to be
router.post(DIMENSION, async (req: Request, res: Response) => {
    try {
      const dimension = req.body;
      
      if (!dimension) {
        return res.status(400).json({
          error: "Données de dimension manquantes",
          status: 400
        });
      }
  
      const response = await Post("/dimension", JSON.stringify(dimension));
  
      if (response.status === 409) {
        const errorData = await response.json();
        return res.status(409).json({
          error: errorData.msg || "Une dimension avec ce code existe déjà",
          status: 409
        });
      } else if (response.status !== 200) {
        throw new Error("Statut de la réponse inattendu : " + response.status);
      }
  
      const document = await response.json();
      res.status(200).json(document);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Erreur interne lors de la création de la dimension",
        status: 500
      });
    }
  });
  

export default router;