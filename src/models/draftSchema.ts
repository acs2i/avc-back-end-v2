import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";


interface DraftSchema {
    creator_id: ObjectId,
    description_ref: string,     
    reference: string,       
    designation_longue: string,     
    designation_courte : string,  
    supplier_name : string,  
    supplier_ref : string,  
    family : string[],  
    subFamily : string[],  
    dimension_type : string, 
    dimension : string[],  
    brand : string, 
    ref_collection : string,
    composition : string,
    theme : string,
    description_brouillon: string,
    imgPath: string,
    status: number
}

const draftSchema = new mongoose.Schema<DraftSchema>({
    creator_id:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        timestamp: true,
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
    supplier_name: {
        type: String
    },
    supplier_ref: {
        type: String
    },
    family: [{
        type: String
    }],
    subFamily: [{
        type: String
    }],
    dimension_type: {
        type: String
    },
    dimension: [{
        type: String
    }],
    brand: {
        type: String
    },
    ref_collection: {
        type: String
    },
    composition: {
        type: String
    },
    theme: {
        type: String
    },
    description_brouillon: {
        type: String
    },
    imgPath: {
        type: String
    },
    status: {
        type: Number,
        default: 0
    },

},{ timestamps: true, collection: "draft" })


const DraftModel = mongoose.model<DraftSchema>("draft", draftSchema);
export default DraftModel