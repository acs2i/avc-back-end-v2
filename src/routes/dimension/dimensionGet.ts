import express, { Request, Response } from "express"
import { Get } from "../../services/fetch";

const router = express.Router();

router.get("/", async(req: Request, res: Response) => {
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
            intLimit = 1000;        
        } else {
            intLimit = parseInt(limit); 
        }        
        
        const response = await Get("/dimension", undefined, intPage, intLimit);

        if(response.status !== 200) {
            throw new Error("Erreur sur le coté de data lake serveur en cherchant les brands");
        }

        const documents = await response.json();

        res.status(201).json(documents);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

router.get("/:id", async(req: Request, res: Response) => {
    try {

        
        const id: string | undefined | null = req.params.id;

        if(id === null || id === undefined) {
            res.status(200).json({})
            throw new Error(req.originalUrl + ", msg: id was: " + id)
        }


        const response = await Get("/dimension", id);

        if(response.status !== 200) {
            throw new Error("Erreur sur le coté de data lake serveur en cherchant les brands");
        }

        const documents = await response.json();

        res.status(201).json(documents);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})


export default router;