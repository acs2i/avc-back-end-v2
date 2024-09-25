
import HttpError from "../../models/http-errors";
import { Get, Post } from "../../services/fetch";
import { SUPPLIER } from "./shared";
import express, { Request, Response } from "express"

const router = express.Router()

router.post(SUPPLIER, async (req: Request, res: Response) => {
    try {
        const supplier = req.body;
        
        if(!supplier) {
            throw new Error(req.originalUrl + ", msg: supplier was falsy: " + supplier)
        }

        const response = await Post("/supplier", JSON.stringify(supplier));

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