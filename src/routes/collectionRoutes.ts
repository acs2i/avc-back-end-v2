import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import { Delete, Get, Post } from "../services/fetch";

const router = express.Router();

//CREATE
// connecté à data lake
//@POST
//api/v1/collection/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { creatorId, collection} = req.body;

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const body = JSON.stringify({ creatorId, collection})

      const response = await Post("/collection", body);

      console.log(body)

      if(response.status !== 200 ){
        throw new HttpError("Erreur sur le coté data lake à propos de Post collection " + JSON.stringify(response), 400);
      }

      const savedCollection = await response.json();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creatorId,
        {
          $push: {
            products: {
              _id: savedCollection._id,
              name: savedCollection.name,
              date: savedCollection.createdAt,
            },
          },
        },
        { new: true }
      )

      if ( updatedUser === null ||  updatedUser === undefined) {
        Delete("/collection", savedCollection._id);
        throw new Error("could not find user, rolling back the changes")
    }


      res.status(201).json(savedCollection);
    } catch (err) {
      console.error(err)
      return next(err);
    }
  }
);


//GET ALL COLLECTIONS
// connecté à data lake - TESTED ON NEW DATA LAKE
//@PGET
//api/v1/collection
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {

      const page: string | any | string[] | undefined = req.query.page;
      const limit: string | any | string[] | undefined = req.query.limit;

      let intPage : number;
      let intLimit : number;

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

      const response = await Get("/collection", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les collection");
      }
      const collections = await response.json();
  
      res.status(201).json(collections);
    } catch (err) {
      res.status(500).json({ error: { message: "un probleme est survenu" } });
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

    const response = await Get("/collection/search", undefined, intPage, intLimit, value as string);

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les collections");
    }
    
    const collections = await response.json();
    res.status(201).json(collections);

  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }



})

export default router;
