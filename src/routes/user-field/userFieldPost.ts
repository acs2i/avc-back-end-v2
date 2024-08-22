
import { Post } from "../../services/fetch";
import { USERFIELD } from "./shared";
import express, { Request, Response } from "express"

const router = express.Router()

router.post(USERFIELD, async (req: Request, res: Response) => {
    try {
        const field = req.body;
        
        if(!field) {
            throw new Error(req.originalUrl + ", msg: supplier was falsy: " + field)
        }

        const response = await Post("/user-field", JSON.stringify(field));

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