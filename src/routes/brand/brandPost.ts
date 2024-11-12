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
  const brand = req.body;

  try {
    const { creator_id } = brand;
    const user = await User.findById(creator_id);

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        status: 404,
      });
    }

    const body = JSON.stringify({ ...brand });
    const response = await Post("/brand", body);

    // Vérifiez si le code de réponse est 409 (conflit)
    if (response.status === 409) {
      const errorData = await response.json();
      return res.status(409).json({
        error: errorData.msg || "Une marque avec ce code existe déjà.",
        status: 409,
      });
    } else if (response.status !== 200) {
      throw new HttpError("Erreur côté data lake pour la création de la marque", 400);
    }

    const savedBrand = await response.json();
    res.status(200).json(savedBrand);

  } catch (err) {
    console.error(err);
    return next(err);
  }
});



export default router;
