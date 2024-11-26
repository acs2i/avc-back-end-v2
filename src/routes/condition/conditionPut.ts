import express, { Request, Response, NextFunction } from "express";
import { Put } from "../../services/fetch";
import { CONDITION } from "./shared";
import multer from 'multer';

const router = express.Router();



  const storage = multer.memoryStorage();
  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
  });
  
  router.put(CONDITION + "/:id", upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        if (!id) {
          throw new Error("ID manquant");
        }
  
        if (req.file) {
          // Gestion upload fichier
          const filePath = `/uploads/${Date.now()}-${req.file.originalname}`;
          const condition = {
            filePath: filePath
          };
          const response = await Put("/condition/" + id, JSON.stringify(condition));
          
          if (!response || response.status !== 200) {
            throw new Error("Erreur lors de l'upload");
          }
  
          const updatedDoc = await response.json();
          return res.status(200).json(updatedDoc);
        }
  
        // Gestion mise à jour normale
        const condition = req.body;
        if (!condition) {
          throw new Error("Données manquantes");
        }
  
        const response = await Put("/condition/" + id, JSON.stringify(condition));
        if (!response || response.status !== 200) {
          throw new Error("Erreur lors de la mise à jour");
        }
  
        const updatedDoc = await response.json();
        res.status(200).json(updatedDoc);
  
      } catch(err) {
        console.error(err);
        res.status(400).json({});
      }
  });
  
  export default router;
  