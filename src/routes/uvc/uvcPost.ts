import express, { Request, Response } from 'express';
import { UVC } from './shared';
import { Post } from '../../services/fetch';

const router = express.Router();

router.post(UVC, async (req: Request, res: Response) => {
    try {
        const uvc = req.body;

        if (!uvc) {
            throw new Error(req.originalUrl + ", msg: uvc was falsy: " + uvc);
        }
        const response = await Post("/uvc", JSON.stringify(uvc));

        if(response.status !== 200) {
            throw new Error("Response status was not 200: " + JSON.stringify(response))
        }

        const document = await response.json();

        res.status(200).json(document)

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

export default router;
