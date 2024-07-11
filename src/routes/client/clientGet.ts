import express, { Request, Response, NextFunction } from "express";
import { Get} from "../../services/fetch";
import { CLIENT } from "./shared";
import { generalLimits } from "../../services/generalServices";
const router = express.Router();

router.get(CLIENT, async (req: Request, res: Response, next: NextFunction) => {
    try {

      
      const {intPage, intLimit} = await generalLimits(req);

      const response = await Get("/client", undefined, intPage, intLimit);

      if(response.status !== 200) {
        throw new Error("Erreur sur le coté de data lake serveur en cherchant les client");
      }
      const result = await response.json();
  
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});


router.get(CLIENT + "/search", async(req: Request, res: Response) => {
  try {
    
    const {intPage, intLimit} = await generalLimits(req);

    const { type} = req.query;

    const response = await Get("/client/search", undefined, intPage, intLimit, {type});

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les client");
    }
    
    const result = await response.json();
    res.status(200).json(result);

  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }
})

router.get(CLIENT + "/:id", async (req: Request, res: Response) => {
  try {

      const id: string | undefined | null = req.params.id;

      if(id === null || id === undefined) {
          res.status(200).json({})
          throw new Error(req.originalUrl + ", msg: id was: " + id)
      }


      const response = await Get("/client", id);

      if(response.status !== 200) {
          throw new Error("Le Get Id pour client n'a pas donné un 200 status")
      }

      const result = await response.json();

      res.status(200).json(result)

  }
  catch(err) {
      res.status(500).json(err)
      console.error(err)
  }


})



export default router;
