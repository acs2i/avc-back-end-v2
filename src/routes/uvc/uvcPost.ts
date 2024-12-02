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

router.post(UVC + "/check-eans", async (req: Request, res: Response) => {
    try {
        const { ean, currentEanIndex, uvcId } = req.body;

        if (!ean) {
            return res.status(400).json({ error: "EAN is required in the request body." });
        }

        const response = await Post(
            "/uvc/check-eans",
            JSON.stringify({ ean, currentEanIndex, uvcId }), 
        );

        if (response.status !== 200) {
            const errorResponse = await response.json();
            throw new Error("Failed to check EAN: " + JSON.stringify(errorResponse));
        }

        const result = await response.json();

       
        return res.status(200).json({
            message: result.message,
            product: result.product || null,
            exist: result.exists, 
            uvcId: result.uvcId || null,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "An error occurred while checking the EAN.",
            details: "Unknown error",
        });
    }
});


export default router;
