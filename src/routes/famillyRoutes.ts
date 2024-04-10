import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import Familly from "../models/FamilyModel";
import SubFamilly from "../models/SubFamillyModel";

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

      res
        .status(201)
        .json({ familly: savedFamilly.toObject({ getters: true }) });
    } catch (err) {
      const error = new HttpError(
        "Echec lors de la création du produit, réessayez plus tard.",
        500
      );
      return next(error);
    }
  }
);

//GET ALL FAMILLIES
//@PGET
//api/v1/familly
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const famillies = await Familly.find().sort({name: -1});

    res.status(201).json({ famillies: famillies });
  } catch (err) {
    res.status(500).json({ error: { message: "un probleme est survenu" } });
  }
});

//CREATE
//@POST
//api/v1/familly/subFamilly/create
router.post(
  "/subfamilly/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, familly, creator } = req.body;

    try {
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creator);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Créer un nouveau produit avec les détails de l'utilisateur
      const newSubFamilly = new SubFamilly({
        name,
        familly,
        creator: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });

      // Enregistre le produit
      const savedSubFamilly = await newSubFamilly.save();

      // Met a jour la famille liée à la sous famille crée
      const updateFamilly = await Familly.findById(familly);
      if (!updateFamilly) {
        throw new HttpError("Famille non trouvée.", 404);
      }
      updateFamilly.subFamilly.push(savedSubFamilly._id);
      await updateFamilly.save();

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator,
        {
          $push: {
            products: {
              _id: savedSubFamilly._id,
              name: savedSubFamilly.name,
              date: savedSubFamilly.createdAt,
            },
          },
        },
        { new: true }
      );

      res
        .status(201)
        .json({ subFamilly: savedSubFamilly.toObject({ getters: true }) });
    } catch (err) {
      const error = new HttpError(
        "Echec lors de la création du produit, réessayez plus tard.",
        500
      );
      return next(error);
    }
  }
);

//GET SUBFAMILLIES BY FAMILLYID
//@PGET
//api/v1/familly/subfamilly/:familliId
router.get(
  "/subfamilly/:famillyId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { famillyId } = req.params;

    if (!famillyId || typeof famillyId !== "string" || famillyId.trim() === "") {
      const error = new HttpError("Family ID is required and must be a non-empty string.", 400);
      return next(error);
    }

    let famillyWithSubfamilly;
    try {
      famillyWithSubfamilly = await Familly.findById(famillyId).populate(
        "subFamilly"
      );
    } catch (err) {
      const error = new HttpError(
        "Fetching subfamily failed, please try again later.",
        500
      );
      return next(error);
    }

    if (!famillyWithSubfamilly) {
      const error = new HttpError(
        "Could not find family with provided ID.",
        404
      );

      return next(error);
    }

    (famillyWithSubfamilly.subFamilly as any).sort((a : any, b: any) => a.name.localeCompare(b.name));

    res.status(200).json({
      subFamillies: famillyWithSubfamilly.subFamilly.map((sub) =>
        sub.toObject({ getters: true })
      ),
    });
  }

  
);

export default router;
