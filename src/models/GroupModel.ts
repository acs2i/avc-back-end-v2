import mongoose from "mongoose"

const GroupeSchema = new mongoose.Schema({
  k: {
    type: String,
    required: true,
  },
  v: {
    type: String,
    required: true,
  },
  users: {
    type: String,
  },

}, {timestamps: true, collection: "group"}


);

const Group = mongoose.model("Group", GroupeSchema);
export default Group;
