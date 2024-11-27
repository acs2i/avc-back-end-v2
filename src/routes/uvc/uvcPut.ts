import express, { Request, Response, NextFunction } from "express";
import { Put } from "../../services/fetch";
import { UVC } from "./shared";
const router = express.Router();

// connecté a datalake - TESTED NEW DATA LAKE
router.put(UVC + "/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uvc = req.body;
  
      if(!uvc) {
        throw new Error(req.originalUrl + ", msg: uvc was falsy: " + uvc)
      }

      const id: string | undefined | null = req.params.id;

      if(!id) {
        throw new Error(req.originalUrl + ", msg: id was falsy: " + id)
      }
  
      const response = await Put("/uvc/" + id, JSON.stringify(uvc));
  
      if(!response) {
        throw new Error(req.originalUrl + ", msg: response was falsy: " + JSON.stringify(response))
      }
  
      
      if(response.status === 200) {
        const updatedDoc = await response.json();
        res.status(200).json(updatedDoc);
      } else {
        throw new Error(req.originalUrl + ", msg: response status was not 200: " + JSON.stringify(response))
      }
  
  
    }catch(err) {
          console.error(err)
          res.status(400).json({})
      }
  })

  router.put(UVC + "/update-ean/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // ID de l'UVC depuis l'URL
        const uvc = req.body; // Corps de la requête avec `ean` et `eanIndex`

        // Vérification des données
        if (!uvc || !id) {
            return res.status(400).json({ error: 'Invalid request. Missing data or ID.' });
        }

        // Transmettre la requête au premier backend
        const response = await Put(`/uvc/update-ean/${id}`, JSON.stringify(uvc));

        if (response.status === 200) {
            const updatedDoc = await response.json(); // Extraire la réponse du premier backend
            return res.status(200).json(updatedDoc);
        } else {
            // Gérer les erreurs du premier backend
            const errorResponse = await response.json();
            return res.status(response.status).json(errorResponse);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while updating the EAN in the backend.' });
    }
});


  
  
  export default router;
  