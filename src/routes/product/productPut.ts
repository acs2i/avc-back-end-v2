import express, { Request, Response } from "express";
import { Put } from "../../services/fetch";
import { PRODUCT } from "./shared";


const router = express.Router();


// connecté a datalake - TESTED NEW DATA LAKE
router.put(PRODUCT + "/:id", async( req: Request, res: Response) => {
  try {
    
    const product = req.body;
    console.log(req.body)
    if(!product) {
      throw new Error(req.originalUrl + ", msg: Product was falsy: " + product)
    }
    const id: string | undefined | null = req.params.id;

    if(!id) {
      throw new Error(req.originalUrl + ", msg: id was falsy: " + id)
    }

    const response = await Put("/product/" + id, JSON.stringify(product));

    if(!response) {
      throw new Error(req.originalUrl + ", msg: response was falsy: " + JSON.stringify(response))
    }

    if(response.status === 200) {
      const updatedProduct = await response.json();
      res.status(200).json(updatedProduct);
    } else {
      throw new Error(req.originalUrl + ", msg: response status was not 200: " + JSON.stringify(response))
    }
 
  } catch(err) {
    console.error(err)
    res.status(400).json({})
  }

})

export default router;
