import express, { Request, Response } from "express";
import { Put } from "../../services/fetch";
import { PRODUCT } from "./shared";


const router = express.Router();


// connecté a datalake - TESTED NEW DATA LAKE
router.put(PRODUCT, async( req: Request, res: Response) => {
  try {
    
    const {product , creatorId} = req.body;

    if(!product) {
      throw new Error(req.originalUrl + ", msg: Product was falsy: " + product)
    }

   
    // Vérifier si l'utilisateur existe
    // the user is not currently accounted for in the data already so this wont help us. 
    // we cant go back to associate ids with the items
    // const user = await User.findById(creatorId);

    // if (!user) {
    //   throw new HttpError("Utilisateur non trouvé.", 404);
    // }

    const response = await Put("/product", JSON.stringify(product));

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
