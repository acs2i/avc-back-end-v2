import express, { Request, Response, NextFunction } from "express";
import HttpError from "../../models/http-errors";
import { Get } from "../../services/fetch";
import { PRODUCT } from "./shared";
import { generalLimits } from "../../services/generalServices";


const router = express.Router();
/* 
DEPRECATED
router.get(PRODUCT + "/ga-libelle/:GA_LIBELLE", async(req: Request, res: Response) => {
  try {

    const { GA_LIBELLE } = req.params;

    if(!GA_LIBELLE){
      throw new Error("GA_LIBELLE was falsy")
    }

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

    const response = await Get("/product/ga-libelle", GA_LIBELLE);

    if(response.status !== 200) {
      throw new Error("Error on the side of data lake");
    }

    const results = await response.json();

    res.status(200).json(results)


  } catch(err) {
    console.error(err)
    res.status(400).json({})
  }
})
*/
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
    

    const { reference, supplier, tag, brand, long_label, collection, dimension, dimension_type, status } = req.query;

    const response = await Get("/product/search", undefined, intPage, intLimit,  {reference, supplier, tag, brand, long_label, collection, dimension, dimension_type, status });

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
router.get(PRODUCT, async (req: Request, res: Response) => {
  try {

  
    const {intPage, intLimit} = await generalLimits(req);

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
router.get(PRODUCT + "/:id", async (req: Request, res: Response) => {
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
  }


});

export default router;