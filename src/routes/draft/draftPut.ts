import { verifyToken } from './../../middleware/auth';
import express, { Request, Response } from "express"
import { DRAFT } from "./shared";
import DraftModel from '../../models/draftSchema';
import { UpdateWriteOpResult } from 'mongoose';


const router = express.Router();

router.put(DRAFT + "/bulkUpdate", verifyToken, async (req: Request,res: Response) => {
    try {
        const { draftIds, updateData } = req.body;

        if (!draftIds || !Array.isArray(draftIds) || draftIds.length === 0) {
            throw new Error(req.originalUrl + ", msg: draftIds must be a non-empty array");
        }

        if (!updateData) {
            throw new Error(req.originalUrl + ", msg: updateData is required");
        }

       
        // Filtre pour s'assurer que l'utilisateur ne peut mettre à jour que ses propres drafts
        const response = await DraftModel.updateMany(
            { _id: { $in: draftIds } },
            { $set: updateData }
        );

        if (response.acknowledged && response.modifiedCount > 0) {
            res.status(200).json({ msg: "Drafts updated successfully", count: response.modifiedCount });
        } else {
            throw new Error(req.originalUrl + ", msg: No drafts were updated");
        }

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "erreur" });
    }
});

router.put(DRAFT + "/:id", async (req: Request & { user?: {id: string}}, res: Response) => {
    try {

        const draft = req.body;

        
        if(!draft) {
            throw new Error(req.originalUrl + ", msg: req.body was falsy")
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