import { verifyToken } from './../../middleware/auth';
import express, { Request, Response } from "express"
import { DRAFT } from "./shared";
import DraftModel from '../../models/draftSchema';
import { UpdateWriteOpResult } from 'mongoose';


const router = express.Router();

router.put(DRAFT + "/:id", verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {

        const draft = req.body;

        
        if(!draft) {
            throw new Error(req.originalUrl + ", msg: req.body was falsy")
        }

        if(!req.user) {
            throw new Error(req.originalUrl + ", msg: User was not authenticated");
        }

        const _id: string | undefined | null = req.params.id;

        if(!_id) {
            throw new Error(req.originalUrl + ", msg: _id was falsy: " + _id)
        }

        // Check product first matches the  creator id
        const targetedDraft = await DraftModel.findById(_id );

        if(!targetedDraft) {
            throw new Error(req.originalUrl + ", msg: targeted draft was not found")
        }

        // Make sure authorization token matches
        const creatorId: string = targetedDraft.CREATOR_ID as unknown as string;
        const idFromToken = req.user.id;

        // JAKE/VINCE/WALID/MARTIN - Il faut le mettre à jour quand le system de droit est implementé
        if(creatorId !=  idFromToken) {
            throw new Error(req.originalUrl + ", msg: you are not authorized to edit this id")
        }


        const response: UpdateWriteOpResult= await DraftModel.updateOne({ _id}, {$set: draft })

        if (response.acknowledged === true && response.matchedCount === 1 && response.modifiedCount === 1) {
            res.status(200).json(response)
        } else{
            throw new Error(req.originalUrl + ", msg: There was a response that didn't match the needed criteria: "+response.acknowledged+" " +response.matchedCount+" "+response.modifiedCount)
        }

    

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})
export default router;