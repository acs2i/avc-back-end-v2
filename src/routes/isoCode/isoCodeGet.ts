import express, { Request, Response } from "express";
import HttpError from "../../models/http-errors";
import { Get} from "../../services/fetch";
import { generalLimits } from "../../services/generalServices";
import { ISO_CODE } from "./shared";
const router = express.Router();


router.get(ISO_CODE + "/search",async(req: Request, res: Response) => {
  try {
      
      const {intLimit, intPage} = await generalLimits(req);

      let filter: any = { $and: [] }  // any to make typescript stop complaining

      const {iso1, iso2, iso3, countryName} = req.query
  
      if(countryName) {
          const regEx = new RegExp(countryName as string, "i");
          filter.$and.push({ countryName: regEx })
      }

      // shard by region/ by range of user
      // crate read replicas - updated by eventualy consistency/async messaing
      // if not high writes you can index the data base for the queries so the reads can be easily accessed
      
  
      if(iso1) {
          const regEx = new RegExp(iso1 as string, "i");
          filter.$and.push({ iso1: regEx })
      }

      if(iso2) {
          const regEx = new RegExp(iso2 as string, "i");
          filter.$and.push({ iso2: regEx })
      }

      if(iso3) {
          const regEx = new RegExp(iso3 as string, "i");
          filter.$and.push({ iso3: regEx })
      }

      const response = await Get("/iso-code/search", undefined, intPage, intLimit, {iso1, iso2, iso3});

      if ( response === null ||  response === undefined) {
          throw new Error(req.originalUrl + ", msg: find error")
      }

      const results = await response.json();

      res.status(200).json(results)
  
  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }



})

router.get(ISO_CODE, async (req: Request, res: Response) => {
    try {

      
      const {intPage, intLimit} = await generalLimits(req);

      const response = await Get(ISO_CODE, undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Did not receive a proper response from data lake");
      }
      const obj = await response.json();
  
      res.status(200).json(obj);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});

router.get(ISO_CODE + "/search", async(req: Request, res: Response) => {
  try {
   
    const {intPage, intLimit} = await generalLimits(req);

    const { alpha2Code, alpha3Code, numeric, countryName } = req.query;


    const response = await Get("/iso-code/search", undefined, intPage, intLimit, {alpha2Code, alpha3Code, numeric, countryName});

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les brands");
    }
    
    const brands = await response.json();
    res.status(200).json(brands);

  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }

})

router.get(ISO_CODE + "/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  let result = undefined;
  try {

    const response = await Get(ISO_CODE, id);

    if(response) {
      result = await response.json();
    } else {
      throw new HttpError("Un problème à propos de la creation de la reference s'est passé", 400);
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

export default router;