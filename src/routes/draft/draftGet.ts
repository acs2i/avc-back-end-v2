import { verifyToken } from './../../middleware/auth';
import express, { Request, Response } from "express"
import { DRAFT } from "./shared";
import DraftModel from '../../models/draftSchema';

const router = express.Router();

router.get(DRAFT + "/:id", verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {

        const _id = req.params.id;

        if(!_id) {
            throw new Error("Id was falsy")
        }

        const data = await DraftModel.findById(_id );

        if(!data) {
            throw new Error("Finding the Drafts returned falsy for some reason")
        }

        if(!req.user) {
            throw new Error("User was not authenticated");
        }

        // Make sure authorization token matches
        const idFromToken = req.user.id;

        const { CREATOR_ID}  = data;

        const creatorId : string = CREATOR_ID as unknown as string;

        if(creatorId != idFromToken) {
            throw new Error("Id passed from user does not match their authentication token");
        }

        res.status(200).json(data);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

// This will just fetch all the drafts that are in the avc backend database
router.get(DRAFT + "/creator-id/:creatorId", verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {
        const creatorId = req.params.creatorId;

        if(!creatorId) {
            throw new Error("Creator Id was falsy")
        }

        if(!req.user) {
            throw new Error("User was not authenticated");
        }
        // Make sure authorization token matches
        const idFromToken = req.user.id;

        if(creatorId !== idFromToken) {
            throw new Error("Id passed from user does not match their authentication token");
        }

        const filter = { CREATOR_ID: idFromToken}

        const data = await DraftModel.find(filter);

        if(!data) {
            throw new Error("Finding the Drafts returned falsy for some reason")
        }

        const total = await DraftModel.countDocuments(filter)

        res.status(200).json({data, total});



    } catch(err) {
        console.error(req.originalUrl + ", msg: error : " + err)
        res.status(400).json({})
    }


})


// This will just fetch all the drafts that are in the avc backend database
router.get(DRAFT + "/ga-libelle/:GA_LIBELLE", verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {
        const GA_LIBELLE = req.params.GA_LIBELLE;

        if(!GA_LIBELLE) {
            throw new Error("Creator Id was falsy")
        }
        
        const filter = { GA_LIBELLE }

        const data = await DraftModel.findOne(filter);

        if(!data) {
            throw new Error("Finding the Drafts returned falsy for some reason")
        }

        res.status(200).json(data);

    } catch(err) {
        console.error(req.originalUrl + ", msg: error : " + err)
        res.status(400).json({})
    }


})


export default router;
