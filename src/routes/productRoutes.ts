import express, { Request, Response, NextFunction } from "express";
import Product from "../models/ProductModel";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";

const router = express.Router();

//CREATE
//@POST
//api/v1/product/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      reference,
      name,
      familly,
      subFamilly,
      brand,
      productCollection,
      creator,
    } = req.body;

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creator);
 
      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const newProduct = new Product({
        reference,
        name,
        familly,
        subFamilly,
        brand,
        productCollection,
        creator: {
          _id : user._id,
          username: user.username,
          email: user.email
        }
      });

      // Enregistre le produit
      const savedProduct = await newProduct.save();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator,
        { $push: { products: {
          _id: savedProduct._id,
          reference: savedProduct.reference,
          name: savedProduct.name,
          date: savedProduct.createdAt
        } } },
        { new: true }
      ).populate("products");

      res
        .status(201)
        .json({ product: savedProduct.toObject({ getters: true }) });
    } catch (err) {
      const error = new HttpError(
        "Echec lors de la création du produit, réessayez plus tard.",
        500
      );
      return next(error);
    }
  }
);

export default router;
