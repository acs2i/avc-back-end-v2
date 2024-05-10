import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const decryptTokenMiddlewear = async (req: Request, res: Response, next: NextFunction) => {

    try {
        let token = req.header("Authorization");

        if (!token) {
            throw new Error("Pas d'authorisation")
        }
    
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }
    
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET non défini dans les variables d'environnement.");
        }

        const result: any = jwt.verify()


    
    } catch(err) {
        return res.status(500).json(err);
    }

}


export default decryptTokenMiddlewear;


