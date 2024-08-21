import express, { Request, Response, NextFunction } from "express";
import { Get } from "../../services/fetch";
import { USERFIELD } from "./shared";
import { generalLimits } from "../../services/generalServices";
const router = express.Router();

//GET ALL BRANDS
// connecté à data lake - NEW DATALAKE
//@PGET
//api/v1/brand
router.get(USERFIELD, async (req: Request, res: Response, next: NextFunction) => {
    try {

      const {intPage, intLimit} = await generalLimits(req);

      const response = await Get("/user-field", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les brands");
      }
      const brands = await response.json();
      res.status(200).json(brands);
    } catch (err) {
      console.error(err)
      res.status(500).json(err);
    }
});


export default router