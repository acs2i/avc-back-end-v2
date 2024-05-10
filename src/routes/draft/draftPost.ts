import { verifyToken } from './../../middleware/auth';
import express, { Request, Response } from "express"
import { DRAFT } from "./shared";
import DraftModel from '../../models/draftSchema';
import { Document } from 'mongoose';

const router = express.Router();

router.post(DRAFT, verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {

        const draft = req.body;

        
        if(!draft) {
            throw new Error("req.body was falsy")
        }

        if(!req.user) {
            throw new Error("User was not authenticated");
        }

        // Make sure authorization token matches
        const CREATOR_ID = req.user.id;

        const {GA_LIBELLE} = draft;

        const existingDraft = await DraftModel.findOne( {GA_LIBELLE , CREATOR_ID});

        if(existingDraft) {
            throw new Error(req.originalUrl + ", msg: There already is a draft with this name")
        }

        const newDraft = await new DraftModel({...draft, CREATOR_ID, IS_DRAFT: "0"})

       
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