import express, { Request, Response, NextFunction } from "express";
import { Put } from "../../services/fetch";
import { CLIENT } from "./shared";
const router = express.Router();

// connecté a datalake - TESTED NEW DATA LAKE
router.put(CLIENT + "/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = req.body;
  
      if(!client) {
        throw new Error(req.originalUrl + ", msg: client was falsy: " + client)
      }

      const id: string | undefined | null = req.params.id;

      if(!id) {
        throw new Error(req.originalUrl + ", msg: id was falsy: " + id)
      }
  
      const response = await Put("/client/" + id, JSON.stringify(client));
  
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
  