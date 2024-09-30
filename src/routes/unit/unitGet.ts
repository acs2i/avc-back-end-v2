import express, { Request, Response, NextFunction } from "express";
import HttpError from "../../models/http-errors";
import { Get } from "../../services/fetch";
import { generalLimits } from "../../services/generalServices";
import { UNIT } from "./shared";


const router = express.Router();


//GET ALL PRODUCT
// Connecté à datalake - TESTED NEW DATA LAKE
//@GET
//api/v1/product
router.get(UNIT, async (req: Request, res: Response) => {
  try {

  
    const response = await Get("/unit");

    if(response.status !== 200 ) {
      throw new HttpError("GET tous les produit n'a pas bien functioné ",400);
    }

    const results = await response.json();

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: "un probleme est survenu" } });
  }
});


export default router;