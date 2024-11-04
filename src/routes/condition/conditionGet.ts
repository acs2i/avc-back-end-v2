import express, { Request, Response } from "express"
import { Get } from "../../services/fetch";
import { CONDITION} from "./shared";
import { generalLimits } from "../../services/generalServices";

const router = express.Router();

router.get(CONDITION + "/:supplierId", async(req: Request, res: Response) => {
    try {

        
        const supplierId: string | undefined | null = req.params.supplierId;

        if(supplierId === null || supplierId === undefined) {
            res.status(200).json({})
            throw new Error(req.originalUrl + ", msg: id was: " + supplierId)
        }


        const response = await Get("/condition", supplierId);

        if(response.status !== 200) {
            throw new Error("Erreur sur le coté de data lake serveur en cherchant les conditions");
        }

        const documents = await response.json();

        res.status(200).json(documents);

    } catch(err) {
        console.error(err);
        res.status(400).json({})
    }
})


export default router;