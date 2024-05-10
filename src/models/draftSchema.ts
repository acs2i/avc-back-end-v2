import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";


interface DraftSchema {
    CREATOR_ID: ObjectId,
    GA_CODEARTICLE: string,     
    GA_LIBCOMPL: string,       
    GA_LIBELLE: string,     
    GA_LIBREART1 : string,  
    GA_LIBREART2 : string, 
    GA_LIBREART4 : string, 
    GA_FOURNPRINC: string, 
    GA_FERME: string,   
    IS_DRAFT: string
}

const draftSchema = new mongoose.Schema<DraftSchema>({
    CREATOR_ID: {
        type: Schema.Types.ObjectId
    },
    GA_CODEARTICLE: {
        type: String
    },
    GA_LIBCOMPL: {
        type: String
    },
    GA_LIBELLE: {
        type: String
    },
    GA_LIBREART1: {
        type: String
    },
    GA_LIBREART2: {
        type: String
    },
    GA_LIBREART4: {
        type: String
    },
    GA_FOURNPRINC: {
        type: String
    },
    IS_DRAFT: {
        type: String
    },

},{ timestamps: true, collection: "draft" })


const DraftModel = mongoose.model<DraftSchema>("draft", draftSchema);
export default DraftModel