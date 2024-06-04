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

        // if(!req.user) {
        //     throw new Error("User was not authenticated");
        // }

        // Make sure authorization token matches
        // const creator_id = "test";
        // const creator_id = req.body;
        const creator_id = req.body.id;

        const {designation_longue} = draft;

        const existingDraft = await DraftModel.findOne( {designation_longue, creator_id});

        if(existingDraft) {
            throw new Error(req.originalUrl + ", msg: There already is a draft with this name")
        }

        const newDraft = await new DraftModel({...draft, creator_id, status: "0"})

       
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