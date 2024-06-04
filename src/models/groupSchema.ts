import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";


interface GroupSchema {
    groupname: String,
    description: String,
    authorization: String,
    users: Object,
    creator_id: ObjectId
}

const groupSchema = new mongoose.Schema<GroupSchema>({
    groupname: {
        type: String,
        required: true
    },
    authorization: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    users: {
        type: Object
    },
    creator_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
},{ timestamps: true, collection: "group" })


const GroupModel = mongoose.model<GroupSchema>("group", groupSchema);
export default GroupModel