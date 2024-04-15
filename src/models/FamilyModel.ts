import mongoose from "mongoose";

const FamillySchema = new mongoose.Schema(
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

const Familly = mongoose.model("Family", FamillySchema);
export default Familly;
