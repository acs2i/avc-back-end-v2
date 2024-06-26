import express, { Request, Response, NextFunction } from "express";
import HttpError from "../../models/http-errors";
import { Get } from "../../services/fetch";
import { PRODUCT } from "./shared";


const router = express.Router();

// Connecté à datalake - TESTED NEW DATA LAKE
//@GET
router.get(PRODUCT + "/search", async(req: Request, res: Response) => {
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
        throw new Error(req.originalUrl + ", msg: value in product routes get was falsy: " + value);
    } 

    const response = await Get("/product/search", undefined, intPage, intLimit, value as string);

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

//GET ALL PRODUCT
// Connecté à datalake - TESTED NEW DATA LAKE
//@GET
//api/v1/product
router.get(PRODUCT, async (req: Request, res: Response, next: NextFunction) => {
  try {

    const page: string | any | string[] | undefined = req.query.page;
    const limit: string | any | string[] | undefined = req.query.limit;

    let intPage;
    let intLimit;

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

    const response = await Get("/product", undefined, intPage, intLimit);

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

//GET PRODUCT BY ID
// Connecté à datalake - TESTED FOR NEW DATALAKE
//@GET
//api/v1/product/:id
router.get(PRODUCT + "/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  let result = undefined;
  try {

    const response = await Get("/product", id);

    if(response) {
      result = await response.json();
    } else {
      throw new HttpError("Un problème à propos de la creation de la reference s'est passé", 400);
    }

    if (!result) {
      throw new HttpError(
        "Impossible de trouver un utilisateur à l'adresse fournie",
        404
      )    
    }
  
    res.status(200).json(result);

  } catch (err) {
    console.error(err)
    res.status(500).json({error: { message: "Un probleme est survenu "}})
    next(err);
  }


});

export default router;