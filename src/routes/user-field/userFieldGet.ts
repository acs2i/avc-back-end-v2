import express, { Request, Response, NextFunction } from "express";
import { Get } from "../../services/fetch";
import { USERFIELD } from "./shared";
import { generalLimits } from "../../services/generalServices";
import HttpError from "../../models/http-errors";
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

router.get(USERFIELD + "/search", async(req: Request, res: Response) => {
  try {
    
    const {intPage, intLimit} = await generalLimits(req);

    const { code, label, status} = req.query;

    const response = await Get("/user-field/search", undefined, intPage, intLimit, {code, label, status});

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les collections");
    }
    
    const collections = await response.json();
    res.status(200).json(collections);

  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }
})

router.get(USERFIELD + "/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  let result = undefined;
  try {

    const response = await Get("/user-field", id);

    if(response) {
      result = await response.json();
    } else {
      throw new HttpError("Un problème à propos de la cherche de supplier s'est passé", 400);
    }

    if (!result) {
      throw new HttpError(
        "Impossible de trouver un utilisateur à l'adresse fournie",
        404
      )    
    }
  
    res.status(200).json(result);

  } catch (err) {
    console.error(err)
    res.status(500).json({error: { message: "Un probleme est survenu "}})
  }


});


export default router