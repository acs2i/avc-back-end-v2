import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";
import { TARIF } from "./shared";

const router = express.Router();

// we will need to be
router.post(TARIF, async (req: Request, res: Response) => {
    try {
        const tarif = req.body;
        
        if(!tarif) {
            throw new Error(req.originalUrl + ", msg: tarif was falsy: " + tarif)
        }

        const response = await Post("/tarif", JSON.stringify(tarif));

        if(response.status !== 200) {
            throw new Error("Response status was not 200: " + JSON.stringify(response))
        }

        const document = await response.json();

        res.status(200).json(document)

    } catch(err) {
        console.error(err);
        res.status(400).json(err)
    }
})


export default router;