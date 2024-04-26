import express, { Request, Response } from "express"
import { Get } from "../../services/fetch";
import { DIMENSION } from "./shared";

const router = express.Router();

router.get(DIMENSION, async(req: Request, res: Response) => {
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
        
        const response = await Get("/dimension", undefined, intPage, intLimit);

        if(response.status !== 200) {
            throw new Error("Erreur sur le coté de data lake serveur en cherchant les dimensions");
        }

        const documents = await response.json();

        res.status(200).json(documents);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

router.get(DIMENSION + "/:id", async(req: Request, res: Response) => {
    try {

        
        const id: string | undefined | null = req.params.id;

        if(id === null || id === undefined) {
            res.status(200).json({})
            throw new Error(req.originalUrl + ", msg: id was: " + id)
        }


        const response = await Get("/dimension", id);

        if(response.status !== 200) {
            throw new Error("Erreur sur le coté de data lake serveur en cherchant les dimensions");
        }

        const documents = await response.json();

        res.status(200).json(documents);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})


export default router;