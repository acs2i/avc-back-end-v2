import mongoose from "mongoose";

const SubFamillySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    familly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
      timestamp: true,
    },
    creator: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {timestamps: true, collection: "subfamily"}
);

const SubFamilly = mongoose.model("SubFamily", SubFamillySchema);
export default SubFamilly;
