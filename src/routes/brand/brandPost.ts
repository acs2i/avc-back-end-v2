import express, { Request, Response, NextFunction } from "express";
import User from "../../models/UserModel";
import HttpError from "../../models/http-errors";
import { Delete, Post } from "../../services/fetch";
import { BRAND } from "./shared";

const router = express.Router();

//CREATE
// connecté à data lake - NEW DATALAKE
//@POST
//api/v1/brand/create
// TELL VINCE TO CHANGE FROM "/create" to "/"
router.post(BRAND, async (req: Request, res: Response, next: NextFunction) => {
    const brand = req.body; // creator is CREATOR ID

    try {
      const { creator_id } = brand;
      // Rechercher l'utilisateur en utilisant son ID
      const user = await User.findById(creator_id);

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
        creator_id,
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

      if (!updatedUser) {
        Delete("/brand", savedBrand._id);
        throw new Error("could not find user, rolling back the changes")
      }


      res.status(200).json(savedBrand);
    } catch (err) {
      console.error(err)
      return next(err);
    }
  }
);



export default router;
