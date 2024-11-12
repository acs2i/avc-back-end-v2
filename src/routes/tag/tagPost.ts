import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";
import { TAG } from "./shared";

const router = express.Router();

// we will need to be
router.post(TAG, async (req: Request, res: Response) => {
    try {
      const tag = req.body;
  
      if (!tag) {
        return res.status(400).json({
          error: "Données de tag manquantes",
          status: 400,
        });
      }
  
      const response = await Post("/tag", JSON.stringify(tag));
  
      // Vérifiez si le code de réponse est 409 (conflit)
      if (response.status === 409) {
        const errorData = await response.json();
        return res.status(409).json({
          error: errorData.msg || "Un tag avec ce niveau et code existe déjà.",
          status: 409,
        });
      } else if (response.status !== 200) {
        throw new Error("Erreur côté data lake pour la création du tag");
      }
  
      const document = await response.json();
      res.status(200).json(document);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Erreur interne lors de la création du tag",
        status: 500,
      });
    }
  });
  


export default router;