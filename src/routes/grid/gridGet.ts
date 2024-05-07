import express, { Request, Response } from "express"
import { GRID } from "./shared";
import { Get } from "../../services/fetch";

const router = express.Router();

router.get(GRID, async (req: Request, res: Response) => {
    try {
  
      const page: string | any | string[] | undefined = req.query.page;
      const limit: string | any | string[] | undefined = req.query.limit;
  
      let intPage;
      let intLimit;
  
      if(page === undefined) {
          intPage = 1;
      } else {
          intPage = parseInt(page) 
      }
  
  
      if(limit === undefined) {
          intLimit = 10;        
      } else {
          intLimit = parseInt(limit); 
      }        
  
  
      const response = await Get("/grid", undefined, intPage, intLimit );
  
      if(response.status !== 200) {
        throw new Error(req.originalUrl + ", msg: Could not get grids")
      }
  
      const grid = await response.json();

      res.status(200).json(grid);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: { message: "un probleme est survenu" } });
    }
});
  

router.get(GRID + "/:id", async (req: Request, res: Response) => {
    try {
  
        const id: string | undefined | null = req.params.id;
  
        if(id === null || id === undefined) {
            res.status(200).json({})
            throw new Error(req.originalUrl + ", msg: id was: " + id)
        }
  
  
        const response = await Get("/grid", id);
  
        if(response.status !== 200) {
            throw new Error("Le Get Id familly n'a pas donné un 200 status")
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