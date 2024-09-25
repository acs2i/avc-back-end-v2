import express, { Request, Response } from "express";
import HttpError from "../../models/http-errors";
import { Get} from "../../services/fetch";
import { TAG } from "./shared";
import { generalLimits } from "../../services/generalServices";
const router = express.Router();

router.get(TAG + "/search", async(req: Request, res: Response) => {
  try {
   
    const {intPage, intLimit} = await generalLimits(req);

    const { code,  name, level } = req.query;

    console.log("code: " ,  code  , "  name: " , name, " level: ", level)
    const response = await Get("/tag/search", undefined, intPage, intLimit, {code, name, level});

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

//GET ALL TAGS
// connecté à data lake - TESTED ON NEW DATA LAKE
//@PGET
//api/v1/TAG
router.get(TAG, async (req: Request, res: Response) => {
    try {

      
      const {intPage, intLimit} = await generalLimits(req);

      const response = await Get("/tag", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Did not receive a proper response from data lake");
      }
      const collections = await response.json();
  
      res.status(200).json(collections);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});


router.get(TAG + "/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  let result = undefined;
  try {

    const response = await Get("/tag", id);

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

router.get(TAG + "/field/:field/value/:value", async (req: Request, res: Response) => {
  const { value , field } = req.params;

  let result = undefined;
  try {

    const response = await Get(`/tag/field/${field}/value`, value);

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