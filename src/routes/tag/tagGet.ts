import express, { Request, Response } from "express";
import { Get} from "../../services/fetch";
import { TAG } from "./shared";
import { generalLimits } from "../../services/generalServices";
const router = express.Router();

//GET ALL TAGS
// connecté à data lake - TESTED ON NEW DATA LAKE
//@PGET
//api/v1/TAG
router.get(TAG, async (req: Request, res: Response) => {
    try {

      
      const {intPage, intLimit} = await generalLimits(req);

      const response = await Get("/tag", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Did not receive a proper response from data lake");
      }
      const collections = await response.json();
  
      res.status(200).json(collections);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});

export default router;