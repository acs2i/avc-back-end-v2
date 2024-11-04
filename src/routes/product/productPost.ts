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
  
      const { creator_id, product } : { creator_id: string | undefined | null, product: any } = req.body;

      if(!creator_id) {
        throw new HttpError("Erreur a propos de creatorId: "+ creator_id , 400);
      }

      const body = JSON.stringify({ ...product})

      const response = await Post("/product", body)

      if(response.status !== 200) {
        throw new HttpError("Erreur à propos de la rèquete vers le data lake pour reference", 400);
      }

      const data = await response.json(); // notez: eventuellement ajoute l'interface de reference du datalake?

      const user = await User.findById(creator_id);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creator_id,
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
        Delete("/product", creator_id)
        throw new HttpError("Erreur a propos de updated user: "+ updatedUser , 400);

      }


    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;