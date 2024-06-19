import express, { Request, Response } from "express"
import { Get } from "../../services/fetch";
import { DIMENSION } from "./shared";
import { generalLimits } from "../../services/generalServices";

const router = express.Router();

// connecté a datalake - TESTED NEW DATA LAKE
router.get(DIMENSION + "/search", async(req: Request, res: Response) => {
    try {
      
        const {intPage, intLimit} = await generalLimits(req);       

      const {label} = req.query;
  
      const response = await Get("/dimension/search", undefined, intPage, intLimit, { label});
  
      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les families");
      }
      
      const families = await response.json();
      res.status(200).json(families);
  
    } catch(err) {
      console.error(err)
      res.status(500).json(err);
    }
  
  
  })

router.get(DIMENSION, async(req: Request, res: Response) => {
    try {
        const {intPage, intLimit} = await generalLimits(req);

        const response = await Get("/dimension", undefined, intPage, intLimit);

        if(response.status !== 200) {
            throw new Error("Erreur sur le coté de data lake serveur en cherchant les dimensions");
        }

        const documents = await response.json();

        res.status(200).json(documents);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

router.get(DIMENSION + "/:id", async(req: Request, res: Response) => {
    try {

        
        const id: string | undefined | null = req.params.id;

        if(id === null || id === undefined) {
            res.status(200).json({})
            throw new Error(req.originalUrl + ", msg: id was: " + id)
        }


        const response = await Get("/dimension", id);

        if(response.status !== 200) {
            throw new Error("Erreur sur le coté de data lake serveur en cherchant les dimensions");
        }

        const documents = await response.json();

        res.status(200).json(documents);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})


export default router;