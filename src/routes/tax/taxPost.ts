import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";
import { TAX } from "../tax/shared";

const router = express.Router();

// we will need to be
router.post(TAX, async (req: Request, res: Response) => {
    try {
        const tax = req.body;
        
        if(!tax) {
            throw new Error(req.originalUrl + ", msg: tag was falsy: " + tax)
        }

        const response = await Post("/tax", JSON.stringify(tax));

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