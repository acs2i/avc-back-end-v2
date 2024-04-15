import mongoose from "mongoose";

const FamillySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subFamilly: [
      { type: mongoose.Types.ObjectId, default: [], ref: "SubFamilly" },
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

const Familly = mongoose.model("Familly", FamillySchema);
export default Familly;
