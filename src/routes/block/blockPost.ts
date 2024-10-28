import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";
import { BLOCK } from "../block/shared";

const router = express.Router();

// we will need to be
router.post(BLOCK, async (req: Request, res: Response) => {
    try {
        const block = req.body;
        
        if(!block) {
            throw new Error(req.originalUrl + ", msg: tag was falsy: " + block)
        }

        const response = await Post("/block", JSON.stringify(block));

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