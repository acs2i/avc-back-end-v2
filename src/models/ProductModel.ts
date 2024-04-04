import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    familly: {
      type: String,
      required: true,
    },
    subfamilly: {
      type: String,
    },
    brand: {
      type: String,
    },
    productCollection: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
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

const Product = mongoose.model("Product", ProductSchema);
export default Product;
