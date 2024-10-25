import express, { Request, Response, NextFunction } from "express";
import { Get} from "../../services/fetch";
import { COLLECTION } from "./shared";
import { generalLimits } from "../../services/generalServices";
const router = express.Router();

//GET ALL COLLECTIONS
// connecté à data lake - TESTED ON NEW DATA LAKE
//@PGET
//api/v1/collection
router.get(COLLECTION, async (req: Request, res: Response, next: NextFunction) => {
    try {

      
      const {intPage, intLimit} = await generalLimits(req);

      const response = await Get("/collection", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les collection");
      }
      const collections = await response.json();
  
      res.status(200).json(collections);
    } catch (err) {
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});


router.get(COLLECTION + "/search", async(req: Request, res: Response) => {
  try {
    
    const {intPage, intLimit} = await generalLimits(req);

    const { code, label, type, status} = req.query;

    const response = await Get("/collection/search", undefined, intPage, intLimit, {code, label, type, status});

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

router.get(COLLECTION + "/:id", async (req: Request, res: Response) => {
  try {

      const id: string | undefined | null = req.params.id;

      if(id === null || id === undefined) {
          res.status(200).json({})
          throw new Error(req.originalUrl + ", msg: id was: " + id)
      }


      const response = await Get("/collection", id);

      if(response.status !== 200) {
          throw new Error("Le Get Id pour collection n'a pas donné un 200 status")
      }

      const result = await response.json();

      res.status(200).json(result)

  }
  catch(err) {
      res.status(500).json(err)
      console.error(err)
  }


})



export default router;
