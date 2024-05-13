import { Request } from "express";


export const generalLimits = async ( req: Request) : Promise<{ intLimit: number, intPage: number, skip: number}> => {
    const limit: string | any | string[] | undefined = req.query.limit;
    const page: string | any | string[] | undefined = req.query.page;

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

    const skip = (intPage - 1) * intLimit;

    return { intPage, intLimit, skip}
}