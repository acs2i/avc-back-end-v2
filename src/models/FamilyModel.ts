import mongoose from "mongoose";

const FamilySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subFamily: [
      { type: mongoose.Types.ObjectId, default: [], ref: "SubFamily" },
    ],
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
  { timestamps: true, collection: "family" }
);

const Family = mongoose.model("Family", FamilySchema);
export default Family;
