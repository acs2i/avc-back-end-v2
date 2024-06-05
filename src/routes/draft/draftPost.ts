import { verifyToken } from './../../middleware/auth';
import express, { Request, Response } from "express"
import { DRAFT } from "./shared";
import DraftModel from '../../models/draftSchema';
import { Document } from 'mongoose';

const router = express.Router();

router.post(DRAFT, async (req: Request, res: Response) => {
    try {

        const draft = req.body;

        
        if(!draft) {
            throw new Error("req.body was falsy")
        }

        const id = req.body.id;

        const {designation_longue} = draft;

        const existingDraft = await DraftModel.findOne( {designation_longue, id});

        if(existingDraft) {
            throw new Error(req.originalUrl + ", msg: There already is a draft with this name")
        }

        const newDraft = await new DraftModel({...draft, id})

       
        if(!newDraft) {
            throw new Error(req.originalUrl + " msg: draft save did not work for some reason: " + draft);
        }

        const result : Document | null | undefined = await newDraft.save({timestamps: true})

        res.status(200).json(result);


    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

export default router;