import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import Family from "../models/FamilyModel";
import SubFamily from "../models/SubFamilyModel";
import { Get, Post } from "../services/fetch";

const router = express.Router();

//CREATE
// connecté à datalake
//@POST
//api/v1/family/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, subFamily, creatorId } = req.body;

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);
      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      const body = JSON.stringify({ creatorId, name, subFamily});

      // // Enregistre le produit
      const response = await Post("/family", body);

      if(response.status !== 200) {
        throw new HttpError("Le Post ne pouvait pas recevoir les valeurs à propos des familles", 400);
      }
  
      const newFamily = await response.json();

      res
        .status(201)
        .json(newFamily);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
);

//GET ALL FAMILLIES
// connecté a datalake
//@PGET
//api/v1/family
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await Get("/family");

    if(response.status !== 200) {
      throw new HttpError("Le Get ne pouvait pas recevoir les valeurs à propos des familles", 400);
    }

    const family = await response.json();

    res.status(201).json(family);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: "un probleme est survenu" } });
  }
});

//GET FAMILY BY ID
// 
//@PGET
//api/v1/family
router.get("/name/:name", async (req: Request, res: Response, next: NextFunction) => {
  try {

    const name : string | null | undefined = req.params.name;

    if(name === undefined || name === null) {
      throw new Error(req.originalUrl + ": msg: name was undefind or null: " + name);
    }

    const response = await Get("/family/name", name);


    if(response.status !== 200) {
      throw new HttpError("Le Get ne pouvait pas recevoir les valeurs à propos des familles", 400);
    }

    const family = await response.json();


    res.status(201).json(family);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: "un probleme est survenu" } });
  }
});


//CREATE
// connecté à datalake
//@POST
//api/v1/family/subFamily/create
router.post(
  "/subfamily/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, familyId, creatorId } = req.body;
    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

   
      const body = JSON.stringify({name, familyId})

      const response = await Post("/subFamily", body);
      
      if(response.status !== 200 ){
        throw new HttpError("Erreur sur le coté data lake à propos de Post subfamily " + JSON.stringify(response), 400);
      }

      const savedSubFamily = await response.json();

      const updatedUser = await User.findByIdAndUpdate(
        creatorId,
        {
          $push: {
            products: {
              _id: savedSubFamily._id,
              name: savedSubFamily.name,
              date: savedSubFamily.createdAt,
            },
          },
        },
        { new: true }
      )

      if(updatedUser) {
        res
        .status(201)
        .json(savedSubFamily);
      } else {
        throw new HttpError("Probleme avec updatedUser", 400);
      }

   
    } catch (err) {
      console.error(err)
      return next(err);
    }
  }
);

//GET SUBFAMILLIES BY familyID
// connecté à datalake
//@PGET
//api/v1/family/subfamily/:familliId
router.get(
  "/subfamily/:familyId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const familyId : string | undefined | null = req.params.familyId;

      const response = await Get("/subFamily", familyId);
  
      if(response.status !== 200) {
        throw new Error("Erreur quand chercher les subfamily valeurs sur le cote datalake");
      }

      const subFamilies = await response.json();

      res.status(201).json(subFamilies)

    } catch(err) {
      console.error(err)
      return next(err);
    }
  }

  
);

export default router;
