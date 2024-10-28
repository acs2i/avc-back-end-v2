import express, { Request, Response } from "express";
import { Post } from "../../services/fetch";
import { DIMENSION } from "./shared";
import HttpError from "../../models/http-errors";

const router = express.Router();

// we will need to be
router.post(DIMENSION, async (req: Request, res: Response) => {
  try {
    const dimension = req.body;

    if (!dimension) {
      throw new Error(
        req.originalUrl + ", msg: dimension was falsy: " + dimension
      );
    }

    const response = await Post("/dimension", JSON.stringify(dimension));

    if (response.status === 409) {
      const errorData = await response.json();
      throw new HttpError(
        errorData.message || "Une marque avec ce code existe déjà",
        409
      );
    }

    if (response.status !== 200) {
      throw new Error(
        "Response status was not 200: " + JSON.stringify(response)
      );
    }

    const document = await response.json();

    res.status(200).json(document);
  } catch (err) {
    if (err instanceof HttpError && err.code === 409) {
      return res.status(409).json({
        message: err.message,
        error: "DUPLICATE_CODE",
      });
    }
    console.error(err);
    res.status(400).json(err);
  }
});

export default router;
