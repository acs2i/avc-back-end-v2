import express, { Request, Response, NextFunction } from "express";
import { Get } from "../../services/fetch";
import { BRAND } from "./shared";
const router = express.Router();

//GET ALL BRANDS
// connecté à data lake - NEW DATALAKE
//@PGET
//api/v1/brand
router.get(BRAND, async (req: Request, res: Response, next: NextFunction) => {
    try {

      const page: string | any | string[] | undefined = req.query.page;
      const limit: string | any | string[] | undefined = req.query.limit;

      let intPage : number;
      let intLimit : number;

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


      const response = await Get("/brand", undefined, intPage, intLimit);

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


router.get(BRAND + "/search", async(req: Request, res: Response) => {
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
  
      const response = await Get("/brand/search", undefined, intPage, intLimit, value as string);
  
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

export default router;