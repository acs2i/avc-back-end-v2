import { Request, Response } from "express";
import express from "express"
import { UVC } from "./shared";
import { Get } from "../../services/fetch";

const router = express.Router();


router.get(UVC, async( req: Request, res: Response) => {
    try {

        const page: string | any | string[] | undefined = req.query.page;
        const limit: string | any | string[] | undefined = req.query.limit;

        let intPage;
        let intLimit;

        if(page === undefined) {
            intPage = 1;
        } else {
            intPage = parseInt(page) 
        }


        if(limit === undefined) {
            intLimit = 10;        
        } else {
            intLimit = parseInt(limit); 
        }        

        const response = await Get("/uvc", undefined, intPage, intLimit);


        if(response.status !== 200) {
            throw new Error("Le Get Id uvc n'a pas donné un 200 status")
        }
  
        const result = await response.json();

        res.status(200).json(result)
  

    } catch(err) {
        console.error(err);
        res.status(500).json(err)
    }

})


export default router;