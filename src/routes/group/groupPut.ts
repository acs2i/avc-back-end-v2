import { verifyToken } from '../../middleware/auth';
import express, { Request, Response } from "express"
import { GROUP } from "./shared";
import GroupModel from '../../models/groupSchema';
import { UpdateWriteOpResult } from 'mongoose';


const router = express.Router();

router.put(GROUP + "/:id", verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {

        const group = req.body;

        
        if(!group) {
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
        const targetedGroup = await GroupModel.findById(_id );

        if(!targetedGroup) {
            throw new Error(req.originalUrl + ", msg: targeted draft was not found")
        }

        // Make sure authorization token matches
        const creatorId: string = targetedGroup.creator_id as unknown as string;
        const idFromToken = req.user.id;

        // JAKE/VINCE/WALID/MARTIN - Il faut le mettre à jour quand le system de droit est implementé
        if(creatorId !=  idFromToken) {
            throw new Error(req.originalUrl + ", msg: you are not authorized to edit this id")
        }


        const response: UpdateWriteOpResult= await GroupModel.updateOne({ _id}, {$set: group })

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