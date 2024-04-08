import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import Familly from "../models/FamilyModel";

const router = express.Router();

//CREATE
//@POST
//api/v1/familly/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, subFamilly, creator } = req.body;

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creator);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const newFamilly = new Familly({
        name,
        subFamilly,
        creator: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });

      // Enregistre le produit
      const savedFamilly = await newFamilly.save();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator,
        {
          $push: {
            products: {
              _id: savedFamilly._id,
              name: savedFamilly.name,
              date: savedFamilly.createdAt,
            },
          },
        },
        { new: true }
      ).populate("products");

      res.status(201).json({ familly: savedFamilly.toObject({ getters: true }) });
    } catch (err) {
      const error = new HttpError(
        "Echec lors de la création du produit, réessayez plus tard.",
        500
      );
      return next(error);
    }
  }
);


//GET ALL FAMILLYS
//@PGET
//api/v1/family
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const famillies = await Familly.find();
  
      res.status(201).json({ famillies: famillies });
    } catch (err) {
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
  });

export default router;
