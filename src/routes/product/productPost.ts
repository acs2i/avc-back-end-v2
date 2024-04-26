import express, { Request, Response, NextFunction } from "express";
import User from "../../models/UserModel";
import HttpError from "../../models/http-errors";
import { Delete, Post } from "../../services/fetch";
import { PRODUCT } from "./shared";


const router = express.Router();


//CREATE
// Connecté à datalake - TESTED NEW DATA LAKE
//@POST
//api/v1/product/create
//TELL VINCE THAT THERE IS NO LONGER A CREATE
router.post(PRODUCT, async (req: Request, res: Response, next: NextFunction) => {
    try {
  
      const { creatorId, product } : { creatorId: string | undefined | null, product: any } = req.body;

      if(!creatorId) {
        throw new HttpError("Erreur a propos de creatorId: "+ creatorId , 400);
      }

      const body = JSON.stringify({ ...product})

      const response = await Post("/product", body)

      if(response.status !== 200) {
        throw new HttpError("Erreur à propos de la rèquete vers le data lake pour reference", 400);
      }

      const data = await response.json(); // notez: eventuellement ajoute l'interface de reference du datalake?

      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creatorId,
        {
          $push: {
            products: {
              _id: data._id,
              reference: data.reference,
              name: data.name,
              date: data.createdAt,
            },
          },
        },
        { new: true }
      );

      if(updatedUser) {
        res.status(200).json(data);
      } else {
        // delete reference
        Delete("/product", creatorId)
        throw new HttpError("Erreur a propos de updated user: "+ updatedUser , 400);

      }


    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;