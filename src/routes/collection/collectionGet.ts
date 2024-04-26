import express, { Request, Response, NextFunction } from "express";
import { Get} from "../../services/fetch";
import { COLLECTION } from "./shared";
const router = express.Router();

//GET ALL COLLECTIONS
// connecté à data lake - TESTED ON NEW DATA LAKE
//@PGET
//api/v1/collection
router.get(COLLECTION, async (req: Request, res: Response, next: NextFunction) => {
    try {

      const page: string | any | string[] | undefined = req.query.page;
      const limit: string | any | string[] | undefined = req.query.limit;

      let intPage : number;
      let intLimit : number;

      if(!page) {
          intPage = 1;
      } else {
          intPage = parseInt(page) 
      }


      if(!limit) {
          intLimit = 10;        
      } else {
          intLimit = parseInt(limit); 
      }        

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
    const page: string | any | string[] | undefined = req.query.page;
    const limit: string | any | string[] | undefined = req.query.limit;

    let intPage;
    let intLimit;

    if(!page) {
        intPage = 1;
    } else {
        intPage = parseInt(page) 
    }


    if(!limit) {
        intLimit = 10;        
    } else {
        intLimit = parseInt(limit); 
    }    
    
    const value = req.query.value;

    if(!value) {
        throw new Error(req.originalUrl + ", msg: value in family routes get was falsy: " + value);
    } 

    const response = await Get("/collection/search", undefined, intPage, intLimit, value as string);

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
