import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";


interface DraftSchema {
    creator_id: ObjectId,
    description_ref: string,     
    reference: string,       
    designation_longue: string,     
    designation_courte : string,  
    marque : string, 
    collection : string, 
    description_brouillon: string,
    status: number
}

const draftSchema = new mongoose.Schema<DraftSchema>({
    creator_id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    description_ref: {
        type: String
    },
    reference: {
        type: String,
        required: true
    },
    designation_longue: {
        type: String
    },
    designation_courte: {
        type: String
    },
    marque: {
        type: String
    },
    collection: {
        type: String
    },
    description_brouillon: {
        type: String
    },
    status: {
        type: Number,
        default: 0
    },

},{ timestamps: true, collection: "draft" })


const DraftModel = mongoose.model<DraftSchema>("draft", draftSchema);
export default DraftModel