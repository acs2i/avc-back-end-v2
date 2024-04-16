import mongoose from "mongoose";

const SubFamilySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    family: {
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

const SubFamily = mongoose.model("SubFamily", SubFamilySchema);
export default SubFamily;
