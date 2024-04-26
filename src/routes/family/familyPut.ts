import express, { Request, Response, NextFunction } from "express";
import { Put } from "../../services/fetch";
import { FAMILY } from "./shared";

const router = express.Router();

// connecté a datalake - TESTED NEW DATA LAKE
router.put(FAMILY, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {family} = req.body;

    if(!family) {
      throw new Error(req.originalUrl + ", msg: family was falsy: " + family)
    }

    const response = await Put("/family", JSON.stringify(family));

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
