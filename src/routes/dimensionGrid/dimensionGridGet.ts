import express, { Request, Response } from "express"
import { Get } from "../../services/fetch";
import { DIMENSION_GRID } from "./shared";
import { generalLimits } from "../../services/generalServices";

const router = express.Router();

router.get(DIMENSION_GRID, async(req: Request, res: Response) => {
    try {
        const {intPage, intLimit} = await generalLimits(req);

        const response = await Get("/dimension-grid", undefined, intPage, intLimit);

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

router.get(DIMENSION_GRID + "/search", async(req: Request, res: Response) => {
    try {
      
        const {intPage, intLimit} = await generalLimits(req);       

      const {label, code, status} = req.query;
  
      const response = await Get("/dimension/search", undefined, intPage, intLimit, { label, code, status});
  
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

router.get(DIMENSION_GRID + "/:id", async(req: Request, res: Response) => {
    try {

        
        const id: string | undefined | null = req.params.id;

        if(id === null || id === undefined) {
            res.status(200).json({})
            throw new Error(req.originalUrl + ", msg: id was: " + id)
        }


        const response = await Get("/dimension-grid", id);

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