import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";
import { DIMENSION_GRID } from "./shared";

const router = express.Router();

// we will need to be
router.post(DIMENSION_GRID, async (req: Request, res: Response) => {
    try {
        const object = req.body;
        
        if(!object) {
            throw new Error(req.originalUrl + ", msg: object was falsy: " + object)
        }

        const response = await Post("/dimension-grid", JSON.stringify(object));

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