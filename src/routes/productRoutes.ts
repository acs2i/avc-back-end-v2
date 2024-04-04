import express, { Request, Response, NextFunction } from "express";
import Product from "../models/ProductModel";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";

const router = express.Router();

//GET ALL PRODUCT
//@GET
//api/v1/product
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();

    res.status(201).json({ products: products });
  } catch (err) {
    res.status(500).json({ error: { message: "un probleme est survenu" } });
  }
});

//GET PRODUCT BY ID
//@GET
//api/v1/product/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  let product;
  try {
    product = await Product.findById(id);
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, impossible de trouver l'utilisateur",
      500
    );
    return next(error);
  }

  if (!product) {
    const error = new HttpError(
      "Impossible de touver un utilisateur à l'adresse fournie",
      404
    );
    return next(error);
  }

  res.json({ product: product.toObject({ getters: true }) });
});

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
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });

      // Enregistre le produit
      const savedProduct = await newProduct.save();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator,
        {
          $push: {
            products: {
              _id: savedProduct._id,
              reference: savedProduct.reference,
              name: savedProduct.name,
              date: savedProduct.createdAt,
            },
          },
        },
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

//UPDATE
//@PATCH
//api/v1/product/create
router.patch(
  "/edit/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

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
      // Vérifier si le produit existe
      let product = await Product.findById(id);
      if (!product) {
        throw new HttpError("Produit non trouvé.", 404);
      }

      // Vérifier si l'utilisateur existe
      const user = await User.findById(creator);
      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Mettre à jour les détails du produit
      product.reference = reference;
      product.name = name;
      product.familly = familly;
      product.subFamilly = subFamilly;
      product.brand = brand;
      product.productCollection = productCollection;

      product.creator.push({
        _id: user._id,
        username: user.username,
        email: user.email,
      });

      // Enregistrer les modifications du produit
      const updatedProduct = await product.save();

      // Mettre à jour le champ products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator,
        {
          $push: {
            products: {
              _id: updatedProduct._id,
              reference: updatedProduct.reference,
              name: updatedProduct.name,
              date: updatedProduct.updatedAt,
            },
          },
        },
        { new: true }
      ).populate("products");

      res
        .status(200)
        .json({ product: updatedProduct.toObject({ getters: true }) });
    } catch (err) {
      const error = new HttpError(
        "Échec lors de la mise à jour du produit, réessayez plus tard.",
        500
      );
      return next(error);
    }
  }
);

//DELETE PRODUCT
//@DELETE
//api/v1/product/delete/:id
router.delete(
  "/delete/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id;
      await Product.findByIdAndDelete(productId);

      res.status(200).json({ message: "Produit supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  }
);

export default router;
