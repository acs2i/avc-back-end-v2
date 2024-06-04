import { verifyToken } from '../../middleware/auth';
import express, { Request, Response } from "express"
import { GROUP } from "./shared";
import GroupModel from '../../models/groupSchema';
import { Document } from 'mongoose';

const router = express.Router();

router.post(GROUP, async (req: Request, res: Response) => {
    try {

        const group = req.body;

        
        if(!group) {
            throw new Error("req.body was falsy")
        }
        const id = req.body.id;

        const {groupname} = group;

        const existingGroup = await GroupModel.findOne( {groupname, id});

        if(existingGroup) {
            throw new Error(req.originalUrl + ", msg: There already is a draft with this name")
        }

        const newGroup = await new GroupModel({...group, id})

       
        if(!newGroup) {
            throw new Error(req.originalUrl + " msg: draft save did not work for some reason: " + group);
        }

        const result : Document | null | undefined = await newGroup.save({timestamps: true})

        res.status(200).json(result);


    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

export default router;