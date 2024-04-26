import express, { Request, Response, NextFunction } from "express";
import { Put } from "../../services/fetch";
import { BRAND } from "./shared";

const router = express.Router();

// connecté a datalake - TESTED NEW DATA LAKE
router.put(BRAND + "/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brand = req.body;
  
      if(!brand) {
        throw new Error(req.originalUrl + ", msg: brand was falsy: " + brand)
      }

      const id: string | undefined | null = req.params.id;

      if(!id) {
        throw new Error(req.originalUrl + ", msg: id was falsy: " + id)
      }
  
      const response = await Put("/brand", JSON.stringify(brand));
  
      if(!response) {
        throw new Error(req.originalUrl + ", msg: response was falsy: " + JSON.stringify(response))
      }
  
      
      if(response.status === 200) {
        const updatedDoc = await response.json();
        res.status(200).json(updatedDoc);
      } else {
        throw new Error(req.originalUrl + ", msg: response status was not 200: " + JSON.stringify(response))
      }
  
  
    }catch(err) {
          console.error(err)
          res.status(400).json({})
      }
})


export default router;
  