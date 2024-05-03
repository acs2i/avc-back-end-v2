import express, { Request, Response, NextFunction } from "express";
import HttpError from "../../models/http-errors";
import { Get } from "../../services/fetch";
import { FAMILY } from "./shared";
const router = express.Router();

//GET ALL FAMILLIES
// connecté a datalake - TESTED NEW DATA LAKE
//@PGET
//api/v1/family
router.get(FAMILY, async (req: Request, res: Response, next: NextFunction) => {
    try {
  
      const page: string | any | string[] | undefined = req.query.page;
      const limit: string | any | string[] | undefined = req.query.limit;
  
      let intPage;
      let intLimit;
  
      if(page === undefined) {
          intPage = 1;
      } else {
          intPage = parseInt(page) 
      }
  
  
      if(limit === undefined) {
          intLimit = 10;        
      } else {
          intLimit = parseInt(limit); 
      }        
  
  
      const response = await Get("/family", undefined, intPage, intLimit );
  
      if(response.status !== 200) {
        throw new HttpError("Le Get ne pouvait pas recevoir les valeurs à propos des familles", 400);
      }
  
      const family = await response.json();
  
      res.status(200).json(family);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
  });
  
  

// connecté a datalake - TESTED NEW DATA LAKE
router.get(FAMILY + "/search", async(req: Request, res: Response) => {
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
       

      const {YX_TYPE, YX_CODE, YX_LIBELLE} = req.query;
  
      const response = await Get("/family/search", undefined, intPage, intLimit, { YX_CODE, YX_LIBELLE, YX_TYPE});
  
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
  // connecté a datalake - TESTED NEW DATA LAKE
router.get(FAMILY + "/YX_TYPE", async (req: Request, res: Response, next: NextFunction) => {
    try {
  
      const page: string | any | string[] | undefined = req.query.page;
      const limit: string | any | string[] | undefined = req.query.limit;
  
      let intPage;
      let intLimit;
  
      if(page === undefined) {
          intPage = 1;
      } else {
          intPage = parseInt(page) 
      }
  
  
      if(limit === undefined) {
          intLimit = 10;        
      } else {
          intLimit = parseInt(limit); 
      }        
  
      const YX_TYPE = req.query.YX_TYPE;
  
  
      if(!YX_TYPE) {
        throw new HttpError("YX_TYPE ETAIT FALSY", 400);
      }

      const value = req.query.value;

      const response = await Get("/family", "YX_TYPE", intPage, intLimit, { YX_TYPE, value: value as string});
  
      if(response.status !== 200) {
        throw new HttpError("Le Get ne pouvait pas recevoir les valeurs à propos des familles", 400);
      }
  
      const family = await response.json();
  
      res.status(200).json(family);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});
  


router.get(FAMILY + "/:id", async (req: Request, res: Response) => {
  try {

      const id: string | undefined | null = req.params.id;

      if(id === null || id === undefined) {
          res.status(200).json({})
          throw new Error(req.originalUrl + ", msg: id was: " + id)
      }


      const response = await Get("/family", id);

      if(response.status !== 200) {
          throw new Error("Le Get Id familly n'a pas donné un 200 status")
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
