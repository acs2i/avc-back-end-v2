import mongoose from "mongoose";

const FamillySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subFamilly: [
      {
        type: String,
        default: ""
      },
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
  { timestamps: true }
);

const Familly = mongoose.model("Familly", FamillySchema);
export default Familly;
