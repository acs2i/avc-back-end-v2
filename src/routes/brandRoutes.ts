import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import Brand from "../models/BrandModel";

const router = express.Router();

//CREATE
//@POST
//api/v1/brand/create
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
      const newBrand = new Brand({
        name,
        creator: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });
      console.log(newBrand)
      // Enregistre le produit
      const savedBrand = await newBrand.save();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator,
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
      ).populate("products");

      res.status(201).json({ familly: savedBrand.toObject({ getters: true }) });
    } catch (err) {
      const error = new HttpError(
        "Echec lors de la création du produit, réessayez plus tard.",
        500
      );
      return next(error);
    }
  }
);


//GET ALL BRANDS
//@PGET
//api/v1/brand
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brands = await Brand.find();
  
      res.status(201).json({ brands: brands });
    } catch (err) {
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
  });

export default router;
