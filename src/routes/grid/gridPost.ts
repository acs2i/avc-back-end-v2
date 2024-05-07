import express, { Request, Response, NextFunction } from "express";
import User from "../../models/UserModel";
import HttpError from "../../models/http-errors";
import {Post} from "../../services/fetch";
import { GRID } from "./shared";

const router = express.Router();

router.post(GRID, async (req: Request, res: Response) => {
    const grid  = req.body;

    try {

      const body = JSON.stringify({...grid});

      // // Enregistre le produit
      const response = await Post("/grid", body);

      if(response.status !== 200) {
        throw new Error(req.originalUrl + ", msg: response status was not 200 in grid post")
      }
  
      const newGrid = await response.json();

      res
        .status(200)
        .json(newGrid);
    } catch (err) {
      console.error(err);
      res.status(400).json({})
    }
  }
);

export default router;