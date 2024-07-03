import express, { Request, Response, NextFunction } from "express";
import { Put } from "../../services/fetch";
import { SUPPLIER } from "./shared";

const router = express.Router();

router.put(SUPPLIER + "/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplier = req.body;
  
      if(!supplier) {
        throw new Error(req.originalUrl + ", msg: supplier was falsy: " + supplier)
      }

      const id: string | undefined | null = req.params.id;

      if(!id) {
        throw new Error(req.originalUrl + ", msg: id was falsy: " + id)
      }
  
      console.log("supplier: " , supplier)
      console.log("id: " , id)

      const response = await Put("/supplier/" + id, JSON.stringify(supplier));
  
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
  