import express, { Request, Response } from "express"
import { Post } from "../../services/fetch";

const router = express.Router();

// we will need to be
router.post("/", async (req: Request, res: Response) => {
    try {
        const dimension = req.body;
        
        if(!dimension) {
            throw new Error(req.originalUrl + ", msg: dimension was falsy: " + dimension)
        }

        const response = await Post("/dimension", JSON.stringify(dimension));

        if(response.status !== 200) {
            throw new Error("Response status was not 200: " + JSON.stringify(response))
        }

        const document = await response.json();

        res.status(201).json(document)

    } catch(err) {
        console.error(err);
        res.status(400).json(err)
    }
})


export default router;