import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import { Delete, Get, Post, Put } from "../services/fetch";

const router = express.Router();

//CREATE
// connecté à data lake - NEW DATALAKE
//@POST
//api/v1/brand/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { creatorId, brand } = req.body; // creator is CREATOR ID

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      const body = JSON.stringify({
        ...brand
      })

      const response = await Post("/brand", body);

      if(response.status !== 200 ){
        throw new HttpError("Erreur sur le coté data lake à propos de Post brand " + JSON.stringify(response), 400);
      }

      const savedBrand = await response.json();


      const updatedUser = await User.findByIdAndUpdate(
        creatorId,
        {
          $push: {
            products: {
              _id: savedBrand._id,
              name: savedBrand.name,
              date: savedBrand.createdAt,
            },
          },
        },
        { new: true }
      )

      if ( updatedUser === null ||  updatedUser === undefined) {
        Delete("/brand", savedBrand._id);
        throw new Error("could not find user, rolling back the changes")
    }


      res.status(201).json(savedBrand);
    } catch (err) {
      console.error(err)
      return next(err);
    }
  }
);


//GET ALL BRANDS
// connecté à data lake - NEW DATALAKE
//@PGET
//api/v1/brand
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {

      const page: string | any | string[] | undefined = req.query.page;
      const limit: string | any | string[] | undefined = req.query.limit;

      let intPage : number;
      let intLimit : number;

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


      const response = await Get("/brand", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les brands");
      }
      const brands = await response.json();
      res.status(201).json(brands);
    } catch (err) {
      console.error(err)
      res.status(500).json(err);
    }
});


router.get("/search", async(req: Request, res: Response) => {
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
          intLimit = 1000;        
      } else {
          intLimit = parseInt(limit); 
      }    
      
      const value = req.query.value;
  
      if(!value) {
          throw new Error(req.originalUrl + ", msg: value in family routes get was falsy: " + value);
      } 
  
      const response = await Get("/brand/search", undefined, intPage, intLimit, value as string);
  
      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les brands");
      }
      
      const brands = await response.json();
      res.status(201).json(brands);

    } catch(err) {
      console.error(err)
      res.status(500).json(err);
    }



})


// connecté a datalake - TESTED NEW DATA LAKE
router.put("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {brand} = req.body;

    if(!brand) {
      throw new Error(req.originalUrl + ", msg: brand was falsy: " + brand)
    }

    const response = await Put("/brand", JSON.stringify(brand));

    if(!response) {
      throw new Error(req.originalUrl + ", msg: response was falsy: " + JSON.stringify(response))
    }

    
    if(response.status === 200) {
      const updatedDoc = await response.json();
      res.status(201).json(updatedDoc);
    } else {
      throw new Error(req.originalUrl + ", msg: response status was not 200: " + JSON.stringify(response))
    }


  }catch(err) {
        console.error(err)
        res.status(400).json({})
    }
})

export default router;
