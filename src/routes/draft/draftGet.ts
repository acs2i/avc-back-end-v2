import { verifyToken } from './../../middleware/auth';
import express, { Request, Response } from "express"
import { DRAFT } from "./shared";
import DraftModel from '../../models/draftSchema';
import { generalLimits } from '../../services/generalServices';

const router = express.Router();


// This will only get all the drafts that belong to a specific user
// This will also have search functionalities as well too...? right practice? perhaps. 
router.get(DRAFT, verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {
        
        if(!req.user) {
            throw new Error("User was not authenticated");
        }

        const {skip, intLimit} = await generalLimits(req);

        const CREATOR_ID = req.user.id;
        
        if(!CREATOR_ID) {
            throw new Error("Somehow creator id was falsy")
        }

        const filter = { $and: [{CREATOR_ID}] as any[]};

        // ONLY ALLOWS FOR NON LIASON VALUE SEARCHES
        const {GA_CODEARTICLE, GA_LIBCOMPL, GA_LIBELLE} = req.query;

        if(GA_CODEARTICLE) {
            const regEx = new RegExp(GA_CODEARTICLE as string, "i");
            filter.$and.push({GA_CODEARTICLE : {$regex: regEx}})
        }
        
        if(GA_LIBCOMPL) {
            const regEx = new RegExp(GA_LIBCOMPL as string, "i");
            filter.$and.push({GA_LIBCOMPL : {$regex: regEx}})
        }

        if(GA_LIBELLE) {
            const regEx = new RegExp(GA_LIBELLE as string, "i");
            filter.$and.push({GA_LIBELLE : {$regex: regEx}})
        }

        const data = await DraftModel.find(filter).skip(skip).limit(intLimit);

        const total = await DraftModel.countDocuments(filter);

        res.status(200).json({data, total});


    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

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
// DEPRECATED - use the /draft route for getting all the drafts for a user
// router.get(DRAFT + "/creator-id/:creatorId", verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
//     try {
//         const creatorId = req.params.creatorId;

//         if(!creatorId) {
//             throw new Error("Creator Id was falsy")
//         }

//         if(!req.user) {
//             throw new Error("User was not authenticated");
//         }
//         // Make sure authorization token matches
//         const idFromToken = req.user.id;

//         if(creatorId !== idFromToken) {
//             throw new Error("Id passed from user does not match their authentication token");
//         }

//         const filter = { CREATOR_ID: idFromToken}

//         const data = await DraftModel.find(filter);

//         if(!data) {
//             throw new Error("Finding the Drafts returned falsy for some reason")
//         }

//         const total = await DraftModel.countDocuments(filter)

//         res.status(200).json({data, total});



//     } catch(err) {
//         console.error(req.originalUrl + ", msg: error : " + err)
//         res.status(400).json({})
//     }


// })


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
