import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import { Delete, Get, Post } from "../services/fetch";

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

export default router;
