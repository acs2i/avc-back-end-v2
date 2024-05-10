import { Get } from "../../services/fetch";
import { SUPPLIER } from "./shared";
import express, { Request, Response } from "express"

const router = express.Router()

router.get(SUPPLIER, async (req: Request, res: Response) => {
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

router.get(SUPPLIER + "/search", async(req: Request, res: Response) => {
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
      
      const {T_TIERS, T_LIBELLE, T_JURIDIQUE, T_FERME, T_TELEPHONE, T_EMAIL} = req.query
  
      const response = await Get("/supplier/search", undefined, intPage, intLimit, {T_TIERS, T_LIBELLE, T_JURIDIQUE, T_FERME,T_TELEPHONE,T_EMAIL});
  
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