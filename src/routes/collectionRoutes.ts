import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import Collection from "../models/CollectionModel";

const router = express.Router();

//CREATE
//@POST
//api/v1/collection/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, creator } = req.body;

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creator);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const newCollection = new Collection({
        name,
        creator: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });
   
      // Enregistre le produit
      const savedCollection = await newCollection.save();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator,
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

      res.status(201).json({ collection: savedCollection.toObject({ getters: true }) });
    } catch (err) {
      const error = new HttpError(
        "Echec lors de la création du produit, réessayez plus tard.",
        500
      );
      return next(error);
    }
  }
);


//GET ALL COLLECTIONS
//@PGET
//api/v1/collection
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collections = await Collection.find();
  
      res.status(201).json({ collections: collections });
    } catch (err) {
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
  });

export default router;
