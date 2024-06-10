import { verifyToken } from '../../middleware/auth';
import express, { Request, Response } from "express"
import { GROUP } from "./shared";
import GroupModel from '../../models/groupSchema';

const router = express.Router();

router.get(GROUP + "/:id", verifyToken, async (req: Request & { user?: {id: string}}, res: Response) => {
    try {

        const _id = req.params.id;

        if(!_id) {
            throw new Error("Id was falsy")
        }

        const data = await GroupModel.findById(_id );

        if(!data) {
            throw new Error("Finding the Drafts returned falsy for some reason")
        }

        if(!req.user) {
            throw new Error("User was not authenticated");
        }

        // Make sure authorization token matches
        const idFromToken = req.user.id;

        const { id}  = data;

        const creatorId : string = id as unknown as string;

        if(creatorId != idFromToken) {
            throw new Error("Id passed from user does not match their authentication token");
        }

        res.status(200).json(data);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})

// This will just fetch all the groups that are in the avc backend database
router.get(GROUP, async (req: Request, res: Response) => {
    try {
        const groups = await GroupModel.find().populate("users");
        res.status(200).json(groups);
      } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs." });
      }


})


export default router;
