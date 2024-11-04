import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";
import { CONDITION } from "./shared";

const router = express.Router();

// we will need to be
router.post(CONDITION, async (req: Request, res: Response) => {
    try {
        const condition = req.body;
        
        if(!condition) {
            throw new Error(req.originalUrl + ", msg: dimension was falsy: " + condition)
        }

        const response = await Post("/condition", JSON.stringify(condition));

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