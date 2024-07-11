import express, { Request, Response } from "express";
import { Put } from "../../services/fetch";
import { TARIF } from "./shared";

const router = express.Router();

router.put(TARIF + "/:id", async (req: Request, res: Response) => {
    try {
      const tarif = req.body;
  
      if(!tarif) {
        throw new Error(req.originalUrl + ", msg: tarif was falsy: " + tarif)
      }

      const id: string | undefined | null = req.params.id;

      if(!id) {
        throw new Error(req.originalUrl + ", msg: id was falsy: " + id)
      }

      const response = await Put("/tarif/" + id, JSON.stringify(tarif));
  
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
  