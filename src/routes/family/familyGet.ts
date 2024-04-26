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
      
      const value = req.query.value;
  
      if(!value) {
          throw new Error(req.originalUrl + ", msg: value in family routes get was falsy: " + value);
      } 
  
      const response = await Get("/family/search", undefined, intPage, intLimit, value as string);
  
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
  router.get(FAMILY + "/YX_TYPE/:YX_TYPE", async (req: Request, res: Response, next: NextFunction) => {
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
  
      const YX_TYPE: string | any | string[] | undefined = req.params.YX_TYPE;
  
  
      if(!YX_TYPE) {
        throw new HttpError("YX_TYPE ETAIT FALSY", 400);
      }
  
      const response = await Get("/family/YX_TYPE", YX_TYPE, intPage, intLimit );
  
      if(response.status !== 200) {
        // console.log("Response: " , response)
        throw new HttpError("Le Get ne pouvait pas recevoir les valeurs à propos des familles", 400);
      }
  
      const family = await response.json();
  
      res.status(200).json(family);
    } catch (err) {
        console.error(err);
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
  });
  

export default router;
