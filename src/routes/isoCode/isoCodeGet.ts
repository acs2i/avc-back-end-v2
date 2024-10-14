import express, { Request, Response } from "express";
import HttpError from "../../models/http-errors";
import { Get} from "../../services/fetch";
import { generalLimits } from "../../services/generalServices";
const router = express.Router();

router.get("/iso-code", async (req: Request, res: Response) => {
    try {

      
      const {intPage, intLimit} = await generalLimits(req);

      const response = await Get("/iso-code", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Did not receive a proper response from data lake");
      }
      const obj = await response.json();
  
      res.status(200).json(obj);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});

export default router;