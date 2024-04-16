import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import Brand from "../models/BrandModel";
import { Delete, Get, Post } from "../services/fetch";

const router = express.Router();

//CREATE
//@POST
//api/v1/brand/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, creatorId } = req.body; // creator is CREATOR ID

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const body = JSON.stringify(
        {
          name, 
          creator: { 
            _id: user._id, 
            username: user.username, 
            email: user.email
          }
        }   
      );

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
        Delete("/brands", savedBrand._id);
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
// connecté à data lake
//@PGET
//api/v1/brand
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await Get("/brands");

      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les brands");
      }
      const brands = await response.json();
      res.status(201).json(brands);
    } catch (err) {
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
  });

export default router;
