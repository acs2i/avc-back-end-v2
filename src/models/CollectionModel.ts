import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
  { timestamps: true }
);

const Collection = mongoose.model("Collection", CollectionSchema);
export default Collection;
