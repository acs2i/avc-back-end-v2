import HttpError from "../../models/http-errors";
import { Get } from "../../services/fetch";
import { generalLimits } from "../../services/generalServices";
import { SUPPLIER } from "./shared";
import express, { Request, Response } from "express"

const router = express.Router()

router.get(SUPPLIER + "/search", async(req: Request, res: Response) => {
  try {

    console.log("HEREEEE")
    
    const {intPage, intLimit} = await generalLimits(req);

    const {code, company_name, address,city, status, country} = req.query
    
    console.log("company name: " , company_name)
    
    const response = await Get("/supplier/search", undefined, intPage, intLimit, {code, company_name, address,city, status, country});

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les products");
    }
    
    const results = await response.json();
    res.status(200).json(results);

  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }

})

router.get(SUPPLIER + "/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  let result = undefined;
  try {

    const response = await Get("/supplier", id);

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


router.get(SUPPLIER, async (req: Request, res: Response) => {
  try {
    
    const {intPage, intLimit} = await generalLimits(req);


    const response = await Get("/supplier", undefined, intPage, intLimit);

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les products");
    }
    
    const results = await response.json();
    res.status(200).json(results);
  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }


})




  export default router