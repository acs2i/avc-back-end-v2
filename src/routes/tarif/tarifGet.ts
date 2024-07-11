import { Get } from "../../services/fetch";
import { generalLimits } from "../../services/generalServices";
import express, { Request, Response } from "express"
import { TARIF } from "./shared";

const router = express.Router()

router.get(TARIF, async (req: Request, res: Response) => {
  try {
    
    const {intPage, intLimit} = await generalLimits(req);


    const response = await Get("/tarif", undefined, intPage, intLimit);

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les tarif");
    }
    
    const results = await response.json();
    res.status(200).json(results);
  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }


})

router.get(TARIF + "/search", async(req: Request, res: Response) => {
    try {
      
      const {intPage, intLimit} = await generalLimits(req);

      const {code, label} = req.query
  
      const response = await Get("/tarif/search", undefined, intPage, intLimit, {code, label});
  
      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les tarif");
      }
      
      const results = await response.json();
      res.status(200).json(results);
  
    } catch(err) {
      console.error(err)
      res.status(500).json(err);
    }
  
  
  
})

  export default router